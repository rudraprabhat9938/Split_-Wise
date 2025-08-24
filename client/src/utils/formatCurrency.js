/**
 * Format a number as INR currency
 * @param {number} amount - The amount to format
 * @returns {string} - Formatted amount with INR symbol
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2
  }).format(amount);
};

/**
 * Format a number as INR without the currency symbol
 * @param {number} amount - The amount to format
 * @returns {string} - Formatted amount without INR symbol
 */
export const formatNumberINR = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};