const Discord = require("discord.js");
const client = new Discord.Client();
var auth = require('./auth.json');
var config = require('./config.json');
var guildMember;

client.on('ready', () => {
	var channel = client.channels.find('id', config.channelID);
	
	// Edit the name and topic of the Channel
	channel.edit({
		name: 'offline_chat',
		topic: ' '
	});
	
	// Get Member of this client
	guildMember = channel.guild.me;
	if (config.setIcon > 0) {
		channel.guild.setIcon('./icon_off.png')
		.catch(console.error);
	}
	
	deletePreviousMessages(channel, function() {
		var offEmbed = new Discord.RichEmbed()
		.setTitle("Minecraft Server is OFF")
		.setDescription('The owner\'s server cannot be accessed atm.')
		.setFooter('Contact the owner for details')
		.setColor(0xAF4036);
		
		channel.send(offEmbed).then(function() {
			process.exit();
		});
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

client.login(auth.token);