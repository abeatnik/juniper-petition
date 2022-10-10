const express = require("express");
const router = express.Router();
const campaigndata = require("../campaigndata.json");

router.get("/", (req, res) => {
    !!req.session.signatureId
        ? res.redirect("/thanks")
        : !!req.session.userId
        ? res.redirect("/petition")
        : res.redirect("/register");
});

router.get("/register", (req, res) => {
    !!req.session.signatureId
        ? res.redirect("/thanks")
        : !!req.session.userId && res.redirect("/petition");
    res.render("register", {
        title: "Register",
        data: campaigndata,
        animate: true,
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

router.get("/login", (req, res) => {
    !!req.session.signatureId && res.redirect("/thanks");
    res.render("login", {
        title: "Login",
        data: campaigndata,
    });
});

router.post("/login", (req, res) => {
    const messageArr = [];
    let email;
    const errorMessage = {
        email: "E-Mail is required",
        password: "Incorrect password",
    };

    const bodyObj = {
        email: req.body.email,
        password: !!req.body.password,
    };

    Object.keys(bodyObj).forEach((key) => {
        if (!bodyObj[key]) {
            messageArr.push(errorMessage[key]);
        } else if (key === "email") {
            email = bodyObj["email"];
        }
    });

    if (!req.body.email || !req.body.password) {
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
                    }
                });
            })
            .catch((err) => {
                res.render("login", {
                    title: "Login",
                    data: campaigndata,
                    messages: ["Wrong E-mail or password"],
                });
            });
    }
});

module.exports = router;
