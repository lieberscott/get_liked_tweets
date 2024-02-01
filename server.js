const express = require('express');
const cors = require("cors");

const fs = require("fs");

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  cors({
    origin: "https://israel-public-tweets-page.glitch.me"
  })
)


app.get("/", (req, res) => {
  console.log("running ...");
  return res.json({ ok: true })
})

app.post("/categorize", (req, res) => {
  console.log("Categorize");
  let { tweetData, category } = req.body;
  // console.log("req.body : ", req.body);
  
  tweetData.category = category;
  
  const str = JSON.stringify(tweetData, null, 2);
  
  
  fs.appendFile(`./categorized_tweets/${category}.json`, str, (err) => {
    if (err) {
      console.log("error : ", err);
      return res.json({ ok: false })
    }
    else {
      console.log("success");
      return res.json({ ok: true });
    }
  })
})


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);

});
