import { CowListComplete } from './cowListComplete';
export declare const findCowInformation: (datastream: string, params: {
    id?: string;
    lineNumber?: number;
    DSIdentifier?: string;
}) => CowListComplete[];
export default findCowInformation;
