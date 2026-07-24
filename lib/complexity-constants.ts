export const TIME_COMPLEXITY_OPTIONS = [
  { value: 'O(1)', label: 'O(1) - Constant Time' },
  { value: 'O(log N)', label: 'O(log N) - Logarithmic Time' },
  { value: 'O(√N)', label: 'O(√N) - Square Root Time' },
  { value: 'O(N)', label: 'O(N) - Linear Time' },
  { value: 'O(N log N)', label: 'O(N log N) - Linearithmic Time (Sorting)' },
  { value: 'O(N^2)', label: 'O(N^2) - Quadratic Time (Nested Loops)' },
  { value: 'O(N^3)', label: 'O(N^3) - Cubic Time (Triple Loops)' },
  { value: 'O(2^N)', label: 'O(2^N) - Exponential Time (Subsets/Recursion)' },
  { value: 'O(N!)', label: 'O(N!) - Factorial Time (Permutations)' },
];

export const SPACE_COMPLEXITY_OPTIONS = [
  { value: 'O(1)', label: 'O(1) - Constant Space (No Extra Memory)' },
  { value: 'O(log N)', label: 'O(log N) - Logarithmic Space (Recursion Call Stack)' },
  { value: 'O(N)', label: 'O(N) - Linear Space (Hash Table / Auxiliary Array)' },
  { value: 'O(N log N)', label: 'O(N log N) - Auxiliary Sorting Memory' },
  { value: 'O(N^2)', label: 'O(N^2) - Quadratic Space (2D Grid / Matrix)' },
  { value: 'O(2^N)', label: 'O(2^N) - Exponential Recursion Space' },
];
