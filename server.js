const express = require('express');
const path = require('path');
const app = express();

const PORT = 3002;

// Правильные заголовки для PWA
app.use((req, res, next) => {
    if (req.url === '/manifest.json') {
        res.setHeader('Content-Type', 'application/manifest+json');
    }
    if (req.url === '/sw.js') {
        res.setHeader('Content-Type', 'application/javascript');
        res.setHeader('Cache-Control', 'no-cache');
    }
    next();
});

// Статические файлы
app.use(express.static('public'));

// Все запросы на index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`\n✅ Сервер: http://localhost:${PORT}`);
    console.log(`📱 PWA готов к установке\n`);
});