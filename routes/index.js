var express = require("express");
var router = express.Router();
const querystring = require("querystring");
/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

router.get("/user", function (req, res, next) {
  console.log(req.query);
  // res.send(req.query);
  const query = querystring.stringify({
    name: "proxy",
  });
  res.redirect("http://localhost:8000/users?" + query);
});

module.exports = router;
