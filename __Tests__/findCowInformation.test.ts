import fs from 'fs/promises';
import 'jest-extended';
import findCowInformation from '../src/findCowInformation';

let datastream = '';

beforeAll(async () => {
  datastream = await fs.readFile('./__Tests__/information/DSMEMBER.DAT', 'utf8');

  return datastream;
});

test('Find a cow should find the correct cow by ID', () => {
  const data = findCowInformation(datastream, { id: 'MRS00/6991' });

  expect(data).toBeArray();
  expect(data).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        lineNumber: 41,
      }),
    ]),
  );
});

test('Finding a cow by their alternate ID should return the correct cow', () => {
  const data = findCowInformation(datastream, { id: '123456400123' });

  expect(data).toBeArray();

  expect(data).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        lineNumber: 2,
      }),
    ]),
  );
});

test('Finding a cow by line number (2) where there are previous versions should return array with all of them', () => {
  const data = findCowInformation(datastream, { lineNumber: 2 });

  expect(data).toBeArray();

  expect(data).toBeArrayOfSize(2);
});

test('Should find a cow by DSIdentifier as expected', () => {
  const data = findCowInformation(datastream, { DSIdentifier: '0481|0' });

  expect(data).toBeArrayOfSize(1); // Should only return one object

  expect(data).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        longName: 'DEMO TOWNLEY VENGEANCE',
      }),
    ]),
  );
});

test('If a cow isn\'t found return an empty array.', () => {
  const data = findCowInformation(datastream, { lineNumber: 1234 });

  expect(data).toBeArrayOfSize(0);
});

test('No params passed', () => {
  function noParamsPassed() {
    findCowInformation(datastream, {});
  }
  expect(noParamsPassed).toThrow();
});
