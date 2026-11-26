import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import type {
  FullConfig,
  FullResult,
  Reporter,
  Suite,
} from '@playwright/test/reporter';

type RunMeta = {
  runId: string;
  startedAt: string;
  durationMs: number;
  status: FullResult['status'];
  passed: number;
  failed: number;
  flaky: number;
  skipped: number;
  strict: boolean;
  /** Known app problems that tests tolerated (normal mode only). */
  knownIssues: { issue: string; tests: number }[];
  /** Why tests were skipped, most common first. */
  skippedReasons: { reason: string; count: number }[];
  baseURL: string;
  branch: string;
  commit: string;
};

type Options = { root: string; runDir: string };

const git = (args: string) => {
  try {
    return execSync(`git ${args}`, { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
  } catch {
    return '';
  }
};

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);

/**
 * Keeps one folder per run under e2e_result/ and an index.html that lists
 * every run (newest first) with its result and a link to its HTML report.
 */
export default class RunIndexReporter implements Reporter {
  private suite!: Suite;
  private config!: FullConfig;
  private startedAt = new Date();

  constructor(private options: Options) {}

  onBegin(config: FullConfig, suite: Suite) {
    this.config = config;
    this.suite = suite;
    this.startedAt = new Date();
  }

  onEnd(result: FullResult) {
    const count = { passed: 0, failed: 0, flaky: 0, skipped: 0 };
    const issues = new Map<string, number>();
    const skips = new Map<string, number>();
    for (const test of this.suite.allTests()) {
      const outcome = test.outcome();
      if (outcome === 'expected') count.passed++;
      else if (outcome === 'unexpected') count.failed++;
      else if (outcome === 'flaky') count.flaky++;
      else count.skipped++;

      const seen = new Set<string>();
      for (const a of test.annotations) {
        if (
          a.type === 'known-issue' &&
          a.description &&
          !seen.has(a.description)
        ) {
          seen.add(a.description);
          issues.set(a.description, (issues.get(a.description) ?? 0) + 1);
        }
        if (outcome === 'skipped' && a.type === 'skip') {
          const reason = a.description || 'skipped (no reason given)';
          skips.set(reason, (skips.get(reason) ?? 0) + 1);
        }
      }
    }
    const knownIssues = Array.from(issues)
      .map(([issue, tests]) => ({ issue, tests }))
      .sort((a, b) => a.issue.localeCompare(b.issue));
    const skippedReasons = Array.from(skips)
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count);

    const runId = path.basename(this.options.runDir);
    const meta: RunMeta = {
      runId,
      startedAt: this.startedAt.toISOString(),
      durationMs: result.duration,
      status: result.status,
      ...count,
      strict: process.env.E2E_STRICT === '1',
      knownIssues,
      skippedReasons,
      baseURL: this.config.projects[0]?.use?.baseURL ?? '',
      branch: git('rev-parse --abbrev-ref HEAD'),
      commit: git('rev-parse --short HEAD'),
    };

    fs.mkdirSync(this.options.runDir, { recursive: true });
    fs.writeFileSync(
      path.join(this.options.runDir, 'meta.json'),
      JSON.stringify(meta, null, 2),
    );
    this.writeIndex();

    this.writeStepSummary(meta);

    const report = path.resolve(this.options.runDir, 'report');
    // The end-of-run summary makes tolerated problems and skips impossible to
    // miss: a green run is not a run without bugs.
    if (knownIssues.length) {
      console.log(
        `\nKNOWN ISSUES (${knownIssues.length}): unfixed app problems the tests tolerate. ` +
          'Run `yarn e2e:strict` to see them fail.',
      );
      for (const k of knownIssues)
        console.log(`  - ${k.issue} [${k.tests} test(s)]`);
      console.log('');
    }
    if (skippedReasons.length) {
      console.log(`SKIPPED (${count.skipped}):`);
      for (const s of skippedReasons)
        console.log(`  - ${s.count} x ${s.reason}`);
      console.log('');
    }
    console.log(`E2E report: ${report}`);
    console.log(`View it:    npx playwright show-report "${report}"`);
    console.log(
      `All runs:   ${path.resolve(this.options.root, 'index.html')}\n`,
    );
  }

  printsToStdio() {
    return false;
  }

  /**
   * On GitHub Actions, append a Markdown summary to $GITHUB_STEP_SUMMARY so the
   * result, known issues and skips show on the run page, not only in the log.
   * No-op everywhere else.
   */
  private writeStepSummary(meta: RunMeta) {
    const file = process.env.GITHUB_STEP_SUMMARY;
    if (!file) return;

    const cell = (s: string) => s.replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
    const ok = meta.status === 'passed' && meta.failed === 0;
    const lines: string[] = [
      `## E2E results ${ok ? '✅' : '❌'}${meta.strict ? ' (strict)' : ''}`,
      '',
      `**${meta.passed}** passed · **${meta.failed}** failed · **${meta.flaky}** flaky · **${meta.skipped}** skipped · ${(meta.durationMs / 1000).toFixed(1)}s`,
      '',
    ];

    if (meta.knownIssues.length) {
      lines.push(
        `### ⚠️ Known issues (${meta.knownIssues.length})`,
        '',
        'Unfixed app problems the tests tolerate. A green run does not mean these are gone. ' +
          'Run `yarn e2e:strict` to see them fail.',
        '',
        '| Issue | Tests |',
        '| --- | --- |',
        ...meta.knownIssues.map((k) => `| ${cell(k.issue)} | ${k.tests} |`),
        '',
      );
    }
    if (meta.skippedReasons.length) {
      lines.push(
        `### ⏭️ Skipped (${meta.skipped})`,
        '',
        '| Reason | Tests |',
        '| --- | --- |',
        ...meta.skippedReasons.map((s) => `| ${cell(s.reason)} | ${s.count} |`),
        '',
      );
    }
    lines.push(
      'The full HTML report is in the `e2e-result` artifact of this run.',
      '',
    );

    try {
      fs.appendFileSync(file, lines.join('\n'));
    } catch {
      // Never fail the test run because the summary could not be written.
    }
  }

  private writeIndex() {
    const root = this.options.root;
    const runs: RunMeta[] = fs
      .readdirSync(root, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .flatMap((d) => {
        try {
          return [
            JSON.parse(
              fs.readFileSync(path.join(root, d.name, 'meta.json'), 'utf8'),
            ) as RunMeta,
          ];
        } catch {
          return [];
        }
      })
      .sort((a, b) => b.runId.localeCompare(a.runId));

    const rows = runs
      .map((r) => {
        const ok = r.status === 'passed' && r.failed === 0;
        const secs = (r.durationMs / 1000).toFixed(1);
        return `<tr>
  <td><a href="${esc(r.runId)}/report/index.html">${esc(r.runId)}</a></td>
  <td class="${ok ? 'pass' : 'fail'}">${ok ? 'passed' : esc(r.status)}${r.strict ? ' (strict)' : ''}</td>
  <td>${r.passed}</td><td>${r.failed}</td><td>${r.flaky}</td><td>${r.skipped}</td>
  <td class="${r.knownIssues?.length ? 'warn' : ''}" title="${esc((r.knownIssues ?? []).map((k) => k.issue).join('\n'))}">${r.knownIssues?.length ?? 0}</td>
  <td>${secs}s</td>
  <td>${esc(r.branch)} @ ${esc(r.commit)}</td>
</tr>`;
      })
      .join('\n');

    const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<title>E2E runs</title>
<style>
  :root { --bg:#fff; --fg:#1b1f24; --muted:#656d76; --line:#d0d7de; --ok:#1a7f37; --bad:#cf222e; --warn:#9a6700; }
  @media (prefers-color-scheme: dark) { :root { --bg:#0d1117; --fg:#e6edf3; --muted:#8b949e; --line:#30363d; --ok:#3fb950; --bad:#f85149; --warn:#d29922; } }
  body { background:var(--bg); color:var(--fg); font:15px/1.5 system-ui,sans-serif; margin:0; padding:24px 16px; }
  main { max-width:900px; margin:0 auto; }
  table { width:100%; border-collapse:collapse; }
  th,td { text-align:left; padding:8px 10px; border-bottom:1px solid var(--line); }
  th { color:var(--muted); font-weight:600; }
  .warn { color:var(--warn); font-weight:600; }
  .pass { color:var(--ok); font-weight:600; } .fail { color:var(--bad); font-weight:600; }
  a { color:inherit; }
  p { color:var(--muted); }
</style></head><body><main>
<h1>E2E runs</h1>
<p>Newest first. Each report opens from this folder; for traces, use
<code>npx playwright show-report &lt;folder&gt;/report</code>.</p>
<table>
<thead><tr><th>Run</th><th>Result</th><th>Passed</th><th>Failed</th><th>Flaky</th><th>Skipped</th><th>Known issues</th><th>Time</th><th>Code</th></tr></thead>
<tbody>
${rows}
</tbody></table></main></body></html>
`;
    fs.writeFileSync(path.join(root, 'index.html'), html);
  }
}
