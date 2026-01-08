export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  description?: string;
  stock?: number;
  createdAt: Date;
}

// Productos iniciales de ejemplo con imágenes reales
export const initialProducts: Product[] = [
  {
    id: '1',
    name: 'Producto X - Azul',
    price: 29.99,
    category: 'Ropa',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
    description: 'Producto de alta calidad en color azul',
    stock: 50,
    createdAt: new Date(Date.now() - 7 * 24 * 3600000),
  },
  {
    id: '2',
    name: 'Producto Y',
    price: 49.99,
    category: 'Electrónica',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
    description: 'Producto electrónico avanzado',
    stock: 30,
    createdAt: new Date(Date.now() - 5 * 24 * 3600000),
  },
  {
    id: '3',
    name: 'Producto Z',
    price: 79.99,
    category: 'Hogar',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop',
    description: 'Producto para el hogar',
    stock: 25,
    createdAt: new Date(Date.now() - 3 * 24 * 3600000),
  },
];

export const categories = [
  'Ropa',
  'Electrónica',
  'Hogar',
  'Deportes',
  'Libros',
  'Juguetes',
  'Belleza',
  'Alimentos',
  'Otros',
];

// Función para buscar productos por nombre o categoría
export function searchProducts(query: string, products: Product[]): Product[] {
  const queryLower = query.toLowerCase();
  return products.filter(
    product =>
      product.name.toLowerCase().includes(queryLower) ||
      product.category.toLowerCase().includes(queryLower) ||
      product.description?.toLowerCase().includes(queryLower)
  );
}

// Función para obtener productos por categoría
export function getProductsByCategory(category: string, products: Product[]): Product[] {
  return products.filter(product => product.category === category);
}

