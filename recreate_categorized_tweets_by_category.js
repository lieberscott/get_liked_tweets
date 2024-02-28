const fs = require('fs');


const categoriesArr = [
  'antiSemitism',
  'defendingIsrael',
  'hostageStories',
  'dayAfterProtests',
  'tearingDownPosters',
  'muslimsTaughtToHateJews',
  'muslimViolence',
  'NoGazanIsInnocent',
  'Skip',
  'israelAndJewsAreAlone',
  'israeliFallenSoldiersStories',
  'oct7testimonies',
  'oct7fallen',
  'gazaSickCultureOfHate',
  'rhetoricalGames',
  'heroicStories',
  'israelVsDEI',
  'hamasInTheirOwnWordsAndHamasEvil',
  'israeliMilitaryVictories',
  'theNewNazis',
  'counteringAntiIsraelCliches',
  'gazanDoctorsAndJournalists',
  'proPalestineViolenceIntimidation',
  'proPalestineSupportsViolenceAndHamas',
  'muslimsAgainstHamas',
  'antiIsraelTwitterLies',
  'internationalLaw',
  'blamingIsraelLies',
  'proPalestineHypocrisy',
  'israelsImpossibleSituationAndDoubleStandards',
  'israelInversionStrategy',
  'realTimeHolocaustDenial',
  'unrwa',
  'unitedNationsJournalistsNGOs',
  'gazaTeachesKidsHateAndViolence',
  'antiIsraelProtestorTruthBombs',
  'historyOfConflict',
  'iransRole',
  'cryBullies',
  'proIsrael Pro-Zionism',
  'genocideCliche',
  'stupidProtestors',
  'houthis',
  'apartheid',
  'israeliSpirit',
  'theWestHasFallen',
  'noPalestinianState',
  'whyTheLeftHatesIsrael',
  'palestineWasARealPlaceLie',
  'xNonIsrael',
  'deathTollLie',
  'hamasWarCrimes',
  'deadBabiesHypocrisy',
  'israelTriedforPeace',
  'ethnicCleansingInversion',
  'mediaBias',
  'antiIsraelJewsCounterarguments',
  'hamasLies',
  'colonizersLie',
  'itsNotAboutIsraeliMistreatment',
  'gallowsHumor',
  'proPalestineLies',
  'movingProIsraelSpeeches',
  'antiSemitismInversion',
  'ceasefireGame',
  'theWestOnlyPerpetuatingTheViolence',
  'theyreFullOfHate',
  'proIsraelProZionism',
  'openAirPrison',
  'noMoralEquivalence',
  'solutions',
  'palestiniansOnlyHaveThemselvesToBlame',
  'qHamas',
  'oneStateSolutionGame',
  'americanFundedViolence',
  'noMoralEquivalence ',
  'theWestOnlyPerepetuatingTheViolence',
  'alAlhiHospitalBombing',
  'outrageousAccusations',
  'novaInversion',
  'harvesingOragansLibel',
  'palestiniansWelcomedJewsLie',
  'everythingIsAnIsraeliLie',
  'alShifaHospital',
  'israeliMilitaryMorality',
  'hideFacesLikeKlan',
  'israelSupporters'
]

let categoriesLen = categoriesArr.length;


fs.readdir("./second_round/5_categorized_tweets_by_page_num", async (err, files) => {
  if (err) {
    console.log("err : ", err);
  }

  for (let i = 0; i < categoriesLen; i++) {
    let currentCategory = categoriesArr[i];
    let newArr = [];
    files.forEach(file => {
  
      const data = fs.readFileSync(`./second_round/5_categorized_tweets_by_page_num/${file}`);
      const str = data.toString();
  
      const json = JSON.parse(str);
  
      const len = json.length;
  
      for (let j = 0; j < len; j++) {
        if (json[j].category === currentCategory) {
          newArr.push(json[j]);
        }
      }
    });
    
    const newStr = JSON.stringify(newArr, null, 2);

    fs.writeFileSync(`./second_round/5_z2_categorized_tweets_by_category/${currentCategory}.json`, newStr, (err) => {
      if (err) {
        console.log("error : ", err);
      }
      else {
        console.log("finished : ");
      }
    })

  }

});