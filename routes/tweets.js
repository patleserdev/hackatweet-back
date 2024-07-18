var express = require("express");
var router = express.Router();

require("../models/connection");
const Tweet = require("../models/tweets");
const User = require("../models/users");

const { checkBody } = require("../modules/checkBody");

// route POST/tweets/ that create a new tweet in db and returns tweet_id
router.post("/", (req, res) => {
  if (!checkBody(req.body, ["text", "token"])) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }
  //look up the user_id based on the token in request body
  User.findOne({ token: req.body.token }).then((data) => {
    if (data) {
      console.log(data);
      const newTweet = new Tweet({
        text: req.body.text,
        date: Date.now(),
        author: data._id,
        likeBy: [],
      });
      newTweet.save().then((newDoc) => {
        res.json({ result: true, token: data.token, tweet_id: newDoc._id });
      });
    } else ({ result: false, error: "No token match" });
  });
});

// route GET/tweets/ that

module.exports = router;
