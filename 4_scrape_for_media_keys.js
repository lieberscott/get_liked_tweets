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

  let pageNum = 0;

  while (pageNum < 1) {


    // let data = fs.readFileSync(`./updated_tweets_combined/tweets_${pageNum}.json`);
    // const json = JSON.parse(data);

    // const len = json.length;
    const len = 1;
    let i = 0;
    
    
    while (i < len) {

      // const newJson = {...json[i]};
      const newJson = {};
      let htmlContentVideo = "";
      let htmlContentCode = "";

      if (true) {

        // const url = getUrl(newJson.user.screen_name, newJson.tweet_id);

        // console.log(url);

        // const url_vid = "https://publish.twitter.com/?query=https%3A%2F%2Ftwitter.com%2FJakeWSimons%2Fstatus%2F1750452284356546631&widget=Video";
        // const url_vid = "https://twitter.com/JakeWSimons/status/1750452284356546631";
        // const url_vid = "https://twitter.com/IsraelMatzav/status/1750386570350461049";
        const url_vid = "https://publish.twitter.com/?query=https%3A%2F%2Ftwitter.com%2FIsraelMatzav%2Fstatus%2F1750386570350461049&widget=Video"
        // const url_img = "https://publish.twitter.com/?query=https%3A%2F%2Ftwitter.com%2FNoaMagid%2Fstatus%2F1754832190217519442&widget=Video";
        const url_img = "https://publish.twitter.com/?query=https%3A%2F%2Ftwitter.com%2FMarinaMedvin%2Fstatus%2F1748794048582766941&widget=Video";

        [htmlContentVideo, htmlContentCode] = await getMedia(url_img);

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
        
        if (htmlContentVideo !== "") {
          htmlContentVideo = cleanUpHtml(htmlContentVideo);
        }

        console.log("htmlContentVideo : ", htmlContentVideo);

        if (htmlContentCode !== "") {
          htmlContentCode = cleanUpHtml(htmlContentCode);
        }

        console.log("htmlContentCode : ", htmlContentCode);

        return;

        newJson.video_html = htmlContent;

      }

      if (newJson.thread && newJson.thread_arr && newJson.thread_arr.length) {
        for (let j = 0; j < newJson.thread_arr.length; j++) {
          let threadHtmlContent = "";
          if (newJson.thread_arr[j].video) {
            
            const sn = newJson.user.screen_name;
            const tw_id = newJson.thread_arr[j].id;
            
            const url = getUrl(sn, tw_id);
            
            threadHtmlContent = await getMedia(url);
            
            if (threadHtmlContent !== "") {
              threadHtmlContent = cleanUpHtml(threadHtmlContent);
              console.log(`Added threadHTMLContent at Json item ${i} and thread item ${j}`);
            }
            
            newJson.thread_arr[j].video_html = threadHtmlContent;
          
          }
        }
      }

      if (newJson.reply && newJson.in_reply_to_data && newJson.in_reply_to_data.video) {
        let replyHTML = "";

        const sn = newJson.in_reply_to_data.in_reply_to_user.screen_name;
        const tw_id = newJson.in_reply_to_data.id;
        
        const url = getUrl(sn, tw_id);
        
        replyHTML = await getMedia(url);
        
        if (replyHTML !== "") {
          replyHTML = cleanUpHtml(replyHTML);
          console.log(`Added replyHTML at Json item ${i}`);
        }
        
        newJson.in_reply_to_data.video_html = replyHTML;

      }
      
      const str = JSON.stringify(newJson, null, 2);  

      // Write the Tweet to a file
      try {
        fs.appendFileSync(`./updated_tweets2/tweets_${pageNum}.json`, str + ",\n");
        console.log(`appended`)
      }

      catch (err) {
        console.log(`fs error for tweet_${pageNum} and item ${i}`);
        i = len;
      }

      i++;

    }

    pageNum = pageNum - 1;

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

  const regex = /<img.*">/g;

  const imgArr = html.match(regex);

  return imgArr;
}


const getMedia = async (url) => {

  let htmlContentVideo = "";
  let htmlContentCode = "";

  const selector_code = 'code';
  const selector_video = `.twitter-tweet`;


  // Launch a headless browser
  const browser = await firefox.launch();

  // Create a new page
  const context = await browser.newContext();
  const page = await context.newPage();

  // First get video content
  try {

    // Navigate to the website
    await page.goto(url);

    console.log("wait for frame");

    await page.waitForSelector(".twitter-tweet-rendered");

    const frame = page.mainFrame();

    console.log("found main frame");

    const childFrames = frame.childFrames();

    console.log("child frames len : ", childFrames.length);

    const childFramesContent = await childFrames[1].content();

    const imgArr = checkForImgHtml(childFramesContent);

    console.log("imgArr[1] : ", imgArr[1]);

    /*
    console.log("wait for video selector ...");
    await page.waitForSelector(selector_video, { timeout: 10000 });
    console.log("found video selector");

    const codeElementHandleVideo = await page.$(selector_video, { timeout: 10000});
    
    htmlContentVideo = await codeElementHandleVideo.innerHTML();
    console.log("innerHTML : ", htmlContentVideo);
    */

    // Use the $ function to select the first matching <video> element
    // const codeElementHandleVideo = await page.$("#twitter-widget-0");

    // console.log("codeElementHandleVideo : ", codeElementHandleVideo);

    // if (codeElementHandleVideo) {
    //   // Extract text content or other properties from the <video> element
    //   htmlContentVideo = await codeElementHandleVideo.textContent();
    //   console.log("htmlContentVideo1 : ", htmlContentVideo);
    // } else {
    //   console.error(`No <video> element found`);
    // }

  }
  catch (err) {
    if (err.name === 'TimeoutError') {
      console.error(`Timeout reached while waiting for the video element for url ${url}`);
    } else {
      console.error('Error:', err);
    }
    htmlContent = "";
  }


  // next do selector code
  // try {

  //   console.log("wait for code selector ...");

  //   await page.waitForSelector(selector_code, { timeout: 10000 });

  //   console.log("found code selector");

  //   // Use the $ function to select the first matching <code> element
  //   const codeElementHandle = await page.$(selector_code);

  //   if (codeElementHandle) {
  //     // Extract text content or other properties from the <code> element
  //     htmlContentCode = await codeElementHandle.textContent();
  //   } else {
  //     console.error(`No <code> element found`);
  //   }

  // }
  // catch (err) {
  //   if (err.name === 'TimeoutError') {
  //     console.error(`Timeout reached while waiting for the code element for url ${url}`);
  //   } else {
  //     console.error('Error:', err);
  //   }
  //   htmlContent = "";
  // }

  finally {
    // Close the browser
    await browser.close();
  }

  return [htmlContentVideo, htmlContentCode];
}

// Example usage
const websiteUrl = 'https://example.com';
scrape_website(websiteUrl)
  .then((html) => {
    console.log("Finished at " + new Date().toLocaleTimeString());
  })
  .catch((error) => {
    console.error('Error:', error);
  });
