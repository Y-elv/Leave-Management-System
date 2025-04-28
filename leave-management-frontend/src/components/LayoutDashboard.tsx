import React, { useState } from 'react';
import { Layout, Button, Tooltip, Input, Dropdown } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { IoMdNotificationsOutline, IoMdArrowDropdown } from 'react-icons/io';
import { CiSettings } from 'react-icons/ci';
import { FaUserCircle } from 'react-icons/fa';
import { MdDashboard } from 'react-icons/md';
import { BsCalendarCheck } from 'react-icons/bs';
import AdminDashboardContent from '../components/AdminDashboardContent';
import '../css/LayoutDashboard.css';

const { Header, Sider, Content } = Layout;

interface MenuItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

interface LayoutDashboardProps {
  role: 'ADMIN' | 'MANAGER' | 'STAFF';
}

const LayoutDashboard: React.FC<LayoutDashboardProps> = ({ role }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [activeKey, setActiveKey] = useState<string>('dashboard');

  const getUserFromToken = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const payloadBase64 = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payloadBase64));
      return decodedPayload;
    } catch (error) {
      console.error('Failed to decode token', error);
      return null;
    }
  };

  const user = getUserFromToken();

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const dropdownItems = [
    { key: '1', label: 'Profile' },
    { key: '2', label: 'Settings' },
    { key: '3', label: 'Logout', onClick: handleLogout },
  ];

  // Base menu items with content
  const baseMenuItems: MenuItem[] = [
    {
      key: 'dashboard',
      label: 'Dashboard',
      icon: <MdDashboard size={20} />,
      content: <AdminDashboardContent user={user} />,
    },
    {
      key: 'leave-requests',
      label: 'Leave Requests',
      icon: <BsCalendarCheck size={20} />,
      content: <div>Here are your Leave Requests.</div>,
    },
    {
      key: 'notifications',
      label: 'Notifications',
      icon: <IoMdNotificationsOutline size={20} />,
      content: <div>You have new Notifications.</div>,
    },
    {
      key: 'settings',
      label: 'Settings',
      icon: <CiSettings size={20} />,
      content: <div>Update your Settings here.</div>,
    },
  ];

  // Additional menu items based on role
  const roleSpecificMenuItems: Record<string, MenuItem[]> = {
    ADMIN: [
      {
        key: 'users',
        label: 'User Management',
        icon: <FaUserCircle size={20} />,
        content: <div>Manage Users here (Admin Only).</div>,
      },
    ],
    MANAGER: [
      {
        key: 'team',
        label: 'Team Management',
        icon: <FaUserCircle size={20} />,
        content: <div>Manage your Team here (Manager Only).</div>,
      },
    ],
    STAFF: [],
  };

  const menuItems = [...baseMenuItems, ...(roleSpecificMenuItems[role] || [])];

  const handleMenuClick = (key: string) => {
    setActiveKey(key);
  };

  const activeContent = menuItems.find(item => item.key === activeKey)?.content || <div>Page not found</div>;

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
                className={`menu-item ${activeKey === item.key ? 'active' : ''}`}
                onClick={() => handleMenuClick(item.key)}
              >
                <div className={`icon-wrapper ${activeKey === item.key ? 'active' : ''}`}>
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
                  {user?.fullName
                    ? user.fullName.split(' ').map((word: string) => word[0]).join('').toUpperCase()
                    : 'User'}
                </div>
                <IoMdArrowDropdown size={20} />
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content className="content">
          {activeContent}
        </Content>
      </Layout>
    </Layout>
  );
};

export default LayoutDashboard;
