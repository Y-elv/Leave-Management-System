import React from 'react';
import LayoutDashboard from '../../components/LayoutDashboard';
import { User } from '../../types/user';
import '../../css/StaffDashboard.css';

interface StaffDashboardProps {
  user: User;
}

const StaffDashboard: React.FC<StaffDashboardProps> = () => {
  return <LayoutDashboard role="STAFF" />;
};

export default StaffDashboard;
