import fs from 'fs/promises';
import 'jest-extended';
import {
  services,
  samples,
  healthEvents,
  otherEvents,
  currentLactationInformation,
  calvings,
} from '../src/subStatementInfo';

let datastream = '';

beforeAll(async () => {
  datastream = await fs.readFile('./__Tests__/information/DSMEMBER.DAT', 'utf8');

  return datastream;
});

test('Services should output an array', () => {
  const data = services(datastream);

  expect(data).toBeArray();
});

test('Services array should have the expected keys', () => {
  const data = services(datastream);

  expect(data).toEqual(
    expect.arrayContaining([
      expect.toContainKeys(['lineNumber', 'date', 'sireBreed', 'sireIdentity', 'pdStatus']),
    ]),
  );
});

test('Samples should output an array', () => {
  const data = samples(datastream);

  expect(data).toBeArray();
});

test('Samples array should have the expected keys', () => {
  const data = samples(datastream);

  expect(data).toEqual(
    expect.arrayContaining([
      expect.toContainKeys(['lineNumber', 'date', 'milkYield', 'butterfatPercentage', 'scc']),
    ]),
  );
});

test('Health Events should output an array', () => {
  const data = healthEvents(datastream);

  expect(data).toBeArray();
});

test('Health Events array should have the expected keys', () => {
  const data = healthEvents(datastream);

  expect(data).toEqual(
    expect.arrayContaining([
      expect.toContainKeys(['lineNumber', 'date', 'eventType']),
    ]),
  );
});

test('Health events should not have disallowed types', () => {
  const data = healthEvents(datastream);

  expect(data).not.toEqual(
    expect.arrayContaining([
      expect.toContainAnyValues(['Dry', 'Barren', 'Sold', 'Died']),
    ]),
  );
});

test('Other Events should output an array', () => {
  const data = otherEvents(datastream);

  expect(data).toBeArray();
});

test('Other Events array should have the expected keys', () => {
  const data = otherEvents(datastream);

  expect(data).toEqual(
    expect.arrayContaining([
      expect.toContainKeys(['lineNumber', 'date', 'eventType']),
    ]),
  );
});

test('Other events should not have disallowed types', () => {
  const data = otherEvents(datastream);

  expect(data).not.toEqual(
    expect.arrayContaining([
      expect.toContainAnyValues(['Mastits', 'Lameness', 'Sick']),
    ]),
  );
});

test('Current lactation should output an array', () => {
  const data = currentLactationInformation(datastream);

  expect(data).toBeArray();
});

test('Current lactation should have the expected keys', () => {
  const data = currentLactationInformation(datastream);

  expect(data).toEqual(
    expect.arrayContaining([
      expect.toContainKeys(['lineNumber', 'lactationDays', 'totalMilkKG', 'totalFatPercentage', 'averageSCC']),
    ]),
  );
});

test('Calvings should output an array', () => {
  const data = calvings(datastream);

  expect(data).toBeArray();
});

test('Calvings should output an array greater than 1 in length', () => {
  const data = calvings(datastream);

  expect(data).toBeArrayOfSize(846);
});

test('Calvings should have the expected keys', () => {
  const data = calvings(datastream);

  expect(data).toEqual(
    expect.arrayContaining([
      expect.toContainKeys(['lineNumber', 'date', 'assumed', 'sireID', 'calves']),
    ]),
  );
});
