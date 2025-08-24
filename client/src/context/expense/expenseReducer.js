import {
  GET_EXPENSES,
  ADD_EXPENSE,
  DELETE_EXPENSE,
  EXPENSE_ERROR,
  GET_BALANCES,
  SETTLE_UP
} from '../types';

export const expenseReducer = (state, action) => {
  switch (action.type) {
    case GET_EXPENSES:
      return {
        ...state,
        expenses: action.payload,
        loading: false
      };
    case ADD_EXPENSE:
      return {
        ...state,
        expenses: [action.payload, ...state.expenses],
        loading: false
      };
    case GET_BALANCES:
      return {
        ...state,
        balances: action.payload,
        loading: false
      };
    case SETTLE_UP:
      return {
        ...state,
        loading: false
      };
    case DELETE_EXPENSE:
      return {
        ...state,
        expenses: state.expenses.filter(expense => expense.id !== action.payload),
        loading: false
      };
    case EXPENSE_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    default:
      return state;
  }
};

export default expenseReducer;