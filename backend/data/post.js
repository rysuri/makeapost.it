const dbClient = require("../config/database");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

const createPost = async (req, res) => {
  try {
    const token = req.cookies.session;

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Not authenticated",
      });
    }

    // verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    const googleId = decoded.sub;

    const userQuery = `
      SELECT id FROM users WHERE google_id = $1
    `;
    const userResult = await dbClient.query(userQuery, [googleId]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: "User not found",
      });
    }

    const userId = userResult.rows[0].id;

    // get post data from request
    const { message, size, expiration } = req.body;

    // validate message
    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: "Message is required",
      });
    }

    // insert post into database
    const query = `
      INSERT INTO posts (author, message, size, exp) 
      VALUES ($1, $2, $3, NOW() + INTERVAL '${expiration || "7 days"}') 
      RETURNING *
    `;

    const result = await dbClient.query(query, [
      userId, // UUID not the google_id...
      message.trim(),
      size || "S",
    ]);

    const post = result.rows[0];

    return res.status(201).json({
      success: true,
      post: post,
    });
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({
        success: false,
        error: "Invalid or expired session",
      });
    }

    console.error("Post creation error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to create post",
    });
  }
};

module.exports = { createPost };
