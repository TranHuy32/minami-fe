import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Slider } from './components/Slider';
import { ProductTable } from './components/ProductTable';
import { InquiryForm } from './components/InquiryForm';
import { Modal } from './components/Modal';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';
import { 
  loadProducts, saveProducts, 
  loadCategories, saveCategories, 
  loadArticles, saveArticles
} from './utils/adminState';
import type { Product, Category, Article } from './utils/adminState';
import { Info, MapPin, Mail, Phone } from './components/icons';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Load and manage localStorage states
  const [products, setProducts] = useState<Product[]>(() => {
    const loaded = loadProducts();
    if (loaded.length < 10) {
      localStorage.removeItem('aecom_products');
      return loadProducts();
    }
    return loaded;
  });
  const [categories, setCategories] = useState<Category[]>(() => {
    const loaded = loadCategories();
    if (loaded.length < 5) {
      localStorage.removeItem('aecom_categories');
      return loadCategories();
    }
    return loaded;
  });
  const [articles, setArticles] = useState<Article[]>(loadArticles());

  // Admin Portal state
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  const handleUpdateProducts = (updatedProducts: Product[]) => {
    setProducts(updatedProducts);
    saveProducts(updatedProducts);
  };

  const handleUpdateCategories = (updatedCats: Category[]) => {
    setCategories(updatedCats);
    saveCategories(updatedCats);
  };

  const handleUpdateArticles = (updatedArticles: Article[]) => {
    setArticles(updatedArticles);
    saveArticles(updatedArticles);
  };

  const handleSelectCategory = (cat: string) => {
    setSelectedCategory(cat);
    setActiveTab('products');
    // Scroll to products table
    const tableEl = document.getElementById('products-table');
    if (tableEl) {
      tableEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSearch = (query: string) => {
    console.log('Searching for:', query);
    setActiveTab('products');
    const tableEl = document.getElementById('products-table');
    if (tableEl) {
      tableEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const openQuoteRequest = () => {
    setSelectedProduct(null); // Close modal first
    const contactEl = document.getElementById('contact-form');
    if (contactEl) {
      setTimeout(() => {
        contactEl.scrollIntoView({ behavior: 'smooth' });
        // Focus the name input
        const nameInput = document.getElementById('fullName');
        if (nameInput) nameInput.focus();
      }, 300);
    }
  };

  const handleToggleAdminPortal = () => {
    if (isAdminMode) {
      // Exit admin portal
      setIsAdminMode(false);
    } else {
      // Enter admin login view
      setIsAdminMode(true);
    }
  };

  return (
    <div className="app-container">
      <Navbar 
        onSearch={handleSearch} 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'home') setSelectedCategory(null);
        }}
        isAdminActive={isAdminMode}
        onToggleAdmin={handleToggleAdminPortal}
      />

      {/* RENDER ADMIN PORTAL IF TOGGLED */}
      {isAdminMode ? (
        <div className="main-content-layout" style={{ gridTemplateColumns: '1fr' }}>
          {isAdminAuthenticated ? (
            <AdminDashboard 
              products={products}
              categories={categories}
              articles={articles}
              onUpdateProducts={handleUpdateProducts}
              onUpdateCategories={handleUpdateCategories}
              onUpdateArticles={handleUpdateArticles}
              onLogout={() => {
                setIsAdminAuthenticated(false);
                setIsAdminMode(false);
              }}
            />
          ) : (
            <AdminLogin 
              onLoginSuccess={() => setIsAdminAuthenticated(true)}
              onCancel={() => setIsAdminMode(false)}
            />
          )}
        </div>
      ) : (
        /* STANDARD CLIENT CATALOG LAYOUT */
        <div className="main-content-layout">
          {/* Sidebar Left Column */}
          <Sidebar 
            onSelectCategory={handleSelectCategory}
            selectedCategory={selectedCategory}
            categories={categories}
          />

          {/* Right Column content */}
          <main className="right-content-area">
            {activeTab === 'home' && (
              <>
                {/* Image banner slider */}
                <Slider />

                {/* Featured products grid */}
                <section className="featured-section">
                  <div className="section-header">
                    <h2 className="title-with-line">Sản Phẩm Nổi Bật</h2>
                  </div>
                  <div className="products-grid">
                    {products.slice(0, 6).map(product => (
                      <div 
                        key={product.id} 
                        className="product-card"
                        onClick={() => setSelectedProduct(product)}
                      >
                        <div className="product-card-img-container">
                          <img 
                            src={product.image} 
                            alt={product.name} 
                            className="product-card-img"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                          <div className="product-card-fallback-badge">{product.category}</div>
                        </div>
                        <div className="product-card-info">
                          <span className="product-card-code">{product.code}</span>
                          <h4 className="product-card-name">{product.name}</h4>
                          <div className="product-card-bottom">
                            <span className="product-card-price">{product.price}</span>
                            <button className="btn btn-outline btn-xs-card">
                              Chi tiết
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Quick Contact Banner Section */}
                <section className="quick-contact-banner" style={{
                  background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-6) var(--space-8)',
                  color: 'var(--text-white)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-4)',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: 'var(--shadow-md)',
                  marginTop: 'var(--space-4)'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, marginBottom: '6px' }}>
                      Bạn Cần Tìm Thiết Bị Khác Hoặc Yêu Cầu Báo Giá Nhanh?
                    </h3>
                    <p style={{ fontSize: 'var(--font-size-sm)', opacity: 0.9 }}>
                      Đội ngũ kỹ sư của MINAMI luôn sẵn sàng tư vấn cấu hình sản phẩm phù hợp nhất với nhu cầu của bạn.
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <a href="tel:0968045604" className="btn btn-secondary" style={{ minWidth: '160px' }}>
                      <Phone size={16} /> Gọi 0968 045 604
                    </a>
                    <button 
                      className="btn" 
                      onClick={() => {
                        const contactEl = document.getElementById('contact-form');
                        if (contactEl) contactEl.scrollIntoView({ behavior: 'smooth' });
                      }}
                      style={{ 
                        backgroundColor: 'rgba(255,255,255,0.15)', 
                        color: 'var(--text-white)', 
                        border: '1px solid rgba(255,255,255,0.3)',
                        minWidth: '160px'
                      }}
                    >
                      <Mail size={16} /> Gửi Yêu Cầu Ngay
                    </button>
                  </div>
                </section>
              </>
            )}

            {activeTab === 'intro' && (
              <section className="content-card">
                <h2 className="title-with-line">Giới Thiệu Về MINAMI Việt Nam</h2>
                <div className="card-text">
                  <p><strong>Công ty Cổ phần MINAMI Việt Nam</strong> là nhà phân phối và cung cấp hàng đầu các giải pháp tự động hóa công nghiệp và thiết bị khí nén chính hãng tại Việt Nam.</p>
                  <p>Chúng tôi tự hào là đối tác chiến lược và nhà phân phối ủy quyền của các thương hiệu hàng đầu thế giới như:</p>
                  <ul>
                    <li><strong>SMC (Nhật Bản):</strong> Thiết bị khí nén, xy lanh, van, bộ điều áp...</li>
                    <li><strong>Omron (Nhật Bản):</strong> Cảm biến, bộ điều khiển nhiệt độ, PLC, biến tần...</li>
                    <li><strong>HIKRobot:</strong> Hệ thống camera kiểm tra ngoại quan sản phẩm (Machine Vision)...</li>
                  </ul>
                  <p>Với phương châm <em>"Giải pháp tối ưu - Dịch vụ hoàn hảo"</em>, chúng tôi cam kết đem lại giá trị thiết thực và sự an tâm tuyệt đối cho quý doanh nghiệp.</p>
                </div>
              </section>
            )}

            {activeTab === 'news' && (
              <section className="content-card">
                <h2 className="title-with-line">Tin Tức Tự Động Hóa</h2>
                <div className="news-list">
                  {articles.map(art => (
                    <div key={art.id} className="news-item">
                      <span className="news-date">{art.date}</span>
                      <h4>{art.title}</h4>
                      <p><strong>{art.summary}</strong></p>
                      <p style={{ marginTop: '4px', fontSize: 'var(--font-size-xs)' }}>{art.content}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {activeTab === 'recruitment' && (
              <section className="content-card">
                <h2 className="title-with-line">Cơ Hội Nghề Nghiệp Tại MINAMI</h2>
                <div className="card-text">
                  <p>MINAMI Việt Nam luôn chào đón các ứng viên tài năng, nhiệt huyết tham gia vào đội ngũ của chúng tôi để cùng nhau kiến tạo tương lai tự động hóa.</p>
                  <div className="job-listings">
                    <div className="job-card">
                      <h4>Kỹ Sư Tư Vấn Giải Pháp Khí Nén SMC</h4>
                      <p>Địa điểm: Hà Nội | Mức lương: Thỏa thuận cạnh tranh</p>
                      <button className="btn btn-outline btn-xs-card" onClick={() => setActiveTab('contact')}>Ứng tuyển ngay</button>
                    </div>
                    <div className="job-card">
                      <h4>Nhân Viên Kinh Doanh Thiết Bị Tự Động Hóa</h4>
                      <p>Địa điểm: Hà Nội & TP. HCM | Mức lương: Lương cứng + Hoa hồng</p>
                      <button className="btn btn-outline btn-xs-card" onClick={() => setActiveTab('contact')}>Ứng tuyển ngay</button>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Interactive Specifications Table Section */}
            {(activeTab === 'home' || activeTab === 'products') && (
              <div id="products-table">
                <ProductTable 
                  products={products} 
                  selectedCategory={selectedCategory} 
                  onSelectProduct={setSelectedProduct}
                />
              </div>
            )}

            {/* Interactive Contact / Inquiry Form Section */}
            <div id="contact-form">
              <InquiryForm />
            </div>
          </main>
        </div>
      )}

      {/* Styled Footer */}
      <footer className="site-footer">
        <div className="footer-content">
          <div className="footer-column">
            <img 
              src="/images/logo_horizontal.png" 
              alt="MINAMI Logo" 
              className="footer-logo"
            />
            <p className="footer-about">
              Nhà phân phối thiết bị tự động hóa công nghiệp, khí nén SMC và cảm biến thông minh hàng đầu tại Việt Nam.
            </p>
          </div>

          <div className="footer-column">
            <h4>Thông Tin Liên Hệ</h4>
            <ul className="footer-contacts-list">
              <li><MapPin size={16} /> Tầng 3, tòa nhà MINAMI, Quận Cầu Giấy, Hà Nội</li>
              <li><Phone size={16} /> 024 6253 3810 / 0968 045 604</li>
              <li><Mail size={16} /> sales@minami.com.vn</li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Thương Hiệu Phân Phối</h4>
            <ul className="footer-links-list">
              <li><a href="#products-table">Thiết Bị Khí Nén SMC Nhật Bản</a></li>
              <li><a href="#products-table">Cảm Biến & PLC Omron</a></li>
              <li><a href="#products-table">HIKRobot Machine Vision</a></li>
              <li><a href="#products-table">Camera Cognex</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 MINAMI VIETNAM. Sao chép và phát triển frontend chất lượng cao.</p>
        </div>
      </footer>

      {/* Product Details Modal (animated backdrop and window) */}
      <Modal
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        title={selectedProduct ? `Chi Tiết: ${selectedProduct.name}` : ''}
      >
        {selectedProduct && (
          <div className="modal-product-detail">
            <div className="modal-prod-header">
              <div className="modal-prod-img-box">
                <img src={selectedProduct.image} alt={selectedProduct.name} />
              </div>
              <div className="modal-prod-meta">
                <span className="prod-badge">{selectedProduct.category}</span>
                <h4 className="prod-name-title">{selectedProduct.name}</h4>
                <p className="prod-code-label">Mã sản phẩm: <code>{selectedProduct.code}</code></p>
                <p className="prod-price-label">Giá bán: <span className="price-tag">{selectedProduct.price}</span></p>
              </div>
            </div>

            <div className="modal-prod-specs">
              <h5>Thông số kỹ thuật chính:</h5>
              <ul className="specs-list">
                {selectedProduct.specifications.map((spec, i) => (
                  <li key={i}><Info size={14} /> <span>{spec}</span></li>
                ))}
              </ul>
            </div>

            <div className="modal-prod-footer">
              <button className="btn btn-outline" onClick={() => setSelectedProduct(null)}>Đóng</button>
              <button className="btn btn-primary" onClick={() => openQuoteRequest()}>Yêu Cầu Báo Giá</button>
            </div>
          </div>
        )}
      </Modal>

      <style>{`
        /* Page layout specific rules */
        .featured-section {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .title-with-line {
          font-size: var(--font-size-md);
          font-weight: 700;
          color: var(--primary-color);
          position: relative;
          padding-bottom: var(--space-2);
          border-bottom: 2px solid var(--accent-color);
          display: inline-block;
        }

        .section-header {
          border-bottom: 1px solid var(--border-light);
          padding-bottom: var(--space-1);
        }

        /* Products Grid */
        .products-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-4);
        }

        @media (min-width: 576px) {
          .products-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (min-width: 992px) {
          .products-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .product-card {
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: var(--shadow-sm);
          cursor: pointer;
          transition: transform var(--transition-fast), box-shadow var(--transition-fast), border-color var(--transition-fast);
          display: flex;
          flex-direction: column;
        }

        .product-card:hover {
          transform: translateY(-6px);
          box-shadow: var(--shadow-lg);
          border-color: var(--accent-color);
        }

        .product-card-img-container {
          position: relative;
          background-color: var(--bg-primary);
          height: 220px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-4);
          border-bottom: 1px solid var(--border-light);
        }

        .product-card-img {
          max-height: 100%;
          object-fit: contain;
        }

        .product-card-fallback-badge {
          position: absolute;
          top: var(--space-3);
          left: var(--space-3);
          background-color: rgba(6, 35, 77, 0.9);
          color: var(--text-white);
          font-size: 11px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: var(--radius-sm);
          text-transform: uppercase;
        }

        .product-card-info {
          padding: var(--space-4);
          display: flex;
          flex-direction: column;
          flex: 1;
          gap: var(--space-2);
        }

        .product-card-code {
          font-size: var(--font-size-xs);
          font-family: monospace;
          color: var(--text-muted);
        }

        .product-card-name {
          font-size: var(--font-size-base);
          font-weight: 700;
          color: var(--text-primary);
          line-height: var(--line-height-tight);
          height: 48px;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .product-card-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: auto;
          padding-top: var(--space-3);
          border-top: 1px solid var(--border-light);
        }

        .product-card-price {
          color: var(--accent-color);
          font-weight: 800;
          font-size: var(--font-size-md);
        }

        .btn-xs-card {
          padding: 6px 12px;
          font-size: var(--font-size-xs);
        }

        /* Intro & content cards */
        .content-card {
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-lg);
          padding: var(--space-6);
          box-shadow: var(--shadow-sm);
        }

        .card-text {
          margin-top: var(--space-4);
          font-size: var(--font-size-sm);
          color: var(--text-secondary);
          line-height: var(--line-height-relaxed);
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .card-text ul {
          padding-left: var(--space-5);
          list-style-type: disc;
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }

        /* News styling */
        .news-list {
          margin-top: var(--space-4);
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .news-item {
          padding-bottom: var(--space-3);
          border-bottom: 1px dashed var(--border-medium);
        }

        .news-item:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .news-date {
          font-size: var(--font-size-xs);
          color: var(--text-muted);
        }

        .news-item h4 {
          font-size: var(--font-size-sm);
          color: var(--primary-color);
          margin-top: var(--space-1);
          margin-bottom: var(--space-1);
        }

        .news-item p {
          font-size: var(--font-size-xs);
          color: var(--text-secondary);
        }

        /* Job listings */
        .job-listings {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
          margin-top: var(--space-3);
        }

        .job-card {
          border: 1px solid var(--border-light);
          border-radius: var(--radius-md);
          padding: var(--space-4);
          background-color: var(--bg-primary);
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          align-items: flex-start;
        }

        .job-card h4 {
          color: var(--primary-color);
        }

        /* Footer styling */
        .site-footer {
          background-color: var(--primary-dark);
          color: rgba(255, 255, 255, 0.8);
          padding: var(--space-12) var(--space-4) var(--space-6) var(--space-4);
          border-top: 4px solid var(--accent-color);
          margin-top: var(--space-12);
        }

        .footer-content {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-8);
          padding-bottom: var(--space-8);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        @media (min-width: 768px) {
          .footer-content {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .footer-logo {
          height: 48px;
          margin-bottom: var(--space-3);
        }

        .footer-about {
          font-size: var(--font-size-sm);
          line-height: var(--line-height-normal);
        }

        .footer-column h4 {
          color: var(--text-white);
          font-size: var(--font-size-sm);
          font-weight: 700;
          text-transform: uppercase;
          margin-bottom: var(--space-4);
          letter-spacing: 0.5px;
        }

        .footer-contacts-list,
        .footer-links-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          font-size: var(--font-size-xs);
        }

        .footer-contacts-list li {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }

        .footer-links-list a {
          color: rgba(255, 255, 255, 0.8);
          transition: color var(--transition-fast);
        }

        .footer-links-list a:hover {
          color: var(--accent-light);
        }

        .footer-bottom {
          max-width: 1200px;
          margin: 0 auto;
          padding-top: var(--space-6);
          display: flex;
          justify-content: center;
          font-size: var(--font-size-xs);
          color: rgba(255, 255, 255, 0.5);
        }

        /* Product details modal content styles */
        .modal-product-detail {
          display: flex;
          flex-direction: column;
          gap: var(--space-5);
        }

        .modal-prod-header {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        @media (min-width: 576px) {
          .modal-prod-header {
            flex-direction: row;
          }
        }

        .modal-prod-img-box {
          width: 140px;
          height: 140px;
          background-color: var(--bg-primary);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-2);
          flex-shrink: 0;
        }

        .modal-prod-img-box img {
          max-height: 100%;
          object-fit: contain;
        }

        .modal-prod-meta {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
          align-items: flex-start;
        }

        .prod-badge {
          background-color: rgba(227, 114, 34, 0.1);
          color: var(--accent-color);
          font-size: 10px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: var(--radius-sm);
        }

        .prod-name-title {
          font-size: var(--font-size-base);
          font-weight: 700;
          color: var(--primary-color);
        }

        .prod-code-label {
          font-size: var(--font-size-xs);
        }

        .prod-price-label {
          font-size: var(--font-size-sm);
          font-weight: 600;
        }

        .price-tag {
          color: var(--accent-color);
          font-size: var(--font-size-base);
          font-weight: 700;
        }

        .modal-prod-specs h5 {
          font-size: var(--font-size-sm);
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: var(--space-2);
        }

        .specs-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .specs-list li {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: var(--font-size-xs);
          color: var(--text-secondary);
        }

        .specs-list li svg {
          color: var(--primary-color);
          flex-shrink: 0;
        }

        .modal-prod-footer {
          display: flex;
          justify-content: flex-end;
          gap: var(--space-2);
          border-top: 1px solid var(--border-light);
          padding-top: var(--space-4);
          margin-top: var(--space-2);
        }
      `}</style>
    </div>
  );
}

export default App;
