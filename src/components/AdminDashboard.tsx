import React, { useState } from 'react';
import type { Product, Category, Article } from '../utils/adminState';
import { SlidersHorizontal, CheckCircle, FileText } from './icons';

interface AdminDashboardProps {
  products: Product[];
  categories: Category[];
  articles: Article[];
  onUpdateProducts: (products: Product[]) => void;
  onUpdateCategories: (categories: Category[]) => void;
  onUpdateArticles: (articles: Article[]) => void;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  categories,
  articles,
  onUpdateProducts,
  onUpdateCategories,
  onUpdateArticles,
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'articles'>('products');
  const [successMessage, setSuccessMessage] = useState('');

  // Product form states
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [pCode, setPCode] = useState('');
  const [pName, setPName] = useState('');
  const [pCategory, setPCategory] = useState('');
  const [pPrice, setPPrice] = useState('');
  const [pStock, setPStock] = useState<number>(10);
  const [pSpecs, setPSpecs] = useState('');

  // Category form states
  const [newCatName, setNewCatName] = useState('');
  const [newSubName, setNewSubName] = useState('');
  const [targetCatForSub, setTargetCatForSub] = useState('');

  // Article form states
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [showArticleForm, setShowArticleForm] = useState(false);
  const [aTitle, setATitle] = useState('');
  const [aSummary, setASummary] = useState('');
  const [aContent, setAContent] = useState('');

