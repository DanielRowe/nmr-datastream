/* Move / split as follows... 

- Open Datastream(path) return: string - opens data stream and can extract if exe format.
-------
Utils: 
- toDate()
- breedCodeToText()
- breedCodeToBCMS()
-------
Basic Functions:
- herdInformation
- herdRecordings
- cowList (datastream, onFarm: bool <optional>, enteredAfter: date <optional>, dateOfBirth: <optional>, breed: <optional>, youngstock: bool <optional>)
- statementInformation (datastream, afterDate:)
- services
- samples
- healthEvents
- otherEvents
- calvings
- currentLactationInformation
- lactationList (datastream, )
- bullList(datastream, )
- deadDamList()
- cowListComplete()
- toJSON() - Returns ALL information in one object output
- findCowInformation(datastream, cowID, )
*/

const herd = {};
herd.recordings = [];
const cows = [];

const toDate = (string) => {
  const splitDate = /(\d\d)(\d\d)(\d\d)/g.exec(string); // Split date into capture groups.
  // If we're post 80 on the date then make it in the year 2000 - Not entirely future proof -
  // this will need fixing in approx 60 years time..  But that's just the issue with short dates.
  const formDate = `${((splitDate[1] < 80) ? '20' : '19') + splitDate[1]}-${splitDate[2]}-${splitDate[3]}`;
  const d = new Date(formDate);
  return d;
}

const IDTypeLookup = {
  "0": "Animal Has No ID",
  "1": "Herdbook Number",
  "2": "Eartag Number",
  "3": "AI Sire Code",
  "4": "Line Number",
  "5": "Invalid",
  "6": "Missing",
  "7": "Beef"
};

const pedigreeStatusLookup = {
  "0": "Unknown",
  "1": "Pedigree",
  "2": "Non-Pedigree",
  "5": "Hybrid",
  "A": "Grading Up",
  "B": "Grading Up",
  "C": "Grading Up",
  "D": "Grading Up",
};

const ptaSource = {
  "00": "No PTA",
  "01": "Holstein / Friesian",
  "02": "Shorthorn",
  "03": "Ayrshire",
  "04": "Jersey",
  "05": "Guernsey",
  "06": "Island of Jersey",
  "07": "Island of Guernsey",
  "97": "Estimated",
  "98": "Foreign Proof - Indirectly Converted",
  "99": "Foreign Proof - Directly Converted",
}

