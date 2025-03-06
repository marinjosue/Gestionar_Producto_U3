// main.js
import ProductService from './ProductService.js';
import { ProductStateObserver } from './ProductStateObserver.js';
import ProductTable from './ProductTable.js';

let productoStock = [];
let productService;
let productStateObserver;
let productTable;

document.addEventListener('DOMContentLoaded', async () => {
    productService = new ProductService();

    // 1) Cargar productos
    try {
        productoStock = await productService.fetchProducts();
        console.log('Productos cargados:', productoStock); // Agregar un log para verificar los datos
    } catch (error) {
        showModal("Error", "No se pudo cargar la lista de productos.");
        console.error('Error al cargar los productos:', error);
        return;
    }

    // 2) Iniciar Observer y Tabla
    productStateObserver = new ProductStateObserver(productoStock);
    productTable = new ProductTable(productStateObserver);

    // 3) Renderizar tabla inicial
    productTable.renderTable(productoStock);

    // 4) Configurar eventos de la interfaz
    setupUIEvents();

    // Actualizar la tabla cada 10 segundos
    setInterval(async () => {
        try {
            productoStock = await productService.fetchProducts();
            productTable.renderTable(productoStock);
        } catch (error) {
            console.error('Error al actualizar los productos:', error);
        }
    }, 10000); // 10 segundos
});

function setupUIEvents() {
    // Filtro de estado
    const statusSelect = document.getElementById('status-select');
    statusSelect.addEventListener('change', () => {
        const selectedStatus = statusSelect.value.toLowerCase();
        const filteredProducts = productoStock.filter(producto => {
            let estado;
            if (producto.stock > 300) {
                estado = 'adecuado';
            } else if (producto.stock <= 300 && producto.stock >= 100) {
                estado = 'bajo';
            } else {
                estado = 'critico';
            }
            return estado === selectedStatus;
        });

        if (filteredProducts.length === 0) {
            showModal("Estado no encontrado", "No se encontraron productos con el estado seleccionado.");
        } else {
            productTable.renderTable(filteredProducts);
        }
    });

    // Búsqueda por ID
    document.getElementById('btn_modificar').addEventListener('click', searchProduct);

    // Verificar Stock
    const verificarStockItem = document.getElementById('verificar-stock');
    let clickTimeout;
    verificarStockItem.addEventListener('mousedown', () => {
        clickTimeout = setTimeout(() => {
            showModal("Error", "No se pudo cargar los datos del producto.");
        }, 1000);
    });
    verificarStockItem.addEventListener('mouseup', () => clearTimeout(clickTimeout));
    verificarStockItem.addEventListener('mouseleave', () => clearTimeout(clickTimeout));
}

function searchProduct() {
    const searchId = document.getElementById('search-id').value;

    // Si no hay nada en el campo, mostramos todo
    if (!searchId) {
        productTable.renderTable(productoStock);
        return;
    }

    const producto = productoStock.find(p => p.id === searchId);
    if (producto) {
        productTable.renderTable([producto]);
    } else {
        showModal('Error al buscar producto', 'Producto no encontrado.');
    }
}

function showModal(title, message) {
    const modal = document.getElementById('myModal');
    const modalTitle = modal.querySelector('.modal-content h1');
    const modalMessage = modal.querySelector('.modal-content p');
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    modal.style.display = 'block';
}

function closeModal() {
    const modal = document.getElementById('myModal');
    modal.style.display = 'none';
}