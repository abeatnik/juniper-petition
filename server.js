const db = require("./db");
const express = require("express");
const helmet = require("helmet");
const path = require("path");
const app = express();
const { engine } = require("express-handlebars");
const cookieSession = require("cookie-session");

const campaigndata = {
    imagelink:
        "https://dictionary.cambridge.org/de/images/full/tree_noun_001_18152.jpg",
    imagedescription: "tree",
    campaigntext: "Save Berlin's Trees!",
    description: "Help prevent the dying of trees.",
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
        script: "/static/empty.js",
        data: campaigndata,
    });
});

app.post("/register", (req, res) => {
    const messageArr = [];
    const userData = {};
    const errorMessage = {
        firstname: "Entering your First Name is obligatory.",
        lastname: "Entering your Last Name is obligatory.",
        email: "E-Mail is required",
        password: "Please choose a valid password.",
    };

    const bodyObj = {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        password: !!req.body.password,
    };

    bodyObj.keys.forEach((key) => {
        if (!bodyObj[key]) {
            messageArr.push(errorMessage[key]);
        } else if (key !== password) {
            userData.key = bodyObj[key];
        }
    });

    if (messageArr.length !== 0) {
        res.render("register", {
            title: "Register",
            script: "/static/empty.js",
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
        )
            .then((entry) => {
                req.session.userId = entry.rows[0].id;
                res.redirect("/petition");
            })
            .catch((err) => console.log(err));
    }
});

app.get("/login", (req, res) => {
    if (!!req.session.signatureId) {
        res.redirect("/thanks");
    }

    //show form
});

app.post("/login", (req, res) => {});

app.get("/petition", (req, res) => {
    !req.session.userId
        ? res.redirect("/register")
        : !!req.session.signatureId && res.redirect("/thanks");
    db.getUserNameById(req.session.userId).then((entry) => {
        res.render("petition", {
            name: entry.rows[0][first_name],
            title: "Sign the petition",
            script: "/static/canvas.js",
            data: campaigndata,
        });
    });
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
        db.findSignatureById(req.session.userId),
    ]).then((entryData) => {
        res.render("thanks", {
            title: "Save Berlin's Trees",
            data: {
                imagelink:
                    "https://dictionary.cambridge.org/de/images/full/tree_noun_001_18152.jpg",
                imagedescription: "tree",
                campaigntext: "Save Berlin's Trees!",
                description: "Help prevent the dying of trees.",
            },
            text: "Thank you for signing.",
            signers: entryData[0].rows[0].count,
            signatureImage: entryData[1].rows[0].signature,
        });
    });
});

app.get("/signatures", (req, res) => {
    !req.session.signatureId && res.redirect("/petition");
});

app.get("/logout", (req, res) => {});

app.get("/favicon.ico", (req, res) => res.end());

app.listen(PORT, () => console.log(`Petition server running on port: ${PORT}`));
