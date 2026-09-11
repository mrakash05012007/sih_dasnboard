import { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useSensorData } from './hooks/useSensorData';
import Sidebar from './components/Layout/Sidebar';
import TopBar from './components/Layout/TopBar';
import Overview from './pages/Overview';
import LiveMonitoring from './pages/LiveMonitoring';
import Workers from './pages/Workers';
import SensorHistory from './pages/SensorHistory';
import Alerts from './pages/Alerts';
import Analytics from './pages/Analytics';
import SystemStatus from './pages/SystemStatus';
import Settings from './pages/Settings';
import './index.css';

const PAGE_TITLES = {
  '/':              'Overview',
  '/live':          'Live Monitoring',
  '/workers':       'Workers',
  '/history':       'Sensor History',
  '/alerts':        'Alerts',
  '/analytics':     'Analytics',
  '/system-status': 'System Status',
  '/settings':      'Settings',
};

function AppInner() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [pollInterval, setPollInterval] = useState(1500);

  const {
    sensorData,
    workers,
    alerts,
    systemStatus,
    connectionState,
    isDemoMode,
    lastUpdated,
    history,
  } = useSensorData(pollInterval);

  const pageTitle = PAGE_TITLES[location.pathname] || 'Dashboard';
  const criticalAlertCount = alerts.filter(a => ['CRITICAL', 'DANGER'].includes(a.severity)).length;

  return (
    <div className="app-layout">
      <Sidebar
        connectionState={connectionState}
        alertCount={criticalAlertCount}
        collapsed={collapsed}
        onToggle={() => setCollapsed(c => !c)}
      />
      <div className={`main-content ${collapsed ? 'sidebar-collapsed' : ''}`}>
        <TopBar
          title={pageTitle}
          connectionState={connectionState}
          lastUpdated={lastUpdated}
          isDemoMode={isDemoMode}
        />
        <Routes>
          <Route path="/" element={
            <Overview
              sensorData={sensorData}
              workers={workers}
              alerts={alerts}
              history={history}
              isDemoMode={isDemoMode}
            />
          } />
          <Route path="/live" element={
            <LiveMonitoring
              sensorData={sensorData}
              connectionState={connectionState}
              lastUpdated={lastUpdated}
              isDemoMode={isDemoMode}
            />
          } />
          <Route path="/workers" element={
            <Workers
              workers={workers}
              isDemoMode={isDemoMode}
            />
          } />
          <Route path="/history" element={
            <SensorHistory
              workers={workers}
              isDemoMode={isDemoMode}
              history={history}
            />
          } />
          <Route path="/alerts" element={
            <Alerts
              alerts={alerts}
              isDemoMode={isDemoMode}
            />
          } />
          <Route path="/analytics" element={
            <Analytics
              workers={workers}
              alerts={alerts}
              history={history}
              isDemoMode={isDemoMode}
            />
          } />
          <Route path="/system-status" element={
            <SystemStatus
              systemStatus={systemStatus}
              connectionState={connectionState}
              isDemoMode={isDemoMode}
            />
          } />
          <Route path="/settings" element={
            <Settings
              onPollIntervalChange={setPollInterval}
            />
          } />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  );
}
