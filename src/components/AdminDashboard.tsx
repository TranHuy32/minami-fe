import React, { useState } from 'react';
import type { Product, Category, Article } from '../utils/adminState';
import { API_BASE_URL } from '../config';
import { formatPrice, formatArticleContent } from '../utils/adminState';
import { CheckCircle, FileText, AlertTriangle, Search, Info, Star } from './icons';
import { Modal } from './Modal';

const isLocalBackendImage = (url: string | undefined | null) => {
  if (!url) return false;
  return url.startsWith(API_BASE_URL) || url.includes('localhost:3000') || url.startsWith('/api/v1') || url.startsWith('/uploads') || url.startsWith('uploads');
};

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
  products: _products,
  categories,
  articles: _articles,
  onUpdateProducts: _onUpdateProducts,
  onUpdateCategories,
  onUpdateArticles: _onUpdateArticles,
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'articles'>('products');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Product form states
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [pCode, setPCode] = useState('');
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [pName, setPName] = useState('');
  const [pCategory, setPCategory] = useState('');
  const [pPrice, setPPrice] = useState<number>(0);
  const [pStock, setPStock] = useState<number>(10);
  const [pSpecs, setPSpecs] = useState('');
  const [pDescription, setPDescription] = useState('');
  const [pImage, setPImage] = useState('');

  // Admin Products server-side paging & search states
  const [adminProducts, setAdminProducts] = useState<Product[]>([]);
  const [adminPage, setAdminPage] = useState(1);
  const [adminTotalPages, setAdminTotalPages] = useState(1);
  const [adminTotalProducts, setAdminTotalProducts] = useState(0);
  const [adminSearch, setAdminSearch] = useState('');
  const [debouncedAdminSearch, setDebouncedAdminSearch] = useState('');
  const [adminSortOption, setAdminSortOption] = useState('created_desc');
  const [adminSortBy, setAdminSortBy] = useState('created_at');
  const [adminOrder, setAdminOrder] = useState('DESC');

  // Admin Articles state
  const [adminArticles, setAdminArticles] = useState<Article[]>([]);
  const [adminArticlesTotal, setAdminArticlesTotal] = useState(0);
  const [adminArticlesPage, setAdminArticlesPage] = useState(1);
  const [adminArticlesTotalPages, setAdminArticlesTotalPages] = useState(1);

  // Debounce search term changes for admin panel to prevent querying too frequently
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedAdminSearch(adminSearch);
    }, 450); // 450ms delay

    return () => {
      clearTimeout(handler);
    };
  }, [adminSearch]);

  const handleAdminSortChange = (val: string) => {
    setAdminSortOption(val);
    let newSortBy = 'created_at';
    let newOrder = 'DESC';
    switch (val) {
      case 'name_asc': newSortBy = 'name'; newOrder = 'ASC'; break;
      case 'name_desc': newSortBy = 'name'; newOrder = 'DESC'; break;
      case 'price_asc': newSortBy = 'price'; newOrder = 'ASC'; break;
      case 'price_desc': newSortBy = 'price'; newOrder = 'DESC'; break;
      case 'stock_asc': newSortBy = 'stock'; newOrder = 'ASC'; break;
      case 'stock_desc': newSortBy = 'stock'; newOrder = 'DESC'; break;
      case 'created_asc': newSortBy = 'created_at'; newOrder = 'ASC'; break;
      case 'created_desc': newSortBy = 'created_at'; newOrder = 'DESC'; break;
    }
    setAdminSortBy(newSortBy);
    setAdminOrder(newOrder);
    setAdminPage(1);
  };

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
  const [aImage, setAImage] = useState('');

  // Markdown history states
  const [_contentHistory, setContentHistory] = useState<string[]>([]);
  const [contentHistoryIndex, setContentHistoryIndex] = useState<number>(-1);

  // Change password states
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Modals for Categories Sửa/Xóa and URL inserting
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { },
  });

  const [renameModal, setRenameModal] = useState<{
    isOpen: boolean;
    catId: string;
    oldName: string;
    newName: string;
  }>({
    isOpen: false,
    catId: '',
    oldName: '',
    newName: '',
  });

  const [imageUrlModal, setImageUrlModal] = useState<{
    isOpen: boolean;
    url: string;
  }>({
    isOpen: false,
    url: ''
  });

  const [productImageUrlModal, setProductImageUrlModal] = useState<{
    isOpen: boolean;
    url: string;
  }>({
    isOpen: false,
    url: ''
  });

  const triggerFeedback = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const triggerErrorFeedback = (msg: string) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(''), 5000);
  };

  const handleApiError = async (res: Response, defaultMsg: string) => {
    if (res.status === 401) {
      triggerErrorFeedback('Phiên làm việc đã hết hạn. Đang tự động đăng xuất và quay về trang chủ...');
      setTimeout(() => {
        onLogout();
      }, 2000);
      return;
    }

    try {
      const data = await res.json();
      if (data && (data.statusCode === 401 || data.status === 401 || data.message === 'Unauthorized')) {
        triggerErrorFeedback('Phiên làm việc đã hết hạn. Đang tự động đăng xuất và quay về trang chủ...');
        setTimeout(() => {
          onLogout();
        }, 2000);
        return;
      }
      if (data && data.message) {
        triggerErrorFeedback(`${data.message} (${data.errorCode || res.status})`);
      } else {
        triggerErrorFeedback(defaultMsg);
      }
    } catch {
      triggerErrorFeedback(defaultMsg);
    }
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
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

  const fetchAdminProducts = () => {
    const params = new URLSearchParams({
      page: String(adminPage),
      take: '15',
      order: adminOrder,
      sort_by: adminSortBy,
      keyword: debouncedAdminSearch
    });
    fetch(`${API_BASE_URL}/api/v1/products?${params.toString()}`)
      .then(res => {
        if (res.status === 401) {
          handleApiError(res, 'Phiên làm việc đã hết hạn.');
          throw new Error('Unauthorized');
        }
        return res.json();
      })
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
              const childMatch = (parent.children || []).find((s: any) => s.id === p.category_id);
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
            is_featured: p.is_featured || p.isFeatured || false,
            description: p.description || ''
          };
        });

        setAdminProducts(mapped);
        setAdminTotalPages(meta.totalPage || 1);
        setAdminTotalProducts(meta.total || docs.length);
      })
      .catch(err => console.error("Error fetching admin products:", err));
  };

  const fetchAdminArticles = () => {
    fetch(`${API_BASE_URL}/api/v1/articles?page=${adminArticlesPage}&take=8`)
      .then(res => {
        if (res.status === 401) {
          handleApiError(res, 'Phiên làm việc đã hết hạn.');
          throw new Error('Unauthorized');
        }
        return res.json();
      })
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
          summary: art.summary || '',
          content: art.content || '',
          image: getFullImageUrl(art.thumbnail_url || art.image || ''),
          rawImage: art.thumbnail_url || art.image || ''
        }));
        setAdminArticles(mapped);
        setAdminArticlesTotalPages(meta.totalPage || 1);
        setAdminArticlesTotal(meta.total || docs.length);
      })
      .catch(err => console.error("Error fetching admin articles:", err));
  };

  React.useEffect(() => {
    fetchAdminArticles();
  }, [adminArticlesPage]);

  React.useEffect(() => {
    if (activeTab === 'products') {
      fetchAdminProducts();
    } else if (activeTab === 'articles') {
      fetchAdminArticles();
    }
  }, [adminPage, debouncedAdminSearch, adminSortBy, adminOrder, activeTab, categories]);

  // --- Product CRUD ---
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setPCode('');
    setPName('');
    setPCategory(categories[0]?.name || '');
    setPPrice(0);
    setPStock(0);
    setPSpecs('');
    setPDescription('');
    setPImage('');
    setShowProductForm(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setPCode(prod.code);
    setPName(prod.name);
    setPCategory(prod.category);
    const parsedPrice = parseInt(prod.price, 10);
    setPPrice(isNaN(parsedPrice) ? 0 : parsedPrice);
    setPStock(prod.stock);
    setPSpecs(prod.specifications.join('\n'));
    setPDescription(prod.description || '');
    setPImage(prod.image || 'https://aecom.com.vn/wp-content/uploads/2024/07/ma%CC%81y-ta%CC%86ng-a%CC%81p--300x300.png');
    setShowProductForm(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pCode.trim() || !pName.trim()) {
      triggerErrorFeedback('Vui lòng điền mã và tên thiết bị!');
      return;
    }

    const specificationsObj: Record<string, string> = {};
    pSpecs.split('\n').forEach(line => {
      const parts = line.split(':');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join(':').trim();
        if (key && value) {
          specificationsObj[key] = value;
        }
      }
    });

    const stockStatus = pStock === 0 ? 'out_of_stock' : pStock < 10 ? 'low_stock' : 'in_stock';
    const finalImage = pImage.trim() || 'https://aecom.com.vn/wp-content/uploads/2024/07/ma%CC%81y-ta%CC%86ng-a%CC%81p--300x300.png';

    let categoryId = '';
    const matchedCat = categories.find(c => c.name === pCategory);
    if (matchedCat) {
      categoryId = matchedCat.id;
    } else {
      for (const parent of categories) {
        const matchedSub = (parent.children || []).find(s => s.name === pCategory);
        if (matchedSub) {
          categoryId = matchedSub.id;
          break;
        }
      }
    }

    const body = {
      code: pCode.trim(),
      name: pName.trim(),
      category_id: categoryId,
      price: pPrice,
      stock: pStock,
      status: stockStatus,
      image_url: finalImage,
      specifications: specificationsObj,
      description: pDescription.trim()
    };

    const url = editingProduct
      ? `${API_BASE_URL}/api/v1/products/${editingProduct.id}`
      : `${API_BASE_URL}/api/v1/products`;
    const method = editingProduct ? 'PATCH' : 'POST';

    fetch(url, {
      method,
      headers: getAuthHeaders(),
      body: JSON.stringify(body)
    })
      .then(async (res) => {
        if (res.ok) {
          triggerFeedback(editingProduct ? 'Đã cập nhật sản phẩm thành công!' : 'Đã thêm sản phẩm mới!');
          setShowProductForm(false);
          fetchAdminProducts();
        } else {
          handleApiError(res, editingProduct ? 'Không thể cập nhật sản phẩm.' : 'Không thể thêm sản phẩm mới.');
        }
      })
      .catch(err => {
        console.error('Error saving product:', err);
        triggerErrorFeedback('Lỗi kết nối tới máy chủ.');
      });
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('Bạn chắc chắn muốn xóa sản phẩm này chứ?')) {
      fetch(`${API_BASE_URL}/api/v1/products/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })
        .then(async (res) => {
          if (res.ok) {
            triggerFeedback('Đã xóa sản phẩm.');
            fetchAdminProducts();
          } else {
            handleApiError(res, 'Không thể xóa sản phẩm.');
          }
        })
        .catch(err => {
          console.error('Error deleting product:', err);
          triggerErrorFeedback('Lỗi kết nối.');
        });
    }
  };

  const handleToggleFeatured = (product: Product) => {
    const nextFeatured = !product.is_featured;
    fetch(`${API_BASE_URL}/api/v1/products/${product.id}/featured`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ is_featured: nextFeatured })
    })
      .then(async (res) => {
        if (res.ok) {
          triggerFeedback(nextFeatured ? 'Đã đánh dấu nổi bật.' : 'Đã bỏ nổi bật.');
          fetchAdminProducts();
        } else {
          handleApiError(res, 'Không thể cập nhật nổi bật.');
        }
      })
      .catch(err => {
        console.error('Error toggling featured product:', err);
        triggerErrorFeedback('Lỗi kết nối.');
      });
  };

  // --- Category CRUD ---
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    if (categories.some(c => c.name.toLowerCase() === newCatName.trim().toLowerCase())) {
      triggerErrorFeedback('Danh mục này đã tồn tại!');
      return;
    }

    fetch(`${API_BASE_URL}/api/v1/categories`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        name: newCatName.trim(),
        parent_id: null
      })
    })
      .then(async (res) => {
        if (res.ok) {
          const result = await res.json();
          const newCat: Category = {
            id: result.data?.id || result.id || ('cat_' + Date.now()),
            name: newCatName.trim(),
            children: []
          };
          onUpdateCategories([...categories, newCat]);
          setNewCatName('');
          triggerFeedback('Đã thêm danh mục chính mới!');
        } else {
          handleApiError(res, 'Không thể tạo danh mục chính.');
        }
      })
      .catch(err => {
        console.error('Error creating category:', err);
        triggerErrorFeedback('Lỗi kết nối tới máy chủ.');
      });
  };

  const handleAddSubcategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName.trim() || !targetCatForSub) return;

    const parentCat = categories.find(c => c.name === targetCatForSub);
    if (!parentCat) return;

    fetch(`${API_BASE_URL}/api/v1/categories`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        name: newSubName.trim(),
        parent_id: parentCat.id
      })
    })
      .then(async (res) => {
        if (res.ok) {
          const result = await res.json();
          const newSub: Category = {
            id: result.data?.id || result.id || ('sub_' + Date.now()),
            name: newSubName.trim(),
            children: []
          };
          const updated = categories.map(c => {
            if (c.id === parentCat.id) {
              return { ...c, children: [...(c.children || []), newSub] };
            }
            return c;
          });
          onUpdateCategories(updated);
          setNewSubName('');
          triggerFeedback('Đã thêm danh mục con mới!');
        } else {
          handleApiError(res, 'Không thể tạo danh mục con.');
        }
      })
      .catch(err => {
        console.error('Error creating subcategory:', err);
        triggerErrorFeedback('Lỗi kết nối.');
      });
  };

  const handleRenameCategory = (catId: string, oldName: string) => {
    setRenameModal({
      isOpen: true,
      catId,
      oldName,
      newName: oldName
    });
  };

  const submitRenameCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const { catId, newName, oldName } = renameModal;
    if (!newName || !newName.trim() || newName.trim() === oldName) {
      setRenameModal(prev => ({ ...prev, isOpen: false }));
      return;
    }

    fetch(`${API_BASE_URL}/api/v1/categories/${catId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name: newName.trim() })
    })
      .then(async (res) => {
        if (res.ok) {
          const updated = categories.map(c => {
            if (c.id === catId) {
              return { ...c, name: newName.trim() };
            }
            const subUpdated = (c.children || []).map(s => {
              if (s.id === catId) {
                return { ...s, name: newName.trim() };
              }
              return s;
            });
            return { ...c, children: subUpdated };
          });
          onUpdateCategories(updated);
          triggerFeedback('Đã đổi tên danh mục thành công!');
        } else {
          handleApiError(res, 'Không thể đổi tên danh mục.');
        }
      })
      .catch(err => {
        console.error('Error updating category:', err);
        triggerErrorFeedback('Lỗi kết nối tới máy chủ.');
      })
      .finally(() => {
        setRenameModal(prev => ({ ...prev, isOpen: false }));
      });
  };

  const requestConfirmation = (title: string, message: string, onConfirm: () => void) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleDeleteCategory = (cat: Category) => {
    requestConfirmation(
      'Xác Nhận Xóa Danh Mục',
      `Bạn có chắc chắn muốn xóa danh mục "${cat.name}" và tất cả danh mục con của nó?`,
      () => {
        fetch(`${API_BASE_URL}/api/v1/categories/${cat.id}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        })
          .then(res => {
            if (res.ok) {
              onUpdateCategories(categories.filter(c => c.id !== cat.id));
              triggerFeedback('Đã xóa danh mục chính!');
            } else {
              handleApiError(res, 'Không thể xóa danh mục chính.');
            }
          })
          .catch(err => {
            console.error('Error deleting category:', err);
            triggerErrorFeedback('Lỗi kết nối.');
          });
      }
    );
  };

  const handleDeleteSubcategory = (catId: string, subId: string, subName: string) => {
    requestConfirmation(
      'Xác Nhận Xóa Danh Mục Con',
      `Bạn có chắc chắn muốn xóa danh mục con "${subName}"?`,
      () => {
        fetch(`${API_BASE_URL}/api/v1/categories/${subId}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        })
          .then(res => {
            if (res.ok) {
              const updated = categories.map(c => {
                if (c.id === catId) {
                  return { ...c, children: (c.children || []).filter(s => s.id !== subId) };
                }
                return c;
              });
              onUpdateCategories(updated);
              triggerFeedback('Đã xóa danh mục con!');
            } else {
              handleApiError(res, 'Không thể xóa danh mục con.');
            }
          })
          .catch(err => {
            console.error('Error deleting subcategory:', err);
            triggerErrorFeedback('Lỗi kết nối.');
          });
      }
    );
  };

  // --- Article CRUD ---
  const handleOpenAddArticle = () => {
    setEditingArticle(null);
    setATitle('');
    setASummary('');
    setAContent('');
    setAImage('');
    setShowArticleForm(true);
  };

  const handleOpenEditArticle = (art: Article) => {
    setEditingArticle(art);
    setATitle(art.title);
    setASummary(art.summary);
    setAContent(art.content);
    setAImage(art.image || '');
    setShowArticleForm(true);
  };

  const handleSaveArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aTitle.trim() || !aContent.trim()) {
      triggerErrorFeedback('Vui lòng điền đầy đủ tiêu đề và nội dung bài viết!');
      return;
    }

    const body = {
      title: aTitle.trim(),
      summary: aSummary.trim(),
      content: aContent.trim(),
      thumbnail_url: aImage.trim() || undefined
    };

    const url = editingArticle
      ? `${API_BASE_URL}/api/v1/articles/${editingArticle.id}`
      : `${API_BASE_URL}/api/v1/articles`;
    const method = editingArticle ? 'PATCH' : 'POST';

    fetch(url, {
      method,
      headers: getAuthHeaders(),
      body: JSON.stringify(body)
    })
      .then(async (res) => {
        if (res.ok) {
          triggerFeedback(editingArticle ? 'Cập nhật tin tức thành công!' : 'Đã đăng tin tức mới!');
          setShowArticleForm(false);
          fetchAdminArticles();
        } else {
          handleApiError(res, editingArticle ? 'Không thể cập nhật bài viết.' : 'Không thể đăng bài viết.');
        }
      })
      .catch(err => {
        console.error('Error saving article:', err);
        triggerErrorFeedback('Lỗi kết nối tới máy chủ.');
      });
  };

  const handleDeleteArticle = (id: string) => {
    if (confirm('Bạn chắc chắn muốn xóa bài viết này chứ?')) {
      fetch(`${API_BASE_URL}/api/v1/articles/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })
        .then(async (res) => {
          if (res.ok) {
            triggerFeedback('Đã xóa bài viết.');
            fetchAdminArticles();
          } else {
            handleApiError(res, 'Không thể xóa bài viết.');
          }
        })
        .catch(err => {
          console.error('Error deleting article:', err);
          triggerErrorFeedback('Lỗi kết nối.');
        });
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      triggerErrorFeedback('Mật khẩu mới và xác nhận mật khẩu mới không khớp!');
      return;
    }

    fetch(`${API_BASE_URL}/api/v1/auth/update-password`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        oldPassword: oldPassword,
        newPassword: newPassword
      })
    })
      .then(async (res) => {
        if (res.ok) {
          triggerFeedback('Đã đổi mật khẩu thành công!');
          setShowChangePasswordModal(false);
          setOldPassword('');
          setNewPassword('');
          setConfirmNewPassword('');
        } else {
          handleApiError(res, 'Không thể đổi mật khẩu. Vui lòng kiểm tra lại mật khẩu cũ.');
        }
      })
      .catch(err => {
        console.error('Error changing password:', err);
        triggerErrorFeedback('Lỗi kết nối tới máy chủ.');
      });
  };

  // Upload Handlers
  const handleUploadProductImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('accessToken');
    fetch(`${API_BASE_URL}/api/v1/uploads/images`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    })
      .then(async res => {
        if (res.ok) {
          const result = await res.json();
          const payload = result.data || result;
          let url = '';
          if (typeof payload === 'string') {
            url = payload;
          } else if (payload) {
            url = payload.url || payload.filePath || payload.path || payload.filename || '';
          }

          if (url) {
            setPImage(url);
            triggerFeedback('Tải ảnh thiết bị thành công!');
          } else {
            triggerErrorFeedback('Không tìm thấy link ảnh trả về từ server.');
          }
        } else {
          triggerErrorFeedback('Lỗi khi tải ảnh lên máy chủ.');
        }
      })
      .catch(err => {
        console.error('Error uploading product image:', err);
        triggerErrorFeedback('Lỗi kết nối khi tải ảnh.');
      });

    e.target.value = '';
  };

  const handleUploadThumbnailImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('accessToken');
    fetch(`${API_BASE_URL}/api/v1/uploads/images`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    })
      .then(async res => {
        if (res.ok) {
          const result = await res.json();
          const payload = result.data || result;
          let url = '';
          if (typeof payload === 'string') {
            url = payload;
          } else if (payload) {
            url = payload.url || payload.filePath || payload.path || payload.filename || '';
          }

          if (url) {
            setAImage(url);
            triggerFeedback('Tải ảnh minh họa thành công!');
          } else {
            triggerErrorFeedback('Không tìm thấy link ảnh trả về từ server.');
          }
        } else {
          triggerErrorFeedback('Lỗi khi tải ảnh lên máy chủ.');
        }
      })
      .catch(err => {
        console.error('Error uploading thumbnail:', err);
        triggerErrorFeedback('Lỗi kết nối khi tải ảnh.');
      });

    e.target.value = '';
  };

  const handleUploadProductDescImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('accessToken');
    fetch(`${API_BASE_URL}/api/v1/uploads/images`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    })
      .then(async res => {
        if (res.ok) {
          const result = await res.json();
          const payload = result.data || result;
          let url = '';
          if (typeof payload === 'string') {
            url = payload;
          } else if (payload) {
            url = payload.url || payload.filePath || payload.path || payload.filename || '';
          }

          if (url) {
            insertProductDescFormatting(`![Mô tả ảnh](${url})`);
            triggerFeedback('Tải ảnh vào mô tả thành công!');
          } else {
            triggerErrorFeedback('Không tìm thấy link ảnh trả về từ server.');
          }
        } else {
          triggerErrorFeedback('Lỗi khi tải ảnh lên máy chủ.');
        }
      })
      .catch(err => {
        console.error('Error uploading product description image:', err);
        triggerErrorFeedback('Lỗi kết nối khi tải ảnh.');
      });

    e.target.value = '';
  };



  const insertProductDescFormatting = (formatText: string) => {
    const textarea = document.getElementById('product-description-textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);
    const selected = text.substring(start, end);

    let replacement = formatText;
    if (formatText.includes('Mô tả ảnh')) {
      replacement = formatText;
    } else {
      replacement = formatText.replace('$1', selected || 'văn bản');
    }

    const newVal = before + replacement + after;
    setPDescription(newVal);

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + replacement.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 50);
  };

  const insertFormatting = (prefix: string, suffix: string = '') => {
    const textarea = document.getElementById('article-content-textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    const replacement = prefix + selected + suffix;

    const newContent = text.substring(0, start) + replacement + text.substring(end);
    setAContent(newContent);

    // Push new content to history
    setContentHistory(prev => {
      const current = prev.slice(0, contentHistoryIndex + 1);
      const next = [...current, newContent];
      setContentHistoryIndex(next.length - 1);
      return next;
    });

    // Refocus and place cursor
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 50);
  };

  const pushHistory = (val: string) => {
    setContentHistory(prev => {
      const current = prev.slice(0, contentHistoryIndex + 1);
      if (current[current.length - 1] === val) return prev;
      const next = [...current, val];
      setContentHistoryIndex(next.length - 1);
      return next;
    });
  };

  /*
  const handleUndo = () => {
    if (contentHistoryIndex > 0) {
      const idx = contentHistoryIndex - 1;
      setContentHistoryIndex(idx);
      setAContent(contentHistory[idx]);
    }
  };

  const handleRedo = () => {
    if (contentHistoryIndex < contentHistory.length - 1) {
      const idx = contentHistoryIndex + 1;
      setContentHistoryIndex(idx);
      setAContent(contentHistory[idx]);
    }
  };
  */

  return (
    <div className="admin-dashboard-container">
      <div className="admin-header">
        <div>
          <h3>Hệ Thống Quản Trị MINAMI</h3>
          <p>Quản lý toàn bộ danh mục sản phẩm, cấu trúc và tin tức nội bộ.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-outline" style={{ borderRadius: '8px', cursor: 'pointer' }} onClick={() => setShowChangePasswordModal(true)}>Đổi mật khẩu</button>
          <button className="btn btn-outline btn-logout" onClick={onLogout}>Đăng xuất admin</button>
        </div>
      </div>

      {successMessage && (
        <div className="toast-notification success">
          <CheckCircle size={18} />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="toast-notification error">
          <AlertTriangle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      <Modal
        isOpen={showChangePasswordModal}
        onClose={() => {
          setShowChangePasswordModal(false);
          setOldPassword('');
          setNewPassword('');
          setConfirmNewPassword('');
        }}
        title="Đổi Mật Khẩu Admin"
      >
        <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
            <label className="field-label" style={{ fontWeight: 600, fontSize: '14px', marginTop: '0px !important' }}>Mật khẩu cũ *</label>
            <input
              type="password"
              value={oldPassword}
              onChange={e => setOldPassword(e.target.value)}
              className="form-input"
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-medium)', outline: 'none' }}
              required
            />
          </div>
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
            <label className="field-label" style={{ fontWeight: 600, fontSize: '14px' }}>Mật khẩu mới *</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="form-input"
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-medium)', outline: 'none' }}
              required
            />
          </div>
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
            <label className="field-label" style={{ fontWeight: 600, fontSize: '14px' }}>Xác nhận mật khẩu mới *</label>
            <input
              type="password"
              value={confirmNewPassword}
              onChange={e => setConfirmNewPassword(e.target.value)}
              className="form-input"
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-medium)', outline: 'none' }}
              required
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
            <button type="button" className="btn btn-outline" onClick={() => {
              setShowChangePasswordModal(false);
              setOldPassword('');
              setNewPassword('');
              setConfirmNewPassword('');
            }}>Hủy</button>
            <button type="submit" className="btn btn-primary">Cập Nhật</button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        title={confirmModal.title}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>{confirmModal.message}</p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
            <button className="btn btn-outline" onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}>
              Hủy
            </button>
            <button className="btn" style={{ backgroundColor: 'var(--color-error)', color: 'var(--text-white)' }} onClick={confirmModal.onConfirm}>
              Xác Nhận Xóa
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={detailProduct !== null}
        onClose={() => setDetailProduct(null)}
        title="Chi Tiết Thiết Bị"
      >
        {detailProduct && (
          <div className="modal-product-detail">
            <div className="modal-prod-header">
              <div className="modal-prod-img-box">
                <img
                  src={detailProduct.image}
                  alt={detailProduct.name}
                  crossOrigin={isLocalBackendImage(detailProduct.image) ? "anonymous" : undefined}
                />
              </div>
              <div className="modal-prod-meta">
                <span className="prod-badge">{detailProduct.category}</span>
                <h4 className="prod-name-title">{detailProduct.name}</h4>
                <p className="prod-code-label">Mã sản phẩm: <code>{detailProduct.code}</code></p>
                <p className="prod-price-label">Giá bán: <span className="price-tag">{formatPrice(detailProduct.price)}</span></p>
                <p className="prod-price-label" style={{ fontSize: '13px', marginTop: '4px' }}>Tồn kho: <strong>{detailProduct.stock} sản phẩm</strong></p>
              </div>
            </div>

            <div className="modal-prod-specs">
              <h5>Thông số kỹ thuật chính:</h5>
              <ul className="specs-list">
                {detailProduct.specifications.map((spec, i) => (
                  <li key={i}><Info size={14} /> <span>{spec}</span></li>
                ))}
              </ul>
            </div>

            {detailProduct.description && (
              <div className="modal-prod-desc" style={{ marginTop: '20px', borderTop: '1px solid var(--border-light)', paddingTop: '15px' }}>
                <h5 style={{ fontWeight: 600, color: 'var(--primary-color)', marginBottom: '8px' }}>Mô tả chi tiết sản phẩm:</h5>
                <div
                  className="prod-description-content"
                  style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}
                  dangerouslySetInnerHTML={{ __html: formatArticleContent(detailProduct.description) }}
                />
              </div>
            )}

            <div className="modal-prod-footer" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', borderTop: '1px solid var(--border-light)', paddingTop: '15px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  className="btn"
                  style={{ backgroundColor: 'var(--primary-color)', color: 'var(--text-white)' }}
                  onClick={() => {
                    const p = detailProduct;
                    setDetailProduct(null);
                    handleOpenEditProduct(p);
                  }}
                >
                  Sửa Thiết Bị
                </button>
                <button
                  type="button"
                  className="btn"
                  style={{ backgroundColor: 'var(--color-error)', color: 'var(--text-white)' }}
                  onClick={() => {
                    const id = detailProduct.id;
                    setDetailProduct(null);
                    handleDeleteProduct(id);
                  }}
                >
                  Xóa
                </button>
              </div>
              <button className="btn btn-outline" onClick={() => setDetailProduct(null)}>Đóng</button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={renameModal.isOpen}
        onClose={() => setRenameModal(prev => ({ ...prev, isOpen: false }))}
        title="Đổi Tên Danh Mục"
      >
        <form onSubmit={submitRenameCategory} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
            <label className="field-label" style={{ fontWeight: 600, fontSize: '14px' }}>Tên danh mục mới *</label>
            <input
              type="text"
              value={renameModal.newName}
              onChange={e => setRenameModal(prev => ({ ...prev, newName: e.target.value }))}
              className="form-input"
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-medium)', outline: 'none' }}
              required
              autoFocus
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
            <button type="button" className="btn btn-outline" onClick={() => setRenameModal(prev => ({ ...prev, isOpen: false }))}>
              Hủy
            </button>
            <button type="submit" className="btn btn-primary">
              Lưu Thay Đổi
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={imageUrlModal.isOpen}
        onClose={() => setImageUrlModal(prev => ({ ...prev, isOpen: false }))}
        title="Chèn URL Hình Ảnh"
      >
        <form onSubmit={(e) => {
          e.preventDefault();
          if (imageUrlModal.url.trim()) {
            insertFormatting(`![Mô tả ảnh](${imageUrlModal.url.trim()})`);
          }
          setImageUrlModal({ isOpen: false, url: '' });
        }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
            <label className="field-label" style={{ fontWeight: 600, fontSize: '14px' }}>Đường dẫn hình ảnh (URL) *</label>
            <input
              type="url"
              placeholder="https://example.com/image.png"
              value={imageUrlModal.url}
              onChange={e => setImageUrlModal(prev => ({ ...prev, url: e.target.value }))}
              className="form-input"
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-medium)', outline: 'none' }}
              required
              autoFocus
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
            <button type="button" className="btn btn-outline" onClick={() => setImageUrlModal({ isOpen: false, url: '' })}>
              Hủy
            </button>
            <button type="submit" className="btn btn-primary">
              Chèn Vào Bài Viết
            </button>
          </div>
        </form>
      </Modal>


      <Modal
        isOpen={showProductForm}
        onClose={() => setShowProductForm(false)}
        title={editingProduct ? 'Cấu Hình Thiết Bị' : 'Thêm Thiết Bị Mới'}
      >
        <form onSubmit={handleSaveProduct} className="crud-form" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
            <label className="field-label" style={{ fontWeight: 600, fontSize: '14px' }}>Mã Thiết Bị *</label>
            <input type="text" value={pCode} onChange={e => setPCode(e.target.value)} className="form-input" style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-medium)', outline: 'none' }} required />
          </div>
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
            <label className="field-label" style={{ fontWeight: 600, fontSize: '14px' }}>Tên Thiết Bị *</label>
            <input type="text" value={pName} onChange={e => setPName(e.target.value)} className="form-input" style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-medium)', outline: 'none' }} required />
          </div>
          <div className="form-grid-2col">
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
              <label className="field-label" style={{ fontWeight: 600, fontSize: '14px' }}>Danh Mục</label>
              <select value={pCategory} onChange={e => setPCategory(e.target.value)} className="form-input" style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-medium)', outline: 'none' }}>
                {categories.map(c => (
                  <optgroup key={c.id || c.name} label={c.name}>
                    <option value={c.name}>{c.name} (Chính)</option>
                    {(c.children || []).map(s => (
                      <option key={s.id || s.name} value={s.name}>{s.name}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
              <label className="field-label" style={{ fontWeight: 600, fontSize: '14px' }}>Giá (đ) (0 = Liên hệ)</label>
              <input
                type="number"
                min="0"
                placeholder="0 để hiện 'Liên hệ'"
                value={pPrice === 0 ? '' : pPrice}
                onChange={e => setPPrice(parseInt(e.target.value, 10) || 0)}
                className="form-input"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-medium)', outline: 'none' }}
              />
            </div>
          </div>
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
            <label className="field-label" style={{ fontWeight: 600, fontSize: '14px' }}>Ảnh thiết bị (URL hoặc Tải lên)</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                value={pImage}
                onChange={e => setPImage(e.target.value)}
                className="form-input"
                placeholder="Đường dẫn ảnh sản phẩm hoặc bấm tải lên"
                style={{ flex: 1, padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-medium)', outline: 'none' }}
              />
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => document.getElementById('product-image-upload-input')?.click()}
                style={{ padding: '0 15px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap', cursor: 'pointer' }}
              >
                📁 Tải ảnh
              </button>
              <input
                type="file"
                id="product-image-upload-input"
                accept="image/*"
                onChange={handleUploadProductImage}
                style={{ display: 'none' }}
              />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
              <label className="field-label" style={{ fontWeight: 600, fontSize: '14px' }}>Số lượng tồn kho</label>
              <input type="number" value={pStock} onChange={e => setPStock(parseInt(e.target.value) || 0)} className="form-input" style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-medium)', outline: 'none' }} />
            </div>
          </div>
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
            <label className="field-label" style={{ fontWeight: 600, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              Thông số kỹ thuật (Mỗi hàng 1 dòng)
              <span className="tooltip-icon" style={{ cursor: 'help', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <Info size={14} />
                <span className="tooltip-text">
                  Điền theo định dạng "Tên: Giá trị" (Mỗi thuộc tính là 1 dòng).<br /><br />
                  <strong>Ví dụ:</strong><br />
                  Thương hiệu: SMC<br />
                  Áp suất: 0.2 - 1.0 MPa<br />
                  Chất liệu: Hợp kim nhôm
                </span>
              </span>
            </label>
            <textarea rows={3} value={pSpecs} onChange={e => setPSpecs(e.target.value)} className="form-input" placeholder={"Thương hiệu: SMC\nÁp suất: 0.2 - 1.0 MPa\nChất liệu: Hợp kim nhôm"} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-medium)', outline: 'none', fontFamily: 'inherit' }} />
          </div>
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
            <label className="field-label" style={{ fontWeight: 600, fontSize: '14px' }}>Mô tả chi tiết sản phẩm</label>
            <div className="markdown-editor-container">
              <div className="editor-toolbar">
                <button type="button" className="editor-btn" onClick={() => insertProductDescFormatting('**$1**')}><b>B</b> Đậm</button>
                <button type="button" className="editor-btn" onClick={() => insertProductDescFormatting('*$1*')}><i>I</i> Nghiêng</button>
                <button type="button" className="editor-btn" onClick={() => insertProductDescFormatting('### $1')}>H3 Tiêu đề</button>
                <span className="editor-divider" />
                <button type="button" className="editor-btn" onClick={() => setProductImageUrlModal({ isOpen: true, url: '' })}>🔗 Chèn link ảnh</button>
                <button type="button" className="editor-btn" onClick={() => document.getElementById('product-desc-image-upload-input')?.click()}>📁 Tải ảnh lên</button>
                <input
                  type="file"
                  id="product-desc-image-upload-input"
                  accept="image/*"
                  onChange={handleUploadProductDescImage}
                  style={{ display: 'none' }}
                />
              </div>
              <textarea
                id="product-description-textarea"
                rows={10}
                value={pDescription}
                onChange={e => setPDescription(e.target.value)}
                className="editor-textarea"
                placeholder="Nhập mô tả chi tiết sản phẩm (hỗ trợ định dạng và ảnh)..."
              />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
            <button type="button" className="btn btn-outline" onClick={() => setShowProductForm(false)}>Hủy</button>
            <button type="submit" className="btn btn-primary">Lưu Lại</button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={productImageUrlModal.isOpen}
        onClose={() => setProductImageUrlModal(prev => ({ ...prev, isOpen: false }))}
        title="Chèn URL Hình Ảnh"
      >
        <form onSubmit={(e) => {
          e.preventDefault();
          if (productImageUrlModal.url.trim()) {
            insertProductDescFormatting(`![Mô tả ảnh](${productImageUrlModal.url.trim()})`);
          }
          setProductImageUrlModal({ isOpen: false, url: '' });
        }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
            <label className="field-label" style={{ fontWeight: 600, fontSize: '14px' }}>Đường dẫn hình ảnh (URL) *</label>
            <input
              type="url"
              placeholder="https://example.com/image.png"
              value={productImageUrlModal.url}
              onChange={e => setProductImageUrlModal(prev => ({ ...prev, url: e.target.value }))}
              className="form-input"
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-medium)', outline: 'none' }}
              required
              autoFocus
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
            <button type="button" className="btn btn-outline" onClick={() => setProductImageUrlModal({ isOpen: false, url: '' })}>
              Hủy
            </button>
            <button type="submit" className="btn btn-primary">
              Chèn Link Ảnh
            </button>
          </div>
        </form>
      </Modal>

      {/* Tabs */}
      <div className="admin-tabs">
        <button
          className={`admin-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => { setActiveTab('products'); setShowProductForm(false); }}
        >
          Sản phẩm ({adminTotalProducts})
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
          Tin tức ({adminArticlesTotal})
        </button>
      </div>

      <div className="admin-tab-content">
        {/* --- PRODUCTS TAB --- */}
        {activeTab === 'products' && (
          <div className="dashboard-grid">
            <div className="crud-list-wrapper">
              <div className="list-top-controls" style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                  <button className="btn btn-primary" onClick={handleOpenAddProduct}>+ Thêm sản phẩm</button>
                </div>
                <div className="admin-search-row">
                  <div style={{ position: 'relative', flex: 7, width: '100%' }}>
                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      placeholder="Tìm kiếm mã thiết bị hoặc tên sản phẩm..."
                      value={adminSearch}
                      onChange={e => {
                        setAdminSearch(e.target.value);
                        setAdminPage(1);
                      }}
                      className="form-input admin-search-input"
                      style={{ width: '100%', fontSize: '14px', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div style={{ position: 'relative', flex: 3, width: '100%' }}>
                    <select
                      value={adminSortOption}
                      onChange={e => handleAdminSortChange(e.target.value)}
                      className="form-input"
                      style={{ width: '100%', padding: '10px 12px', fontSize: '14px', cursor: 'pointer', boxSizing: 'border-box' }}
                    >
                      <option value="created_desc">Ngày tạo (Mới nhất)</option>
                      <option value="created_asc">Ngày tạo (Cũ nhất)</option>
                      <option value="name_asc">Tên (A → Z)</option>
                      <option value="name_desc">Tên (Z → A)</option>
                      <option value="price_asc">Giá (Thấp → Cao)</option>
                      <option value="price_desc">Giá (Cao → Thấp)</option>
                      <option value="stock_asc">Tồn kho (Ít → Nhiều)</option>
                      <option value="stock_desc">Tồn kho (Nhiều → Ít)</option>
                    </select>
                  </div>
                </div>
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
                      <th>Nổi bật</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminProducts.map(p => (
                      <tr key={p.id}>
                        <td className="font-mono">
                          <button
                            type="button"
                            style={{ background: 'none', border: 'none', padding: 0, color: 'var(--primary-color)', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit' }}
                            onClick={() => setDetailProduct(p)}
                          >
                            {p.code}
                          </button>
                        </td>
                        <td>
                          <button
                            type="button"
                            style={{ background: 'none', border: 'none', padding: 0, color: 'var(--text-primary)', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit' }}
                            onClick={() => setDetailProduct(p)}
                            className="btn-link-hover"
                          >
                            {p.name}
                          </button>
                        </td>
                        <td>{p.category}</td>
                        <td className="price-label">{formatPrice(p.price)}</td>
                        <td>{p.stock}</td>
                        <td>
                          <button
                            type="button"
                            onClick={() => handleToggleFeatured(p)}
                            aria-label={p.is_featured ? 'Bỏ nổi bật' : 'Đánh dấu nổi bật'}
                            aria-pressed={!!p.is_featured}
                            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', lineHeight: 0 }}
                          >
                            <Star size={18} fill={p.is_featured ? '#f59e0b' : 'none'} color={p.is_featured ? '#f59e0b' : 'var(--border-medium)'} />
                          </button>
                        </td>
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

              {/* Pagination */}
              <div className="table-pagination" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px', padding: '0 5px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Trang <strong>{adminPage}</strong> trên <strong>{adminTotalPages}</strong> ({adminTotalProducts} sản phẩm)
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="btn btn-outline"
                    style={{ padding: '4px 10px', fontSize: '12px' }}
                    onClick={() => {
                      setAdminPage(prev => Math.max(prev - 1, 1));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={adminPage === 1}
                  >
                    Trước
                  </button>
                  <button
                    className="btn btn-outline"
                    style={{ padding: '4px 10px', fontSize: '12px' }}
                    onClick={() => {
                      setAdminPage(prev => Math.min(prev + 1, adminTotalPages));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={adminPage === adminTotalPages}
                  >
                    Sau
                  </button>
                </div>
              </div>
            </div>
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
                      <option key={c.id || c.name} value={c.name}>{c.name}</option>
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
                  <div key={cat.id || cat.name} className="tree-node">
                    <div className="tree-node-header">
                      <strong>{cat.name}</strong>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button className="tree-edit-btn" onClick={() => handleRenameCategory(cat.id, cat.name)} style={{ color: 'var(--primary-color)', fontSize: '11px', fontWeight: 600 }}>Sửa</button>
                        <button className="tree-delete-btn" onClick={() => handleDeleteCategory(cat)}>Xóa</button>
                      </div>
                    </div>
                    {cat.children && cat.children.length > 0 && (
                      <div className="tree-sub-list">
                        {cat.children.map(sub => (
                          <div key={sub.id} className="tree-sub-node">
                            <span>{sub.name}</span>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <button className="tree-edit-btn-sub" onClick={() => handleRenameCategory(sub.id, sub.name)} style={{ color: 'var(--primary-color)', fontSize: '11px', fontWeight: 600 }}>Sửa</button>
                              <button className="tree-delete-btn-sub" onClick={() => handleDeleteSubcategory(cat.id, sub.id, sub.name)}>Xóa</button>
                            </div>
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
              <form onSubmit={handleSaveArticle} className="crud-form" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h4>{editingArticle ? 'Sửa Tin Tức' : 'Đăng Tin Tức Mới'}</h4>
                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
                  <label className="field-label" style={{ fontWeight: 600, fontSize: '14px' }}>Tiêu đề bài viết *</label>
                  <input type="text" value={aTitle} onChange={e => setATitle(e.target.value)} className="form-input" required />
                </div>
                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
                  <label className="field-label" style={{ fontWeight: 600, fontSize: '14px' }}>Tóm tắt ngắn</label>
                  <textarea rows={2} value={aSummary} onChange={e => setASummary(e.target.value)} className="form-input" />
                </div>
                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
                  <label className="field-label" style={{ fontWeight: 600, fontSize: '14px' }}>Nội dung chi tiết</label>
                  <div className="markdown-editor-container">
                    <div className="editor-toolbar">
                      <button type="button" className="editor-btn" onClick={() => insertFormatting('**', '**')}><b>B</b> Đậm</button>
                      <button type="button" className="editor-btn" onClick={() => insertFormatting('*', '*')}><i>I</i> Nghiêng</button>
                      <button type="button" className="editor-btn" onClick={() => insertFormatting('### ')}>H3 Tiêu đề</button>
                      <span className="editor-divider" />
                      <button type="button" className="editor-btn" onClick={() => setImageUrlModal({ isOpen: true, url: '' })}>🔗 Chèn link ảnh</button>
                      <button type="button" className="editor-btn" onClick={() => document.getElementById('article-image-upload-input')?.click()}>📁 Tải ảnh lên</button>
                      <input
                        type="file"
                        id="article-image-upload-input"
                        accept="image/*"
                        onChange={handleUploadThumbnailImage}
                        style={{ display: 'none' }}
                      />
                    </div>
                    <textarea
                      id="article-content-textarea"
                      rows={12}
                      value={aContent}
                      onChange={e => {
                        setAContent(e.target.value);
                        pushHistory(e.target.value);
                      }}
                      className="editor-textarea"
                      placeholder="Nhập nội dung bài viết chi tiết..."
                    />
                  </div>
                </div>
                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
                  <label className="field-label" style={{ fontWeight: 600, fontSize: '14px' }}>Link ảnh minh họa (URL)</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                      type="text"
                      value={aImage}
                      onChange={e => setAImage(e.target.value)}
                      className="form-input"
                      placeholder="https://example.com/image.jpg hoặc tải file"
                      style={{ flex: 1, padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-medium)', outline: 'none' }}
                    />
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => document.getElementById('thumbnail-upload-input')?.click()}
                      style={{ padding: '0 15px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap', cursor: 'pointer' }}
                    >
                      📁 Tải ảnh lên
                    </button>
                    <input
                      type="file"
                      id="thumbnail-upload-input"
                      accept="image/*"
                      onChange={handleUploadThumbnailImage}
                      style={{ display: 'none' }}
                    />
                  </div>
                </div>
                <div className="crud-form-actions" style={{ marginTop: '15px', display: 'flex', gap: '7px' }}>
                  <button type="button" className="btn btn-outline" onClick={() => setShowArticleForm(false)}>Hủy</button>
                  <button type="submit" className="btn btn-primary">Lưu Bài Viết</button>
                </div>
              </form>
            ) : (
              <div className="crud-list-wrapper">
                <div className="list-top-controls" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '16px' }}>
                  <button className="btn btn-primary" onClick={handleOpenAddArticle}>+ Viết bài mới</button>
                </div>
                <div className="articles-list-grid">
                  {adminArticles.map(art => (
                    <div key={art.id} className="admin-article-card">
                      <div className="admin-art-meta">
                        <FileText size={12} />
                        <span>Đăng ngày: {art.date}</span>
                      </div>
                      <h4>{art.title}</h4>
                      <p>{art.summary}</p>
                      <div className="admin-art-actions">
                        <button className="btn-edit" onClick={() => handleOpenEditArticle(art)}>Sửa</button>
                        <button className="btn-delete" onClick={() => handleDeleteArticle(art.id)}>Xóa</button>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Articles Pagination */}
                <div className="table-pagination" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px', padding: '0 5px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    Trang <strong>{adminArticlesPage}</strong> trên <strong>{adminArticlesTotalPages}</strong> ({adminArticlesTotal} bài viết)
                  </span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="btn btn-outline"
                      style={{ padding: '4px 10px', fontSize: '12px' }}
                      onClick={() => {
                        setAdminArticlesPage(prev => Math.max(prev - 1, 1));
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      disabled={adminArticlesPage === 1}
                    >
                      Trước
                    </button>
                    <button
                      className="btn btn-outline"
                      style={{ padding: '4px 10px', fontSize: '12px' }}
                      onClick={() => {
                        setAdminArticlesPage(prev => Math.min(prev + 1, adminArticlesTotalPages));
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      disabled={adminArticlesPage === adminArticlesTotalPages}
                    >
                      Sau
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .mini-form {
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-lg);
          padding: var(--space-5);
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
          box-shadow: var(--shadow-sm);
        }

        .mini-form h5 {
          font-size: var(--font-size-sm);
          font-weight: 700;
          color: var(--primary-color);
          margin-bottom: var(--space-1);
          text-align: left;
          border-bottom: 1px solid var(--border-light);
          padding-bottom: var(--space-2);
        }

        .form-input {
          width: 100% !important;
          padding: 10px 12px !important;
          font-size: 16px !important;
          font-family: inherit !important;
          border: 1px solid var(--border-medium) !important;
          border-radius: var(--radius-md) !important;
          background-color: var(--bg-secondary) !important;
          color: var(--text-primary) !important;
          outline: none !important;
          transition: all var(--transition-fast) !important;
          box-sizing: border-box !important;
        }

        .crud-form .form-input,
        .crud-form .editor-textarea {
          font-size: 16px !important;
          font-family: inherit !important;
        }

        .form-input:focus {
          border-color: var(--primary-color) !important;
          box-shadow: 0 0 0 3px rgba(10, 59, 124, 0.1) !important;
        }

        .admin-search-input {
          padding-left: 38px !important;
        }

        .btn-link-hover:hover {
          color: var(--primary-color) !important;
          text-decoration: underline;
        }

        .field-label {
          margin-top: 8px !important;
        }

        /* Premium Editor Layout */
        .markdown-editor-container {
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-lg);
          overflow: hidden;
          background-color: var(--bg-primary);
          box-shadow: var(--shadow-sm);
          transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
        }

        .markdown-editor-container:focus-within {
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(10, 59, 124, 0.1);
        }

        .editor-toolbar {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          border-bottom: 1px solid var(--border-light);
          background-color: var(--bg-secondary);
          flex-wrap: wrap;
        }

        .editor-btn {
          background: none;
          border: 1px solid transparent;
          border-radius: var(--radius-sm);
          padding: 4px 10px;
          font-size: 12px;
          font-weight: 500;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all var(--transition-fast);
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .editor-btn:hover:not(:disabled) {
          background-color: var(--bg-tertiary);
          color: var(--text-primary);
          border-color: var(--border-medium);
        }

        .editor-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .editor-divider {
          height: 16px;
          width: 1px;
          background-color: var(--border-medium);
          margin: 0 6px;
        }

        .editor-textarea {
          width: 100% !important;
          border: none !important;
          border-radius: 0 !important;
          background-color: transparent !important;
          outline: none !important;
          resize: vertical;
          padding: var(--space-4) !important;
          font-family: inherit;
          font-size: 16px !important;
          line-height: 1.6;
          color: var(--text-primary);
          box-sizing: border-box;
          min-height: 180px;
        }

        .tooltip-icon {
          position: relative;
          display: inline-block;
        }

        .tooltip-icon .tooltip-text {
          visibility: hidden;
          width: 250px;
          background-color: var(--primary-color);
          color: var(--text-white);
          text-align: left;
          border-radius: var(--radius-md);
          padding: var(--space-2) var(--space-3);
          position: absolute;
          z-index: 999;
          bottom: 130%;
          left: 50%;
          transform: translateX(-50%);
          opacity: 0;
          transition: opacity 0.2s, visibility 0.2s;
          font-size: var(--font-size-xs);
          font-weight: 500;
          line-height: 1.5;
          box-shadow: var(--shadow-md);
          white-space: normal;
          font-family: var(--font-family-base);
        }

        .tooltip-icon:hover .tooltip-text {
          visibility: visible;
          opacity: 1;
        }

        .tooltip-icon .tooltip-text::after {
          content: "";
          position: absolute;
          top: 100%;
          left: 50%;
          margin-left: -5px;
          border-width: 5px;
          border-style: solid;
          border-color: var(--primary-color) transparent transparent transparent;
        }

        .admin-tabs {
          display: flex;
          gap: var(--space-2);
          border-bottom: 2px solid var(--border-light);
          margin-bottom: var(--space-5);
          overflow-x: auto;
          white-space: nowrap;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none; /* Hide scrollbar for Firefox */
        }

        .admin-tabs::-webkit-scrollbar {
          display: none; /* Hide scrollbar for Chrome, Safari and Opera */
        }

        .admin-tab-btn {
          padding: var(--space-2) var(--space-4);
          font-weight: 600;
          font-size: var(--font-size-sm);
          color: var(--text-secondary);
          position: relative;
          top: 2px;
          border-bottom: 2px solid transparent;
          background: none;
          border: none;
          cursor: pointer;
          outline: none;
          transition: all var(--transition-fast);
          flex-shrink: 0;
        }

        .admin-tab-btn:hover {
          color: var(--primary-color);
        }

        .admin-tab-btn.active {
          color: var(--primary-color);
          border-bottom-color: var(--primary-color);
        }

        @media (max-width: 576px) {
          .admin-tabs {
            gap: 4px;
          }
          .admin-tab-btn {
            padding: var(--space-2) var(--space-2);
            font-size: var(--font-size-xs);
          }
        }

        .admin-dashboard-container {
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-lg);
          padding: var(--space-6);
          box-shadow: var(--shadow-md);
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
          min-width: 0;
        }

        .admin-tab-content,
        .dashboard-grid,
        .crud-list-wrapper {
          width: 100%;
          max-width: 100%;
          min-width: 0;
          box-sizing: border-box;
        }

        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--border-light);
          padding-bottom: var(--space-4);
          margin-bottom: var(--space-5);
        }

        .form-grid-2col {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }

        .admin-search-row {
          display: flex;
          gap: 12px;
          width: 100%;
          flex-direction: column;
        }

        @media (min-width: 576px) {
          .form-grid-2col {
            grid-template-columns: 1fr 1fr;
          }
          .admin-search-row {
            flex-direction: row;
          }
        }

        @media (max-width: 576px) {
          .admin-dashboard-container {
            padding: var(--space-4) var(--space-3);
          }
          .admin-header {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--space-3);
          }
          .admin-header > div {
            width: 100%;
          }
          .btn-logout {
            width: 100%;
            text-align: center;
          }
        }

        .admin-header h3 {
          color: var(--primary-color);
          font-size: var(--font-size-md);
          font-weight: 700;
        }

        .admin-header p {
          font-size: var(--font-size-xs);
          color: var(--text-secondary);
        }

        .btn-logout {
          padding: 8px 16px;
          font-size: var(--font-size-xs);
        }

        .admin-feedback-banner {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          background-color: var(--color-success-bg);
          color: var(--color-success);
          border: 1px solid rgba(56, 161, 105, 0.2);
          padding: var(--space-3) var(--space-4);
          border-radius: var(--radius-md);
          margin-bottom: var(--space-4);
          font-size: var(--font-size-sm);
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

        /* Floating Toast Notification */
        .toast-notification {
          position: fixed;
          top: 24px;
          right: 24px;
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-lg);
          padding: var(--space-3) var(--space-5);
          display: flex;
          align-items: center;
          gap: var(--space-3);
          z-index: 9999;
          font-size: var(--font-size-sm);
          font-weight: 500;
          color: var(--text-primary);
          animation: slideInRight 250ms ease-out forwards;
        }

        .toast-notification.success {
          border-left: 4px solid var(--color-success);
        }

        .toast-notification.error {
          border-left: 4px solid var(--color-error);
        }

        @keyframes slideInRight {
          from {
            transform: translateX(120%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      ` }} />
    </div>
  );
};
