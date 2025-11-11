import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import toast from 'react-hot-toast';

interface DashboardStats {
  totalInvoices: number;
  totalRevenue: number;
  paidInvoices: number;
  pendingInvoices: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalInvoices: 0,
    totalRevenue: 0,
    paidInvoices: 0,
    pendingInvoices: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.getInvoices({ limit: 1000 });
      const invoices = response.data.invoices;

      const totalRevenue = invoices.reduce((sum: number, inv: any) => sum + inv.amount, 0);
      const paidInvoices = invoices.filter((inv: any) => inv.status === 'paid').length;
      const pendingInvoices = invoices.filter((inv: any) => inv.status !== 'paid').length;

      setStats({
        totalInvoices: invoices.length,
        totalRevenue,
        paidInvoices,
        pendingInvoices,
      });
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-page">
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">Dashboard</h1>
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="dashboard">
            <div className="stat-card">
              <div className="stat-label">Total Invoices</div>
              <div className="stat-value">{stats.totalInvoices}</div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Total Revenue</div>
              <div className="stat-value">${stats.totalRevenue.toFixed(2)}</div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Paid Invoices</div>
              <div className="stat-value">{stats.paidInvoices}</div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Pending Invoices</div>
              <div className="stat-value">{stats.pendingInvoices}</div>
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Quick Start</h2>
        </div>
        <ul style={{ lineHeight: '1.8' }}>
          <li>
            <a href="/settings">1. Configure company settings</a>
          </li>
          <li>
            <a href="/customers">2. Add customers</a>
          </li>
          <li>
            <a href="/templates">3. Create invoice templates</a>
          </li>
          <li>
            <a href="/invoices">4. Create and send invoices</a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
