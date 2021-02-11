import { breedCodeToText } from '../../src/utils/breedCodeConvert';

test('Converts a breed code to expected output', () => {
  expect(breedCodeToText(1)).toEqual('HOL/FR: BRITISH (UK)');
});

test('Returns undefined if value isn\'t found', () => {
  expect(breedCodeToText(0)).toEqual(undefined);
});
