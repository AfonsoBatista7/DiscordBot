const { SlashCommandBuilder } = require('@discordjs/builders');
const profileModel = require('../models/profileSchema');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mine')
        .setDescription('Mine some ores to earn money'),
    name: 'mine',
    aliases: ['m'],
    cooldown: 2,
    description: "Mine some ores to earn money.",
    async execute(interaction, options) {
        const { client, Discord, profileData } = options;

        const randomNumber = Math.floor(Math.random() * 100);
        const avatar = interaction.user.displayAvatarURL({});

        let value, minerio, sign = '+';

        const ores = {
            LAVA: -10,
            BROKEN: -20,
            ROCK: 1,
            COAL: 3,
            IRON: 6,
            GOLD: 15,
            DIAMOND: 25,
            IRIDIUM: 100,

        }
 
        if(randomNumber < 20) {
            value = ores.ROCK;
            minerio = 'Rock :rock:';
        } else if(randomNumber < 40) {
            value = ores.COAL;
            minerio = 'Coal';
        } else if(randomNumber < 70) {
            value = ores.IRON;
            minerio = 'Iron';
        } else if(randomNumber < 80) {
            value = ores.GOLD;
            minerio = 'Gold :coin:';
        } else if(randomNumber < 85) {
            value = ores.DIAMOND;
            minerio = 'Diamond :gem:';
        } else if(randomNumber < 95) {
            value = ores.LAVA;
            minerio = 'Lava but you have burnt your finger ;-; :fire:';
            sign = '';
        } else if(randomNumber < 99) {
            value = ores.BROKEN;
            sign = '';
        } else {
            value = ores.IRIDIUM;
            minerio = ':money_with_wings: Iridium :money_with_wings:';
        }

        let mensagem;
        if(value != ores.BROKEN)
            mensagem = `:pick: | You found **${minerio}**! **${sign}${value}** :money_with_wings:`;
        else
            mensagem = `:pick: | You broke your Pickaxe :(((! **${value}** :money_with_wings:`;
        
        const embed = new Discord.MessageEmbed()
            .setColor('#DF2700')
            .setAuthor({name: 'Mine', iconURL: avatar})
            .setDescription(mensagem);

        if(profileData.coins+value<0) value = profileData.coins;

        await profileModel.findOneAndUpdate({userId: interaction.user.id},
            {
                $inc: {
                    coins: value,
                },
            }
        );

        await interaction.reply({embeds: [embed]});
    }
}