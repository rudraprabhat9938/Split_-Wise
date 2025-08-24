import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/auth/authContext';
import GroupContext from '../context/group/groupContext';
import AlertContext from '../context/alert/alertContext';
import ExpenseContext from '../context/expense/expenseContext';
import { formatCurrency } from '../utils/formatCurrency';
import { generateBalancePDF } from '../utils/pdfExport';

const Dashboard = () => {
  const authContext = useContext(AuthContext);
  const groupContext = useContext(GroupContext);
  const alertContext = useContext(AlertContext);
  const expenseContext = useContext(ExpenseContext);

  const { user, loadUser } = authContext;
  const { groups, getGroups, addGroup } = groupContext;
  const { setAlert } = alertContext;
  const { balances, getBalances } = expenseContext;

  const [showAddGroup, setShowAddGroup] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: '',
    members: []
  });
  const [stats, setStats] = useState({
    totalGroups: 0,
    totalExpenses: 0,
    totalOwed: 0,
    totalOwing: 0
  });

  useEffect(() => {
    loadUser();
    getGroups();
    getBalances();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (groups) {
      // Calculate stats
      const totalExpenses = groups.reduce((sum, group) => sum + (group.totalExpenses || 0), 0);
      
      // Calculate balances
      let totalOwed = 0;
      let totalOwing = 0;
      
      if (balances) {
        balances.forEach(balance => {
          if (balance.amount < 0) {
            totalOwed += Math.abs(balance.amount);
          } else {
            totalOwing += balance.amount;
          }
        });
      }
      
      setStats({
        totalGroups: groups.length,
        totalExpenses,
        totalOwed,
        totalOwing
      });
    }
  }, [groups, balances]);

  const { name } = newGroup;

  const onChange = e => setNewGroup({ ...newGroup, [e.target.name]: e.target.value });

  const onSubmit = e => {
    e.preventDefault();
    if (name === '') {
      setAlert('Please enter a group name', 'danger');
    } else {
      addGroup(newGroup);
      setNewGroup({
        name: '',
        members: []
      });
      setShowAddGroup(false);
      setAlert('Group added successfully', 'success');
    }
  };

  const handleDownloadPDF = () => {
    try {
      if (!balances || balances.length === 0) {
        setAlert('No balance data to export', 'danger');
        return;
      }
      generateBalancePDF(balances, user);
      setAlert('PDF downloaded successfully', 'success');
    } catch (error) {
      console.error('PDF generation error:', error);
      setAlert('Failed to generate PDF', 'danger');
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="page-title">Dashboard</h1>
        <button 
          className="btn btn-primary" 
          onClick={() => setShowAddGroup(!showAddGroup)}
        >
          <i className="fas fa-plus"></i> {showAddGroup ? 'Cancel' : 'Add Group'}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <i className="fas fa-users"></i>
          <h3>{stats.totalGroups}</h3>
          <p>Total Groups</p>
        </div>
        <div className="stat-card">
          <i className="fas fa-receipt"></i>
          <h3>{stats.totalExpenses}</h3>
          <p>Total Expenses</p>
        </div>
        <div className="stat-card">
          <i className="fas fa-arrow-up"></i>
          <h3 className="currency-inr">{stats.totalOwing.toFixed(2)}</h3>
          <p>You are owed</p>
        </div>
        <div className="stat-card">
          <i className="fas fa-arrow-down"></i>
          <h3 className="currency-inr">{stats.totalOwed.toFixed(2)}</h3>
          <p>You owe</p>
        </div>
      </div>

      {showAddGroup && (
        <div className="card" style={{ animation: 'slideDown 0.3s ease' }}>
          <div className="card-header">
            <h2>Add New Group</h2>
          </div>
          <div className="card-body">
            <form onSubmit={onSubmit}>
              <div className="form-group">
                <label htmlFor="name">Group Name</label>
                <input
                  type="text"
                  name="name"
                  value={name}
                  onChange={onChange}
                  placeholder="Enter group name"
                  className="form-control"
                  required
                />
              </div>
              <div className="form-group">
                <button
                  type="submit"
                  className="btn btn-primary btn-block"
                >
                  <i className="fas fa-plus-circle"></i> Add Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <h2 className="section-title" style={{ marginTop: '2rem', marginBottom: '1rem' }}>
        <i className="fas fa-layer-group"></i> Your Groups
      </h2>
      
      <div className="group-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {groups.length === 0 ? (
          <div className="card">
            <div className="card-body" style={{ textAlign: 'center', padding: '2rem' }}>
              <i className="fas fa-info-circle" style={{ fontSize: '3rem', color: 'var(--primary-color)', marginBottom: '1rem' }}></i>
              <p>No groups yet. Create one to get started!</p>
            </div>
          </div>
        ) : (
          groups.map(group => (
            <div key={group.id} className="card" style={{ animation: 'fadeIn 0.5s ease' }}>
              <div className="card-header">
                <h3>{group.name}</h3>
              </div>
              <div className="card-body">
                <p><i className="far fa-calendar-alt"></i> Created: {new Date(group.created_at).toLocaleDateString()}</p>
                {group.totalExpenses && (
                  <p><i className="fas fa-money-bill-wave"></i> Total Expenses: <span className="currency-inr">{group.totalExpenses.toFixed(2)}</span></p>
                )}
                <Link to={`/groups/${group.id}`} className="btn btn-primary btn-block" style={{ marginTop: '1rem' }}>
                  <i className="fas fa-eye"></i> View Details
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* PDF Download Button */}
      <div className="pdf-download-btn" onClick={handleDownloadPDF} title="Download Balance Report">
        <i className="fas fa-file-pdf"></i>
      </div>
    </div>
  );
};

export default Dashboard;