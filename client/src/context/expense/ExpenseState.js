import React, { useReducer } from 'react';
import axios from 'axios';
import ExpenseContext from './expenseContext';
import expenseReducer from './expenseReducer';
import {
  GET_EXPENSES,
  ADD_EXPENSE,
  DELETE_EXPENSE,
  EXPENSE_ERROR,
  GET_BALANCES,
  SETTLE_UP
} from '../types';

const ExpenseState = props => {
  const initialState = {
    expenses: [],
    balances: [],
    error: null,
    loading: true
  };

  const [state, dispatch] = useReducer(expenseReducer, initialState);

  // Get Expenses for a Group
  const getExpenses = async groupId => {
    try {
      const res = await axios.get(`/api/expenses/${groupId}`);

      dispatch({
        type: GET_EXPENSES,
        payload: res.data
      });
    } catch (err) {
      dispatch({
        type: EXPENSE_ERROR,
        payload: err.response.msg
      });
    }
  };

  // Add Expense
  const addExpense = async expense => {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    try {
      const res = await axios.post('/api/expenses', expense, config);
      
      dispatch({
        type: ADD_EXPENSE,
        payload: res.data
      });
    } catch (err) {
      dispatch({
        type: EXPENSE_ERROR,
        payload: err.response.msg
      });
    }
  };

  // Get Balances
  const getBalances = async () => {
    try {
      const res = await axios.get('/api/balances');

      dispatch({
        type: GET_BALANCES,
        payload: res.data
      });
    } catch (err) {
      dispatch({
        type: EXPENSE_ERROR,
        payload: err.response.msg
      });
    }
  };

  // Settle Up
  const settleUp = async settlement => {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    try {
      const res = await axios.post('/api/settle', settlement, config);

      dispatch({
        type: SETTLE_UP,
        payload: res.data
      });

      // Refresh balances after settling up
      getBalances();
    } catch (err) {
      dispatch({
        type: EXPENSE_ERROR,
        payload: err.response.msg
      });
    }
  };

  // Delete Expense
  const deleteExpense = async (expenseId) => {
    try {
      await axios.delete(`/api/expenses/${expenseId}`);

      dispatch({
        type: DELETE_EXPENSE,
        payload: expenseId
      });
    } catch (err) {
      dispatch({
        type: EXPENSE_ERROR,
        payload: err.response?.msg || 'Error deleting expense'
      });
    }
  };

  return (
    <ExpenseContext.Provider
      value={{
        expenses: state.expenses,
        balances: state.balances,
        error: state.error,
        loading: state.loading,
        getExpenses,
        addExpense,
        deleteExpense,
        getBalances,
        settleUp
      }}
    >
      {props.children}
    </ExpenseContext.Provider>
  );
};

export default ExpenseState;