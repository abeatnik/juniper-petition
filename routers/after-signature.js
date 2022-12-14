const express = require("express");
const router = express.Router();
const db = require("../db");
const mw = require("../middleware");
const campaigndata = require("../campaigndata.json");

router.get("/thanks", mw.petitionSigned, (req, res) => {
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

router.post("/thanks", (req, res) => {
    db.deleteSignature(req.session.signatureId).then((deleted) => {
        req.session.signatureId = null;
        res.redirect("/petition");
    });
});

router.get("/signatures", mw.petitionSigned, (req, res) => {
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

router.get("/signatures/:city", mw.petitionSigned, (req, res) => {
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

module.exports = router;
