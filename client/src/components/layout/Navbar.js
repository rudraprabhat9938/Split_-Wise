import React, { useContext, Fragment, useState } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../../context/auth/authContext';
import ThemeToggle from '../ThemeToggle';

const Navbar = () => {
  const authContext = useContext(AuthContext);
  const { isAuthenticated, logout, user } = authContext;
  const [menuOpen, setMenuOpen] = useState(false);

  const onLogout = () => {
    logout();
  };

  const authLinks = (
    <Fragment>
      <li>Hello {user && user.name}</li>
      <li>
        <Link to='/dashboard'>Dashboard</Link>
      </li>
      <li>
        <Link to='/balances'>Balances</Link>
      </li>
      <li>
        <a onClick={onLogout} href='#!'>
          <i className='fas fa-sign-out-alt'></i> <span className='hide-sm'>Logout</span>
        </a>
      </li>
    </Fragment>
  );

  const guestLinks = (
    <Fragment>
      <li>
        <Link to='/register'>Register</Link>
      </li>
      <li>
        <Link to='/login'>Login</Link>
      </li>
    </Fragment>
  );

  return (
    <div className='navbar'>
      <h1 className="navbar-brand">
        <Link to='/' aria-label="Home">
          <i className='fas fa-money-bill-wave' aria-hidden="true"></i> SplitWise
        </Link>
      </h1>
      <div className="navbar-right">
        <ThemeToggle />
        {/* Mobile menu button */}
        <button
          className="mobile-menu-btn"
          aria-label="Toggle navigation"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <i className={menuOpen ? 'fas fa-times' : 'fas fa-bars'}></i>
        </button>
        <ul className={"nav-list " + (menuOpen ? 'open' : '')}>
          {isAuthenticated ? authLinks : guestLinks}
        </ul>
      </div>
    </div>
  );
};

export default Navbar;