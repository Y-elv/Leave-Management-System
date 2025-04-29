import React from 'react';
import { IoMdNotificationsOutline } from 'react-icons/io';
import '../css/Notifications.css';

const notifications = [
  {
    id: 1,
    title: 'Leave Request Approved',
    description: 'Your leave request from Apr 15 to Apr 18 has been approved.',
    time: '2 hours ago',
  },
  {
    id: 2,
    title: 'New Company Policy',
    description: 'A new policy on remote work has been added.',
    time: '1 day ago',
  },
  {
    id: 3,
    title: 'Reminder: Timesheet Submission',
    description: 'Please submit your timesheet by 5 PM today.',
    time: '3 days ago',
  },
];

const Notifications: React.FC = () => {
  return (
    <div className="notifications-container">
      <h2 className="notifications-header">
        <IoMdNotificationsOutline size={24} />
        Notifications
      </h2>
      <ul>
        {notifications.map((note) => (
          <li key={note.id} className="notification-item">
            <div className="notification-title">{note.title}</div>
            <div className="notification-description">{note.description}</div>
            <div className="notification-time">{note.time}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Notifications;
