export function parseProblemUrl(url: string): {
  title: string;
  platform: string;
  topic: string;
  categories: string[];
} {
  let title = '';
  let platform = 'LeetCode';
  let topic = 'Arrays';
  let categories: string[] = ['Arrays'];

  if (!url || !url.trim()) return { title, platform, topic, categories };

  try {
    let cleanUrl = url.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = 'https://' + cleanUrl;
    }

    const parsed = new URL(cleanUrl);
    const host = parsed.hostname.toLowerCase();
    const pathname = parsed.pathname;

    // Detect Platform
    if (host.includes('leetcode')) platform = 'LeetCode';
    else if (host.includes('codeforces')) platform = 'Codeforces';
    else if (host.includes('codechef')) platform = 'CodeChef';
    else if (host.includes('geeksforgeeks')) platform = 'GFG';
    else if (host.includes('hackerrank')) platform = 'HackerRank';
    else if (host.includes('interviewbit')) platform = 'InterviewBit';

    // Extract Title from URL slug
    const segments = pathname.split('/').filter(Boolean);
    let slug = '';

    if (platform === 'LeetCode') {
      const idx = segments.indexOf('problems');
      if (idx !== -1 && segments[idx + 1]) {
        slug = segments[idx + 1];
      }
    } else if (platform === 'GFG') {
      const idx = segments.indexOf('problems');
      if (idx !== -1 && segments[idx + 1]) {
        slug = segments[idx + 1].replace(/\d+$/, '');
      }
    } else if (platform === 'InterviewBit') {
      const idx = segments.indexOf('problems');
      if (idx !== -1 && segments[idx + 1]) {
        slug = segments[idx + 1];
      }
    }

    if (!slug && segments.length > 0) {
      slug = segments[segments.length - 1];
    }

    if (slug) {
      title = slug
        .replace(/[-_]/g, ' ')
        .split(' ')
        .filter(Boolean)
        .map((w) => {
          if (w.toLowerCase() === '3sum') return '3Sum';
          if (w.toLowerCase() === '2sum') return '2Sum';
          if (w.toLowerCase() === '4sum') return '4Sum';
          if (w.toLowerCase() === 'kth') return 'Kth';
          if (w.toLowerCase() === 'lru') return 'LRU';
          if (w.toLowerCase() === 'lfu') return 'LFU';
          if (w.toLowerCase() === 'bfs') return 'BFS';
          if (w.toLowerCase() === 'dfs') return 'DFS';
          return w.charAt(0).toUpperCase() + w.slice(1);
        })
        .join(' ');

      // Infer topic keywords from slug
      const lowerSlug = slug.toLowerCase();
      const inferred: string[] = [];

      if (lowerSlug.includes('sum') || lowerSlug.includes('array') || lowerSlug.includes('sub')) inferred.push('Arrays');
      if (lowerSlug.includes('map') || lowerSlug.includes('hash') || lowerSlug.includes('two-sum')) inferred.push('HashMap');
      if (lowerSlug.includes('tree') || lowerSlug.includes('binary') || lowerSlug.includes('bst')) inferred.push('Trees');
      if (lowerSlug.includes('graph') || lowerSlug.includes('dijkstra') || lowerSlug.includes('path')) inferred.push('Graphs');
      if (lowerSlug.includes('dp') || lowerSlug.includes('knapsack') || lowerSlug.includes('subsequence')) inferred.push('Dynamic Programming');
      if (lowerSlug.includes('string') || lowerSlug.includes('substring') || lowerSlug.includes('palindrome')) inferred.push('Strings');
      if (lowerSlug.includes('pointer') || lowerSlug.includes('water') || lowerSlug.includes('container')) inferred.push('Two Pointers');

      if (inferred.length > 0) {
        categories = inferred;
        topic = inferred[0];
      }
    }
  } catch {
    // Fallback if parsing fails
  }

  return { title, platform, topic, categories };
}
