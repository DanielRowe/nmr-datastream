import fs from 'fs/promises';
import 'jest-extended';
import lactationInformation from '../../src/deciferDatastream/lactationInformation';

let datastream = '';

beforeAll(async () => {
  datastream = await fs.readFile('./__Tests__/information/DSMEMBER.DAT', 'utf8');

  return datastream;
});

test('Returns an array containing lactation information', () => {
  expect(lactationInformation(datastream)).toBeArray();
});

test('Each statement should have cow information', () => {
  const data = lactationInformation(datastream);
  expect(data).toEqual(
    expect.arrayContaining([
      expect.toContainKeys(['lineNumber', 'calvingDate', 'lactationNumber']),
    ]),
  );
});

test('First cow should match some expected results', () => {
  const data = lactationInformation(datastream);

  expect(data[0].calves).toEqual(
    expect.toBeArray(),
  );

  expect(data[0].sireID).toEqual('134528821');

  expect(data[0].ageAtCalving).toEqual(27);

  expect(data[0].qualifyingLactation).toBeObject();
});

test('Throws exception to a random data string', () => {
  function randomString() {
    lactationInformation('abcdefghijk');
  }

  expect(randomString).toThrow();
});

test('Throws exception to invalid lactation information string', () => {
  function invalidString() {
    lactationInformation('L1,a,b,c,HD,B1,');
  }

  expect(invalidString).toThrow();
});

test('Throws exception when lactation information cannot be found', () => {
  function invalidString() {
    lactationInformation('L0,L1');
  }

  expect(invalidString).toThrow('No lactation information found');
});
