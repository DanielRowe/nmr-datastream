import fs from 'fs/promises';
import 'jest-extended';
import cowListComplete from '../src/cowListComplete';

let datastream = '';

beforeAll(async () => {
  datastream = await fs.readFile('./__Tests__/information/DSMEMBER.DAT', 'utf8');

  return datastream;
});

test('cowListComplete should output an array', () => {
  const data = cowListComplete(datastream);

  expect(data).toBeArray();
});

test('cowListComplete array should have the expected keys', () => {
  const data = cowListComplete(datastream);

  expect(data).toEqual(
    expect.arrayContaining([
      expect.toContainKeys(['lineNumber', 'milkSamples', 'services', 'events', 'allLactations']),
    ]),
  );
});
