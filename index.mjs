import { openDatastream } from './src/openDatastream.mjs';


let z = async () => {
  let x = await openDatastream('./DSMEMBER.DAT');
  console.log(x);
} 
