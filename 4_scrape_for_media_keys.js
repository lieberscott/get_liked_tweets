/*
* Step 4: Scrape for media_keys
*
*
*
*
*/


const { firefox } = require('playwright');
const fs = require("fs");

const scrape_website = async () => {

  let pageNum = 20;

  while (pageNum < 47) {

    const data = fs.readFileSync(`./3_z3_add_quoted_and_replied_tweet_urls/tweets_${pageNum}.json`);
    const json = JSON.parse(data);
    const len = json.length;

    let newArr = [];

    let countVid = 0;
    let countImg = 0;
      
    
    for (let i = 0; i < len; i++) {

      const newJson = {...json[i]};
      let htmlContent = "";
      let imgArr = [];

      let htmlContent2 = "";
      let imgArr2 = [];

      if (newJson.quoted && newJson.quoted_tweet_data && newJson.quoted_tweet_data.media_keys) {

        const url = getUrl(newJson.quoted_tweet_data.user.screen_name, newJson.quoted_tweet_data.id);

        [htmlContent, imgArr] = await getMedia(url);

        /*
        * Sample response:
          &lt;blockquote class="twitter-tweet"&gt;&lt;p lang="en" dir="ltr"&gt;Lt. Adar Ben Simon, 20: Commander ‘sacrificed her life like a hero’ &lt;a href="https://t.co/Bg5N5zirE5"&gt;https://t.co/Bg5N5zirE5&lt;/a&gt; . Click to read ⬇️&lt;/p&gt;&amp;mdash; The Times of Israel (@TimesofIsrael) &lt;a href="https://twitter.com/TimesofIsrael/status/1739762653734822044?ref_src=twsrc%5Etfw"&gt;December 26, 2023&lt;/a&gt;&lt;/blockquote&gt;
          &lt;script async src="https://platform.twitter.com/widgets.js" charset="utf-8"&gt;&lt;/script&gt;
        *
        *
        * Need to do some regex work on the response
        * Get rid of the <blockquote> tags (which are actually &lt;blockquote&gt; as I'll explain below)
        * Get rid of the <script> tags
        * For some reason, the response is using these characters below for openBracket (<) and closeBracket (>)
        * So to convert it from &lt;p&gt; to <p>, I'll replace it here
        *
        */
        
        if (htmlContent !== "") {
          htmlContent = cleanUpHtml(htmlContent);
          newJson.quoted_tweet_data.video = true;
          newJson.quoted_tweet_data.video_html = htmlContent;
          countVid++;
          console.log(`pageNum ${pageNum} media_key video count: ${countVid}`);
        }

        else if (imgArr.length) {
          newJson.quoted_tweet_data.image_urls = imgArr;
          delete newJson.quoted_tweet_data.image_urls;
          countImg++;
          console.log(`pageNum ${pageNum} media_key image count: ${countImg}`);
        }
      }

      if (newJson.reply && newJson.in_reply_to_data && newJson.in_reply_to_data.media_keys) {

        const url = getUrl(newJson.in_reply_to_data.user.screen_name, newJson.in_reply_to_data.id);

        [htmlContent2, imgArr2] = await getMedia(url);
        
        if (htmlContent2 !== "") {
          htmlContent2 = cleanUpHtml(htmlContent2);
          newJson.in_reply_to_data.video = true;
          newJson.in_reply_to_data.video_html = htmlContent2;
          countVid++;
          console.log(`pageNum ${pageNum} media_key video count: ${countVid}`);
        }

        else if (imgArr2.length) {
          newJson.in_reply_to_data.image_urls = imgArr2;
          countImg++;
          console.log(`pageNum ${pageNum} media_key image count: ${countImg}`);
        }
      }

      // I don't think you need to do threads, since threads are liked and should include all media
      // if (newJson.thread && newJson.thread_arr && newJson.thread_arr.length) {
      //   for (let j = 0; j < newJson.thread_arr.length; j++) {
      //     let threadHtmlContent = "";
      //     if (newJson.thread_arr[j].video) {
            
      //       const sn = newJson.user.screen_name;
      //       const tw_id = newJson.thread_arr[j].id;
            
      //       const url = getUrl(sn, tw_id);
            
      //       threadHtmlContent = await getMedia(url);
            
      //       if (threadHtmlContent !== "") {
      //         threadHtmlContent = cleanUpHtml(threadHtmlContent);
      //         console.log(`Added threadHTMLContent at Json item ${i} and thread item ${j}`);
      //       }
            
      //       newJson.thread_arr[j].video_html = threadHtmlContent;
          
      //     }
      //   }
      // }
    
      newArr.push(newJson);
    }

    const str = JSON.stringify(newArr, null, 2);
    
    fs.writeFileSync(`./4_get_remaining_media_keys/tweets_${pageNum}.json`, str, (err) => {
      if (err) {
        console.log("error : ", err);
      }
      else {
        console.log("finished : ", pageNum);
        return;
      }
    })
    pageNum++;
  }

}


