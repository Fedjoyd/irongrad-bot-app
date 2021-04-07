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
    DTB_manager = new_DTB_manager;
}

// --- main ---

/** @type {boolean} */
var activated = false;
/** @type {string[]} */
var listChaine = [ 'irongradtv' ];
/** @type {string} */
var host = "https://multitwitch.tv/";
/** @type {string} */
var separator = "/";
/** @type {string} */
var end = "";

/** @type {string} */
var currentURL = "https://multitwitch.tv/irongradtv";

regenerateURL = function() {
    currentURL = host;

    for (it = 0; it < listChaine.length; it++) {
        if (it != 0) { currentURL = currentURL + separator; }
        currentURL = currentURL + listChaine[it];
    }

    currentURL = currentURL + end;
}

/**
 * @param {string} command The command
 * @param {string[]} args The command arguments
 * @param {Type.DiscordDataCmd} discord The discord data
 * @param {Type.TwitchDataCmd} twitch The twitch data
 * @param {Type.Permissible} userPermission The permission of user
 */
module.exports.run = async function(command, args, discord, twitch, userPermission)
{
    hasDoCommand = false;

    if (args.length > 0) {
        firstArgMaj = args[0].toUpperCase();
        if (firstArgMaj == "ACTIVATE" && userPermission.isModAdm) { activated = true; Type.Logger.log("multistream activated"); hasDoCommand = true; }
        if (firstArgMaj == "DESACTIVATE" && userPermission.isModAdm) { activated = false; Type.Logger.log("multistream desactivated"); hasDoCommand = true; }
        if (firstArgMaj == "ADD" && userPermission.isAdministrator && args.length > 1 && discord.is) {
            for (ite = 1; ite < args.length; ite++) {
                listChaine.push(args[ite]);
                Type.Logger.log(args[ite] + " was added to multistream");
            }
            regenerateURL();
            hasDoCommand = true;
        }
        if (firstArgMaj == "RESET" && userPermission.isAdministrator && discord.is) {
            listChaine = [ 'irongradtv' ];
            Type.Logger.log("multistream was reset to irongradtv");
            regenerateURL();
            hasDoCommand = true;
        }
        if (firstArgMaj == "SETHOST" && userPermission.isAdministrator && args.length > 1 && discord.is) {
            host = args[1];
            Type.Logger.log("multistream host was set to '" + host + "'");
            regenerateURL();
            hasDoCommand = true;
        }
        if (firstArgMaj == "SETSEPARATOR" && userPermission.isAdministrator && args.length > 1 && discord.is) {
            separator = args[1];
            Type.Logger.log("multistream separator was set to '" + separator + "'");
            regenerateURL();
            hasDoCommand = true;
        }
        if (firstArgMaj == "SETEND" && userPermission.isAdministrator && args.length > 1 && discord.is) {
            end = args[1];
            Type.Logger.log("multistream end was set to '" + end + "'");
            regenerateURL();
            hasDoCommand = true;
        }
    }

    if (discord.is) { if(discord.message.deletable) { discord.message.delete({timeout:3000}); }}
    if (hasDoCommand) {
        if (discord.is) { discord.message.reply("command was succesfully executed !"); }
        return; 
    }

    if (discord.is) {
        if (activated) { discord.message.reply(currentURL); }
        else { discord.message.reply("il n'y a pas de multistream actuellement !"); }
    }

    if (twitch.is) {
        if (activated) {
            if (args.length > 0) { T_client.say(twitch.channel, `${args[0]} -> ${currentURL}`); }
            else { T_client.say(twitch.channel, `@${twitch.tags.username} -> ${currentURL}`); }
        }
        else {
            T_client.say(twitch.channel, `@${twitch.tags.username}, il n'y a pas de multistream actuellement !`);
        }
    }
}

// --- info ---

module.exports.info = {
    name: "multistream",
    commands: [ 'MULTISTREAM', 'MULTITWITCH' ],
    discord: true,
    twitch: true
}