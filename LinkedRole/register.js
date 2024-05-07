const fetch = require("node-fetch");
const config = require('../config.js');

/**
 * Register the metadata to be stored by Discord. This should be a one time action.
 * Note: uses a Bot token for authentication, not a user token.
 */

async function registerMetadata() {

const url = `https://discord.com/api/v10/applications/${config.DISCORD_CLIENT_ID}/role-connections/metadata`;
// supported types: number_lt=1, number_gt=2, number_eq=3 number_neq=4, datetime_lt=5, datetime_gt=6, boolean_eq=7, boolean_neq=8
const body = [
  {
    key: 'mailbox',
    name: "mailbox created",
    description: "User has created a mailbox",
    type: 7,
  },
  {
    key: 'whitelisted',
    name: "added to server",
    description: "User can join the minecraft server",
    type: 7,
  },
  {
    key: 'mailboxx',
    name: "mailbox created",
    description: "user has mailbox (ignore)",
    type: 2,
  },
  {
    key: 'mailboxy',
    name: "mailbox created",
    description: "user has mailbox (ignore)",
    type: 2,
  },
  {
    key: 'mailboxz',
    name: "mailbox created",
    description: "user has mailbox (ignore)",
    type: 2,
  }

];


const response = await fetch(url, {
  method: 'PUT',
  body: JSON.stringify(body),
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bot ${config.BotToken}`,
  },
});
if (response.ok) {
  const data = await response.json();
  console.log(data);
} else {
  //throw new Error(`Error pushing discord metadata schema: [${response.status}] ${response.statusText}`);
  const data = await response.text();
  console.log(data);
}

}

registerMetadata();