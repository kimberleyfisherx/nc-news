const {
  getTopics,
  getApi,
  getArticleId,
  getArticlesInDateOrder,
  getCommentsById,
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
  const articleIdQuery = req.params;
  getArticleId(articleIdQuery)
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
