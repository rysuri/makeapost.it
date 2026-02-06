const { Client } = require("pg");

const dbClient = new Client({
  host: "localhost",
  user: "postgres",
  port: 5432,
  password: process.env.DB_PASSWORD,
  database: "demopost",
});

dbClient
  .connect()
  .then(() => console.log("Connected to PostgreSQL"))
  .catch((err) => console.error("DB connection failed:", err));

module.exports = dbClient;
