export function parseProblemUrl(url: string): { title: string; platform: string } {
  let title = '';
  let platform = 'LeetCode';

  if (!url || !url.trim()) return { title, platform };

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
        slug = segments[idx + 1].replace(/\d+$/, ''); // Clean trailing IDs
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
          // Keep common terms formatted correctly
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
    }
  } catch {
    // Return default if invalid URL
  }

  return { title, platform };
}
