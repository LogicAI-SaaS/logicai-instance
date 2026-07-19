import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle, AlertCircle, Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'email' | 'select' | 'checkbox' | 'radio' | 'tel' | 'url' | 'date';
  required: boolean;
  options?: string[] | Array<{ label: string; value: string }>;
  defaultValue?: any;
  placeholder?: string;
  description?: string;
  min?: number;
  max?: number;
  pattern?: string;
}

interface FormDefinition {
  formId: string;
  workflowId?: string;
  title: string;
  description: string;
  fields: FormField[];
  submitButtonText: string;
  responseMessage: string;
  redirectUrl?: string;
  allowMultipleSubmissions: boolean;
  captchaEnabled: boolean;
}

export function FormSubmissionPage() {
  const { formId } = useParams<{ formId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [form, setForm] = useState<FormDefinition | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!formId) return;

    const fetchForm = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/forms/${formId}`);

        if (response.data.success) {
          const formDef = response.data.data;
          setForm(formDef);

          // Initialize form data with default values
          const initialData: Record<string, any> = {};
          formDef.fields.forEach((field: FormField) => {
            if (field.defaultValue !== undefined) {
              initialData[field.name] = field.defaultValue;
            } else if (field.type === 'checkbox') {
              initialData[field.name] = false;
            }
          });
          setFormData(initialData);
        } else {
          setError(t('form.notFound'));
        }
      } catch (err: any) {
        setError(err.response?.data?.error || t('form.loadFailed'));
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [formId]);

  const validateField = (field: FormField, value: any): string | null => {
    if (field.required && !value) {
      return t('form.fieldRequired', { label: field.label });
    }

    if (field.type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return t('form.invalidEmail');
      }
    }

    if (field.type === 'url' && value) {
      try {
        new URL(value);
      } catch {
        return t('form.invalidUrl');
      }
    }

    if (field.type === 'number' && value) {
      if (field.min !== undefined && value < field.min) {
        return t('form.minValue', { min: field.min });
      }
      if (field.max !== undefined && value > field.max) {
        return t('form.maxValue', { max: field.max });
      }
    }

    if (field.pattern && value) {
      const regex = new RegExp(field.pattern);
      if (!regex.test(value)) {
        return t('form.invalidFormat');
      }
    }

    return null;
  };

  const handleFieldChange = (field: FormField, value: any) => {
    setFormData((prev) => ({ ...prev, [field.name]: value }));

    // Clear validation error for this field
    if (validationErrors[field.name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field.name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form) return;

    // Validate all fields
    const errors: Record<string, string> = {};
    form.fields.forEach((field) => {
      const error = validateField(field, formData[field.name]);
      if (error) {
        errors[field.name] = error;
      }
    });

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const response = await axios.post(`/api/forms/${formId}/submit`, formData);

      if (response.data.success) {
        setSubmitted(true);

        // Redirect if configured
        if (response.data.redirectUrl) {
          setTimeout(() => {
            window.location.href = response.data.redirectUrl;
          }, 2000);
        }
      } else {
        setError(response.data.error || t('form.submitFailed'));
      }
    } catch (err: any) {
      setError(err.response?.data?.error || t('form.submitFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field: FormField) => {
    const hasError = !!validationErrors[field.name];
    const errorClass = hasError ? 'border-red-500 focus:ring-red-500' : 'border-gray-700 focus:ring-brand-blue';
    const baseClass = `w-full px-4 py-2 bg-gray-800 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 ${errorClass}`;

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            name={field.name}
            value={formData[field.name] || ''}
            onChange={(e) => handleFieldChange(field, e.target.value)}
            placeholder={field.placeholder || field.label}
            required={field.required}
            rows={4}
            className={baseClass}
          />
        );

      case 'select':
        return (
          <select
            name={field.name}
            value={formData[field.name] || ''}
            onChange={(e) => handleFieldChange(field, e.target.value)}
            required={field.required}
            className={baseClass}
          >
            <option value="">{t('form.selectPlaceholder', { label: field.label })}</option>
            {field.options?.map((option) => {
              const optionValue = typeof option === 'string' ? option : option.value;
              const optionLabel = typeof option === 'string' ? option : option.label;
              return (
                <option key={optionValue} value={optionValue}>
                  {optionLabel}
                </option>
              );
            })}
          </select>
        );

      case 'checkbox':
        return (
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              name={field.name}
              checked={formData[field.name] || false}
              onChange={(e) => handleFieldChange(field, e.target.checked)}
              required={field.required}
              className="w-5 h-5 text-brand-blue bg-gray-800 border-gray-700 rounded focus:ring-brand-blue"
            />
            <span className="text-gray-300">{field.placeholder || field.label}</span>
          </label>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option) => {
              const optionValue = typeof option === 'string' ? option : option.value;
              const optionLabel = typeof option === 'string' ? option : option.label;
              return (
                <label key={optionValue} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name={field.name}
                    value={optionValue}
                    checked={formData[field.name] === optionValue}
                    onChange={(e) => handleFieldChange(field, e.target.value)}
                    required={field.required}
                    className="w-5 h-5 text-brand-blue bg-gray-800 border-gray-700 focus:ring-brand-blue"
                  />
                  <span className="text-gray-300">{optionLabel}</span>
                </label>
              );
            })}
          </div>
        );

      default:
        return (
          <input
            type={field.type}
            name={field.name}
            value={formData[field.name] || ''}
            onChange={(e) => handleFieldChange(field, e.target.value)}
            placeholder={field.placeholder || field.label}
            required={field.required}
            min={field.min}
            max={field.max}
            pattern={field.pattern}
            className={baseClass}
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-brand-blue animate-spin mx-auto mb-4" />
          <p className="text-gray-400">{t('form.loading')}</p>
        </div>
      </div>
    );
  }

  if (error && !form) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-800 border border-red-500 rounded-lg p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">{t('form.notFoundTitle')}</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-brand-blue hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            {t('form.goHome')}
          </button>
        </div>
      </div>
    );
  }

  if (!form) return null;

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-800 border border-green-500 rounded-lg p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">{t('form.successTitle')}</h2>
          <p className="text-gray-300 mb-6">{form.responseMessage}</p>
          {form.redirectUrl && (
            <p className="text-sm text-gray-500">{t('form.redirecting')}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-brand-blue to-blue-600 p-8 text-center">
            <h1 className="text-3xl font-bold text-white mb-2">{form.title}</h1>
            {form.description && (
              <p className="text-blue-100">{form.description}</p>
            )}
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {form.fields.map((field) => (
              <div key={field.name} className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>

                {field.description && (
                  <p className="text-xs text-gray-500 mb-2">{field.description}</p>
                )}

                {renderField(field)}

                {validationErrors[field.name] && (
                  <p className="text-sm text-red-500">{validationErrors[field.name]}</p>
                )}
              </div>
            ))}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-6 bg-brand-blue hover:bg-blue-600 text-white font-medium rounded-lg transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{t('form.submitting')}</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>{form.submitButtonText}</span>
                </>
              )}
            </button>

            <p className="text-xs text-gray-500 text-center">
              {t('form.poweredBy')}
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
