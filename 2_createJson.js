/*
*
*
* *** Step 2: Create useable JSON for app
*
* ***  KNOWN BUGS  ***
* 
* 1. If a thread's first tweet comes after the rest of them in the data array, it will correctly add the thread, but it will also add the "first tweet" as its own entry without a thread
*    To fix, at the end, simply go through the array again, removing any duplicate top-level conversation_id entries that have thread = false
*
*/


const fs = require("fs");

const createJson = (json, pageNum) => {

  let newArr = [];

  const dataArr = json.data;
  const tweetsArr = json.includes.tweets;
  const usersArr = json.includes.users;
  const mediaArr = json.includes.media;

  const len = dataArr.length;
  // const len = 11;
  const tweetsLen = tweetsArr.length;
  const userLen = usersArr.length;
  const mediaLen = mediaArr.length;

  for (let i = 0; i < len; i++) {
    let pushNew = true;
    const newObj = {};

    // Step 1: Get the easy stuff
    newObj.created_at = dataArr[i].created_at;
    newObj.tweet_id = dataArr[i].id;
    newObj.conversation_id = dataArr[i].conversation_id;
    newObj.text = dataArr[i].note_tweet ? dataArr[i].note_tweet.text : dataArr[i].text;
    newObj.user = {};
    newObj.image_urls = [];
    newObj.thread_arr = [];

    // To get the media data, get the media key array
    const media_keys = dataArr[i].attachments && dataArr[i].attachments.media_keys ? dataArr[i].attachments.media_keys : [];

    // Then loop through the media key array, finding the corresponding media in the mediaArr array
    for (let n = 0; n < media_keys.length; n++) {

      const media_key = media_keys[n];

      const returnVal = getMedia(media_key, mediaArr, mediaLen);

      if (typeof returnVal === "boolean") {
        // this means it is a video, so just set video to true
        newObj.video = true;
      }
      else if (typeof returnVal === "undefined" || typeof returnVal === "null") {
        // this means the media is not in the tweetsArr, meaning I didn't "like" the original tweet being responded to
        // so i'm simply adding the media_key for now to come back to it later
        if (newObj.media_keys && newObj.media_keys.length) {
          newObj.media_keys.push(media_key);
        }
        else {
          newObj.media_keys = [media_key];
        }
      }
      else {
        // return value should be object
        newObj.image_urls.push(returnVal);
      }
      
    }
    

    // Step 2: Get user data
    const author_id = dataArr[i].author_id;

    const returnArr = getUser(author_id, usersArr, userLen);

    newObj.user = returnArr[0];
    newObj.tweet_url = returnArr[1] === "" ? "" : `https://twitter.com/${returnArr[1]}/status/${dataArr[i].id}`;

    // Step 3: Get quoted data
    const referencedTweetsLen = dataArr[i].referenced_tweets ? dataArr[i].referenced_tweets.length : 0;

    newObj.quoted = false; // initiate it to false
    newObj.reply = false;
    newObj.thread = false; // initiate it to false
    // newObj.thread_arr = [];


    for (let k = 0; k < referencedTweetsLen; k++) {
      if (dataArr[i].referenced_tweets[k].type === "quoted") {
        newObj.quoted = true;
        const referenced_tweet_id = dataArr[i].referenced_tweets[k].id;

        let quoted_tweet_data = {};


        for (let l = 0; l < tweetsLen; l++) {
          if (tweetsArr[l].id === referenced_tweet_id) {
            quoted_tweet_data = getTweetData(tweetsArr[l]);

            // To get the quoted_tweet_data, get the quoted authorId
            const quotedAuthorId = tweetsArr[l].author_id;

            const responseArr2 = getUser(quotedAuthorId, usersArr, userLen);
            quoted_tweet_data.quoted_tweet_user = responseArr2[0];
            quoted_tweet_data.quoted_tweet_url == responseArr2[1] === "" ? "" : `https://twitter.com/${responseArr2[1]}/status/${referenced_tweet_id}`;


            quoted_tweet_data.quoted_tweet_image_urls = [];

            // To get the media data, get the media key array
            const referenced_media_keys = tweetsArr[l].attachments && tweetsArr[l].attachments.media_keys ? tweetsArr[l].attachments.media_keys : [];

            // Then loop through the media key array, finding the corresponding media in the mediaArr array
            for (let n = 0; n < referenced_media_keys.length; n++) {

              const referenced_media_key = referenced_media_keys[n];

              const mediaResp = getMedia(referenced_media_key, mediaArr, mediaLen);

              if (typeof mediaResp === "boolean") {
                // this means it is a video, so just set video to true
                quoted_tweet_data.video = true;
              }
              else if (typeof mediaResp === "undefined" || typeof mediaResp === "null") {
                if (quoted_tweet_data.media_keys && quoted_tweet_data.media_keys.length) {
                  quoted_tweet_data.media_keys.push(referenced_media_key);
                }
                else {
                  quoted_tweet_data.media_keys = [referenced_media_key];
                }
              }
              else {
                // return value should be object
                if (!quoted_tweet_data.image_urls) {
                  quoted_tweet_data.image_urls = [];
                }
                quoted_tweet_data.image_urls.push(mediaResp);
              }
              
            }

          }

        }
      
        newObj.quoted_tweet_data = quoted_tweet_data;
      
      }
      
      else if (dataArr[i].referenced_tweets[k].type === "replied_to") {
        // Figure out if it's a thread, or a reply to a different user
        const thread = dataArr[i].in_reply_to_user_id === dataArr[i].author_id ? true : false;

        // This means it's a reply to a different user, so we need to get that user's info
        if (!thread) {

          newObj.reply = true;
          
          const referenced_tweet_id = dataArr[i].referenced_tweets[k].id;

          let in_reply_to_data = {};

          for (let l = 0; l < tweetsLen; l++) {
            if (tweetsArr[l].id === referenced_tweet_id) {
              in_reply_to_data = getTweetData(tweetsArr[l]);

              // To get the in_reply_to_data, get the quoted authorId
              const inReplyToAuthorId = tweetsArr[l].author_id;

              const responseArr3 = getUser(inReplyToAuthorId, usersArr, userLen);
              in_reply_to_data.in_reply_to_user = responseArr3[0];
              in_reply_to_data.in_reply_to_tweet_url == responseArr3[1] === "" ? "" : `https://twitter.com/${responseArr3[1]}/status/${referenced_tweet_id}`;
              
              in_reply_to_data.image_urls = [];

              // To get the media data, get the media key array
              const referenced_media_keys = tweetsArr[l].attachments && tweetsArr[l].attachments.media_keys ? tweetsArr[l].attachments.media_keys : [];

              // Then loop through the media key array, finding the corresponding media in the mediaArr array
              for (let n = 0; n < referenced_media_keys.length; n++) {

                const referenced_media_key = referenced_media_keys[n];

                const mediaResp = getMedia(referenced_media_key, mediaArr, mediaLen);

                if (typeof mediaResp === "boolean") {
                  // this means it is a video, so just set video to true
                  in_reply_to_data.video = true;
                }
                else if (typeof mediaResp === "undefined" || typeof mediaResp === "null") {
                  if (in_reply_to_data.media_keys && in_reply_to_data.media_keys.length) {
                    in_reply_to_data.media_keys.push(referenced_media_key);
                  }
                  else {
                    in_reply_to_data.media_keys = [referenced_media_key];
                  }
                }
                else {
                  // return value should be object
                  if (!in_reply_to_data.image_urls) {
                    in_reply_to_data.image_urls = [];
                  }
                  in_reply_to_data.image_urls.push(mediaResp);
                }
                
              }
              l = tweetsLen;
            }

          }
          newObj.in_reply_to_data = in_reply_to_data;

        }


        // this means it's a thread (of the same user)
        else {

          newObj.thread = true;
          const conversation_id = dataArr[i].conversation_id;

          let newConversationId = true;
          let conversationIndex = -1;
          let lastThreadTweetId;
          let threadTweetIdArr = [];

          // Check if conversation_id is already in array (do this before using this function)
          for (let q = 0; q < newArr.length; q++) {
            if (newArr[q].conversation_id === conversation_id) {
              newConversationId = false;
              conversationIndex = q;
              const threadTweetLen = newArr[q].thread_arr ? newArr[q].thread_arr.length : 0;
              if (threadTweetLen === 0) {
                newArr[q].thread_arr = [];
              }
              for (let w = 0; w < threadTweetLen; w++) {
                threadTweetIdArr.push(newArr[q].thread_arr[w].id);
              }
              // lastThreadTweetId = threadTweetLen > 0 ? newArr[q].thread_arr[threadTweetLen - 1].tweet_id : 0;
              q = newArr.length;
            }
          }

          let threadArr;
          if (newConversationId) {
            newObj.thread_arr = handleThreadRecursive(dataArr[i], tweetsArr, threadTweetIdArr, mediaArr, mediaLen, usersArr, userLen);
          }

          else {
            let responseArr = handleThreadRecursive(dataArr[i], tweetsArr, threadTweetIdArr, mediaArr, mediaLen, usersArr, userLen);
            newArr[conversationIndex].thread_arr = newArr[conversationIndex].thread_arr.concat(responseArr);
            pushNew = false;
          }

        }


      }
    }
    if (pushNew) {
      newArr.push(newObj);
    }

  }
  
  const updatedData = JSON.stringify(newArr, null, 2);
  fs.writeFileSync(`./updated_tweets_with_reply_data_2/tweets_${pageNum}.json`, updatedData, { flag: "wx" }, (err) => {
    if (err) {
      console.log("error : ", err);
    }
    else {
      console.log("finished : ", pageNum);
    }
  })
}


