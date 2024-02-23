/*
* Step 3_1: Scrape for videoHTML in quoted 
*
*
*
*/


const { chromium } = require('playwright');
const fs = require("fs");

const scrape_website = async () => {

  let pageNum = 0;

  while (pageNum < 11) {


    let data = fs.readFileSync(`./second_round/3_updated_tweets_with_video_HTML/tweets_${pageNum}.json`);
    const json = JSON.parse(data);

    const len = json.length;
    let i = 0;

    let newArr = [];
    
    
    while (i < len) {

      const newJson = {...json[i]};
      let htmlContent = "";


      if (newJson.quoted && newJson.quoted_tweet_data && newJson.quoted_tweet_data.video) {
        let quotedTweetHtml = "";

        const sn = newJson.quoted_tweet_data.user.screen_name;
        const tw_id = newJson.quoted_tweet_data.id;
        
        const url = getUrl(sn, tw_id);
        
        quotedTweetHtml = await getVideo(url);
        
        if (quotedTweetHtml !== "") {
          quotedTweetHtml = cleanUpHtml(quotedTweetHtml);
          console.log(`Added quotedTweetHtml to pageNum ${pageNum} at Json item ${i}`);
        }
        
        newJson.quoted_tweet_data.video_html = quotedTweetHtml;

      }
      
      newArr.push(newJson);

      i++;

    }

    const str = JSON.stringify(newArr, null, 2);

    // Write the Tweet to a file
    try {
      fs.writeFileSync(`./second_round/3_z1_updated_tweets_with_reply_data/tweets_${pageNum}.json`, str);
      console.log(`wrote pageNum ${pageNum}`)
    }

    catch (err) {
      console.log(`fs error for tweet_${pageNum} and item ${i}`);
      i = len;
    }

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