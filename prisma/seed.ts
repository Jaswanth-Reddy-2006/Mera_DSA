import { PrismaClient } from '../generated/prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

async function seed() {
  const url = process.env.DATABASE_URL || 'file:./dev.db';
  const adapter = new PrismaBetterSqlite3({ url });
  const prisma = new PrismaClient({ adapter });

  console.log('Seeding initial problems...');

  // Check if problems already exist
  const count = await prisma.problem.count();
  if (count > 0) {
    console.log('Database already has problems. Skipping seed.');
    return;
  }

  // 1. Two Sum
  await prisma.problem.create({
    data: {
      title: 'Two Sum',
      platform: 'LeetCode',
      problemUrl: 'https://leetcode.com/problems/two-sum/',
      difficulty: 'Easy',
      topic: 'HashMap',
      subtopic: 'Frequency Counting',
      pattern: 'Lookup Table',
      status: 'Solved',
      rating: 7,
      timeTakenMinutes: 15,
      mistakes: 'Forgot unordered_map syntax; off-by-one in loop condition',
      notes: '### Key Observation\nInstead of checking all pairs O(N^2), iterate once and check if `complement = target - nums[i]` exists in our hash map.',
      dryRun: '1. nums = [2, 7, 11, 15], target = 9\n2. i = 0, val = 2, complement = 7 (not in map) -> map[2] = 0\n3. i = 1, val = 7, complement = 2 (in map at index 0!) -> return {0, 1}',
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(N)',
      interviewTips: 'Interviewer follow-up: What if array is sorted? Use Two Pointers for O(1) space!',
      isFavorite: true,
      revisionCount: 3,
      solutions: {
        create: [
          {
            type: 'BRUTE',
            language: 'cpp',
            code: `class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        int n = nums.size();\n        for (int i = 0; i < n; ++i) {\n            for (int j = i + 1; j < n; ++j) {\n                if (nums[i] + nums[j] == target) return {i, j};\n            }\n        }\n        return {};\n    }\n};`,
          },
          {
            type: 'OPTIMAL',
            language: 'cpp',
            code: `class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        unordered_map<int, int> mp;\n        for (int i = 0; i < nums.size(); ++i) {\n            int complement = target - nums[i];\n            if (mp.count(complement)) {\n                return {mp[complement], i};\n            }\n            mp[nums[i]] = i;\n        }\n        return {};\n    }\n};`,
          },
        ],
      },
    },
  });

  // 2. 3Sum
  await prisma.problem.create({
    data: {
      title: '3Sum',
      platform: 'LeetCode',
      problemUrl: 'https://leetcode.com/problems/3sum/',
      difficulty: 'Medium',
      topic: 'Two Pointers',
      subtopic: 'Sorting & Shrinking Window',
      pattern: 'Two Pointers after Sort',
      status: 'Solved',
      rating: 9,
      timeTakenMinutes: 30,
      mistakes: 'Forgot to skip duplicate elements for both i and left/right pointers!',
      notes: '### Key Idea\nSort the array first. Fix index `i`, then use standard left and right two-pointer convergence to find pairs summing to `-nums[i]`.',
      dryRun: '1. Sort nums: [-4, -1, -1, 0, 1, 2]\n2. i = 0 (val = -4): find pairs summing to +4\n3. i = 1 (val = -1): find pairs summing to +1 -> (-1, 0, 1), (-1, -1, 2)',
      timeComplexity: 'O(N^2)',
      spaceComplexity: 'O(1) auxiliary (excluding output array)',
      interviewTips: 'Follow-up: 4Sum can be solved similarly in O(N^3) or generalized k-Sum via recursion.',
      isFavorite: true,
      revisionCount: 2,
      solutions: {
        create: [
          {
            type: 'OPTIMAL',
            language: 'cpp',
            code: `class Solution {\npublic:\n    vector<vector<int>> threeSum(vector<int>& nums) {\n        sort(nums.begin(), nums.end());\n        vector<vector<int>> res;\n        int n = nums.size();\n        for (int i = 0; i < n - 2; ++i) {\n            if (i > 0 && nums[i] == nums[i - 1]) continue;\n            int left = i + 1, right = n - 1;\n            while (left < right) {\n                int sum = nums[i] + nums[left] + nums[right];\n                if (sum == 0) {\n                    res.push_back({nums[i], nums[left], nums[right]});\n                    while (left < right && nums[left] == nums[left + 1]) left++;\n                    while (left < right && nums[right] == nums[right - 1]) right--;\n                    left++; right--;\n                } else if (sum < 0) {\n                    left++;\n                } else {\n                    right--;\n                }\n            }\n        }\n        return res;\n    }\n};`,
          },
        ],
      },
    },
  });

  // 3. Trapping Rain Water
  await prisma.problem.create({
    data: {
      title: 'Trapping Rain Water',
      platform: 'LeetCode',
      problemUrl: 'https://leetcode.com/problems/trapping-rain-water/',
      difficulty: 'Hard',
      topic: 'Two Pointers',
      subtopic: 'Monotonic Stack / Two Pointers',
      pattern: 'Min of Max-Left and Max-Right',
      status: 'Solved',
      rating: 10,
      timeTakenMinutes: 45,
      mistakes: 'Confused maxLeft update condition; off by one in boundary calculation',
      notes: '### Trapping Condition\nWater trapped above index `i` is `min(maxLeft, maxRight) - height[i]`. Two pointers allow computing this in O(1) space!',
      dryRun: 'left = 0, right = n - 1\nTrack leftMax and rightMax.\nIf leftMax < rightMax: move left inward and accumulate trapped water.',
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(1)',
      interviewTips: 'Can also be solved using Monotonic Decreasing Stack in O(N) time and space.',
      isFavorite: true,
      revisionCount: 1,
      solutions: {
        create: [
          {
            type: 'OPTIMAL',
            language: 'cpp',
            code: `class Solution {\npublic:\n    int trap(vector<int>& height) {\n        int left = 0, right = height.size() - 1;\n        int leftMax = 0, rightMax = 0, water = 0;\n        while (left < right) {\n            if (height[left] <= height[right]) {\n                if (height[left] >= leftMax) leftMax = height[left];\n                else water += leftMax - height[left];\n                left++;\n            } else {\n                if (height[right] >= rightMax) rightMax = height[right];\n                else water += rightMax - height[right];\n                right--;\n            }\n        }\n        return water;\n    }\n};`,
          },
        ],
      },
    },
  });

  console.log('Seeding completed successfully!');
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
});
