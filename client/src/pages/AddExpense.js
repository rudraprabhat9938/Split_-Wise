import React, { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import GroupContext from '../context/group/groupContext';
import ExpenseContext from '../context/expense/expenseContext';
import AuthContext from '../context/auth/authContext';
import AlertContext from '../context/alert/alertContext';

const AddExpense = ({ match, history }) => {
  const groupContext = useContext(GroupContext);
  const expenseContext = useContext(ExpenseContext);
  const authContext = useContext(AuthContext);
  const alertContext = useContext(AlertContext);

  const { groups } = groupContext;
  const { addExpense } = expenseContext;
  const { user } = authContext;
  const { setAlert } = alertContext;

  const [currentGroup, setCurrentGroup] = useState(null);
  const [expense, setExpense] = useState({
    group_id: match.params.groupId,
    amount: '',
    description: '',
    split_type: 'equal',
    shares: []
  });

  useEffect(() => {
    if (groups.length > 0) {
      const group = groups.find(g => g.id === parseInt(match.params.groupId));
      setCurrentGroup(group);
    }
    // eslint-disable-next-line
  }, [match.params.groupId, groups]);

  const { amount, description, split_type } = expense;

  const onChange = e => setExpense({ ...expense, [e.target.name]: e.target.value });

  const onSubmit = e => {
    e.preventDefault();
    if (amount === '' || description === '') {
      setAlert('Please fill in all fields', 'danger');
    } else {
      // For simplicity, we'll just use the current user as the only share
      // In a real app, you would get the group members and create shares for each
      const newExpense = {
        ...expense,
        amount: parseFloat(amount),
        shares: [user.id]
      };
      
      addExpense(newExpense);
      setAlert('Expense added successfully', 'success');
      history.push(`/groups/${match.params.groupId}`);
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
    <div className="add-expense">
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1 className="page-title">Add Expense</h1>
          <p className="subtitle">Add a new expense to {currentGroup.name}</p>
        </div>
        <div className="header-actions">
          <Link to={`/groups/${match.params.groupId}`} className="btn btn-dark back-button">
            <i className="fas fa-arrow-left"></i> Back to Group
          </Link>
        </div>
      </div>

      <div className="card" style={{animation: 'fadeIn 0.5s ease both'}}>
        <div className="card-body">
          <form onSubmit={onSubmit}>
            <div className="form-group">
              <label htmlFor="description">
                <i className="fas fa-tag"></i> Description
              </label>
              <input
                type="text"
                name="description"
                value={description}
                onChange={onChange}
                placeholder="What was this expense for?"
                className="form-control"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="amount">
                <i className="fas fa-rupee-sign"></i> Amount (INR)
              </label>
              <input
                type="number"
                name="amount"
                value={amount}
                onChange={onChange}
                placeholder="0.00"
                step="0.01"
                min="0.01"
                className="form-control"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="split_type">
                <i className="fas fa-users"></i> Split Type
              </label>
              <select 
                name="split_type" 
                value={split_type} 
                onChange={onChange}
                className="form-control"
              >
                <option value="equal">Equal</option>
                <option value="exact">Exact Amounts</option>
                <option value="percentage">Percentage</option>
              </select>
            </div>
            <div className="form-group">
              <button
                type="submit"
                className="btn btn-primary btn-block"
              >
                <i className="fas fa-plus-circle"></i> Add Expense
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddExpense;