import React from 'react';

export const AppBar = (): JSX.Element => (
  <header
    role="banner"
    className="bg-slate-800 text-white shadow-md"
  >
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
      <span className="text-xl font-semibold tracking-tight text-indigo-300">
        LTI – Talent Tracker
      </span>
    </div>
  </header>
);
