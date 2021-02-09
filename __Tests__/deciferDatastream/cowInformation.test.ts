import fs from 'fs/promises';
import 'jest-extended';
import cowInformation from '../../src/deciferDatastream/cowInformation';

let datastream = '';

beforeAll(async () => {
  datastream = await fs.readFile('./__Tests__/information/DSMEMBER.DAT', 'utf8');

  return datastream;
});

test('Returns an array containing all cow information', () => {
  expect(cowInformation(datastream)).toBeArray();
});

test('Expect first cow to have line number 0001 and name of DEMONSTRATION F16 ROSE', () => {
  const data = cowInformation(datastream);

  expect(data[0]).toEqual(
    expect.toContainEntries([['lineNumber', 1], ['longName', 'DEMONSTRATION F16 ROSE']]),
  );
});

test('Expect last cow to have line number 713 and name of D HUNTER ROSE', () => {
  const data = cowInformation(datastream);

  expect(data[(data.length - 1)]).toEqual(
    expect.toContainEntries([['lineNumber', 713], ['longName', 'D HUNTER ROSE']]),
  );
});

test('Each cow should have a PTA proof', () => {
  const data = cowInformation(datastream);
  expect(data).toEqual(
    expect.arrayContaining([
      expect.toContainKeys(['PTA']),
    ]),
  );
});

test('Throws exception to a random data string', () => {
  function randomString() {
    cowInformation('abcdefghijk');
  }

  expect(randomString).toThrow();
});

test('Throws exception to invalid herd information string', () => {
  function invalidString() {
    cowInformation('C1,a,b,c,HD,S0,');
  }

  expect(invalidString).toThrow();
});

test('Expect isYoungstock param not to return cows', () => {
  const data = cowInformation(datastream, { isYoungstock: true });

  expect(data).toEqual(
    expect.arrayContaining([
      expect.toContainEntry(['isYoungstock', true]),
    ]),
  );
});

test('Expect dateOfBirth to only return animals born after date', () => {
  const data = cowInformation(datastream, { dateOfBirth: new Date('2005-01-01') });

  expect(data).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        dateOfBirth: expect.toBeAfter(new Date('2005-01-01')),
      }),
    ]),
  );
});
