const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  connections: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  photos: [String],
  email: { type: String, required: true, unique: true },
  walletAddress: { type: String, required: true, unique: true },
  friendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

module.exports = mongoose.model("User", userSchema);
