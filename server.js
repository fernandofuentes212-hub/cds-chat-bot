const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const { handleMessage } = require('./src/bot');

dotenv.config();

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

// Ruta de verificación del Webhook para Meta
app.get('/webhook', (req, res) => {
    const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    } else {
        res.sendStatus(400);
    }
});

// Ruta para recibir los mensajes de WhatsApp
app.post('/webhook', async (req, res) => {
    const body = req.body;

    if (body.object === 'whatsapp_business_account') {
        try {
            for (const entry of body.entry) {
                for (const change of entry.changes) {
                    if (change.value.messages) {
                        const message = change.value.messages[0];
                        const phoneId = change.value.metadata.phone_number_id;
                        await handleMessage(message, phoneId);
                    }
                }
            }
            res.status(200).send('EVENT_RECEIVED');
        } catch (error) {
            console.error('Error procesando el mensaje:', error);
            res.sendStatus(500);
        }
    } else {
        res.sendStatus(404);
    }
});

// Ruta para probar el endpoint de promociones (la que consultaste en Supabase)
app.get('/promocion', async (req, res) => {
    try {
        const { getLatestPromo } = require('./src/supabase');
        const promo = await getLatestPromo();
        res.json({ ok: true, promocion: promo });
    } catch (error) {
        res.status(500).json({ ok: false, error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
