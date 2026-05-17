import React from 'react';
import { render, screen } from '@testing-library/react';
import { AppBar } from '../components/AppBar';

describe('AppBar', () => {
  it('renders the application name', () => {
    render(<AppBar />);
    expect(screen.getByText('LTI – Talent Tracker')).toBeInTheDocument();
  });
});
