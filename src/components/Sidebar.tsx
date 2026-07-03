import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from './icons';
import type { Category } from '../utils/adminState';

interface SidebarProps {
  onSelectCategory: (category: string) => void;
  selectedCategory: string | null;
  categories: Category[];
}

export const Sidebar: React.FC<SidebarProps> = ({ onSelectCategory, selectedCategory, categories }) => {
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({
    'SMC': true,
    'Cảm biến': false,
  });
  const [mobileListOpen, setMobileListOpen] = useState(false);

  const handleRowClick = (cat: Category) => {
    const hasSubs = !!cat.children && cat.children.length > 0;
    if (hasSubs) {
      const isExpanded = !!expandedCats[cat.name];
      if (!isExpanded) {
        setExpandedCats(prev => ({ ...prev, [cat.name]: true }));
      } else {
        onSelectCategory(cat.name);
      }
    } else {
      onSelectCategory(cat.name);
    }
  };

  const toggleExpand = (catName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedCats(prev => ({
      ...prev,
      [catName]: !prev[catName]
    }));
  };

  return (
    <aside className="sidebar-categories">
      <h2 
        className={`sidebar-title ${mobileListOpen ? 'expanded' : ''}`}
        onClick={() => setMobileListOpen(!mobileListOpen)}
        style={{ cursor: 'pointer' }}
      >
        <span>Danh Mục Sản Phẩm</span>
        <span className={`sidebar-mobile-toggle-icon ${mobileListOpen ? 'rotated' : ''}`}>
          <ChevronDown size={16} />
        </span>
      </h2>
      <ul className={`category-list ${mobileListOpen ? 'mobile-open' : ''}`}>
        {categories.map(cat => {
          const hasSubs = !!cat.children && cat.children.length > 0;
          const isExpanded = !!expandedCats[cat.name];
          const isSelected = selectedCategory === cat.name;

          return (
            <li key={cat.name} className="category-item-container">
              <div 
                className={`category-item-row ${isSelected ? 'active' : ''}`}
                onClick={() => handleRowClick(cat)}
              >
                <span className="category-name">{cat.name}</span>
                {hasSubs && (
                  <button 
                    className={`expand-btn ${isExpanded ? 'rotated' : ''}`}
                    onClick={(e) => toggleExpand(cat.name, e)}
                    aria-label={isExpanded ? "Collapse subcategories" : "Expand subcategories"}
                  >
                    <ChevronDown size={16} />
                  </button>
                )}
              </div>

              {/* Subcategories list with slideDown animation */}
              {hasSubs && (
                <ul className={`subcategory-list ${isExpanded ? 'open' : ''}`}>
                  {cat.children!.map(sub => {
                    const isSubSelected = selectedCategory === sub.name;
                    return (
                      <li key={sub.id} className="subcategory-item-container">
                        <button
                          className={`subcategory-link ${isSubSelected ? 'active' : ''}`}
                          onClick={() => onSelectCategory(sub.name)}
                        >
                          <ChevronRight size={12} className="bullet-icon" />
                          <span>{sub.name}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
      </ul>

      <style>{`
        .sidebar-categories {
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-lg);
          padding: var(--space-4) 0;
          box-shadow: var(--shadow-sm);
          transition: all var(--transition-normal);
        }

        .sidebar-title {
          font-size: var(--font-size-base);
          font-weight: 700;
          color: var(--primary-color);
          padding: 0 var(--space-4) var(--space-3) var(--space-4);
          border-bottom: 2px solid var(--accent-color);
          margin-bottom: var(--space-3);
          display: flex;
          justify-content: space-between;
          align-items: center;
          user-select: none;
        }

        .sidebar-mobile-toggle-icon {
          display: flex;
          align-items: center;
          transition: transform var(--transition-normal);
          color: var(--text-muted);
        }

        @media (min-width: 992px) {
          .sidebar-mobile-toggle-icon {
            display: none;
          }
        }

        .category-list {
          display: none;
          flex-direction: column;
        }

        .category-list.mobile-open {
          display: flex;
        }

        @media (min-width: 992px) {
          .category-list {
            display: flex;
          }
        }

        @media (max-width: 991px) {
          .sidebar-categories {
            padding: var(--space-3) 0;
          }
          .sidebar-title {
            margin-bottom: 0;
            padding-bottom: 0;
            border-bottom: none;
          }
          .sidebar-title.expanded {
            margin-bottom: var(--space-3);
            padding-bottom: var(--space-3);
            border-bottom: 2px solid var(--accent-color);
          }
          .sidebar-mobile-toggle-icon.rotated {
            transform: rotate(180deg);
          }
        }

        .category-item-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-2) var(--space-4);
          cursor: pointer;
          font-weight: 600;
          font-size: var(--font-size-sm);
          color: var(--text-secondary);
          transition: all var(--transition-fast);
          user-select: none;
        }

        .category-item-row:hover {
          color: var(--primary-color);
          background-color: var(--bg-tertiary);
        }

        .category-item-row.active {
          color: var(--text-white);
          background-color: var(--primary-color);
        }

        .category-item-row.active .expand-btn {
          color: var(--text-white);
        }

        .expand-btn {
          color: var(--text-muted);
          transition: transform var(--transition-normal);
          padding: var(--space-1);
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .expand-btn:hover {
          background-color: rgba(0, 0, 0, 0.05);
        }

        .expand-btn.rotated {
          transform: rotate(180deg);
        }

        /* Subcategory drop downs */
        .subcategory-list {
          max-height: 0;
          overflow: hidden;
          opacity: 0;
          transition: max-height var(--transition-normal), opacity var(--transition-normal);
          background-color: var(--bg-primary);
        }

        .subcategory-list.open {
          max-height: 500px;
          opacity: 1;
        }

        .subcategory-link {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          width: 100%;
          text-align: left;
          padding: var(--space-2) var(--space-4) var(--space-2) var(--space-6);
          font-size: var(--font-size-xs);
          color: var(--text-secondary);
          transition: all var(--transition-fast);
        }

        .subcategory-link:hover {
          color: var(--primary-color);
          background-color: var(--border-light);
        }

        .subcategory-link.active {
          color: var(--accent-color);
          font-weight: 600;
        }

        .bullet-icon {
          color: var(--text-muted);
          flex-shrink: 0;
        }

        .subcategory-link.active .bullet-icon {
          color: var(--accent-color);
        }
      `}</style>
    </aside>
  );
};
