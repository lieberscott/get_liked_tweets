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


const createJson = (json) => {

  let newArr = [];

  const dataArr = json.data;
  const tweetsArr = json.includes.tweets;
  const usersArr = json.includes.users;
  const mediaArr = json.includes.media;

  const len = dataArr.length;
  const tweetsLen = tweetsArr.length;
  const userLen = usersArr.length;
  const mediaLen = mediaArr.length;

  for (const i = 0; i < len; i++) {
    const newObj = {};

    // Step 1: Get the easy stuff
    newObj.created_at = dataArr[i].created_at;
    newObj.tweet_id = dataArr[i].id;
    newObj.conversation_id = dataArr[i].conversation_id;
    newObj.text = dataArr[i].note_tweet ? dataArr[i].note_tweet.text : dataArr[i].text;
    newObj.user = {};
    newObj.image_urls = [];

    // To get the media data, get the media key array
    const media_keys = dataArr[i].attachments && dataArr[i].attachments.media_keys ? dataArr[i].attachments.media_keys : [];

    // Then loop through the media key array, finding the corresponding media in the mediaArr array
    for (const n = 0; n < media_keys.length; n++) {

      const media_key = media_keys[n];

      const returnVal = getMedia(media_key, mediaArr);

      if (typeof returnVal === "bool") {
        // this means it is a video, so just set video to true
        newObj.video = true;
      }
      else if (typeof returnVal === "undefined" || typeof returnVal === "null") {
        // do nothing
      }
      else {
        // return value should be object
        newObj.image_urls.push(returnVal);
      }
      
    }
    

    // Step 2: Get user data
    const author_id = dataArr[i].author_id;

    const returnArr = getUser(author_id, usersArr);

    newObj.user = returnArr[0];
    newObj.tweet_url = returnArr[1];

    // Step 3: Get quoted data
    const referencedTweetsLen = dataArr[i].referenced_tweets ? dataArr[i].referenced_tweets.length : 0;
    newObj.quoted = false; // initiate it to false
    newObj.quoted_tweet_data = {};
    newObj.quoted_tweet_data.quoted_tweet_user = {};

    newObj.reply = false;
    newObj.in_reply_to_data = {};
    newObj.in_reply_to_data.reply_to_user = {};

    newObj.thread = false; // initiate it to false
    newObj.threadArr = [];


    for (const k = 0; k < referencedTweetsLen; k++) {
      if (dataArr[i].referenced_tweets[k].type === "quoted") {
        newObj.quoted = true;
        const referenced_tweet_id = dataArr[i].referenced_tweets[k].id;

        for (const l = 0; l < tweetsLen; l++) {
          if (tweetsArr[l].id === referenced_tweet_id) {
            newObj.quoted_tweet_data.quoted_tweet_created_at = tweetsArr[l].created_at;
            newObj.quoted_tweet_data.quoted_tweet_tweet_id = referenced_tweet_id;
            newObj.quoted_tweet_data.quoted_tweet_text = tweetsArr[l].note_tweet ? tweetsArr[l].note_tweet.text : tweetsArr[l].text;

            // To get the quoted_tweet_data, get the quoted authorId
            const quotedAuthorId = tweetsArr[l].author_id;
            
            // Then get the author screen_name and construct the tweet_url
            for (const m = 0; m < userLen; m++) {
              if (usersArr[m].id === quotedAuthorId) {
                const quoted_author_sn = usersArr[m].username;

                newObj.quoted_tweet_data.quoted_tweet_user.id = usersArr[m].id;
                newObj.quoted_tweet_data.quoted_tweet_user.name = usersArr[m].name;
                newObj.quoted_tweet_data.quoted_tweet_user.screen_name = usersArr[m].username;
                newObj.quoted_tweet_data.quoted_tweet_user.profile_image_url = usersArr[m].profile_image_url;
                newObj.quoted_tweet_data.quoted_tweet_user.verified = usersArr[m].verified;
                newObj.quoted_tweet_data.quoted_tweet_user.verified_type = usersArr[m].verified_type;
                newObj.quoted_tweet_data.quoted_tweet_user.profile_page_url = `https://twitter.com/${quoted_author_sn}`;

                newObj.quoted_tweet_data.quoted_tweet_tweet_url = `https://twitter.com/${quoted_author_sn}/status/${referenced_tweet_id}`;
                m = userLen;
              }
            }

            newObj.quoted_tweet_data.quoted_tweet_image_urls = [];

            // To get the media data, get the media key array
            const referenced_media_keys = tweetsArr[l].attachments && tweetsArr[l].attachments.media_keys ? tweetsArr[l].attachments.media_keys : [];

            // Then loop through the media key array, finding the corresponding media in the mediaArr array
            for (const n = 0; n < referenced_media_keys.length; n++) {

              const referenced_media_key = referenced_media_keys[n];

              getMedia(referenced_media_key);
              
            }

          }
        }


      }
      
      else if (dataArr[i].referenced_tweets[k].type === "replied_to") {
        // Figure out if it's a thread, or a reply to a different user
        const thread = dataArr[i].in_reply_to_user_id === dataArr[i].author_id ? true : false;

        // This means it's a reply to a different user, so we need to get that user's info
        if (!thread) {

          newObj.reply = true;
         
          const referenced_tweet_id = dataArr[i].referenced_tweets[k].id;

          for (const l = 0; l < tweetsLen; l++) {
            if (tweetsArr[l].id === referenced_tweet_id) {
              newObj.in_reply_to_data.in_reply_to_created_at = tweetsArr[l].created_at;
              newObj.in_reply_to_data.in_reply_to_tweet_id = referenced_tweet_id;
              newObj.in_reply_to_data.in_reply_to_text = tweetsArr[l].note_tweet ? tweetsArr[l].note_tweet.text : tweetsArr[l].text;

              // To get the in_reply_to_data, get the quoted authorId
              const quotedAuthorId = tweetsArr[l].author_id;
              
              // Then get the author screen_name and construct the tweet_url
              for (const m = 0; m < userLen; m++) {
                if (usersArr[m].id === quotedAuthorId) {
                  const quoted_author_sn = usersArr[m].username;

                  newObj.in_reply_to_data.in_reply_to_user.id = usersArr[m].id;
                  newObj.in_reply_to_data.in_reply_to_user.name = usersArr[m].name;
                  newObj.in_reply_to_data.in_reply_to_user.screen_name = usersArr[m].username;
                  newObj.in_reply_to_data.in_reply_to_user.profile_image_url = usersArr[m].profile_image_url;
                  newObj.in_reply_to_data.in_reply_to_user.verified = usersArr[m].verified;
                  newObj.in_reply_to_data.in_reply_to_user.verified_type = usersArr[m].verified_type;
                  newObj.in_reply_to_data.in_reply_to_user.profile_page_url = `https://twitter.com/${quoted_author_sn}`;

                  newObj.in_reply_to_data.in_reply_to_tweet_url = `https://twitter.com/${quoted_author_sn}/status/${referenced_tweet_id}`;
                  m = userLen;
                }
              }

              newObj.in_reply_to_data.in_reply_to_image_urls = [];

              // To get the media data, get the media key array
              const referenced_media_keys = tweetsArr[l].attachments && tweetsArr[l].attachments.media_keys ? tweetsArr[l].attachments.media_keys : [];

              // Then loop through the media key array, finding the corresponding media in the mediaArr array
              for (const n = 0; n < referenced_media_keys.length; n++) {

                const referenced_media_key = referenced_media_keys[n];

                for (const p = 0; p < mediaLen; p++) {
                  if (mediaArr[p].media_key === referenced_media_key && mediaArr[p].type === "photo") {
                    newObj.in_reply_to_data.in_reply_to_image_urls.push(mediaArr[p]);
                    n = mediaLen;
                  }
                  else if (mediaArr[p].media === referenced_media_key && mediaArr[p].type === "video") {
                    newObj.in_reply_to_data.in_reply_to_video = true;
                    n = mediaLen;
                  }
                }
                
              }

            }

          }

        }


        // this means it's a thread (of the same user)
        else {

          newObj.thread = true;
          const conversation_id = dataArr[i].conversation_id;

          let newConversationId = true;

          // Check if conversation_id is already in array (do this before using this function)
          for (const q = 0; q < newArr.length; q++) {
            if (newArr[q].conversation_id === conversation_id) {
              newConversationId = false;
              q = newArr.length;
            }
          }

          if (newConversationId) {
            handleThread(dataArr[i], tweetsArr);
          }



        }


      }
    }

    newObj.reply = dataArr[i].referenced_tweets;



    newObj.tweet_url = `https://twitter.com/${dataArr[i]}`

  }
}


