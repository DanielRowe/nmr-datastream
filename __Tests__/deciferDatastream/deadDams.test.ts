/* eslint-disable no-undef */
import fs from 'fs/promises';
// eslint-disable-next-line import/no-extraneous-dependencies
import 'jest-extended';
import deadDams from '../../src/deciferDatastream/deadDams';

let datastream = '';

beforeAll(async () => {
  datastream = await fs.readFile('./__Tests__/information/DSMEMBER.DAT', 'utf8');

  return datastream;
});

test('Returns a list of all dead dams', () => {
  expect(deadDams(datastream)).toHaveLength(191);
});

test('Each dam should have a name, breed, id, id type and pedigree status', () => {
  const data = deadDams(datastream);
  expect(data).toEqual(
    expect.arrayContaining([
      expect.toContainKeys(['name', 'breed', 'identity', 'identityType', 'pedigreeStatus']),
    ]),
  );
});

test('Each dam should have a PTA proof', () => {
  expect(deadDams(datastream)).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        ptas: expect.arrayContaining([
          expect.toContainKey('milkKG'),
        ]),
      }),
    ]),
  );
});

test('Should throw an exception if a random string is passed', () => {
  function randomString() {
    deadDams('abcdefghijk');
  }
  expect(randomString).toThrow();
});

test('Should throw exception to invalid dam string', () => {
  function invalidDam() {
    deadDams('D1,01,890001300149,2,2'); // Missing info
  }
  expect(invalidDam).toThrow();
});
