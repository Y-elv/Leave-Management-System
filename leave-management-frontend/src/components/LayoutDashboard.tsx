import React, { useEffect, useMemo, useState } from "react";
import { Layout, Button, Tooltip, Dropdown } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { IoMdNotificationsOutline } from "react-icons/io";
import { CiSettings } from "react-icons/ci";
import { FaUserCircle } from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import { BsCalendarCheck } from "react-icons/bs";
import { BiDownload } from "react-icons/bi";
import AdminDashboardContent from "../components/AdminDashboardContent";
import "../css/LayoutDashboard.css";
import UserManagement from "./UserManagement";
import SupervisorDashboardContent from "./SupervisorDashboardContent";
import StaffDashboardContent from "./StaffDashboardContent";
import LeaveRequest from "./LeaveRequest";
import ExportLeaveReports from "./ExportLeaveReports";
import Notifications from "./Notifications";
import Settings from "./Settings";
import { clearAuth, getAuth, getDashboardRouteForRole } from "../utils/auth";
import { useNavigate } from "react-router-dom";
import UserProfile from "./UserProfile";
import { motion, AnimatePresence } from "framer-motion";

const { Header, Sider, Content } = Layout;

interface MenuItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

interface LayoutDashboardProps {
  role: "ADMIN" | "EMPLOYEE" | "HR" | "SUPERVISOR";
}

