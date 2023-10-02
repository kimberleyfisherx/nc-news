const db = require("../db/connection"); //imports db from connection
const data = require("../db/data/test-data"); //imports data for testing
const fs = require("fs/promises");

exports.getTopics = () => {
  //exports get topics function
  return db.query(`SELECT * FROM topics`).then((result) => {
    // sends sql query to select topics
    return result.rows; //returns the rows from the topics table
  });
};

exports.getApi = () => {
  return fs.readFile("./endpoints.json", "utf-8").then((data) => {
    const parsedData = JSON.parse(data);
    return parsedData;
  });
};

