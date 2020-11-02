# UOWS Client

## About

This project aims to make it easier to use the User Office Web Service in projects using TypeScript by abstracting the 
details of the SOAP implementation from the user and exposing only the functionality of the web service they can use.

## Setup

This project requires [node.js](https://nodejs.org/en/download/), [this soap library](https://www.npmjs.com/package/soap) and [TypeScript](https://www.typescriptlang.org/download)

Run the following command to enable node.js to work with TypeScript
`npm install @types/node --save`

## How to run

You must be connected to STFC's internal network in order to access the UOWS WSDL.
To use the soap interface offered by this project you must compile the client generator first:

`tsc .\SoapInterfaceGenerator.ts`

Then run the resulting script:

`node .\SoapInterfaceGenerator.js`

This will produce the UOWSServiceInterface.ts file which you can import into your own project and use.