import React, { useState, useEffect } from 'react';
import { CiSettings } from 'react-icons/ci';
import '../css/Settings.css';

const Settings: React.FC = () => {
  const [name, setName] = useState('John Doe');
  const [email, setEmail] = useState('john@example.com');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isDirty, setIsDirty] = useState(false);
  const [initialValues, setInitialValues] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    notificationsEnabled: true
  });

  useEffect(() => {
    // Check if any field has changed from initial values
    const hasChanged = 
      name !== initialValues.name || 
      email !== initialValues.email || 
      notificationsEnabled !== initialValues.notificationsEnabled;
    
    setIsDirty(hasChanged);
  }, [name, email, notificationsEnabled, initialValues]);

  const handleSave = () => {
    console.log('Saved Settings:', { name, email, notificationsEnabled });
    alert('Settings saved!');
    // Update initial values to current values after save
    setInitialValues({
      name,
      email,
      notificationsEnabled
    });
    setIsDirty(false);
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <CiSettings size={28} className="settings-icon" />
        <h2 className="settings-title">Account Settings</h2>
      </div>

      <div className="settings-form">
        <div className="settings-field">
          <label className="settings-label">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="settings-input"
            placeholder="Enter your name"
          />
        </div>

        <div className="settings-field">
          <label className="settings-label">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="settings-input"
            placeholder="Enter your email"
          />
        </div>

        <div className="settings-toggle">
          <span className="settings-label">Enable Notifications</span>
          <label className="toggle-switch">
  <input
    type="checkbox"
    checked={notificationsEnabled}
    onChange={(e) => setNotificationsEnabled(e.target.checked)}
    className="toggle-input"
  />
  <div className="toggle-track">
    <div className="toggle-thumb"></div>
  </div>
</label>

        </div>

        <button 
          onClick={handleSave} 
          className="settings-save-button"
          disabled={!isDirty}
        >
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default Settings;