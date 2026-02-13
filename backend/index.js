require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/auth");
const dataRoutes = require("./routes/data");
const stripeRoutes = require("./routes/stripe");

const app = express();

app.use(cookieParser());

const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((url) => url.trim().replace(/\/$/, ""));

console.log("Allowed CORS origins:", allowedOrigins);
console.log("CLIENT_URL from env:", process.env.CLIENT_URL);

app.use(
  cors({
    origin: function (origin, callback) {
      console.log("Request from origin:", origin);

      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.log("Origin not allowed:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());

// Routes
app.use("/auth", authRoutes);
app.use("/data", dataRoutes);
app.use("/stripe", stripeRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
