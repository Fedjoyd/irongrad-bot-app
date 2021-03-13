const Discord = require("discord.js");
const Tmi = require('tmi.js');

module.exports.DiscordDataCmd = class {
    /**
     * @param {boolean} is
     * @param {Discord.Message} message 
     */
    constructor(is, message) {
        this.is = is;
        this.message = message;
    }
}

module.exports.TwitchDataCmd = class {
    /**
     * @param {boolean} is
     * @param {string} channel 
     * @param {Tmi.Userstate} tags 
     * @param {string} message 
     */
    constructor(is, channel, tags, message) {
        this.is = is;
        this.channel = channel;
        this.tags = tags;
        this.message = message;
    }
}