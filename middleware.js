module.exports.userSignedIn = (req, res, next) => {
    if (!req.session.userId) {
        return res.redirect("/register");
    }
    next();
};

module.exports.petitionSigned = (req, res, next) => {
    if (!req.session.signatureId) {
        return res.redirect("/petition");
    }
    next();
};

module.exports.noSignature = (req, res, next) => {
    if (req.session.signatureId) {
        return res.redirect("/thanks");
    }
    next();
};

module.exports.newUser = (req, res, next) => {
    if (req.session.userId || req.session.signatureId) {
        return res.redirect("/petition");
    }
    next();
};
