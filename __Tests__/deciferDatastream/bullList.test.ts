import fs from 'fs/promises';
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

test('Expect exception to throw when no dead dams in datastream', () => {
  const noBulls = () => {
    const noBullsDatastream = `
    B1,71,8088008275  ,DAVIDE                                  ,DAVIDE  , ,03115
    B2,01,01,070518,+0021,+0077,+0054,+0009,+0006,96,                     ,03102
    B1,72,3604039709  ,ALZI JUROR FORD *TL*TV                  ,FORD    , ,03619
    B2,01,01,070518,+0232,+0183,+0110,+0012,+0005,99,                     ,03093
    B1,72,3805002265  ,RIGLIO JUROR CAPRI ET *TL*TV            ,CAPRI   , ,03856
    B2,01,01,070518,+0094,+0134,+0022,+0013,-0001,99,                     ,03096
    W1,9601,0712,                                                         ,02546
    W2,96,01,01,01,02,03,3,96,01,02,01,31,01,4,96,01,03,03,04,05,2,       ,03332
    W2,96,01,04,04,01,02,2,96,01,05,05,01,02,4,96,01,06,06,03,04,2,       ,03344`;

    return bullList(noBullsDatastream);
  };
  expect(noBulls).not.toThrow();
});
