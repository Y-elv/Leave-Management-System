import React from 'react';
import LayoutDashboard from '../../components/LayoutDashboard';
import { User } from '../../types/user';

interface ManagerDashboardProps {
  user: User;
}

const ManagerDashboard: React.FC<ManagerDashboardProps> = () => {
  return <LayoutDashboard role="MANAGER" />;
};

export default ManagerDashboard;
