import { breedCodeToText } from '../../src/utils/breedCodeConvert';

test('Converts a breed code to expected output', () => {
  expect(breedCodeToText('01')).toEqual('Holstein (UK)');
});

test('Returns undefined if value isn\'t found', () => {
  expect(breedCodeToText('00')).toEqual(undefined);
});
