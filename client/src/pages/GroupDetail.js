import React, { useContext, useEffect, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import GroupContext from '../context/group/groupContext';
import ExpenseContext from '../context/expense/expenseContext';
import AuthContext from '../context/auth/authContext';
import { formatCurrency } from '../utils/formatCurrency';
import { generateExpensePDF } from '../utils/pdfExport';

const GroupDetail = ({ match }) => {
  const groupContext = useContext(GroupContext);
  const expenseContext = useContext(ExpenseContext);
  const authContext = useContext(AuthContext);
  const history = useHistory();

  const { groups, deleteGroup } = groupContext;
  const { expenses, getExpenses, deleteExpense } = expenseContext;
  const { user } = authContext;

  const [currentGroup, setCurrentGroup] = useState(null);
  const [groupStats, setGroupStats] = useState({
    totalExpenses: 0,
    memberCount: 0,
    expenseCount: 0
  });

  useEffect(() => {
    if (groups.length > 0) {
      const group = groups.find(g => g.id === parseInt(match.params.id));
      setCurrentGroup(group);
      
      if (group) {
        // Calculate group stats
        setGroupStats({
          totalExpenses: expenses.reduce((total, exp) => total + exp.amount, 0),
          memberCount: group.members ? group.members.length : 0,
          expenseCount: expenses.length
        });
      }
    }
    getExpenses(match.params.id);
    // eslint-disable-next-line
  }, [match.params.id, groups, expenses]);

  const handleDownloadPDF = () => {
    try {
      if (!currentGroup || expenses.length === 0) {
        alert('No expense data to export');
        return;
      }
      generateExpensePDF(currentGroup.name, expenses);
      alert('PDF downloaded successfully');
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Failed to generate PDF');
    }
  };
  
  const handleDeleteExpense = (expenseId) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      deleteExpense(expenseId);
    }
  };
  
  const handleDeleteGroup = () => {
    if (window.confirm('Are you sure you want to delete this group? All expenses will be lost.')) {
      deleteGroup(currentGroup.id);
      history.push('/dashboard');
    }
  };

  if (!currentGroup) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading group details...</p>
      </div>
    );
  }

  return (
    <div className="group-detail">
      <div className="dashboard-header">
        <div>
          <Link to="/dashboard" className="btn btn-dark back-button">
            <i className="fas fa-arrow-left"></i> Back
          </Link>
          <h1 className="page-title">{currentGroup.name}</h1>
          <p className="subtitle">Group Expenses and Details</p>
        </div>
        <div className="header-actions">
          <Link to={`/add-expense/${currentGroup.id}`} className="btn btn-primary">
            <i className="fas fa-plus"></i> Add Expense
          </Link>
          <button onClick={handleDownloadPDF} className="btn btn-success ml-2">
            <i className="fas fa-file-pdf"></i> Export PDF
          </button>
          <button onClick={handleDeleteGroup} className="btn btn-danger ml-2">
            <i className="fas fa-trash"></i> Delete Group
          </button>
        </div>
      </div>

      {/* Group Stats */}
      <div className="dashboard-stats">
        <div className="stat-card" style={{animation: 'fadeIn 0.5s ease 0.1s both'}}>
          <div className="stat-icon">
            <i className="fas fa-money-bill-wave"></i>
          </div>
          <div className="stat-content">
            <h3>{formatCurrency(groupStats.totalExpenses)}</h3>
            <p>Total Expenses</p>
          </div>
        </div>
        <div className="stat-card" style={{animation: 'fadeIn 0.5s ease 0.2s both'}}>
          <div className="stat-icon">
            <i className="fas fa-receipt"></i>
          </div>
          <div className="stat-content">
            <h3>{groupStats.expenseCount}</h3>
            <p>Expenses</p>
          </div>
        </div>
        <div className="stat-card" style={{animation: 'fadeIn 0.5s ease 0.3s both'}}>
          <div className="stat-icon">
            <i className="fas fa-users"></i>
          </div>
          <div className="stat-content">
            <h3>{groupStats.memberCount}</h3>
            <p>Members</p>
          </div>
        </div>
      </div>

      <h2 className="section-title">
        <i className="fas fa-list-ul"></i> Expense History
      </h2>

      {expenses.length === 0 ? (
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center', padding: '2rem' }}>
            <i className="fas fa-receipt" style={{ fontSize: '3rem', color: 'var(--primary-color)', marginBottom: '1rem' }}></i>
            <p>No expenses yet. Add one to get started!</p>
          </div>
        </div>
      ) : (
        <div className="expense-list">
          {expenses.map((expense, index) => (
            <div 
              key={expense.id} 
              className="expense-card card"
              style={{ animation: `slideUp 0.5s ease ${index * 0.1}s both` }}
            >
              <div className="card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3>{expense.description}</h3>
                    <p>
                      <i className="fas fa-user"></i> <strong>Paid by:</strong> {expense.paid_by_name}
                    </p>
                    <p>
                      <i className="fas fa-calendar-alt"></i> <strong>Date:</strong> {new Date(expense.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <div className="amount currency-inr">
                      {formatCurrency(expense.amount)}
                    </div>
                    <button 
                      onClick={() => handleDeleteExpense(expense.id)} 
                      className="btn btn-sm btn-danger mt-2"
                      title="Delete expense"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
                <div className="expense-shares">
                  <h4><i className="fas fa-users"></i> Shares:</h4>
                  <ul>
                    {expense.shares && expense.shares.map(share => (
                      <li key={share.id}>
                        <span>{share.user_name}</span>
                        <span className="share-amount">
                          {formatCurrency(share.amount)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PDF Download Button */}
      {expenses.length > 0 && (
        <div className="pdf-download-btn" onClick={handleDownloadPDF} title="Download Expense Report">
          <i className="fas fa-file-pdf"></i>
        </div>
      )}
    </div>
  );
};

export default GroupDetail;