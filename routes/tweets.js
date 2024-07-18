var express = require("express");
var router = express.Router();

const mongoose = require("mongoose");
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

// route GET/tweets/ that returns all tweets in db, sorted desc to asc
router.get("/", (req, res) => {
  Tweet.find({})
    .populate("author")
    .populate("likeBy")
    .then((dbData) => {
      //   console.log(data);
      let result = [];
      result = dbData.map((tweet) => {
        const tweetObj = {
          tweet_id: tweet._id,
          text: tweet.text,
          date: tweet.date,
          authorUsername: tweet.author.username,
          authorFirstname: tweet.author.firstname,
          likeCount: tweet.likeBy.length,
        };
        return tweetObj;
      });
      result.sort((a, b) => b.date - a.date);
      res.json({ result: result });
    });
});

// route PUT/tweets/:id with req.body.token that likes or dislikes a tweet, returns the likeCount updated?
router.put("/:id", (req, res) => {
  const id = req.params.id;
  // if missing token in body
  if (!checkBody(req.body, ["token"])) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }
  // find the user_id to add to array likeBy
  let user_id;
  User.findOne({ token: req.body.token }).then((userData) => {
    if (userData) {
      user_id = userData._id.toHexString();
      console.log(user_id);
      return user_id;
    } else {
      res.json({ result: false, error: "No token match" });
      return;
    }
  });
  //   find the tweet and either add or remove user_id to the list
  // attention : a debug, il y a des erreurs
  Tweet.findById(id).then((data) => {
    if (data.likeBy.some((e) => e === user_id)) {
      Tweet.updateOne({ _id: id }, { $pull: { likeBy: user_id } }).then(
        (data) => {
          //   console.log(data);
          if (data.modifiedCount > 0) {
            res.json({ result: true, action: "removed" });
          } else {
            res.json({ result: false, error: "Unable to remove like" });
          }
        }
      );
    } else {
      Tweet.updateOne({ _id: id }, { $push: { likeBy: user_id } }).then(
        (data) => {
          console.log(data);
          if (data.modifiedCount > 0) {
            res.json({ result: true, action: "added" });
          } else {
            res.json({ result: false, error: "Unable to add like" });
          }
        }
      );
    }
  });
});

// .then((tweetData) => {
//     tweetData.likeBy.push(user_id);
//     //   console.log(tweetData.likeBy);
//     console.log(tweetData.likeBy);
//     res.json({ result: tweetData });

//   console.log(mongoose.Types.ObjectId.isValid(user_id));

module.exports = router;
