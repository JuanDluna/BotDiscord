// slash_commands/joke.js
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('joke')
        .setDescription('Cuenta un chiste al azar'),
    async execute(interaction) {
        const jokes = [
            '¿Por qué el libro de matemáticas estaba triste? Porque tenía demasiados problemas.',
            '¿Cuál es el colmo de un electricista? No encontrar su corriente de trabajo.',
            '¿Por qué los pájaros no usan Facebook? Porque ya tienen Twitter.',
            '¿Por qué el libro de historia es tan aburrido? Porque está lleno de hechos antiguos.',
        ];

        const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
        await interaction.reply(randomJoke);
    },
};
