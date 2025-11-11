import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FileText,
  Layout,
  Users,
  Settings as SettingsIcon,
  BarChart3,
} from 'lucide-react';

const Navigation: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <FileText size={24} />
        Invoice Manager
      </div>
      <ul className="navbar-menu">
        <li className="navbar-item">
          <Link
            to="/"
            className={`navbar-link ${isActive('/') ? 'active' : ''}`}
          >
            <BarChart3 size={18} />
            Dashboard
          </Link>
        </li>
        <li className="navbar-item">
          <Link
            to="/invoices"
            className={`navbar-link ${isActive('/invoices') ? 'active' : ''}`}
          >
            <FileText size={18} />
            Invoices
          </Link>
        </li>
        <li className="navbar-item">
          <Link
            to="/templates"
            className={`navbar-link ${isActive('/templates') ? 'active' : ''}`}
          >
            <Layout size={18} />
            Templates
          </Link>
        </li>
        <li className="navbar-item">
          <Link
            to="/customers"
            className={`navbar-link ${isActive('/customers') ? 'active' : ''}`}
          >
            <Users size={18} />
            Customers
          </Link>
        </li>
        <li className="navbar-item">
          <Link
            to="/settings"
            className={`navbar-link ${isActive('/settings') ? 'active' : ''}`}
          >
            <SettingsIcon size={18} />
            Settings
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navigation;
