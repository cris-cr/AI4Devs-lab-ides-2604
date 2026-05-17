import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Dashboard } from '../pages/Dashboard';
import * as service from '../services/candidate.service';

jest.mock('../services/candidate.service');

const mockCandidate = {
  id: 1,
  firstName: 'Alice',
  lastName: 'Smith',
  email: 'alice@example.com',
  phone: null,
  address: null,
  education: null,
  workExperience: null,
  cvPath: null,
  createdAt: '',
  updatedAt: '',
};

beforeEach(() => jest.clearAllMocks());

const renderDashboard = () =>
  render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>,
  );

describe('Dashboard', () => {
  it('renders candidate list when data is returned', async () => {
    (service.fetchCandidates as jest.Mock).mockResolvedValue([mockCandidate]);
    renderDashboard();
    await waitFor(() => expect(screen.getByText(/Alice Smith/)).toBeInTheDocument());
  });

  it('renders empty state message when list is empty', async () => {
    (service.fetchCandidates as jest.Mock).mockResolvedValue([]);
    renderDashboard();
    await waitFor(() =>
      expect(screen.getByText(/no candidates/i)).toBeInTheDocument(),
    );
  });

  it('renders error message when fetch fails', async () => {
    (service.fetchCandidates as jest.Mock).mockRejectedValue(new Error('network error'));
    renderDashboard();
    await waitFor(() =>
      expect(screen.getByText(/could not load candidates/i)).toBeInTheDocument(),
    );
  });

  it('"Add Candidate" link is present and points to /candidates/new', async () => {
    (service.fetchCandidates as jest.Mock).mockResolvedValue([]);
    renderDashboard();
    const link = await waitFor(() => screen.getByRole('link', { name: /add candidate/i }));
    expect(link).toHaveAttribute('href', '/candidates/new');
  });
});
