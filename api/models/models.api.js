const db = require("../../db/connection"); //imports db from connection
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

exports.getArticleId = (id) => {
  const articleIdNum = id.article_id;
  return db
    .query(`SELECT * FROM articles WHERE article_id = $1;`, [articleIdNum])
    .then((result) => {
      const article = result.rows[0];
      if (!article) {
        return Promise.reject({ status: 404, msg: "Article not found" });
      }
      return article;
    });
};
exports.getArticlesInDateOrder = () => {
  const getArticlesInDateOrderQuery = `
    SELECT articles.article_id, articles.title, articles.topic, articles.author, 
    articles.created_at, articles.votes, articles.article_img_url, 
    COUNT(comments.article_id)::INT AS comment_count 
    FROM articles 
    LEFT JOIN comments ON articles.article_id = comments.article_id 
    GROUP BY articles.article_id 
    ORDER BY articles.created_at DESC;
  `;

  return db.query(getArticlesInDateOrderQuery).then((result) => {
    const articlesInDateOrder = result.rows;
    return articlesInDateOrder;
  });
};
