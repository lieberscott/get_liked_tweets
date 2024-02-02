/*
* Step 1: Get Tweets Data from Twitter API
*
*
*
*
*/

const fs = require("fs");
const needle = require("needle");
const axios = require("axios");

const token = "SEE_DOT_ENV_FILE";

let fileNum = 0;
let intervalId = "";

const twitterId = "81957315"; // Id for smlieber84
const maxResults = 100;

// CHECK FOR PAGINATION TOKEN TO CONTINUE GETTING LIKED TWEETS
let params = {
  "tweet.fields": "author_id,attachments,context_annotations,conversation_id,created_at,id,in_reply_to_user_id,note_tweet,referenced_tweets,text",
  "expansions": "author_id,in_reply_to_user_id,referenced_tweets.id,referenced_tweets.id.author_id,attachments.media_keys",
  "max_results": maxResults,
  "media.fields": "duration_ms,height,media_key,type,url,width,public_metrics",
  "user.fields": "id,name,profile_image_url,username,verified,verified_type",
  "pagination_token": "7140dibdnow9c7btw483gv33yf1v4wrmlsddyicjsscol"
};

const getdata = async () => {
  
  
  const url = `https://api.twitter.com/2/users/${twitterId}/liked_tweets`;
  // const url = "https://api.twitter.com/2/users/me"
  
  const response = await needle("get", url, params, {
    headers: {
      "User-Agent": "v2LikedTweetsJS",
      authorization: `Bearer ${token}`
    },
  });
  
  // console.log("response: ", response);

  if (response.body) {
    // console.log("res.body : ", response.body);

    params.pagination_token = response.body.meta ? response.body.meta.next_token : "";
    if (!response.body.data || (response.body.data && response.body.data.length < 10)) {
      console.log("finished");
      clearInterval(intervalId);
    }


    // Write the json
    
    const str = JSON.stringify(response.body, null, 2);
    fs.appendFile(`tweets${fileNum}.json`, str, (error) => {
      if (error) {
        console.error(error);
        return;
      }
      else {
        console.log(`successful ${fileNum}`);
        fileNum++;
      }
    });
  } else {
    throw new Error("Unsuccessful request");
  }
  
}


intervalId = setInterval(getdata, 200000);