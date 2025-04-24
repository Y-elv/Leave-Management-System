import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout, Button, Tooltip, Input, Dropdown } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { IoMdNotificationsOutline } from 'react-icons/io';
import { CiSettings } from 'react-icons/ci';
import { IoMdArrowDropdown } from 'react-icons/io';
import { FaUserCircle } from 'react-icons/fa';
import { MdDashboard } from 'react-icons/md';
import { BsCalendarCheck } from 'react-icons/bs';
import '../css/LayoutDashboard.css';

const { Header, Sider, Content } = Layout;

interface MenuItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  path: string;
}

interface LayoutDashboardProps {
  children: React.ReactNode;
  role: 'ADMIN' | 'MANAGER' | 'STAFF';
}

const LayoutDashboard: React.FC<LayoutDashboardProps> = ({ children, role }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Get user data from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const dropdownItems = [
    { key: '1', label: 'Profile' },
    { key: '2', label: 'Settings' },
    { key: '3', label: 'Logout', onClick: handleLogout },
  ];

  // Base menu items for all roles
  const baseMenuItems: MenuItem[] = [
    {
      key: 'dashboard',
      label: 'Dashboard',
      icon: <MdDashboard size={20} />,
      path: `/dashboard/${role.toLowerCase()}`,
    },
    {
      key: 'leave-requests',
      label: 'Leave Requests',
      icon: <BsCalendarCheck size={20} />,
      path: `/dashboard/${role.toLowerCase()}/leave-requests`,
    },
    {
      key: 'notifications',
      label: 'Notifications',
      icon: <IoMdNotificationsOutline size={20} />,
      path: `/dashboard/${role.toLowerCase()}/notifications`,
    },
    {
      key: 'settings',
      label: 'Settings',
      icon: <CiSettings size={20} />,
      path: `/dashboard/${role.toLowerCase()}/settings`,
    },
  ];

  // Additional menu items based on role
  const roleSpecificMenuItems: Record<string, MenuItem[]> = {
    ADMIN: [
      {
        key: 'users',
        label: 'User Management',
        icon: <FaUserCircle size={20} />,
        path: '/dashboard/admin/users',
      },
    ],
    MANAGER: [
      {
        key: 'team',
        label: 'Team Management',
        icon: <FaUserCircle size={20} />,
        path: '/dashboard/manager/team',
      },
    ],
    STAFF: [],
  };

  // Combine base menu items with role-specific items
  const menuItems = [...baseMenuItems, ...(roleSpecificMenuItems[role] || [])];

  const isActive = (path: string) => location.pathname === path;

  const handleMenuClick = (path: string) => {
    navigate(path);
  };

  return (
    <Layout className="layout-container">
      <Sider trigger={null} collapsible collapsed={collapsed} className="sidebar">
        <div className="logo">
          {collapsed ? 'LMS' : 'Leave Management'}
        </div>

        <div className="menu-container">
          {menuItems.map((item) => (
            <Tooltip 
              key={item.key} 
              title={collapsed ? item.label : ''} 
              placement="right"
            >
              <div
                className={`menu-item ${isActive(item.path) ? 'active' : ''}`}
                onClick={() => handleMenuClick(item.path)}
              >
                <div className={`icon-wrapper ${isActive(item.path) ? 'active' : ''}`}>
                  {item.icon}
                </div>
                {!collapsed && <span className="label">{item.label}</span>}
              </div>
            </Tooltip>
          ))}
        </div>
      </Sider>

      <Layout className="main-layout">
        <Header className="header">
          <div className="left-section">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="toggle-button"
            />
          </div>

          <div className="center-section">
            <div className="search-wrapper">
              <Input
                placeholder="Search..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                prefix={<span className="search-icon">🔍</span>}
                suffix={searchValue ? (
                  <CloseOutlined onClick={() => setSearchValue('')} />
                ) : null}
                className="search-input"
              />
            </div>
          </div>

          <div className="right-section">
            <Dropdown
              menu={{
                items: dropdownItems.map((item) => ({
                  key: item.key,
                  label: item.label,
                  onClick: item.onClick,
                })),
              }}
              trigger={['click']}
              placement="bottomRight"
            >
              <div className="user-section">
                <div className="user-avatar">
                  {user.fullName ? user.fullName[0].toUpperCase() : 'U'}
                </div>
                <span className="user-name">{user.fullName}</span>
                <IoMdArrowDropdown size={20} />
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content className="content">
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default LayoutDashboard;
