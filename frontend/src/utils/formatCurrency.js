/**
 * Formats a price in Indian Rupees (INR) with Indian number formatting.
 * 
 * Example:
 * 4550 -> ₹4,550
 * 125000 -> ₹1,25,000
 * 
 * @param {number|string} price - The price to format.
 * @returns {string} The formatted price string.
 */
export const formatINR = (price) => {
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;

    if (isNaN(numericPrice)) {
        return "₹0";
    }

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(numericPrice);
};
