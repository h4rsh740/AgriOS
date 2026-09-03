'use client';
import AppShell from '@/components/layout/AppShell';
import { useEffect, useState } from 'react';
import { Globe, Zap, Users, Share2, Info, RefreshCw } from 'lucide-react';
import { DEMO_AGRIMESH_NODES } from '@/lib/demo/demoData';

type NodeStatus = 'active' | 'syncing' | 'offline';
type ContribType = 'disease_pattern' | 'practice' | 'crop_model' | 'climate_insight';

interface AgriMeshContrib {
  type: ContribType;
  title: string;
  description: string;
  crop?: string;
  region?: string;
  sharedAt: string;
}

interface AgriMeshNode {
  id: string;
  country: string;
  countryCode: string;
  nodeLabel: string;
  lat: number;
  lng: number;
  status: NodeStatus;
  contributionsCount: number;
  contributions: AgriMeshContrib[];
  modelVersion: string;
  lastSync: string;
  isSimulated: boolean;
}

const STATUS_COLOR: Record<NodeStatus, string> = {
  active: 'var(--agrios-green-400)',
  syncing: 'var(--agrios-amber-400)',
  offline: 'var(--agrios-red-400)',
};

const CONTRIB_TYPE_LABEL: Record<ContribType, string> = {
  disease_pattern: 'Disease Pattern',
  practice: 'Practice',
  crop_model: 'Crop Model',
  climate_insight: 'Climate',
};

const CONTRIB_TYPE_CLASS: Record<ContribType, string> = {
  disease_pattern: 'badge-red',
  practice: 'badge-green',
  crop_model: 'badge-blue',
  climate_insight: 'badge-soil',
};

const FLAG_EMOJIS: Record<string, string> = {
  IN: '🇮🇳', BR: '🇧🇷', ZA: '🇿🇦', CN: '🇨🇳', RU: '🇷🇺', AE: '🇦🇪',
};

