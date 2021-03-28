const event = require('events');
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

// ---- Permissible ----

module.exports.PermissibleEvents = new event.EventEmitter();

module.exports.Permissible = class {
    constructor() {
        /**
         * @param {Discord.Guild} Guild
         * @param {Discord.User} User
         */
        this.setDiscordUser = function(Guild, User) {
            if (Guild === undefined || Guild === null) { return; }

            const GMember = Guild.member(User);
            if (GMember !== undefined) { if (GMember.permissions.has(Discord.Permissions.FLAGS.ADMINISTRATOR)) { this.isAdministrator = true; }}

            module.exports.PermissibleEvents.emit('discord', this, Guild, User);
        }
        
        /**
         * @param {Tmi.Userstate} User 
         */
        this.setTwitchUser = function(User) {
            if (User.badges.broadcaster) { this.isAdministrator = true; }
            if (User.badges.moderator) { this.isModerator = true; }
            if (User.subscriber) { this.isSubscriber = true; }
            
            module.exports.PermissibleEvents.emit('twitch', this, User);
        }

        /**
         * @returns {boolean}
         */
        this.isModAdm = function() { return (this.isAdministrator || this.isModerator); }

        /**
         * @returns {boolean}
         */
        this.isSubModAdm = function() { return (this.isAdministrator || this.isModerator || this.isSubscriber); }

        this.isAdministrator = false;
        this.isModerator = false;
        this.isSubscriber = false;
    }
}

// ---- Logger ----

module.exports.LoggerEvents = new event.EventEmitter();

module.exports.Logger = class {
    constructor() {}

    /**
     * @param {string} message
     */
    static log = function(message) {
        console.log(message);
        module.exports.LoggerEvents.emit('log', message);
    }

    /**
     * @param {string} message
     */
    static warn = function(message) {
        console.warn(message);
        module.exports.LoggerEvents.emit('warn', message);
    }

    /**
     * @param {string} message
     */
    static severe = function(message) {
        console.severe(message);
        module.exports.LoggerEvents.emit('severe', message);
    }
}