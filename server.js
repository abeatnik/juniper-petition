const db = require("./db");
const express = require("express");
const path = require("path");
const { urlencoded } = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const { engine } = require("express-handlebars");
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use("/static", express.static(path.join(__dirname, "static")));
const PORT = 8080;

app.get("/", (req, res) => {
    if (req.cookies.signed) {
        res.redirect("/thanks");
    } else {
        res.redirect("/sign");
    }
});

app.get("/sign", (req, res) => {
    if (req.cookies.signed) {
        res.redirect("/thanks");
    } else {
        res.render("form", {
            title: "Sign the petition",
            script: "/static/canvas.js",
            layout: "main",
            data: {
                imagelink:
                    "https://dictionary.cambridge.org/de/images/full/tree_noun_001_18152.jpg?version=5.0.252",
                imagedescription: "tree",
                campaigntext: "Save Berlin's Trees!",
                description: "Help prevent the dying of trees.",
            },
        });
    }
});

app.post("/sign", (req, res) => {
    if (req.body.firstname && req.body.lastname && req.body.signature) {
        res.cookie("signed", true);
    }
    db.createSignatureEntry(
        req.body.firstname,
        req.body.lastname,
        req.body.signature
    );
});

app.get("/thanks", (req, res) => {
    if (!req.cookies.signed) {
        res.redirect("/sign");
    } else {
        res.render("thanks", {
            title: "Save Berlin's Trees",
        });
    }
});

app.get("/signatures", (req, res) => {});

app.get("/favicon.ico", (req, res) => res.end());

app.listen(PORT, () => console.log(`Petition server running on port: ${PORT}`));
