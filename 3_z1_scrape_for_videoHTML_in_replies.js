/*
* Step 3_1: Scrape for videoHTML in replies 
*
*
* Bug from Step 3 has been fixed
*
* 
* Running this script should not be necessary as of Feb. 1. 2024, as Step 3 should now get videoHTML in replies (it didn't previously)
*
*
*/


const { chromium } = require('playwright');
const fs = require("fs");

const scrape_website = async () => {

  let pageNum = 0;

  while (pageNum < 47) {


    let data = fs.readFileSync(`./updated_tweets_with_reply_data/tweets_${pageNum}.json`);
    const json = JSON.parse(data);

    const len = json.length;
    let i = 0;

    let newArr = [];
    
    
    while (i < len) {

      const newJson = {...json[i]};
      let htmlContent = "";


      if (newJson.reply && newJson.in_reply_to_data && newJson.in_reply_to_data.video) {
        let replyHTML = "";

        const sn = newJson.in_reply_to_data.user.screen_name;
        const tw_id = newJson.in_reply_to_data.id;
        
        const url = getUrl(sn, tw_id);
        
        replyHTML = await getVideo(url);
        
        if (replyHTML !== "") {
          replyHTML = cleanUpHtml(replyHTML);
          console.log(`Added replyHTML to pageNum ${pageNum} at Json item ${i}`);
        }
        
        newJson.in_reply_to_data.video_html = replyHTML;

      }
      
      newArr.push(newJson);

      i++;

    }

    const str = JSON.stringify(newArr, null, 2);

    // Write the Tweet to a file
    try {
      fs.writeFileSync(`./updated_tweets_with_reply_data_2/tweets_${pageNum}.json`, str);
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