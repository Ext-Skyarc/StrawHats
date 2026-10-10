import React, { useState } from 'react';
import { useGreenPulse, AppTab } from '../context/GreenPulseContext';
import { Menu, X, Settings } from 'lucide-react';
import { REGIONAL_TARIFFS } from '../data/initialData';

export const Navbar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    userSettings,
    updateSettings,
    streakDays,
    ecoPoints,
  } = useGreenPulse();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const navLinks: { id: AppTab; label: string; badge?: string }[] = [
    { id: 'dashboard', label: 'Home' },
    { id: 'calculator', label: 'Calculator', badge: '18+' },
    { id: 'waste', label: 'Report Waste' },
    { id: 'community', label: 'Community' },
    { id: 'leaderboard', label: 'Leaderboard' },
    { id: 'energy', label: 'Energy' },
    { id: 'coach', label: 'AI Consultant', badge: 'AI' },
    { id: 'missions', label: 'Streak & Habits' },
    { id: 'kiro', label: 'Kiro Portal' },
  ];

  const handleNavClick = (tab: AppTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <header className="topbar">
        {/* Brand */}
        <button
          onClick={() => handleNavClick('dashboard')}
          className="brand bg-transparent border-0 text-left cursor-pointer p-0"
        >
          <span className="brand-mark">🌍</span>
          <span>
            <strong>
              Eco<span>Quest</span>
            </strong>
            <small>SMALL ACTIONS. GREENER TOMORROWS.</small>
          </span>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex">
          {navLinks.map((link) => {
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`nav-link ${isActive ? 'active' : ''} flex items-center gap-1.5`}
              >
                <span>{link.label}</span>
                {link.badge && (
                  <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-full bg-[#8fe77d]/20 text-[#8fe77d] border border-[#8fe77d]/30">
                    {link.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Actions: Settings & Profile Pill */}
        <div className="flex items-center gap-2">
          {/* Settings Trigger */}
          <button
            onClick={() => setSettingsOpen(true)}
            className="p-2 rounded-xl text-[#a4b9a8] hover:text-[#8fe77d] hover:bg-[#102b1d] transition-colors border border-transparent hover:border-[#8fe77d]/20"
            title="Configure Tariff & Region Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Profile Pill */}
          <button
            onClick={() => handleNavClick('dashboard')}
            className="profile-pill"
            title="Your EcoQuest Personal Space"
          >
            <span className="avatar">🌱</span>
            <span id="navGreeting" className="max-w-[130px] truncate">
              {userSettings.userName ? `Hello, ${userSettings.userName}!` : 'Hello, Explorer!'}
            </span>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-[#a4b9a8] hover:text-[#8fe77d] hover:bg-[#102b1d]"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[73px] bg-[#071d12]/95 backdrop-blur-xl border-b border-[#8fe77d]/20 z-40 p-4 space-y-2 animate-fade-in shadow-2xl">
          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((link) => {
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`px-3 py-2.5 rounded-xl text-left text-xs font-bold transition-all flex items-center justify-between ${
                    isActive
                      ? 'bg-[#183d28] text-[#8fe77d] border border-[#8fe77d]/40'
                      : 'text-[#a4b9a8] hover:bg-[#0e2c1e] hover:text-[#f4f4df]'
                  }`}
                >
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#8fe77d]/20 text-[#8fe77d]">
                      {link.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-[#8fe77d]/15 flex items-center justify-between text-xs text-[#a4b9a8]">
            <span>Active Streak: <b className="text-[#f4cc69]">{streakDays} Days</b> 🔥</span>
            <span>Green Points: <b className="text-[#8fe77d]">{ecoPoints} pts</b></span>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {settingsOpen && (
        <div className="modal" onClick={() => setSettingsOpen(false)}>
          <div
            className="modal-box"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '440px', textAlign: 'left' }}
          >
            <button
              onClick={() => setSettingsOpen(false)}
              className="modal-close"
              aria-label="Close Settings"
            >
              ×
            </button>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">⚙️</span>
              <div>
                <h3 className="font-extrabold text-lg text-[#f4f4df] m-0">Settings & Regional Tariffs</h3>
                <small className="text-[#a4b9a8] text-xs">Used for electric energy calculations and grid factor formulas</small>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="field-label">Your Name / Explorer Alias</label>
                <input
                  type="text"
                  value={userSettings.userName}
                  onChange={(e) => updateSettings({ userName: e.target.value })}
                  className="field"
                  placeholder="e.g. Priyanshu"
                />
              </div>

              <div>
                <label className="field-label">Electricity Region Preset</label>
                <select
                  className="field"
                  value={userSettings.regionName}
                  onChange={(e) => {
                    const found = REGIONAL_TARIFFS.find((r) => r.name === e.target.value);
                    if (found) {
                      updateSettings({
                        regionName: found.name,
                        tariffRate: found.tariff,
                        gridCarbonFactor: found.gridFactor,
                        currency: found.currency,
                      });
                    }
                  }}
                >
                  {REGIONAL_TARIFFS.map((r) => (
                    <option key={r.name} value={r.name}>
                      {r.name} — {r.currency}{r.tariff}/kWh ({r.gridFactor} kg CO₂e/kWh)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="field-label">Tariff Rate ({userSettings.currency}/kWh)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={userSettings.tariffRate}
                    onChange={(e) => updateSettings({ tariffRate: parseFloat(e.target.value) || 0.16 })}
                    className="field"
                  />
                </div>
                <div>
                  <label className="field-label">Grid Factor (kg CO₂e/kWh)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={userSettings.gridCarbonFactor}
                    onChange={(e) => updateSettings({ gridCarbonFactor: parseFloat(e.target.value) || 0.385 })}
                    className="field"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() => setSettingsOpen(false)}
              className="btn btn-primary form-submit mt-6"
            >
              Save Settings ↗
            </button>
          </div>
        </div>
      )}
    </>
  );
};
