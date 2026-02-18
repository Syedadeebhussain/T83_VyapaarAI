'use client';

import React, { useEffect, useState } from 'react';
import { Table } from '@/components/dashboard/Table';
import { MessageSquare, RefreshCw } from 'lucide-react';
import { Button } from '@/components/dashboard/Button';

interface Message {
  id: string;
  customerNumber: string;
  message: string;
  time: string;
  status: 'read' | 'unread' | 'replied';
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3000/messages');

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const data = await response.json();
      setMessages(data);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(
        'Unable to fetch messages. Using sample data. Make sure your backend is running at http://localhost:3000'
      );

      setMessages([
        {
          id: '1',
          customerNumber: '+91 98765 43210',
          message: 'Hi, I want to order 2 units of wireless headphones',
          time: '2 hours ago',
          status: 'unread',
        },
        {
          id: '2',
          customerNumber: '+91 87654 32109',
          message: 'What is the price of smart watch?',
          time: '3 hours ago',
          status: 'replied',
        },
        {
          id: '3',
          customerNumber: '+91 76543 21098',
          message: 'When will my order be delivered?',
          time: '5 hours ago',
          status: 'read',
        },
        {
          id: '4',
          customerNumber: '+91 65432 10987',
          message: 'Do you have phone cases in stock?',
          time: '1 day ago',
          status: 'replied',
        },
        {
          id: '5',
          customerNumber: '+91 54321 09876',
          message: 'I received the product. Thank you!',
          time: '2 days ago',
          status: 'read',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const columns = [
    {
      key: 'customerNumber',
      label: 'Customer Number',
    },
    {
      key: 'message',
      label: 'Message',
      render: (value: string) => (
        <div className="max-w-md truncate" title={value}>
          {value}
        </div>
      ),
    },
    {
      key: 'time',
      label: 'Time',
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => {
        const statusStyles = {
          read: 'bg-gray-100 text-gray-700',
          unread: 'bg-blue-100 text-blue-700',
          replied: 'bg-green-100 text-green-700',
        };

        return (
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              statusStyles[value as keyof typeof statusStyles]
            }`}
          >
            {value.charAt(0).toUpperCase() + value.slice(1)}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <MessageSquare className="w-8 h-8 mr-3 text-blue-600" />
            Messages
          </h1>
          <p className="text-gray-600 mt-1">
            Manage all your WhatsApp conversations
          </p>
        </div>
        <Button
          variant="outline"
          onClick={fetchMessages}
          disabled={isLoading}
          className="flex items-center space-x-2"
        >
          <RefreshCw
            className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
          />
          <span>Refresh</span>
        </Button>
      </div>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading messages...</span>
          </div>
        ) : (
          <Table columns={columns} data={messages} />
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">
          API Integration Guide
        </h3>
        <p className="text-sm text-blue-800">
          This page fetches data from:{' '}
          <code className="bg-blue-100 px-2 py-1 rounded">
            GET http://localhost:3000/messages
          </code>
        </p>
        <p className="text-sm text-blue-800 mt-2">
          Expected response format:
        </p>
        <pre className="bg-blue-100 p-3 rounded mt-2 text-xs overflow-x-auto">
          {JSON.stringify(
            [
              {
                id: '1',
                customerNumber: '+91 98765 43210',
                message: 'Sample message',
                time: '2 hours ago',
                status: 'unread',
              },
            ],
            null,
            2
          )}
        </pre>
      </div>
    </div>
  );
}