const LayoutDashboard: React.FC<LayoutDashboardProps> = ({ role }) => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeKey, setActiveKey] = useState<string>("dashboard");

  const [authTick, setAuthTick] = useState(0);

  useEffect(() => {
    const onAuthRefresh = () => setAuthTick((t) => t + 1);
    window.addEventListener("slm-auth-updated", onAuthRefresh);
    return () => window.removeEventListener("slm-auth-updated", onAuthRefresh);
  }, []);

  const getUserFromToken = () => {
    const savedUser = getAuth()?.user as {
      fullName?: string;
      name?: string;
      profilePictureUrl?: string | null;
    } | undefined;
    if (savedUser) return savedUser;

    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      const payloadBase64 = token.split(".")[1];
      const decodedPayload = JSON.parse(atob(payloadBase64));
      return decodedPayload;
    } catch (error) {
      console.error("Failed to decode token", error);
      return null;
    }
  };

  const user = useMemo(() => getUserFromToken(), [authTick]);

  const sessionUser = user as {
    fullName?: string;
    name?: string;
    profilePictureUrl?: string | null;
  } | null;
  const displayName = sessionUser?.fullName || sessionUser?.name || "User";

  const getInitials = (fullName?: string) => {
    if (!fullName) return "U";
    const names = fullName.trim().split(/\s+/).filter(Boolean);
    if (names.length === 0) return "U";
    return names[0][0].toUpperCase();
  };

  const handleLogout = () => {
    clearAuth();
    window.location.href = "/login";
  };

  const getDashboardContent = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <AdminDashboardContent user={user} />;
      case "SUPERVISOR":
        return <SupervisorDashboardContent user={user} />;
      case "HR":
        return <AdminDashboardContent user={user} />;
      case "EMPLOYEE":
        return <StaffDashboardContent user={user} />;
      default:
        return <div>Unknown Role</div>;
    }
  };

  useEffect(() => {
    const onResize = () => {
      const isMobile = window.innerWidth <= 992;
      setMobile(isMobile);
      if (!isMobile) {
        setMobileSidebarOpen(false);
      }
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const profileMenuItem: MenuItem = {
    key: "profile",
    label: "Profile",
    icon: <FaUserCircle size={20} />,
    content: <UserProfile />,
  };

  const baseMenuItems: MenuItem[] = [
    {
      key: "dashboard",
      label: "Dashboard",
      icon: <MdDashboard size={20} />,
      content: getDashboardContent(role),
    },
    {
      key: "notifications",
      label: "Notifications",
      icon: <IoMdNotificationsOutline size={20} />,
      content: <Notifications />,
    },
    {
      key: "settings",
      label: "Settings",
      icon: <CiSettings size={20} />,
      content: <Settings />,
    },
  ];

  const roleSpecificMenuItems: Record<string, MenuItem[]> = {
    ADMIN: [
      {
        key: "users",
        label: "User Management",
        icon: <FaUserCircle size={20} />,
        content: <UserManagement />,
      },
      {
        key: "export",
        label: "Export Reports",
        icon: <BiDownload size={20} />,
        content: <ExportLeaveReports />,
      },
    ],
    SUPERVISOR: [
      {
        key: "leave-requests",
        label: "Leave Requests",
        icon: <BsCalendarCheck size={20} />,
        content: <LeaveRequest />,
      },
    ],
    HR: [
      {
        key: "users",
        label: "User Management",
        icon: <FaUserCircle size={20} />,
        content: <UserManagement />,
      },
      {
        key: "export",
        label: "Export Reports",
        icon: <BiDownload size={20} />,
        content: <ExportLeaveReports />,
      },
    ],
    EMPLOYEE: [
      {
        key: "apply-leave",
        label: "Apply Leave",
        icon: <BsCalendarCheck size={20} />,
        content: <LeaveRequest />,
      },
      {
        key: "leave-guide",
        label: "Leave Guide",
        icon: <FaUserCircle size={20} />,
        content: (
          <div style={{ padding: "16px", lineHeight: 1.8 }}>
            <h3>Employee Leave Menu Guide</h3>
            <p>Use this workspace to manage your leave end-to-end:</p>
            <ul>
              <li><strong>Dashboard:</strong> View balance, status insights, and recent requests.</li>
              <li><strong>Apply Leave:</strong> Create a new leave request with supporting documents.</li>
              <li><strong>Notifications:</strong> Track approvals/rejections and updates.</li>
              <li><strong>Settings:</strong> Keep your profile details current.</li>
            </ul>
          </div>
        ),
      },
    ],
  };

  const normalizedRole = role === "EMPLOYEE" ? "EMPLOYEE" : role;

  const menuItems = [
    baseMenuItems[0],
    profileMenuItem,
    ...(roleSpecificMenuItems[normalizedRole] || []),
    ...baseMenuItems.slice(1),
  ];

  const handleMenuClick = (key: string) => {
    setActiveKey(key);
    if (mobile) {
      setMobileSidebarOpen(false);
    }
  };

  const activeContent = menuItems.find((item) => item.key === activeKey)
    ?.content || <div>Page not found</div>;

  const headerTitle = useMemo(() => {
    return menuItems.find((item) => item.key === activeKey)?.label || "Dashboard";
  }, [activeKey, menuItems]);

  const siderCollapsed = mobile ? !mobileSidebarOpen : collapsed;
  const goToDashboardHome = () => {
    const path = getDashboardRouteForRole(role);
    navigate(path, { replace: false });
    setActiveKey("dashboard");
    if (mobile) setMobileSidebarOpen(false);
  };

  const userMenuItems = [
    {
      key: "profile",
      label: "Profile",
      onClick: () => setActiveKey("profile"),
    },
    {
      key: "logout",
      label: "Logout",
      onClick: handleLogout,
    },
  ];

  return (
    <Layout className="layout-container">
      {mobile && mobileSidebarOpen && (
        <div className="sidebar-backdrop" onClick={() => setMobileSidebarOpen(false)} />
      )}
      <Sider
        trigger={null}
        collapsible
        width={260}
        collapsedWidth={mobile ? 0 : 80}
        collapsed={siderCollapsed}
        className={`sidebar ${collapsed ? "collapsed" : ""} ${
          mobile && mobileSidebarOpen ? "sidebar--mobile-full" : ""
        }`}
        breakpoint="lg"
        style={
          mobile
            ? { position: "fixed", zIndex: 1250, height: "100vh", left: 0, top: 0 }
            : undefined
        }
      >
        <div className="logo-row">
          <button
            type="button"
            className="logo logo--home"
            onClick={goToDashboardHome}
            title="Go to dashboard home"
          >
            {siderCollapsed ? (
              <span className="logo-brand-abbrev">LMS</span>
            ) : (
              <>
                <span className="logo-brand-desktop">
                  <span className="logo-brand-line">
                    <strong className="logo-brand-strong">Leave Management</strong>
                    <span className="logo-brand-system"> System</span>
                  </span>
                </span>
                <span className="logo-brand-mobile">LMS</span>
              </>
            )}
          </button>
          {mobileSidebarOpen && (
            <Button
              type="text"
              className="sidebar-close-btn"
              icon={<CloseOutlined />}
              onClick={() => setMobileSidebarOpen(false)}
            />
          )}
        </div>

        <div className="menu-container">
          {menuItems.map((item) => (
            <Tooltip
              key={item.key}
              title={siderCollapsed ? item.label : ""}
              placement="right"
            >
              <div
                className={`menu-item ${
                  activeKey === item.key ? "active" : ""
                }`}
                onClick={() => handleMenuClick(item.key)}
              >
                <div
                  className={`icon-wrapper ${
                    activeKey === item.key ? "active" : ""
                  }`}
                >
                  {item.icon}
                </div>
                {!siderCollapsed && <span className="label">{item.label}</span>}
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
              icon={
                mobile
                  ? (mobileSidebarOpen ? <CloseOutlined /> : <MenuUnfoldOutlined />)
                  : (collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />)
              }
              onClick={() => {
                if (mobile) {
                  setMobileSidebarOpen((prev) => !prev);
                } else {
                  setCollapsed(!collapsed);
                }
              }}
              className="toggle-button"
            />
            <span className="page-title">{headerTitle}</span>
          </div>

          <div className="right-section">
            <Dropdown
              menu={{ items: userMenuItems }}
              trigger={["hover"]}
              placement="bottomRight"
            >
              <div className="user-section">
                <span className="user-name">{displayName}</span>
                <div className="user-avatar">
                  {sessionUser?.profilePictureUrl ? (
                    <img
                      src={sessionUser.profilePictureUrl}
                      alt={displayName}
                      style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
                    />
                  ) : (
                    getInitials(sessionUser?.fullName || sessionUser?.name)
                  )}
                </div>
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content className="content">
          <div className="scrollable-content">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeKey}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.22 }}
              >
                {activeContent}
              </motion.div>
            </AnimatePresence>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default LayoutDashboard;
