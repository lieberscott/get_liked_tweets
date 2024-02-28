const fs = require('fs');


fs.readdir("./second_round/5_categorized_tweets_by_category", async (err, files) => {
  let newStr = "";
  files.forEach(file => {
    const data = fs.readFileSync(`./second_round/5_categorized_tweets_by_category/${file}`);
    let str = data.toString();
    if (str[0] === ",") {
      str = str.substring(1);
    }
    newStr = "[" + str + "]";
    fs.writeFileSync(`./second_round/5_z2_categorized_tweets_by_category/${file}`, newStr, (err) => {
      if (err) {
        console.log("error : ", err);
      }
      else {
        console.log("finished : ", file);
      }
    })
  });
});