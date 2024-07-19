const mongoose = require("mongoose");

const tweetSchema = mongoose.Schema({
  text: String,
  date: Date,
  author: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  likeBy: [String],
  trends: [String]
});

const Tweet = mongoose.model("tweets", tweetSchema);

module.exports = Tweet;
