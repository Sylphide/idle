import Decimal, { type DecimalSource } from "break_eternity.js";

const SUFFIXES = ["", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc"];

export function formatNumber(value: DecimalSource): string {
  const d = value instanceof Decimal ? value : new Decimal(value);
  if (d.lt(1000)) {
    const n = d.toNumber();
    return n.toFixed(n < 10 ? 1 : 0);
  }
  // Beyond the suffix table (or beyond ordinary powers-of-ten territory), fall back to
  // scientific notation rather than crashing/truncating — break_eternity numbers can get
  // far bigger than a suffix chain can reasonably cover.
  const tier = Math.floor(d.exponent / 3);
  if (d.layer > 0 || tier >= SUFFIXES.length) {
    return d.toExponential(2);
  }
  const scaled = d.mantissa * Math.pow(10, d.exponent - tier * 3);
  return `${scaled.toFixed(scaled < 10 ? 2 : 1)}${SUFFIXES[tier]}`;
}

export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}
