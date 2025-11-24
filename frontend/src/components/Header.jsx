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
    { path: '/', label: '대시보드', icon: '📊' },
    { path: '/customers', label: '고객 조회', icon: '👥' },
    { path: '/analytics', label: '상세 분석', icon: '📈' },
  ];

  // 현재 페이지 이름 가져오기
  const getCurrentPageName = () => {
    // 정확한 경로 매칭 먼저 시도
    const exactMatch = navItems.find(item => item.path === location.pathname);
    if (exactMatch) return exactMatch.label;

    // 부분 경로 매칭 (예: /customers/123 -> 고객 조회)
    const partialMatch = navItems.find(item =>
      item.path !== '/' && location.pathname.startsWith(item.path)
    );
    if (partialMatch) {
      // 고객 상세 페이지인 경우
      if (location.pathname.startsWith('/customers/')) {
        return '고객 상세 정보';
      }
      return partialMatch.label;
    }

    return '';
  };

  // Breadcrumb 경로 생성
  const getBreadcrumbPath = () => {
    if (location.pathname === '/') return null;

    // 고객 상세 페이지인 경우
    if (location.pathname.startsWith('/customers/')) {
      return { parent: { path: '/customers', label: '고객 조회' }, current: '고객 상세 정보' };
    }

    return null;
  };

  const breadcrumbPath = getBreadcrumbPath();

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-logo">
          <h1>매출 관리 프로그램</h1>
          <span className="header-subtitle">대시보드형 매출관리</span>
        </div>

        <nav className="header-nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Breadcrumb */}
      <div className="breadcrumb">
        <Link to="/" className="breadcrumb-home">홈</Link>
        <span className="breadcrumb-separator">/</span>
        {breadcrumbPath ? (
          <>
            <Link to={breadcrumbPath.parent.path} className="breadcrumb-link">
              {breadcrumbPath.parent.label}
            </Link>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">{breadcrumbPath.current}</span>
          </>
        ) : (
          <span className="breadcrumb-current">{getCurrentPageName()}</span>
        )}
      </div>
    </header>
  );
};

export default Header;
