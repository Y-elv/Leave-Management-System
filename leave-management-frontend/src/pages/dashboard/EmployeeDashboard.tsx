import React from "react";
import LayoutDashboard from "../../components/LayoutDashboard";
import { User } from "../../types/user";

interface EmployeeDashboardProps {
  user: User;
}

const EmployeeDashboard: React.FC<EmployeeDashboardProps> = () => {
  return <LayoutDashboard role="EMPLOYEE" />;
};

export default EmployeeDashboard;

