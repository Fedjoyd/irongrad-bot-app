const Type = require("../typedef.js");
const Discord = require("discord.js");
const Tmi = require('tmi.js');

/** @type {Discord.Client} */
var D_client;
/** @type {Tmi.Client} */
var T_client;
/** @type {Type.DatabaseManager} */
var DTB_manager;

/**
 * @param {Discord.Client} new_D_client The discord client
 * @param {Tmi.Client} new_T_client The twitch client
 * @param {Type.DatabaseManager} new_DTB_manager the database manager
 */
module.exports.setup = function(new_D_client, new_T_client, new_DTB_manager)
{
    D_client = new_D_client;
    T_client = new_T_client;
    DTB_manager = new_DTB_manager
}

// --- main ---

/**
 * @param {string} command The command
 * @param {string[]} args The command arguments
 * @param {Type.DiscordDataCmd} discord The discord data
 * @param {Type.TwitchDataCmd} twitch The twitch data
 * @param {Type.Permissible} userPermission The permission of user
 */
module.exports.run = async function(command, args, discord, twitch, userPermission)
{
    if (command === 'PING')
    {
        if (discord.is) { discord.message.reply('pong !'); }
        if (twitch.is) { T_client.say(twitch.channel, `@${twitch.tags.username}, pong !`); }
        Type.Logger.log('pong !');
    }
    if (command === 'PONG')
    {
        if (discord.is) { discord.message.reply('ping !'); }
        if (twitch.is) { T_client.say(twitch.channel, `@${twitch.tags.username}, ping !`); }
        Type.Logger.log('ping !');
    }
    if (command === 'HELLO')
    {
        if (discord.is) { discord.message.reply('heya !'); }
        if (twitch.is) { T_client.say(twitch.channel, `@${twitch.tags.username}, heya !`); }
        Type.Logger.log('heya !');
    }

    if (discord.is) { if(discord.message.deletable) { discord.message.delete({timeout:3000}); }}
}

// --- info ---

module.exports.info = {
    name: "template-JavaScript",
    commands: [ 'PING', 'PONG', 'HELLO' ],
    discord: true,
    twitch: true
}