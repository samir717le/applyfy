const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers] });

const TOKEN = 'MTI2ODM4MTQ3NDQ3MDYyNTI4MQ.G4dCPq.AU00yHnUM0OwtItP0_JBhEbcyN4nGzCXcHZ2ik';
const GUILD_ID = '1257155419181285377';
const CHANNEL_ID = '1268760464536506483';

client.once('ready', () => {
    console.log('Bot is online!');
});

app.post('/accept', async (req, res) => {
    const { userId, roleId } = req.body;

    try {
        const guild = await client.guilds.fetch(GUILD_ID);
        const member = await guild.members.fetch(userId);
        const role = await guild.roles.fetch(roleId);

        if (member && role) {
            await member.roles.add(role);
            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle('Staff Results')
                .setDescription(`${member} You Accepted As ${role.name}`);

            const channel = await client.channels.fetch(CHANNEL_ID);
            await channel.send({ embeds: [embed] });
            res.status(200).send('Role assigned and embed sent.');
        } else {
            res.status(400).send('Member or role not found.');
        }
    } catch (err) {
        const embed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle('Bot Problem')
            .setDescription(`Failed to assign the role. Error: ${err.message}`);

        const channel = await client.channels.fetch(CHANNEL_ID);
        await channel.send({ embeds: [embed] });

        res.status(500).send(`Failed to assign role: ${err.message}`);
    }
});

app.post('/deny', async (req, res) => {
    const { userId, reason } = req.body;
   // console.log(reason);
    const guild = await client.guilds.fetch(GUILD_ID);
    const member = await guild.members.fetch(userId);

    const embed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle('Staff Results')
        .setDescription(`${member} are not acceptable \n Reason: ${reason}`);


    const channel = await client.channels.fetch(CHANNEL_ID);
    await channel.send({ embeds: [embed] });

    res.status(200).send('Failure embed sent.');
});

client.login(TOKEN);

app.listen(3000, () => {
    console.log('API server is running on port 3000');
});
