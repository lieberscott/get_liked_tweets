/*
*
* CATEGORIZE TWEETS
*
* Must copy the updated_tweets_combined folder (file by file) into the following Glitch project: (https://glitch.com/edit/#!/israel-public-tweets-page?path=tweets_%2Ftweets_46.json%3A11%3A61)
*
* You can then use that Glitch project to categorize the tweets
*
*
*/

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
  
  
  fs.appendFile(`./5_categorized_tweets_by_page_num/${category}.json`, str, (err) => {
    if (err) {
      console.log("by_page_num error : ", err);
      return res.json({ ok: false })
    }
    else {
      console.log("success");
    }
  })


  fs.appendFile(`./5_categorized_tweets_by_category/${category}.json`, str, (err) => {
    if (err) {
      console.log("by_category error : ", err);
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
