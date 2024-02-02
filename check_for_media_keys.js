/*
* Sanity check: Checking if in_reply_to_data or quoted_tweet_data has media_key
*
*
*
*/


const fs = require("fs");

const check = async (pageNum) => {

  const reply_data = fs.readFileSync(`./updated_tweets_combined/tweets_${pageNum}.json`);
  const reply_json = JSON.parse(reply_data);
  const reply_len = reply_json.length;

  for (let i = 0; i < reply_len; i++) {
    if (reply_json[i].reply) {
      if (reply_json[i].in_reply_to_data && reply_json[i].in_reply_to_data.media_keys) {
        console.log(`Page Num ${pageNum} and item num ${i} has media_keys in the reply_to tweet`);
        console.log(`The media_keys are ${reply_json[i].in_reply_to_data.media_keys}`);
      }
    }

    if (reply_json[i].quoted && reply_json[i].quoted_tweet_data && reply_json[i].quoted_tweet_data.media_keys) {
      console.log(`Page Num ${pageNum} and item num ${i} has media_keys in the quoted tweet`);
        console.log(`The media_keys are ${reply_json[i].quoted_tweet_data.media_keys}`);
    }

  }
}

let pageNum = 0;

while (pageNum < 5) {
  check(pageNum);
  console.log(`${pageNum} done`);
  pageNum++;
}