const getUser = (author_id, usersArr, userLen) => {
  const obj = {};
  let tweet_url = "";
  for (const j = 0; j < userLen; j++) {
    if (usersArr[j].id === author_id) {
      obj.id = usersArr[j].id;
      obj.name = usersArr[j].name;
      obj.screen_name = usersArr[j].username;
      obj.profile_page_url = `https://twitter.com/${usersArr[j].username}`;
      obj.profile_image_url = usersArr[j].profile_image_url;
      obj.verified = usersArr[j].verified;
      obj.verified_type = usersArr[j].verified_type;
      j = userLen;
      tweet_url = `https://twitter.com/${usersArr[j].username}/status/${dataArr[i].id}`;
    }
  }
  return [obj, tweet_url];
}

const getMedia = (mediaKey, mediaArr, mediaLen) => {

  for (const p = 0; p < mediaLen; p++) {
    if (mediaArr[p].media_key === mediaKey && mediaArr[p].type === "photo") {
      n = mediaLen;
      return mediaArr[p];
      break;
    }
    else if (mediaArr[p].media === mediaKey && mediaArr[p].type === "video") {
      n = mediaLen;
      return true;
      break;
    }
  }
}


const handleThreadRecursive = (subjectTweet, tweetsArr) => {
  // Step 1: Find the referenced_tweet by tweeet_id
  const tweet_id = subjectTweet.id;
  const tweetsArrLen = tweetsArr.length;

  for (const s = 0; s < tweetsArrLen; s++) {
    if (tweetsArr[s].id === tweet_id) {

      // Step 2: Check if that tweet has a referenced_tweet
      if (tweetsArr[s].referenced_tweets) {
        const referencedTweetsLen = tweetsArr[s].referenced_tweets.length;
        for (const t = 0; t < referencedTweetsLen; t++) {
          if (tweetsArr[s].referenced_tweets[t].type === "replied_to") {
            const newObj = handleThreadRecursive(tweetsArr[s], tweetsArr);
          }
          else if (tweetsArr[s].referenced_tweets[t].type === "quoted") {

          }
        }
      }

      // if no referenced tweet, we should have reached the "first tweet"
      else {
        // construct the object and return
        const threadObj = {}

        threadObj.created_at = tweetsArr[s].created_at;
        threadObj.tweet_id = tweetsArr[s].id;
        threadObj.text = tweetsArr[s].note_tweet ? tweetsArr[s].note_tweet.text : tweetsArr[s].text;

        if (tweetsArr[s].attachments && tweetsArr[s].attachments.media_keys) {
          const mediaKeysLen = tweetsArr[s].attachments.media_keys.length;

          for (const t = 0; t < mediaKeysLen; t++) {

          }

        }

          "image_urls": ["https://pbs.twimg.com/media/GED-9ovXgAE5Pn6?format=jpg&name=4096x4096", "https://pbs.twimg.com/media/GED_Bs2XoAAv7ym?format=jpg&name=large"],
          "video_html": "",
          "url": "https://t.co/9i4c5bUUCu",
          "retweet_count": 169,
          "favorite_count": 350,
          "view_count": 1568,
          "comment_count": 20
      }

    }
  }


  // Step 3: If so, handleThreadRecursive() again

  // Step 4: If not, return the data

  // Step 5: Add the "first tweet" data and user info

}


const handleThread = (subjectTweet, tweetArr) => {

  // Check if conversation_id is in newArr already

  const newArrLen = newArr.length;
  const conversation_id = subjectTweet.conversation_id;
  
  for (const r = 0; r < newArrLen; r++) {
    if (newArr[r].conversation_id === conversation_id) {
      newArr[r].thread = true;

    }
  }


  // If so, then "first tweet" data should already be in there
  // Also, it shouldn't yet be listed as "thread", so change thread to true
  // Add latest tweet to thread_array if it's not already there

  // If not, then we haven't yet discovered "first tweet"
  // Add all data you can so far and add tweet to thread_arr
  // Once you reach the last tweet in the programming chain (which will be the first tweet in the thread), add all the data



  // Step 1: Find subjectTweet within tweetArr
  const tweet_id = subjectTweet.id;

  const tweetArrLen = tweetArr.length;

  for (const r = 0; r < tweetArrLen; r++) {
    if (tweetArr[r].id === tweet_id) {

    }
  }



}



intervalId = setInterval(getdata, 200000);