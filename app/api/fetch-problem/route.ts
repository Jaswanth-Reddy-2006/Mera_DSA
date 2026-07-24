import { NextResponse } from 'next/server';
import { parseProblemUrl } from '@/lib/url-parser';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const { title, platform, topic, description, categories } = await fetchProblemMetadata(url);

    return NextResponse.json({
      title,
      platform,
      topic,
      categories,
      description,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch problem metadata' }, { status: 500 });
  }
}

async function fetchProblemMetadata(url: string) {
  const parsed = parseProblemUrl(url);
  let title = parsed.title;
  let platform = parsed.platform;
  let topic = parsed.topic || 'Arrays';
  let categories = parsed.categories || ['Arrays'];
  let description = '';

  // Check if LeetCode URL
  if (url.includes('leetcode.com')) {
    try {
      const match = url.match(/problems\/([^\/]+)/);
      if (match && match[1]) {
        const titleSlug = match[1];

        // Query LeetCode GraphQL API
        const response = await fetch('https://leetcode.com/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          },
          body: JSON.stringify({
            query: `
              query questionData($titleSlug: String!) {
                question(titleSlug: $titleSlug) {
                  title
                  content
                  topicTags {
                    name
                  }
                }
              }
            `,
            variables: { titleSlug },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const q = data?.data?.question;
          if (q) {
            title = q.title || title;
            if (q.topicTags && q.topicTags.length > 0) {
              categories = q.topicTags.map((t: any) => t.name);
              topic = categories[0];
            }
            if (q.content) {
              // Convert HTML content to clean markdown/text
              description = cleanHtmlToMarkdown(q.content);
            }
          }
        }
      }
    } catch {
      // Fallback to slug generator if network query is blocked
    }
  }

  // Fallback description template if empty
  if (!description) {
    description = `### Problem Description\n\nGiven the input parameters, solve **${title}** on ${platform}.\n\n### Example 1:\n\`\`\`\nInput: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: Because nums[0] + nums[1] == 9, we return [0, 1].\n\`\`\`\n\n### Constraints:\n- 1 <= nums.length <= 10^4\n- -10^9 <= nums[i] <= 10^9`;
  }

  return { title, platform, topic, categories, description };
}

function cleanHtmlToMarkdown(html: string): string {
  return html
    .replace(/<strong class="example">/gi, '\n### ')
    .replace(/<strong[^>]*>/gi, '**')
    .replace(/<\/strong>/gi, '**')
    .replace(/<em[^>]*>/gi, '*')
    .replace(/<\/em>/gi, '*')
    .replace(/<pre[^>]*>/gi, '\n```\n')
    .replace(/<\/pre>/gi, '\n```\n')
    .replace(/<code[^>]*>/gi, '`')
    .replace(/<\/code>/gi, '`')
    .replace(/<p[^>]*>/gi, '\n\n')
    .replace(/<\/p>/gi, '')
    .replace(/<ul[^>]*>/gi, '\n')
    .replace(/<\/ul>/gi, '')
    .replace(/<li[^>]*>/gi, '- ')
    .replace(/<\/li>/gi, '\n')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/<[^>]+>/g, '')
    .replace(/\n\s+\n/g, '\n\n')
    .trim();
}
