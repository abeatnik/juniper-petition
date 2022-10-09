const db = require("./db");
const express = require("express");
const helmet = require("helmet");
const path = require("path");
const app = express();
const { engine } = require("express-handlebars");
const cookieSession = require("cookie-session");

const campaigndata = {
    campaigntext: "Save Berlin's Trees",
    description:
        "Urban trees are dying. They are a key element of urban spaces and important for making Berlin a livable city. Their future will be crucial for Berlin and the city's inhabitants. With your help Berlin's trees could receive the care that they need.",
};

app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.use(express.urlencoded({ extended: false }));
app.use(
    cookieSession({
        secret: process.env.SESSION_SECRET,
        maxAge: 1000 * 60 * 60 * 24 * 14,
    })
);
app.use("/static", express.static(path.join(__dirname, "static")));
const PORT = 8080;

app.use(helmet());

app.get("/", (req, res) => {
    !!req.session.signatureId
        ? res.redirect("/thanks")
        : !!req.session.userId
        ? res.redirect("/petition")
        : res.redirect("/register");
});

app.get("/register", (req, res) => {
    !!req.session.signatureId
        ? res.redirect("/thanks")
        : !!req.session.userId && res.redirect("/petition");
    res.render("register", {
        title: "Register",
        data: campaigndata,
    });
});

app.post("/register", (req, res) => {
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

app.get("/login", (req, res) => {
    !!req.session.signatureId && res.redirect("/thanks");
    res.render("login", {
        title: "Login",
        data: campaigndata,
    });
});

app.post("/login", (req, res) => {
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

app.get("/profile", (req, res) => {
    res.render("profile", {
        title: "Profile",
        data: campaigndata,
    });
});

app.post("/profile", (req, res) => {
    const regex = /^https/;
    let userUrl = req.body.url.match(regex) ? req.body.url : "";
    let userAge = req.body.age !== "" ? req.body.age : null;
    db.insertProfile(req.session.userId, userAge, req.body.city, userUrl)
        .then((entry) => {
            res.redirect("/petition");
        })
        .catch((err) => console.log(err));
});

app.get("/petition", (req, res) => {
    if (!req.session.userId) {
        res.redirect("/register");
    } else if (!!req.session.signatureId) {
        res.redirect("/thanks");
    } else {
        db.getUserNameById(req.session.userId).then((entry) => {
            res.render("petition", {
                name: entry.rows[0]["first_name"],
                title: "Sign the petition",
                script: "/static/canvas.js",
                data: campaigndata,
            });
        });
    }
});

app.post("/petition", (req, res) => {
    if (!!req.body.signature) {
        db.insertSignature(req.body.signature, req.session.userId).then(
            (entry) => {
                req.session.signatureId = entry.rows[0].id;
                res.redirect("/thanks");
            }
        );
    } else {
    }
});

app.get("/thanks", (req, res) => {
    !req.session.userId
        ? res.redirect("/register")
        : !req.session.signatureId && res.redirect("/petition");
    Promise.all([
        db.countSignatures(),
        db.getSignatureById(req.session.userId),
        db.getUserNameById(req.session.userId),
    ]).then((entryData) => {
        res.render("thanks", {
            title: "Save Berlin's Trees",
            data: campaigndata,
            signers: entryData[0].rows[0].count,
            signatureImage: entryData[1].rows[0].signature,
            name: entryData[2].rows[0]["first_name"],
        });
    });
});

app.post("/thanks", (req, res) => {
    db.deleteSignature(req.session.signatureId).then((deleted) => {
        req.session.signatureId = null;
        res.redirect("/petition");
    });
});

app.get("/signatures", (req, res) => {
    !req.session.signatureId && res.redirect("/petition");

    Promise.all([db.countSignatures(), db.getAllSigners()]).then(
        (entryData) => {
            const count = entryData[0].rows[0].count;
            const signers = entryData[1].rows;
            res.render("signers", {
                title: "All signers of the petition",
                data: campaigndata,
                signers: signers,
                count: count,
                campaign: campaigndata.campaigntext,
            });
        }
    );
});

app.get("/signatures/:city", (req, res) => {
    !req.session.signatureId && res.redirect("/petition");
    Promise.all([
        db.countSignaturesInCity(req.params.city),
        db.getAllSignersByCity(req.params.city),
    ]).then((entryData) => {
        const count = entryData[0].rows[0].count;
        const signers = entryData[1].rows;
        res.render("signers", {
            title: "All signers of the petition",
            data: campaigndata,
            signers: signers,
            count: count,
            campaign: campaigndata.campaigntext,
            location: req.params.city,
        });
    });
});

app.get("/edit", (req, res) => {
    !req.session.userId && res.redirect("/login");
    db.getUserInfo(req.session.userId).then((entry) => {
        entry = entry.rows[0];
        res.render("edit", {
            title: "Edit your profile",
            data: campaigndata,
            entry: entry,
        });
    });
});

app.post("/edit", (req, res) => {
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

app.get("/logout", (req, res) => {
    req.session = null;
    res.redirect("/register");
});

app.get("/delete-profile", (req, res) => {
    !req.session.userId && res.redirect("/login");
    db.getUserNameById(req.session.userId).then((entry) => {
        res.render("delete_profile", {
            title: "Delete your profile",
            data: campaigndata,
            name: entry.rows[0]["first_name"],
        });
    });
});

app.post("/delete-profile", (req, res) => {
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

app.get("/favicon.ico", (req, res) => res.end());

app.listen(PORT, () => console.log(`Petition server running on port: ${PORT}`));
