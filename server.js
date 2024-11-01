const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const qrcode = require('qrcode');
const os = require('os');

// understand what ip we are using
const getLocalIP = () => {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const interface of interfaces[name]) {
            if (interface.family === 'IPv4' && !interface.internal) {
                return interface.address;
            }
        }
    }
    return 'localhost';
};

const ip = getLocalIP();
const port = 2024;

app.use(express.static('public'));

// qr code generation
app.get('/qrcode', async (req, res) => {
    const url = `http://${ip}:${port}`;
    try {
        const qr = await qrcode.toDataURL(url);
        res.json({ qr });
    } catch (err) {
        res.status(500).json({ error: 'QR Code generation failed' });
    }
});

io.on('connection', (socket) => {
    socket.on('draw', (data) => {
        socket.broadcast.emit('draw', data);
    });
    socket.on('clear', () => {
        socket.broadcast.emit('clear');
    });
});

http.listen(port, () => {
    console.log(`Server running at http://${ip}:${port}`);
    console.log('Scan the QR code displayed on the page to connect from mobile devices');
});
