/*




*/

const str =
'<blockquote class="twitter-tweet" data-conversation="none" data-media-max-width="560"><p lang="en" dir="ltr">There are no words - please stay there.<br>Israel&#39;s presentation at the<a href="https://twitter.com/CIJ_ICJ?ref_src=twsrc%5Etfw">@CIJ_ICJ</a><a href="https://t.co/qjVHFNDmC5">https://t.co/qjVHFNDmC5</a>… <a href="https://t.co/qjVHFNDmC5">https://t.co/qjVHFNDmC5</a></p>&mdash; CañadaRecord 🌖 (@CanadaRecord) <a href="https://twitter.com/CanadaRecord/status/1760093558478917814?ref_src=twsrc%5Etfw">February 21, 2024</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>'







const newStr = str.split('"').join("'").replace(/<script.*/, "");

console.log("newStr : ", newStr);