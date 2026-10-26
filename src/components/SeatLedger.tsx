import type { Programme } from "../data/seed";
import { tr } from "../i18n";
import { useStore } from "../store";
import { utilisation } from "../engine/programme";

// One tile per reported seat. Active seats fill in green in order; unverified seats pulse slate;
// the dashed line marks the approved intake.
export function SeatLedger({ prog, active }: { prog: Programme; active: number }) {
  const { lang } = useStore();
  const reported = prog.reported;
  const cols = 12;
  const rows = Math.ceil(reported / cols);
  const tile = 24, gap = 5;
  const width = cols * (tile + gap);
  const height = rows * (tile + gap);
  const intakeRow = Math.floor(prog.intake / cols);
  const intakeCol = prog.intake % cols;
  const intakeX = intakeCol * (tile + gap) - gap / 2;
  const intakeY = intakeRow * (tile + gap);
  const unverified = Math.max(0, reported - active);

  const tiles = Array.from({ length: reported }, (_, i) => {
    const x = (i % cols) * (tile + gap);
    const y = Math.floor(i / cols) * (tile + gap);
    const isActive = i < active;
    return (
      <rect
        key={i}
        x={x} y={y} width={tile} height={tile} rx={5}
        className={isActive ? "seat active" : "seat ghost"}
        style={{ animationDelay: `${(i * 0.012).toFixed(2)}s` }}
      />
    );
  });

  return (
    <div className="ledger">
      <div className="ledger-head">
        <div>
          <div className="label">Seat Ledger · {prog.name}</div>
          <div className="big">
            <span className="ok">{active}</span> active <span className="muted">of {reported} reported</span>
          </div>
          <div className="small muted">
            {tr(lang, "unverified")}: <b>{unverified}</b>
            <span className="help" title="Seats reported by the college with no fee, exam or attendance signal in the last 30 days.">ⓘ</span>
            {" · "}utilisation {utilisation(active, prog.intake)}%
          </div>
        </div>
        <div className="legend">
          <span><i className="sw active" /> verified active</span>
          <span><i className="sw ghost" /> unverified</span>
          <span><i className="sw intake" /> intake {prog.intake}</span>
        </div>
      </div>
      <svg viewBox={`-6 -6 ${width + 12} ${height + 12}`} className="ledger-svg" role="img"
        aria-label={`${active} active seats of ${reported} reported; intake ${prog.intake}`}>
        {tiles}
        <line x1={intakeX} x2={intakeX} y1={intakeY - 4} y2={intakeY + tile + 4} className="intake-line" />
      </svg>
    </div>
  );
}
