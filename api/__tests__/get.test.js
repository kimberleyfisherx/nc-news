const db = require("../../db/connection"); //imports db again from connection
const seed = require("../../db/seeds/seed"); //imports seeding
const request = require("supertest"); //imports supertest (a library which allows http express requests)
const data = require("../../db/data/test-data/index"); //imports test data
const app = require("../app.js"); //imports app has all the application and routes i

beforeEach(() => seed(data)); // sets up function to define what happens before each test, here we populate the database with data before testing
afterAll(() => db.end()); //used to close connection after each test

test("should return an array of objects containing slug and description properties", () => {
  return request(app)
    .get("/api/topics")
    .expect(200)
    .then((res) => {
      expect(res.body.topics.length).toBe(3);
      res.body.topics.forEach((topic) => {
        expect(topic).toHaveProperty("slug", expect.any(String));
        expect(topic).toHaveProperty("description", expect.any(String));
      });
    });
});
describe("GET /api/invalidendpoint", () => {
  test("should return a 404 status and the error message", () => {
    return request(app)
      .get("/api/topics/invalidendpoint")
      .expect(404)
      .then((res) => {
        expect(res.body.msg).toEqual("Request not found");
      });
  });
});