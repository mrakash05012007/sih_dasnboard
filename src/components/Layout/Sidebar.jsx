import { NavLink, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { CONNECTION_STATE } from '../../hooks/useSensorData';
import './Sidebar.css';

const NAV_ITEMS = [
  { path: '/',              label: 'Overview',       icon: '⊞' },
  { path: '/live',          label: 'Live Monitoring', icon: '◉' },
  { path: '/workers',       label: 'Workers',        icon: '👷' },
  { path: '/history',       label: 'Sensor History', icon: '📈' },
  { path: '/alerts',        label: 'Alerts',         icon: '🔔' },
  { path: '/analytics',     label: 'Analytics',      icon: '📊' },
  { path: '/system-status', label: 'System Status',  icon: '🖥' },
  { path: '/settings',      label: 'Settings',       icon: '⚙' },
];

export default function Sidebar({ connectionState, alertCount = 0, collapsed, onToggle }) {
  const location = useLocation();

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">⛑</div>
        {!collapsed && (
          <div className="sidebar-logo-text">
            <span className="sidebar-brand">SafetyMon</span>
            <span className="sidebar-version">Industrial v1.0</span>
          </div>
        )}
        <button className="sidebar-toggle" onClick={onToggle} title="Toggle sidebar">
          {collapsed ? '›' : '‹'}
        </button>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {!collapsed && <div className="sidebar-section-label">Navigation</div>}
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            title={collapsed ? item.label : ''}
          >
            <span className="sidebar-icon">{item.icon}</span>
            {!collapsed && <span className="sidebar-label">{item.label}</span>}
            {!collapsed && item.path === '/alerts' && alertCount > 0 && (
              <span className="sidebar-badge">{alertCount > 99 ? '99+' : alertCount}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Connection Status */}
      <div className="sidebar-footer">
        <div className={`sidebar-conn ${connectionState === CONNECTION_STATE.CONNECTED ? 'connected' : connectionState === CONNECTION_STATE.DELAYED ? 'delayed' : 'disconnected'}`}>
          <span className={`dot ${connectionState === CONNECTION_STATE.CONNECTED ? 'online' : connectionState === CONNECTION_STATE.DELAYED ? 'delayed' : 'offline'}`} />
          {!collapsed && (
            <span>
              {connectionState === CONNECTION_STATE.CONNECTED ? 'RPi Connected' :
               connectionState === CONNECTION_STATE.DELAYED   ? 'Data Delayed' :
               'RPi Offline'}
            </span>
          )}
        </div>
      </div>
    </aside>
  );
}
