import breedCodes from '../lookups/breedCodes';
export const breedCodeToText = (code) => {
    const find = breedCodes.find((x) => x.code === code);
    return find?.breed;
};
const all = {
    breedCodeToText,
};
export default all;
