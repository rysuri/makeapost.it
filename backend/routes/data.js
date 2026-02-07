const express = require("express");
const router = express.Router();
const { createPost } = require("../data/post");
const { getAllPosts } = require("../data/fetchall");

router.post("/post", createPost);
router.get("/posts", getAllPosts);

module.exports = router;
