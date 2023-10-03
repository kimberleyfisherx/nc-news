const db = require("../../db/connection"); //imports db again from connection
const seed = require("../../db/seeds/seed"); //imports seeding
const request = require("supertest"); //imports supertest (a library which allows http express requests)
const data = require("../../db/data/test-data/index"); //imports test data
const app = require("../app"); //imports app has all the application and routes in

beforeEach(() => seed(data)); // sets up function to define what happens before each test, here we populate the database with data before testing
afterAll(() => db.end()); //used to close connection after each test

describe("GET /api/topics", () => {
  test("should return an array of objects containing slug and description properties", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then((res) => {
        expect(res.body.topics.length).toBe(3); // checks topics should return array of 3
        res.body.topics.forEach((topic) => {
          // loop  through each topic in the res checks properties named slug and description
          expect(topic).toHaveProperty("slug");
          expect(topic).toHaveProperty("description");
          expect(topic).toHaveProperty("slug", expect.any(String));
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
  describe("/api", () => {
    test("should return JSON object with endpoint details including description, queries, and example response for each endpoint", () => {
      return request(app)
        .get("/api/")
        .expect(200)
        .then((res) => {
          const topicsEndPointObject = res.body.endPointData["GET /api/topics"];

          expect(typeof topicsEndPointObject).toEqual("object");
          expect(topicsEndPointObject).toHaveProperty(
            "description",
            expect.any(String)
          );
          expect(topicsEndPointObject).toHaveProperty(
            "queries",
            expect.any(Array)
          );
          expect(topicsEndPointObject).toHaveProperty(
            "exampleResponse",
            expect.any(Object)
          );
        });
    });
  });
  describe("/api/articles/:article_id", () => {
    test("returns an article object with expected properties", () => {
      return request(app)
        .get("/api/articles/4")
        .expect(200)
        .then((response) => {
          const article = response.body.article;
          expect(article).toMatchObject({
            author: expect.any(String),
            title: expect.any(String),
            article_id: expect.any(Number),
            body: expect.any(String),
            topic: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
          });
          expect(article.article_id).toBe(4);
        });
    });
  });

  test("to GET a status 400 and correct error message when an invalid article id is selected", () => {
    return request(app)
      .get("/api/articles/invalid")
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toEqual("invalid request");
      });
  });
  test("to GET a status 404 and correct error message when an  article id is valid but does not exist", () => {
    return request(app)
      .get("/api/articles/999999")
      .expect(404)
      .then((res) => {
        expect(res.body.msg).toEqual("Article not found");
      });
  });
});
