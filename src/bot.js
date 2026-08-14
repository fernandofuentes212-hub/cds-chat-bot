const axios = require('axios');
const { getLatestPromo } = require('./supabase');

async function handleMessage(message) {
    const senderPhone = message.from; // Número real de quien escribe
    const messageText = message.text?.body?.toLowerCase().trim();

    if (!messageText) return;

    const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const url = `https://graph.facebook.com/v17.0/${phoneId}/messages`;

    // Detecta cualquier variante como promocion, promociones o promoción
    if (messageText.includes('promoc')) {
        try {
            const promo = await getLatestPromo();

            if (!promo || !promo.url_foto) {
                await sendTextMessage(url, WHATSAPP_TOKEN, senderPhone, 'Lo sentimos, no hay promociones activas en este momento.');
                return;
            }

            // Enviar la imagen con el enlace obtenido de Supabase al número que escribió
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
            console.error('Error detallado de Meta:', JSON.stringify(error.response?.data, null, 2));
        }
    } else {
        // Respuesta predeterminada para otros mensajes
        await sendTextMessage(url, WHATSAPP_TOKEN, senderPhone, '¡Hola! Escribe "promocion" para ver nuestra oferta actual.');
    }
}

async function sendTextMessage(url, token, to, text) {
    try {
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
    } catch (error) {
        console.error('Error detallado enviando texto:', JSON.stringify(error.response?.data, null, 2));
    }
}

module.exports = { handleMessage };
