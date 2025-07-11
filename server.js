import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import twilio from 'twilio';

dotenv.config();
console.log('SID:', process.env.TWILIO_ACCOUNT_SID);

const app = express();
app.use(cors());
app.use(express.json());

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Ruta de prueba rápida
app.post('/send-whatsapp', async (req, res) => {
  const { to, message, mediaUrl } = req.body;

  if (!Array.isArray(to)) {
    return res.status(400).json({ success: false, error: 'El campo "to" debe ser un array.' });
  }

  if (!message && !mediaUrl) {
    return res.status(400).json({ success: false, error: 'Debes enviar al menos un mensaje o un mediaUrl.' });
  }

  const resultados = [];

  for (const numero of to) {
    try {
      const options = {
        from: process.env.TWILIO_WHATSAPP_NUMBER,
        to: `whatsapp:+521${numero}`,
      };
      if (message) options.body = message;
      if (mediaUrl) options.mediaUrl = [mediaUrl];

      const response = await client.messages.create(options);
      console.log(`✅ Mensaje enviado a ${numero}:`, response.sid);
      resultados.push({ numero, sid: response.sid, success: true });
    } catch (error) {
      console.error(`❌ Error al enviar a ${numero}:`, error.message);
      resultados.push({ numero, error: error.message, success: false });
    }
  }

  res.json({ success: true, resultados });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`✅ Servidor escuchando en http://localhost:${PORT}`);
});
