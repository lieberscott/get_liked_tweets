/*
* Adding tweet_urls for replied_to_data and quoted_tweet_data (did not have them on first go round)
*
* Seems code similar to this is already in 2_createJson.js, yet it wasn't being populated? I'm unsure why. (2/7/24)
*
*
*/


const fs = require("fs");

const add_urls = async (pageNum) => {

  const data = fs.readFileSync(`./3_z2_updated_tweets_combined/tweets_${pageNum}.json`);
  const json = JSON.parse(data);
  const len = json.length;

  const newArr = [];

  for (let i = 0; i < len; i++) {
    const newObj = {...json[i]}
    if (newObj.reply) {
      const tweet_url = newObj.in_reply_to_data && newObj.in_reply_to_data.in_reply_to_user ? `https://twitter.com/${newObj.in_reply_to_data.in_reply_to_user.screen_name}/status/${newObj.in_reply_to_data.id}` : "";
      newObj.in_reply_to_data.tweet_url = tweet_url;
    }

    if (newObj.quoted) {
      const tweet_url = newObj.quoted_tweet_data && newObj.quoted_tweet_data.quoted_tweet_user ? `https://twitter.com/${newObj.quoted_tweet_data.quoted_tweet_user.screen_name}/status/${newObj.quoted_tweet_data.id}` : "";
      newObj.quoted_tweet_data.tweet_url = tweet_url;
    }

    if (newObj.thread && newObj.thread_arr && newObj.thread_arr.length) {
      for (let j = 0; j < newObj.thread_arr.length; j++) {
        const tweet_url = newObj.user && newObj.user.screen_name ? `https://twitter.com/${newObj.user.screen_name}/status/${newObj.thread_arr[j].id}` : "";
        newObj.thread_arr[j].tweet_url = tweet_url;
      }
    }

    newArr.push(newObj);

  }

  const str = JSON.stringify(newArr, null, 2);

  fs.writeFileSync(`./3_z3_add_quoted_and_replied_tweet_urls/tweets_${pageNum}.json`, str, (err) => {
    if (err) {
      console.log("error : ", err);
    }
    else {
      console.log("finished : ", pageNum);
    }
  })

}

let pageNum = 5;

while (pageNum < 47) {
  add_urls(pageNum);
  console.log(`pageNum ${pageNum} done`);
  pageNum++;
}