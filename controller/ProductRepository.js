// ProductRepository.js
export default class ProductRepository {
    async fetchProducts() {
        try {
            const response = await fetch('/api/productos'); // Asegúrate de que la URL sea correcta
            if (!response.ok) {
                throw new Error('Error al obtener productos');
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error al cargar los productos:', error);
            throw error;
        }
    }

    async addProduct(product) {
        try {
            console.log('Producto a insertar:', product); // Agregar log para verificar los datos
            const response = await fetch('/api/productos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(product)
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText);
            }
            const data = await response.text();
            console.log(data);
            return true;
        } catch (error) {
            console.error('Error al agregar el producto:', error);
            throw error;
        }
    }

    async updateProduct(product) {
        try {
            const response = await fetch(`/api/productos/${product.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(product)
            });
            const data = await response.text();
            console.log(data);
            return true;
        } catch (error) {
            console.error('Error al actualizar el producto:', error);
            return false;
        }
    }

    async deleteProduct(id) {
        try {
            const response = await fetch(`/api/productos/${id}`, {
                method: 'DELETE'
            });
            const data = await response.text();
            console.log(data);
            return true;
        } catch (error) {
            console.error('Error al eliminar el producto:', error);
            return false;
        }
    }
}
