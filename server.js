const express = require('express');
const app = express();
app.use(express.json({ limit: '20kb' }));

const online = new Map();
const TTL = 90000;

app.get('/', (req, res) => res.send('ok'));

app.post('/heartbeat', (req, res) => {
  const nick = String(req.body.nick || '').trim();
  if (!/^[A-Za-z0-9_]{3,16}$/.test(nick)) return res.sendStatus(400);
  online.set(nick.toLowerCase(), Date.now());
  res.sendStatus(200);
});

app.post('/check', (req, res) => {
  const names = Array.isArray(req.body.names) ? req.body.names.slice(0, 200) : [];
  const now = Date.now();
  res.json(names.filter(n => {
    const t = online.get(String(n).toLowerCase());
    return t && now - t < TTL;
  }));
});

setInterval(() => {
  const now = Date.now();
  for (const [k, t] of online) if (now - t > TTL) online.delete(k);
}, 30000);

app.listen(process.env.PORT || 3000, () => console.log('Lain registry started'));