const fs = require('fs');

const categories = [
  { category: "hostages", subcategories: ["hostageStories"] },
  { category: "oct7", subcategories: ["oct7fallen", "oct7testimonies", "heroicStories"]},
  { category: "fallen_soldiers", subcategories: ["israeliFallenSoldiersStories"]},
  { category: "hamas_evil", subcategories: ["gazaSickCultureOfHate", "gazaTeachesKidsHateAndViolence", "hamasInTheirOwnWordsAndHamasEvil", "hamasWarCrimes", "houthis", "noGazanIsInnocent", "noPalestinianState", "palestiniansOnlyHaveThemselvesToBlame", "hamasLies", "hideFacesLikeKlan", "proPalestineSupportsViolenceAndHamas", "proPalestineViolenceIntimidation", "stupidProtestors", "tearingDownPosters", "antiSemitism", "dayAfterProtests", "theNewNazis", "theyreFullOfHate", "harvestingOrgansLibel", "oneStateSolutionGame"] },
  { category: "pro_palestine_lies", subcategories: ["antiIsraelTwitterLies", "itsNotAboutIsraeliMistreatment", "palestineWasARealPlaceLie", "palestiniansWelcomedJewsLie", "proPalestineLies", "apartheid", "colonizersLie", "counteringAntiIsraelCliches", "ethnicCleansingInversion", "genocideCliche", "israelInversionStrategy", "antiIsraelJewsCounterarguments", "alAlhiHospitalBombing", "alShifaHospital", "blamingIsraelLies", "deathTollLie", "gazanDoctorsAndJournalists", "internationalLaw"]},
  { category: "moving_pro_israel_speeches", subcategories: ["movingProIsraelSpeeches"]}
]



const categoriesLen = categories.length;

const createHomepageImages = () => {
for (let i = 0; i < categoriesLen; i++) {
  const category = categories[i].category;
  const subCategoriesArr = categories[i].subcategories;
  const subCategoriesArrLen = subCategoriesArr.length;

  let newStr = "";
  const newArr = [];

  // console.log(`subCategoriesArrLen :`, subCategoriesArrLen);

  for (let j = 0; j < subCategoriesArrLen; j++) {

    const data = fs.readFileSync(`./5_categorized_tweets_by_category/${subCategoriesArr[j]}.json`);

    let str = data.toString();

    if (str[0] === ",") {
      newStr = str.substring(1); 
      newStr = "[" + newStr + "]";
    }
    else {
      newStr = "[" + str + "]";
    }

    const json = JSON.parse(newStr);
    const len = json.length;

    for (let k = 0; k < len; k++) {
      newArr.push(json[k]);
    }
    // console.log(`${subCategoriesArr[j]} : ${count} images counted`)
  }

  console.log(`FINISHED ${category}`);


  const newStr2 = JSON.stringify(newArr, null, 2);
    fs.writeFileSync(`./6_z1_tweets_for_category_page/${category}.json`, newStr2, (err) => {
      if (err) {
        console.log("error : ", err);
      }
      else {
        console.log(`FINISHED ${category}: ${newArr.length} total tweets`);
      }
    })

  }
}

makeNewCategories = () => {
  let newArr = [];
  for (let i = 0; i < categories.length; i++) {
    const category = Object.keys(categories[i]);
    const subCategoriesArr = categories[i][category[0]];
    const subCategoriesArrLen = subCategoriesArr.length;

    const newObj = { category, subcategories: subCategoriesArr };
    newArr.push(newObj)

  }
console.log("newArr : ", newArr);
}


createHomepageImages();

// makeNewCategories