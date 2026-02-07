const dbClient = require("../config/database");

const getAllPosts = async (req, res) => {
  try {
    const query = `
      SELECT author, message, size, iat, exp
      FROM posts
      WHERE exp > NOW()
      ORDER BY iat DESC
    `;

    const result = await dbClient.query(query);

    res.json({
      success: true,
      posts: result.rows,
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch posts",
    });
  }
};

module.exports = { getAllPosts };
