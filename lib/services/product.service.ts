import { ProductRepository } from '@/lib/repositories/product.repository';

export class ProductService {
  static async getProductBySlug(slug: string) {
    return ProductRepository.getProductBySlug(slug);
  }

  static async getAllProducts() {
    return ProductRepository.getAllProducts();
  }

  static async searchProducts(query: string) {
    return ProductRepository.searchProducts(query);
  }
}
