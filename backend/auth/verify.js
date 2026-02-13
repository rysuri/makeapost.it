export const verify = async (req, res) => {
  try {
    console.log("=== VERIFY REQUEST ===");
    console.log("Origin:", req.headers.origin);
    console.log("All cookies:", req.cookies);
    console.log("Session cookie:", req.cookies.session);

    const token = req.cookies.session;

    if (!token) {
      console.log("❌ No session cookie found");
      return res.status(401).json({ authenticated: false });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.sub;

    const query = `
      SELECT id, email, picture, given_name, family_name, role, created_at, posts_made
      FROM users
      WHERE google_id = $1
    `;

    const result = await dbClient.query(query, [userId]);

    if (result.rows.length === 0) {
      return res.status(401).json({ authenticated: false });
    }

    const user = result.rows[0];

    console.log("✅ User verified:", user.email);

    return res.status(200).json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        given_name: user.given_name,
        family_name: user.family_name,
        picture: user.picture,
        role: user.role,
        created_at: user.created_at,
        posts_made: user.posts_made,
      },
    });
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(401).json({ authenticated: false });
  }
};
