const express = require("express");
const router = express.Router();
const db = require("../db");
const mw = require("../middleware");
const campaigndata = require("../campaigndata.json");

router.get("/profile", mw.userSignedIn, (req, res) => {
    res.render("profile", {
        title: "Profile",
        data: campaigndata,
    });
});

router.post("/profile", (req, res) => {
    const regex = /^https/;
    let userUrl = req.body.url.match(regex) ? req.body.url : "";
    let userAge = req.body.age !== "" ? req.body.age : null;
    db.insertProfile(req.session.userId, userAge, req.body.city, userUrl)
        .then((entry) => {
            res.redirect("/petition");
        })
        .catch((err) => console.log(err));
});

router.get("/petition", mw.userSignedIn, mw.noSignature, (req, res) => {
    db.getUserNameById(req.session.userId).then((entry) => {
        res.render("petition", {
            name: entry.rows[0]["first_name"],
            title: "Sign the petition",
            script: "/static/canvas.js",
            data: campaigndata,
        });
    });
});

router.post("/petition", (req, res) => {
    if (!!req.body.signature) {
        db.insertSignature(req.body.signature, req.session.userId)
            .then((entry) => {
                req.session.signatureId = entry.rows[0].id;
                res.redirect("/thanks");
            })
            .catch((err) => {
                console.log(err.message);
                res.statusCode(400);
            });
    } else {
    }
});

router.get("/edit", mw.userSignedIn, (req, res) => {
    db.getUserInfo(req.session.userId).then((entry) => {
        entry = entry.rows[0];
        res.render("edit", {
            title: "Edit your profile",
            data: campaigndata,
            entry: entry,
        });
    });
});

router.post("/edit", (req, res) => {
    const pwRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}$/gm;
    const messageArr = [];
    const userData = {};

    const errorMessage = {
        firstname: "Entering your First Name is obligatory",
        lastname: "Entering your Last Name is obligatory",
        email: "E-Mail is required",
        url: "Please enter a valid url",
        password: "Please choose a valid password",
    };

    const bodyObj = {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
    };

    db.getUserByEmail(req.body.email)
        .then((entry) => {
            if (entry.rows[0]["user_id"] === req.session.userId) {
                bodyObj.email = req.body.email;
            } else {
                messageArr.push(
                    "E-Mail address cannot be assigned to this user"
                );
            }
        })
        .catch((noEntry) => {
            bodyObj.email = req.body.email;
        })
        .finally((emailUpdated) => {
            if (req.body.password) {
                if (!req.body.password.match(pwRegex)) {
                    messageArr.push(errorMessage.password);
                } else {
                    bodyObj.password = !!req.body.password;
                }
            }

            if (req.body.age) {
                bodyObj.age = req.body.age;
            }

            if (req.body.city) {
                bodyObj.city = req.body.city;
            }

            if (req.body.url) {
                if (req.body.url.match(/^https/)) {
                    bodyObj.url = req.body.url;
                }
            }

            Object.keys(bodyObj).forEach((key) => {
                if (!bodyObj[key]) {
                    messageArr.push(errorMessage[key]);
                } else if (key !== "password") {
                    userData[key] = bodyObj[key];
                }
            });

            if (messageArr.length !== 0) {
                res.render("edit", {
                    title: "Edit your profile",
                    data: campaigndata,
                    messages: messageArr,
                    entry: userData,
                });
            } else {
                Promise.all([
                    db.updateUserData(
                        req.session.userId,
                        bodyObj.firstname,
                        bodyObj.lastname,
                        bodyObj.email,
                        req.body.password
                    ),
                    db.updateUserProfile(
                        req.session.userId,
                        bodyObj.age,
                        bodyObj.city,
                        bodyObj.url
                    ),
                ]).then((updated) => {
                    res.redirect("/petition");
                });
            }
        });
});

router.get("/logout", (req, res) => {
    req.session = null;
    res.redirect("/register");
});

router.get("/delete-profile", mw.userSignedIn, (req, res) => {
    db.getUserNameById(req.session.userId).then((entry) => {
        res.render("delete_profile", {
            title: "Delete your profile",
            data: campaigndata,
            name: entry.rows[0]["first_name"],
        });
    });
});

router.post("/delete-profile", (req, res) => {
    if (req.body.delete) {
        db.deleteAllUserData(req.session.userId).then((deleted) => {
            req.session = null;
            res.redirect("/register");
        });
    } else {
        db.getUserNameById(req.session.userId).then((entry) => {
            res.render("delete_profile", {
                title: "Delete your profile",
                data: campaigndata,
                name: entry.rows[0]["first_name"],
                messages: ["Please confirm your choice or cancel"],
            });
        });
    }
});

module.exports = router;
