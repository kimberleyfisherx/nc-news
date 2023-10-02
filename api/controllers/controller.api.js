const { getTopics } = require("../models/models.api"); //imports gettopics which selects topics

exports.fetchTopics = (req, res, next) => {
  //exports fetchtopics function , funtion takes 2 params request and response
  getTopics()
    .then((result) => {
      //retrieves topics //.then is promise handler
      res.status(200).send({ topics: result }); //when promise returned by gettopics, response is to  send object of topics to the client
    })
    .catch((error) => {
      console.log(error);
      next(error);
    });
};

