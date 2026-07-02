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

  const toggleExpand = (catName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedCats(prev => ({
      ...prev,
      [catName]: !prev[catName]
    }));
  };

  return (
    <aside className="sidebar-categories">
      <h2 className="sidebar-title">Danh Mục Sản Phẩm</h2>
      <ul className="category-list">
        {categories.map(cat => {
          const hasSubs = !!cat.subcategories && cat.subcategories.length > 0;
          const isExpanded = !!expandedCats[cat.name];
          const isSelected = selectedCategory === cat.name;

          return (
            <li key={cat.name} className="category-item-container">
              <div 
                className={`category-item-row ${isSelected ? 'active' : ''}`}
                onClick={() => onSelectCategory(cat.name)}
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
                  {cat.subcategories!.map(sub => {
                    const isSubSelected = selectedCategory === sub;
                    return (
                      <li key={sub} className="subcategory-item-container">
                        <button
                          className={`subcategory-link ${isSubSelected ? 'active' : ''}`}
                          onClick={() => onSelectCategory(sub)}
                        >
                          <ChevronRight size={12} className="bullet-icon" />
                          <span>{sub}</span>
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
        }

        .sidebar-title {
          font-size: var(--font-size-base);
          font-weight: 700;
          color: var(--primary-color);
          padding: 0 var(--space-4) var(--space-3) var(--space-4);
          border-bottom: 2px solid var(--accent-color);
          margin-bottom: var(--space-3);
        }

        .category-list {
          display: flex;
          flex-direction: column;
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
