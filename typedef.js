const events = require('events');
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

var administratorRoles = '';
var moderatorRoles = '';
var subscriberRoles = '';

/**
 * @param {string} newAdministratorRoles
 */
 module.exports.setAdministratorRoles = function (newAdministratorRoles) {
    administratorRoles = newAdministratorRoles;
};

/**
 * @param {string} newModeratorRoles
 */
module.exports.setModeratorRoles = function (newModeratorRoles) {
    moderatorRoles = newModeratorRoles;
};

/**
 * @param {string} newSubscriberRoles
 */
module.exports.setSubscriberRoles = function (newSubscriberRoles) {
    subscriberRoles = newSubscriberRoles;
};

module.exports.Permissible = class {
    constructor() {
        /**
         * @param {Discord.Guild} Guild
         * @param {Discord.User} User
         */
        this.setDiscordUser = function(Guild, User) {
            if (Guild === undefined || Guild === null) {
                return;
            }

            const GMember = Guild.member(User);
            if (GMember !== undefined) {
                if (GMember.permissions.has(Discord.Permissions.FLAGS.ADMINISTRATOR)) { this.isAdministrator = true; }
                if (GMember.roles.cache.has(administratorRoles) && administratorRoles != '') { this.isAdministrator = true; }
                if (GMember.roles.cache.has(moderatorRoles) && moderatorRoles != '') { this.isModerator = true; }
                if (GMember.roles.cache.has(subscriberRoles) && subscriberRoles != '') { this.isSubscriber = true; }
            }
        }
        
        /**
         * @param {Tmi.Userstate} User 
         */
        this.setTwitchUser = function(User) {
            if (User.badges.broadcaster) { this.isAdministrator = true; }
            if (User.badges.moderator) { this.isModerator = true; }
            if (User.subscriber) { this.isSubscriber = true; }
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

module.exports.Logger = class {
    constructor() {
        this.EvHan = new events.EventEmitter();

        /**
         * @param {string} message
         */
        this.log = function(message) {
            console.log(message);
            this.EvHan.emit('log', message);
        }

        /**
         * @param {string} message
         */
        this.warn = function(message) {
            console.warn(message);
            this.EvHan.emit('warn', message);
        }

        /**
         * @param {string} message
         */
        this.severe = function(message) {
            console.severe(message);
            this.EvHan.emit('severe', message);
        }
    }
}