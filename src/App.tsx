import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { API_BASE_URL } from './config';
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
  loadArticles, saveArticles,
  formatPrice,
  formatArticleContent
} from './utils/adminState';
import type { Product, Category, Article } from './utils/adminState';
import { Info, MapPin, Mail, Phone } from './components/icons';
import './App.css';

const isLocalBackendImage = (url: string | undefined | null) => {
  if (!url) return false;
  return url.startsWith(API_BASE_URL) || url.includes('localhost:3000') || url.startsWith('/api/v1') || url.startsWith('/uploads') || url.startsWith('uploads');
};

const getFullImageUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('/images/') || url.startsWith('images/')) {
    return url;
  }
  let targetUrl = url;
  const uploadPath = (() => {
    try {
      return new URL(targetUrl).pathname.match(/^\/(?:api\/v1\/)?uploads\/.+/)?.[0];
    } catch {
      return targetUrl.match(/^\/?(?:api\/v1\/)?uploads\/.+/)?.[0];
    }
  })();
  if (uploadPath) {
    return `${API_BASE_URL}/${uploadPath.replace(/^\/?(?:api\/v1\/)?/, 'api/v1/')}`;
  }
  if (targetUrl.startsWith('http://') || targetUrl.startsWith('https://') || targetUrl.startsWith('data:')) {
    return targetUrl;
  }
  return `${API_BASE_URL}${targetUrl.startsWith('/') ? '' : '/'}${targetUrl}`;
};

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  // Load and manage localStorage states
  const [products, setProducts] = useState<Product[]>(() => loadProducts());
  const [categories, setCategories] = useState<Category[]>(() => loadCategories());
  const [articles, setArticles] = useState<Article[]>(() => loadArticles());
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);

  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => !!localStorage.getItem('accessToken'));

  const [newsPage, setNewsPage] = useState(1);
  const [newsTotalPages, setNewsTotalPages] = useState(1);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [order, setOrder] = useState('DESC');

  // Force page to scroll to top on mount (reload/F5)
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  }, []);

  // Scroll to top when activeTab changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  // Fetch products from Backend API dynamically
  useEffect(() => {
    // Find category ID from category name
    let catId = '';
    if (selectedCategory) {
      const match = categories.find(c => c.name === selectedCategory);
      if (match) {
        catId = match.id;
      } else {
        for (const parent of categories) {
          const childMatch = (parent.children || []).find(s => s.name === selectedCategory);
          if (childMatch) {
            catId = childMatch.id;
            break;
          }
        }
      }
    }

    const params = new URLSearchParams({
      page: String(currentPage),
      take: '15',
      order: order,
      sort_by: sortBy,
      keyword: searchKeyword,
      ...(catId ? { category_id: catId } : {})
    });

    fetch(`${API_BASE_URL}/api/v1/products?${params.toString()}`)
      .then(res => res.json())
      .then(result => {
        const payload = result.data || result;
        const docs = payload.docs || [];
        const meta = payload.meta || {};

        const mapped = docs.map((p: any) => {
          let catName = 'Khác';
          const matchParent = categories.find(c => c.id === p.category_id);
          if (matchParent) {
            catName = matchParent.name;
          } else {
            for (const parent of categories) {
              const childMatch = (parent.children || []).find(s => s.id === p.category_id);
              if (childMatch) {
                catName = childMatch.name;
                break;
              }
            }
          }

          const rawPrice = parseFloat(p.price);
          const finalPriceStr = (isNaN(rawPrice) || rawPrice === 0) ? 'Liên hệ' : String(rawPrice);

          return {
            id: p.id,
            code: p.code,
            name: p.name,
            category: catName,
            price: finalPriceStr,
            stock: p.stock,
            status: p.stock === 0 ? 'Out of Stock' : p.stock < 10 ? 'Low Stock' : 'In Stock',
            image: getFullImageUrl(p.image_url || 'https://aecom.com.vn/wp-content/uploads/2024/07/ma%CC%81y-ta%CC%86ng-a%CC%81p--300x300.png'),
            specifications: Object.entries(p.specifications || {}).map(([k, v]) => `${k}: ${v}`),
            created_at: p.created_at || p.createdAt || '',
            is_featured: p.is_featured || p.isFeatured || false,
            description: p.description || ''
          };
        });

        setProducts(mapped);
        setTotalPages(meta.totalPage || 1);
        setTotalProducts(meta.total || docs.length);
      })
      .catch(err => {
        console.error('Error fetching products:', err);
      });
  }, [selectedCategory, searchKeyword, currentPage, categories, sortBy, order]);

  // Fetch categories from Backend API on mount
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/v1/categories`)
      .then(res => res.json())
      .then(result => {
        const list = result.data || result;
        if (list.length > 0) {
          const formatted = list.map((cat: any) => ({
            ...cat,
            children: cat.children || []
          }));
          setCategories(formatted);
          saveCategories(formatted);
        }
      })
      .catch(err => {
        console.error('Failed to fetch categories:', err);
      });
  }, []);

  // Fetch articles from Backend API
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/v1/articles?page=${newsPage}&take=6`)
      .then(res => res.json())
      .then(result => {
        const payload = result.data || result;
        const docs = payload.docs || result.docs || (Array.isArray(payload) ? payload : []);
        const meta = payload.meta || {};
        const mapped = docs.map((art: any) => ({
          id: art.id,
          title: art.title,
          date: art.published_at
            ? new Date(art.published_at).toLocaleDateString('vi-VN')
            : new Date(art.created_at || Date.now()).toLocaleDateString('vi-VN'),
          summary: art.summary,
          content: art.content,
          image: getFullImageUrl(art.thumbnail_url || art.image || ''),
          rawImage: art.thumbnail_url || art.image || ''
        }));
        setArticles(mapped);
        setNewsTotalPages(meta.totalPage || 1);
        saveArticles(mapped);
      })
      .catch(err => {
        console.error('Failed to fetch articles:', err);
      });
  }, [newsPage]);

  // Fetch featured products from Backend API
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/v1/products?page=1&take=10&is_featured=true`)
      .then(res => res.json())
      .then(result => {
        const payload = result.data || result;
        const docs = payload.docs || result.docs || (Array.isArray(payload) ? payload : []);
        const mapped = docs
          .filter((p: any) => p.is_featured || p.isFeatured)
          .map((p: any) => {
            const catName = p.category?.name || p.categoryName || 'Thiết bị';
            const rawPrice = parseFloat(p.price);
            const finalPriceStr = (isNaN(rawPrice) || rawPrice === 0) ? 'Liên hệ' : String(rawPrice);
            return {
              id: p.id,
              code: p.code,
              name: p.name,
              category: catName,
              price: finalPriceStr,
              stock: p.stock,
              status: p.stock === 0 ? 'Out of Stock' : p.stock < 10 ? 'Low Stock' : 'In Stock',
              image: getFullImageUrl(p.image_url || 'https://aecom.com.vn/wp-content/uploads/2024/07/ma%CC%81y-ta%CC%86ng-a%CC%81p--300x300.png'),
              specifications: Object.entries(p.specifications || {}).map(([k, v]) => `${k}: ${v}`),
              created_at: p.created_at || p.createdAt || '',
              is_featured: p.is_featured || p.isFeatured || false,
              description: p.description || ''
            };
          });
        setFeaturedProducts(mapped);
      })
      .catch(err => {
        console.error('Failed to fetch featured products:', err);
      });
  }, [products]);

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
    setCurrentPage(1);
    setActiveTab('products');
  };

  const handleSearch = (query: string) => {
    console.log('Searching for:', query);
    setSearchKeyword(query);
    setCurrentPage(1);
    setActiveTab('products');
  };

  const openQuoteRequest = () => {
    setSelectedProduct(null); // Close modal first
    setActiveTab('contact');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      const nameInput = document.getElementById('fullName');
      if (nameInput) nameInput.focus();
    }, 200);
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
          if (tab === 'home') {
            setSelectedCategory(null);
            setIsAdminMode(false);
          }
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
                localStorage.removeItem('accessToken');
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
        <div className="main-content-layout" style={(activeTab === 'home' || activeTab === 'products') ? {} : { gridTemplateColumns: '1fr' }}>
          {/* Sidebar Left Column */}
          {(activeTab === 'home' || activeTab === 'products') && (
            <Sidebar
              onSelectCategory={handleSelectCategory}
              selectedCategory={selectedCategory}
              categories={categories}
            />
          )}

          {/* Right Column content */}
          <main className="right-content-area">
            {activeTab === 'home' && (
              <>
                {/* Image banner slider */}
                <Slider
                  onContactClick={() => setActiveTab('contact')}
                  onProductsClick={() => setActiveTab('products')}
                />

                {/* Featured products grid */}
                {featuredProducts.length > 0 && (
                  <section className="featured-section">
                    <div className="section-header">
                      <h2 className="title-with-line">Sản Phẩm Nổi Bật</h2>
                    </div>
                    <div className="products-grid">
                      {featuredProducts.map(product => (
                        <div
                          key={product.id}
                          className="product-card"
                          onClick={() => setSelectedProduct(product)}
                        >
                          <div className="product-card-img-container">
                            <img
                              src={product.image}
                              alt={product.name}
                              crossOrigin={isLocalBackendImage(product.image) ? "anonymous" : undefined}
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
                              <span className="product-card-price">{formatPrice(product.price)}</span>
                              <button className="btn btn-outline btn-xs-card">
                                Chi tiết
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Quick Contact Banner Section */}
                <section className="quick-contact-banner">
                  <div className="quick-contact-text">
                    <h3>
                      Bạn Cần Tìm Thiết Bị Khác Hoặc Yêu Cầu Báo Giá Nhanh?
                    </h3>
                    <p>
                      Đội ngũ kỹ sư của MINAMI luôn sẵn sàng tư vấn cấu hình sản phẩm phù hợp nhất với nhu cầu của bạn.
                    </p>
                  </div>
                  <div className="quick-contact-actions">
                    <a href="tel:" className="btn btn-secondary quick-contact-btn">
                      <Phone size={16} /> Gọi
                    </a>
                    <button
                      className="btn quick-contact-btn btn-outline-white"
                      onClick={() => {
                        setActiveTab('contact');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
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
              <section className="featured-section">
                <div className="section-header">
                  <h2 className="title-with-line">Bản Tin Tự Động Hóa MINAMI</h2>
                </div>
                <div className="newspaper-grid">
                  {articles.map((art) => {
                    return (
                      <div
                        key={art.id}
                        className="newspaper-card"
                        onClick={() => {
                          setSelectedArticle(art);
                          setActiveTab('news-detail');
                        }}
                        style={{ cursor: 'pointer' }}
                      >
                        {art.image && (
                          <div className="newspaper-card-img-container">
                            <img
                              src={art.image}
                              alt={art.title}
                              crossOrigin={isLocalBackendImage(art.image) ? "anonymous" : undefined}
                              className="newspaper-card-img"
                            />
                          </div>
                        )}
                        <div className="newspaper-card-content">
                          <div className="newspaper-card-meta">
                            <span className="newspaper-card-badge">TIN TỨC</span>
                            <span className="newspaper-card-date">{art.date}</span>
                          </div>
                          <h3 className="newspaper-card-title">{art.title}</h3>
                          <p className="newspaper-card-summary">{art.summary}</p>
                          <span className="newspaper-card-link">Đọc chi tiết &rarr;</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {newsTotalPages > 1 && (
                  <div className="table-pagination" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '30px' }}>
                    <button
                      className="pagination-btn"
                      onClick={() => {
                        setNewsPage(prev => Math.max(prev - 1, 1));
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      disabled={newsPage === 1}
                      style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-medium)', background: '#fff', cursor: newsPage === 1 ? 'not-allowed' : 'pointer', opacity: newsPage === 1 ? 0.5 : 1 }}
                    >
                      &larr; Trước
                    </button>
                    {Array.from({ length: newsTotalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        className={`pagination-btn ${page === newsPage ? 'active' : ''}`}
                        onClick={() => {
                          setNewsPage(page);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        style={{
                          padding: '8px 14px',
                          borderRadius: '6px',
                          border: '1px solid',
                          borderColor: page === newsPage ? 'var(--primary-color)' : 'var(--border-medium)',
                          background: page === newsPage ? 'var(--primary-color)' : '#fff',
                          color: page === newsPage ? '#fff' : 'var(--text-primary)',
                          fontWeight: page === newsPage ? 600 : 400,
                          cursor: 'pointer'
                        }}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      className="pagination-btn"
                      onClick={() => {
                        setNewsPage(prev => Math.min(prev + 1, newsTotalPages));
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      disabled={newsPage === newsTotalPages}
                      style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-medium)', background: '#fff', cursor: newsPage === newsTotalPages ? 'not-allowed' : 'pointer', opacity: newsPage === newsTotalPages ? 0.5 : 1 }}
                    >
                      Sau &rarr;
                    </button>
                  </div>
                )}
              </section>
            )}

            {activeTab === 'news-detail' && selectedArticle && (
              <section className="content-card">
                <button
                  className="btn btn-outline"
                  onClick={() => {
                    setActiveTab('news');
                    setSelectedArticle(null);
                  }}
                  style={{ marginBottom: '20px', padding: '6px 12px', fontSize: '13px' }}
                >
                  &larr; Quay lại danh sách tin tức
                </button>
                <article className="news-detail-page">
                  <h1 style={{ fontSize: '28px', color: 'var(--primary-color)', marginBottom: '10px', lineHeight: '1.3' }}>
                    {selectedArticle.title}
                  </h1>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
                    <span>Ngày đăng: {selectedArticle.date}</span>
                  </div>

                  {selectedArticle.image && (
                    <div style={{ width: '100%', maxHeight: '500px', overflow: 'hidden', borderRadius: '12px', margin: '24px 0', border: '1px solid var(--border-light)' }}>
                      <img
                        src={selectedArticle.image}
                        alt={selectedArticle.title}
                        crossOrigin={isLocalBackendImage(selectedArticle.image) ? "anonymous" : undefined}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  )}
                  <div
                    style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: '1.8' }}
                    dangerouslySetInnerHTML={{ __html: formatArticleContent(selectedArticle.content) }}
                  />
                </article>
              </section>
            )}



            {/* Interactive Specifications Table Section */}
            {(activeTab === 'home' || activeTab === 'products') && (
              <div id="products-table">
                <ProductTable
                  products={products}
                  selectedCategory={selectedCategory}
                  onSelectProduct={setSelectedProduct}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalProducts={totalProducts}
                  onPageChange={(page) => {
                    setCurrentPage(page);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  onSearchChange={setSearchKeyword}
                  sortBy={sortBy}
                  order={order}
                  onSortChange={(newSortBy, newOrder) => {
                    setSortBy(newSortBy);
                    setOrder(newOrder);
                    setCurrentPage(1);
                  }}
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
              src="/images/2.png"
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
              <li><MapPin size={16} /> Số nhà 25, ngách 159/1, đường Hữu Hưng, phường Tây Mỗ, thành phố Hà Nội</li>
              <li><Phone size={16} /></li>
              <li><Mail size={16} /> Minamiautomation@gmail.com</li>
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
          <p>&copy; 2026 MINAMI VIETNAM.</p>
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
                <img src={selectedProduct.image} alt={selectedProduct.name} crossOrigin={isLocalBackendImage(selectedProduct.image) ? "anonymous" : undefined} />
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

            {selectedProduct.description && (
              <div className="modal-prod-desc" style={{ marginTop: '20px', borderTop: '1px solid var(--border-light)', paddingTop: '15px' }}>
                <h5 style={{ fontWeight: 600, color: 'var(--primary-color)', marginBottom: '8px' }}>Mô tả chi tiết sản phẩm:</h5>
                <div
                  className="prod-description-content"
                  style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}
                  dangerouslySetInnerHTML={{ __html: formatArticleContent(selectedProduct.description) }}
                />
              </div>
            )}

            <div className="modal-prod-footer">
              <button className="btn btn-outline" onClick={() => setSelectedProduct(null)}>Đóng</button>
              <button className="btn btn-primary" onClick={() => openQuoteRequest()}>Yêu Cầu Báo Giá</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Product Details Modal (animated backdrop and window) */}

      <style>{`
        /* Newspaper News Section Styling */
        .newspaper-grid {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
          margin-top: var(--space-4);
        }

        .newspaper-card {
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: var(--shadow-sm);
          transition: all var(--transition-normal);
          display: grid;
          grid-template-columns: 280px 1fr;
        }

        .newspaper-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
          border-color: var(--primary-light);
        }

        @media (max-width: 768px) {
          .newspaper-card {
            grid-template-columns: 1fr;
          }
        }

        .newspaper-card-img-container {
          width: 100%;
          height: 180px;
          overflow: hidden;
          background-color: var(--border-light);
        }

        .newspaper-card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform var(--transition-normal);
        }

        .newspaper-card:hover .newspaper-card-img {
          transform: scale(1.03);
        }

        .newspaper-card-content {
          padding: var(--space-5);
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          justify-content: center;
        }

        .newspaper-card-meta {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          font-size: var(--font-size-xs);
        }

        .newspaper-card-badge {
          background-color: rgba(10, 59, 124, 0.08);
          color: var(--primary-color);
          padding: 2px 8px;
          border-radius: var(--radius-sm);
          font-weight: 700;
          letter-spacing: 0.5px;
        }

        .newspaper-card-date {
          color: var(--text-secondary);
        }

        .newspaper-card-title {
          font-size: var(--font-size-md);
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.4;
          margin: 0;
        }

        .newspaper-card-summary {
          font-size: var(--font-size-sm);
          color: var(--text-secondary);
          line-height: 1.6;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .newspaper-card-link {
          font-size: var(--font-size-sm);
          font-weight: 600;
          color: var(--primary-color);
          margin-top: auto;
          display: inline-flex;
          align-items: center;
        }

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
          // padding-bottom: var(--space-1);
        }

        /* Products Grid */
        .products-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--space-2);
        }

        @media (min-width: 768px) {
          .products-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: var(--space-4);
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
          height: 140px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-2);
          border-bottom: 1px solid var(--border-light);
        }

        @media (min-width: 768px) {
          .product-card-img-container {
            height: 220px;
            padding: var(--space-4);
          }
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

        @media (max-width: 480px) {
          .product-card-bottom {
            flex-direction: column;
            align-items: stretch !important;
            gap: var(--space-2);
          }
          .product-card-bottom .btn {
            width: 100%;
            text-align: center;
            justify-content: center;
          }
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

        /* Quick Contact Banner */
        .quick-contact-banner {
          background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%);
          border-radius: var(--radius-lg);
          padding: var(--space-6) var(--space-8);
          color: var(--text-white);
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
          align-items: center;
          justify-content: space-between;
          box-shadow: var(--shadow-md);
          margin-top: var(--space-4);
          text-align: center;
          box-sizing: border-box;
          width: 100%;
        }

        .quick-contact-text h3 {
          font-size: var(--font-size-lg);
          font-weight: 700;
          margin-bottom: 6px;
          color: var(--text-white);
        }

        .quick-contact-text p {
          font-size: var(--font-size-sm);
          opacity: 0.9;
        }

        .quick-contact-actions {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          width: 100%;
          justify-content: center;
        }

        .quick-contact-btn {
          width: 100%;
          text-align: center;
          justify-content: center;
        }

        .btn-outline-white {
          background-color: rgba(255, 255, 255, 0.15);
          color: var(--text-white);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .btn-outline-white:hover {
          background-color: rgba(255, 255, 255, 0.25);
        }

        @media (min-width: 576px) {
          .quick-contact-actions {
            flex-direction: row;
          }
          .quick-contact-btn {
            width: auto;
            min-width: 160px;
          }
        }

        @media (max-width: 576px) {
          .quick-contact-banner {
            padding: var(--space-5) var(--space-4);
          }
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
          height: 50px;
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

        @media (max-width: 575px) {
          .modal-prod-img-box {
            margin: 0 auto;
          }
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

        @media (max-width: 575px) {
          .modal-prod-meta {
            align-items: center;
            text-align: center;
          }
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
