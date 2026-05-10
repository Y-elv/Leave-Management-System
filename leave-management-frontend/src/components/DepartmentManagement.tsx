import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Spin } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { API_BASE_URL } from '../config/api';
import ToastContainer, { useToast } from './ToastContainer';

interface Department {
  _id: string;
  name: string;
  code: string;
  faculty: string;
  createdAt: string;
}

const DepartmentManagement: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const { toasts, addToast, removeToast } = useToast();

  const fetchDepartments = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE_URL}/api/departments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setDepartments(data.data || []);
      } else {
        addToast(data.message || 'Failed to fetch departments', 'error');
      }
    } catch (error) {
      addToast('Error fetching departments', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (values: any) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE_URL}/api/departments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      });
      const data = await response.json();
      if (response.ok) {
        addToast('Department created successfully', 'success');
        setIsModalVisible(false);
        form.resetFields();
        fetchDepartments();
      } else {
        addToast(data.message || 'Failed to create department', 'error');
      }
    } catch (error) {
      addToast('Error creating department', 'error');
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Code', dataIndex: 'code', key: 'code' },
    { title: 'Faculty', dataIndex: 'faculty', key: 'faculty' },
    { 
      title: 'Created At', 
      dataIndex: 'createdAt', 
      key: 'createdAt',
      render: (text: string) => new Date(text).toLocaleDateString()
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Department Management</h2>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => setIsModalVisible(true)}
        >
          Add Department
        </Button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>
      ) : (
        <Table dataSource={departments} columns={columns} rowKey="_id" />
      )}

      <Modal
        title="Create New Department"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item
            name="name"
            label="Department Name"
            rules={[{ required: true, message: 'Please enter department name' }]}
          >
            <Input placeholder="e.g. Computer Science" />
          </Form.Item>
          <Form.Item
            name="code"
            label="Department Code"
            rules={[{ required: true, message: 'Please enter department code' }]}
          >
            <Input placeholder="e.g. CS" />
          </Form.Item>
          <Form.Item
            name="faculty"
            label="Faculty"
            rules={[{ required: true, message: 'Please enter faculty name' }]}
          >
            <Input placeholder="e.g. Science and Technology" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DepartmentManagement;
