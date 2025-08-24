import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="home-container" style={{ marginTop: '80px' }}>
      <div className="card">
        <div className="text-center">
          <h1 className="text-primary">
            <i className="fas fa-money-bill-wave"></i> Mini Splitwise
          </h1>
          <p className="lead">
            Split expenses with friends and keep track of balances
          </p>
          <div className="buttons">
            <Link to="/register" className="btn btn-primary">
              Sign Up
            </Link>
            <Link to="/login" className="btn btn-secondary">
              Login
            </Link>
          </div>
        </div>
      </div>
      
      <div className="card">
        <h2>How It Works</h2>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', marginTop: '20px' }}>
          <div style={{ flex: '1', minWidth: '250px', padding: '15px', textAlign: 'center' }}>
            <i className="fas fa-users fa-3x" style={{ color: '#1cc29f', marginBottom: '15px' }}></i>
            <h3>Add Friends</h3>
            <p>Create groups with your friends, roommates, or travel buddies</p>
          </div>
          <div style={{ flex: '1', minWidth: '250px', padding: '15px', textAlign: 'center' }}>
            <i className="fas fa-receipt fa-3x" style={{ color: '#1cc29f', marginBottom: '15px' }}></i>
            <h3>Track Expenses</h3>
            <p>Add bills and split them equally or with custom amounts</p>
          </div>
          <div style={{ flex: '1', minWidth: '250px', padding: '15px', textAlign: 'center' }}>
            <i className="fas fa-balance-scale fa-3x" style={{ color: '#1cc29f', marginBottom: '15px' }}></i>
            <h3>Settle Up</h3>
            <p>See who owes whom and settle debts with a single click</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;