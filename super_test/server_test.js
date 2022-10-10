const supertest = require("supertest");
const app = require("../server");

describe("petition app", () => {
    it("renders the home page", () => {
        return supertest(app)
            .get("/")
            .then((res) => {
                expect(res.statusCode).toBe(200);
            });
    });
});
