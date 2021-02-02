/**  
 * Helper function to convert datastream dates from the
 * format YYMMDD to a Date object.
 * 
 * Params @string (string) expects YYMMDD.
 * Returns Date object
 * 
**/

export default toDate = (string) => {
  const splitDate = /(\d\d)(\d\d)(\d\d)/g.exec(string); // Split date into capture groups.
  // If we're post 80 on the date then make it in the year 2000 - Not entirely future proof -
  // this will need fixing in approx 60 years time..  But that's just the issue with short dates.
  const formDate = `${((splitDate[1] < 80) ? '20' : '19') + splitDate[1]}-${splitDate[2]}-${splitDate[3]}`;
  const d = new Date(formDate);
  return d;
}
