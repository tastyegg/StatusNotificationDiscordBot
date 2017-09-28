'use strict';
const getIP = require('external-ip')();
const Discord = require("discord.js");
const client = new Discord.Client();
var auth = require('./auth.json');
var config = require('./config.json');
var guildMember;

client.on('ready', () => {
	var channel = client.channels.find('id', config.channelID);
	
	// Get Member of this client
	guildMember = channel.guild.me;
	if (config.setIcon > 0) {
		channel.guild.setIcon('./icon_ready.png')
		.catch(console.error);
	}
	
	deletePreviousMessages(channel, function() {
		var readyEmbed = new Discord.RichEmbed()
		.setTitle("Minecraft Server is READY")
		.setDescription('Clicking the link or typing \'!cmd\' will prompt the server to open.')
		.setColor(0xF4B942)
		.setURL("https://tastyegg.github.io/StatusNotificationDiscordBot/");
		
		channel.send(readyEmbed);
	});
});

function deletePreviousMessages(channel, callback) {
	// Remove previous messages
	channel.fetchMessages().then(function(messages) {
		var channelMessages = messages.findAll('member', guildMember);
		
		var promisesDelete = [];
		
		channelMessages.forEach(function(message) {
			promisesDelete.push(message.delete());
		});
		
		Promise.all(promisesDelete).then(callback());
	});
}

client.on('message', msg => {
	if (msg.content === '!cmd') {
		// Get Channel
		var channel = msg.channel;
		
		// Get IP
		var externalIp = config.ip;
		getIP((err, ip) => {
			if (err) {
				console.log(err);
			}
			externalIp = ip;;
		});
		
		msg.delete().then(function() {
			// Edit the name and topic of the Channel
			channel.edit({
				name: 'online_chat',
				topic: 'Connect to ' + externalIp
			});
		});
		channel.send('Server is now ON', {tts: true}).then(function(onMessage) {
			deletePreviousMessages(channel, function() {
				
				// Draw Embed Message
				var onEmbed = new Discord.RichEmbed()
				.setTitle("Minecraft Server is ON")
				.setDescription('Connect in-game to ' + externalIp + '.')
				.setColor(0x1BB525);
				
				// Message Channel on Status
				channel.send(onEmbed).then(function(onEmbedMessage) {
					onEmbedMessage.pin().then(function(pinMessage) {
						if (config.setIcon > 0) {
							channel.guild.setIcon('./icon_on.png')
							.then(function() {
								process.exit();
							})
							.catch(console.error);
						} else {
							process.exit();
						}
					});
				});
			});
		});
	}
});

client.login(auth.token);