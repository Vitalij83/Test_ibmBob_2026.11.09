/**
 * app.js
 * Demonstrates the use of StatsTracker with add and multiply operations.
 */

const { add, multiply, StatsTracker } = require('./utils/calculator');

const tracker = new StatsTracker();

// Perform 3 additions
tracker.record('add', 2, 3, add(2, 3));
tracker.record('add', 10, 5, add(10, 5));
tracker.record('add', 7, 8, add(7, 8));

// Perform 2 multiplications
tracker.record('multiply', 4, 5, multiply(4, 5));
tracker.record('multiply', 3, 6, multiply(3, 6));

// Log the summary
const stats = tracker.getStats();
console.log('Operation summary:');
console.log(`  add      x${stats.counts.add}`);
console.log(`  multiply x${stats.counts.multiply}`);
console.log('\nFull history:');
stats.history.forEach(({ operation, a, b, result }) => {
  console.log(`  ${operation}(${a}, ${b}) = ${result}`);
});