const getUrl = (screen_name, tweet_id) => {
  // const url = `https://publish.twitter.com/?query=https%3A%2F%2Ftwitter.com%2F` +
  //             newJson.user.screen_name +
  //             `%2Fstatus%2F` +
  //             newJson.id_str +
  //             `&widget=Tweet`;

  return `https://publish.twitter.com/?query=https%3A%2F%2Ftwitter.com%2F` +
          screen_name +
          `%2Fstatus%2F` +
          tweet_id +
          `&widget=Video`;
}


const cleanUpHtml = (html) => {
  const regExScriptTags = /&lt;script.*/g;
  const regExBlockquoteOpen = /&lt;.*t"&gt;/g;
  const regExBlockquoteClose = /&lt;\/blockquote&gt;/g;
  const regExOpenBracket = /&lt;/g;
  const regExCloseBracket = /&gt;/g;


  let htmlContent = html;

  htmlContent = htmlContent.replace(regExScriptTags, "");
  htmlContent = htmlContent.replace(regExBlockquoteOpen, "");
  htmlContent = htmlContent.replace(regExBlockquoteClose, "");
  htmlContent = htmlContent.replace(regExOpenBracket, "<");
  htmlContent = htmlContent.replace(regExCloseBracket, ">");

  const regExScriptTags_2 = /<script.*/g;

  htmlContent = htmlContent.replace(regExScriptTags_2, "");

  return htmlContent;
}


const checkForVideoHtml = (html) => {

  const regex = /<video.*<\/video>/;

  const videoArr = html.match(regex);

  return videoArr;
}

const checkForImgHtml = (html) => {

  // First, replace all &amp; with just the &
  const newStr = html.replace(/&amp;/g, "&");

  const regex = /<img alt="Image"(.*?)"(https:\/\/pbs.twimg(.*?))"/g; // capturing group 2 ($2) is the image_url
  
  const urls_arr = [];

  newStr.replace(regex, (match, g1, g2) => urls_arr.push({"type": "photo", "url": g2}));

  return urls_arr;
}


const getMedia = async (url) => {

  let htmlContent = "";
  let imgArr = [];

  const selector = 'code';

  // Launch a headless browser
  const browser = await firefox.launch();

  // Create a new page
  const context = await browser.newContext();
  const page = await context.newPage();

  // First get video content
  try {

    // Navigate to the website
    await page.goto(url);
    
    // Step 1: Check for video
    await page.waitForSelector(".twitter-tweet-rendered");

    const frame = page.mainFrame();

    const childFrames = frame.childFrames();

    const childFramesContent = await childFrames[1].content();

    // First check if it's a video
    const videoArr = checkForVideoHtml(childFramesContent);

    if (videoArr && videoArr.length) {
      // If video, get html from code, and return
      // Use the $ function to select the first matching <code> element
      const codeElementHandle = await page.$(selector);

      if (codeElementHandle) {
        // Extract text content or other properties from the <code> element
        htmlContent = await codeElementHandle.textContent();
      } else {
        console.error(`No <code> element found`);
      }

    }

    else {
      // Step 2: If no video, then it is an image. Get images.
      imgArr = checkForImgHtml(childFramesContent);
    }
  }

  catch (err) {
    if (err.name === 'TimeoutError') {
      console.error(`Timeout reached while waiting for the video element for url ${url}`);
    } else {
      console.error('Error:', err);
    }
    htmlContent = "";
    imgArr = [];
  }

  finally {
    // Close the browser
    await browser.close();
  }

  return [htmlContent, imgArr];
}


scrape_website()
.then(() => {
  console.log("Finished at " + new Date().toLocaleTimeString());
})
.catch((error) => {
  console.error('Error:', error);
});