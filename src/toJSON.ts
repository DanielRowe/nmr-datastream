import { cowList } from './deciferDatastream/cowInformation';
import statementInformation from './deciferDatastream/statementInformation';
import { lactationsList as lactationInformation } from './deciferDatastream/lactationInformation';
import bullList from './deciferDatastream/bullList';
import deadDams from './deciferDatastream/deadDams';
import herdInformation from './deciferDatastream/herdInformation';
import herdRecordings from './deciferDatastream/herdRecordings';
import cowListComplete from './cowListComplete';

export const toJSON = (datastream: string, outputCowListComplete: boolean = false) => {
  const output : any = {};

  output.herdInformation = herdInformation(datastream);
  output.herdRecordings = herdRecordings(datastream);

  // Depending on user choice add cows and relevant info
  if (outputCowListComplete) {
    output.cows = cowListComplete(datastream);
  } else {
    output.cows = cowList(datastream);
    output.statementInformation = statementInformation(datastream);
    output.lactations = lactationInformation(datastream);
  }

  // If the file contains bull information - we can add it
  const bullInfoStart = datastream.indexOf('B1');

  if (bullInfoStart !== -1) {
    output.bulls = bullList(datastream);
  }

  // If the file contains dead dams - add it!
  const deadDamInfoStart = datastream.indexOf('D1');

  if (deadDamInfoStart !== -1) {
    output.deadDams = deadDams(datastream);
  }

  return output;
};

export default toJSON;
