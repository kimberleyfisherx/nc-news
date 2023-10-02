const express = require("express");
const { fetchTopics, fetchApi } = require("./controllers/controller.api"); //imports fetch function from controllers

const app = express(); // initialise express (object to handle middleware and http)
app.use(express.json()); // app.use handles specific requests - here we are parse that data and making it available in the req.body to use later

app.get("/api/topics", fetchTopics); // defines a GET route, When a GET request made ,call the fetchTopics function made in controller file

app.get("/api/", fetchApi);

app.all("/*", (req, res) => {
  res.status(404).send({ msg: "Request not found" });
}); // error handling, if request is made that doesnt have a path, returns 404 code and msg

module.exports = app;
