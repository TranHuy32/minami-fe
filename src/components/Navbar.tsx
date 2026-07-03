import React, { useState } from 'react';
import {
  Search,
  Phone,
  Mail,
  Menu,
  X,
  Globe
} from './icons';

interface NavbarProps {
  onSearch: (query: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAdminActive: boolean;
  onToggleAdmin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onSearch,
  activeTab,
  setActiveTab,
  isAdminActive,
  onToggleAdmin
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const menuItems = [
    { id: 'home', label: 'Trang chủ' },
    { id: 'intro', label: 'Giới thiệu' },
    { id: 'products', label: 'Sản phẩm' },
    { id: 'news', label: 'Tin tức' },
    { id: 'contact', label: 'Liên hệ' },
  ];

  const activeMenuItems = isAdminActive
    ? menuItems.filter(item => item.id !== 'home')
    : menuItems;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchValue);
  };

  const selectTab = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="site-header">
      {/* Top utility contact bar */}
      <div className="top-bar">
        <div className="top-bar-container">
          <div className="top-bar-contacts">
            <a href="tel:02462533810" className="top-bar-link">
              <Phone size={14} /> <span>Liên hệ:</span>
            </a>
            <span className="separator">|</span>
            <a href="tel:" className="top-bar-link">
              <Phone size={14} /> <span>Hotline:</span>
            </a>
            <span className="separator">|</span>
            <a href="mailto:Minamiautomation@gmail.com" className="top-bar-link">
              <Mail size={14} /> <span>Email: Minamiautomation@gmail.com</span>
            </a>
          </div>

          <div className="top-bar-right" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="lang-toggle" style={{ cursor: 'default', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Globe size={14} /> <span>Tiếng Việt</span>
            </div>
            <button
              className="lang-toggle"
              onClick={onToggleAdmin}
              style={{
                backgroundColor: 'rgba(255,255,255,0.15)',
                padding: '2px 8px',
                borderRadius: '4px',
                fontWeight: 600
              }}
            >
              {isAdminActive ? 'Thoát Admin' : 'Cổng Admin'}
            </button>
          </div>
        </div>
      </div>

      {/* Main navigation container */}
      <div className="main-nav-container">
        <div className="main-nav-content">
          <div className="logo-section" onClick={() => selectTab('home')}>
            <img
              src="/images/2.png"
              alt="MINAMI Logo"
              className="logo-img"
            />
          </div>

          {!isAdminActive && (
            <>
              <nav className="desktop-menu">
                <ul className="menu-list">
                  {activeMenuItems.map(item => (
                    <li key={item.id} className="menu-item">
                      <button
                        className={`menu-link ${activeTab === item.id ? 'active' : ''}`}
                        onClick={() => selectTab(item.id)}
                      >
                        {item.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="search-section">
                <form onSubmit={handleSearchSubmit} className="nav-search-form">
                  <input
                    type="text"
                    placeholder="Tìm kiếm..."
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className="nav-search-input"
                  />
                  <button type="submit" className="nav-search-btn" aria-label="Submit search">
                    <Search size={18} />
                  </button>
                </form>
              </div>
            </>
          )}

          {!isAdminActive && (
            <button
              className="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Drawer (satisfying animation guideline) */}
      <div className={`mobile-drawer-overlay ${mobileMenuOpen ? 'open' : ''}`} onClick={() => setMobileMenuOpen(false)}>
        <div className={`mobile-drawer ${mobileMenuOpen ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
          <div className="drawer-header">
            <img
              src="/images/2.png"
              alt="MINAMI Logo"
              className="logo-img-mobile"
            />
            <button className="drawer-close" onClick={() => setMobileMenuOpen(false)}>
              <X size={24} />
            </button>
          </div>

          <div className="drawer-body">
            <form onSubmit={handleSearchSubmit} className="mobile-search-form">
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="mobile-search-input"
              />
              <button type="submit" className="mobile-search-btn">
                <Search size={18} />
              </button>
            </form>

            <ul className="mobile-menu-list">
              {activeMenuItems.map(item => (
                <li key={item.id} className="mobile-menu-item">
                  <button
                    className={`mobile-menu-link ${activeTab === item.id ? 'active' : ''}`}
                    onClick={() => selectTab(item.id)}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>

            <div className="mobile-drawer-contacts">
              <p><Phone size={14} /> </p>
              <p><Mail size={14} /> Minamiautomation@gmail.com</p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .site-header {
          width: 100%;
          background-color: var(--bg-secondary);
          box-shadow: var(--shadow-sm);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        /* Utility contact bar */
        .top-bar {
          background-color: var(--primary-color);
          color: rgba(255, 255, 255, 0.85);
          font-size: var(--font-size-xs);
          padding: 8px 0;
          border-bottom: 1px solid var(--primary-dark);
        }

        .top-bar-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 var(--space-4);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .top-bar-contacts {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          flex-wrap: wrap;
        }

        .top-bar-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: color var(--transition-fast);
        }

        .top-bar-link:hover {
          color: var(--text-white);
        }

        .separator {
          color: rgba(255, 255, 255, 0.3);
        }

        .lang-toggle {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.85);
          font-size: var(--font-size-xs);
          display: flex;
          align-items: center;
          gap: 6px;
          transition: color var(--transition-fast);
        }

        .lang-toggle:hover {
          color: var(--text-white);
        }

        /* Main Nav styles */
        .main-nav-container {
          border-bottom: 1px solid var(--border-light);
        }

        .main-nav-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: var(--space-3) var(--space-4);
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 80px;
        }

        .logo-section {
          cursor: pointer;
          display: flex;
          align-items: center;
          height: 100%;
        }

        .logo-img {
          height: 70px !important;
          width: auto !important;
          max-height: 100% !important;
          object-fit: contain;
        }

        .desktop-menu {
          display: none;
        }

        .menu-list {
          display: flex;
          gap: var(--space-2);
        }

        .menu-link {
          padding: var(--space-2) var(--space-3);
          font-size: var(--font-size-sm);
          font-weight: 600;
          color: var(--text-secondary);
          border-radius: var(--radius-md);
          transition: all var(--transition-fast);
        }

        .menu-link:hover {
          color: var(--primary-color);
          background-color: var(--bg-tertiary);
        }

        .menu-link.active {
          color: var(--primary-color);
          background-color: rgba(10, 59, 124, 0.08);
        }

        .search-section {
          display: none;
        }

        @media (min-width: 1024px) {
          .desktop-menu {
            display: block;
          }
          .search-section {
            display: block;
          }
        }

        .nav-search-form {
          display: flex;
          position: relative;
          width: 200px;
          transition: width var(--transition-normal);
        }

        .nav-search-form:focus-within {
          width: 260px;
        }

        .nav-search-input {
          width: 100%;
          padding: 8px 36px 8px 12px;
          font-size: var(--font-size-xs);
          border-radius: var(--radius-round);
          border: 1px solid var(--border-medium);
          outline: none;
          transition: border-color var(--transition-fast);
        }

        .nav-search-input:focus {
          border-color: var(--primary-color);
        }

        .nav-search-btn {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          transition: color var(--transition-fast);
        }

        .nav-search-btn:hover {
          color: var(--primary-color);
        }

        .mobile-menu-toggle {
          display: block;
          color: var(--text-primary);
          padding: var(--space-1);
        }

        @media (min-width: 1024px) {
          .mobile-menu-toggle {
            display: none;
          }
        }

        /* Mobile drawer drawer overlay */
        .mobile-drawer-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.4);
          z-index: 200;
          opacity: 0;
          pointer-events: none;
          transition: opacity var(--transition-normal);
        }

        .mobile-drawer-overlay.open {
          opacity: 1;
          pointer-events: auto;
        }

        .mobile-drawer {
          position: fixed;
          top: 0;
          bottom: 0;
          right: 0;
          width: 280px;
          background-color: var(--bg-secondary);
          z-index: 201;
          box-shadow: var(--shadow-xl);
          transform: translateX(100%);
          transition: transform var(--transition-normal);
          display: flex;
          flex-direction: column;
        }

        .mobile-drawer.open {
          transform: translateX(0);
        }

        .drawer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-4);
          border-bottom: 1px solid var(--border-light);
        }

        .logo-img-mobile {
          height: 72px;
        }

        .drawer-close {
          color: var(--text-secondary);
        }

        .drawer-body {
          padding: var(--space-4);
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .mobile-search-form {
          position: relative;
          width: 100%;
        }

        .mobile-search-input {
          width: 100%;
          padding: 10px 36px 10px 12px;
          font-size: var(--font-size-sm);
          border-radius: var(--radius-md);
          border: 1px solid var(--border-medium);
          outline: none;
        }

        .mobile-search-btn {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }

        .mobile-menu-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .mobile-menu-link {
          width: 100%;
          text-align: left;
          padding: var(--space-2) var(--space-3);
          font-size: var(--font-size-sm);
          font-weight: 600;
          color: var(--text-secondary);
          border-radius: var(--radius-sm);
        }

        .mobile-menu-link:hover {
          background-color: var(--bg-tertiary);
          color: var(--primary-color);
        }

        .mobile-menu-link.active {
          color: var(--primary-color);
          background-color: rgba(10, 59, 124, 0.08);
        }

        .mobile-drawer-contacts {
          margin-top: var(--space-6);
          border-top: 1px solid var(--border-light);
          padding-top: var(--space-4);
          font-size: var(--font-size-xs);
          color: var(--text-muted);
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }
      `}</style>
    </header>
  );
};
