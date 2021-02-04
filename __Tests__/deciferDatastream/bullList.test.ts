/* eslint-disable no-undef */
import fs from 'fs/promises';
// eslint-disable-next-line import/no-extraneous-dependencies
import 'jest-extended';
import bullList from '../../src/deciferDatastream/bullList';

let datastream = '';

beforeAll(async () => {
  datastream = await fs.readFile('./__Tests__/information/DSMEMBER.DAT', 'utf8');

  return datastream;
});

test('Returns a list of all the bulls', () => {
  expect(bullList(datastream)).toHaveLength(67);
});

test('Each bull should have a short name, long name, breed and herdbook number', () => {
  const data = bullList(datastream);
  expect(data).toEqual(
    expect.arrayContaining([
      expect.toContainKeys(['shortName', 'longName', 'breed', 'herdbookNumber']),
    ]),
  );
});

test('Each bull should have a PTA proof', () => {
  expect(bullList(datastream)).toEqual(
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
    bullList('abcdefghijk');
  }
  expect(randomString).toThrow();
});

test('Should throw exception to invalid bull string', () => {
  function invalidBull() {
    bullList('B1,0,abc');
  }
  expect(invalidBull).toThrow();
});
