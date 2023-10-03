const {
  getTopics,
  getApi,
  getArticleId,
  getArticlesInDateOrder,
} = require("../models/models.api"); //imports gettopics which selects topics

exports.fetchTopics = (req, res) => {
  //exports fetchtopics function , funtion takes 2 params request and response
  getTopics()
    .then((result) => {
      //retrieves topics //.then is promise handler
      res.status(200).send({ topics: result }); //when promise returned by gettopics, response is to  send object of topics to the client
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send({ error: "Error fetching topics" });
    });
};

//this is the shift manager delegating to models the staff member

exports.fetchApi = (req, res) => {
  getApi().then((result) => {
    res.status(200).send({ endPointData: result }); // then sends this infor back to the client as a JSON response.
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

exports.fetchArticles = (req, res) => {
  getArticlesInDateOrder().then((result) => {
    res.status(200).send({ articles: result });
  });
};
