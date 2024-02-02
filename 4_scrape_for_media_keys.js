/*
* Step 4: Scrape for media_keys
*
*
*
*
*/


const { chromium } = require('playwright');
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
      let htmlContent = "";

      if (true) {

        // const url = getUrl(newJson.user.screen_name, newJson.tweet_id);

        // console.log(url);

        const url_vid = "https://publish.twitter.com/?query=https%3A%2F%2Ftwitter.com%2FJakeWSimons%2Fstatus%2F1750452284356546631&widget=Video";
        const url_img = "https://publish.twitter.com/?query=https%3A%2F%2Ftwitter.com%2FUN_Women%2Fstatus%2F1750277355736547830&widget=Video";

        htmlContent = await getMedia(url_img);

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

        console.log("htmlContent : ", htmlContent);
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


const getMedia = async (url) => {

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

    // &lt;blockquote class="twitter-tweet" data-media-max-width="560"&gt;&lt;p lang="en" dir="ltr"&gt;Is this real? October 7 Shawarma restaurant… Shall we talk about Jew-hatred in the Arab world now maybe? &lt;a href="https://t.co/KwnjFvgq5K"&gt;pic.twitter.com/KwnjFvgq5K&lt;/a&gt;&lt;/p&gt;&amp;mdash; Jake Wallis Simons (@JakeWSimons) &lt;a href="https://twitter.com/JakeWSimons/status/1750452284356546631?ref_src=twsrc%5Etfw"&gt;January 25, 2024&lt;/a&gt;&lt;/blockquote&gt;
    // <blockquote class="twitter-tweet" data-media-max-width="560"><p lang="en" dir="ltr">Women and girls in <a href="https://twitter.com/hashtag/Gaza?src=hash&amp;ref_src=twsrc%5Etfw">#Gaza</a> are deprived of safety, medicine, health care, and shelter.<br><br>They are deprived of hope and justice.<br><br>They face imminent starvation.<br><br>We call for an immediate humanitarian ceasefire and unhindered humanitarian access for Gaza.<a href="https://t.co/84dqctE9mV">https://t.co/84dqctE9mV</a> <a href="https://t.co/v7R0eG19fT">pic.twitter.com/v7R0eG19fT</a></p>&mdash; UN Women (@UN_Women) <a href="https://twitter.com/UN_Women/status/1750277355736547830?ref_src=twsrc%5Etfw">January 24, 2024</a></blockquote>
    // <blockquote class="twitter-tweet" data-media-max-width="560"><p lang="en" dir="ltr">Nada Hammouda, a PhD student at UT Southwestern Medical Center, posted on LinkedIn, “Zionism is a war on children: Child sex and organ trafficking for sadistic, pedophiliac pleasure as well as profit.” <a href="https://twitter.com/UTSWNews?ref_src=twsrc%5Etfw">@UTSWNews</a> <a href="https://t.co/mpw894yf18">https://t.co/mpw894yf18</a> <a href="https://t.co/LlTwl42bcC">pic.twitter.com/LlTwl42bcC</a></p>&mdash; Canary Mission (@canarymission) <a href="https://twitter.com/canarymission/status/1750284845488767348?ref_src=twsrc%5Etfw">January 24, 2024</a></blockquote> 


    const selector = 'code';
    await page.waitForSelector(selector, { timeout: 10000 }, (e) => {
      if (e) {
        console.log(`error for url ${url} : `, e);
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
      console.error(`Timeout reached while waiting for the [alt="Image] element for video`);
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
