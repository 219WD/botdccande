// Función para consultar OpenAI
const OpenAI = require('openai');

const getRespuesta = async (prompt) => {
    try {
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });

        const messages = [
            { role: 'assistant', content: 'Eres un asistente experto en marketing digital, gestión de negocios digitales y redes sociales...' },
            { role: 'user', content: prompt }
        ];

        const completion = await openai.chat.completions.create({
            messages,
            model: 'gpt-3.5-turbo'
        });

        return completion.choices[0].message.content;
    } catch (error) {
        console.error('Error al consultar OpenAI:', error);
        
        // Manejar diferentes tipos de errores
        if (error.code === 'insufficient_quota') {
            return 'Lo siento, hemos excedido el límite de uso de la API de OpenAI. Por favor, intenta más tarde.';
        }
        return 'Hubo un error procesando tu solicitud. Intenta nuevamente.';
    }
};

module.exports = { getRespuesta };
