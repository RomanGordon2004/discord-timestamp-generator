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

const timezoneOffsetsUtc = {
  "UTC-12": -12, "UTC-11": -11, "UTC-10": -10, "UTC-09": -9, "UTC-09:30": -9.5, "UTC-08": -8, "UTC-07": -7,
  "UTC-06": -6, "UTC-05": -5, "UTC-04": -4, "UTC-03": -3, "UTC-03:30": -3.5, "UTC-02": -2,
  "UTC-01": -1, "UTC+00": 0, "UTC+01": 1, "UTC+02": 2, "UTC+03": 3, "UTC+03:30": 3.5,
  "UTC+04": 4, "UTC+04:30": 4.5, "UTC+05": 5, "UTC+05:30": 5.5, "UTC+05:45": 5.75, "UTC+06": 6, "UTC+06:30": 6.5,
  "UTC+07": 7, "UTC+08": 8, "UTC+08:45": 8.75, "UTC+09": 9, "UTC+09:30": 9.5, "UTC+10": 10, "UTC+10:30": 10.5,
  "UTC+11": 11, "UTC+12": 12, "UTC+12:45": 12.75, "UTC+13": 13, "UTC+14": 14
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
  // console.log(req.body);

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

    if (name === 'generate') {
      return res.send({
        type: InteractionResponseType.MODAL,
        data: {
          custom_id: "generate-modal",
          title: "Enter a date, time and timezone",
          components: [
            {
              type: 1,
              components: [
                {
                  type: 4,
                  custom_id: "date",
                  style: 1,
                  label: "Enter date (DD/MM/YYYY)",
                  placeholder: "DD/MM/YYYY",
                  min_length: 10,
                  max_length: 10,
                  required: true
                }
              ]
            },
            {
              type: 1,
              components: [
                {
                  type: 4,
                  custom_id: "time",
                  style: 1,
                  label: "Enter time (HH:mm)",
                  placeholder: "HH:mm",
                  min_length: 5,
                  max_length: 5,
                  required: true
                }
              ]
            },
            {
              type: 1,
              components: [
                {
                  type: 4,
                  custom_id: "timezone",
                  style: 1,
                  label: "Enter timezone offset (e.g. UTC+02 or UTC-06)",
                  placeholder: "UTC+00",
                  min_length: 6,
                  max_length: 9,
                  required: true
                }
              ]
            },
          ]
        }
      })
    }

    if (name === 'generate-inline') {
      const date = data.options[0].value;
      const time = data.options[1].value;
      const format = data.options[2].value;
      const timezone = data.options[3].value;

      const offset = timezoneOffsets[timezone];
      const dateString = `${date} ${time}`
      const timestamp = dateTimeToTimestamp(dateString, offset, false, format)

      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `\`${timestamp}\``,
          flags: "64"
        },
      })
    }
  }

  if (type === InteractionType.MODAL_SUBMIT) {
    const { custom_id } = data;

    if (custom_id === 'generate-modal') {
      const components = data.components;
      let date;
      let time;
      let timezone;

      for (const component of components) {
        switch (component.id) {
          case 1:
            date = component.components[0].value;
            break;
          case 3:
            time = component.components[0].value;
            break;
          case 5:
            timezone = component.components[0].value;
            break;
        }
      }

      const dateRegex = /^([0-2]\d|3[01])\/(0\d|1[0-2])\/\d{4}$/;
      const timeRegex = /^[0-2]\d:[0-5]\d$/;
      const timeZoneRegex = /^UTC([+-]\d{2,5})?$/
      const errors = [];
      if (!dateRegex.test(date)) {
        errors.push(`- Date must be in the DD/MM/YYYY format! You provided ${date}`)
      }
      if (!timeRegex.test(time)) {
        errors.push(`- Time must be in the HH:mm format! You provided ${time}`)
      }
      if (!timeZoneRegex.test(timezone)) {
        errors.push(`- Timezone must be like UTC+01 or UTC-01! You provided ${timezone}`)
      }

      if (errors.length) {
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `Your entry had invalid inputs:\n${errors.join("\n")}\nPlease use /generate again and provide valid values`,
            flags: "64"
          },
        })
      }

      console.log({date, time, timezone});
      const dateString = `${date} ${time}`;
      const offset = timezoneOffsetsUtc[timezone];
      const timestamp = dateTimeToTimestamp(dateString, offset, true);

      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          embeds: [
            {
              type: 'rich',
              title: "Here are your generated timestamps",
              fields: [
                {
                  name: `Time only (<t:${timestamp}:t>)`,
                  value: `\`<t:${timestamp}:t>\``
                },
                {name: "\u200B", value: ""},
                {
                  name: `Date only (<t:${timestamp}:d>)`,
                  value: `\`<t:${timestamp}:d>\``
                },
                {name: "\u200B", value: ""},
                {
                  name: `Date only with month (<t:${timestamp}:D>)`,
                  value: `\`<t:${timestamp}:D>\``
                },
                {name: "\u200B", value: ""},
                {
                  name: `Date and Time (<t:${timestamp}:f>)`,
                  value: `\`<t:${timestamp}:f>\``
                },
                {name: "\u200B", value: ""},
                {
                  name: `Date and Time with Day of Week (<t:${timestamp}:F>)`,
                  value: `\`<t:${timestamp}:F>\``
                },
                {name: "\u200B", value: ""},
                {
                  name: `Relative (<t:${timestamp}:R>)`,
                  value: `\`<t:${timestamp}:R>\``
                }
              ]
            }
          ],
          flags: "64"
        }
      })
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

function dateTimeToTimestamp(dateTime, offset, raw = false, format = "f") {
  const [datePart, timePart] = dateTime.split(' ');
  const [day, month, year] = datePart.split('/').map(Number);
  const [hour, minute] = timePart.split(':').map(Number);

  let timeStamp;
  if (offset === undefined) {
    timeStamp = Date.UTC(year, month - 1, day, hour, minute) / 1000;
  } else {
    timeStamp = Date.UTC(year, month - 1, day, hour - offset, minute) / 1000;
  }
  if (raw) {
    return timeStamp;
  }

  return `<t:${timeStamp}:${format}>`;
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
