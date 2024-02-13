const fs = require('fs');


// const categories = [
//   {
//     defendingIsrael: [],
//     theWorstEvil: [],
//     survivorsVictimsHostagesFallen: [],
//     proPalestineLiesAndFalsehoods: [],
//     proPalestineRhetoricalGames: [],
//     proPalestineViolenceAndAnger: [],
//     history: [],
//     israelsImpossibleSituation: [],
//     antiIsraelJews: []
//   }
// ]

const categories = [
  { currentWarLies: ["alAlhiHospitalBombing", "alShifaHospital", "blamingIsraelLies", "deathTollLie", "gazanDoctorsAndJournalists", "novaInversion", "openAirPrison", "realTimeHolocaustDenial"] },
  { israeliSpirit: ["defendingIsrael", "gallowsHumor", "israelMilitaryMorality", "israelMilitaryVictories", "israeliSpirit", "muslimsAgainstHamas", "noMoralEquivalence", "proIsraelProZionism"] },
  { hamasPureEvil: ["gazaSickCultureOfHate", "gazaTeachesKidsHateAndViolence", "hamasInTheirOwnWordsAndHamasEvil", "hamasWarCrimes", "houthis", "noGazanIsInnocent", "noPalestinianState", "palestiniansOnlyHaveThemselvesToBlame"] },
  { hamasLies: ["hamasLies"] },
  { history: ["historyOfConflict", "internationalLaw", "iransRole"] },
  { soldiersHostagesAndHeros: ["hostageStories", "heroicStories", "israeliFallenSoldiersStories", "oct7fallen", "oct7testimonies"] },
  { israelInversionStrategy: ["apartheid", "colonizersLie", "counteringAntiIsraelCliches", "ethnicCleansingInversion", "genocideCliche", "israelInversionStrategy", "antiIsraelJewsCounterarguments"] },
  { israelsImpossibleSituation: ["israelAndJewsAreAlone", "israelsImpossibleSituationAndDoubleStandards", "israelVsDEI", "mediaBias", "theWestOnlyPerpetuatingTheViolence", "unitedNationsJournalistsNGOs", "unrwa"] },
  { movingProIsraelSpeeches: ["movingProIsraelSpeeches"] },
  { muslimAntiSemitism: ["muslimsTaughtToHateJews", "muslimViolence"] },
  { proPalestineLiesAndFalsehoods: ["antiIsraelTwitterLies", "itsNotAboutIsraeliMistreatment", "palestineWasARealPlaceLie", "palestiniansWelcomedJewsLie", "proPalestineLies"] },
  { proPalestineHypocrisy: ["deadBabiesHypocrisy", "proPalestineHypocrisy"] },
  { proPalestineRhetoricalGames: ['americanFundedViolence', "antiSemitismInversion", "ceasefireGame", "cryBullies", "everythingIsAnIsraeliLie", "harvestingOrgansLibel", "oneStateSolutionGame", "outrageousAccusations", "qHamas", "rhetoricalGames"] },
  { theNewNazis: ["antiIsraelProtestorTruthBombs", "antiSemitism", "dayAfterProtests", "hideFacesLikeKlan", "proPalestineSupportsViolenceAndHamas", "proPalestineViolenceIntimidation", "stupidProtestors", "tearingDownPosters", "theNewNazis", "theyreFullOfHate", "whyTheLeftHatesIsrael"] }
]



fs.readdir("./5_categorized_tweets_by_category", async (err, files) => {
  let newStr = "";
  files.forEach(file => {
    const data = fs.readFileSync(`./5_categorized_tweets_by_category/${file}`);
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

    const newArr = [];

    for (let i = 0; i < len; i++) {
      if (json[i].image_urls && json[i].image_urls.length) {
        const img_url = json[i].image_urls[0].url;
        const index = i;
        const text = json[i].text
        newArr.push({ img_url, index, text });
      }
    }

    const newStr2 = JSON.stringify(newArr, null, 2);
    fs.writeFileSync(`./6_images_for_homepage/${file}`, newStr2, (err) => {
      if (err) {
        console.log("error : ", err);
      }
      else {
        console.log("finished : ", file);
      }
    })
  });
});