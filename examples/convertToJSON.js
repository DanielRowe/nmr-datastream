const fs = require('fs/promises');
const nmrDatastream = require('../lib/cjs/index.js'); // Change this to require('nmrdatastream')

(async () => {
  try {
    const datastream = await nmrDatastream.openDatastream('../__Tests__/information/DSMEMBER.DAT');

    const data = nmrDatastream.toJSON(datastream);

    await fs.writeFile('./output.json', JSON.stringify(data));
  } catch (e) {
    console.error(e);
  }
})();
