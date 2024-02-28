/*
* Adding likes, retweets, and other metrics to first round data (didn't get it in first round, but got it in second round)
*
*
*
*
*/


const fs = require("fs");

const add_metrics = async (originalData_pageNum) => {

  const original_data = fs.readFileSync(`./first_round/5_z1_categorized_tweets_by_page_num/tweets_${originalData_pageNum}.json`);
  const original_json = JSON.parse(original_data);
  const original_len = original_json.length;

  const newArr = [];

  for (let i = 0; i < original_len; i++) {
    const newObj = {...original_json[i]};


    let updatedData_pageNum = 0;

    while (updatedData_pageNum < 61) {
      const likes_data = fs.readFileSync(`./second_round_2/1_tweets/tweets_${updatedData_pageNum}.json`);
      const likes_json0 = JSON.parse(likes_data);
      const likes_json = likes_json0.data;
      const likes_len = likes_json.length;

      for (let j = 0; j < likes_len; j++) {
        if (likes_json[j].id === newObj.tweet_id) {
          newObj.retweet_count = likes_json[j].public_metrics.retweet_count;
          newObj.likes_count = likes_json[j].public_metrics.like_count;
          newObj.comments_count = likes_json[j].public_metrics.reply_count;
          newObj.impressions_count = likes_json[j].public_metrics.impression_count;
          j = likes_len;
          updatedData_pageNum = 61;
        }
      }
      updatedData_pageNum++;
      // if (updatedData_pageNum++ > 60) {
      //   console.log(`no hit at original pageNum ${originalData_pageNum} and item num ${i}`);
      // }
    }

    newArr.push(newObj);

  }

  const str = JSON.stringify(newArr, null, 2);

  fs.writeFileSync(`./first_round/5_z2_categorized_tweets_by_page_num_with_likes_data/tweets_${originalData_pageNum}.json`, str, (err) => {
    if (err) {
      console.log("error : ", err);
    }
    else {
      console.log("finished : ", pageNum);
    }
  })

}

let originalData_pageNum = 0;

while (originalData_pageNum < 47) {
  add_metrics(originalData_pageNum);
  console.log(`pageNum ${originalData_pageNum} done`);
  originalData_pageNum++;
}