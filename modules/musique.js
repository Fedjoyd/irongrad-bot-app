const Discord = require("discord.js");
const Tmi = require('tmi.js');
const OBSWebSocket = require('obs-websocket-js');

var D_client;
var T_client;
var O_client;

module.exports.sendClient = function(new_D_client, new_T_client, new_O_client)
{
    D_client = new_D_client;
    T_client = new_T_client;
    O_client = new_O_client;
}

// --- main ---

var roomName = [
    "metal",
    "chiptune",
    "electro"
];
var roomUrl = [
    "https://w2g.tv/rooms/c7hl9yztg37lvlsrab",
    "https://w2g.tv/rooms/mjqbdws51hot66xofs",
    "https://w2g.tv/rooms/zj0xnrqpw9o5u3q9bt"
];
var currentRoom = "";

module.exports.run = async function(command, args, discord, twitch)
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
            discord.message.reply(roomUrl[RoomIndex]);
        }
        if (args.length == 1)
        {
            if (args[0].toUpperCase() == 'UNSET') { currentRoom = ""; discord.message.reply("sucessfully unset !"); }
        }
        if (args.length == 2)
        {
            if (args[0].toUpperCase() == 'SET') { currentRoom = args[1]; discord.message.reply("sucessfully set !");}
        }
        if (args.length == 3)
        {
            if (args[0].toUpperCase() == 'ADD') {
                roomName.push(args[1]);
                roomUrl.push(args[2]);
                discord.message.reply("room " + args[1] + "(" + args[2] + ") succesfullly added !");
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