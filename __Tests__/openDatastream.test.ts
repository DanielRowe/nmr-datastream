/* eslint-disable no-undef */
import fs from 'fs/promises';
import { openDatastream } from '../src/openDatastream';

test('Opens a .DAT datastream file from file path', async () => {
  const data = await openDatastream('./__Tests__/information/DSMEMBER.DAT');
  expect(data).toHaveLength(770174); // Example file has that many characters.
});

test('Opens a DAT datastream from buffer', async () => {
  const file = await fs.readFile('./__Tests__/information/DSMEMBER.DAT');
  const data = await openDatastream(file);

  expect(data).toHaveLength(770174); // Example file has that many characters.
});

test('Error when DSMEMBER.DAT isn\'t found in self extracting exe if opened as buffer', async () => {
  const openFile = async () => {
    const file = await fs.readFile('./__Tests__/information/fail-test.exe');

    const ds = await openDatastream(file);
    return ds;
  };
  // const z = await openFile();
  await expect(openFile).rejects.toThrowError('DSMember.DAT not found within EXE');
});

test('Expect error when invalid EXE passed as buffer', async () => {
  const openFile = async () => {
    const file = await fs.readFile('./__Tests__/information/fake.exe');
    const ds = await openDatastream(file);
    return ds;
  };
  await expect(openFile).rejects.toThrowError('Invalid file type');
});

test('Open a .EXE from file path', async () => {
  const data = await openDatastream('./__Tests__/information/DSMEMBER.exe');

  expect(data).toHaveLength(769470); // Example file has that many characters.
});

test('Opens a EXE from buffer', async () => {
  const file = await fs.readFile('./__Tests__/information/DSMEMBER.exe');
  const data = await openDatastream(file);

  expect(data).toHaveLength(769470); // Example file has that many characters.
});

test('Expect error when invalid EXE passed', async () => {
  await expect(openDatastream('./__Tests__/information/fake.exe')).rejects.toThrowError('Invalid file provided');
});

test('Expect error when no DSMEMBER.DAT is found within self extracting exe', async () => {
  await expect(openDatastream('./__Tests__/information/fail-test.exe')).rejects.toThrowError('DSMember.DAT not found within EXE');
});

test('Throw exception when path is wrong', async () => {
  await expect(openDatastream('./file/does/not/exist.exe')).rejects.toThrowError();
});

test('Throw exception to wrong file format', async () => {
  await expect(openDatastream('./__Tests__/information/fake.txt')).rejects.toThrowError('Invalid file provided');
});

test('Throw exception when an array is passed, not buffer or string.', async () => {
  // Disable TSLint - yes it's not valid but we need to test it...
  // @ts-expect-error
  await expect(openDatastream([1, 2])).rejects.toThrowError('File not provided as a path or buffer');
});
