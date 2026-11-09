/**
 * calculator.js
 * Utility functions and a statistics tracker for the Lab 1 calculator app.
 */

/**
 * Adds two numbers together.
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
export function add(a, b) {
  return a + b;
}

/**
 * Subtracts b from a.
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
export function subtract(a, b) {
  return a - b;
}

/**
 * Multiplies two numbers together.
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
export function multiply(a, b) {
  return a * b;
}

/**
 * Divides a by b.
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
export function divide(a, b) {
  if (b === 0) throw new Error('Division by zero');
  return a / b;
}

/**
 * Tracks the count and history of calculator operations.
 */
export class StatsTracker {
  constructor() {
    this.counts = {};
    this.history = [];
  }

  /**
   * Records an operation by name with its operands and result.
   * @param {string} operation
   * @param {number} a
   * @param {number} b
   * @param {number} result
   */
  record(operation, a, b, result) {
    if (!this.counts[operation]) {
      this.counts[operation] = 0;
    }
    this.counts[operation]++;
    this.history.push({ operation, a, b, result });
  }

  /**
   * Returns the number of times a given operation was performed.
   * @param {string} operation
   * @returns {number}
   */
  getCount(operation) {
    return this.counts[operation] || 0;
  }

  /**
   * Returns a summary of all recorded operations.
   * @returns {{ counts: object, history: Array }}
   */
  getStats() {
    return {
      counts: { ...this.counts },
      history: [...this.history],
    };
  }
}
