const express = require('express');
const bodyParser = require('body-parser');
const { handleMessage } = require('./bot');

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 10000;
const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

// Ruta de verificación del Webhook para Meta
app.get('/webhook', (req, res) => {
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
                    if (change.field === 'messages') {
                        const metadata = change.value.metadata;
                        const messages = change.value.messages;

                        if (messages && messages.length > 0) {
                            const message = messages[0];
                            // Llama a handleMessage pasando solo el mensaje (el ID se lee de process.env dentro)
                            await handleMessage(message);
                        }
                    }
                }
            }
            res.sendStatus(200);
        } catch (error) {
            console.error('Error procesando el webhook:', error);
            res.sendStatus(500);
        }
    } else {
        res.sendStatus(404);
    }
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
