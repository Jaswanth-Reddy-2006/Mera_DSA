import { ProblemData } from '@/types';

// 1. Export Problems as Excel CSV
export function exportProblemsToCSV(problems: ProblemData[]) {
  if (!problems || problems.length === 0) return;

  const headers = [
    'Title',
    'Platform',
    'Problem URL',
    'Difficulty',
    'Topics',
    'Pattern',
    'Revision Count',
    'Problem Description & Examples',
    'Key Observations & Notes',
    'Solutions Breakdown (Title, Code, Time, Space)',
  ];

  const rows = problems.map((p) => {
    const topicsStr = p.tags && p.tags.length > 0
      ? p.tags.map((t: any) => t.name).join(', ')
      : p.topic || 'Arrays';

    const solutionsStr = (p.solutions || [])
      .map(
        (s) =>
          `[${s.title || s.type}] Time: ${s.timeComplexity || 'O(N)'} | Space: ${s.spaceComplexity || 'O(1)'}\nCode:\n${s.code}`
      )
      .join('\n\n--- Next Solution ---\n\n');

    return [
      `"${(p.title || '').replace(/"/g, '""')}"`,
      `"${(p.platform || '').replace(/"/g, '""')}"`,
      `"${(p.problemUrl || '').replace(/"/g, '""')}"`,
      `"${(p.difficulty || '').replace(/"/g, '""')}"`,
      `"${topicsStr.replace(/"/g, '""')}"`,
      `"${(p.pattern || '').replace(/"/g, '""')}"`,
      p.revisionCount || 0,
      `"${(p.problemDescription || '').replace(/"/g, '""')}"`,
      `"${(p.notes || '').replace(/"/g, '""')}"`,
      `"${solutionsStr.replace(/"/g, '""')}"`,
    ];
  });

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `Mera_DSA_Problems_Backup_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// 2. Export All Problems to PDF / Printable Report
export function exportProblemsToPDF(problems: ProblemData[]) {
  if (!problems || problems.length === 0) return;

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to generate PDF report');
    return;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>MERA DSA - Complete Problem Vault Report</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background: #ffffff;
            color: #0f172a;
            padding: 24px;
            line-height: 1.5;
          }
          h1 {
            color: #0284c7;
            font-size: 24px;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 8px;
            margin-bottom: 4px;
          }
          .subtitle {
            color: #64748b;
            font-size: 12px;
            margin-bottom: 24px;
          }
          .problem-card {
            border: 1px solid #cbd5e1;
            border-radius: 12px;
            padding: 16px;
            margin-bottom: 24px;
            page-break-inside: avoid;
            background: #f8fafc;
          }
          .problem-title {
            font-size: 18px;
            font-weight: 800;
            color: #0f172a;
            margin-bottom: 6px;
          }
          .badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 6px;
            font-size: 10px;
            font-weight: 700;
            margin-right: 6px;
            text-transform: uppercase;
          }
          .badge-easy { background: #dcfce7; color: #166534; }
          .badge-medium { background: #fef3c7; color: #92400e; }
          .badge-hard { background: #ffe4e6; color: #9f1239; }
          .badge-topic { background: #e0f2fe; color: #075985; }
          .badge-pattern { background: #f3e8ff; color: #6b21a8; }
          .section-heading {
            font-size: 12px;
            font-weight: 700;
            color: #0284c7;
            margin-top: 12px;
            margin-bottom: 4px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .box {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 10px;
            font-size: 12px;
            white-space: pre-wrap;
            margin-bottom: 10px;
          }
          .code-box {
            background: #090d16;
            color: #38bdf8;
            font-family: monospace;
            padding: 12px;
            border-radius: 8px;
            font-size: 11px;
            overflow-x: auto;
            white-space: pre;
          }
          .complexity-bar {
            font-size: 11px;
            font-weight: 700;
            color: #475569;
            margin-bottom: 6px;
          }
          @media print {
            body { padding: 0; }
            .problem-card { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <h1>MERA DSA — Complete Code & Observation Vault</h1>
        <div class="subtitle">Generated on ${new Date().toLocaleDateString()} | Total Problems: ${problems.length}</div>

        ${problems
          .map((p, idx) => {
            const topicsStr = p.tags && p.tags.length > 0
              ? p.tags.map((t: any) => t.name).join(', ')
              : p.topic || 'Arrays';

            const diffClass =
              p.difficulty === 'Easy'
                ? 'badge-easy'
                : p.difficulty === 'Medium'
                ? 'badge-medium'
                : 'badge-hard';

            return `
              <div class="problem-card">
                <div class="problem-title">${idx + 1}. ${p.title}</div>
                <div>
                  <span class="badge ${diffClass}">${p.difficulty}</span>
                  <span class="badge badge-topic">Platform: ${p.platform}</span>
                  <span class="badge badge-topic">Topics: ${topicsStr}</span>
                  ${p.pattern ? `<span class="badge badge-pattern">Pattern: ${p.pattern}</span>` : ''}
                </div>

                ${
                  p.problemDescription
                    ? `
                    <div class="section-heading">📄 Problem Statement & Example Test Cases</div>
                    <div class="box">${p.problemDescription}</div>
                  `
                    : ''
                }

                ${
                  p.notes
                    ? `
                    <div class="section-heading">📖 Key Observations & Personal Notes</div>
                    <div class="box">${p.notes}</div>
                  `
                    : ''
                }

                <div class="section-heading">💻 C++ Solutions</div>
                ${(p.solutions || [])
                  .map(
                    (s) => `
                    <div style="margin-bottom: 12px;">
                      <div class="complexity-bar">
                        • ${s.title || s.type}: <span style="color:#d97706;">Time: ${s.timeComplexity || 'O(N)'}</span> | <span style="color:#9333ea;">Space: ${s.spaceComplexity || 'O(1)'}</span>
                      </div>
                      <div class="code-box">${(s.code || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
                    </div>
                  `
                  )
                  .join('')}
              </div>
            `;
          })
          .join('')}

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
