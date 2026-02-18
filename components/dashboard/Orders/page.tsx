'use client';

import React, { useState } from 'react';
import { Table } from '@/components/dashboard/Table';
import { ShoppingCart } from 'lucide-react';

interface Order {
  orderId: string;
  customer: string;
  product: string;
  amount: string;
  status: 'Paid' | 'Pending';
}

export default function OrdersPage() {
  const [orders] = useState<Order[]>([
    {
      orderId: '#12345',
      customer: 'Rajesh Kumar',
      product: 'Wireless Headphones',
      amount: '₹2,499',
      status: 'Paid',
    },
    {
      orderId: '#12346',
      customer: 'Priya Sharma',
      product: 'Smart Watch',
      amount: '₹3,999',
      status: 'Pending',
    },
    {
      orderId: '#12347',
      customer: 'Amit Patel',
      product: 'Phone Case',
      amount: '₹499',
      status: 'Paid',
    },
    {
      orderId: '#12348',
      customer: 'Sneha Reddy',
      product: 'Power Bank',
      amount: '₹1,299',
      status: 'Paid',
    },
    {
      orderId: '#12349',
      customer: 'Vikram Singh',
      product: 'Bluetooth Speaker',
      amount: '₹1,999',
      status: 'Pending',
    },
    {
      orderId: '#12350',
      customer: 'Anjali Gupta',
      product: 'Wireless Mouse',
      amount: '₹799',
      status: 'Paid',
    },
    {
      orderId: '#12351',
      customer: 'Rahul Verma',
      product: 'USB Cable',
      amount: '₹299',
      status: 'Paid',
    },
    {
      orderId: '#12352',
      customer: 'Pooja Iyer',
      product: 'Laptop Stand',
      amount: '₹1,599',
      status: 'Pending',
    },
  ]);

  const columns = [
    {
      key: 'orderId',
      label: 'Order ID',
      render: (value: string) => (
        <span className="font-mono font-medium text-blue-600">{value}</span>
      ),
    },
    {
      key: 'customer',
      label: 'Customer',
    },
    {
      key: 'product',
      label: 'Product',
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (value: string) => (
        <span className="font-semibold text-gray-900">{value}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => {
        const isPaid = value === 'Paid';
        return (
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              isPaid
                ? 'bg-green-100 text-green-700'
                : 'bg-yellow-100 text-yellow-700'
            }`}
          >
            {value}
          </span>
        );
      },
    },
  ];

  const totalRevenue = orders
    .filter((order) => order.status === 'Paid')
    .reduce((sum, order) => {
      const amount = parseInt(order.amount.replace(/[₹,]/g, ''));
      return sum + amount;
    }, 0);

  const pendingOrders = orders.filter((order) => order.status === 'Pending').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <ShoppingCart className="w-8 h-8 mr-3 text-blue-600" />
            Orders
          </h1>
          <p className="text-gray-600 mt-1">
            Manage and track all your customer orders
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <p className="text-sm font-medium text-gray-600">Total Orders</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{orders.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <p className="text-sm font-medium text-gray-600">Total Revenue</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            ₹{totalRevenue.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <p className="text-sm font-medium text-gray-600">Pending Orders</p>
          <p className="text-3xl font-bold text-yellow-600 mt-2">
            {pendingOrders}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">All Orders</h2>
        </div>
        <Table columns={columns} data={orders} />
      </div>
    </div>
  );
}
