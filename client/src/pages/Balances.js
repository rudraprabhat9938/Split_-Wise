import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ExpenseContext from '../context/expense/expenseContext';
import AuthContext from '../context/auth/authContext';
import AlertContext from '../context/alert/alertContext';
// formatCurrency removed (unused) to satisfy lint rules
import { generateBalancePDF } from '../utils/pdfExport';

const Balances = () => {
  const expenseContext = useContext(ExpenseContext);
  const authContext = useContext(AuthContext);
  const alertContext = useContext(AlertContext);

  const { balances, getBalances, settleUp } = expenseContext;
  const { user } = authContext;
  const { setAlert } = alertContext;

  const [selectedBalance, setSelectedBalance] = useState(null);
  const [showSettleModal, setShowSettleModal] = useState(false);
  const [summary, setSummary] = useState({
    totalOwed: 0,
    totalOwing: 0,
    netBalance: 0
  });

  useEffect(() => {
    getBalances();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (balances && balances.length > 0) {
      const totalOwed = balances
        .filter(balance => balance.amount < 0)
        .reduce((sum, balance) => sum + Math.abs(balance.amount), 0);
      
      const totalOwing = balances
        .filter(balance => balance.amount > 0)
        .reduce((sum, balance) => sum + balance.amount, 0);
      
      setSummary({
        totalOwed,
        totalOwing,
        netBalance: totalOwing - totalOwed
      });
    }
  }, [balances]);

  const onSettleClick = balance => {
    setSelectedBalance(balance);
    setShowSettleModal(true);
  };

  const onSettleConfirm = () => {
    if (selectedBalance) {
      settleUp({
        to_user_id: selectedBalance.user_id,
        amount: Math.abs(selectedBalance.amount)
      });
      setAlert('Settlement recorded successfully', 'success');
      setShowSettleModal(false);
      setSelectedBalance(null);
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
        <div className="dashboard-title">
          <Link to="/dashboard" className="btn btn-dark back-button">
            <i className="fas fa-arrow-left"></i> Back
          </Link>
          <h1 className="page-title">Your Balances</h1>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={handleDownloadPDF}
        >
          <i className="fas fa-file-pdf"></i> Download Report
        </button>
      </div>

      {/* Balance Summary */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <i className="fas fa-arrow-up" style={{ color: 'var(--success-color)' }}></i>
          <h3 className="currency-inr">{summary.totalOwing.toFixed(2)}</h3>
          <p>You are owed</p>
        </div>
        <div className="stat-card">
          <i className="fas fa-arrow-down" style={{ color: 'var(--danger-color)' }}></i>
          <h3 className="currency-inr">{summary.totalOwed.toFixed(2)}</h3>
          <p>You owe</p>
        </div>
        <div className="stat-card">
          <i className={summary.netBalance >= 0 ? "fas fa-plus-circle" : "fas fa-minus-circle"} 
             style={{ color: summary.netBalance >= 0 ? 'var(--success-color)' : 'var(--danger-color)' }}></i>
          <h3 className="currency-inr">{Math.abs(summary.netBalance).toFixed(2)}</h3>
          <p>Net {summary.netBalance >= 0 ? 'positive' : 'negative'}</p>
        </div>
      </div>

      {showSettleModal && selectedBalance && (
        <div className="card" style={{ marginBottom: '20px', animation: 'slideDown 0.3s ease' }}>
          <div className="card-header">
            <h2>Confirm Settlement</h2>
          </div>
          <div className="card-body">
            <p>
              You are about to settle up with <strong>{selectedBalance.name}</strong> for{' '}
              <strong className="currency-inr">{Math.abs(selectedBalance.amount).toFixed(2)}</strong>.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button
                className="btn btn-secondary"
                style={{ marginRight: '10px' }}
                onClick={() => setShowSettleModal(false)}
              >
                <i className="fas fa-times"></i> Cancel
              </button>
              <button className="btn btn-success" onClick={onSettleConfirm}>
                <i className="fas fa-check"></i> Confirm Settlement
              </button>
            </div>
          </div>
        </div>
      )}

      <h2 className="section-title" style={{ marginTop: '2rem', marginBottom: '1rem' }}>
        <i className="fas fa-exchange-alt"></i> Balance Details
      </h2>

      {balances.length === 0 ? (
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center', padding: '2rem' }}>
            <i className="fas fa-info-circle" style={{ fontSize: '3rem', color: 'var(--primary-color)', marginBottom: '1rem' }}></i>
            <p>No balances to show. Add expenses to see balances.</p>
          </div>
        </div>
      ) : (
        <div className="balance-list">
          {balances.map((balance, index) => (
            <div 
              key={balance.user_id} 
              className="balance-card card" 
              style={{ 
                animation: `fadeIn 0.5s ease ${index * 0.1}s both`,
                marginBottom: '1rem'
              }}
            >
              <div className="card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ marginBottom: '0.5rem' }}>{balance.name}</h3>
                    {balance.amount > 0 ? (
                      <p style={{ color: 'var(--success-color)', fontWeight: '500', margin: '0' }}>
                        <i className="fas fa-arrow-right"></i> {balance.name} owes you
                      </p>
                    ) : (
                      <p style={{ color: 'var(--danger-color)', fontWeight: '500', margin: '0' }}>
                        <i className="fas fa-arrow-left"></i> You owe {balance.name}
                      </p>
                    )}
                  </div>
                  <div 
                    style={{ 
                      fontSize: '1.5rem', 
                      fontWeight: 'bold',
                      color: balance.amount > 0 ? 'var(--success-color)' : 'var(--danger-color)',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <span className="currency-inr">{Math.abs(balance.amount).toFixed(2)}</span>
                  </div>
                </div>
                <div style={{ marginTop: '1rem', textAlign: 'right' }}>
                  {balance.amount !== 0 && (
                    <button
                      className={balance.amount < 0 ? "btn btn-danger" : "btn btn-success"}
                      onClick={() => onSettleClick(balance)}
                    >
                      <i className="fas fa-handshake"></i> {balance.amount < 0 ? 'Pay' : 'Settle Up'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PDF Download Button */}
      <div className="pdf-download-btn" onClick={handleDownloadPDF} title="Download Balance Report">
        <i className="fas fa-file-pdf"></i>
      </div>

      <div className="card" style={{ marginTop: '20px' }}>
        <h2>Balance Summary</h2>
        <div style={{ marginTop: '15px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span>Total you owe:</span>
            <span className="negative" style={{ fontWeight: 'bold' }}>
              ${balances
                .filter(b => b.amount < 0)
                .reduce((acc, b) => acc + Math.abs(b.amount), 0)
                .toFixed(2)}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span>Total owed to you:</span>
            <span className="positive" style={{ fontWeight: 'bold' }}>
              ${balances
                .filter(b => b.amount > 0)
                .reduce((acc, b) => acc + b.amount, 0)
                .toFixed(2)}
            </span>
          </div>
          <hr />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
            <span style={{ fontWeight: 'bold' }}>Net balance:</span>
            <span
              className={
                balances.reduce((acc, b) => acc + b.amount, 0) >= 0
                  ? 'positive'
                  : 'negative'
              }
              style={{ fontWeight: 'bold' }}
            >
              ${balances.reduce((acc, b) => acc + b.amount, 0).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Balances;