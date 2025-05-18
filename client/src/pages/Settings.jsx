import React, { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { FaMoon, FaSun, FaBell, FaLanguage, FaFont } from 'react-icons/fa';
import '../styles/settings.scss';

const Settings = () => {
  const { isDarkMode, toggleDarkMode } = useContext(ThemeContext);

  return (
    <div className="settings-container">
      <h1>Settings</h1>
      
      <div className="settings-section">
        <h2>Appearance</h2>
        <div className="settings-grid">
          <div className="setting-card">
            <div className="setting-header">
              <FaMoon className="setting-icon" />
              <div className="setting-info">
                <h3>Dark Mode</h3>
                <p>Switch between light and dark theme</p>
              </div>
            </div>
            <div className="setting-control">
              <label className="switch">
                <input
                  type="checkbox"
                  checked={isDarkMode}
                  onChange={toggleDarkMode}
                />
                <span className="slider round"></span>
              </label>
            </div>
          </div>

          <div className="setting-card">
            <div className="setting-header">
              <FaFont className="setting-icon" />
              <div className="setting-info">
                <h3>Font Size</h3>
                <p>Adjust the text size</p>
              </div>
            </div>
            <div className="setting-control">
              <select className="font-size-select">
                <option value="small">Small</option>
                <option value="medium" selected>Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h2>Notifications</h2>
        <div className="settings-grid">
          <div className="setting-card">
            <div className="setting-header">
              <FaBell className="setting-icon" />
              <div className="setting-info">
                <h3>Email Notifications</h3>
                <p>Receive email updates about your account</p>
              </div>
            </div>
            <div className="setting-control">
              <label className="switch">
                <input type="checkbox" defaultChecked />
                <span className="slider round"></span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h2>Language</h2>
        <div className="settings-grid">
          <div className="setting-card">
            <div className="setting-header">
              <FaLanguage className="setting-icon" />
              <div className="setting-info">
                <h3>Interface Language</h3>
                <p>Choose your preferred language</p>
              </div>
            </div>
            <div className="setting-control">
              <select className="language-select">
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;