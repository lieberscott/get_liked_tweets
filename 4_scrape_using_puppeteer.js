const express = require('express');
const puppeteer = require('puppeteer');
const fs = require("fs");

const app = express();
const port = 3000;




const get_media_keys = async () => {
  
//   const textFile = await fetch("./sampleTwitterApiResponse.json");
//   const json = await textFile.json();
  
//   const len = json.length;
  let counter = 0;
  let len = 1;
  
  
  while (counter < len) {
    counter++;


    // const browser = await puppeteer.launch();
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();

    // const url = `https://publish.twitter.com/?query=https%3A%2F%2Ftwitter.com%2F` +
    //             json.user.screen_name +
    //             `%2Fstatus%2Fstatus%2F` +
    //             json.id_str +
    //             `&widget=Tweet`;
    
    // const url = "https://publish.twitter.com/?query=https%3A%2F%2Ftwitter.com%2FTimesofIsrael%2Fstatus%2F1739762653734822044&widget=Tweet";
    // const url = "https://twitter.com/TimesofIsrael/status/1739762653734822044";
    const url = "https://twitter.com/IsraelMatzav/status/1750386570350461049";
    // const url = "https://publish.twitter.com/?query=https%3A%2F%2Ftwitter.com%2FIsraelMatzav%2Fstatus%2F1750386570350461049&widget=Video";
    
    await page.goto(url);

    console.log("part 4");
    // Wait for the page to load and execute JavaScript
    await page.waitForSelector('body'); // Change this selector to match the element you want to wait for

    
    
    console.log("part 5");
    let htmlContent = await page.content();

    // let htmlContent = await page.evaluate(() => {
    //   const targetElement = document.querySelector('#react-root');

    //   return targetElement ? targetElement.innerHTML : "hi";
    // });
    
    
    /*
     * Sample response:
       &lt;blockquote class="twitter-tweet"&gt;&lt;p lang="en" dir="ltr"&gt;Lt. Adar Ben Simon, 20: Commander ‘sacrificed her life like a hero’ &lt;a href="https://t.co/Bg5N5zirE5"&gt;https://t.co/Bg5N5zirE5&lt;/a&gt; . Click to read ⬇️&lt;/p&gt;&amp;mdash; The Times of Israel (@TimesofIsrael) &lt;a href="https://twitter.com/TimesofIsrael/status/1739762653734822044?ref_src=twsrc%5Etfw"&gt;December 26, 2023&lt;/a&gt;&lt;/blockquote&gt;
       &lt;script async src="https://platform.twitter.com/widgets.js" charset="utf-8"&gt;&lt;/script&gt;
    */


    // Close the browser
    await browser.close();


    /*
    *
    *
    * Need to do some regex work on the response
    * Get rid of the <blockquote> tags (which are actually &lt;blockquote&gt; as I'll explain below)
    * Get rid of the <script> tags
    * For some reason, the response is using these characters below for openBracket (<) and closeBracket (>)
    * So to convert it from &lt;p&gt; to <p>, I'll replace it here
    *
    *
    */

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
    
    console.log("htmlContent : ", htmlContent);

    

    // Write the Tweet to a file
    
    // fs.appendFile("tweetsToOrganize.txt", htmlContent + `\n`, error => {
    //   if (error) {
    //     console.error(error);
    //     return;
    //   }
    //   counter++;
    // });
    
  }
  
  
  // request.query.paramName <-- a querystring example
  // return reply.view("/src/pages/index.hbs");
}





