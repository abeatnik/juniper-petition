const db = require("./db");
const express = require("express");
const helmet = require("helmet");
const path = require("path");
const app = express();
const { engine } = require("express-handlebars");
const cookieSession = require("cookie-session");
const mw = require("./middleware");
const authRouter = require("./routers/auth");
const profileRouter = require("./routers/profile");
const afterSignatureRouter = require("./routers/after-signature");
const campaigndata = require("./campaigndata.json");

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

app.use(authRouter);
app.use(profileRouter);
app.use(afterSignatureRouter);

app.get("/favicon.ico", (req, res) => res.end());

module.exports = app;

if (require.main == module) {
    app.listen(process.env.PORT || PORT, () =>
        console.log(`Petition server running on port: ${PORT}`)
    );
}
//if file runs as main file and is not required it starts the server
