/* eslint-disable no-undef */
import toDate from '../../src/utils/toDate';

test('Throws exception to empty string', () => {
  function emptyString() {
    toDate('');
  }
  expect(emptyString).toThrowError();
});

test('Throws exception to random string', () => {
  function randomString() {
    toDate('randomness and stuff');
  }
  expect(randomString).toThrowError();
});

test('Partial date does not get converted', () => {
  function partialDate() {
    toDate('0608');
  }
  expect(partialDate).toThrowError();
});

test('Converted date should equal expected date', () => {
  const newDate = new Date('2021-12-11T00:00:00');

  expect(toDate('211211')).toEqual(newDate);
});
