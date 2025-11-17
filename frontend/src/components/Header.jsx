/**
 * Header 컴포넌트
 * 웹프레임워크백엔드 2조
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/Header.css';

const Header = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: '대시보드' },
    { path: '/customers', label: '고객 조회' },
    { path: '/analytics', label: '상세 분석' },
  ];

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-logo">
          <h1>스크린 골프 대시보드</h1>
          <p className="header-subtitle">웹프레임워크백엔드 2조</p>
        </div>

        <nav className="header-nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;
