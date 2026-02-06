import { OAuth2Client } from "google-auth-library";
import dbClient from "../config/database.js";
import jwt from "jsonwebtoken";
import { jwtDecode } from "jwt-decode";

const oAuth2Client = new OAuth2Client(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  "postmessage",
);

const JWT_SECRET = process.env.JWT_SECRET;

function createSessionToken(user) {
  return jwt.sign(
    {
      sub: user.sub,
      email: user.email,
      picture: user.picture,
      given_name: user.given_name,
      family_name: user.family_name,
    },
    JWT_SECRET,
    { expiresIn: "3d" },
  );
}

export const googleAuth = async (req, res) => {
  try {
    const { tokens } = await oAuth2Client.getToken(req.body.code);

    const decoded = jwtDecode(tokens.id_token);

    const { sub: google_id, email, picture, given_name, family_name } = decoded;

    // check if user exists
    const check_query = "SELECT * FROM users WHERE google_id = $1";
    const existing_user = await dbClient.query(check_query, [google_id]);

    if (existing_user.rows.length === 0) {
      const insert_query = `
        INSERT INTO users (google_id, email, picture, given_name, family_name) 
        VALUES ($1, $2, $3, $4, $5)
      `;

      await dbClient.query(insert_query, [
        google_id,
        email,
        picture,
        given_name,
        family_name,
      ]);
    }

    const token = createSessionToken({
      sub: google_id,
      email,
      picture,
      given_name,
      family_name,
    });

    // prepare cookie package.
    res.cookie("session", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 3 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Auth error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
};
