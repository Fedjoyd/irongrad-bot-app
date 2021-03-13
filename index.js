require("dotenv").config();

// ------ discord init ------
//
const Discord = require("discord.js");
const D_client = new Discord.Client();

// ------ twitch init ------
//
const Tmi = require('tmi.js');
const T_client = new Tmi.Client({
	options: { debug: true, messagesLogLevel: "info" },
	connection: {
		reconnect: true,
		secure: true
	},
	identity: {
		username: 'IrongradBot',
		password: ('oauth:' + process.env.TWITCH_OAUTH_TOKEN)
	},
	channels: [ '#irongradtv', '#krurakark' ]
});

// ------ OBS init ------
//
const OBSWebSocket = require('obs-websocket-js');
const O_client = new OBSWebSocket();

var OBS_Connected = false;
var OBS_connect = function(O_address, O_password) { if (!OBS_Connected) { O_client.connect({ address: O_address, password: O_password }); }};
var OBS_disconnect = function() { if (OBS_Connected) { O_client.disconnect(); }};

// ---- module init ----
//
const fs = require('fs');

const modulesFolder = './modules/';
var modules = [];

const cmd_string = process.env.CMD_STRING;

console.log('');
console.log('loading modules :');
indexModInit = 0;
fs.readdirSync(modulesFolder).forEach(file => {
	if (file.endsWith(".js")) {
		modules.push(require(modulesFolder + file));
		modules[indexModInit].sendClient(D_client, T_client, O_client);

		console.log(' - ' + file + '(' + modules[indexModInit].info.name + ') ... LOADED');
		indexModInit++;
	}
});

console.log('');

//
// ------ discord ------
//

D_client.on("ready", () => {
    console.log("discord Bot ... READY !");
});

D_client.on("message", message => {
	if (message.content.startsWith(cmd_string) && !message.author.bot) {
		CMD_executor(message.content.substr(cmd_string.length), { is:true, message:message }, { is:false });
	}
});

D_client.login(process.env.DISCORD_BOT_TOKEN);

//
// ------ twitch ------
//

T_client.connect().catch(console.error);

T_client.on('message', (channel, tags, message, self) => {
	if (message.startsWith(cmd_string) && !self) {
		CMD_executor(message.substr(cmd_string.length), { is:false }, { is:true, channel:channel, tags:tags, message:message });
	}
});

//
// ------ OBS ------
//

O_client.on('ConnectionOpened', data => {
    console.log("OBSWebSocket ... READY !");
});
O_client.on('ConnectionClosed', data => {
    console.log("OBSWebSocket ... DISCONNECTED !");
	OBS_Connected = false;
});
O_client.on('AuthenticationSuccess', data => {
    console.log("OBSWebSocket ... AUTHENTIFIED !");
	OBS_Connected = true;
});

//
// --------- Command Executor ---------
//

var CMD_executor = function(query, discord, twitch)
{
	firstSpaceIndex = query.indexOf(' ');
	command = (firstSpaceIndex == -1 ? query : query.substring(0, firstSpaceIndex)).toUpperCase();
	args = (firstSpaceIndex == -1 ? [] : query.substring(firstSpaceIndex + 1).split(' '));

	modules.forEach(mod => {
		if ((mod.info.discord && discord.is || mod.info.twitch && twitch.is) && mod.info.commands.indexOf(command) != -1)
		{
			mod.run(command, args, discord, twitch);
		}
	});
}

/**/