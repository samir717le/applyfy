const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require("fs");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent, 
        GatewayIntentBits.GuildMembers
    ] 
});

const TOKEN = process.env.TOKEN;
const GUILD_ID = process.env.GUILD;
const REDIRECT_URL = process.env.REDIRECT_URL;

let CHANNEL_ID = null;

client.once('ready', () => {
    console.log('Bot is online!');
});

const fetchGuildData = async () => {
    const guild = await client.guilds.fetch(GUILD_ID);
    const channel = await client.channels.fetch(CHANNEL_ID);
    return { guild, channel };
};

app.post('/set', async (req, res) => {
    const { channelId } = req.body;
    const data = `CHANNEL_ID = '${channelId}';\n`;
    fs.appendFile("config.js", data, (err) => {
        if (err) { 
            res.status(500).end(err);
            throw err;
        }
        CHANNEL_ID = channelId;
        res.status(200).end("Channel ID set successfully");
    });
});

require("./config.js");

app.post('/accept', async (req, res) => {
    const { userId, roleId } = req.body;

    try {
        const { guild, channel } = await fetchGuildData();
        const member = await guild.members.fetch(userId).catch(err => {
            console.error(`Failed to fetch member: ${err}`);
            return null;
        });
        const role = await guild.roles.fetch(roleId).catch(err => {
            console.error(`Failed to fetch role: ${err}`);
            return null;
        });

        if (member && role) {
            await member.roles.add(role);
            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle('Staff Results')
                .setDescription(`${member} You Accepted As ${role.name}`);

            await channel.send({ embeds: [embed] });
            res.status(200).send('Role assigned and embed sent.');
            // res.redirect(REDIRECT_URL);
        } else {
            res.status(400).send('Member or role not found.');
        }
    } catch (err) {
        const { channel } = await fetchGuildData();
        const embed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle('Bot Problem')
            .setDescription(`Failed to assign the role. Error: ${err.message}`);

        await channel.send({ embeds: [embed] });
        res.status(500).send(`Failed to assign role: ${err.message}`);
    }
});

app.post('/deny', async (req, res) => {
    const { userId, reason } = req.body;
    console.log(userId, reason);
    try {
        const { guild, channel } = await fetchGuildData();
        const member = await guild.members.fetch(userId).catch(err => {
            console.error(`Failed to fetch member: ${err}`);
            return null;
        });

        if (member) {
            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('Staff Results')
                .setDescription(`${member} are not acceptable \n Reason: ${reason}`);

            await channel.send({ embeds: [embed] });
            res.status(200).send('Failure embed sent.');
            // res.redirect(REDIRECT_URL);
        } else {
            res.status(400).send('Member not found.');
        }
    } catch (err) {
        res.status(500).send(`Failed to send denial embed: ${err.message}`);
    }
});

client.login(TOKEN);

app.listen(3000, () => {
    console.log('API server is running on port 3000');
});
