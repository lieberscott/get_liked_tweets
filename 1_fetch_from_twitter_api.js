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

// const token = "SEE_DOT_ENV_FILE";
const token = "AAAAAAAAAAAAAAAAAAAAABQWrgEAAAAAN1%2FJFEg8Hm%2BGK4kpMesg8G0KlvY%3D8avF1B8HGUplSt0tjLgy9XDldDhhrGXgomeuwuY6kn3GqAGbdw";

let fileNum = 0;
let intervalId = "";

const twitterId = "81957315"; // Id for smlieber84
const maxResults = 100;

// CHECK FOR PAGINATION TOKEN TO CONTINUE GETTING LIKED TWEETS
let params = {
  "tweet.fields": "attachments,author_id,context_annotations,conversation_id,created_at,id,in_reply_to_user_id,note_tweet,referenced_tweets,entities,text,public_metrics,source",
  "expansions": "author_id,in_reply_to_user_id,referenced_tweets.id,referenced_tweets.id.author_id,attachments.media_keys",
  "max_results": maxResults,
  "media.fields": "duration_ms,height,media_key,type,url,width,public_metrics",
  "user.fields": "id,name,profile_image_url,username,verified,verified_type",
  // "pagination_token": ""
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
  
  if (response.body) {

    params.pagination_token = response.body.meta ? response.body.meta.next_token : "";
    if (fileNum >= 10) {
      console.log("finished");
      clearInterval(intervalId);
    }


    // Write the json
    
    const str = JSON.stringify(response.body, null, 2);
    fs.appendFile(`./second_round/tweets_${fileNum}.json`, str, (error) => {
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