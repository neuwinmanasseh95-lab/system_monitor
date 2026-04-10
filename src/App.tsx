/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { 
  Cpu, 
  Database, 
  Activity, 
  Battery, 
  Wifi, 
  Network, 
  HardDrive, 
  Thermometer,
  Zap,
  RefreshCw
} from "lucide-react";

interface GPUData {
  name?: string;
  load_percent?: number;
  memory_used_mb?: number;
  memory_total_mb?: number;
  memory_usage_percent?: number;
  temperature_c?: number | null;
  driver?: string;
  error?: string;
}

interface SystemStats {
  hostname: string;
  timestamp: string;
  cpu: {
    total_usage_percent: number;
    frequency_mhz: number;
    physical_cores: number;
    logical_cores: number;
    per_core_percent: number[];
  };
  ram: {
    usage_percent: number;
    used_gb: number;
    total_gb: number;
    available_gb: number;
    swap_used_gb: number;
    swap_total_gb: number;
    swap_percent: number;
  };
  gpu: GPUData[];
  battery: {
    available: boolean;
    percent: number;
    charging: boolean;
    plugged_in: boolean;
    time_left: string;
  };
  wifi: {
    ssid: string;
    state: string;
    signal: string;
    receive_rate_mbps: number;
    transmit_rate_mbps: number;
    radio_type: string;
    channel: number;
  };
  network: {
    bytes_recv_mb: number;
    bytes_sent_mb: number;
    packets_recv: number;
    packets_sent: number;
  };
  disk: {
    device: string;
    filesystem: string;
    usage_percent: number;
    used_gb: number;
    total_gb: number;
  }[];
}

