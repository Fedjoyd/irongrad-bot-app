require("dotenv").config();

// ------ discord ------
//
const Discord = require("discord.js");
const client = new Discord.Client();

client.on("ready", () => {
    console.log("I'm ready !");
});

client.on("message", msg => {
    if (msg.content === "ping") {
        msg.reply("pong");
    }
});

client.login(process.env.DISCORD_BOT_TOKEN);

// ------ twitch ------
//
const tmi = require('tmi.js');

const client = new tmi.Client({
	options: { debug: true, messagesLogLevel: "info" },
	connection: {
		reconnect: true,
		secure: true
	},
	identity: {
		username: 'IrongradBot',
		password: ('oauth:' + process.env.TWITCH_OAUTH_TOKEN)
	},
	channels: [ 'irongradtv' ]
});

client.connect().catch(console.error);

client.on('message', (channel, tags, message, self) => {
	if(self) return;
	if(message.toLowerCase() === '!hello') {
		client.say(channel, `@${tags.username}, heya!`);
	}
});