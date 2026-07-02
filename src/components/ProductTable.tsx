import React, { useState, useMemo } from 'react';
import { 
  Inbox, 
  AlertTriangle, 
  Lock, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  SlidersHorizontal
} from './icons';
import type { Product as ProductItem } from '../utils/adminState';

interface ProductTableProps {
  products: ProductItem[];
  selectedCategory: string | null;
  onSelectProduct: (product: ProductItem) => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({ 
  products, 
  selectedCategory, 
  onSelectProduct 
}) => {
  const [tableState, setTableState] = useState<'normal' | 'loading' | 'error' | 'no-permission' | 'empty'>('normal');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof ProductItem | null>(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15; // 3 rows * 5 columns

  // Search & Filter
  const filteredProducts = useMemo(() => {
    if (tableState !== 'normal') return [];
    let items = products;
    if (selectedCategory) {
      items = items.filter(p => p.category.toLowerCase() === selectedCategory.toLowerCase());
    }
    return items.filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, tableState, products, selectedCategory]);

  // Sort
  const sortedProducts = useMemo(() => {
    const data = [...filteredProducts];
    if (!sortField) return data;
    return data.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      if (typeof aVal === 'string') {
        return sortAsc 
          ? aVal.localeCompare(bVal as string) 
          : (bVal as string).localeCompare(aVal);
      } else {
        return sortAsc 
          ? (aVal as number) - (bVal as number) 
          : (bVal as number) - (aVal as number);
      }
    });
  }, [filteredProducts, sortField, sortAsc]);

