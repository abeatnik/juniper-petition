const { decodeBase64 } = require("bcryptjs");
const supertest = require("supertest");
const app = require("../server");
const db = require("../db.js");
const { mockSessionOnce } = require("../__mocks__/cookie-session");
const { resolveMotionValue } = require("framer-motion");

describe("logged out/new User", () => {
    it("redirects from /petition go to /register", () => {
        mockSessionOnce({
            userId: null,
        });
        return supertest(app)
            .get("/petition")
            .then((res) => {
                expect(res.statusCode).toBe(302);
                expect("/register");
            });
    }); // (9 ms)
});

describe("logged-in Users", () => {
    it("redirects from /login go to /petition", () => {
        mockSessionOnce({
            userId: 1,
        });
        return supertest(app)
            .get("/login")
            .then((res) => {
                expect(res.statusCode).toBe(302);
                expect("/petition");
            });
    });
    it("redirects from /register go to /petition", () => {
        mockSessionOnce({
            userId: 1,
        });
        return supertest(app)
            .get("/register")
            .then((res) => {
                expect(res.statusCode).toBe(302);
                expect("/petition");
            });
    });
});

describe("Users that signed the petition", () => {
    it("redirects from /petition go to /thanks (auth)", () => {
        mockSessionOnce({
            userId: 1,
            signatureId: 2,
        });
        return supertest(app)
            .get("/petition")
            .then((res) => {
                expect(res.statusCode).toBe(302);
                expect("/thanks");
            });
    });
});

describe("logged-in Users that have not signed", () => {
    it("redirects from /signatures go to /petition", () => {
        mockSessionOnce({
            userId: 1,
            signatureId: null,
        });
        return supertest(app)
            .get("/signatures")
            .then((res) => {
                expect(res.statusCode).toBe(302);
                expect("/petition");
            });
    });
    it("redirects from /thanks go to /petition", () => {
        mockSessionOnce({
            userId: 1,
            signatureId: null,
        });
        return supertest(app)
            .get("/thanks")
            .then((res) => {
                expect(res.statusCode).toBe(302);
                expect("/petition");
            });
    });
});

describe("post signature", () => {
    it("redirects from /petition go to /thanks (sign)", () => {
        db.insertSignature = jest.fn().mockResolvedValue({
            rows: [
                {
                    id: 2,
                },
            ],
        });
        mockSessionOnce({
            userId: 1,
        });
        return supertest(app)
            .post("/petition")
            .send('signature="userHasSigned"')
            .then((res) => {
                expect(res.statusCode).toBe(302);
                expect("/thanks");
            }); //(21 ms)
    });
    it("logs error when inserting signature", () => {
        mockSessionOnce({
            userId: 1,
        });
        db.insertSignature = jest
            .fn()
            .mockRejectedValue({ message: "error inserting signature" });
        return supertest(app)
            .post("/petition")
            .send('signature="userHasSigned"')
            .catch((err) => {
                expect(err.message).toBe("error inserting signature");
            });
    });
});
