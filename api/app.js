const express = require("express");
const {
  fetchTopics,
  fetchApi,
  fetchArticleId,
  fetchArticles,
  fetchCommentsById,
  sendComment,
  updateVotes,
  deleteCommentById,
  fetchUsers,
  getArticles,
} = require("./controllers/controller.api");

const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/topics", fetchTopics);
app.get("/api/", fetchApi);
app.get("/api/articles", getArticles);
app.get("/api/articles/:article_id", fetchArticleId);

app.get("/api/articles/:article_id/comments", fetchCommentsById);

app.get("/api/users", fetchUsers);

app.post("/api/articles/:article_id/comments", sendComment);

app.patch("/api/articles/:article_id", updateVotes);

app.delete("/api/comments/:comment_id", deleteCommentById);

app.all("/*", (req, res) => {
  res.status(404).send({ msg: "Request not found" });
});
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
