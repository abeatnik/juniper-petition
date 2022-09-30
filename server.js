const db = require("./db");
const express = require("express");
const { urlencoded } = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const { engine } = require("express-handlebars");
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
const PORT = 8080;

app.get("/", (req, res) => {});

app.get("/sign", (req, res) => {});

app.post("/sign", (req, res) => {});

app.get("/thanks", (req, res) => {});

app.get("/signatures", (req, res) => {});

app.get("/favicon.ico", (req, res) => res.end());

app.listen(PORT, () => console.log(`Petition server running on port: ${PORT}`));
