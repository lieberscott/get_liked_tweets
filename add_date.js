/*
* Add date as a date (instead of just a string)
*
*
*
*
*/


const fs = require("fs");

const add_date = async (pageNum) => {

  const original_data = fs.readFileSync(`./second_round/5_z2_categorized_tweets_by_category/tweets_${pageNum}.json`);
  const original_json = JSON.parse(original_data);
  const original_len = original_json.length;

  const newArr = [];

  for (let i = 0; i < original_len; i++) {
    const newObj = {...original_json[i]};

		newObj.created_at_date = new Date(newObj.created_at) - i; // -i because some dates are identical (somehow), so this creates an order for when I do Mongoose searches


    newArr.push(newObj);

  }

  const str = JSON.stringify(newArr, null, 2);

  fs.writeFileSync(`./second_round/5_z1_categorized_tweets_by_page_num/tweets_${pageNum}.json`, str, (err) => {
    if (err) {
      console.log("error : ", err);
    }
    else {
      console.log("finished : ", pageNum);
    }
  })

}

let pageNum = 0;

while (pageNum < 46) {
  add_date(pageNum);
  console.log(`pageNum ${pageNum} done`);
  pageNum++;
	if (pageNum === 2) {
		pageNum = 25;
	}
}