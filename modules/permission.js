const Type = require("../typedef.js");
const Discord = require("discord.js");
const Tmi = require('tmi.js');
const bluebird = require('bluebird');
var shajs = require('sha.js')

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

    Type.PermissibleEvents.on('discord', discordChecker);
    Type.PermissibleEvents.on('twitch', twitchChecker);

    DTB_manager.queryDefaultDatabase("SELECT * FROM `channel_for_cmd`").then(function(result) {
        result.forEach(function(current) {
            discordCmdChannel.push(current.ID);
            Type.Logger.log("[PERMISSION] : channel received from DTB : " + current.ID);
        });
    }).catch(Type.Logger.error);
}

// --- main permission check ---

/**
 * @param {Type.Permissible} userPermission 
 * @param {Discord.Guild} Guild 
 * @param {Discord.User} User 
 * @param {Discord.Message} Message 
 */
var discordChecker = function(userPermission, Guild, User, Message) {
    if (!Message.content.startsWith("!perm")) { if (discordCmdChannel.indexOf(Message.channel.id) == -1 && discordCmdChannel.length > 0) {
        userPermission.canExecuteCommand = false;
        return;
    }}

    userPermission.addPromise(bluebird.resolve(DTB_manager.queryDefaultDatabase("SELECT * FROM `account` WHERE `discord` = '" + User.id + "'")).then(function(result) {
        if (result.length > 0) {
            userPermission.permissions = result[0].permissions;
            userPermission.isAdministrator = userPermission.isAdministrator || result[0].isAdministrator;
            userPermission.isModerator = userPermission.isModerator || result[0].isModerator;
            userPermission.isVIP = userPermission.isVIP || result[0].isVIP;
            userPermission.isSubscriber = userPermission.isSubscriber || result[0].isSubscriber;
        }
        else {
            DTB_manager.queryDefaultDatabase("INSERT INTO `account` (`discord`, `isAdministrator`) VALUES ('" + User.id + "', '" + (userPermission.isAdministrator ? "1" : "0") + "')").catch(Type.Logger.error);
        }
    }).catch(Type.Logger.error));
}

/**
 * @param {Type.Permissible} userPermission 
 * @param {Tmi.Userstate} User 
 * @param {string} Channel 
 */
var twitchChecker = function(userPermission, User, Channel) {
    userPermission.addPromise(bluebird.resolve(DTB_manager.queryDefaultDatabase("SELECT * FROM `account` WHERE `twitch` = '" + User.username + "'")).then(function(result) {
        if (result.length > 0) {
            userPermission.permissions = result[0].permissions;
            userPermission.isAdministrator = userPermission.isAdministrator || result[0].isAdministrator;
            userPermission.isModerator = userPermission.isModerator || result[0].isModerator;
            userPermission.isVIP = userPermission.isVIP || result[0].isVIP;

            if (userPermission.isSubscriber != result[0].isSubscriber) {
                DTB_manager.queryDefaultDatabase("UPDATE `account` SET `isSubscriber` = '" + (userPermission.isSubscriber ? "1" : "0") + "' WHERE `account`.`ID` = " + result[0].ID + ";").catch(Type.Logger.error);
            }
        }
    }).catch(Type.Logger.error));
}

// --- cmd channel ---

/** @type {string[]} */
var discordCmdChannel = [];

/**
 * @param {string} command The command
 * @param {string[]} args The command arguments
 * @param {Type.DiscordDataCmd} discord The discord data
 * @param {Type.TwitchDataCmd} twitch The twitch data
 * @param {Type.Permissible} userPermission The permission of user
 */
module.exports.run = async function(command, args, discord, twitch, userPermission)
{
    if (discord.is && userPermission.isAdministrator) {
        if (args.length > 0) {
            var firstArgToUpper = args[0].toUpperCase();
            if (firstArgToUpper == "SETCHANNEL") { if (discordCmdChannel.indexOf(discord.message.channel.id)) {
                discordCmdChannel.push(discord.message.channel.id);

                await DTB_manager.queryDefaultDatabase("INSERT INTO `channel_for_cmd` (`ID`) VALUES ('" + discord.message.channel.id + "')").catch(Type.Logger.error);

                Type.Logger.log("[PERMISSION] : added a channel to execute command : " + discordCmdChannel[discordCmdChannel.length - 1]);
            }}
            if (firstArgToUpper == "RESETCHANNEL") {
                discordCmdChannel = [];

                await DTB_manager.queryDefaultDatabase("TRUNCATE `channel_for_cmd`").catch(Type.Logger.error);

                Type.Logger.log("[PERMISSION] : channels of cmd executor was reseted");
            }
        }
    }

    if (discord.is && discord.message.guild === null) {
        if (args.length > 0) {
            var firstArgToUpper = args[0].toUpperCase();
            if (firstArgToUpper == "SETTWITCH" && args.length > 1) {
                var twtUsername = args[1].replace("'", "%30%").replace('"', "%31%");

                const results = await DTB_manager.queryDefaultDatabase("SELECT * FROM `account` WHERE `twitch` = '" + twtUsername + "'");
                if (results.length > 0) { if (results[0].discord != discord.message.author.id) {
                    discord.message.reply("this twitch account are already linked (si c'est votre compte contacter fedjoyd5(!fedjoyd5#7367) immediatement)");
                    return;
                }}

                DTB_manager.queryDefaultDatabase("UPDATE `account` SET `twitch` = '" + twtUsername + "' WHERE `account`.`discord` = '" + discord.message.author.id + "';").then(function(results) {
                    discord.message.reply("twitch account successfully linked");
                }).catch(Type.Logger.error);
            }
            if (firstArgToUpper == "SETPASSWORD" && args.length > 1) {
                var Password = args[1].replace("'", "%30%").replace('"', "%31%");
                for (inter = 2; inter < args.length; inter++) { var Password = Password + " " + args[inter].replace("'", "%30%").replace('"', "%31%"); }
                
                DTB_manager.queryDefaultDatabase("UPDATE `account` SET `password` = '" + shajs('sha256').update(Password).digest('hex') + "' WHERE `account`.`discord` = '" + discord.message.author.id + "';").then(function(results) {
                    discord.message.reply("password successfully set");
                }).catch(Type.Logger.error);
            }
        }
    }

    if (discord.is) { if(discord.message.deletable) { discord.message.delete({timeout:3000}); }}
}

// --- info ---

module.exports.info = {
    name: "permission-checker",
    commands: [ 'PERMISSION', 'PERM' ],
    discord: true,
    twitch: false
}