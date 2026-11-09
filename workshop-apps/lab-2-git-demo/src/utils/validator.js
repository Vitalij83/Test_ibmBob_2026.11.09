/**
 * validator.js
 * Validates that an object contains the required string fields: `id` and `name`.
 */

/**
 * Checks whether the given object contains the required string fields.
 * @param {object} obj - The object to validate.
 * @returns {{ valid: boolean, errors: string[] }} Result with a flag and a list of error messages.
 */
function validateSchema(obj) {
  const requiredFields = ['id', 'name'];
  const errors = [];

  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
    return { valid: false, errors: ['Input must be a plain object.'] };
  }

  for (const field of requiredFields) {
    if (!(field in obj)) {
      errors.push(`Missing required field: "${field}".`);
    } else if (typeof obj[field] !== 'string') {
      errors.push(`Field "${field}" must be a string, got ${typeof obj[field]}.`);
    } else if (obj[field].trim() === '') {
      errors.push(`Field "${field}" must not be an empty string.`);
    }
  }

  return { valid: errors.length === 0, errors };
}

module.exports = { validateSchema };
