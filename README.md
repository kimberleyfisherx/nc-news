## Hi there!

Welcome to my News Repo, which is a a social news application inspired by Reddit.

You can visit my hosted version here : https://news-3fmi.onrender.com

This is the backend API, which was built using Javascript and node.

## Getting Started

Before the Project can be ran, you will need to install and run node locally.
Visit the official Node.js website at https://nodejs.org/.

- The minimum versions of Node.js and Postgres you will need are:
  Node.js 14 or higher
  PostgreSQL 16

## Cloning the Repository

**Clone the Repository:**

- Ensure that you have already cloned down the repository.
- If not, run the following command in your terminal:
  git clone https://github.com/kimberleyfisherx/nc-news.git

## Creating the Databases

**Environment Variables:**

- The enviorment files are not included in this repo.
- You will need to create two .env files for your project: `.env.test` and `.env.development`.
- In each file, add `PGDATABASE=`, with the correct database name for that environment with reference of '.env.example'.
- the database_name can be found inside ./db/setup.sql.
- Make sure these .env files are added to your .gitignore.

**Install Dependencies:**

- Run the following command in your terminal:
  npm install

**Setting Up Databases:**

- The seed function has been provided for you.
- Npm run setup-dbs will set up your databases

## Running Tests

- Execute the following command to run tests:
  npm run test

## Thank you

- Any comments or suggestions for improvement are welcomed so please feel free to submit a pull request!
