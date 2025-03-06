import ProductManagementFacade from './ProductManagementFacade.js';

const productFacade = new ProductManagementFacade();
let productos = [];

document.addEventListener("DOMContentLoaded", async function () {
    try {
        productos = await productFacade.loadProducts();
        renderTable(productos);
    } catch (error) {
        console.error('Error al cargar los productos:', error);
    }

    // Cargar producto seleccionado, si se vuelve de otra página
    const productoSeleccionado = localStorage.getItem('productoSeleccionado');
    if (productoSeleccionado) {
        const producto = JSON.parse(productoSeleccionado);
        document.getElementById('id').value = producto.id;
        document.getElementById('name').value = producto.nombre;
        document.getElementById('stock').value = producto.stock;
        document.getElementById('price').value = producto.precio || '';
        document.getElementById('discount').value = producto.descuento || '';
        document.getElementById('description').value = producto.descripcion || '';
        highlightFields();
        localStorage.removeItem('productoSeleccionado');
    }

    // Actualizar la tabla cada 10 segundos
    setInterval(async () => {
        try {
            productos = await productFacade.loadProducts();
            renderTable(productos);
        } catch (error) {
            console.error('Error al actualizar los productos:', error);
        }
    }, 10000); // 10 segundos
});

function renderTable(productos) {
    const tbody = document.querySelector("#product-table tbody");
    tbody.innerHTML = '';
    productos.forEach(producto => {
        const row = document.createElement('tr');
        row.innerHTML = `
      <td>${producto.id}</td>
      <td>${producto.nombre}</td>
      <td>${producto.stock}</td>
      <td>${producto.precio}</td>
      <td>${producto.descuento}</td>
      <td>${producto.descripcion}</td>
    `;
        row.addEventListener('click', () => {
            document.getElementById('id').value = producto.id;
            document.getElementById('name').value = producto.nombre;
            document.getElementById('stock').value = producto.stock;
            document.getElementById('price').value = producto.precio;
            document.getElementById('discount').value = producto.descuento;
            document.getElementById('description').value = producto.descripcion;
        });
        tbody.appendChild(row);
    });
}

let isRequestInProgress = false;

function addProduct() {
    if (isRequestInProgress) return;
    isRequestInProgress = true;

    const id = document.getElementById('id').value;
    const nombre = document.getElementById('name').value;
    const stock = document.getElementById('stock').value;
    const precio = document.getElementById('price').value;
    const descuento = document.getElementById('discount').value;
    const descripcion = document.getElementById('description').value;

    if (id && nombre && stock && precio && descuento && descripcion) {
        const existingProduct = productos.find(producto => producto.id === id);
        if (existingProduct) {
            showModal('Error al agregar producto', 'El ID del producto ya existe. Por favor, use un ID único.');
            isRequestInProgress = false;
            return;
        }
        const nuevoProducto = { id, nombre, stock, precio, descuento, descripcion };
        console.log('Producto a agregar:', nuevoProducto); // Agregar log para verificar los datos
        productFacade.addProduct(nuevoProducto).then(() => {
            productos = productFacade.getProducts();
            renderTable(productos);
            showModal('Producto agregado', 'El producto ha sido agregado correctamente.');
            isRequestInProgress = false;
        }).catch(error => {
            showModal('Error al agregar producto', error.message);
            isRequestInProgress = false;
        });
    } else {
        showModal('Error al agregar producto', 'Por favor, complete todos los campos para agregar un producto.');
        isRequestInProgress = false;
    }
}

function updateProduct() {
    if (isRequestInProgress) return;
    isRequestInProgress = true;

    const id = document.getElementById('id').value.trim();
    const nombre = document.getElementById('name').value.trim();
    const stock = document.getElementById('stock').value.trim();
    const precio = document.getElementById('price').value.trim();
    const descuento = document.getElementById('discount').value.trim();
    const descripcion = document.getElementById('description').value.trim();

    if (!id || !nombre || !stock || !precio || !descuento || !descripcion) {
        showModal('Error al actualizar producto', 'Por favor, complete todos los campos para actualizar el producto.');
        isRequestInProgress = false;
        return;
    }

    const productoActualizado = { id, nombre, stock, precio, descuento, descripcion };
    console.log('Producto a actualizar:', productoActualizado); // Agregar log para verificar los datos
    productFacade.updateProduct(productoActualizado).then(success => {
        if (success) {
            productos = productFacade.getProducts();
            renderTable(productos);
            showModal('Producto actualizado', 'El producto ha sido actualizado correctamente.');
        } else {
            showModal('Error al actualizar producto', 'Producto no encontrado para actualizar.');
        }
        isRequestInProgress = false;
    }).catch(error => {
        showModal('Error al actualizar producto', error.message);
        isRequestInProgress = false;
    });
}

function deleteProduct() {
    if (isRequestInProgress) return;
    isRequestInProgress = true;

    const id = document.getElementById('id').value.trim();
    if (!id) {
        showModal('Error al eliminar producto', 'Por favor, seleccione un producto para eliminar.');
        isRequestInProgress = false;
        return;
    }
    console.log('Producto a eliminar:', id); // Agregar log para verificar los datos
    productFacade.deleteProduct(id).then(success => {
        if (success) {
            productos = productFacade.getProducts();
            renderTable(productos);
            clearForm();
            showModal('Producto eliminado', 'El producto ha sido eliminado correctamente.');
        } else {
            showModal('Error al eliminar producto', 'Producto no encontrado para eliminar.');
        }
        isRequestInProgress = false;
    }).catch(error => {
        showModal('Error al eliminar producto', error.message);
        isRequestInProgress = false;
    });
}

function searchProduct() {
    const searchId = document.getElementById('search-id').value;

    if (!searchId) {
        renderTable(productos);
        return;
    }

    const producto = productFacade.findProductById(searchId);
    if (producto) {
        renderTable([producto]);
    } else {
        showModal('Error al buscar producto', 'Producto no encontrado.');
    }
}

function clearForm() {
    document.querySelector('.form-container-p').reset();
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

function highlightFields() {
    const fields = ['id', 'name', 'stock', 'price', 'discount', 'description'];
    fields.forEach(field => {
        const input = document.getElementById(field);
        input.style.transition = 'background-color 0.5s ease-in-out';
        input.style.backgroundColor = '#ffeb3b';
        setTimeout(() => {
            input.style.backgroundColor = '';
        }, 1000);
    });
}
window.addProduct = addProduct;
window.updateProduct = updateProduct;
window.deleteProduct = deleteProduct;
window.searchProduct = searchProduct;
window.clearForm = clearForm;
window.closeModal = closeModal;
window.showModal = showModal;
document.getElementById('btn_agregar').addEventListener('click', addProduct);
document.getElementById('btn_modificar').addEventListener('click', updateProduct);
document.getElementById('btn_borrar').addEventListener('click', deleteProduct);
document.getElementById('btn_buscar').addEventListener('click', searchProduct);
document.querySelector('.nuevo-button').addEventListener('click', clearForm);