  // Pagination
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage) || 1;
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedProducts, currentPage]);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (!value) {
      setSortField(null);
    } else {
      setSortField(value as keyof ProductItem);
      setSortAsc(true);
    }
    setCurrentPage(1);
  };

  return (
    <div className="product-table-section">
      <div className="table-controls">
        <h3 className="section-title">
          {selectedCategory ? `Danh Mục: ${selectedCategory}` : 'Danh Sách Thiết Bị Cung Cấp'}
        </h3>
        
        {/* State selectors for testing */}
        <div className="state-selectors">
          <button className={`btn-state ${tableState === 'normal' ? 'active' : ''}`} onClick={() => setTableState('normal')}>Dữ liệu thật</button>
          <button className={`btn-state ${tableState === 'loading' ? 'active' : ''}`} onClick={() => setTableState('loading')}>Đang tải</button>
          <button className={`btn-state ${tableState === 'error' ? 'active' : ''}`} onClick={() => setTableState('error')}>Lỗi</button>
          <button className={`btn-state ${tableState === 'no-permission' ? 'active' : ''}`} onClick={() => setTableState('no-permission')}>Quyền hạn</button>
          <button className={`btn-state ${tableState === 'empty' ? 'active' : ''}`} onClick={() => setTableState('empty')}>Trống</button>
        </div>
      </div>

      <div className="filter-sort-bar">
        <div className="search-bar-container">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Tìm kiếm mã thiết bị hoặc tên sản phẩm..." 
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="search-input"
            disabled={tableState !== 'normal'}
          />
        </div>

        <div className="sort-container">
          <SlidersHorizontal size={16} className="sort-icon" />
          <select onChange={handleSortChange} className="sort-select" disabled={tableState !== 'normal'}>
            <option value="">Sắp xếp mặc định</option>
            <option value="code">Mã thiết bị</option>
            <option value="name">Tên sản phẩm</option>
            <option value="price">Giá tiền</option>
            <option value="stock">Số lượng tồn</option>
          </select>
        </div>
      </div>

      {/* RENDER SUCCESS STATE */}
      {tableState === 'normal' && paginatedProducts.length > 0 && (
        <div className="products-grid-catalog">
          {paginatedProducts.map(product => (
            <div 
              key={product.id} 
              className="product-card"
              onClick={() => onSelectProduct(product)}
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
      )}

      {/* RENDER SKELETON / LOADING STATE */}
      {tableState === 'loading' && (
        <div className="products-grid-catalog">
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={`skeleton-${i}`} className="product-card">
              <div className="product-card-img-container">
                <div className="skeleton skeleton-img-box" />
              </div>
              <div className="product-card-info" style={{ gap: '10px' }}>
                <div className="skeleton" style={{ width: '60px', height: '12px' }} />
                <div className="skeleton" style={{ width: '80%', height: '16px' }} />
                <div className="skeleton" style={{ width: '90%', height: '16px' }} />
                <div className="product-card-bottom">
                  <div className="skeleton" style={{ width: '80px', height: '16px' }} />
                  <div className="skeleton" style={{ width: '60px', height: '24px' }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* RENDER EMPTY STATE */}
      {(tableState === 'empty' || (tableState === 'normal' && paginatedProducts.length === 0)) && (
        <div className="table-empty-state empty">
          <Inbox size={48} className="state-icon empty-icon" />
          <h4>Không tìm thấy thiết bị nào</h4>
          <p>Vui lòng thử lại với từ khóa tìm kiếm khác hoặc danh mục khác.</p>
        </div>
      )}

      {/* RENDER ERROR STATE */}
      {tableState === 'error' && (
        <div className="table-empty-state error">
          <AlertTriangle size={48} className="state-icon error-icon" />
          <h4>Lỗi kết nối máy chủ</h4>
          <p>Không thể tải dữ liệu danh mục sản phẩm từ máy chủ. Vui lòng kiểm tra lại đường truyền.</p>
          <button className="btn btn-secondary" onClick={() => setTableState('normal')}>Thử lại</button>
        </div>
      )}

      {/* RENDER NO PERMISSION STATE */}
      {tableState === 'no-permission' && (
        <div className="table-empty-state lock">
          <Lock size={48} className="state-icon lock-icon" />
          <h4>Không có quyền truy cập</h4>
          <p>Tài khoản của bạn không có đủ thẩm quyền để xem thông tin tồn kho hoặc bảng giá chi tiết.</p>
        </div>
      )}

      {tableState === 'normal' && (
        <div className="table-pagination">
          <span className="pagination-info">
            Trang <strong>{currentPage}</strong> trên <strong>{totalPages}</strong> ({filteredProducts.length} sản phẩm)
          </span>
          <div className="pagination-buttons">
            <button 
              className="btn btn-outline btn-pagination" 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={16} /> Trước
            </button>
            <button 
              className="btn btn-outline btn-pagination" 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Sau <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      <style>{`
        .product-table-section {
          background-color: var(--bg-secondary);
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-light);
          padding: var(--space-6);
          box-shadow: var(--shadow-sm);
        }

        .table-controls {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          margin-bottom: var(--space-5);
        }

        @media (min-width: 768px) {
          .table-controls {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
          }
        }

        .section-title {
          color: var(--primary-color);
          font-size: var(--font-size-md);
        }

        .state-selectors {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-1);
        }

        .btn-state {
          padding: 6px 12px;
          font-size: var(--font-size-xs);
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-medium);
          background-color: var(--bg-primary);
          color: var(--text-secondary);
          font-weight: 500;
          transition: all var(--transition-fast);
        }

        .btn-state:hover {
          border-color: var(--primary-color);
          color: var(--primary-color);
        }

        .btn-state.active {
          background-color: var(--primary-color);
          color: var(--text-white);
          border-color: var(--primary-color);
        }

        /* Filter Sort Bar */
        .filter-sort-bar {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-3);
          margin-bottom: var(--space-6);
        }

        @media (min-width: 768px) {
          .filter-sort-bar {
            grid-template-columns: 1fr 200px;
          }
        }

        .search-bar-container {
          position: relative;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }

        .search-input {
          width: 100%;
          padding: 10px 12px 10px 38px;
          font-size: var(--font-size-sm);
          border-radius: var(--radius-md);
          border: 1px solid var(--border-medium);
          outline: none;
          transition: all var(--transition-fast);
        }

        .search-input:focus {
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(10, 59, 124, 0.15);
        }

        .sort-container {
          position: relative;
          display: flex;
          align-items: center;
        }

        .sort-icon {
          position: absolute;
          left: 12px;
          color: var(--text-muted);
          pointer-events: none;
        }

        .sort-select {
          width: 100%;
          padding: 10px 12px 10px 36px;
          font-size: var(--font-size-sm);
          border-radius: var(--radius-md);
          border: 1px solid var(--border-medium);
          background-color: var(--bg-secondary);
          color: var(--text-secondary);
          outline: none;
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23718096' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 8px center;
          background-size: 16px;
        }

        /* Products Grid Catalog */
        .products-grid-catalog {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-3);
          margin-bottom: var(--space-6);
        }

        @media (min-width: 576px) {
          .products-grid-catalog {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (min-width: 768px) {
          .products-grid-catalog {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (min-width: 1200px) {
          .products-grid-catalog {
            grid-template-columns: repeat(5, 1fr);
          }
        }

        /* Specific card sizing override for catalog */
        .products-grid-catalog .product-card {
          border-radius: var(--radius-md);
        }

        .products-grid-catalog .product-card-img-container {
          height: 130px;
          padding: var(--space-2);
        }

        .products-grid-catalog .product-card-fallback-badge {
          top: var(--space-2);
          left: var(--space-2);
          font-size: 9px;
          padding: 2px 4px;
        }

        .products-grid-catalog .product-card-info {
          padding: var(--space-3);
          gap: var(--space-1);
        }

        .products-grid-catalog .product-card-name {
          font-size: var(--font-size-xs);
          height: 36px;
          -webkit-line-clamp: 2;
        }

        .products-grid-catalog .product-card-bottom {
          padding-top: var(--space-2);
        }

        .products-grid-catalog .product-card-price {
          font-size: var(--font-size-xs);
        }

        .products-grid-catalog .btn-xs-card {
          padding: 4px 8px;
          font-size: 10px;
        }

        /* Skeletons */
        .skeleton {
          background: linear-gradient(90deg, var(--bg-tertiary) 25%, var(--border-light) 50%, var(--bg-tertiary) 75%);
          background-size: 200% 100%;
          animation: loading-skeleton 1.5s infinite;
          border-radius: var(--radius-sm);
        }

        .skeleton-img-box {
          width: 100%;
          height: 100%;
        }

        @keyframes loading-skeleton {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* Empty / Error States */
        .table-empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: var(--space-10) var(--space-6);
          text-align: center;
          background-color: var(--bg-secondary);
          border: 1px dashed var(--border-medium);
          border-radius: var(--radius-md);
          margin-bottom: var(--space-6);
        }

        .state-icon {
          margin-bottom: var(--space-3);
        }

        .empty-icon { color: var(--text-muted); }
        .error-icon { color: var(--color-error); }
        .lock-icon { color: var(--color-warning); }

        .table-empty-state h4 {
          font-size: var(--font-size-base);
          font-weight: 600;
          margin-bottom: var(--space-1);
          color: var(--text-primary);
        }

        .table-empty-state p {
          font-size: var(--font-size-sm);
          color: var(--text-muted);
          max-width: 400px;
          margin-bottom: var(--space-4);
        }

        /* Pagination style */
        .table-pagination {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          align-items: center;
          margin-top: var(--space-4);
          font-size: var(--font-size-sm);
          color: var(--text-secondary);
        }

        @media (min-width: 768px) {
          .table-pagination {
            flex-direction: row;
            justify-content: space-between;
          }
        }

        .pagination-buttons {
          display: flex;
          gap: var(--space-2);
        }

        .btn-pagination {
          padding: 6px 12px;
          font-size: var(--font-size-xs);
        }
      `}</style>
    </div>
  );
};
