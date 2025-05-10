import 'dotenv/config';
import express from 'express';
import { InteractionType, InteractionResponseType } from 'discord-interactions';
import {
  VerifyDiscordRequest,
} from './utils.js';

// Create an express app
const app = express();
// Get port, or default to 3000
const PORT = process.env.PORT || 3000;
// Parse request body and verifies incoming requests using discord-interactions package
app.use(express.json({ verify: VerifyDiscordRequest(process.env.PUBLIC_KEY) }));

const timezoneOffsets = {
  NUT: -11, HAST: -10, AKST: -9, PST: -8, MST: -7,
  CST: -6, EST: -5, AST: -4, ART: -3, BRST: -2,
  AZOT: -1, GMT: 0, CET: 1, EET: 2, MSK: 3,
  GST: 4, PKT: 5, IST: 5.5, BST: 6, THA: 7,
  CST8: 8, JST: 9, AEST: 10, SBT: 11, FJT: 12
};

/**
 * Interactions endpoint URL where Discord will send HTTP requests
 */
app.post('/interactions', async function (req, res) {
  // Interaction type and data
  const { type, data } = req.body;

  /**
   * Handle verification requests
   */
  if (type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }

  // Log request bodies
  console.log(req.body);

  /**
   * Handle slash command requests
   * See https://discord.com/developers/docs/interactions/application-commands#slash-commands
   */
  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name } = data;

    // "timestamp"
    if (name === 'timestamp-time-only') {
      const message = data.options[0].value;
      const timezone = data.options[1].value;

      const offset = timezoneOffsets[timezone];

      const convertedMessage = message.replace(/({\d{2}:\d{2}})/g, function (match) {
        const time = match.substring(1,6);
        return timeToTimestamp(time, offset);
      })

      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `${convertedMessage}`
        },
      });
    }

    // "timestamp with date"
    if (name === 'timestamp') {
      const message = data.options[0].value;
      const timezone = data.options[1].value;

      const offset = timezoneOffsets[timezone];

      let convertedMessage = message.replace(/({\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}})/g, function (match) {
        const dateTime = match.substring(1, match.length-1);
        return dateTimeToTimestamp(dateTime, offset);
      })

      convertedMessage = convertedMessage.replace(/({\d{2}\/\d{2}\/\d{4}})/g, function (match) {
        const date = match.substring(1, match.length-1);
        return dateToTimestamp(date, offset);
      })

      convertedMessage = convertedMessage.replace(/({\d{2}:\d{2}})/g, function (match) {
        const time = match.substring(1, match.length-1);
        return timeToTimestamp(time, offset);
      })

      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `${convertedMessage}`
        },
      });
    }
  }
});

app.listen(PORT, () => {
  console.log('Listening on port', PORT);
});

function timeToTimestamp(time, offset) {
  const [hour, minute] = time.split(':').map(Number);
  const now = new Date();
  let timeStamp;
  if (offset === undefined) {
    timeStamp = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute) / 1000;
  } else {
    timeStamp = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), hour - offset, minute) / 1000;
  }
  return `<t:${timeStamp}:t>`;
}

function dateTimeToTimestamp(dateTime, offset) {
  const [datePart, timePart] = dateTime.split(' ');
  const [day, month, year] = datePart.split('/').map(Number);
  const [hour, minute] = timePart.split(':').map(Number);

  let timeStamp;
  if (offset === undefined) {
    timeStamp = Date.UTC(year, month - 1, day, hour, minute) / 1000;
  } else {
    timeStamp = Date.UTC(year, month - 1, day, hour - offset, minute) / 1000;
  }
  return `<t:${timeStamp}:f>`;
}

function dateToTimestamp(date, offset) {
  const [day, month, year] = date.split('/').map(Number);
  const now = new Date();

  let timeStamp;
  if (offset === undefined) {
    timeStamp = Date.UTC(year, month - 1, day, now.getHours(), now.getMinutes()) / 1000;
  } else {
    timeStamp = Date.UTC(year, month - 1, day, now.getHours() - offset, now.getMinutes()) / 1000;
  }
  return `<t:${timeStamp}:D>`;
}