function NodeCard({ node, selected, onSelect }: {
  node: AgriMeshNode;
  selected: boolean;
  onSelect: (n: AgriMeshNode) => void;
}) {
  // Keep "time since" labels fresh without calling Date.now() during render.
  const [now, setNow] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(id);
  }, []);

  const timeSince = (ts: string) => {
    const diff = Math.max(0, Math.floor((now - new Date(ts).getTime()) / 60000));
    return diff < 1 ? 'just now' : diff < 60 ? `${diff}m ago` : `${Math.floor(diff / 60)}h ago`;
  };

  return (
    <div
      onClick={() => onSelect(node)}
      className="card card-sm"
      style={{
        cursor: 'pointer',
        border: `2px solid ${selected ? STATUS_COLOR[node.status] : 'var(--border-default)'}`,
        background: selected ? `${STATUS_COLOR[node.status]}08` : 'white',
        transition: 'all 0.2s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
        <span style={{ fontSize: '1.4rem' }}>{FLAG_EMOJIS[node.countryCode] || '🌍'}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{node.country}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>v{node.modelVersion}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div className="dot" style={{ background: STATUS_COLOR[node.status], animation: node.status === 'active' ? 'pulse 2s infinite' : 'none' }} />
          <span style={{ fontSize: '0.72rem', color: STATUS_COLOR[node.status], fontWeight: 600, textTransform: 'capitalize' }}>{node.status}</span>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.1rem', color: STATUS_COLOR[node.status] }}>{node.contributionsCount}</div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Contributions</div>
        </div>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{timeSince(node.lastSync)}</div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Last Sync</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
        {node.contributions.slice(0, 2).map((c, i) => (
          <span key={i} className={`badge ${CONTRIB_TYPE_CLASS[c.type]}`} style={{ fontSize: '0.6rem' }}>{CONTRIB_TYPE_LABEL[c.type]}</span>
        ))}
        {node.contributions.length > 2 && <span className="badge badge-dark" style={{ fontSize: '0.6rem' }}>+{node.contributions.length - 2}</span>}
      </div>
    </div>
  );
}

export default function AgriMeshPage() {
  const nodes: AgriMeshNode[] = DEMO_AGRIMESH_NODES;
  const [selected, setSelected] = useState<AgriMeshNode | null>(nodes[0]);
  const [liveLog, setLiveLog] = useState<string[]>([]);

  useEffect(() => {
    // Simulate live feed
    const messages = [
      '🇮🇳 India node shared: Wheat Yellow Rust Patterns (Punjab)',
      '🇧🇷 Brazil node shared: Soybean Asian Rust Early Warning',
      '🇿🇦 South Africa syncing climate intelligence data...',
      '🇨🇳 China node contributed: Rice Precision Fertilization Model v2.3',
      '🇷🇺 Russia node: Cold-Weather Soil Protection Practices updated',
      '🇦🇪 UAE node online: Desert Hydroponics Water Efficiency model shared',
      '🌐 AgriMesh consensus: High disease pressure detected across South Asia',
    ];
    let i = 0;
    const interval = setInterval(() => {
      if (i < messages.length) {
        setLiveLog(prev => [messages[i], ...prev].slice(0, 6));
        i++;
      }
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  const totalContribs = nodes.reduce((s, n) => s + n.contributionsCount, 0);
  const activeNodes = nodes.filter(n => n.status === 'active').length;

  return (
    <AppShell>
      <div style={{ padding: '28px', minHeight: '100vh' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <Globe size={22} color="var(--agrios-sky-600)" />
              <h2 style={{ margin: 0 }}>AgriMesh — BRICS Cooperation Network</h2>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Federated agricultural intelligence · Sovereign · Privacy-preserving · BRICS Nations
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span className="badge badge-demo">Simulated for Demo</span>
            <span className="badge badge-green">
              <div className="dot dot-green dot-pulse" />
              {activeNodes}/{nodes.length} Active
            </span>
          </div>
        </div>

        {/* Stats bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
          {[
            { icon: Globe, label: 'BRICS Nodes', value: String(nodes.length), color: 'var(--agrios-sky-600)' },
            { icon: Zap, label: 'Active', value: String(activeNodes), color: 'var(--agrios-green-500)' },
            { icon: Share2, label: 'Total Contributions', value: String(totalContribs), color: 'var(--agrios-soil-500)' },
            { icon: Users, label: 'Cooperative Model', value: 'Federated', color: 'var(--agrios-sky-400)' },
          ].map((stat, i) => (
            <div key={i} className="card card-sm" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: 40, height: 40, background: `${stat.color}18`, borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <stat.icon size={18} color={stat.color} />
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.3rem' }}>{stat.value}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '20px' }}>
          {/* Node list */}
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>Network Nodes</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {nodes.map(node => (
                <NodeCard key={node.id} node={node} selected={selected?.id === node.id} onSelect={setSelected} />
              ))}
            </div>
          </div>

          {/* Detail panel */}
          <div>
            {selected && (
              <div className="card" style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                  <span style={{ fontSize: '2rem' }}>{FLAG_EMOJIS[selected.countryCode] || '🌍'}</span>
                  <div>
                    <h3 style={{ margin: 0 }}>{selected.country} AgriMesh Node</h3>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{selected.nodeLabel}</div>
                  </div>
                  <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                    <span className={`badge ${selected.status === 'active' ? 'badge-green' : 'badge-amber'}`} style={{ textTransform: 'capitalize' }}>{selected.status}</span>
                    <span className="badge badge-blue">v{selected.modelVersion}</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                  {[
                    { label: 'Contributions', value: selected.contributionsCount },
                    { label: 'Lat/Lng', value: `${selected.lat.toFixed(1)}, ${selected.lng.toFixed(1)}` },
                    { label: 'Model Version', value: `v${selected.modelVersion}` },
                  ].map((item, i) => (
                    <div key={i} style={{ padding: '12px', background: 'var(--surface-muted)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1rem' }}>{item.value}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '3px' }}>{item.label}</div>
                    </div>
                  ))}
                </div>

                <h4 style={{ marginBottom: '14px' }}>Recent Contributions</h4>
                {selected.contributions.map((contrib, i) => (
                  <div key={i} style={{ padding: '14px', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', marginBottom: '10px', background: 'var(--surface-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ flex: 1 }}>
                        <span className={`badge ${CONTRIB_TYPE_CLASS[contrib.type]}`} style={{ marginBottom: '6px', display: 'inline-block' }}>{CONTRIB_TYPE_LABEL[contrib.type]}</span>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{contrib.title}</div>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', flexShrink: 0, marginLeft: '8px' }}>
                        {new Date(contrib.sharedAt).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0, marginBottom: '8px' }}>{contrib.description}</p>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {contrib.crop && <span className="badge badge-green" style={{ fontSize: '0.62rem' }}>{contrib.crop}</span>}
                      {contrib.region && <span className="badge badge-soil" style={{ fontSize: '0.62rem' }}>{contrib.region}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Live feed */}
            <div className="card card-dark">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <RefreshCw size={14} color="var(--agrios-green-300)" style={{ animation: 'spin 3s linear infinite' }} />
                <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'white', fontSize: '0.9rem' }}>Live AgriMesh Feed</span>
                <span className="badge badge-dark" style={{ marginLeft: 'auto' }}>Simulated</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '250px', overflowY: 'auto' }}>
                {liveLog.length === 0 && <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem' }}>Connecting to AgriMesh network...</div>}
                {liveLog.map((msg, i) => (
                  <div key={i} style={{ fontSize: '0.8rem', color: i === 0 ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.45)', padding: '8px', borderRadius: '6px', background: i === 0 ? 'rgba(45,155,90,0.15)' : 'transparent', borderLeft: i === 0 ? '2px solid var(--agrios-green-400)' : '2px solid transparent', transition: 'all 0.3s', lineHeight: 1.5 }}>
                    {msg}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Architecture note */}
        <div className="card" style={{ marginTop: '24px', background: 'var(--agrios-green-50)', border: '1px solid var(--agrios-green-100)' }}>
          <h4 style={{ marginBottom: '12px' }}>AgriMesh Architecture — Federated Intelligence</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            {[
              { title: 'Data Sovereignty', desc: 'Raw farm data never leaves your national node. Only anonymized, aggregated insights are shared across the network.' },
              { title: 'Federated Learning', desc: 'AI models are trained locally and only model updates (not data) are shared — privacy-preserving by design.' },
              { title: 'Open Protocol', desc: 'AgriMesh uses open standards. Any BRICS nation or agricultural institution can operate their own sovereign node.' },
              { title: 'Consensus Intelligence', desc: 'Disease patterns, practice insights, and climate signals are validated across multiple nodes before being shared network-wide.' },
            ].map((item, i) => (
              <div key={i}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '6px', color: 'var(--agrios-green-700)' }}>{item.title}</div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginTop: '12px', alignItems: 'center' }}>
          <Info size={12} color="var(--text-muted)" />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>All AgriMesh nodes are simulated for demonstration purposes. The actual network would require bilateral agreements between participating nations.</span>
        </div>
      </div>
    </AppShell>
  );
}
