const fs = require('fs');


fs.readdir("./5_categorized_tweets_by_category", async (err, files) => {
  let newStr = "";
  files.forEach(file => {
    const data = fs.readFileSync(`./5_categorized_tweets_by_category/${file}`);
    const str = data.toString();
    newStr = "[" + str + "]";
    fs.writeFileSync(`./5_categorized_tweets_by_category_2/${file}.json`, newStr, (err) => {
      if (err) {
        console.log("error : ", err);
      }
      else {
        console.log("finished : ", file);
      }
    })
  });
});