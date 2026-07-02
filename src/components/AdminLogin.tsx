import React, { useState } from 'react';
import { Lock, AlertTriangle, CheckCircle } from './icons';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onCancel: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onCancel }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);

  const validateField = (name: string, value: string): string => {
    if (!value.trim()) {
      return `${name === 'username' ? 'Tên đăng nhập' : 'Mật khẩu'} là bắt buộc`;
    }
    return '';
  };

  const handleBlur = (field: 'username' | 'password', value: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const err = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: err }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const uErr = validateField('username', username);
    const pErr = validateField('password', password);

    if (uErr || pErr) {
      setErrors({ username: uErr, password: pErr });
      setTouched({ username: true, password: true });
      return;
    }

    setIsSubmitting(true);

    // Simulate login verification
    setTimeout(() => {
      setIsSubmitting(false);
      if (username === 'admin' && password === 'admin123') {
        setLoginSuccess(true);
        setTimeout(() => {
          onLoginSuccess();
        }, 800);
      } else {
        setLoginError('Tên đăng nhập hoặc mật khẩu quản trị không chính xác.');
      }
    }, 1200);
  };

  return (
    <div className="admin-login-wrapper">
      <div className="login-card">
        <div className="login-header">
          <div className="lock-icon-container">
            <Lock size={24} />
          </div>
          <h2>Cổng Quản Trị MINAMI</h2>
          <p>Đăng nhập bằng tài khoản quản trị viên hệ thống.</p>
        </div>

        {loginError && (
          <div className="login-alert error animate-shake">
            <AlertTriangle size={16} />
            <span>{loginError}</span>
          </div>
        )}

        {loginSuccess && (
          <div className="login-alert success">
            <CheckCircle size={16} />
            <span>Đăng nhập thành công! Đang chuyển hướng...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="login-form">
          <div className="login-form-group">
            <label className="login-field-label">
              Tên đăng nhập <span className="required-asterisk">*</span>
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (touched.username) setErrors(prev => ({ ...prev, username: '' }));
              }}
              onBlur={() => handleBlur('username', username)}
              disabled={isSubmitting || loginSuccess}
              placeholder="Nhập tên đăng nhập"
              className={`login-input-field ${touched.username && errors.username ? 'state-error' : ''} ${touched.username && !errors.username && username ? 'state-success' : ''}`}
            />
            {touched.username && errors.username && (
              <span className="login-error-text"><AlertTriangle size={12} /> {errors.username}</span>
            )}
          </div>

          <div className="login-form-group">
            <label className="login-field-label">
              Mật khẩu <span className="required-asterisk">*</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (touched.password) setErrors(prev => ({ ...prev, password: '' }));
              }}
              onBlur={() => handleBlur('password', password)}
              disabled={isSubmitting || loginSuccess}
              placeholder="Nhập mật khẩu"
              className={`login-input-field ${touched.password && errors.password ? 'state-error' : ''} ${touched.password && !errors.password && password ? 'state-success' : ''}`}
            />
            {touched.password && errors.password && (
              <span className="login-error-text"><AlertTriangle size={12} /> {errors.password}</span>
            )}
          </div>

          <div className="login-actions-row">
            <button
              type="button"
              className="btn btn-outline login-btn-cancel"
              disabled={isSubmitting || loginSuccess}
              onClick={onCancel}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="btn btn-primary login-btn-submit"
              disabled={isSubmitting || loginSuccess}
            >
              {isSubmitting ? 'Đang xác minh...' : 'Đăng Nhập'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .admin-login-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          padding: var(--space-8) var(--space-4);
          background-color: var(--bg-primary);
          width: 100%;
        }

        .login-card {
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-lg);
          padding: var(--space-8);
          max-width: 400px;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: stretch;
        }

        .login-header {
          text-align: center;
          margin-bottom: var(--space-6);
        }

        .lock-icon-container {
          background-color: rgba(10, 59, 124, 0.08);
          color: var(--primary-color);
          width: 56px;
          height: 56px;
          border-radius: var(--radius-round);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto var(--space-3) auto;
        }

        .login-header h2 {
          color: var(--primary-color);
          font-size: var(--font-size-md);
          font-weight: 700;
          margin-bottom: var(--space-1);
        }

        .login-header p {
          font-size: var(--font-size-xs);
          color: var(--text-secondary);
        }

        .login-alert {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-2) var(--space-3);
          border-radius: var(--radius-md);
          margin-bottom: var(--space-4);
          font-size: var(--font-size-xs);
          font-weight: 500;
        }

        .login-alert.error {
          background-color: var(--color-error-bg);
          color: var(--color-error);
          border: 1px solid rgba(229, 62, 62, 0.15);
        }

        .login-alert.success {
          background-color: var(--color-success-bg);
          color: var(--color-success);
          border: 1px solid rgba(56, 161, 105, 0.15);
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
          width: 100%;
        }

        /* Enforced Vertical Alignment */
        .login-form-group {
          display: flex !important;
          flex-direction: column !important;
          align-items: stretch !important;
          justify-content: flex-start !important;
          width: 100% !important;
          gap: 6px !important;
          text-align: left !important;
        }

        .login-field-label {
          display: block !important;
          width: 100% !important;
          text-align: left !important;
          font-size: var(--font-size-sm) !important;
          font-weight: 600 !important;
          color: var(--text-primary) !important;
          margin: 0 !important;
          padding: 0 !important;
        }

        .login-input-field {
          width: 100% !important;
          padding: 10px 12px !important;
          font-size: var(--font-size-sm) !important;
          border-radius: var(--radius-md) !important;
          border: 1px solid var(--border-medium) !important;
          background-color: var(--bg-secondary) !important;
          color: var(--text-primary) !important;
          outline: none !important;
          box-sizing: border-box !important;
          transition: all var(--transition-fast) !important;
        }

        .login-input-field:focus {
          border-color: var(--primary-color) !important;
          box-shadow: 0 0 0 3px rgba(10, 59, 124, 0.15) !important;
        }

        .login-input-field.state-error {
          border-color: var(--color-error) !important;
          background-color: var(--color-error-bg) !important;
        }

        .login-input-field.state-success {
          border-color: var(--color-success) !important;
          background-color: var(--color-success-bg) !important;
        }

        .login-error-text {
          font-size: var(--font-size-xs);
          color: var(--color-error);
          display: flex;
          align-items: center;
          gap: 4px;
          font-weight: 500;
          text-align: left;
        }

        .login-actions-row {
          display: flex;
          gap: var(--space-3);
          margin-top: var(--space-2);
          width: 100%;
        }

        .login-btn-cancel,
        .login-btn-submit {
          flex: 1;
          padding: 10px var(--space-3);
          font-size: var(--font-size-sm);
        }

        .animate-shake {
          animation: shake 300ms ease-in-out;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
};
