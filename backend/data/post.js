const dbClient = require("../config/database");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

const MAX_DRAWING_SIZE = 80_000;

const createPost = async (req, res) => {
  try {
    const token = req.cookies.session;

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Not authenticated",
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const googleId = decoded.sub;

    const userResult = await dbClient.query(
      `SELECT id FROM users WHERE google_id = $1`,
      [googleId],
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: "User not found",
      });
    }

    const userId = userResult.rows[0].id;

    const {
      message,
      drawing,
      link,
      size,
      expiration,
      color,
      position_x,
      position_y,
    } = req.body;

    const trimmedMessage = message?.trim() || null;

    const hasMessage = !!trimmedMessage;
    const hasDrawing = !!drawing;
    if (hasMessage && hasDrawing) {
      return res.status(400).json({
        success: false,
        error: "Post can contain either a message OR a drawing, not both",
      });
    }

    if (!hasMessage && !hasDrawing) {
      return res.status(400).json({
        success: false,
        error: "Post must contain a message or a drawing",
      });
    }

    // Validate drawing size (prevents giant payloads)
    if (hasDrawing) {
      const sizeBytes = Buffer.byteLength(JSON.stringify(drawing));

      if (sizeBytes > MAX_DRAWING_SIZE) {
        return res.status(400).json({
          success: false,
          error: "Drawing too large",
        });
      }
    }

    let safeLink = null;
    if (link) {
      try {
        const url = new URL(link);
        safeLink = url.toString();
      } catch {
        return res.status(400).json({
          success: false,
          error: "Invalid link URL",
        });
      }
    }

    const validSizes = ["S", "M", "L"];
    const validatedSize = validSizes.includes(size) ? size : "S";

    const validExpirations = {
      "1day": "1 day",
      "7days": "7 days",
      "30days": "30 days",
    };
    const intervalValue = validExpirations[expiration] || "7 days";

    const validColors = ["Y", "B", "P"];
    const validatedColor = validColors.includes(color) ? color : "Y";

    const validatedPositionX =
      typeof position_x === "number" && !isNaN(position_x) ? position_x : 0;
    const validatedPositionY =
      typeof position_y === "number" && !isNaN(position_y) ? position_y : 0;

    // Start transaction
    await dbClient.query("BEGIN");

    try {
      const result = await dbClient.query(
        `
        INSERT INTO posts 
        (author, message, drawing, link, size, exp, color, position_x, position_y)
        VALUES ($1,$2,$3,$4,$5,NOW() + $6::INTERVAL,$7,$8,$9)
        RETURNING *
      `,
        [
          userId,
          hasMessage ? trimmedMessage : null,
          hasDrawing ? drawing : null,
          safeLink,
          validatedSize,
          intervalValue,
          validatedColor,
          validatedPositionX,
          validatedPositionY,
        ],
      );

      await dbClient.query(
        `UPDATE users SET posts_made = posts_made + 1 WHERE id = $1`,
        [userId],
      );

      await dbClient.query("COMMIT");

      return res.status(201).json({
        success: true,
        post: result.rows[0],
      });
    } catch (err) {
      await dbClient.query("ROLLBACK");
      throw err;
    }
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
