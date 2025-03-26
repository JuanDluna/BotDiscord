// slash_commands/userinfo.js
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Muestra información sobre un usuario')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('El usuario al que le deseas obtener información')
                .setRequired(false)
        ),
    async execute(interaction) {
        const user = interaction.options.getUser('usuario') || interaction.user;
        const member = await interaction.guild.members.fetch(user.id);

        await interaction.reply(`Información de ${user.username}:\nFecha de ingreso: ${member.joinedAt}\nRoles: ${member.roles.cache.map(role => role.name).join(', ')}`);
    },
};
