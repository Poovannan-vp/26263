import { useState } from "react";
import { generateRows } from "../data/seed";
import { checkRow, statusFor, RULES, type RuleCode } from "../engine/rules";
import { useStore } from "../store";
import { ProgressBar, PageHead } from "../components/ui";

type Result = {
  rows: number;
  ms: number;
  accepted: number;
  correctable: number;
  review: number;
  byRule: Record<RuleCode, number>;
};

const N = 100000;
const CHUNK = 5000;

// Browser-side benchmark: generates, validates and classifies synthetic rows in chunks,
// so the progress bar moves while it runs. This is not a server benchmark.
export function UploadBenchmark() {
  const { can, log, toast } = useStore();
  const [result, setResult] = useState<Result | null>(null);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  const start = () => {
    setRunning(true);
    setResult(null);
    setProgress(0);
    const rows = generateRows(N);
    const seen = new Set<string>();
    const byRule = Object.fromEntries(Object.keys(RULES).map(k => [k, 0])) as Record<RuleCode, number>;
    let acc = 0, cor = 0, rev = 0, i = 0;
    const t0 = performance.now();

    const step = () => {
      const end = Math.min(N, i + CHUNK);
      for (; i < end; i++) {
        const failed = checkRow(rows[i], seen);
        for (const f of failed) byRule[f]++;
        const s = statusFor(failed);
        if (s === "accepted") acc++;
        else if (s === "correctable") cor++;
        else rev++;
      }
      setProgress((i / N) * 100);
      if (i < N) {
        setTimeout(step, 0);
      } else {
        const ms = performance.now() - t0;
        setResult({ rows: N, ms, accepted: acc, correctable: cor, review: rev, byRule });
        setRunning(false);
        void log("benchmark.run", `${N.toLocaleString("en-IN")} synthetic rows · ${ms.toFixed(0)} ms`);
        toast("Load test finished.");
      }
    };
    setTimeout(step, 30);
  };

  const pct = (n: number) => (result ? ((n / result.rows) * 100).toFixed(2) + "%" : "");

  if (!can("benchmark.run")) return null;

  return (
    <section className="bench">
      <PageHead
        eyebrow="College upload · validation pipeline"
        title="Load test: 100,000 rows"
        right={<button className="primary" onClick={start} disabled={running}>{running ? "Running…" : "Run load test"}</button>}
      />

      {!result && !running && (
        <div className="card muted">
          Generates a synthetic upload of 100,000 rows in this browser, runs every rule on each row, and reports the
          outcome. Partial acceptance: valid rows are accepted, errors are explained, nothing is dropped silently.
        </div>
      )}

      {running && (
        <div className="card">
          <div className="label">Checking rows</div>
          <ProgressBar value={progress} label="Load test progress" />
          <div className="small muted">{Math.round(progress)}% · {Math.round((progress / 100) * N).toLocaleString("en-IN")} of {N.toLocaleString("en-IN")} rows</div>
        </div>
      )}

      {result && (
        <div className="grid-2">
          <div className="card">
            <div className="label">Outcome</div>
            <table className="tbl">
              <tbody>
                <tr><td>Rows processed</td><td className="num">{result.rows.toLocaleString("en-IN")}</td></tr>
                <tr><td>Wall-clock time, this browser</td><td className="num">{result.ms.toFixed(0)} ms</td></tr>
                <tr><td>Accepted</td><td className="num ok">{result.accepted.toLocaleString("en-IN")} <span className="muted">({pct(result.accepted)})</span></td></tr>
                <tr><td>Correctable errors</td><td className="num warn">{result.correctable.toLocaleString("en-IN")} <span className="muted">({pct(result.correctable)})</span></td></tr>
                <tr><td>Needs review (duplicates)</td><td className="num flag">{result.review.toLocaleString("en-IN")} <span className="muted">({pct(result.review)})</span></td></tr>
                <tr><td>Rows dropped silently</td><td className="num ok">0</td></tr>
              </tbody>
            </table>
          </div>
          <div className="card">
            <div className="label">Failures by rule</div>
            <table className="tbl">
              <tbody>
                {(Object.keys(RULES) as RuleCode[]).map(code => (
                  <tr key={code}>
                    <td>{RULES[code].label} <span className="rule">{code} v{RULES[code].version}</span></td>
                    <td className="num">{result.byRule[code].toLocaleString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="small muted">Synthetic data. Timing is for this browser and this machine; it is not a server benchmark.</div>
          </div>
        </div>
      )}
    </section>
  );
}
