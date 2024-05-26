const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Post = require("../models/Post");

router.get("/", (req, res) => {
  res.redirect("/connect_wallet");
});

router.get("/connect_wallet", (req, res) => {
  res.render("connect_wallet", { title: "Web3Linkedin" });
});

router.post("/wallet-connect", async (req, res) => {
  const { walletAddress } = req.body;
  const user = await User.findOne({ walletAddress });

  if (user) {
    req.session.userId = user._id;
    res.redirect("/main");
  } else {
    req.session.walletAddress = walletAddress;
    res.redirect("/register");
  }
});

router.get("/main", async (req, res) => {
  if (!req.session.userId) {
    return res.redirect("/");
  }

  const user = await User.findById(req.session.userId)
    .populate("connections")
    .populate("friendRequests");
  const posts = await Post.find()
    .populate("author")
    .populate("comments.author");

  res.render("main", {
    title: "Main Page",
    username: user.username,
    friendCount: user.connections.length,
    posts,
    friendRequests: user.friendRequests,
  });
});

router.get("/profile", async (req, res) => {
  if (!req.session.userId) {
    return res.redirect("/");
  }

  const user = await User.findById(req.session.userId).populate("connections");
  const posts = await Post.find({ author: req.session.userId }).populate(
    "comments.author"
  );

  res.render("profile", {
    title: "Profile",
    username: user.username,
    profilePicture: user.photos.length > 0 ? user.photos[0] : null,
    name: user.username,
    bio: "A short bio about the user",
    address: user.walletAddress,
    friendCount: user.connections.length,
    connections: user.connections,
    posts,
  });
});

router.get("/profile/:id", async (req, res) => {
  if (!req.session.userId) {
    return res.redirect("/");
  }

  const friend = await User.findById(req.params.id).populate("connections");
  const posts = await Post.find({ author: req.params.id }).populate(
    "comments.author"
  );

  res.render("profile", {
    title: "Profile",
    username: friend.username,
    profilePicture: friend.photos.length > 0 ? friend.photos[0] : null,
    name: friend.username,
    bio: "A short bio about the user",
    address: friend.walletAddress,
    friendCount: friend.connections.length,
    connections: friend.connections,
    posts,
  });
});

router.get("/register", (req, res) => {
  res.render("register", { title: "Register" });
});

router.post("/register", async (req, res) => {
  const { username, email, photos } = req.body;
  const walletAddress = req.session.walletAddress;

  try {
    if (!walletAddress) {
      throw new Error("Wallet address is not found in session");
    }
    const user = new User({
      username,
      email,
      photos: photos ? [photos] : [],
      walletAddress,
    });
    await user.save();
    req.session.userId = user._id;
    res.redirect("/main");
  } catch (error) {
    console.error(error);
    res.redirect("/register");
  }
});

router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

router.post("/add-friend", async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).send("Unauthorized");
  }

  const { friendId } = req.body;
  const user = await User.findById(req.session.userId);
  const friend = await User.findById(friendId);

  if (!friend) {
    return res.status(404).send("User not found");
  }

  if (!user.friendRequests.includes(friendId)) {
    friend.friendRequests.push(user._id);
    await friend.save();
  }

  res.redirect("/main");
});

router.post("/accept-friend", async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).send("Unauthorized");
  }

  const { requestId } = req.body;
  const user = await User.findById(req.session.userId);
  const requestUser = await User.findById(requestId);

  if (!requestUser) {
    return res.status(404).send("User not found");
  }

  user.connections.push(requestUser._id);
  requestUser.connections.push(user._id);

  user.friendRequests = user.friendRequests.filter(
    (id) => id.toString() !== requestId
  );

  await user.save();
  await requestUser.save();

  res.redirect("/main");
});

router.post("/decline-friend", async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).send("Unauthorized");
  }

  const { requestId } = req.body;
  const user = await User.findById(req.session.userId);

  user.friendRequests = user.friendRequests.filter(
    (id) => id.toString() !== requestId
  );

  await user.save();
  res.redirect("/main");
});

module.exports = router;
