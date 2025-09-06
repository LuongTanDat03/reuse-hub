import React, { useState } from 'react';
import PropTypes from 'prop-types';

const EditText = ({ 
  placeholder = '', 
  value = '', 
  onChange, 
  type = 'text',
  disabled = false,
  fullWidth = true,
  className = '',
  ...props 
}) => {
  const [inputValue, setInputValue] = useState(value);

  const handleChange = (e) => {
    setInputValue(e.target.value);
    if (onChange) {
      onChange(e);
    }
  };

  const baseClasses = 'font-be-vietnam text-base sm:text-lg md:text-xl lg:text-[22px] leading-6 sm:leading-7 md:leading-8 lg:leading-[33px] text-global-2 bg-edittext-1 border border-[#a7a6a6] rounded-[14px] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-global-4 focus:border-global-3';
  
  const inputClasses = `
    ${baseClasses}
    ${fullWidth ? 'w-full' : 'w-auto'}
    ${disabled ? 'cursor-not-allowed opacity-50' : ''}
    px-4 py-3 sm:px-5 sm:py-4 md:px-6 md:py-4 lg:px-[22px] lg:py-[16px]
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <input
      type={type}
      placeholder={placeholder}
      value={inputValue}
      onChange={handleChange}
      disabled={disabled}
      className={inputClasses}
      {...props}
    />
  );
};

EditText.propTypes = {
  placeholder: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  type: PropTypes.string,
  disabled: PropTypes.bool,
  fullWidth: PropTypes.bool,
  className: PropTypes.string,
};

export default EditText;