// ProductManagementFacade.js
import ProductRepository from './ProductRepository.js';

export default class ProductManagementFacade {
    constructor() {
        // Inyectamos la dependencia del repositorio (OCP y DIP)
        this.productRepository = new ProductRepository();
        this.productos = [];
    }

    async loadProducts() {
        this.productos = await this.productRepository.fetchProducts();
        return this.productos;
    }

    getProducts() { 
        return this.productos;
    }

    findProductById(id) {
        return this.productos.find(p => p.id === id);
    }

    async addProduct(productData) {
        const success = await this.productRepository.addProduct(productData);
        if (success) {
            this.productos.push(productData);
        }
        return success;
    }

    async updateProduct(productData) {
        const success = await this.productRepository.updateProduct(productData);
        if (success) {
            const index = this.productos.findIndex(p => p.id === productData.id);
            if (index !== -1) {
                this.productos[index] = productData;
            }
        }
        return success;
    }

    async deleteProduct(id) {
        const success = await this.productRepository.deleteProduct(id);
        if (success) {
            const index = this.productos.findIndex(p => p.id === id);
            if (index !== -1) {
                this.productos.splice(index, 1);
            }
        }
        return success;
    }
}
