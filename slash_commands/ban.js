// slash_commands/ban.js
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Expulsa a un miembro del servidor.')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('El usuario que quieres banear')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('razon')
                .setDescription('Razón para banear al usuario')
                .setRequired(false)
        ),
    async execute(interaction) {
        const user = interaction.options.getUser('usuario');  // Obtener el usuario a banear
        const reason = interaction.options.getString('razon') || 'No se proporcionó razón'; // Obtener la razón (opcional)

        // Verificamos que el autor tenga permisos para banear usuarios
        if (!interaction.member.permissions.has('BAN_MEMBERS')) {
            return interaction.reply('❌ No tienes permisos para banear miembros de este servidor.');
        }

        // Intentamos banear al usuario
        try {
            await interaction.guild.members.ban(user, { reason: reason }); // Banea al usuario con la razón proporcionada
            await interaction.reply(`✅ El usuario **${user.tag}** ha sido expulsado del servidor. Razón: ${reason}`);
        } catch (error) {
            console.error('Error al banear al usuario:', error);
            await interaction.reply('❌ Hubo un error al intentar banear al usuario. Asegúrate de que el bot tenga permisos suficientes.');
        }
    },
};
