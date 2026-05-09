import React from "react";
import LayoutDashboard from "../../components/LayoutDashboard";
import { User } from "../../types/user";

interface SupervisorDashboardProps {
  user: User;
}

const SupervisorDashboard: React.FC<SupervisorDashboardProps> = () => {
  return <LayoutDashboard role="SUPERVISOR" />;
};

export default SupervisorDashboard;

