/*




*/

const str =
'<blockquote class="twitter-tweet" data-media-max-width="560"><p lang="en" dir="ltr">The scene at Hillcrest High School in Queens as a Jewish teacher hid in her locked office for hours while students demanded she be fired for attending a pro-Israel rally. <a href="https://t.co/jzVCEofvJS">pic.twitter.com/jzVCEofvJS</a></p>&mdash; Steve McGuire (@sfmcguire79) <a href="https://twitter.com/sfmcguire79/status/1728470315850780964?ref_src=twsrc%5Etfw">November 25, 2023</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>'





const newStr = str.split('"').join("'").replace(/<script.*/, "");

console.log("newStr : ", newStr);