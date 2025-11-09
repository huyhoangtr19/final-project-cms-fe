import { useState, useEffect } from 'react';
import i18n from '../../i18n';

const InputCurrency = ({
  value,
  onChange,
  name = '',
  placeholder = i18n.t('enter_amount'),
  currency = '$',
  className = '',
  disabled = false,
  maxValue = Number.MAX_SAFE_INTEGER,
  minValue = 0,
  allowNegative = false,
}) => {
  const [displayValue, setDisplayValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // Format number as currency
  const formatAsCurrency = (val) => {
    if (val === '' || val === null || isNaN(val)) return '';
    const numValue = parseFloat(val);
    return numValue.toLocaleString('de-DE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Parse string currency to numeric string
  const parseValue = (val) => {
    if (!val) return '';
    return val.replace(currency, '').replace(/\./g, '').replace(/,/g, '.');
  };

  // Update display value when external value changes (if not focused)
  useEffect(() => {
    if (!isFocused) {
      if (value !== undefined && value !== null && value !== '') {
        const parsed = parseFloat(value);
        if (!isNaN(parsed)) {
          setDisplayValue(formatAsCurrency(parsed));
        } else {
          setDisplayValue('');
        }
      } else {
        setDisplayValue('');
      }
    }
  }, [value, isFocused]);

  const handleChange = (e) => {
    const rawValue = e.target.value;

    if (rawValue === '' || rawValue === '.' || (allowNegative && rawValue === '-')) {
      setDisplayValue(rawValue);
      onChange('');
      return;
    }

    const processedValue = parseValue(rawValue);
    const numberRegex = allowNegative ? /^-?\d*\.?\d*$/ : /^\d*\.?\d*$/;

    if (!numberRegex.test(processedValue)) return;

    const numericValue = parseFloat(processedValue);

    if (!isNaN(numericValue)) {
      if (numericValue > maxValue || numericValue < minValue) return;
      setDisplayValue(rawValue);        // Keep what the user typed
      onChange(processedValue);         // Notify parent with clean value
    } else {
      setDisplayValue(rawValue);
      onChange(processedValue);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);

    const raw = parseValue(displayValue);
    const numeric = parseFloat(raw);

    if (!isNaN(numeric)) {
      const formatted = formatAsCurrency(numeric);
      setDisplayValue(formatted);
      onChange(numeric); // optional: round it once confirmed
    } else {
      setDisplayValue('');
      onChange('');
    }
  };

  const handleFocus = (e) => {
    setIsFocused(true);
    e.target.select();
  };

  return (
    <div
      className={`form-control input-color currency-input-wrapper ${className}`}
      style={{ backgroundColor: disabled ? '#F3F4F6' : '' }}
    >
      <div className={`relative flex items-center ${disabled ? 'bg-gray-500' : ''}`}>
        <input
          type="text"
          name={name}
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder}
          disabled={disabled}
          style={{ textAlign: 'right', width: '100%' }}
          className={`pl-6 pr-3 border-0 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-300 ${
            disabled ? 'bg-gray-600 text-gray-500' : ''
          }`}
        />
      </div>
    </div>
  );
};

export default InputCurrency;
