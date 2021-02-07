/* eslint-disable no-undef */
import fs from 'fs/promises';
// eslint-disable-next-line import/no-extraneous-dependencies
import 'jest-extended';
import statementInformation from '../../src/deciferDatastream/statementInformation';

let datastream = '';

beforeAll(async () => {
  datastream = await fs.readFile('./__Tests__/information/DSMEMBER.DAT', 'utf8');

  return datastream;
});

test('Returns an array containing all sample information', () => {
  expect(statementInformation(datastream)).toBeArray();
});

test('Each statement should have cow information', () => {
  const data = statementInformation(datastream);
  expect(data).toEqual(
    expect.arrayContaining([
      expect.toContainKeys(['lineNumber', 'isYoungstock', 'lactationNumber']),
    ]),
  );
});

test('First cow should match expected sample results', () => {
  const data = statementInformation(datastream);

  expect(data[0].milkSamples).toEqual(
    expect.toBeArray(),
  );

  expect(data[0].milkSamples[0].milkYield).toEqual(42.2);

  expect(data[0].otherEvents[0].eventType).toEqual('Absent');

  expect(data[0].currentLactation).toBeObject();
});

test('Throws exception to a random data string', () => {
  function randomString() {
    statementInformation('abcdefghijk');
  }

  expect(randomString).toThrow();
});

test('Throws exception to invalid herd information string', () => {
  function invalidString() {
    statementInformation('S1,a,b,c,HD,L0,');
  }

  expect(invalidString).toThrow();
});
