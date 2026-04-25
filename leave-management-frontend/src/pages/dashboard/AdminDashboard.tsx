import React from 'react';
import LayoutDashboard from '../../components/LayoutDashboard';
import { User } from '../../types/user';

interface AdminDashboardProps {
  user: User;
}

const AdminDashboard: React.FC<AdminDashboardProps> = () => {
  return <LayoutDashboard role="ADMIN" />;
};

export default AdminDashboard;
