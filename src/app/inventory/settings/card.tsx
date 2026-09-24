"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Cred = {
  source: string;
  kind: string;
  value: string;
  updated_at: string;
  issued_at: string | null;
  expires_at: string | null;
  last_ok_at: string | null;
  last_fail_at: string | null;
  last_fail_reason: string | null;
};

type Autom = {
  source: string;
  enabled: boolean;
  schedule_time: string;
  last_scheduled_at: string | null;
  next_scheduled_at: string | null;
  last_result: string | null;
};

const fmtDT = (s: string | null) =>
  s
    ? new Date(s).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

export function SourceSettingsCard({
  source,
  kind,
  label,
  hint,
  placeholder,
  cred,
  autom,
}: {
  source: "nawy" | "propertyhub";
  kind: "bearer" | "cookie";
  label: string;
  hint: string;
  placeholder: string;
  cred: Cred | null;
  autom: Autom | null;
}) {
  const router = useRouter();
  const [tokenValue, setTokenValue] = useState("");
  const [autoEnabled, setAutoEnabled] = useState(autom?.enabled ?? false);
  const [scheduleTime, setScheduleTime] = useState(
    (autom?.schedule_time ?? "03:00:00").slice(0, 5),
  );
  const [busy, setBusy] = useState<"token" | "auto" | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  // live countdown for token expiry (Nawy) or "last activity" (PropertyHub)
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const expiresMs = cred?.expires_at ? new Date(cred.expires_at).getTime() : null;
  const expiredAlready = expiresMs != null && expiresMs < now;
  const secsLeft = expiresMs != null ? Math.max(0, Math.floor((expiresMs - now) / 1000)) : null;
  const countdown = secsLeft != null ? fmtDuration(secsLeft) : null;

  const health = healthStatus(cred, expiredAlready);

  async function saveToken(e: React.FormEvent) {
    e.preventDefault();
    if (!tokenValue.trim()) return;
    setBusy("token");
    setMsg(null);
    try {
      const r = await fetch("/api/inventory/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source, kind, value: tokenValue }),
      });
      const j = await r.json();
      setMsg(r.ok ? "Token saved." : `FAILED · ${j.error ?? "unknown"}`);
      if (r.ok) {
        setTokenValue("");
        router.refresh();
      }
    } catch (e) {
      setMsg(`Exception · ${(e as Error).message}`);
    } finally {
      setBusy(null);
    }
  }

  async function saveAutomation() {
    setBusy("auto");
    setMsg(null);
    try {
      const r = await fetch("/api/inventory/automation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source,
          enabled: autoEnabled,
          schedule_time: scheduleTime,
        }),
      });
      const j = await r.json();
      setMsg(r.ok ? "Automation saved." : `FAILED · ${j.error ?? "unknown"}`);
      if (r.ok) router.refresh();
    } catch (e) {
      setMsg(`Exception · ${(e as Error).message}`);
    } finally {
      setBusy(null);
    }
  }

  return (
    <article className="rounded-md border border-neutral-200 bg-white">
      <div
        className={
          "h-1 w-full rounded-t-md " +
          (source === "nawy" ? "bg-teal-700" : "bg-orange-700")
        }
      />
      <div className="p-5 space-y-5">
        <div className="flex items-baseline justify-between">
          <div>
            <h3 className="text-sm font-medium">{label}</h3>
            <p className="mt-1 text-[11px] text-neutral-500">{hint}</p>
          </div>
          <HealthPill status={health} />
        </div>

        {/* Health strip */}
        <div className="grid grid-cols-2 gap-3 rounded bg-neutral-50 p-3">
          <div>
            <div className="text-[10px] uppercase tracking-[0.12em] text-neutral-500">
              Lifetime
            </div>
            <div className="mt-1 font-mono text-sm tabular-nums">
              {countdown === null ? (
                <span className="text-neutral-400">n/a</span>
              ) : expiredAlready ? (
                <span className="text-red-700 font-semibold">EXPIRED</span>
              ) : (
                <span className={secsLeft! < 300 ? "text-orange-700" : "text-neutral-900"}>
                  {countdown}
                </span>
              )}
            </div>
            {cred?.expires_at && (
              <div className="mt-0.5 text-[10px] text-neutral-500">
                Expires {fmtDT(cred.expires_at)}
              </div>
            )}
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.12em] text-neutral-500">
              Last activity
            </div>
            <div className="mt-1 text-xs">
              <div>
                <span className="text-emerald-700">✓</span>{" "}
                <span className="text-neutral-700">
                  {cred?.last_ok_at ? fmtDT(cred.last_ok_at) : "never"}
                </span>
              </div>
              <div className={cred?.last_fail_at ? "" : "text-neutral-400"}>
                <span className={cred?.last_fail_at ? "text-red-700" : ""}>✗</span>{" "}
                <span className="text-neutral-700">
                  {cred?.last_fail_at ? fmtDT(cred.last_fail_at) : "never"}
                </span>
              </div>
              {cred?.last_fail_reason && (
                <div className="mt-0.5 text-[10px] text-red-700">
                  {cred.last_fail_reason}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Token editor */}
        <form onSubmit={saveToken} className="space-y-2">
          <label className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
            Paste fresh token
          </label>
          <textarea
            value={tokenValue}
            onChange={(e) => setTokenValue(e.target.value)}
            rows={3}
            placeholder={placeholder}
            className="w-full rounded border border-neutral-300 p-2 font-mono text-[11px]"
          />
          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={busy === "token" || !tokenValue.trim()}
              className="rounded bg-neutral-900 px-3 py-1.5 text-sm text-white disabled:opacity-50"
            >
              {busy === "token" ? "Saving…" : "Save token"}
            </button>
            {cred?.updated_at && (
              <span className="text-[11px] text-neutral-500">
                Last stored {fmtDT(cred.updated_at)}
              </span>
            )}
          </div>
        </form>

        {/* Automation */}
        <div className="rounded border border-neutral-200 p-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-700">
                Daily auto-refresh
              </div>
              <p className="mt-0.5 text-[11px] text-neutral-500">
                Runs the sync on schedule using the stored token above.
                {source === "nawy" &&
                  " Nawy tokens expire within an hour — automation will fail until you paste a fresh one."}
              </p>
            </div>
            <label className="flex cursor-pointer items-center gap-2 select-none">
              <input
                type="checkbox"
                checked={autoEnabled}
                onChange={(e) => setAutoEnabled(e.target.checked)}
                className="h-4 w-4"
              />
              <span className="text-xs font-medium">
                {autoEnabled ? "Enabled" : "Disabled"}
              </span>
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-[10px] uppercase tracking-[0.12em] text-neutral-500">
                Time of day (UTC)
              </span>
              <input
                type="time"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                className="mt-1 w-full rounded border border-neutral-300 px-2 py-1 text-sm tabular-nums"
              />
            </label>
            <div>
              <span className="text-[10px] uppercase tracking-[0.12em] text-neutral-500">
                Next run
              </span>
              <div className="mt-1 text-sm text-neutral-800 tabular-nums">
                {autoEnabled && autom?.next_scheduled_at
                  ? fmtDT(autom.next_scheduled_at)
                  : "—"}
              </div>
              {autom?.last_scheduled_at && (
                <div className="mt-0.5 text-[10px] text-neutral-500">
                  Last fired {fmtDT(autom.last_scheduled_at)}
                  {autom.last_result ? ` · ${autom.last_result}` : ""}
                </div>
              )}
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <button
              onClick={saveAutomation}
              disabled={busy === "auto"}
              className="rounded bg-neutral-900 px-3 py-1.5 text-sm text-white disabled:opacity-50"
            >
              {busy === "auto" ? "Saving…" : "Save automation"}
            </button>
            {msg && (
              <span
                className={
                  "text-xs " +
                  (msg.startsWith("FAILED") || msg.startsWith("Exception")
                    ? "text-red-700"
                    : "text-emerald-700")
                }
              >
                {msg}
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

function fmtDuration(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`;
  if (m > 0) return `${m}m ${String(s).padStart(2, "0")}s`;
  return `${s}s`;
}

type Health = "healthy" | "warning" | "critical" | "unknown";
function healthStatus(cred: Cred | null, expiredAlready: boolean): Health {
  if (!cred) return "unknown";
  if (expiredAlready) return "critical";
  if (
    cred.last_fail_at &&
    (!cred.last_ok_at ||
      new Date(cred.last_fail_at) > new Date(cred.last_ok_at))
  )
    return "critical";
  if (!cred.last_ok_at) return "warning";
  return "healthy";
}

function HealthPill({ status }: { status: Health }) {
  const map: Record<Health, { label: string; cls: string }> = {
    healthy: { label: "Healthy", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    warning: { label: "Untested", cls: "bg-yellow-50 text-yellow-800 border-yellow-200" },
    critical: { label: "Failing", cls: "bg-red-50 text-red-700 border-red-200" },
    unknown: { label: "No credential", cls: "bg-neutral-100 text-neutral-600 border-neutral-300" },
  };
  const { label, cls } = map[status];
  return (
    <span
      className={
        "inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider " +
        cls
      }
    >
      {label}
    </span>
  );
}
