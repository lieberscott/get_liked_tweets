/*
* Step 3: Scrape for videoHTML
*
*
*
*
*/


const { chromium } = require('playwright');
const fs = require("fs");

const scrape_website = async () => {

  let pageNum = 10;

  while (pageNum >= 0) {


    let data = fs.readFileSync(`./second_round/2_updated_tweets_before_additional_data/tweets_${pageNum}.json`);
    const json = JSON.parse(data);

    const len = json.length;
    let i = 0;
    const newArr = [];
    
    
    while (i < len) {

      const newJson = {...json[i]};
      let htmlContent = "";

      if (newJson.video) {

        const url = getUrl(newJson.user.screen_name, newJson.tweet_id);

        htmlContent = await getVideo(url);

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
          console.log(`New video for tweets_${pageNum}, item ${i}`);
        }

        newJson.video_html = htmlContent;

      }

      if (newJson.thread && newJson.thread_arr && newJson.thread_arr.length) {
        for (let j = 0; j < newJson.thread_arr.length; j++) {
          let threadHtmlContent = "";
          if (newJson.thread_arr[j].video) {
            
            const sn = newJson.user.screen_name;
            const tw_id = newJson.thread_arr[j].id;
            
            const url = getUrl(sn, tw_id);
            
            threadHtmlContent = await getVideo(url);
            
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

        const sn = newJson.in_reply_to_data.user.screen_name;
        const tw_id = newJson.in_reply_to_data.id;
        
        const url = getUrl(sn, tw_id);
        
        replyHTML = await getVideo(url);
        
        if (replyHTML !== "") {
          replyHTML = cleanUpHtml(replyHTML);
          console.log(`Added replyHTML at Json item ${i}`);
        }
        
        newJson.in_reply_to_data.video_html = replyHTML;

      }

      newArr.push(newJson);

      i++;

    }

    const str = JSON.stringify(newArr, null, 2);  

    // Write the Tweet to a file
    try {
      fs.writeFileSync(`./second_round/3_updated_tweets_with_video_HTML/tweets_${pageNum}.json`, str);
      console.log(`appended ${pageNum}`);
    }

    catch (err) {
      console.log(`fs error for tweet_${pageNum} and item ${i}`);
      i = len;
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


const getVideo = async (url) => {

  let htmlContent = "";
  // Launch a headless browser
  // console.log("Part 1: Launch headless browser")
  const browser = await chromium.launch();
  
  try {
    
    // Create a new page
    // console.log("Part 2: Create a new page")
    const page = await browser.newPage();

    // Navigate to the website
    // console.log("Part 3: Navigate to the website");
    await page.goto(url);

    // Wait for the <code> element to be present in the DOM
    // console.log("Part 4: Wait for the selector to load");
    const selector = 'code';
    await page.waitForSelector(selector, { timeout: 10000 }, (e) => {
      if (e) {
        console.log("Consoling error : ", e);
      }
    });

    // Use the $ function to select the first matching <code> element
    const codeElementHandle = await page.$(selector);

    if (codeElementHandle) {
      // Extract text content or other properties from the <code> element
      htmlContent = await codeElementHandle.textContent();
    } else {
      console.error(`No <code> element found`);
    }

  }
  catch (err) {
    if (err.name === 'TimeoutError') {
      console.error(`Timeout reached while waiting for the <code> element for video`);
    } else {
      console.error('Error:', err);
    }
    htmlContent = "";
  }
  finally {
    // Close the browser
    await browser.close();
  }

  return htmlContent;
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