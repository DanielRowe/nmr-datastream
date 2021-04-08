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

test('Throw an exception when no S records found', () => {
  const noStatement = () => {
    const noStatementInfo = `
C1,10,93972,01,2,0713,01,890001500753,2,2,0,0,                        ,03080
C2,00,000000000000,031204,0,031204,060510,2,000000,0000000000000000000,03407
C3,D HUNTER ROSE       ,D HUNTER ROSE                           ,     ,03400
C4,63,194720153   ,1,0,01,890001700230,2,2,0,                         ,03016
C5,01,97,070604,+0181,+0097,+0081,+0004,+0003,35,                     ,03111`;

    return cowInformation(noStatementInfo);
  };
  expect(noStatement).toThrow();
});
