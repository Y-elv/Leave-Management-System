import React from "react";
import LayoutDashboard from "../../components/LayoutDashboard";
import { User } from "../../types/user";

interface HrDashboardProps {
  user: User;
}

const HrDashboard: React.FC<HrDashboardProps> = () => {
  return <LayoutDashboard role="HR" />;
};

export default HrDashboard;

