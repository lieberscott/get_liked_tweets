/*
* Step 3_z2: ONLY NECESSARY BECAUSE OF PREVIOUS BUG, WHICH HAS BEEN FIXED
* AS OF 2/1/24, NO LONGER NECESSARY TO COMBINE
*
* Combines Step 2 data (tweets with reply_data) with step 3 data (tweets with videoHTML)
* As of 2/1/24, this is no longer necessary, as Step 2 will already have reply_data
* It didn't the first time I used this, so I had to re-do Step 2 after already having done Step 3
* Not wanting to re-scrape Twitter, I wrote this program to combine the two json files into one
*
*/


const fs = require("fs");

const combine = async (pageNum, reply_json, video_json) => {

  const reply_len = reply_json.length;
  const video_len = video_json.length;

  const newArr = [];

  for (let i = 0; i < video_len; i++) {

    const newObj = {...video_json[i]};

    for (let j = 0; j < reply_len; j++) {
      let hit = false;
      if (reply_json[j].tweet_id === newObj.tweet_id && reply_json[j].reply && reply_json[j].in_reply_to_data) {
        if (j !== i) {
          console.log(`pageNum ${pageNum}: j (${j}) is not equal to i (${i})`)
        }
        newObj.reply = true;
        newObj.in_reply_to_data = {...reply_json[j].in_reply_to_data};
        hit = true;
      }
      if (reply_json[j].tweet_id === newObj.tweet_id && reply_json[j].quoted && reply_json[j].quoted_tweet_data) {
        newObj.quoted_tweet_data = {...reply_json[j].quoted_tweet_data};
        hit = true;
      }
      if (reply_json[j].tweet_id === newObj.tweet_id && reply_json[j].thread && reply_json[j].thread_arr.length) {
        newObj.thread_arr = reply_json[j].thread_arr;
        hit = true;
      }
      if (reply_json[j].tweet_id === newObj.tweet_id && newObj.media_key && reply_json[j].media_keys) {
        delete newObj.media_key;
        newObj.media_keys = reply_json[j].media_keys;
        hit = true;
      }
      if (hit) {
        j = reply_len + 1;
      }
    }
    newArr.push(newObj);
  }

  const str = JSON.stringify(newArr, null, 2);

  fs.writeFileSync(`./updated_tweets_combined/tweets_${pageNum}.json`, str, (err) => {
    if (err) {
      console.log("error : ", err);
    }
    else {
      console.log("finished : ", pageNum);
    }
  })
  
}

let pageNum = 0;

while (pageNum < 47) {

  const reply_data = fs.readFileSync(`./updated_tweets_with_reply_data/tweets_${pageNum}.json`);
  const reply_json = JSON.parse(reply_data);

  const video_data = fs.readFileSync(`./updated_tweets_with_videoHTML/tweets_${pageNum}.json`);
  const video_json = JSON.parse(video_data);
  combine(pageNum, reply_json, video_json);
  console.log("finished pageNum : ", pageNum);
  pageNum++;
}
