/*
* Sanity check: Checking if reply data has video: true in replies
*
*
*
*/


const fs = require("fs");

const check = async (pageNum) => {

  const reply_data = fs.readFileSync(`./updated_tweets/tweets_${pageNum}.json`);
  const reply_json = JSON.parse(reply_data);
  const reply_len = reply_json.length;

  for (let i = 0; i < reply_len; i++) {
    if (reply_json[i].reply) {
      if (reply_json[i].in_reply_to_data && reply_json[i].in_reply_to_data.video) {
        console.log(`Page Num ${pageNum} and item num ${i} has a video in the response`);
        console.log(`The video_html is ${reply_json[i].in_reply_to_data.video_html}`);
      }
    }
  }
}

let pageNum = 0;

while (pageNum < 47) {
  check(pageNum);
  console.log(`${pageNum} done`);
  pageNum++;
}