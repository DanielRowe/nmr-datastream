/**
 * Helper function to convert datastream dates from the
 * format YYMMDD to a Date object.
 *
 * Params @string (string) expects YYMMDD.
 * Returns Date object
 *
* */

export const toDate = (string: string) => {
  const splitDateRegex = /(\d\d)(\d\d)(\d\d)/g; // Split date into capture groups.
  const splitDate = splitDateRegex.exec(string);
  // If we're post 80 on the date then make it in the year 2000 - Not entirely future proof -
  // this will need fixing in approx 60 years time..  But that's just the issue with short dates.
  if (splitDate !== null) {
    const createDate = `${((parseInt(splitDate[1], 10) < 80) ? '20' : '19') + splitDate[1]}-${splitDate[2]}-${splitDate[3]}`;
    return new Date(createDate);
  }
  throw new Error('Date format invalid');
};

export default toDate;
