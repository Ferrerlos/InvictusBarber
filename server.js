const express = require('express');
const path = require('path');
const app = express();

// Servir los archivos estáticos de Angular
app.use(express.static(path.join(__dirname, 'dist/invictusbarber/browser')));

// Rutas para manejar cualquier solicitud a la aplicación
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/invictusbarber/browser', 'index.html'));
});

// Escuchar en el puerto 3000 (puedes cambiar el puerto si lo necesitas)
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor de Angular corriendo en http://149.50.132.65:${PORT}`);
});