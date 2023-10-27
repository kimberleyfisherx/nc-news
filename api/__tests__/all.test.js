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

describe("GET /api/users", () => {
  test(" Responds with an array of user objects containing the following keys: username, name and avatar_url", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then((response) => {
        expect(response.body.users.length).toBe(4);
        expect(response.body.users[0]).toMatchObject({
          username: expect.any(String),
          name: expect.any(String),
          avatar_url: expect.any(String),
        });
      });
  });
  test(" Responds with correct error message when the user puts an invalid end point", () => {
    return request(app)
      .get("/api/users/invalid")
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toEqual("Request not found");
      });
  });
});
describe("GET /api/articles with topic query", () => {
  test("should return an array of articles filtered by topic", () => {
    return request(app)
      .get("/api/articles?topic=cats")
      .then((response) => {
        expect(response.status).toBe(200);

        const articles = response.body.articles;

        expect(articles.length).toBe(1);

        articles.forEach((article) => {
          const expectedShape = {
            author: expect.any(String),
            title: expect.any(String),
            article_id: expect.any(Number),
            topic: "cats",
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
            comment_count: expect.any(String),
          };

          expect(article).toMatchObject(expectedShape);
        });
      });
  });
  test("should return an empty array for a valid topic with no articles", () => {
    return request(app)
      .get("/api/articles?topic=paper")
      .then((response) => {
        expect(response.status).toBe(200);

        const articles = response.body.articles;

        expect(articles).toHaveLength(0);
      });
  });
  test("should return an error message for invalid topic", () => {
    return request(app)
      .get("/api/articles?topic=invalid")
      .then((response) => {
        expect(response.status).toBe(200);
      });
  });
});
describe("GET /api/articles/:article_id (comment_count)", () => {
  test("should return an article with comment_count", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then((response) => {
        const article = response.body.article;

        expect(article).toHaveProperty("comment_count");
        expect(article.comment_count).toBe("11");
      });
  });
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
});
describe("get /api/articles (sorting queries)", () => {
  test(" responds with an array sorted articles by author", () => {
    return request(app)
      .get("/api/articles?sort_by=author")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toBeSortedBy("author");
      });
  });
  test("responds with an array of ascending articles by author", () => {
    return request(app)
      .get("/api/articles?sort_by=author&order=asc")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toBeSorted("author");
      });
  });
  test("200: responds with an array of descending articles by author", () => {
    return request(app)
      .get("/api/articles?sort_by=author&order=desc")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toBeSorted("author", { descending: true });
      });
  });
  test("400: invalid sort_by query", () => {
    return request(app)
      .get("/api/articles?sort_by=cheese")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Invalid sort_by query");
      });
  });

  test("400: invalid order query", () => {
    return request(app)
      .get("/api/articles?order=PRICE")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Invalid order query");
      });
  });
});
// POST TESTS

describe("POST /api/articles/:article_id/comments", () => {
  test(" to POST an object containing a username and body and return with a posted comment", () => {
    return request(app)
      .post("/api/articles/4/comments")
      .send({ username: "lurker", body: "weird article" })
      .expect(201)
      .then((response) => {
        const commentObject = response.body.comment;
        const expectedCommentObject = {
          author: "lurker",
          body: "weird article",
        };

        expect(commentObject).toMatchObject(expectedCommentObject);
      });
  });
  test("Extra properties in post object are ignored", () => {
    return request(app)
      .post("/api/articles/4/comments")
      .send({
        username: "lurker",
        body: "weird article",
        extraProp: "extraValue",
      })
      .expect(201)
      .then((response) => {
        const commentObject = response.body.comment;
        const expectedCommentObject = {
          author: "lurker",
          body: "weird article",
        };

        expect(commentObject).toMatchObject(expectedCommentObject);
        expect(commentObject).not.toHaveProperty("extraProp");
      });
  });
  test("if client tries to comment an empty message Responds with please enter a comment ", () => {
    return request(app)
      .post("/api/articles/4/comments")
      .send({})
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toEqual("Please enter a comment");
      });
  });
  test("if provided article ID does not exist, responds with 404 and error message", () => {
    return request(app)
      .post("/api/articles/9999/comments")
      .send({ username: "lurker", body: "weird article" })
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toEqual("Article not found");
      });
  });
  test("if comment only contains white space returns correct error message", () => {
    return request(app)
      .post("/api/articles/4/comments")
      .send({ username: "lurker", body: " " }) //comment is just a space
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toEqual("Please enter a comment");
      });
  });
  test("if client does not provide username, responds with 404 and error message", () => {
    return request(app)
      .post("/api/articles/4/comments")
      .send({ body: "i'm trying to comment without a username" }) // Missing username just body
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toEqual("Username not found");
      });
  });

  test("if username not found in the database return correct error", () => {
    return request(app)
      .post("/api/articles/4/comments")
      .send({ username: "unknownUser", body: "good article" })
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toEqual("Username not found");
      });
  });
});

//PATCH TESTS
describe("PATCH /api/articles/:article_id", () => {
  test("should return the updated article with all properties and increment vote", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: 100 })
      .expect(200)
      .then((response) => {
        const updatedArticle = response.body.article;

        const expectedArticle = {
          article_id: expect.any(Number),
          title: expect.any(String),
          topic: expect.any(String),
          author: expect.any(String),
          body: expect.any(String),
          created_at: expect.any(String),
          votes: 200,
          article_img_url: expect.any(String),
        };

        expect(updatedArticle).toEqual(
          expect.objectContaining(expectedArticle)
        );
      });
  });
  test("should decrease the votes of an article", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: -5 })
      .expect(200)
      .then((response) => {
        const updatedArticle = response.body.article;
        expect(updatedArticle.votes).toBe(95);
      });
  });

  test(" Responds with correct error message when an article id is valid but doesnt exist when patching votes", () => {
    return request(app)
      .patch("/api/articles/9999")
      .send({ inc_votes: 10 })
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toEqual("Article not found");
      });
  });
  test(" Responds with correct error message if the artcle id is invalid", () => {
    return request(app)
      .patch("/api/articles/invalid")
      .send({ inc_votes: 10 })
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toEqual("invalid request");
      });
  });
  test("Responds with correct error message when votes is not a number", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: "ten votes" })
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toEqual("invalid request");
      });
  });
  test("Responds with correct error message when votes is empty", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({})
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toEqual("please enter your vote");
      });
  });
});

//  DELETE TESTS

describe("DElETE /api/comments/:comment_id", () => {
  test("to delete a specific comment using the comment_id", () => {
    return request(app).delete("/api/comments/1").expect(204);
  });
});
test('should return "request not found" when trying to access a deleted comment', () => {
  return request(app)
    .get("/api/comments/1")
    .expect(404)
    .then((response) => {
      expect(response.body.msg).toBe("Request not found");
    });
});
test("when comment_id is valid but comment does not exist return correct error", () => {
  return request(app)
    .delete("/api/comments/9999")
    .expect(404)
    .then((response) => {
      expect(response.body.msg).toEqual("Comment not found");
    });
});
test("when comment_id is invalid return correct error", () => {
  return request(app)
    .delete("/api/comments/invalid")
    .expect(400)
    .then((response) => {
      expect(response.body.msg).toEqual("invalid request");
    });
});
