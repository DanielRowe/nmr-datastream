import breedCodes from '../lookups/breedCodes';

export const breedCodeToText = (code: number) => {
  const find = breedCodes.find((x) => x.code === code);

  return find?.breed;
};

const all = {
  breedCodeToText,
};

export default all;
