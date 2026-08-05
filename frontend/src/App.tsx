import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { DashboardPage } from './pages/DashboardPage';
import { UploadResumePage } from './pages/UploadResumePage';
import { ResumeAnalysisPage } from './pages/ResumeAnalysisPage';
import { CandidateRankingPage } from './pages/CandidateRankingPage';
import { EvaluationPage } from './pages/EvaluationPage';
import { SettingsPage } from './pages/SettingsPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="upload" element={<UploadResumePage />} />
          <Route path="analysis" element={<ResumeAnalysisPage />} />
          <Route path="analysis/:id" element={<ResumeAnalysisPage />} />
          <Route path="ranking" element={<CandidateRankingPage />} />
          <Route path="evaluation" element={<EvaluationPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
