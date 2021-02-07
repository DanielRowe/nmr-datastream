import fs from 'fs/promises';
import 'jest-extended';
import herdInformation from '../../src/deciferDatastream/herdInformation';

let datastream = '';

beforeAll(async () => {
  datastream = await fs.readFile('./__Tests__/information/DSMEMBER.DAT', 'utf8');

  return datastream;
});

test('Returns an object containing herd information', () => {
  expect(herdInformation(datastream)).toBeObject();
});

test('Herd information matches expected object', () => {
  expect(herdInformation(datastream)).toEqual(
    expect.toContainKeys(['address', 'nmrInformation', 'herdPrefix', 'pedigreeBreed', 'startedRecording']),
  );
});

test('Postcode should match test data', () => {
  const data = herdInformation(datastream);

  expect(data.address?.postcode).toEqual('TF9 3TB');
});

test('Herd mark should be 89000', () => {
  const data = herdInformation(datastream);

  expect(data.nmrInformation?.herdMark).toEqual('89000');
});

test('Is a member of cell count service', () => {
  const data = herdInformation(datastream);

  expect(data.nmrInformation?.cellCountMember).toEqual('Member');
});

test('Throws exception to a random data string', () => {
  function randomString() {
    herdInformation('abcdefghijk');
  }

  expect(randomString).toThrow();
});

test('Throws exception to invalid herd information string', () => {
  function invalidString() {
    herdInformation('H1,a,b,c,HD,C1');
  }

  expect(invalidString).toThrow();
});
