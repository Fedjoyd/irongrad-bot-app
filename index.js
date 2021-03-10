require("dotenv").config();

// ------ discord init ------
//
const Discord = require("discord.js");
const D_client = new Discord.Client();

// ------ twitch init ------
//
const tmi = require('tmi.js');
const T_client = new tmi.Client({
	options: { debug: true, messagesLogLevel: "info" },
	connection: {
		reconnect: true,
		secure: true
	},
	identity: {
		username: 'IrongradBot',
		password: ('oauth:' + process.env.TWITCH_OAUTH_TOKEN)
	},
	channels: [ '#irongradtv' ]
});

//
// ------ discord ------
//

D_client.on("ready", () => {
    console.log("I'm ready !");
});

D_client.on("message", msg => {
    if (msg.content === "ping") {
        msg.reply("pong");
    }
});

D_client.login(process.env.DISCORD_BOT_TOKEN);

//
// ------ twitch ------
//

T_client.connect().catch(console.error);

T_client.on('message', (channel, tags, message, self) => {
	if(self) return;
	if(message.toLowerCase() === '!hello') {
		T_client.say(channel, `@${tags.username}, heya!`);
	}
});