const express = require('express');
const bodyParser = require('body-parser');
const { handleMessage } = require('./src/bot');

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 10000;
const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

app.get('/api/webhook', (req, res) => {
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

app.post('/api/webhook', async (req, res) => {
    // 1. Respondemos a Meta INMEDIATAMENTE para evitar que cancele la petición
    res.sendStatus(200);

    console.log('Webhook recibido:', JSON.stringify(req.body, null, 2));

    const body = req.body;

    if (body.object === 'whatsapp_business_account') {
        try {
            for (const entry of body.entry) {
                for (const change of entry.changes) {
                    if (change.field === 'messages') {
                        const messages = change.value.messages;

                        if (messages && messages.length > 0) {
                            const message = messages[0];
                            // 2. Procesamos el mensaje en segundo plano
                            await handleMessage(message);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error procesando el webhook:', error);
        }
    }
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
