import breedCodes from '../lookups/breedCodes';
export const breedCodeToText = (code) => {
    const find = breedCodes.find((x) => x.breed === code);
    return find?.breed_Lit;
};
const all = {
    breedCodeToText,
};
export default all;
