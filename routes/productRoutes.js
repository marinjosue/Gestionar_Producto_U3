const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { broadcastMessage } = require('../utils/broadcast');

router.get('/productos', async (req, res) => {
    try {
        console.log('Solicitud recibida para obtener productos');
        const [results] = await db.query('SELECT * FROM productos');
        res.json(results);
    } catch (err) {
        console.error('Error al obtener productos:', err);
        res.status(500).send('Error al obtener productos');
    }
});

router.post('/productos', async (req, res) => {
    const { id, nombre, stock, precio, descuento, descripcion, estado } = req.body;
    const query = `INSERT INTO productos (id, nombre, stock, precio, descuento, descripcion, estado) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const values = [id, nombre, stock, precio, descuento, descripcion, estado];

    try {
        console.log('Solicitud recibida para insertar producto:', req.body);
        console.log('Query:', query);
        console.log('Values:', values);
        await db.query(query, values);
        console.log('Producto insertado exitosamente');
        res.send('Producto insertado exitosamente');
        broadcastMessage({ type: 'productAdded', product: req.body });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            console.error('Error al insertar producto: ID duplicado');
            if (!res.headersSent) {
                res.status(400).send('Error al insertar producto: ID duplicado');
            }
        } else {
            console.error('Error al insertar producto:', err);
            if (!res.headersSent) {
                res.status(500).send('Error al insertar producto');
            }
        }
    }
});

router.put('/productos/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, stock, precio, descuento, descripcion, estado } = req.body;
    const query = `UPDATE productos SET nombre = ?, stock = ?, precio = ?, descuento = ?, descripcion = ?, estado = ? WHERE id = ?`;
    const values = [nombre, stock, precio, descuento, descripcion, estado, id];

    try {
        console.log('Solicitud recibida para actualizar producto:', req.body);
        await db.query(query, values);
        console.log('Producto actualizado exitosamente');
        res.send('Producto actualizado exitosamente');
        broadcastMessage({ type: 'productUpdated', product: req.body });
    } catch (err) {
        console.error('Error al actualizar producto:', err);
        if (!res.headersSent) {
            res.status(500).send('Error al actualizar producto');
        }
    }
});

router.delete('/productos/:id', async (req, res) => {
    const { id } = req.params;
    const query = `DELETE FROM productos WHERE id = ?`;

    try {
        console.log('Solicitud recibida para eliminar producto:', id);
        await db.query(query, [id]);
        console.log('Producto eliminado exitosamente');
        res.send('Producto eliminado exitosamente');
        broadcastMessage({ type: 'productDeleted', productId: id });
    } catch (err) {
        console.error('Error al eliminar producto:', err);
        if (!res.headersSent) {
            res.status(500).send('Error al eliminar producto');
        }
    }
});

module.exports = router;
