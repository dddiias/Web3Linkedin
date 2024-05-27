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

// Обработка подключения кошелька
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

// Главная страница
router.get("/main", async (req, res) => {
  if (!req.session.userId) {
    return res.redirect("/");
  }

  const user = await User.findById(req.session.userId)
    .populate("connections")
    .populate("friendRequests");
  const posts = await Post.find()
    .populate({
      path: "author",
      populate: { path: "photos" }, // Убедитесь, что 'photos' - это правильное поле в модели User
    })
    .populate("comments.author");

  res.render("main", {
    title: "Main Page",
    username: user.username,
    friendCount: user.connections.length,
    profilePicture: user.photos.length > 0 ? user.photos[0] : null,
    posts,
    friendRequests: user.friendRequests,
    error: req.query.error, // Добавляем параметр для отображения ошибки
  });
});

// Страница профиля
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
    userId: user._id, // Добавляем отображение идентификатора пользователя
    profilePicture: user.photos.length > 0 ? user.photos[0] : null,
    name: user.username,
    bio: "A short bio about the user",
    address: user.walletAddress,
    friendCount: user.connections.length,
    connections: user.connections,
    posts,
  });
});

// Профиль друга
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
    userId: friend._id, // Добавляем отображение идентификатора друга
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

// Обработка регистрации пользователя
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

// Добавление в друзья
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

  if (
    user.connections.includes(friendId) ||
    friend.friendRequests.includes(req.session.userId)
  ) {
    return res.redirect(
      "/main?error=User%20is%20already%20a%20friend%20or%20request%20already%20sent"
    );
  }

  friend.friendRequests.push(user._id);
  await friend.save();

  res.redirect("/main");
});

// Принятие заявки в друзья
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

  if (!user.connections.includes(requestId)) {
    user.connections.push(requestUser._id);
  }

  if (!requestUser.connections.includes(user._id)) {
    requestUser.connections.push(user._id);
  }

  user.friendRequests = user.friendRequests.filter(
    (id) => id.toString() !== requestId
  );

  await user.save();
  await requestUser.save();

  res.redirect("/main");
});

// Отклонение заявки в друзья
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
