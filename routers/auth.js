const express = require("express");
const router = express.Router();
const db = require("../db");
const mw = require("../middleware");
const campaigndata = require("../campaigndata.json");

router.get("/", mw.newUser, (req, res) => {
    res.redirect("/register");
});

router.get("/register", mw.newUser, (req, res) => {
    res.render("register", {
        title: "Register",
        data: campaigndata,
        animate: true,
        autoplay: "autoplay",
    });
});

router.post("/register", (req, res) => {
    const pwRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}$/gm;
    const messageArr = [];
    const userData = {};
    const errorMessage = {
        firstname: "Entering your First Name is obligatory",
        lastname: "Entering your Last Name is obligatory",
        email: "E-Mail is required",
        password: "Please choose a valid password",
    };

    const bodyObj = {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        password: req.body.password.match(pwRegex),
    };

    const emailValidator = /[\w]@[\w]/;
    if (!bodyObj.email.match(emailValidator)) {
        bodyObj.email = false;
        errorMessage.email = "Please enter a valid E-Mail address";
    }

    Object.keys(bodyObj).forEach((key) => {
        if (!bodyObj[key]) {
            messageArr.push(errorMessage[key]);
        } else if (key !== "password") {
            userData[key] = bodyObj[key];
        }
    });

    if (messageArr.length !== 0) {
        res.render("register", {
            title: "Register",
            data: campaigndata,
            messages: messageArr,
            userData: userData,
        });
    } else {
        db.insertUser(
            req.body.firstname.trim(),
            req.body.lastname.trim(),
            req.body.email.trim(),
            req.body.password
        ).then((entry) => {
            req.session.userId = entry.rows[0].id;
            res.redirect("/profile");
        });
    }
});

router.get("/login", mw.newUser, (req, res) => {
    res.render("login", {
        title: "Login",
        data: campaigndata,
    });
});

router.post("/login", (req, res) => {
    const messageArr = [];
    let email;
    const errorMessage = {
        email: "Please enter your E-Mail",
        password: "Please enter your password",
    };

    const bodyObj = {
        email: !!req.body.email,
        password: !!req.body.password,
    };

    const emailValidator = /[\w]@[\w]/;
    if (req.body.email.match(emailValidator)) {
        email = req.body.email;
    } else {
        bodyObj.email = false;
    }

    Object.keys(bodyObj).forEach((key) => {
        if (!bodyObj[key]) {
            messageArr.push(errorMessage[key]);
        }
    });

    if (!bodyObj.email || !bodyObj.password) {
        res.render("login", {
            title: "Login",
            data: campaigndata,
            messages: messageArr,
            email: email,
        });
    } else {
        db.getUserByEmail(req.body.email)
            .then((entry) => {
                db.authenticateUser(
                    entry.rows[0].password,
                    req.body.password
                ).then((authenticated) => {
                    if (authenticated) {
                        req.session.userId = entry.rows[0]["user_id"];
                        if (entry.rows[0]["signature_id"]) {
                            req.session.signatureId =
                                entry.rows[0]["signature_id"];
                            res.redirect("/thanks");
                        } else {
                            res.redirect("/petition");
                        }
                    } else {
                        res.render("login", {
                            title: "Login",
                            data: campaigndata,
                            messages: ["Wrong E-mail or password"],
                        });
                    }
                });
            })
            .catch((err) =>
                res.render("login", {
                    title: "Login",
                    data: campaigndata,
                    messages: ["Wrong E-mail or password"],
                })
            );
    }
});

module.exports = router;
