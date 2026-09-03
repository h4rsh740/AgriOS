'use client';
import AppShell from '@/components/layout/AppShell';
import { DEMO_WEATHER } from '@/lib/demo/demoData';
import { CloudRain, Wind, Droplets, Thermometer, Info, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function WeatherPage() {
  const weather = DEMO_WEATHER;

  const chartData = weather.forecast.map(d => ({
    day: new Date(d.date).toLocaleDateString('en', { weekday: 'short' }),
    maxTemp: d.maxTemp,
    minTemp: d.minTemp,
    rain: d.precipitation,
    rainProb: d.precipitationProbability,
    humidity: d.humidity,
  }));

  return (
    <AppShell>
      <div style={{ padding: '28px', minHeight: '100vh' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <CloudRain size={20} color="var(--agrios-sky-600)" />
              <h2 style={{ margin: 0 }}>Weather Intelligence</h2>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Lucknow, Uttar Pradesh, India · Open-Meteo</p>
          </div>
          <span className="badge badge-demo">Demo Data</span>
        </div>

        {/* Current conditions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px', marginBottom: '24px' }}>
          {[
            { icon: Thermometer, label: 'Temperature', value: `${weather.current.temperature}°C`, note: `Feels ${weather.current.apparentTemperature}°C`, color: 'var(--agrios-red-400)' },
            { icon: Droplets, label: 'Humidity', value: `${weather.current.humidity}%`, note: weather.current.humidity > 70 ? '⚠ Disease risk' : 'Normal', color: 'var(--agrios-sky-600)' },
            { icon: CloudRain, label: 'Precipitation', value: `${weather.current.precipitation}mm`, note: 'Current', color: 'var(--agrios-sky-400)' },
            { icon: Wind, label: 'Wind Speed', value: `${weather.current.windSpeed} km/h`, note: weather.current.windSpeed < 20 ? 'Calm' : 'Moderate', color: 'var(--text-muted)' },
          ].map((item, i) => (
            <div key={i} className="card card-sm">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <item.icon size={16} color={item.color} />
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>{item.label}</span>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: 600, marginBottom: '3px' }}>{item.value}</div>
              <div style={{ fontSize: '0.72rem', color: item.note.includes('⚠') ? '#92400e' : 'var(--text-muted)' }}>{item.note}</div>
            </div>
          ))}
        </div>

        {/* Risk cards */}
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ marginBottom: '14px' }}>Agricultural Risk Assessment</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            {[
              { label: 'Disease Risk', value: weather.risks.diseaseRisk, icon: AlertTriangle },
              { label: 'Heat Stress', value: weather.risks.heatStress, icon: Thermometer },
              { label: 'Irrigation Stress', value: weather.risks.irrigationStress, icon: Droplets },
              { label: 'Drought Risk', value: weather.risks.droughtRisk, icon: CloudRain },
              { label: 'Spray Conditions', value: weather.risks.sprayConditions, icon: Wind },
              { label: 'Rainfall Opportunity', value: weather.risks.rainfallOpportunity ? 'Yes' : 'No', icon: CloudRain },
            ].map((risk, i) => {
              const isHigh = risk.value === 'high' || risk.value === 'critical';
              const isModerate = risk.value === 'moderate' || risk.value === 'marginal';
              return (
                <div key={i} className="card card-sm" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <risk.icon size={18} color={isHigh ? 'var(--agrios-red-400)' : isModerate ? 'var(--agrios-amber-400)' : 'var(--agrios-green-500)'} />
                  <div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '3px' }}>{risk.label}</div>
                    <span className={`badge ${isHigh ? 'badge-red' : isModerate ? 'badge-amber' : 'badge-green'}`} style={{ textTransform: 'capitalize' }}>{risk.value}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Temperature chart */}
        <div className="card" style={{ marginBottom: '16px' }}>
          <h4 style={{ marginBottom: '20px' }}>7-Day Temperature Forecast</h4>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--agrios-red-400)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--agrios-red-400)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-muted)" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} unit="°C" />
              <Tooltip formatter={(v) => [`${v}°C`]} contentStyle={{ borderRadius: '8px', border: '1px solid var(--border-default)' }} />
              <Area type="monotone" dataKey="maxTemp" stroke="var(--agrios-red-400)" fill="url(#tempGradient)" strokeWidth={2} name="Max Temp" />
              <Area type="monotone" dataKey="minTemp" stroke="var(--agrios-sky-600)" fill="transparent" strokeWidth={2} name="Min Temp" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Rainfall chart */}
        <div className="card" style={{ marginBottom: '16px' }}>
          <h4 style={{ marginBottom: '20px' }}>Rainfall Forecast</h4>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-muted)" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} unit="mm" />
              <Tooltip formatter={(v, name) => [name === 'rain' ? `${v}mm` : `${v}%`, name === 'rain' ? 'Rainfall' : 'Rain Probability']} contentStyle={{ borderRadius: '8px' }} />
              <Bar dataKey="rain" fill="var(--agrios-sky-400)" name="rain" radius={[4,4,0,0]} />
              <Bar dataKey="rainProb" fill="var(--agrios-sky-100)" name="rainProb" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="data-source-label"><Info size={12} /> Source: Open-Meteo · No API key required · Demo Data · Updated every 15 min</div>
      </div>
    </AppShell>
  );
}
