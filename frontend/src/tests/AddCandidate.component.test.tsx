import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AddCandidate } from '../pages/AddCandidate';
import * as service from '../services/candidate.service';

jest.mock('../services/candidate.service');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockNavigate.mockReset();
});

const renderForm = () =>
  render(
    <MemoryRouter>
      <AddCandidate />
    </MemoryRouter>,
  );

describe('AddCandidate form fields', () => {
  it('renders all required and optional fields', () => {
    renderForm();
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/education/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/work experience/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cv/i)).toBeInTheDocument();
  });
});

describe('AddCandidate validation', () => {
  it('shows inline error when firstName is empty on submit', async () => {
    renderForm();
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    await waitFor(() =>
      expect(screen.getByText(/first name is required/i)).toBeInTheDocument(),
    );
  });

  it('shows inline error when email is invalid on submit', async () => {
    renderForm();
    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'Alice' } });
    fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Smith' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'not-an-email' } });
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    await waitFor(() =>
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument(),
    );
  });
});

describe('AddCandidate submission', () => {
  const fillRequiredFields = () => {
    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'Alice' } });
    fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Smith' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'alice@example.com' } });
  };

  it('calls createCandidate and navigates to / on success', async () => {
    (service.createCandidate as jest.Mock).mockResolvedValue({ id: 1 });
    renderForm();
    fillRequiredFields();
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    await waitFor(() => expect(service.createCandidate).toHaveBeenCalled());
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/'));
  });

  it('shows success message after successful submission', async () => {
    (service.createCandidate as jest.Mock).mockResolvedValue({ id: 1 });
    renderForm();
    fillRequiredFields();
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    await waitFor(() =>
      expect(screen.getByText(/candidate added successfully/i)).toBeInTheDocument(),
    );
  });

  it('shows error message without raw details on server error', async () => {
    (service.createCandidate as jest.Mock).mockRejectedValue(new Error('Validation failed'));
    renderForm();
    fillRequiredFields();
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    await waitFor(() =>
      expect(screen.getByText(/could not add candidate/i)).toBeInTheDocument(),
    );
    expect(screen.queryByText(/Validation failed/)).not.toBeInTheDocument();
  });

  it('Cancel navigates to / without calling service', () => {
    renderForm();
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(service.createCandidate).not.toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});
