const db = require("../../db/connection"); //imports db from connection
const fs = require("fs/promises");
const { fetchTopics } = require("../controllers/controller.api");

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
    .query(
      `SELECT articles.author,articles.title,articles.article_id, articles.topic, articles.created_at, articles.votes,articles.article_img_url, articles.body , COUNT(comments) as comment_count FROM articles LEFT JOIN comments ON articles.article_id = comments.article_id  WHERE articles.article_id = $1 GROUP BY articles.article_id ;`,
      [articleIdNum]
    )
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
    .query(exports.getArticleByIdQuery, [articleIdNum])
    .then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({ status: 404, msg: "no article found" });
      } else return db.query(exports.getCommentsByIdQuery, [articleIdNum]);
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
    return Promise.reject({ status: 400, msg: "Please enter a comment" }); // this looks for an empty comment or comment with only a space
  }

  return db
    .query("SELECT * FROM articles WHERE article_id = $1", [articleIdNum])
    .then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Article not found" }); // this looks for if the article actually exists if it doesnt returns error, if it does move on
      }
      return db
        .query("SELECT * FROM users WHERE username = $1", [commentAuthor])
        .then((userResult) => {
          if (userResult.rows.length === 0) {
            return Promise.reject({ status: 404, msg: "Username not found" });
          }
          return db
            .query(
              "INSERT INTO comments (body, author, article_id) VALUES ($1, $2, $3) RETURNING *",
              [commentBody, commentAuthor, articleIdNum] // this inserts the comment
            )
            .then((result) => {
              const commentObj = result.rows[0];
              return commentObj; // this returns the comment
            });
        });
    });
};
exports.patchVotes = (id, votes) => {
  const articleIdNum = id.article_id;
  const votesNum = votes.inc_votes;
  if (votesNum === undefined || votesNum === null) {
    return Promise.reject({ status: 400, msg: "please enter your vote" });
  }
  return db
    .query(
      `UPDATE articles SET votes = votes + $1 WHERE article_id = $2 returning *;`,
      [votesNum, articleIdNum]
    )
    .then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Article not found" });
      }
      return result.rows[0];
    });
};
exports.deleteComment = (id) => {
  const commentId = id.comment_id;

  return db
    .query("DELETE FROM comments WHERE comment_id =$1 RETURNING *;", [
      commentId,
    ])
    .then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Comment not found" });
      }
      return result.rows;
    });
};

exports.getUsers = () => {
  return db.query(`SELECT * FROM users;`).then((result) => {
    return result.rows;
  });
};

const validColumns = [
  "author",
  "title",
  "article_id",
  "topic",
  "created_at",
  "votes",
  "article_img_url",
];

const isValidColumn = (columnName) => {
  return validColumns.includes(columnName);
};

const validOrders = ["asc", "desc"];

const isValidOrder = (order) => {
  return validOrders.includes(order);
};

exports.selectAllArticles = (topic, sort_by, order) => {
  const values = [];
  let conditionalWhere = "";
  if (topic) {
    conditionalWhere = "WHERE articles.topic = $1";
    values.push(topic);
  }

  let orderBy = "ORDER BY articles.created_at DESC";

  if (sort_by && !isValidColumn(sort_by)) {
    return Promise.reject({ status: 404, msg: "Invalid sort_by query" });
  }

  if (order && !isValidOrder(order)) {
    return Promise.reject({ status: 400, msg: "Invalid order query" });
  }

  if (sort_by) {
    orderBy = `ORDER BY articles.${sort_by}`;
    if (order) {
      orderBy += ` ${order}`;
    }
  }

  let query = `
    SELECT 
      articles.author, 
      articles.title, 
      articles.article_id, 
      articles.topic, 
      articles.created_at, 
      articles.votes, 
      articles.article_img_url, 
      COUNT(comments) as comment_count
    FROM 
      articles
    LEFT JOIN 
      comments ON articles.article_id = comments.article_id
    ${conditionalWhere}
    GROUP BY 
      articles.article_id
    ${orderBy};
  `;

  return db.query(query, values).then((articles) => {
    const article = articles.rows;
    if (article.length === 0) {
      return [];
    } else {
      return article;
    }
  });
};
