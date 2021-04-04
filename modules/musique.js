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

/** @type {string[]} */
var roomName = [
    "metal",
    "chiptune",
    "electro"
];
/** @type {string[]} */
var roomUrl = [
    "https://w2g.tv/rooms/c7hl9yztg37lvlsrab",
    "https://w2g.tv/rooms/mjqbdws51hot66xofs",
    "https://w2g.tv/rooms/zj0xnrqpw9o5u3q9bt"
];
/** @type {string} */
var currentRoom = "";

/**
 * @param {string} command The command
 * @param {string[]} args The command arguments
 * @param {Type.DiscordDataCmd} discord The discord data
 * @param {Type.TwitchDataCmd} twitch The twitch data
 * @param {Type.Permissible} userPermission The permission of user
 */
module.exports.run = async function(command, args, discord, twitch, userPermission)
{
    if (discord.is) {
        if (discord.message.deletable) { discord.message.delete({timeout:3000}); }
        
        // --- basic ---
        if (args.length == 0)
        {
            RoomIndex = roomName.indexOf(currentRoom);
            if (RoomIndex == -1)
            {
                discord.message.reply("la musique n'est actuellement pas disponible !");
                return;
            }
            discord.message.reply(currentRoom + " -> " + roomUrl[RoomIndex]);
        }
        if (args.length == 1 && userPermission.isModAdm())
        {
            if (args[0].toUpperCase() == 'UNSET') {
                currentRoom = "";
                discord.message.reply("sucessfully unset !");
                Type.Logger.log("musique room was sucessfully unset");
            }
        }
        if (args.length == 2 && userPermission.isModAdm())
        {
            if (args[0].toUpperCase() == 'SET') {
                currentRoom = args[1];
                discord.message.reply("sucessfully set to '" + currentRoom + "' !");
                Type.Logger.log("musique room was sucessfully set to '" + currentRoom + "'");
            }
        }
        if (args.length == 3 && userPermission.isAdministrator)
        {
            if (args[0].toUpperCase() == 'ADD') {
                roomName.push(args[1]);
                roomUrl.push(args[2]);
                discord.message.reply("room " + args[1] + "(" + args[2] + ") succesfullly added !");
                Type.Logger.log("musique room " + args[1] + "(" + args[2] + ") succesfullly added");
            }
        }
    }

    if (twitch.is) {
        RoomIndex = roomName.indexOf(currentRoom);
        if (RoomIndex == -1)
        {
            T_client.say(twitch.channel, `@${twitch.tags.username}, la musique n'est actuellement pas disponible !`);
            return;
        }

        if (args.length > 0) { T_client.say(twitch.channel, `${args[0]} -> ${roomUrl[RoomIndex]}`); }
        else { T_client.say(twitch.channel, `@${twitch.tags.username} -> ${roomUrl[RoomIndex]}`); }
    }
}

// --- info ---

module.exports.info = {
    name: "musique",
    commands: ['MUSIQUE', 'MUSIC'],
    discord: true,
    twitch: true
}