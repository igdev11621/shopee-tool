import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { TelegramClient, Api } from 'telegram';
import { StringSession } from 'telegram/sessions';

import { ChannelEntity } from '~/types/common.type';

dotenv.config();
const app = express();
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb' }));
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST'],
  }),
);

app.get('/', async (req, res) => {
  res.send('Hello world 👋');
});

app.get('/cron', async (req, res) => {
  try {
    const apiId = Number(process.env.TELEGRAM_API_ID);
    const apiHash = process.env.TELEGRAM_API_HASH as string;
    const stringSession = new StringSession(process.env.TELEGRAM_STRING_SESSION);
    const client = new TelegramClient(stringSession, apiId, apiHash, {
      connectionRetries: 5,
    });

    await client.start({
      phoneNumber: async () => process.env.PHONE_NUMBER as string,
      phoneCode: async () => process.env.TELEGRAM_PHONE_CODE as string,
      onError: (err) => {
        console.log('❌ Connect error 👉', err);
      },
    });

    const channel = (await client.getEntity('nghiensandeal')) as ChannelEntity;
    const chat = new Api.InputPeerChannel({
      accessHash: channel.accessHash,
      channelId: channel.id,
    });

    const result = await client.getMessages(chat, { limit: 10 });
    result.forEach((item, index) => {
      console.log(`${index} 🧀 ${item.message}`);
    });

    await client.sendMessage('me', { message: 'hello' });

    res.send('Cron job! 🍕');
  } catch (err) {
    console.log('❌ Cron error 👉', err);
    res.send(JSON.stringify(err));
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
