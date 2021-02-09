import fs from 'fs/promises';
import 'jest-extended';
import toJSON from '../src/toJSON';

let datastream = '';

beforeAll(async () => {
  datastream = await fs.readFile('./__Tests__/information/DSMEMBER.DAT', 'utf8');

  return datastream;
});

test('toJSON should output an array', () => {
  const data = toJSON(datastream);

  expect(data).toBeObject();
});

test('toJSON should output expected items', () => {
  const data = toJSON(datastream);

  expect(data).toEqual(
    expect.toContainKeys(['cows', 'herdInformation', 'herdRecordings', 'lactations', 'statementInformation', 'deadDams', 'bulls']),
  );
});

test('toJSON should not out put statement / lactation separate if using complete cow', () => {
  const data = toJSON(datastream, true);

  expect(data).toEqual(
    expect.toContainKeys(['cows', 'herdInformation', 'herdRecordings', 'deadDams', 'bulls']),
  );

  expect(data).not.toContainKeys(['lactations', 'statementInformation']);
});
