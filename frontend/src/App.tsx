import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppBar } from './components/AppBar';
import { Dashboard } from './pages/Dashboard';
import { AddCandidate } from './pages/AddCandidate';

const App = (): JSX.Element => (
  <BrowserRouter>
    <AppBar />
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/candidates/new" element={<AddCandidate />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
);

export default App;
