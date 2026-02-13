const { Pool } = require("pg");

const getDatabaseConfig = () => {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const url = new URL(connectionString);

  let host = url.hostname;

  return {
    user: url.username,
    password: decodeURIComponent(url.password),
    host: host,
    port: parseInt(url.port) || 5432,
    database: url.pathname.split("/")[1],
    ssl: {
      rejectUnauthorized: false,
    },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000, // Increased timeout
  };
};

const pool = new Pool(getDatabaseConfig());

pool.on("connect", () => {
  console.log("Connected to Supabase PostgreSQL");
});

pool.on("error", (err) => {
  console.error("Unexpected database error:", err);
});

module.exports = pool;
