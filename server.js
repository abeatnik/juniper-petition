const db = require("./db");
const express = require("express");
const helmet = require("helmet");
const path = require("path");
const app = express();
const { engine } = require("express-handlebars");
const cookieSession = require("cookie-session");
const { count } = require("console");
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
    if (!!req.session.userId) {
        res.redirect("/thanks");
    } else {
        res.redirect("/petition");
    }
});

app.get("/register", (req, res) => {
    // if error - rerender page with error message and user input
});

app.post("/register", (req, res) => {});

app.get("/login", (req, res) => {
    if (!!req.session.signatureId) {
        res.redirect("/thanks");
    }

    //show form
});

app.post("/login", (req, res) => {});

app.get("/petition", (req, res) => {
    if (!!req.session.userId) {
        res.redirect("/thanks");
    } else {
        res.render("form", {
            title: "Sign the petition",
            script: "/static/canvas.js",
            layout: "main",
            data: {
                imagelink:
                    "https://dictionary.cambridge.org/de/images/full/tree_noun_001_18152.jpg",
                imagedescription: "tree",
                campaigntext: "Save Berlin's Trees!",
                description: "Help prevent the dying of trees.",
            },
        });
    }
});

app.post("/petition", (req, res) => {
    if (req.body.firstname && req.body.lastname && req.body.signature) {
        db.createSignatureEntry(
            req.body.firstname.trim(),
            req.body.lastname.trim(),
            req.body.signature
        ).then((entry) => {
            req.session.userId = entry.rows[0].id;
            res.redirect("/thanks");
        });
    } else if (req.body.firstname && req.body.lastname) {
        db.createUser(req.body.firstname.trim(), req.body.lastname.trim()).then(
            (entry) => {
                req.session.userId = entry.rows[0].id;
            }
        );
    }
});

app.get("/thanks", (req, res) => {
    if (!req.session.userId) {
        res.redirect("/petition");
    } else {
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
    }
});

app.get("/signatures", (req, res) => {});

app.get("/logout", (req, res) => {});

app.get("/favicon.ico", (req, res) => res.end());

app.listen(PORT, () => console.log(`Petition server running on port: ${PORT}`));
