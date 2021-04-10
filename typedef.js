const event = require('events');
const Discord = require("discord.js");
const Tmi = require('tmi.js');
const mysql = require('mysql');
const bluebird = require('bluebird');

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
        this.canExecuteCommand = true;

        this.isAdministrator = false;
        this.isModerator = false;
        this.isVIP = false;
        this.isSubscriber = false;

        this.permissions = 0;

        this.m_listPromise = [ bluebird.delay(100) ];
    }
    
    /**
     * @type {boolean}
     * @readonly
     */
    get isModAdm() { return (this.isAdministrator || this.isModerator); }
    
    /**
     * @type {boolean}
     * @readonly
     */
    get isVipModAdm() { return (this.isAdministrator || this.isModerator || this.isVIP); }

    /**
     * @type {bluebird<void>}
     * @readonly
     */
    get async() { return bluebird.all(this.m_listPromise); }

    /**
      * @param {Discord.Guild} Guild
      * @param {Discord.User} User
      * @param {Discord.Message} Message
      */
    setDiscordUser(Guild, User, Message) {
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
    setTwitchUser(User, Channel) {
        if (User.badges.broadcaster) { this.isAdministrator = true; }
        if (User.badges.moderator) { this.isModerator = true; }
        if (User.badges.vip) { this.isVIP = true; }
        if (User.subscriber) { this.isSubscriber = true; }
        
        module.exports.PermissibleEvents.emit('twitch', this, User, Channel);
    }

    /**
     * @param {bluebird<void>} thePromise 
     */
    addPromise(thePromise) {
        this.m_listPromise.push(thePromise);
    }
}

// ---- Logger ----

module.exports.LoggerEvents = new event.EventEmitter();

module.exports.Logger = class {
    constructor() {}

    static log(message, ...optionnalParm) {
        console.log(message, ...optionnalParm);
        module.exports.LoggerEvents.emit('log', message, ...optionnalParm);
    }

    static warn(message, ...optionnalParm) {
        console.warn(message, ...optionnalParm);
        module.exports.LoggerEvents.emit('warn', message, ...optionnalParm);
    }

    static severe(message, ...optionnalParm) {
        console.severe(message, ...optionnalParm);
        module.exports.LoggerEvents.emit('severe', message, ...optionnalParm);
    }
}

// ---- DatabaseManager ----

module.exports.DatabaseManager = class {
    /**
     * @param {string} new_host 
     * @param {string} new_user 
     * @param {string} new_password 
     * @param {string} new_defaultDatabase
     * @param {number} new_DtbCooldown
     */
    constructor(new_host, new_user, new_password, new_defaultDatabase, new_DtbCooldown = 3600000) {
        this.host = new_host;
        this.user = new_user;
        this.password = new_password;
        this.defaultDatabase = new_defaultDatabase;
        this.DtbCooldown = new_DtbCooldown;

        /** @type {mysql.Connection[]} */
        this.m_listConnection = [];
    }

    /**
     * @param {string} DatabaseToOpen 
     */
    async startConnection(DatabaseToOpen) {
        if (this.m_listConnection[DatabaseToOpen] !== undefined && this.m_listConnection[DatabaseToOpen] !== null) return;

        this.m_listConnection[DatabaseToOpen] = mysql.createConnection({
            host: this.host,
            user: this.user,
            password: this.password,
            database: DatabaseToOpen
        });

        this.m_listConnection[DatabaseToOpen].connect(function(err, args) { if (err) module.exports.Logger.severe(err); });

        setTimeout(function(lstConnection, dtbToClose){
            lstConnection[dtbToClose].end(function(err) { if (err) module.exports.Logger.warn(err); });
            lstConnection[dtbToClose] = null;
        }, this.DtbCooldown, this.m_listConnection, DatabaseToOpen);
    }

    /**
     * @param {string} query
     * @returns {Promise<any, mysql.FieldInfo[]>}
     */
    async queryDefaultDatabase(query) {
        await this.startConnection(this.defaultDatabase);

        var the_manager = this;

        return new Promise(function(resolve, reject){
            the_manager.m_listConnection[the_manager.defaultDatabase].query(query, function(err, results, fields) {
                if (err) reject(err);
                resolve(results, fields);
            });
        });
    }

    /**
     * @param {string} Database 
     * @param {string} query
     * @returns {Promise<any, mysql.FieldInfo[]>}
     */
    async queryDatabase(Database, query) {
        await this.startConnection(Database);

        var the_manager = this;

        return new Promise(function(resolve, reject){
            the_manager.m_listConnection[Database].query(query, function(err, results, fields) {
                if (err) reject(err);
                resolve(results, fields);
            });
        });
    }
}