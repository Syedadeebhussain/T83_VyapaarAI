'use client';

import React, { useState } from 'react';
import { Table } from '@/components/dashboard/Table';
import { Button } from '@/components/dashboard/Button';
import { Package, Plus, Trash2, Edit } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: string;
  stock: number;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([
    { id: '1', name: 'Wireless Headphones', price: '₹2,499', stock: 45 },
    { id: '2', name: 'Smart Watch', price: '₹3,999', stock: 28 },
    { id: '3', name: 'Phone Case', price: '₹499', stock: 120 },
    { id: '4', name: 'Power Bank', price: '₹1,299', stock: 67 },
  ]);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
  });

  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newProduct: Product = {
      id: String(products.length + 1),
      name: formData.name,
      price: `₹${formData.price}`,
      stock: parseInt(formData.stock),
    };

    setProducts([...products, newProduct]);

    setFormData({ name: '', price: '', stock: '' });
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    setProducts(products.filter((product) => product.id !== id));
  };

  const columns = [
    {
      key: 'name',
      label: 'Product Name',
      render: (value: string) => (
        <span className="font-medium text-gray-900">{value}</span>
      ),
    },
    {
      key: 'price',
      label: 'Price',
      render: (value: string) => (
        <span className="font-semibold text-gray-900">{value}</span>
      ),
    },
    {
      key: 'stock',
      label: 'Stock',
      render: (value: number) => {
        const isLowStock = value < 20;
        return (
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              isLowStock
                ? 'bg-red-100 text-red-700'
                : value < 50
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-green-100 text-green-700'
            }`}
          >
            {value} units
          </span>
        );
      },
    },
    {
      key: 'id',
      label: 'Actions',
      render: (value: string, row: Product) => (
        <div className="flex space-x-2">
          <button
            onClick={() => {}}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit product"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(value)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete product"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Package className="w-8 h-8 mr-3 text-blue-600" />
            Products
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your product inventory
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowForm(!showForm)}
          className="flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Add New Product
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter product name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (₹)
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter price"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock
                </label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({ ...formData, stock: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter stock quantity"
                  required
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <Button type="submit" variant="primary">
                Add Product
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <p className="text-sm font-medium text-gray-600">Total Products</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {products.length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
          <p className="text-3xl font-bold text-red-600 mt-2">
            {products.filter((p) => p.stock < 20).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <p className="text-sm font-medium text-gray-600">Total Stock Value</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            ₹
            {products
              .reduce((sum, p) => {
                const price = parseInt(p.price.replace(/[₹,]/g, ''));
                return sum + price * p.stock;
              }, 0)
              .toLocaleString()}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Product List</h2>
        </div>
        <Table columns={columns} data={products} />
      </div>
    </div>
  );
}