export default function App() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/stats");
        const data = await res.json();
        if (data.latest) {
          setStats(data.latest);
          setLoading(false);
        }
      } catch (error) {
        console.error("Failed to fetch system stats:", error);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (pct: number) => {
    if (pct >= 85) return "bg-danger";
    if (pct >= 65) return "bg-warn";
    return "bg-gradient-to-r from-accent to-accent-secondary";
  };

  const Gauge = ({ pct, label }: { pct: number; label?: string }) => (
    <div className="mt-4">
      <div className="flex justify-between text-[0.68rem] text-muted mb-1 font-mono uppercase tracking-wider">
        <span>{label}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-[6px] bg-border rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-1000 ease-in-out ${getStatusColor(pct)}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-muted font-mono">
        <RefreshCw className="w-10 h-10 animate-spin text-accent" />
        <span className="text-sm">INITIALIZING TELEMETRY LINK...</span>
        <span className="text-[0.7rem] opacity-50">Waiting for data from system_monitor.py</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-8 py-4 border-b border-border bg-gradient-to-b from-[#0d1520] to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 border-2 border-accent rounded-lg flex items-center justify-center relative shadow-[0_0_16px_rgba(0,212,255,0.3)]">
            <div className="w-3.5 h-3.5 bg-accent [clip-path:polygon(50%_0%,100%_50%,50%_100%,0%_50%)] animate-spin-slow" />
          </div>
          <h1 className="text-xl font-bold tracking-[0.12em] text-white uppercase">
            SYS<span className="text-accent">CORE</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-5 font-mono text-[0.75rem]">
          <div className={`w-2 h-2 rounded-full ${stats ? 'bg-accent-secondary shadow-[0_0_10px_#00ff88] animate-pulse-soft' : 'bg-muted'}`} />
          <span className="text-accent">{stats?.hostname || "—"}</span>
          <span className="text-muted">UPDATED {stats?.timestamp.slice(11, 19)}</span>
        </div>
      </header>

      {/* Main Grid */}
      <main className="max-w-[1400px] mx-auto p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* CPU Card */}
        <div className="glass-panel p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-[0.7rem] font-semibold tracking-[0.15em] uppercase text-muted">
              <Cpu className="w-4.5 h-4.5 opacity-80" />
              CPU
            </div>
            <span className="font-mono text-[0.7rem] text-muted">{stats?.cpu.frequency_mhz} MHz</span>
          </div>
          <div className="font-mono text-[2.4rem] text-white leading-none mb-1.5">
            {stats?.cpu.total_usage_percent}<span className="text-base text-muted ml-1">%</span>
          </div>
          <div className="font-mono text-[0.75rem] text-muted">
            {stats?.cpu.physical_cores} Physical · {stats?.cpu.logical_cores} Logical cores
          </div>
          <Gauge pct={stats?.cpu.total_usage_percent || 0} />
          
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2 mt-4">
            {stats?.cpu.per_core_percent.map((p, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <div className="w-full h-12 bg-surface border border-border rounded flex items-end overflow-hidden">
                  <div 
                    className="w-full bg-gradient-to-t from-accent to-accent/40 transition-all duration-1000 rounded-t-sm"
                    style={{ height: `${p}%` }}
                  />
                </div>
                <span className="font-mono text-[0.58rem] text-muted">C{i}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RAM Card */}
        <div className="glass-panel p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-[0.7rem] font-semibold tracking-[0.15em] uppercase text-muted">
              <Database className="w-4.5 h-4.5 opacity-80" />
              RAM
            </div>
          </div>
          <div className="font-mono text-[2.4rem] text-white leading-none mb-1.5">
            {stats?.ram.usage_percent}<span className="text-base text-muted ml-1">%</span>
          </div>
          <div className="font-mono text-[0.75rem] text-muted">
            {stats?.ram.used_gb} GB used of {stats?.ram.total_gb} GB
          </div>
          <Gauge pct={stats?.ram.usage_percent || 0} />
          
          <div className="grid grid-cols-2 gap-2.5 mt-4">
            {[
              { label: "Available", val: `${stats?.ram.available_gb} GB` },
              { label: "Swap Used", val: `${stats?.ram.swap_used_gb} GB` },
              { label: "Swap Total", val: `${stats?.ram.swap_total_gb} GB` },
              { label: "Swap %", val: `${stats?.ram.swap_percent}%` }
            ].map((cell, i) => (
              <div key={i} className="bg-surface border border-border rounded-lg p-2.5">
                <div className="text-[0.63rem] text-muted uppercase tracking-wider mb-1">{cell.label}</div>
                <div className="font-mono text-[0.88rem] text-[#c9d8e8]">{cell.val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* GPU Card */}
        <div className="glass-panel p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-[0.7rem] font-semibold tracking-[0.15em] uppercase text-muted">
              <Activity className="w-4.5 h-4.5 opacity-80" />
              GPU
            </div>
            <span className="font-mono text-[0.65rem] text-muted truncate max-w-[140px]">
              {stats?.gpu[0]?.name || "N/A"}
            </span>
          </div>
          {stats?.gpu[0] && !stats.gpu[0].error ? (
            <>
              <div className="font-mono text-[2.4rem] text-white leading-none mb-1.5">
                {stats.gpu[0].load_percent}<span className="text-base text-muted ml-1">%</span>
              </div>
              <div className="font-mono text-[0.75rem] text-muted">
                {stats.gpu[0].memory_used_mb} / {stats.gpu[0].memory_total_mb} MB VRAM
              </div>
              <Gauge pct={stats.gpu[0].load_percent || 0} label="Load" />
              <Gauge pct={stats.gpu[0].memory_usage_percent || 0} label="VRAM" />
              <div className="grid grid-cols-2 gap-2.5 mt-4">
                <div className="bg-surface border border-border rounded-lg p-2.5">
                  <div className="text-[0.63rem] text-muted uppercase tracking-wider mb-1">Temp</div>
                  <div className="font-mono text-[0.88rem] text-[#c9d8e8]">
                    {stats.gpu[0].temperature_c !== null ? `${stats.gpu[0].temperature_c} °C` : "N/A"}
                  </div>
                </div>
                <div className="bg-surface border border-border rounded-lg p-2.5">
                  <div className="text-[0.63rem] text-muted uppercase tracking-wider mb-1">Driver</div>
                  <div className="font-mono text-[0.72rem] text-[#c9d8e8] truncate">
                    {stats.gpu[0].driver || "N/A"}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-muted text-[0.75rem] mt-2 italic">
              {stats?.gpu[0]?.error || "No GPU telemetry detected"}
            </div>
          )}
        </div>

        {/* Battery Card */}
        <div className="glass-panel p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-[0.7rem] font-semibold tracking-[0.15em] uppercase text-muted">
              <Battery className="w-4.5 h-4.5 opacity-80" />
              Battery
            </div>
            {stats?.battery.available && (
              <span className={`text-[0.65rem] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full border ${
                stats.battery.charging ? 'bg-accent-secondary/10 text-accent-secondary border-accent-secondary/20' : 
                stats.battery.plugged_in ? 'bg-accent/10 text-accent border-accent/20' : 
                'bg-warn/10 text-warn border-warn/20'
              }`}>
                {stats.battery.charging ? '⚡ Charging' : stats.battery.plugged_in ? '🔌 Plugged In' : '⚡ Discharging'}
              </span>
            )}
          </div>
          {stats?.battery.available ? (
            <>
              <div className="flex items-center gap-3.5 mt-3.5">
                <div className="relative w-20 h-9 border-2 border-border rounded-md">
                  <div className="absolute top-1/2 -right-2 -translate-y-1/2 w-1.5 h-3.5 bg-border rounded-r-sm" />
                  <div 
                    className={`absolute inset-0.5 rounded-[2px] transition-all duration-1000 ${
                      stats.battery.percent <= 15 ? 'bg-danger' : stats.battery.percent <= 30 ? 'bg-warn' : 'bg-accent-secondary'
                    }`}
                    style={{ width: `calc(${stats.battery.percent}% - 4px)` }}
                  />
                </div>
                <div className="font-mono text-[1.4rem] text-white">
                  {stats.battery.percent}<span className="text-sm text-muted ml-0.5">%</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2.5 mt-4">
                <div className="bg-surface border border-border rounded-lg p-2.5">
                  <div className="text-[0.63rem] text-muted uppercase tracking-wider mb-1">Time Left</div>
                  <div className="font-mono text-[0.88rem] text-[#c9d8e8]">{stats.battery.time_left}</div>
                </div>
                <div className="bg-surface border border-border rounded-lg p-2.5">
                  <div className="text-[0.63rem] text-muted uppercase tracking-wider mb-1">Status</div>
                  <div className="font-mono text-[0.88rem] text-[#c9d8e8]">{stats.battery.plugged_in ? "On AC" : "On Battery"}</div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-muted text-[0.75rem] mt-2 italic">No battery detected</div>
          )}
        </div>

        {/* Wi-Fi Card */}
        <div className="glass-panel p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-[0.7rem] font-semibold tracking-[0.15em] uppercase text-muted">
              <Wifi className="w-4.5 h-4.5 opacity-80" />
              Wi-Fi
            </div>
            <div className="flex items-end gap-1 h-6">
              {[1, 2, 3, 4, 5].map((i) => {
                const strength = parseInt(stats?.wifi.signal || "0");
                const bars = Math.ceil((strength / 100) * 5);
                return (
                  <div 
                    key={i} 
                    className={`w-1.5 rounded-sm transition-colors duration-500 ${i <= bars ? 'bg-accent-secondary' : 'bg-border'}`}
                    style={{ height: `${i * 4 + 4}px` }}
                  />
                );
              })}
            </div>
          </div>
          <div className="font-mono text-[1.4rem] text-white truncate mb-1">
            {stats?.wifi.ssid || "N/A"}
          </div>
          <div className="font-mono text-[0.75rem] text-muted">
            {stats?.wifi.state} · {stats?.wifi.signal}
          </div>
          <div className="grid grid-cols-2 gap-2.5 mt-4">
            {[
              { label: "↓ Receive", val: `${stats?.wifi.receive_rate_mbps} Mbps` },
              { label: "↑ Transmit", val: `${stats?.wifi.transmit_rate_mbps} Mbps` },
              { label: "Radio", val: stats?.wifi.radio_type },
              { label: "Channel", val: stats?.wifi.channel }
            ].map((cell, i) => (
              <div key={i} className="bg-surface border border-border rounded-lg p-2.5">
                <div className="text-[0.63rem] text-muted uppercase tracking-wider mb-1">{cell.label}</div>
                <div className="font-mono text-[0.88rem] text-[#c9d8e8]">{cell.val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Network I/O Card */}
        <div className="glass-panel p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-[0.7rem] font-semibold tracking-[0.15em] uppercase text-muted">
              <Network className="w-4.5 h-4.5 opacity-80" />
              Network I/O
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { label: "↓ Received", val: `${stats?.network.bytes_recv_mb} MB` },
              { label: "↑ Sent", val: `${stats?.network.bytes_sent_mb} MB` },
              { label: "Pkts In", val: stats?.network.packets_recv.toLocaleString() },
              { label: "Pkts Out", val: stats?.network.packets_sent.toLocaleString() }
            ].map((cell, i) => (
              <div key={i} className="bg-surface border border-border rounded-lg p-2.5">
                <div className="text-[0.63rem] text-muted uppercase tracking-wider mb-1">{cell.label}</div>
                <div className="font-mono text-[0.88rem] text-[#c9d8e8]">{cell.val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Disk Card */}
        <div className="glass-panel p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-[0.7rem] font-semibold tracking-[0.15em] uppercase text-muted">
              <HardDrive className="w-4.5 h-4.5 opacity-80" />
              Storage
            </div>
          </div>
          <div className="space-y-4">
            {stats?.disk.map((d, i) => (
              <div key={i} className="disk-row">
                <div className="flex justify-between font-mono text-[0.7rem] text-accent mb-1">
                  <span>{d.device}</span>
                  <span className="text-muted">{d.filesystem}</span>
                </div>
                <Gauge pct={d.usage_percent} label={`${d.used_gb} GB / ${d.total_gb} GB`} />
              </div>
            ))}
          </div>
        </div>

        {/* System Info Card */}
        <div className="glass-panel p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-[0.7rem] font-semibold tracking-[0.15em] uppercase text-muted">
              <Thermometer className="w-4.5 h-4.5 opacity-80" />
              Environment
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center bg-surface border border-border rounded-lg p-3">
              <span className="text-[0.63rem] text-muted uppercase tracking-wider">Node Status</span>
              <span className="text-accent-secondary font-mono text-sm">ACTIVE</span>
            </div>
            <div className="flex justify-between items-center bg-surface border border-border rounded-lg p-3">
              <span className="text-[0.63rem] text-muted uppercase tracking-wider">Telemetry Link</span>
              <span className="text-accent font-mono text-sm">ENCRYPTED</span>
            </div>
            <div className="flex justify-between items-center bg-surface border border-border rounded-lg p-3">
              <span className="text-[0.63rem] text-muted uppercase tracking-wider">Protocol</span>
              <span className="text-[#c9d8e8] font-mono text-sm">SYS-V3</span>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
