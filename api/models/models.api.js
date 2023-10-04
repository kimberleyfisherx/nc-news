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

exports.getArticleByIdQuery = `SELECT * FROM articles WHERE article_id = $1;`;

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

exports.getCommentsByIdQuery = `SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at DESC;`;

exports.getCommentsById = (id) => {
  const articleIdNum = id.article_id;
  return db
    .query(exports.getArticleByIdQuery, [articleIdNum]) //Query to get article information based on articleIdNum.
    .then((result) => {
      // Handle the result of the first query.
      if (result.rows.length === 0) {
        // Check if there are no rows returned.
        return Promise.reject({ status: 404, msg: "no article found" }); // If no rows, reject the promise with a 404 status and an error message.
      } else return db.query(exports.getCommentsByIdQuery, [articleIdNum]); // If there are rows, query for comments based on articleIdNum.
    })
    .then((result) => {
      const commentsArray = result.rows;
      return commentsArray; // returns resulting comments in an array.
    });
};

exports.postComment = (id, comment) => {
  const articleIdNum = id.article_id;
  const commentBody = comment.body;
  const commentAuthor = comment.username;

  if (!commentBody || commentBody.trim() === "") {
    return Promise.reject({ status: 400, msg: "Please enter a comment" });
  }

  if (!commentAuthor) {
    return Promise.reject({ status: 400, msg: "Please insert your username" });
  }

  return db
    .query("SELECT * FROM articles WHERE article_id = $1", [articleIdNum])
    .then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Article not found" });
      }
      return db
        .query(
          "INSERT INTO comments (body, author, article_id) VALUES ($1, $2, $3) RETURNING *",
          [commentBody, commentAuthor, articleIdNum]
        )
        .then((result) => {
          const commentObj = result.rows[0];
          return commentObj;
        });
    });
};
