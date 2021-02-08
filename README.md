# NMR-Datastream Converter
![CI](https://github.com/danielrowe/nmr-datastream/workflows/CI/badge.svg)  [![codecov](https://codecov.io/gh/DanielRowe/nmr-datastream/branch/master/graph/badge.svg?token=7BIRS3MA7F)](https://codecov.io/gh/DanielRowe/nmr-datastream) [![Maintainability](https://api.codeclimate.com/v1/badges/d0cd4d562aa4ad5ec02a/maintainability)](https://codeclimate.com/github/DanielRowe/nmr-datastream/maintainability) [![Known Vulnerabilities](https://snyk.io/test/github/DanielRowe/nmr-datastream/badge.svg?targetFile=package.json)](https://snyk.io/test/github/DanielRowe/nmr-datastream?targetFile=package.json) ![Licence](https://img.shields.io/github/license/danielrowe/nmr-datastream) 

![Dependencies](https://img.shields.io/david/danielrowe/nmr-datastream) ![Dev Dependencies](https://img.shields.io/david/dev/danielrowe/nmr-datastream) 



Datastreams are provided by milk recording companies (in the UK) including NMR and CIS, and are updated following each milk recording session.

The original specification was created in 1989, working upon this specification which [can be found in the wiki](files/datastream_specification.pdf) the following library was built. 

The library will take any valid datastream file and convert it to a javascript object as described - this could then be inserted into a database or converted to a csv for example.

This library can be used to open the self-extracting .exe format or the .DAT file

If you need further help using this library please feel free to [get in touch](#get-in-touch)!

A datastream file will contain the following information: 
| Section   |      Contains               |
|----------|:-------------------------------|
| Herd Information|  Basic herd information including farm address, herd prefix and number. Mainly information relevant to the milk recording company.|
| Herd Recordings |    Overview of each sampling date including total animals and animals in milk. Also contains any bulk sample results.   |
| Cows | All cow information including line number, official identifier (ear tag or herdbook number), breed, date of birth, date of entry / departure, name, parental information and PTAs |
| Statement Information | Events relevant to each cow, including milk recording results, services, latest calving, lactation overview and other relevant health events. |
| Lactations | A lactation overview relevant to each cow, including 305 day qualifying lactations, natural lactations and other relevant information including calvings, total services and relevant health information. There is a separate lactation overview per lactation for each cow. |
| Bulls | Contains PTA overview for each of the bulls used within the file including services or sires. |
| Dead Dams | A dead dam is a dam who only has daughters in the herd or has been dead for a long time. It contains the dams name and identity information, and PTAs. These are used to save space over a full cow overview. |

## Contents:
- [Basic Usage](#basic-usage)
  - [Installation & set up](#installation)
  - [Convert everything to JSON](#convert-to-json)
- [API](#api)
  - Basic Functions
    - [openDatastream](#openDatastream)
    - [herdInformation](#herdInformation)
    - [herdRecordings](#herdRecordings)
    - [cowList](#cowList)
    - [statementInformation](#statementInformation)
    - services
    - samples
    - healthEvents
    - otherEvents
    - calvings
    - currentLactationInformation
    - [lactationList](#lactationList)
    - [bullList](#bullList)
    - [deadDamList](#deadDamList)
    - cowListComplete
    - toJSON
    - findCowInformation
  - [Utils](#utils)
    - [toDate](#utils-todate)
    - breedCodeToText
    - breedCodeToBCMS
- [Issues / Feature Requests](#issues-and-feature-requests)
- [Get in Touch](#get-in-touch)
- [Contributing](#contributing)
- [Licence](#licence)


# Basic Usage
## Installation
Via NPM:
```bash
npm install nmr-datastream
```
Via Yarn:
```bash
yarn add nmr-datastream
```

To include it in your file you can use common js or es6 modules.

Common JS:
```js
const nmrDatastream = require('nmr-datastream');
```
ES6 Modules:
```js
import nmrDatastream from 'nmr-datastream';
// or
import { openDatastream } from 'nmr-datastream';
```
## Basic Usage
Open a datastream file.
## Convert to JSON
This will open a datastream file from path and export it as a JSON file.
```js
import { openDatastream, toJSON } from 'nmr-datastream';
import { write } from "fs/promises";

(async () => {
  try {
    const datastream = await openDatastream('./path/to/your/DSMEMBER.DAT');
    const data = await toJSON(datastream);

    write('./output.json', data);
    console.log('file converted and saved');
  } catch (error) {
    console.error(error);
  }
})();
```
# API
## openDatastream
`openDatastream(string (filepath) or buffer)`

Will open a datastream file either from a .DAT file or .EXE, and can either be provided with a string detailing the filepath, or a buffer containing the file.

This function doesn't have to be used prior to other functions but is useful for extracting provided .EXE files.

**Returns:** *string* (contents of datastream file)

## herdInformation
`herdInformation(datastream (string))`

Will find the herd information within the datastream file and return it all as a useful object.

Basic herd information including farm address, herd prefix and number. Mainly information relevant to the milk recording company.

**Returns:** 
*object* 
[See Wiki for more detail](https://github.com/DanielRowe/nmr-datastream/wiki/Herd-Information)

## herdRecordings
`herdRecordings(datastream (string))`

Will find an overview of each sampling date including total animals and animals in milk. Also contains any bulk sample results.

**Returns:** 
*array* 
[See Wiki for more](https://github.com/DanielRowe/nmr-datastream/wiki/Herd-Recordings)

## cowList
`cowList(datastream (string))`

Will find the cow information within the datastream file and return it all as a useful array of objects.

All cow information including line number, official identifier (ear tag or herdbook number), breed, date of birth, date of entry / departure, name, parental information and PTAs

**Returns:** 
*array* 
[See Wiki for more](https://github.com/DanielRowe/nmr-datastream/wiki/Cow-List)

## statementInformation
`statementInformation(datastream (string))`

Will find the statement information within the datastream file and return it all as a useful array of objects.

Events relevant to each cow, including milk recording results, services, latest calving, lactation overview and other relevant health events.

**Returns:** 
*array* 
[See Wiki for more](https://github.com/DanielRowe/nmr-datastream/wiki/Statement-Information)

## lactationList
`lactationList(datastream (string))`

Will find the lactation information within the datastream file and return it all as a useful array of objects.

A lactation overview relevant to each cow, including 305 day qualifying lactations, natural lactations and other relevant information including calvings, total services and relevant health information. 

**There is a separate lactation overview per lactation for each cow.**

**Returns:** 
*array* 
[See Wiki for more](https://github.com/DanielRowe/nmr-datastream/wiki/Lactation-List)

## bullList
`bullList(datastream (string))`

Will find the bull information within the datastream file and return it all as a useful array of objects.

Contains PTA overview for each of the bulls used within the file including services or sires.


**Returns:** 
*array* 
[See Wiki for more](https://github.com/DanielRowe/nmr-datastream/wiki/Bull-List)

## deadDamList
`deadDamList(datastream (string))`

A dead dam is a dam who only has daughters in the herd or has been dead for a long time. It contains the dams name and identity information, and PTAs. These are used to save space over a full cow overview.

This function finds *dead dams* from the datastream and returns them as a useful array full of objects.

**Returns:**
*array* 
[See Wiki for more](https://github.com/DanielRowe/nmr-datastream/wiki/Dead-Dam-List)

## Utils
## Utils toDate
`utils.toDate(YYMMDD)`

Simple converter from string date format commonly used within the datastream of `YYMMDD` to a date object.

Any date after 1980 currently becomes post 2000.

**Returns:** *Date Object*

# Issues and Feature Requests
Feel free to submit issues and enhancement requests.

These are handled through Github Issues.

# Get in Touch
I'd love to hear from you if you're using this! Drop me an email [hello@danrowe.me](hello@danrowe.me)

# Contributing  [![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/danielrowe/nmr-datastream/issues)
Please refer to each project's style and contribution guidelines for submitting patches and additions. In general, we follow the "fork-and-pull" Git workflow.

- Fork the repo on GitHub
- Clone the project to your own machine
- Commit changes to your own branch
- Push your work back up to your fork
- Submit a Pull request so that we can review your changes

NOTE: Be sure to merge the latest from "upstream" before making a pull request!

# Licence
*MIT Licence*

Copyright 2021 - Daniel Rowe

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.