// Testing api call
const get_analytics = async () => {
  
//   const textFile = await fetch("./sampleTwitterApiResponse.json");
//   const json = await textFile.json();
  
//   const len = json.length;
  let counter = 0;
  let len = 1;
  
  
  while (counter < len) {
    counter++;
    console.log("part 1");
    // Launch a headless browser
    // const browser = await puppeteer.launch();
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });

    console.log("part 2");
    // Create a new page
    const page = await browser.newPage();

    console.log("part 3");
    // Navigate to the website
    // await page.goto('https://twitter.com/smlieber84/likes');

    // const url = `https://publish.twitter.com/?query=https%3A%2F%2Ftwitter.com%2F` +
    //             json.user.screen_name +
    //             `%2Fstatus%2Fstatus%2F` +
    //             json.id_str +
    //             `&widget=Tweet`;
    
    // const url = "https://publish.twitter.com/?query=https%3A%2F%2Ftwitter.com%2FTimesofIsrael%2Fstatus%2F1739762653734822044&widget=Tweet";
    // const url = "https://twitter.com/TimesofIsrael/status/1739762653734822044";
    // const url = "https://twitter.com/HenMazzig/status/1747614220647116923";
    const url = "https://publish.twitter.com/?query=https%3A%2F%2Ftwitter.com%2FBriskerov%2Fstatus%2F1752332916405743745&widget=Tweet";
    
    await page.goto(url);

    console.log("part 4");
    
    // Wait for the page to load and execute JavaScript
     // Wait for the target elements to appear
  await page.waitForSelector('[data-testid="app-text-transition-container"]');

  // Wait for the target elements to appear
  await page.waitForSelector('.css-901oao.css-1hf3ou5.r-14j79pv.r-1qd0xha.r-1b43r93.r-b88u0q.r-1cwl3u0.r-13hce6t.r-bcqeeo.r-qvutc0');

  // Extract the inner HTML of the elements with the specified classes
  const innerHTMLArray = await page.evaluate(() => {
    const elements = document.querySelectorAll('.css-901oao.css-1hf3ou5.r-14j79pv.r-1qd0xha.r-1b43r93.r-b88u0q.r-1cwl3u0.r-13hce6t.r-bcqeeo.r-qvutc0');
    return Array.from(elements).map(element => element.innerHTML);
  });

  console.log(innerHTMLArray);
    
    /*
     * Sample response:
       &lt;blockquote class="twitter-tweet"&gt;&lt;p lang="en" dir="ltr"&gt;Lt. Adar Ben Simon, 20: Commander ‘sacrificed her life like a hero’ &lt;a href="https://t.co/Bg5N5zirE5"&gt;https://t.co/Bg5N5zirE5&lt;/a&gt; . Click to read ⬇️&lt;/p&gt;&amp;mdash; The Times of Israel (@TimesofIsrael) &lt;a href="https://twitter.com/TimesofIsrael/status/1739762653734822044?ref_src=twsrc%5Etfw"&gt;December 26, 2023&lt;/a&gt;&lt;/blockquote&gt;
       &lt;script async src="https://platform.twitter.com/widgets.js" charset="utf-8"&gt;&lt;/script&gt;
    */


    // Close the browser
    await browser.close();


    /*
    *
    *
    * Need to do some regex work on the response
    * Get rid of the <blockquote> tags (which are actually &lt;blockquote&gt; as I'll explain below)
    * Get rid of the <script> tags
    * For some reason, the response is using these characters below for openBracket (<) and closeBracket (>)
    * So to convert it from &lt;p&gt; to <p>, I'll replace it here
    *
    *
    */

    const regExScriptTags = /&lt;script.*/g;
    const regExBlockquoteOpen = /&lt;.*t"&gt;/g;
    const regExBlockquoteClose = /&lt;\/blockquote&gt;/g;
    const regExOpenBracket = /&lt;/g;
    const regExCloseBracket = /&gt;/g;


    // htmlContent = htmlContent.replace(regExScriptTags, "");
    // htmlContent = htmlContent.replace(regExBlockquoteOpen, "");
    // htmlContent = htmlContent.replace(regExBlockquoteClose, "");
    // htmlContent = htmlContent.replace(regExOpenBracket, "<");
    // htmlContent = htmlContent.replace(regExCloseBracket, ">");
    
    // console.log("htmlContent : ", htmlContent);

    
    
  }
  
  
  // request.query.paramName <-- a querystring example
  // return reply.view("/src/pages/index.hbs");
  return reply.json({ hello: true });
}


get_media_keys();