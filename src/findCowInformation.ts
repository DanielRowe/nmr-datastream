import { CowListComplete, cowListComplete as completeCowInfo } from './cowListComplete';

export const findCowInformation = (
  datastream:string,
  params: {
    id?: string,
    lineNumber?: number
    DSIdentifier?: string,
  },
) => {
  let cow: CowListComplete[] = [];
  if (params && Object.keys(params).length === 0) {
    throw new Error('No parameters defined to search');
  }
  const info = completeCowInfo(datastream);

  if (typeof params?.id !== 'undefined') { // Search by ID if defined
    const idNumber = info.filter((x) => x.identityNumber === params.id);
    if (idNumber.length > 0) {
      cow = idNumber;
      return cow;
    }
    // If we haven't found it by primary ID search alternate ID as well...
    const altNumber = info.filter((x) => x.alternateIDNumber === params.id);
    if (altNumber.length > 0) {
      cow = altNumber;
      return cow;
    }
  }

  if (typeof params?.lineNumber !== 'undefined') { // Find by line number if defined
    const lineNumberSearch = info.filter((x) => x.lineNumber === params.lineNumber);
    if (lineNumberSearch.length > 0) {
      cow = lineNumberSearch;
      return cow;
    }
  }

  if (typeof params?.DSIdentifier !== 'undefined') { // Find by DSIdentifier if defined
    const DSIdentifierSearch = info.filter((x) => x.DSIdentifier === params.DSIdentifier);
    if (DSIdentifierSearch.length > 0) {
      cow = DSIdentifierSearch;
      return cow;
    }
  }

  return cow;
};

export default findCowInformation;
