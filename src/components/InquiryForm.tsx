import React, { useState } from 'react';
import { Mail, CheckCircle, AlertTriangle } from './icons';

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  company: string;
  message: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  message?: string;
  [key: string]: string | undefined;
}

export const InquiryForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    message: '',
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'fullName':
        if (!value.trim()) return 'Họ và tên là bắt buộc';
        if (value.trim().length < 3) return 'Họ và tên phải có ít nhất 3 ký tự';
        return '';
      case 'email':
        if (!value.trim()) return 'Email liên hệ là bắt buộc';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return 'Định dạng email không hợp lệ';
        return '';
      case 'phone':
        if (!value.trim()) return 'Số điện thoại là bắt buộc';
        const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;
        if (!phoneRegex.test(value)) return 'Số điện thoại Việt Nam không hợp lệ';
        return '';
      case 'message':
        if (!value.trim()) return 'Nội dung tin nhắn yêu cầu là bắt buộc';
        return '';
      default:
        return '';
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (touched[name]) {
      const fieldError = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: fieldError }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const fieldError = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: fieldError }));
  };

  const getValidationState = (name: keyof FormData) => {
    if (!touched[name]) return 'default';
    if (errors[name]) return 'error';
    if (formData[name] && !errors[name]) return 'success';
    return 'default';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors: FormErrors = {};
    Object.keys(formData).forEach(key => {
      const field = key as keyof FormData;
      if (field !== 'company') { // company is optional
        const error = validateField(field, formData[field]);
        if (error) newErrors[field] = error;
      }
    });

    setErrors(newErrors);
    setTouched({
      fullName: true,
      email: true,
      phone: true,
      message: true
    });

    if (Object.keys(newErrors).length > 0) return;

    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        company: '',
        message: '',
      });
      setTouched({});
      
      // Auto clear success notice
      setTimeout(() => setSubmitSuccess(false), 5000);
    }, 1500);
  };

  return (
    <div className="inquiry-form-container">
      <div className="form-header">
        <Mail size={24} className="mail-header-icon" />
        <div>
          <h3>Gửi Yêu Cầu Báo Giá / Tư Vấn</h3>
          <p>Điền thông tin của bạn bên dưới để nhận được thông tin chi tiết nhanh nhất từ MINAMI.</p>
        </div>
      </div>

      <div className="demo-control-bar">
        <label className="checkbox-label">
          <input 
            type="checkbox" 
            checked={isDisabled} 
            onChange={(e) => setIsDisabled(e.target.checked)} 
          />
          Vô hiệu hóa form (Test Disabled State)
        </label>
      </div>

      {submitSuccess && (
        <div className="submit-success-alert">
          <CheckCircle size={20} />
          <span>Gửi yêu cầu thành công! Chúng tôi sẽ liên hệ lại trong vòng 2 giờ làm việc.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {/* Full Name */}
        <div className="form-group">
          <label htmlFor="fullName" className="field-label">
            Họ và tên <span className="required-asterisk">*</span>
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={isDisabled || isSubmitting}
            placeholder="Nhập họ và tên của bạn..."
            className={`form-input state-${getValidationState('fullName')}`}
          />
          {getValidationState('fullName') === 'error' && (
            <span className="error-message"><AlertTriangle size={14} /> {errors.fullName}</span>
          )}
          {getValidationState('fullName') === 'success' && (
            <span className="success-message">Họ tên hợp lệ</span>
          )}
        </div>

        <div className="form-row">
          {/* Email */}
          <div className="form-group">
            <label htmlFor="email" className="field-label">
              Địa chỉ Email <span className="required-asterisk">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isDisabled || isSubmitting}
              placeholder="example@company.com"
              className={`form-input state-${getValidationState('email')}`}
            />
            {getValidationState('email') === 'error' && (
              <span className="error-message"><AlertTriangle size={14} /> {errors.email}</span>
            )}
            {getValidationState('email') === 'success' && (
              <span className="success-message">Email hợp lệ</span>
            )}
          </div>

          {/* Phone */}
          <div className="form-group">
            <label htmlFor="phone" className="field-label">
              Số điện thoại <span className="required-asterisk">*</span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isDisabled || isSubmitting}
              placeholder="0968 045 604"
              className={`form-input state-${getValidationState('phone')}`}
            />
            {getValidationState('phone') === 'error' && (
              <span className="error-message"><AlertTriangle size={14} /> {errors.phone}</span>
            )}
            {getValidationState('phone') === 'success' && (
              <span className="success-message">Số điện thoại hợp lệ</span>
            )}
          </div>
        </div>

        {/* Company (Optional) */}
        <div className="form-group">
          <label htmlFor="company" className="field-label">
            Tên công ty / Doanh nghiệp
          </label>
          <input
            type="text"
            id="company"
            name="company"
            value={formData.company}
            onChange={handleChange}
            disabled={isDisabled || isSubmitting}
            placeholder="Công ty cổ phần MINAMI Việt Nam..."
            className="form-input"
          />
        </div>

        {/* Message */}
        <div className="form-group">
          <label htmlFor="message" className="field-label">
            Nội dung yêu cầu báo giá <span className="required-asterisk">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            rows={4}
            value={formData.message}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={isDisabled || isSubmitting}
            placeholder="Vui lòng cung cấp mã sản phẩm, số lượng và các yêu cầu kỹ thuật chi tiết khác..."
            className={`form-input state-${getValidationState('message')}`}
          />
          {getValidationState('message') === 'error' && (
            <span className="error-message"><AlertTriangle size={14} /> {errors.message}</span>
          )}
        </div>

        {/* Action Button */}
        <button
          type="submit"
          className="btn btn-primary form-submit-btn"
          disabled={isDisabled || isSubmitting}
        >
          {isSubmitting ? 'Đang gửi thông tin...' : 'Gửi Yêu Cầu Ngay'}
        </button>
      </form>

      <style>{`
        .inquiry-form-container {
          background-color: var(--bg-secondary);
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-light);
          padding: var(--space-6);
          box-shadow: var(--shadow-sm);
        }

        .form-header {
          display: flex;
          gap: var(--space-3);
          margin-bottom: var(--space-5);
          align-items: flex-start;
        }

        .mail-header-icon {
          color: var(--accent-color);
          margin-top: 2px;
        }

        .form-header h3 {
          font-size: var(--font-size-md);
          color: var(--primary-color);
          margin-bottom: var(--space-1);
        }

        .form-header p {
          font-size: var(--font-size-sm);
          color: var(--text-secondary);
        }

        .demo-control-bar {
          background-color: var(--bg-primary);
          padding: var(--space-2) var(--space-4);
          border-radius: var(--radius-md);
          margin-bottom: var(--space-5);
          border: 1px dashed var(--border-medium);
        }

        .checkbox-label {
          font-size: var(--font-size-xs);
          font-weight: 500;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: var(--space-2);
          cursor: pointer;
        }

        .submit-success-alert {
          background-color: var(--color-success-bg);
          color: var(--color-success);
          border: 1px solid rgba(56, 161, 105, 0.2);
          padding: var(--space-3) var(--space-4);
          border-radius: var(--radius-md);
          margin-bottom: var(--space-5);
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: var(--font-size-sm);
          font-weight: 500;
          animation: slideDown 250ms ease-out forwards;
        }

        .form-group {
          margin-bottom: var(--space-4);
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-row {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        @media (min-width: 768px) {
          .form-row {
            flex-direction: row;
          }
          .form-row .form-group {
            flex: 1;
          }
        }

        .field-label {
          font-size: var(--font-size-sm);
          font-weight: 600;
          color: var(--text-primary);
        }

        .required-asterisk {
          color: var(--color-error);
        }

        .form-input {
          width: 100%;
          padding: 10px 12px;
          font-size: var(--font-size-sm);
          border-radius: var(--radius-md);
          border: 1px solid var(--border-medium);
          background-color: var(--bg-secondary);
          color: var(--text-primary);
          outline: none;
          transition: all var(--transition-fast);
        }

        .form-input::placeholder {
          color: var(--text-muted);
        }

        /* Default Focus state */
        .form-input:focus {
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(10, 59, 124, 0.15);
        }

        /* Input states validation */
        .form-input.state-error {
          border-color: var(--color-error);
          background-color: var(--color-error-bg);
        }

        .form-input.state-error:focus {
          box-shadow: 0 0 0 3px rgba(229, 62, 98, 0.15);
        }

        .form-input.state-success {
          border-color: var(--color-success);
          background-color: var(--color-success-bg);
        }

        .form-input.state-success:focus {
          box-shadow: 0 0 0 3px rgba(56, 161, 105, 0.15);
        }

        /* Disabled state */
        .form-input:disabled {
          background-color: var(--bg-tertiary);
          color: var(--text-muted);
          border-color: var(--border-light);
          cursor: not-allowed;
        }

        .error-message {
          font-size: var(--font-size-xs);
          color: var(--color-error);
          display: flex;
          align-items: center;
          gap: var(--space-1);
          font-weight: 500;
        }

        .success-message {
          font-size: var(--font-size-xs);
          color: var(--color-success);
          font-weight: 500;
        }

        .form-submit-btn {
          width: 100%;
          padding: var(--space-3) var(--space-4);
          font-size: var(--font-size-base);
          margin-top: var(--space-2);
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};
