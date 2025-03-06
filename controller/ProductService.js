// ProductService.js
export default class ProductService {
    async fetchProducts() {
        try {
            console.log('Llamando a la API para obtener productos');
            const response = await fetch('/api/productos'); // Asegúrate de que la URL sea correcta
            if (!response.ok) {
                throw new Error('Error al obtener productos');
            }
            const data = await response.json();
            console.log('Productos obtenidos de la API:', data);
            return data;
        } catch (error) {
            console.error('Error al cargar los productos:', error);
            throw error;
        }
    }
}
