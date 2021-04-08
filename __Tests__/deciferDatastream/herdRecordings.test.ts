import fs from 'fs/promises';
import 'jest-extended';
import herdRecordings from '../../src/deciferDatastream/herdRecordings';

let datastream = '';

beforeAll(async () => {
  datastream = await fs.readFile('./__Tests__/information/DSMEMBER.DAT', 'utf8');

  return datastream;
});

test('Returns an array containing herd recordings', () => {
  expect(herdRecordings(datastream)).toBeArray();
});

test('Each recording should have expected types within the object', () => {
  const data = herdRecordings(datastream);
  expect(data).toEqual(
    expect.arrayContaining([
      expect.toContainKeys([
        'date',
        'totalAnimals',
        'cowsInMilk',
        'cowsIn3xMilk',
        'totalWeightOfMilk',
        'totalWeightOfFat',
        'totalWeightOfProtein',
        'totalWeightOfLactose',
        'differenceReason',
        'numberMissedWeights',
        'printEligible',
        'bulkYield',
        'bulkFatPercentage',
        'bulkProteinPercentage',
        'bulkLactosePercentage',
        'herdProductionBase',
        'bulkSCC',
      ]),
    ]),
  );
});

test('First recording should have expected values', () => {
  const data = herdRecordings(datastream);
  expect(data[0]).toEqual(
    expect.toContainEntries([['bulkYield', 3311], ['totalAnimals', 183], ['cowsInMilk', 144], ['date', new Date('2006-11-23T00:00:00.000Z')]]),
  );
});

test('Throws exception to a random data string', () => {
  function randomString() {
    herdRecordings('abcdefghijk');
  }

  expect(randomString).toThrow();
});

test('Throws exception when no HD record found', () => {
  function randomString() {
    herdRecordings('C1, S0, L1');
  }

  expect(randomString).toThrow('No herd records found');
});

test('Throws exception to invalid herd information string', () => {
  function invalidString() {
    herdRecordings('HD,a,b,c,HD,C1');
  }
  expect(invalidString).toThrow();
});
