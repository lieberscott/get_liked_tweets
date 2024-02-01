const { chromium } = require('playwright');
const fs = require("fs");

const scrape_website = async () => {

  let pageNum = 0;

  while (pageNum < 1) {


    let data = fs.readFileSync(`./updated_tweets/tweets_${pageNum}.json`);
    const json = JSON.parse(data);

    const len = json.length;
    let i = 0;
    
    
    while (i < len) {

      const newJson = json[i];
      let htmlContent = "";

      if (json[i].video) {

        // const url = `https://publish.twitter.com/?query=https%3A%2F%2Ftwitter.com%2F` +
        //             json.user.screen_name +
        //             `%2Fstatus%2F` +
        //             json.id_str +
        //             `&widget=Tweet`;

        const url = `https://publish.twitter.com/?query=https%3A%2F%2Ftwitter.com%2F` +
                    json[i].user.screen_name +
                    `%2Fstatus%2` +
                    json[i].tweet_id +
                    `&widget=Video`;

                    console.log(url);

        
        
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
          await page.waitForSelector(selector, { timeout: 5000 }, (e) => {
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

        }
        catch (err) {
          if (err.name === 'TimeoutError') {
            console.error(`Timeout reached while waiting for the <code> element for tweets_${pageNum}, item ${i}`);
          } else {
            console.error('Error:', err);
          }
        }
        finally {
          // Close the browser
          await browser.close();
        }

        if (htmlContent !== "") {
          const regExScriptTags = /&lt;script.*/g;
          const regExBlockquoteOpen = /&lt;.*t"&gt;/g;
          const regExBlockquoteClose = /&lt;\/blockquote&gt;/g;
          const regExOpenBracket = /&lt;/g;
          const regExCloseBracket = /&gt;/g;
  
  
          htmlContent = htmlContent.replace(regExScriptTags, "");
          htmlContent = htmlContent.replace(regExBlockquoteOpen, "");
          htmlContent = htmlContent.replace(regExBlockquoteClose, "");
          htmlContent = htmlContent.replace(regExOpenBracket, "<");
          htmlContent = htmlContent.replace(regExCloseBracket, ">");
  
          const regExScriptTags_2 = /<script.*/g;
  
          htmlContent= htmlContent.replace(regExScriptTags_2, "");
  
          newJson.video_html = htmlContent;
  
          console.log(`New video for tweets_${pageNum}, item ${i}`);
        }

      }
      
      const str = JSON.stringify(newJson, null, 2);  

      // Write the Tweet to a file
      
      fs.appendFile(`./updated_tweets2/tweets_${pageNum}.json`, str, error => {
        if (error) {
          console.error("appendFile Error : ", error);
          i = len;
        }
        else {
          i++;
        }
      });
    }

    pageNum++;

  }

}

// Example usage
const websiteUrl = 'https://example.com';
scrape_website(websiteUrl)
  .then((html) => {
    console.log(html);
  })
  .catch((error) => {
    console.error('Error:', error);
  });
