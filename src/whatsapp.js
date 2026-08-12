const version = process.env.GRAPH_API_VERSION || 'v23.0';

async function request(body) {
  const response = await fetch(`https://graph.facebook.com/${version}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(JSON.stringify(data));
  return data;
}

export function sendText(to, text) {
  return request({
    messaging_product: 'whatsapp', recipient_type: 'individual', to,
    type: 'text', text: { preview_url: true, body: text }
  });
}

export function sendImage(to, url, caption = '') {
  return request({
    messaging_product: 'whatsapp', recipient_type: 'individual', to,
    type: 'image', image: { link: url, caption }
  });
}

export function sendButtons(to, bodyText, buttons, footer = '') {
  return request({
    messaging_product: 'whatsapp', recipient_type: 'individual', to,
    type: 'interactive',
    interactive: {
      type: 'button', body: { text: bodyText },
      ...(footer ? { footer: { text: footer } } : {}),
      action: { buttons: buttons.slice(0,3).map(b => ({ type:'reply', reply:{ id:b.id, title:b.title.slice(0,20) }})) }
    }
  });
}
