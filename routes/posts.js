const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const User = require("../models/User");

router.post("/create", async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).send("Unauthorized");
  }

  const { content } = req.body;
  const user = await User.findById(req.session.userId);
  const post = new Post({ content, author: user._id });

  await post.save();
  res.redirect("/main");
});

router.post("/comment", async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).send("Unauthorized");
  }

  const { postId, content } = req.body;
  const user = await User.findById(req.session.userId);
  const post = await Post.findById(postId);

  if (!post) {
    return res.status(404).send("Post not found");
  }

  post.comments.push({ content, author: user._id });
  await post.save();

  res.redirect("/main");
});

module.exports = router;
