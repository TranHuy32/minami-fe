import React, { useState } from 'react';
import { Mail, CheckCircle, AlertTriangle } from './icons';
import { API_BASE_URL } from '../config';

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
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isDisabled] = useState(false);

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'fullName':
        if (!value.trim()) return 'Họ và tên là bắt buộc';
        if (value.trim().length < 3) return 'Họ và tên phải có ít nhất 3 ký tự';
        return '';
      case 'email':
        if (!value.trim()) {
          if (!formData.phone.trim()) return 'Vui lòng nhập Email hoặc Số điện thoại';
          return '';
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return 'Định dạng email không hợp lệ';
        return '';
      case 'phone':
        if (!value.trim()) {
          if (!formData.email.trim()) return 'Vui lòng nhập Email hoặc Số điện thoại';
          return '';
        }
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
    const nextFormData = { ...formData, [name]: value };
    setFormData(nextFormData);

    if (touched[name]) {
      let fieldError = '';
      if (name === 'fullName') {
        if (!value.trim()) fieldError = 'Họ và tên là bắt buộc';
        else if (value.trim().length < 3) fieldError = 'Họ và tên phải có ít nhất 3 ký tự';
      } else if (name === 'message') {
        if (!value.trim()) fieldError = 'Nội dung tin nhắn yêu cầu là bắt buộc';
      } else if (name === 'email') {
        if (!value.trim()) {
          if (!nextFormData.phone.trim()) fieldError = 'Vui lòng nhập Email hoặc Số điện thoại';
        } else {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) fieldError = 'Định dạng email không hợp lệ';
        }
      } else if (name === 'phone') {
        if (!value.trim()) {
          if (!nextFormData.email.trim()) fieldError = 'Vui lòng nhập Email hoặc Số điện thoại';
        } else {
          const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;
          if (!phoneRegex.test(value)) fieldError = 'Số điện thoại Việt Nam không hợp lệ';
        }
      }

      setErrors(prev => {
        const nextErrors = { ...prev, [name]: fieldError };
        if (name === 'email' && value.trim()) {
          if (nextErrors.phone === 'Vui lòng nhập Email hoặc Số điện thoại') {
            nextErrors.phone = '';
          }
        }
        if (name === 'phone' && value.trim()) {
          if (nextErrors.email === 'Vui lòng nhập Email hoặc Số điện thoại') {
            nextErrors.email = '';
          }
        }
        return nextErrors;
      });
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    let fieldError = '';
    if (name === 'fullName') {
      if (!value.trim()) fieldError = 'Họ và tên là bắt buộc';
      else if (value.trim().length < 3) fieldError = 'Họ và tên phải có ít nhất 3 ký tự';
    } else if (name === 'message') {
      if (!value.trim()) fieldError = 'Nội dung tin nhắn yêu cầu là bắt buộc';
    } else if (name === 'email') {
      if (!value.trim()) {
        if (!formData.phone.trim()) fieldError = 'Vui lòng nhập Email hoặc Số điện thoại';
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) fieldError = 'Định dạng email không hợp lệ';
      }
    } else if (name === 'phone') {
      if (!value.trim()) {
        if (!formData.email.trim()) fieldError = 'Vui lòng nhập Email hoặc Số điện thoại';
      } else {
        const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;
        if (!phoneRegex.test(value)) fieldError = 'Số điện thoại Việt Nam không hợp lệ';
      }
    }

    setErrors(prev => {
      const nextErrors = { ...prev, [name]: fieldError };
      if (name === 'email' && value.trim()) {
        if (nextErrors.phone === 'Vui lòng nhập Email hoặc Số điện thoại') {
          nextErrors.phone = '';
        }
      }
      if (name === 'phone' && value.trim()) {
        if (nextErrors.email === 'Vui lòng nhập Email hoặc Số điện thoại') {
          nextErrors.email = '';
        }
      }
      return nextErrors;
    });
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
    setSubmitError(null);

    fetch(`${API_BASE_URL}/api/v1/telegram/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        full_name: formData.fullName,
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        company: formData.company.trim() || undefined,
        message: formData.message
      })
    })
      .then(async (res) => {
        setIsSubmitting(false);
        if (res.ok) {
          setSubmitSuccess(true);
          setFormData({
            fullName: '',
            email: '',
            phone: '',
            company: '',
            message: '',
          });
          setTouched({});
          setTimeout(() => setSubmitSuccess(false), 5000);
        } else {
          let errorMsg = 'Gửi yêu cầu thất bại. Vui lòng thử lại sau.';
          try {
            const data = await res.json();
            if (data.message) errorMsg = data.message;
          } catch (e) {}
          setSubmitError(errorMsg);
        }
      })
      .catch(err => {
        setIsSubmitting(false);
        console.error('Error submitting inquiry:', err);
        setSubmitError('Lỗi kết nối tới máy chủ. Vui lòng kiểm tra lại mạng của bạn.');
      });
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

      {submitError && (
        <div className="submit-error-alert" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 16px',
          backgroundColor: '#fee2e2',
          border: '1px solid #fca5a5',
          borderRadius: '8px',
          color: '#b91c1c',
          fontSize: '14px',
          marginBottom: '20px'
        }}>
          <span>⚠️ {submitError}</span>
        </div>
      )}

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
              placeholder=""
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
