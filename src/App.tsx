import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage.js';
import { MintPage } from './pages/MintPage.js';
import { VaultPage } from './pages/VaultPage.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { StakePage } from './pages/StakePage.js';
import { FarmPage } from './pages/FarmPage.js';
import { HarvestPage } from './pages/HarvestPage.js';
import { PortfolioPage } from './pages/PortfolioPage.js';

export function App(): React.ReactElement {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/mint" element={<MintPage />} />
        <Route path="/vault" element={<VaultPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/stake" element={<StakePage />} />
        <Route path="/farm" element={<FarmPage />} />
        <Route path="/harvest" element={<HarvestPage />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
      </Routes>
    </BrowserRouter>
  );
}
