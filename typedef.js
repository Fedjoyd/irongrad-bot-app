const event = require('events');
const Discord = require("discord.js");
const Tmi = require('tmi.js');
var mysql = require('mysql');

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
         * @param {Discord.Message} Message
         */
        this.setDiscordUser = function(Guild, User, Message) {
            if (Guild !== undefined && Guild !== null) {
                const GMember = Guild.member(User);
                if (GMember !== undefined) { if (GMember.permissions.has(Discord.Permissions.FLAGS.ADMINISTRATOR)) { this.isAdministrator = true; }}
            }

            module.exports.PermissibleEvents.emit('discord', this, Guild, User, Message);
        }
        
        /**
         * @param {Tmi.Userstate} User 
         * @param {string} Channel
         */
        this.setTwitchUser = function(User, Channel) {
            if (User.badges.broadcaster) { this.isAdministrator = true; }
            if (User.badges.moderator) { this.isModerator = true; }
            if (User.subscriber) { this.isSubscriber = true; }
            
            module.exports.PermissibleEvents.emit('twitch', this, User, Channel);
        }

        /**
         * @returns {boolean}
         */
        this.isModAdm = function() { return (this.isAdministrator || this.isModerator); }

        /**
         * @returns {boolean}
         */
        this.isSubModAdm = function() { return (this.isAdministrator || this.isModerator || this.isSubscriber); }

        this.canExecuteCommand = true;

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

// ---- DatabaseManager ----

module.exports.DatabaseManager = class {
    /**
     * @param {string} new_host 
     * @param {string} new_user 
     * @param {string} new_password 
     * @param {string} new_defaultDatabase 
     */
    constructor(new_host, new_user, new_password, new_defaultDatabase) {
        this.host = new_host;
        this.user = new_user;
        this.password = new_password;
        this.defaultDatabase = new_defaultDatabase;

        /**
         * @returns {mysql.Connection}
         */
        this.getDefaultConnection = function() {
            var toReturnConnection = mysql.createConnection({
                host     : this.host,
                user     : this.user,
                password : this.password,
                database : this.defaultDatabase
            });

            toReturnConnection.connect(function(err, args) {
                //if (err) module.exports.Logger.severe(err.code + "(" + err.errno + ", " + (err.fatal ? "fatal" : "not fatal") + ") " + err.name + " : " + err.message);
                if (err) module.exports.Logger.severe('error connecting MYSQL : ' + err.stack);
            });

            return toReturnConnection;
        }

        /**
         * @param {string} the_Database
         * @returns {mysql.Connection}
         */
        this.getConnection = function(the_Database) {
            var toReturnConnection = mysql.createConnection({
                host     : this.host,
                user     : this.user,
                password : this.password,
                database : the_Database
            });

            toReturnConnection.connect(function(err, args) {
                //if (err) module.exports.Logger.severe(err.code + "(" + err.errno + ", " + (err.fatal ? "fatal" : "not fatal") + ") " + err.name + " : " + err.message);
                if (err) module.exports.Logger.severe('error connecting MYSQL : ' + err.stack);
            });
            
            return toReturnConnection;
        }

        /**
         * @param {mysql.Connection} theConnection
         */
        this.endConnection = function(theConnection) {
            theConnection.end(function(err){
                //if (err) module.exports.Logger.severe(err.code + "(" + err.errno + ", " + (err.fatal ? "fatal" : "not fatal") + ") " + err.name + " : " + err.message);
                if (err) module.exports.Logger.severe('error disconnecting MYSQL : ' + err.stack);
            });
        }
    }
}