const {
  getTopics,
  getApi,
  getArticleId,
  getArticlesInDateOrder,
  getCommentsById,
  postComment,
  patchVotes,
  deleteComment,
  getUsers,
  selectAllArticles,
  fetchTopics,
} = require("../models/models.api");

exports.fetchTopics = (req, res) => {
  getTopics()
    .then((result) => {
      res.status(200).send({ topics: result });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send({ error: "Error fetching topics" });
    });
};

exports.fetchApi = (req, res) => {
  getApi().then((result) => {
    res.status(200).send({ endPointData: result });
  });
};

exports.fetchArticleId = (req, res, next) => {
  const articleId = req.params;
  getArticleId(articleId)
    .then((result) => {
      res.status(200).send({ article: result });
    })
    .catch(next);
};

exports.fetchArticles = (req, res, next) => {
  getArticlesInDateOrder()
    .then((result) => {
      res.status(200).send({ articles: result });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send({ error: "Error fetching articles" });
    });
};

exports.fetchCommentsById = (req, res, next) => {
  const articleIdQuery = req.params;
  getCommentsById(articleIdQuery)
    .then((result) => {
      res.status(200).send({ comments: result });
    })
    .catch(next);
};

exports.sendComment = (req, res, next) => {
  const articleId = req.params;
  const comment = req.body;
  postComment(articleId, comment)
    .then((result) => {
      res.status(201).send({ comment: result });
    })
    .catch(next);
};

exports.updateVotes = (req, res, next) => {
  const articleId = req.params;
  const votesObj = req.body;
  patchVotes(articleId, votesObj)
    .then((result) => {
      res.status(200).send({ article: result });
    })
    .catch(next);
};

exports.deleteCommentById = (req, res, next) => {
  const commentId = req.params;
  deleteComment(commentId)
    .then(() => {
      res.status(204).send();
    })
    .catch(next);
};

exports.fetchUsers = (req, res, next) => {
  getUsers()
    .then((result) => {
      res.status(200).send({ users: result });
    })
    .catch(next);
};

exports.getArticles = (req, res, next) => {
  const { sort_by, topic, order } = req.query;

  selectAllArticles(topic, sort_by, order)
    .then((articles) => {
      res.status(200).send({ articles });
    })
    .catch(next);
};