fs.readFile('./DSMEMBER.DAT','utf8',(err, data) => {
  if(err) {
    throw new Error(err);
  }

  // First find the break points in the datastream of different types of data.
  const cattleInfoStart = data.indexOf("C1");
  const statementInfoStart = data.indexOf("S0");
  const lactationInfoStart = data.indexOf("L0");
  const bullInfoStart = data.indexOf("B1");
  const deadDamInfoStart = data.indexOf("D1");

  // We'll start by sorting out any herd information... 
  // Ignore any data at cattle info start, then split by HD to array
  let herdInfo = data.substring(0, cattleInfoStart).split('HD,');
  // Do something with H0 to H8 - contains farm info.
  herdInfo.shift();
  herdInfo.map((info) => {
    // Break down array of info by easy to refer to name.
    const [ 
      recordingDate, //YYMMDD
      , // recordingSeq
      , // blank
      totalAnimals,
      cowsInMilk,
      cowsIn3xMilk, // Don't think this is in use.
      herdWOM, // Total amount of milk // DDDDD.D
      herdWOF, // Total fat kg DDD.DDDD
      herdWOP, // Total protein kg DDD.DDDD
      herdWOL, // Total lactose (as above)
      diffCode,
      missedWeight,
      printEligible,
      , // blank
      , // Line end / HE row.
      bulkYield,
      bulkFatPercentage,
      bulkProteinPercentage,
      bulkLactosePercentage,
      herdProductionBase,
      , // blank
      , // blank
      averageSCC
    ] = info.split(',');
    const differenceCodes = {
      "0": "",
      "1": "No Sample Taken",
      "2": "Yields Missing",
      "3": "Not received in lab",
      "4": "No Sample Taken",
      "5": "Spilt",
      "6": "Spoilt / Sour",
      "7": "Sediment",
    };
    herd.recordings.push({
      date: toDate(recordingDate),
      totalAnimals: parseInt(totalAnimals, 10),
      cowsInMilk: parseInt(cowsInMilk, 10),
      cowsIn3xMilk: parseInt(cowsIn3xMilk, 10),
      totalWeightOfMilk: (parseInt(herdWOM, 10) / 10), // Add decimal point
      totalWeightOfFat: (parseInt(herdWOF, 10) / 10000), // Correct decimal placing
      totalWeightOfProtein: (parseInt(herdWOP, 10) / 10000), // Correct decimal placing
      totalWeightOfLactose: (parseInt(herdWOL, 10) / 10000), // Correct decimal placing
      differenceReason: differenceCodes[diffCode], // Why difference between calculated and bulk yield
      numberMissedWeights: parseInt(missedWeight),
      printEligible: (printEligible === 0 || printEligible === " "),
      bulkYield: parseInt(bulkYield, 10),
      bulkFatPercentage: (parseInt(bulkFatPercentage, 10) / 100),
      bulkProteinPercentage: (parseInt(bulkProteinPercentage, 10) / 100),
      bulkLactosePercentage: (parseInt(bulkLactosePercentage, 10) /100),
      herdProductionBase: parseInt(herdProductionBase, 10),
      bulkSCC: parseInt(averageSCC, 10)
    });
  });

  let cowInfo = data.substring(cattleInfoStart, statementInfoStart).split('C1,');
  cowInfo.shift(); // First value is always blank - ignore it.

  cowInfo.map((cow) => {
    const [
      , // Region number - not sure it's needed.
      producerNumber,
      herdCode,
      liveFlag, //0 = Alive, 1-9 = sold / dead. Means same cow can use same line number... such fun.
      lineNumber,
      breedCode,
      identityNumber, // Ear tag or herdbook number
      IDType, //0 = animal has no id, 1 = pedigree no, 2 = eartag no, 3 = ai no (sires only), 4 = line no, 5 = invalid, 6 = missing, 7 = beef.
      pedigreeStatus, // 0 = unknown, 1 = pedigree, 2 = non-pedigree, 5 = hybrid, A-D = grading up class, J-T = Sup. register
      genuineIdentity, // 0 = authentic, 1 = not
      genuineEmn, // Unknown,
      , // Blank
      , // Line 2 Start
      breedCode2, 
      alternateIDNumber,
      dateOfBirth,
      isYoungstock, // 0 = cow
      dateEnteredHerd, 
      dateLeftHerd, 
      reasonLeftHerd, //0 = in herd, 1 = dead, 2 = sold, 4 = ceased recording
      classChange, // Date of change of pedigree class,
      , // blank
      , // line 3 start
      shortName, // 20 chars
      longName, // 40 chars
      , // blank
      , // line 4 start
      sireBreed, 
      sireIdentity, 
      sireIDType, // Same as animal id type.
      , // blank filler
      damBreed, 
      damIdentity,
      damIdentityType,
      damPedigreeStatus, 
      damGenuineIdentity, 
      , // blank
      , // line 5 start
      evalGroup,
      evalSrc,
      evalDate,
      PTAMilk, // +/- DDDD
      PTAFatKG, // +/- DDD.D
      PTAProteinKG, // as above
      PTAFatPercentage, // +/- DD.DD
      PTAProteinPercentage, // as above.
      PTAReliability
    ] = cow.split(',');
    leftHerdReason = {
      "0": "In Herd",
      "1": "Died",
      "2": "Sold",
      "4": "Ceased Recording"
    };
    cows.push({
      producerNumber: parseInt(producerNumber, 10),
      herdCode: parseInt(herdCode),
      lineNumber: parseInt(lineNumber, 10),
      DSIdentifier: `${lineNumber}|${liveFlag}`, // If this is a historic cow it means we can find it easier to push data to where there is no ear tag later.
      breedCode,
      otherBreedCode: breedCode2,
      identityNumber: identityNumber.trim(),
      IDType: IDTypeLookup[IDType],
      alternateIDNumber,
      pedigreeStatus: pedigreeStatusLookup[pedigreeStatus],
      pedigreeClassChangeDate: (classChange !== "000000") ? toDate(classChange) : null,
      genuineIdentity: (genuineIdentity === "0"),
      shortName: shortName.trim(),
      longName: longName.trim(),
      isYoungstock: (isYoungstock === "1"),
      dateOfBirth: toDate(dateOfBirth),
      dateEnteredHerd: (dateEnteredHerd !== "000000") ? toDate(dateEnteredHerd) : null,
      dateLeftHerd: (dateLeftHerd !== "000000") ? toDate(dateLeftHerd) : null,
      inHerd: (dateLeftHerd === "000000"), 
      leftHerd: (dateLeftHerd !== "000000") ? {
        date: toDate(dateLeftHerd), 
        reason: leftHerdReason[reasonLeftHerd]
      } : '',
      sireInformation: {
        breed: sireBreed,
        identity: sireIdentity.trim(),
        IDType: IDTypeLookup[sireIDType]
      },
      damInformation: {
        breed: damBreed,
        identity: damIdentity.trim(),
        IDType: IDTypeLookup[damIdentityType],
        pedigreeStatus: pedigreeStatusLookup[damPedigreeStatus],
        genuineIdentity: (damGenuineIdentity === "0")
      },
      PTA: {
        evaluationGroup: ptaSource[evalGroup],
        evaluationSource: ptaSource[evalSrc],
        evaluationDate: (evalDate !== "000000") ? toDate(evalDate) : null,
        reliability: parseInt(PTAReliability, 10),
        milkKG: parseInt(PTAMilk, 10),
        fatKG: (parseInt(PTAFatKG) / 10),
        proteinKG: (parseInt(PTAProteinKG) / 10),
        fatPercentage: (parseInt(PTAFatPercentage) / 100),
        proteinPercentage: (parseInt(PTAProteinPercentage) / 100),
      },
      milkSampling: [],
      lactations: [],
      services: [],
      otherEvents: [],
      calvings: []
    })
  });


  // STATEMENT INFORMATION
  let statementInfo = data.substring(statementInfoStart, lactationInfoStart).split('S1,');
  statementInfo.shift(); // First value is always blank - skip.

  statementInfo.map((info) => {
    const prependOne = '1,'+info; // Adds a 1 to the first line - means we can latter identify type in switch.
    const rows = prependOne.split('S'); // Split down the rows.
    let cow = {};
    rows.map((row) => {
      let statement = row.split(','); // Split the values in the array by comma.
      // How we can use the data depends on it's type. Switch statement should help here.
      switch(statement[0]) {
        case "1":  // Cow information
          let [ 
          , // 1 / Row identifier 
          liveFlag, 
          lineNumber, 
          youngstock, //0 = false 1 = true 
          breedCode,
          lactationNumber, // 1-25 or 81-99 if not recorded entire life
          estLactationNumber, // Only if 81-99
          managementGroup, 
          complete305, // 0 = on going, 1 = assumed end, 2 = 
          previousCalvingDate,
          sireBreed, // Breed of the sire of the calf that started the lactation
          sireIdentity, // Identity of sire above
          sireIdentityType, 
          sireNonAuthenticIdentity, // 1 indicates non authentic identity of sire
          dryDays, // Days dry between last lactation and current.
          ] = statement;
          cow.DSIdentifier = `${lineNumber}|${liveFlag}`;
          break;
        case "2":  // Not in use
          // NMR use only - no data provided to build spec
          break;
        case "3":  // Sampling information
          let [
            , // Row identifier
            recordingDate,
            recordingEstimatedRemark, // 0 = false, 1 = fat / prot / lact estimated, 2 = full est (absent), 3 = full est (sick)
            timesMilked, // 1, 2 or 3
            noSampleReason, // 0 = no sample, 1 = Spilt, 2 = sour, 3 = Dirty, 4 = Abnormal
            milkYield, //DDD.D
            butterfatPercentage, //DD.DD
            proteinPercentage, // as above
            lactosePercentage, // as above
            , // blank
            scc
          ] = statement;
          const estimatedRemark = {
            "0": false,
            "1": "Fat / Protein / Lactose Estimated",
            "2": "Full Estimate (Absent)",
            "3": "Full Estimate (Sick)"
          }
          const noSampleLookup = {
            " ": false,
            "0": "No Sample",
            "1": "Spilt",
            "2": "Sour", 
            "3": "Dirty",
            "4": "Abnormal"
          }
          // Push this information to the original cow.
          cows.find(x => x.DSIdentifier === cow.DSIdentifier).milkSampling.push({
            date: toDate(recordingDate),
            timesMilked: parseInt(timesMilked, 10),
            milkYield: (parseInt(milkYield, 10) / 10),
            butterfatPercentage: (parseInt(butterfatPercentage, 10) / 100),
            proteinPercentage: (parseInt(proteinPercentage, 10) / 100),
            lactosePercentage: (parseInt(lactosePercentage, 10) / 100),
            scc: parseInt(scc, 10), 
            estimatedRemark: estimatedRemark[recordingEstimatedRemark],
            noSample: noSampleLookup[noSampleReason]
          });
          break;
        case '4':  // Service information
          let [
            , // row identifier
            serviceDate,
            authenticService, // 0 = yes, 1 = no
            serviceSireBreed,
            serviceSireIdentity, 
            serviceSireIdType,
            serviceSireAuthentic,
            pdStatus // 0 = Not diagnosed, 1 = not pregnant, 2 = Pregnant
          ] = statement;
          const pdStatusLookup = {
            "0": "Not Diagnosed",
            "1": "Not Pregnant",
            "2": "Pregnant"
          }
          // Push to the cows information
          cows.find(x => x.DSIdentifier === cow.DSIdentifier).services.push({
            date: toDate(serviceDate),
            authenticService: (authenticService === 0),
            sireBreed: serviceSireBreed,
            sireIdentity: serviceSireIdentity.trim(),
            sireIDType: IDTypeLookup[serviceSireIdType],
            authenticSire: (serviceSireAuthentic === 0),
            pdStatus: pdStatusLookup[pdStatus]
          })
          break;
        case "5": // Calving
          let [
            , // row identifier
            calvingDate,
            authenticCalving, // 0 = yes, 1 = no
            calvingFiller,
            calf1Breed,
            calf1Identity,
            calf1IdentityType,
            calf1IdentityAuthentic,
            calf1Sex,
            calf2Breed,
            calf2Identity,
            calf2IdentityType,
            calf2IdentityAuthentic,
            calf2Sex
          ] = statement;
          break;
        case "6":  // Third calf
          // Here we must find the last row to attach to the calving date.
          let [
            , // row identifier
            calf3Breed,
            calf3Identity,
            calf3IdentityType,
            calf3IdentityAuthentic,
            calf3Sex
          ] = statement;
          break;
        case "7":  // Date of assumed calving
          let [ 
            , // row identifier 
            assumedCalvingDate
          ] = statement;
          break;
        case "8": // No sample
        case "9": // Assumed 1x milking
        case "A": // 1x a day milking
        case "B": // Assumed dry
        case "C": // Dry
        case "D": // Suckling
        case "E": // Absent
        case "F": // Barren
        case "G": // Abort
        case "H": // Sick
        case "I": // Lame
        case "J": // Mastitis
        case "K": // Dead
        case "L": // Sold in previous herd
        case "M": // Sold
          const eventDescription = {
            "8": "No sample", 
            "9": "Assumed 1x Milking",
            "A": "1x A Day Milking",
            "B": "Assumed Dry",
            "C": "Dry",
            "D": "Sucking",
            "E": "Absent",
            "F": "Barren",
            "G": "Abortion",
            "H": "Sick",
            "I": "Lameness",
            "J": "Mastitis",
            "K": "Dead",
            "L": "Sold In Previous Herd",
            "M": "Sold",
          }
          let [
            eventKey,
            eventDate,
            authenticEvent // 0 = true, 1 = false
          ] = statement;
          cows.find(x => x.DSIdentifier === cow.DSIdentifier).otherEvents.push({
            date: toDate(eventDate),
            eventType: eventDescription[eventKey],
            authenticEvent: (authenticEvent === 0)
          })
          break;
        case "X": // Current lactation info
          let [
            , // Row identifier - X
            lactationDays, //DDD.D
            totalMilkKG, //DDDDD.D
            totalFatKG,  //DDDD.DD
            totalProteinKG, // as above
            totalLactoseKG, // as above
            totalFatPercentage, // DD.DD
            totalProteinPercentage, // as above
            totalLactosePercentage, // as above
            totalValue, // total value of the milk
            averagePPL,
            seasonalityApplied,
            averageSCC, // DDDD (x10^3)
          ] = statement;
          break;
        case "Z":
          // NMR only / Not in use.
          break;
      }
    })
  })
})
