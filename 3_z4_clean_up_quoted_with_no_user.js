/*
*
* When categorizing tweets, I kept getting errors because sometimes it would say "reply": true but there's no reply data.
* This seeks to alleviate that.
*
* UNTESTED AND UNUSED: MAY CONTAIN BUGS (2/20/24)
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
      if (!newObj.in_reply_to_data.user) {
        newObj.in_reply_to_data.unavailable = true;
      }
    }

    if (newObj.quoted) {
      if (!newObj.quoted_tweet_data.user) {
        newObj.quoted_tweet_data.unavailable = true;
      }
    }

    if (newObj.thread && newObj.thread_arr && newObj.thread_arr.length) {
      for (let j = 0; j < newObj.thread_arr.length; j++) {
        if (!newObj.thread_arr[j].text) {
          newObj.thread_arr[j].unavailable = true;
        }
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