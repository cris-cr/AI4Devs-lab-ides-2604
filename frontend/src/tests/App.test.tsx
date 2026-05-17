import { render, screen } from '@testing-library/react';
import * as service from '../services/candidate.service';
import App from '../App';

jest.mock('../services/candidate.service');

test('renders the app bar with application name', () => {
  (service.fetchCandidates as jest.Mock).mockResolvedValue([]);
  render(<App />);
  expect(screen.getByText('LTI – Talent Tracker')).toBeInTheDocument();
});
