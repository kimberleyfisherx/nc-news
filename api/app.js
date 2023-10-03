const express = require("express");
const {
  fetchTopics,
  fetchApi,
  fetchArticleId,
  fetchArticles,
  fetchCommentsById,
  sendComment,
} = require("./controllers/controller.api"); //imports fetch function from controllers

const app = express(); // initialise express (object to handle middleware and http)
app.use(express.json()); // app.use handles specific requests - here we are parse that data and making it available in the req.body to use later

app.get("/api/topics", fetchTopics); // defines a GET route, When a GET request made ,call the fetchTopics function made in controller file

app.get("/api/", fetchApi);

app.get("/api/articles/:article_id", fetchArticleId);

app.get("/api/articles", fetchArticles);

app.get("/api/articles/:article_id/comments", fetchCommentsById);

app.post("/api/articles/:article_id/comments", sendComment);

app.all("/*", (req, res) => {
  res.status(404).send({ msg: "Request not found" });
}); // error handling, if request is made that doesnt have a path, returns 404 code and msg

app.use((err, req, res, next) => {
  if (err.status) {
    res.status(err.status).send({ msg: err.msg });
  } else if (err.code === "22P02") {
    res.status(400).send({ msg: "invalid request" });
  } else {
    console.log(err);
    res.status(500).send({ msg: "internal server error" });
  }
});
module.exports = app;