const getTweetData = (tweetObj) => {
  const tweet_data = { };
  tweet_data.created_at = tweetObj.created_at;
  tweet_data.id = tweetObj.id;
  tweet_data.conversation_id = tweetObj.conversation_id;
  tweet_data.text = tweetObj.note_tweet ? tweetObj.note_tweet.text : tweetObj.text;
  return tweet_data;
}


const getUser = (author_id, usersArr, userLen) => {
  const obj = {};
  let screen_name = "";
  for (let j = 0; j < userLen; j++) {
    if (usersArr[j].id === author_id) {
      obj.id = usersArr[j].id;
      obj.name = usersArr[j].name;
      obj.screen_name = usersArr[j].username;
      obj.profile_page_url = `https://twitter.com/${usersArr[j].username}`;
      obj.profile_image_url = usersArr[j].profile_image_url;
      obj.verified = usersArr[j].verified;
      obj.verified_type = usersArr[j].verified_type;
      screen_name = usersArr[j].username;
      j = userLen;
    }
  }
  return [obj, screen_name];
}

const getMedia = (mediaKey, mediaArr, mediaLen) => {


  for (let p = 0; p < mediaLen; p++) {
    if (mediaArr[p].media_key === mediaKey && mediaArr[p].type === "photo") {
      return mediaArr[p];
      p = mediaLen;
    }
    else if (mediaArr[p].media_key === mediaKey && mediaArr[p].type === "video") {
      p = mediaLen;
      return true;
    }
  }
}


