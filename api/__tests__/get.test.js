const db = require("../../db/connection"); //imports db again from connection
const seed = require("../../db/seeds/seed"); //imports seeding
const request = require("supertest"); //imports supertest (a library which allows http express requests)
const data = require("../../db/data/test-data/index"); //imports test data
const app = require("../app"); //imports app has all the application and routes in
const toBeSorted = require("jest-sorted");
beforeEach(() => seed(data)); // sets up function to define what happens before each test, here we populate the database with data before testing
afterAll(() => db.end()); //used to close connection after each test

describe("GET /api/topics", () => {
  test("should return an array of objects containing slug and description properties", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then((res) => {
        expect(res.body.topics.length).toBe(3);
        res.body.topics.forEach((topic) => {
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
  describe("GET/api", () => {
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
  describe("GET/api/articles/:article_id", () => {
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

  test("returns a status 400 and invalid request message when an invalid article id is selected", () => {
    return request(app)
      .get("/api/articles/invalid")
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toEqual("invalid request");
      });
  });
  test("returns  a status 404 and article not found message when an article id is valid but article  does not exist", () => {
    return request(app)
      .get("/api/articles/999999")
      .expect(404)
      .then((res) => {
        expect(res.body.msg).toEqual("Article not found");
      });
  });

  test("returns articles sorted by date descending", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        const articles = body.articles;
        expect(articles).toBeSorted({
          key: "created_at",
          descending: true,
        });
      });
  });
  describe("GET /api/articles/:article_id/comments", () => {
    test(`returns status 200 and an array containing comment objects containing the following properties: comment_id, votes, created_at, author, body, article_id. Comments should be sorted by date in descending order.`, () => {
      return request(app)
        .get("/api/articles/1/comments")
        .expect(200)
        .then((response) => {
          const comments = response.body.comments;
          const expectedProperties = {
            comment_id: expect.any(Number),
            votes: expect.any(Number),
            created_at: expect.any(String),
            author: expect.any(String),
            body: expect.any(String),
            article_id: 1,
          };
          expect(comments.length).toBe(11);
          comments.forEach((comment) => {
            expect(comment).toMatchObject(expectedProperties);
          });
        });
    });
  });

  test("returns a status 400 and invalid request message when an invalid article id is selected", () => {
    return request(app)
      .get("/api/articles/invalid/comments")
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toEqual("invalid request");
      });
  });
  test("return status 200 article id is valid but has no comments ", () => {
    return request(app)
      .get("/api/articles/4/comments")
      .expect(200)
      .then((response) => {
        expect(response.body.comments).toEqual([]);
      });
  });
});
// test("check endpoints.json file has been updated ", () => {
//   return request(app)
//     .get("/api/")
//     .expect(200)
//     .then((response) => {
//       const endpointObject =
//         response.body.endPointData["GET /api/articles/:article_id/comments"];
//       expect(endpointObject).toMatchObject({
//         description: expect.any(String),
//         queries: expect.any(Array),
//         exampleResponse: expect.any(Array),
//       });
//     });
// });
test("return 404 status code if article_id is valid but there is no article", () => {
  return request(app)
    .get("/api/articles/9999/comments")
    .expect(404)
    .then((response) => {
      expect(response.body.msg).toEqual("no article found");
    });
});
test("comments sorted by most recent first", () => {
  return request(app)
    .get("/api/articles/1/comments")
    .expect(200)
    .then(({ body }) => {
      const comments = body.comments;
      expect(comments).toBeSorted({
        key: "created_at",
        descending: true,
      });
    });
});
