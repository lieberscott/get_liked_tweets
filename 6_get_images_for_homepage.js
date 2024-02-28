const fs = require('fs');


const categories = [
  { category: "hostages", subcategories: ["hostageStories"] },
  { category: "oct7", subcategories: ["oct7fallen", "oct7testimonies" /*, "survivorsStories" */]},
  { category: "fallen_soldiers", subcategories: ["israeliFallenSoldiersStories"]},
  { category: "hamas_evil", subcategories: ["gazaSickCultureOfHate", "gazaTeachesKidsHateAndViolence", "hamasInTheirOwnWordsAndHamasEvil", "hamasWarCrimes", "noGazanIsInnocent"] },
  { category: "muslimsTaughtToHateJews", subcategories: ["muslimsTaughtToHateJews", "muslimViolence"]},
  { category: "solutions", subcategories: ["solutions", "unrwa"]},
  { category: "unapologeticallyProIsrael", subcategories: ["unapologeticallyProIsrael", "proIsraelProZionism", "movingProIsraelSpeeches", "defendingIsrael", "heroicStories", "israeliMilitaryVictories", "israeliSpirit", "israelSupporters"]},
  { category: "endless_hypocrisy", subcategories: ["israelsImpossibleSituationAndDoubleStandards", "proPalestineHypocrisy"]},
  { category: "endless_lies", subcategories: ["alAlhiHospitalBombing", "alShifaHospital", "hamasLies", "antiIsraelTwitterLies", "openAirPrison", "proPalestineLies", "blamingIsraelLies", "deathTollLie", "gazanDoctorsAndJournalists", "deadBabiesHypocrisy", "palestineWasARealPlaceLie", "palestiniansWelcomedJewsLie"]},
  { category: "they_inverse_reality", subcategories: ["counteringAntiIsraelCliches", "ethnicCleansingInversion", "genocideCliche", "israelInversionStrategy", "apartheid", "colonizersLie", "settlerViolenceLie"]},
  { category: "theyre_full_of_hate", subcategories: ["proPalestineSupportsViolenceAndHamas", "proPalestineViolenceIntimidation", "antiIsraelProtestorTruthBombs", "theyreFullOfHate", "tearingDownPosters", "antiSemitism", "theNewNazis", "qHamas", "harvestingOrgansLibel", "realTimeHolocaustDenial"]},
  { category: "no_palestinian_state", subcategories: ["noPalestinianState", "palestiniansOnlyHaveThemselvesToBlame", "oneStateSolutionGame"]},
  { category: "gallows_humor", subcategories: ["stupidProtestors", "gallowsHumor"]},
  { category: "day_after_protests", subcategories: ["dayAfterProtests"]},
  { category: "israelAndJewsAreAlone", subcategories: ["unitedNationsJournalistsNGOs", "israelAndJewsAreAlone", "newJewishLeaders"]},
  { category: "itsNotAboutIsraeliMistreatment", subcategories: ["itsNotAboutIsraeliMistreatment"]},
  { category: "antiIsraelJewsCounterarguments", subcategories: ["antiIsraelJewsCounterarguments"]},
  { category: "internationalLaw", subcategories: ["internationalLaw"]},
  { category: "rhetoricalGames", subcategories: ["rhetoricalGames", "ceasefireGame"]},
  { category: "mediaBias", subcategories: ["mediaBias"]},
  { category: "historyOfConflict", subcategories: ["historyOfConflict", "israelTriedforPeace"]}
]

const mediaFilesArr = ["./first_round/5_categorized_tweets_by_category", "./second_round/5_categorized_tweets_by_category"]


const categoriesLen = categories.length;

const createHomepageImages = () => {
for (let i = 0; i < 7; i++) { // 7 because only the first 7 categories get images for the homepage
  const category = categories[i].category;
  const subCategoriesArr = categories[i].subcategories;
  const subCategoriesArrLen = subCategoriesArr.length;

  let newStr = "";
  let newArr = [];

  // console.log(`subCategoriesArrLen :`, subCategoriesArrLen);

  for (let j = 0; j < subCategoriesArrLen; j++) {

    const data = fs.readFileSync(`${mediaFilesArr[0]}/${subCategoriesArr[j]}.json`);

    let str = data.toString();

    const json = JSON.parse(str);
    const len = json.length;

    let count = 0;

    for (let k = 0; k < len; k++) {
      if (json[k].image_urls && json[k].image_urls.length) {
        count++;
        const img_url = json[k].image_urls[0].url;
        const index = k;
        const text = json[k].text
        newArr.push({ img_url, index, text });
      }
    }
  }

  // const existingData = fs.readFileSync(`home_images/${category}.json`);

  // let existingStr = existingData.toString();

  // const existingJson = JSON.parse(existingStr);

  // if (existingJson.length) {
  //   newArr = existingJson.concat(newArr);
  // }

  console.log(`FINISHED ${category}: ${newArr.length} total images`);


  const newStr2 = JSON.stringify(newArr, null, 2);
    fs.writeFileSync(`./home_images/${category}.json`, newStr2, (err) => {
      if (err) {
        console.log("error : ", err);
      }
      else {
        console.log(`FINISHED ${category}: ${newArr.length} total images`);
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