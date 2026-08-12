const axios = require('axios');
const { getLatestPromo } = require('./supabase');

async function handleMessage(message, phoneId) {
    const senderPhone = message.from; // Número del cliente
    const messageText = message.text?.body?.toLowerCase().trim();

    if (!messageText) return;

    const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
    const url = `https://graph.facebook.com/v17.0/${phoneId}/messages`;

    // Si el usuario pide la promoción
    if (messageText.includes('promocion') || messageText.includes('promoción')) {
        try {
            const promo = await getLatestPromo();

            if (!promo || !promo.url_foto) {
                await sendTextMessage(url, WHATSAPP_TOKEN, senderPhone, 'Lo sentimos, no hay promociones activas en este momento.');
                return;
            }

            // Enviar la imagen con el enlace obtenido de Supabase
            await axios.post(
                url,
                {
                    messaging_product: 'whatsapp',
                    to: senderPhone,
                    type: 'image',
                    image: {
                        link: promo.url_foto,
                        caption: '¡Aquí tienes nuestra última promoción!'
                    }
                },
                {
                    headers: {
                        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
        } catch (error) {
            console.error('Error al enviar la promoción por WhatsApp:', error.response?.data || error.message);
        }
    } else {
        // Respuesta predeterminada para otros mensajes
        await sendTextMessage(url, WHATSAPP_TOKEN, senderPhone, '¡Hola! Escribe "promocion" para ver nuestra oferta actual.');
    }
}

async function sendTextMessage(url, token, to, text) {
    await axios.post(
        url,
        {
            messaging_product: 'whatsapp',
            to: to,
            type: 'text',
            text: { body: text }
        },
        {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        }
    );
}

module.exports = { handleMessage };