const handleThreadRecursive = (subjectTweet, tweetsArr, threadTweetIdArr, mediaArr, mediaLen, usersArr, userLen) => {

  // Step 1: Find reference tweet
  // Step 2: Recursively find tweets until you hit the "first tweet" OR the tweet_id of a tweet already in the threadArr


  // Step 1: Find the referenced_tweet by tweeet_id
  const tweet_id = subjectTweet.id;
  const tweetsArrLen = tweetsArr.length;
  let keepGoing = true;

  if (subjectTweet.referenced_tweets) {
    const threadObj = {};
    const referencedTweetsLen = subjectTweet.referenced_tweets.length;

    let arr = [];

    for (let t = 0; t < referencedTweetsLen; t++) {
      const referenced_tweet_id = subjectTweet.referenced_tweets[t].id;
      for (let x = 0; x < threadTweetIdArr.length; x++) {
        if (referenced_tweet_id === threadTweetIdArr[x]) {
          // Reference tweet is already in thread, so break and return
          // const returnObj = getTweetData(tweetsArr[s]);
          // Object.assign(threadObj, returnObj);
          keepGoing = false;
          return [];
        }
      }

      if (subjectTweet.referenced_tweets[t].type === "replied_to" && keepGoing) {
        for (let u = 0; u < tweetsArrLen; u++) {

          // Find the referenced_tweet in the tweetArr
          if (tweetsArr[u].id === referenced_tweet_id) {

            arr = handleThreadRecursive(tweetsArr[u], tweetsArr, threadTweetIdArr, mediaArr, mediaLen, usersArr, userLen);
            const returnObj = getTweetData(subjectTweet);
            Object.assign(threadObj, returnObj);

            if (subjectTweet.attachments && subjectTweet.attachments.media_keys) {
              threadObj.image_urls = [];
              const mediaKeysLen = subjectTweet.attachments.media_keys.length;
            
              for (let n = 0; n < mediaKeysLen; n++) {
      
                const media_key = subjectTweet.attachments.media_keys[n];
          
                const returnVal = getMedia(media_key, mediaArr, mediaLen);
          
                if (typeof returnVal === "boolean") {
                  // this means it is a video, so just set video to true
                  threadObj.video = true;
                }
                else if (typeof returnVal === "undefined" || typeof returnVal === "null") {
                  if (threadObj.media_keys && threadObj.media_keys.length) {
                    threadObj.media_keys.push(media_key);
                  }
                  else {
                    threadObj.media_keys = [media_key]
                  }
                }
                else {
                  // return value should be object
                  threadObj.image_urls.push(returnVal);
                }
                
              }
    
            }




          }
        }
      }
      else if (subjectTweet.referenced_tweets[t].type === "quoted" && keepGoing) {
        threadObj.quoted = true;

        for (let u = 0; u < tweetsArrLen; u++) {

          // Find the referenced_tweet in the tweetArr
          if (tweetsArr[u].id === referenced_tweet_id) {

            arr = handleThreadRecursive(tweetsArr[u], tweetsArr, threadTweetIdArr, mediaArr, mediaLen, usersArr, userLen);
            const returnObj = getTweetData(subjectTweet);
            Object.assign(threadObj, returnObj);

            // get quoted tweet data
            const returnObj2 = getTweetData(tweetsArr[u]);
            threadObj.quoted_tweet_data = returnObj2;

            // get quoted user data
            const quotedUserArr = getUser(tweetsArr[u].author_id, usersArr, userLen);
            const quoted_user_obj = quotedUserArr[0];
            threadObj.quoted_tweet_data.quoted_tweet_user = quoted_user_obj;
            threadObj.quoted_tweet_data.tweet_url = quotedUserArr[1] === "" ? "" : `https://twitter.com/${quotedUserArr[1]}/status/${referenced_tweet_id}`;

            // get quoted tweet media
            if (tweetsArr[u].attachments && tweetsArr[u].attachments.media_keys) {
              threadObj.quoted_tweet_data.image_urls = [];
              const mediaKeysLen = tweetsArr[u].attachments.media_keys.length;
            
              for (let n = 0; n < mediaKeysLen; n++) {
      
                const media_key = tweetsArr[u].attachments.media_keys[n];
          
                const returnVal = getMedia(media_key, mediaArr, mediaLen);
          
                if (typeof returnVal === "boolean") {
                  // this means it is a video, so just set video to true
                  threadObj.quoted_tweet_data.video = true;
                }
                else if (typeof returnVal === "undefined" || typeof returnVal === "null") {
                  if (threadObj.quoted_tweet_data.media_keys && threadObj.quoted_tweet_data.media_keys.length) {
                    threadObj.quoted_tweet_data.media_keys.push(media_key);
                  }
                  else {
                    threadObj.quoted_tweet_data.media_keys = [media_key]
                  }
                }
                else {
                  // return value should be object
                  threadObj.quoted_tweet_data.image_urls.push(returnVal);
                }
                
              }
    
            }


            // get subject tweet data
            if (subjectTweet.attachments && subjectTweet.attachments.media_keys) {
              threadObj.image_urls = [];
              const mediaKeysLen = subjectTweet.attachments.media_keys.length;
            
              for (let n = 0; n < mediaKeysLen; n++) {
      
                const media_key = subjectTweet.attachments.media_keys[n];
          
                const returnVal = getMedia(media_key, mediaArr, mediaLen);
          
                if (typeof returnVal === "boolean") {
                  // this means it is a video, so just set video to true
                  threadObj.video = true;
                }
                else if (typeof returnVal === "undefined" || typeof returnVal === "null") {
                  if (threadObj.media_keys && threadObj.media_keys.length) {
                    threadObj.media_keys.push(media_key);
                  }
                  else {
                    threadObj.media_keys = [media_key]
                  }
                }
                else {
                  // return value should be object
                  threadObj.image_urls.push(returnVal);
                }
                
              }
    
            }




          }
        }






      }
    }
    if (Object.keys(threadObj).length > 0) {
      arr.push(threadObj);
    }
    return arr;
  }

  // if no referenced tweet, we should have reached the "first tweet"
  else {
    // construct the object and return
    const threadObj = {}

    const returnObj = getTweetData(subjectTweet);
    Object.assign(threadObj, returnObj);

    if (subjectTweet.attachments && subjectTweet.attachments.media_keys) {
      threadObj.image_urls = [];
      const mediaKeysLen = subjectTweet.attachments.media_keys.length;

      for (let n = 0; n < mediaKeysLen; n++) {

        const media_key = subjectTweet.attachments.media_keys[n];
  
        const returnVal = getMedia(media_key, mediaArr, mediaLen);
  
        if (typeof returnVal === "boolean") {
          // this means it is a video, so just set video to true
          threadObj.video = true;
        }
        else if (typeof returnVal === "undefined" || typeof returnVal === "null") {
          if (threadObj.media_keys && threadObj.media_keys.length) {
            threadObj.media_keys.push(media_key);
          }
          else {
            threadObj.media_keys = [media_key];
          }
        }
        else {
          // return value should be object
          threadObj.image_urls.push(returnVal);
        }
        
      }

    }
    return [threadObj];
  }

}


let pageNum = 5;

while (pageNum < 47) {
  const data = fs.readFileSync(`./tweets/tweets${pageNum}.json`);
  const json = JSON.parse(data);
  createJson(json, pageNum);
  console.log(`${pageNum} done`);
  pageNum++;
}