import React, { useEffect, useState } from 'react';
import { Select, Table, Spin } from 'antd';
import { API_BASE_URL } from '../config/api';
import ToastContainer, { useToast } from '../components/ToastContainer';

const { Option } = Select;

interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const { toasts, addToast, removeToast } = useToast(); // ✅ using your toast hook

  const fetchUsers = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setUsers(data);
      } else {
        addToast(data.message || 'Failed to fetch users', 'error');
      }
    } catch (error) {
      console.error('Fetch users error:', error);
      addToast('Error fetching users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}/change-role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await response.json();

      if (response.ok) {
        addToast('Role updated successfully', 'success');
        fetchUsers(); // Refresh users
      } else {
        addToast(data.message || 'Failed to update role', 'error');
      }
    } catch (error) {
      console.error('Role change error:', error);
      addToast('Error updating role', 'error');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const columns = [
    {
      title: 'Name',
      dataIndex: 'fullName',
      key: 'fullName',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Role',
      key: 'role',
      render: (_: any, record: User) => (
        <Select
          value={record.role}
          style={{ width: 120 }}
          onChange={(value) => handleRoleChange(record.id, value)}
        >
          <Option value="ADMIN">Admin</Option>
          <Option value="MANAGER">Manager</Option>
          <Option value="STAFF">Staff</Option>
        </Select>
      ),
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      {/* ✅ Toasts are now displayed */}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />

      {loading ? <Spin /> : <Table dataSource={users} columns={columns} rowKey="id" />}
    </div>
  );
};

export default UserManagement;
