import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Alerts from './components/layout/Alerts';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import GroupDetail from './pages/GroupDetail';
import AddExpense from './pages/AddExpense';
import Balances from './pages/Balances';
import PrivateRoute from './components/routing/PrivateRoute';
import AuthState from './context/auth/AuthState';
import GroupState from './context/group/GroupState';
import ExpenseState from './context/expense/ExpenseState';
import AlertState from './context/alert/AlertState';
import setAuthToken from './utils/setAuthToken';
import './App.css';

if (localStorage.token) {
  setAuthToken(localStorage.token);
}

const App = () => {
  return (
    <AuthState>
      <GroupState>
        <ExpenseState>
          <AlertState>
            <Router>
              <div className="App">
                <Navbar />
                <div className="container">
                  <Alerts />
                  <Switch>
                    <Route exact path="/" component={Home} />
                    <Route exact path="/register" component={Register} />
                    <Route exact path="/login" component={Login} />
                    <PrivateRoute exact path="/dashboard" component={Dashboard} />
                    <PrivateRoute exact path="/groups/:id" component={GroupDetail} />
                    <PrivateRoute exact path="/add-expense/:groupId" component={AddExpense} />
                    <PrivateRoute exact path="/balances" component={Balances} />
                  </Switch>
                </div>
              </div>
            </Router>
          </AlertState>
        </ExpenseState>
      </GroupState>
    </AuthState>
  );
};

export default App;