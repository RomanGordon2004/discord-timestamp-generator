import 'dotenv/config';
import { InstallGlobalCommands } from './utils.js';

// Const generate timestamp
const DYNAMIC_TIME = {
  name: 'timestamp-time-only',
  type: 1,
  description: 'Send a message with automatically generated timestamps, format: {HH:mm}',
  integration_types: [1],
  contexts: [0, 1, 2],
  options: [
    {
      type: 3,
      name: "message",
      description: "Surround any times with {} and they will be converted into a timestamp based on your chosen timezone",
      required: true
    },
    {
      type: 3,
      name: "timezone",
      description: "Enter the timezone to convert into",
      required: true,
      choices: [
        { name: "UTC−11", value: "NUT" },
        { name: "UTC−10", value: "HAST" },
        { name: "UTC−09", value: "AKST" },
        { name: "UTC−08", value: "PST" },
        { name: "UTC−07", value: "MST" },
        { name: "UTC−06", value: "CST" },
        { name: "UTC−05", value: "EST" },
        { name: "UTC−04", value: "AST" },
        { name: "UTC−03", value: "ART" },
        { name: "UTC−02", value: "BRST" },
        { name: "UTC−01", value: "AZOT" },
        { name: "UTC±00", value: "GMT" },
        { name: "UTC+01", value: "CET" },
        { name: "UTC+02", value: "EET" },
        { name: "UTC+03", value: "MSK" },
        { name: "UTC+04", value: "GST" },
        { name: "UTC+05", value: "PKT" },
        { name: "UTC+05:30", value: "IST" },
        { name: "UTC+06", value: "BST" },
        { name: "UTC+07", value: "THA" },
        { name: "UTC+08", value: "CST8" },
        { name: "UTC+09", value: "JST" },
        { name: "UTC+10", value: "AEST" },
        { name: "UTC+11", value: "SBT" },
        { name: "UTC+12", value: "FJT" }
      ]
    }
  ]
}

// Const generate timestamp from date too
const DYNAMIC_DATETIME = {
  name: 'timestamp',
  type: 1,
  description: 'Send a message with auto generated timestamps, formats: {DD/MM/YYYY HH:mm} & {DD/MM/YYYY} & {HH:mm}',
  integration_types: [1],
  contexts: [0, 1, 2],
  options: [
    {
      type: 3,
      name: "message",
      description: "Surround any dates/times with {} and they will be converted to a timestamp format",
      required: true
    },
    {
      type: 3,
      name: "timezone",
      description: "Enter the timezone to convert into",
      required: true,
      choices: [
        { name: "UTC−11", value: "NUT" },
        { name: "UTC−10", value: "HAST" },
        { name: "UTC−09", value: "AKST" },
        { name: "UTC−08", value: "PST" },
        { name: "UTC−07", value: "MST" },
        { name: "UTC−06", value: "CST" },
        { name: "UTC−05", value: "EST" },
        { name: "UTC−04", value: "AST" },
        { name: "UTC−03", value: "ART" },
        { name: "UTC−02", value: "BRST" },
        { name: "UTC−01", value: "AZOT" },
        { name: "UTC±00", value: "GMT" },
        { name: "UTC+01", value: "CET" },
        { name: "UTC+02", value: "EET" },
        { name: "UTC+03", value: "MSK" },
        { name: "UTC+04", value: "GST" },
        { name: "UTC+05", value: "PKT" },
        { name: "UTC+05:30", value: "IST" },
        { name: "UTC+06", value: "BST" },
        { name: "UTC+07", value: "THA" },
        { name: "UTC+08", value: "CST8" },
        { name: "UTC+09", value: "JST" },
        { name: "UTC+10", value: "AEST" },
        { name: "UTC+11", value: "SBT" },
        { name: "UTC+12", value: "FJT" }
      ]
    }
  ]
}

// Const convert date to timestamp directly
const CONVERT_MODAL = {
  name: 'generate',
  type: 1,
  description: 'Enter a date, time and timezone and receive a timestamp in return in a message only you can see!',
  integration_types: [1],
  contexts: [0, 1, 2]
}

// Const convert date to timestamp directly
const CONVERT_EPHEMERAL = {
  name: 'generate-inline',
  type: 1,
  description: 'Enter a date, time and timezone and receive a timestamp in return in a message only you can see!',
  integration_types: [1],
  contexts: [0, 1, 2],
  options: [
    {
      type: 3,
      name: "date",
      description: "Required format DD/MM/YYYY",
      required: true
    },
    {
      type: 3,
      name: "time",
      description: "Required format HH:mm",
      required: true
    },
    {
      type: 3,
      name: "display-type",
      description: "Choose the format in which the timestamp will be displayed",
      required: true,
      choices: [
        {name: "Relative", value: "R"},
        {name: "Time Only", value: "t"},
        {name: "Short Date Only", value: "d"},
        {name: "Long Date Only", value: "D"},
        {name: "Date and Time", value: "f"},
        {name: "Date and Time With Day of Week", value: "F"}
      ]
    },
    {
      type: 3,
      name: "timezone",
      description: "Enter the timezone to convert from",
      required: true,
      choices: [
        { name: "UTC−11", value: "NUT" },
        { name: "UTC−10", value: "HAST" },
        { name: "UTC−09", value: "AKST" },
        { name: "UTC−08", value: "PST" },
        { name: "UTC−07", value: "MST" },
        { name: "UTC−06", value: "CST" },
        { name: "UTC−05", value: "EST" },
        { name: "UTC−04", value: "AST" },
        { name: "UTC−03", value: "ART" },
        { name: "UTC−02", value: "BRST" },
        { name: "UTC−01", value: "AZOT" },
        { name: "UTC±00", value: "GMT" },
        { name: "UTC+01", value: "CET" },
        { name: "UTC+02", value: "EET" },
        { name: "UTC+03", value: "MSK" },
        { name: "UTC+04", value: "GST" },
        { name: "UTC+05", value: "PKT" },
        { name: "UTC+05:30", value: "IST" },
        { name: "UTC+06", value: "BST" },
        { name: "UTC+07", value: "THA" },
        { name: "UTC+08", value: "CST8" },
        { name: "UTC+09", value: "JST" },
        { name: "UTC+10", value: "AEST" },
        { name: "UTC+11", value: "SBT" },
        { name: "UTC+12", value: "FJT" }
      ]
    }
  ]
}

const ALL_COMMANDS = [
  DYNAMIC_TIME,
  DYNAMIC_DATETIME,
  CONVERT_MODAL,
  CONVERT_EPHEMERAL,
];

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);