  const triggerFeedback = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // --- Product CRUD ---
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setPCode('');
    setPName('');
    setPCategory(categories[0]?.name || '');
    setPPrice('Liên hệ');
    setPStock(10);
    setPSpecs('Áp suất tối đa: 1.0 MPa\nBảo hành chính hãng 12 tháng');
    setShowProductForm(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setPCode(prod.code);
    setPName(prod.name);
    setPCategory(prod.category);
    setPPrice(prod.price);
    setPStock(prod.stock);
    setPSpecs(prod.specifications.join('\n'));
    setShowProductForm(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pCode.trim() || !pName.trim()) {
      alert('Vui lòng điền mã và tên thiết bị!');
      return;
    }

    const specifications = pSpecs.split('\n').filter(s => s.trim());
    const stockStatus = pStock === 0 ? 'Out of Stock' : pStock < 10 ? 'Low Stock' : 'In Stock';

    if (editingProduct) {
      const updated = products.map(p => 
        p.id === editingProduct.id 
          ? { ...p, code: pCode, name: pName, category: pCategory, price: pPrice, stock: pStock, status: stockStatus as any, specifications } 
          : p
      );
      onUpdateProducts(updated);
      triggerFeedback('Đã cập nhật sản phẩm thành công!');
    } else {
      const newProd: Product = {
        id: 'prod_' + Date.now(),
        code: pCode,
        name: pName,
        category: pCategory,
        price: pPrice,
        stock: pStock,
        status: stockStatus as any,
        image: 'https://aecom.com.vn/wp-content/uploads/2024/07/ma%CC%81y-ta%CC%86ng-a%CC%81p--300x300.png',
        specifications
      };
      onUpdateProducts([...products, newProd]);
      triggerFeedback('Đã thêm sản phẩm mới!');
    }

    setShowProductForm(false);
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('Bạn chắc chắn muốn xóa sản phẩm này chứ?')) {
      onUpdateProducts(products.filter(p => p.id !== id));
      triggerFeedback('Đã xóa sản phẩm.');
    }
  };

  // --- Category CRUD ---
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    if (categories.some(c => c.name.toLowerCase() === newCatName.trim().toLowerCase())) {
      alert('Danh mục này đã tồn tại!');
      return;
    }

    onUpdateCategories([...categories, { name: newCatName.trim(), subcategories: [] }]);
    setNewCatName('');
    triggerFeedback('Đã thêm danh mục chính!');
  };

  const handleAddSubcategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName.trim() || !targetCatForSub) return;

    const updated = categories.map(c => {
      if (c.name === targetCatForSub) {
        if (c.subcategories.includes(newSubName.trim())) {
          alert('Danh mục con này đã tồn tại!');
          return c;
        }
        return { ...c, subcategories: [...c.subcategories, newSubName.trim()] };
      }
      return c;
    });

    onUpdateCategories(updated);
    setNewSubName('');
    triggerFeedback('Đã thêm danh mục con!');
  };

  const handleDeleteCategory = (catName: string) => {
    if (confirm(`Xóa danh mục "${catName}" sẽ xóa các mục con liên kết. Đồng ý?`)) {
      onUpdateCategories(categories.filter(c => c.name !== catName));
      triggerFeedback('Đã xóa danh mục.');
    }
  };

  const handleDeleteSubcategory = (catName: string, subName: string) => {
    const updated = categories.map(c => {
      if (c.name === catName) {
        return { ...c, subcategories: c.subcategories.filter(s => s !== subName) };
      }
      return c;
    });
    onUpdateCategories(updated);
    triggerFeedback('Đã xóa danh mục con.');
  };

  // --- Article CRUD ---
  const handleOpenAddArticle = () => {
    setEditingArticle(null);
    setATitle('');
    setASummary('');
    setAContent('');
    setShowArticleForm(true);
  };

  const handleOpenEditArticle = (art: Article) => {
    setEditingArticle(art);
    setATitle(art.title);
    setASummary(art.summary);
    setAContent(art.content);
    setShowArticleForm(true);
  };

  const handleSaveArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aTitle.trim()) {
      alert('Vui lòng điền tiêu đề tin tức!');
      return;
    }

    const today = new Date().toLocaleDateString('vi-VN');

    if (editingArticle) {
      const updated = articles.map(a => 
        a.id === editingArticle.id 
          ? { ...a, title: aTitle, summary: aSummary, content: aContent } 
          : a
      );
      onUpdateArticles(updated);
      triggerFeedback('Cập nhật tin tức thành công!');
    } else {
      const newArt: Article = {
        id: 'art_' + Date.now(),
        title: aTitle,
        date: today,
        summary: aSummary,
        content: aContent
      };
      onUpdateArticles([...articles, newArt]);
      triggerFeedback('Đã đăng tin tức mới!');
    }
    setShowArticleForm(false);
  };

  const handleDeleteArticle = (id: string) => {
    if (confirm('Xóa bài báo này chứ?')) {
      onUpdateArticles(articles.filter(a => a.id !== id));
      triggerFeedback('Đã xóa bài báo.');
    }
  };

  return (
    <div className="admin-dashboard-container">
      <div className="admin-dashboard-header">
        <div className="brand-logo-admin">
          <SlidersHorizontal size={24} />
          <h2>Bảng Quản Trị Hệ Thống</h2>
        </div>
        <button className="btn btn-outline" onClick={onLogout}>Đăng xuất admin</button>
      </div>

      {successMessage && (
        <div className="submit-success-alert animate-in">
          <CheckCircle size={18} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="admin-tabs">
        <button 
          className={`admin-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => { setActiveTab('products'); setShowProductForm(false); }}
        >
          Sản phẩm ({products.length})
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          Danh mục ({categories.length})
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === 'articles' ? 'active' : ''}`}
          onClick={() => { setActiveTab('articles'); setShowArticleForm(false); }}
        >
          Tin tức ({articles.length})
        </button>
      </div>

      <div className="admin-tab-content">
        {/* --- PRODUCTS TAB --- */}
        {activeTab === 'products' && (
          <div className="dashboard-grid">
            {showProductForm ? (
              <form onSubmit={handleSaveProduct} className="crud-form">
                <h4>{editingProduct ? 'Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}</h4>
                <div className="form-group">
                  <label className="field-label">Mã Thiết Bị *</label>
                  <input type="text" value={pCode} onChange={e => setPCode(e.target.value)} className="form-input" required />
                </div>
                <div className="form-group">
                  <label className="field-label">Tên Thiết Bị *</label>
                  <input type="text" value={pName} onChange={e => setPName(e.target.value)} className="form-input" required />
                </div>
                <div className="form-row-grid">
                  <div className="form-group">
                    <label className="field-label">Danh Mục</label>
                    <select value={pCategory} onChange={e => setPCategory(e.target.value)} className="form-input">
                      {categories.map(c => (
                        <optgroup key={c.name} label={c.name}>
                          <option value={c.name}>{c.name} (Chính)</option>
                          {c.subcategories.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="field-label">Giá (đ)</label>
                    <input type="text" value={pPrice} onChange={e => setPPrice(e.target.value)} className="form-input" />
                  </div>
                </div>
                <div className="form-row-grid">
                  <div className="form-group">
                    <label className="field-label">Số lượng tồn kho</label>
                    <input type="number" value={pStock} onChange={e => setPStock(parseInt(e.target.value) || 0)} className="form-input" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="field-label">Thông số kỹ thuật (Mỗi hàng 1 dòng)</label>
                  <textarea rows={4} value={pSpecs} onChange={e => setPSpecs(e.target.value)} className="form-input" />
                </div>
                <div className="crud-form-actions">
                  <button type="button" className="btn btn-outline" onClick={() => setShowProductForm(false)}>Hủy</button>
                  <button type="submit" className="btn btn-primary">Lưu Lại</button>
                </div>
              </form>
            ) : (
              <div className="crud-list-wrapper">
                <div className="list-top-controls">
                  <h5>Quản Lý Thiết Bị</h5>
                  <button className="btn btn-primary btn-xs-card" onClick={handleOpenAddProduct}>+ Thêm sản phẩm</button>
                </div>
                <div className="crud-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Mã</th>
                        <th>Tên sản phẩm</th>
                        <th>Danh mục</th>
                        <th>Giá</th>
                        <th>Tồn</th>
                        <th>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(p => (
                        <tr key={p.id}>
                          <td className="font-mono">{p.code}</td>
                          <td className="font-bold">{p.name}</td>
                          <td>{p.category}</td>
                          <td className="price-label">{p.price}</td>
                          <td>{p.stock}</td>
                          <td>
                            <div className="action-buttons-cell">
                              <button className="btn-edit" onClick={() => handleOpenEditProduct(p)}>Sửa</button>
                              <button className="btn-delete" onClick={() => handleDeleteProduct(p.id)}>Xóa</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- CATEGORIES TAB --- */}
        {activeTab === 'categories' && (
          <div className="categories-dashboard">
            <div className="category-forms-grid">
              <form onSubmit={handleAddCategory} className="mini-form">
                <h5>Thêm Danh Mục Chính</h5>
                <div className="form-group">
                  <input 
                    type="text" 
                    placeholder="Tên danh mục..." 
                    value={newCatName}
                    onChange={e => setNewCatName(e.target.value)}
                    className="form-input"
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Thêm Mới</button>
              </form>

              <form onSubmit={handleAddSubcategory} className="mini-form">
                <h5>Thêm Danh Mục Con</h5>
                <div className="form-group">
                  <select 
                    value={targetCatForSub}
                    onChange={e => setTargetCatForSub(e.target.value)}
                    className="form-input"
                    required
                  >
                    <option value="">Chọn danh mục cha...</option>
                    {categories.map(c => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <input 
                    type="text" 
                    placeholder="Tên danh mục con..." 
                    value={newSubName}
                    onChange={e => setNewSubName(e.target.value)}
                    className="form-input"
                  />
                </div>
                <button type="submit" className="btn btn-secondary" style={{ width: '100%' }}>Thêm Con</button>
              </form>
            </div>

            <div className="categories-tree-container">
              <h5>Cơ Cấu Danh Mục</h5>
              <div className="categories-tree">
                {categories.map(cat => (
                  <div key={cat.name} className="tree-node">
                    <div className="tree-node-header">
                      <strong>{cat.name}</strong>
                      <button className="tree-delete-btn" onClick={() => handleDeleteCategory(cat.name)}>Xóa</button>
                    </div>
                    {cat.subcategories.length > 0 && (
                      <div className="tree-sub-list">
                        {cat.subcategories.map(sub => (
                          <div key={sub} className="tree-sub-node">
                            <span>{sub}</span>
                            <button className="tree-delete-btn-sub" onClick={() => handleDeleteSubcategory(cat.name, sub)}>Xóa</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- ARTICLES TAB --- */}
        {activeTab === 'articles' && (
          <div className="articles-dashboard">
            {showArticleForm ? (
              <form onSubmit={handleSaveArticle} className="crud-form">
                <h4>{editingArticle ? 'Sửa Tin Tức' : 'Đăng Tin Tức Mới'}</h4>
                <div className="form-group">
                  <label className="field-label">Tiêu đề bài viết *</label>
                  <input type="text" value={aTitle} onChange={e => setATitle(e.target.value)} className="form-input" required />
                </div>
                <div className="form-group">
                  <label className="field-label">Tóm tắt ngắn</label>
                  <textarea rows={2} value={aSummary} onChange={e => setASummary(e.target.value)} className="form-input" />
                </div>
                <div className="form-group">
                  <label className="field-label">Nội dung chi tiết</label>
                  <textarea rows={6} value={aContent} onChange={e => setAContent(e.target.value)} className="form-input" />
                </div>
                <div className="crud-form-actions">
                  <button type="button" className="btn btn-outline" onClick={() => setShowArticleForm(false)}>Hủy</button>
                  <button type="submit" className="btn btn-primary">Lưu Lại</button>
                </div>
              </form>
            ) : (
              <div className="crud-list-wrapper">
                <div className="list-top-controls">
                  <h5>Quản Lý Tin Tức & Sự Kiện</h5>
                  <button className="btn btn-primary btn-xs-card" onClick={handleOpenAddArticle}>+ Viết bài mới</button>
                </div>
                <div className="articles-list-grid">
                  {articles.map(a => (
                    <div key={a.id} className="admin-article-card">
                      <div className="admin-art-meta">
                        <FileText size={16} />
                        <span>{a.date}</span>
                      </div>
                      <h4>{a.title}</h4>
                      <p>{a.summary}</p>
                      <div className="admin-art-actions">
                        <button className="btn-edit" onClick={() => handleOpenEditArticle(a)}>Sửa</button>
                        <button className="btn-delete" onClick={() => handleDeleteArticle(a.id)}>Xóa</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        .admin-dashboard-container {
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-lg);
          padding: var(--space-6);
          box-shadow: var(--shadow-md);
        }

        .admin-dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--border-light);
          padding-bottom: var(--space-4);
          margin-bottom: var(--space-4);
        }

        .brand-logo-admin {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          color: var(--primary-color);
        }

        .admin-tabs {
          display: flex;
          gap: var(--space-2);
          border-bottom: 2px solid var(--border-light);
          margin-bottom: var(--space-5);
        }

        .admin-tab-btn {
          padding: var(--space-2) var(--space-4);
          font-weight: 600;
          font-size: var(--font-size-sm);
          color: var(--text-secondary);
          position: relative;
          top: 2px;
          border-bottom: 2px solid transparent;
        }

        .admin-tab-btn:hover {
          color: var(--primary-color);
        }

        .admin-tab-btn.active {
          color: var(--primary-color);
          border-bottom-color: var(--primary-color);
        }

        /* CRUD Forms */
        .crud-form {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
          background-color: var(--bg-primary);
          padding: var(--space-6);
          border-radius: var(--radius-md);
          border: 1px solid var(--border-light);
        }

        .form-row-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-4);
        }

        @media (min-width: 768px) {
          .form-row-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .crud-form-actions {
          display: flex;
          justify-content: flex-end;
          gap: var(--space-2);
          margin-top: var(--space-2);
        }

        /* Tables & Lists */
        .crud-list-wrapper {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .list-top-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .crud-table-wrapper {
          overflow-x: auto;
          border: 1px solid var(--border-light);
          border-radius: var(--radius-md);
        }

        .admin-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: var(--font-size-xs);
        }

        .admin-table th {
          background-color: var(--bg-tertiary);
          color: var(--text-primary);
          padding: var(--space-3);
          font-weight: 700;
        }

        .admin-table td {
          padding: var(--space-3);
          border-bottom: 1px solid var(--border-light);
          color: var(--text-secondary);
        }

        .action-buttons-cell {
          display: flex;
          gap: var(--space-2);
        }

        .btn-edit {
          color: var(--primary-light);
          font-weight: 600;
        }

        .btn-edit:hover {
          text-decoration: underline;
        }

        .btn-delete {
          color: var(--color-error);
          font-weight: 600;
        }

        .btn-delete:hover {
          text-decoration: underline;
        }

        /* Categories Section */
        .categories-dashboard {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-6);
        }

        @media (min-width: 992px) {
          .categories-dashboard {
            grid-template-columns: 350px 1fr;
          }
        }

        .category-forms-grid {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .mini-form {
          background-color: var(--bg-primary);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-md);
          padding: var(--space-4);
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .categories-tree-container {
          background-color: var(--bg-primary);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-md);
          padding: var(--space-4);
        }

        .categories-tree {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          margin-top: var(--space-3);
        }

        .tree-node {
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-sm);
          background-color: var(--bg-secondary);
        }

        .tree-node-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-2) var(--space-3);
          background-color: var(--bg-tertiary);
          font-size: var(--font-size-sm);
        }

        .tree-delete-btn {
          color: var(--color-error);
          font-size: var(--font-size-xs);
          font-weight: 600;
        }

        .tree-sub-list {
          padding: var(--space-2) var(--space-4);
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }

        .tree-sub-node {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: var(--font-size-xs);
          padding: var(--space-1) 0;
          border-bottom: 1px dashed var(--border-light);
        }

        .tree-sub-node:last-child {
          border-bottom: none;
        }

        .tree-delete-btn-sub {
          color: var(--text-muted);
          font-size: 11px;
        }

        .tree-delete-btn-sub:hover {
          color: var(--color-error);
        }

        /* Articles list grid */
        .articles-list-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-4);
        }

        @media (min-width: 768px) {
          .articles-list-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .admin-article-card {
          border: 1px solid var(--border-light);
          border-radius: var(--radius-md);
          padding: var(--space-4);
          background-color: var(--bg-primary);
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .admin-art-meta {
          display: flex;
          align-items: center;
          gap: var(--space-1);
          font-size: 11px;
          color: var(--text-muted);
        }

        .admin-article-card h4 {
          font-size: var(--font-size-sm);
          color: var(--primary-color);
        }

        .admin-article-card p {
          font-size: var(--font-size-xs);
          color: var(--text-secondary);
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .admin-art-actions {
          margin-top: auto;
          display: flex;
          gap: var(--space-3);
          padding-top: var(--space-2);
          border-top: 1px solid rgba(0, 0, 0, 0.05);
        }
      `}</style>
    </div>
  );
};
