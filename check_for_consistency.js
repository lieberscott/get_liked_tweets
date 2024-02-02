/*
*
* Use after combine.js to check that everything aligned right
*
*
* Sanity check: Checking if, after combining updated_tweets_with_reply_data and updated_tweets_with_videoHTML
*               that no objects exist that have thread: true, but thread_arr: [],
*               or have reply: true but in_reply_to_data: {}
*
*
*
*/


const fs = require("fs");

const check = async (pageNum) => {

  const data = fs.readFileSync(`./updated_tweets_combined/tweets_${pageNum}.json`);
  const json = JSON.parse(data);
  const len = json.length;

  for (let i = 0; i < len; i++) {
    if (json[i].reply && !json[i].in_reply_to_data.id) {
      console.log(`pageNum ${pageNum} and item ${i} has a reply with no reply data`);
    }

    if (json[i].quoted && !json[i].quoted_tweet_data) {
      console.log(`pageNum ${pageNum} and item ${i} has quoted true but not quoted_tweet_data`);
    }

    if (json[i].thread && (!json[i].thread_arr || json[i].thread_arr.length < 1)) {
      console.log(`pageNum ${pageNum} and item ${i} has thread true with no thread_arr`);
    }

  }
}

let pageNum = 0;

while (pageNum < 47) {
  check(pageNum);
  console.log(`${pageNum} done`);
  pageNum++;
}