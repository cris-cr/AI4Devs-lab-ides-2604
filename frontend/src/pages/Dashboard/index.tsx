import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchCandidates } from '../../services/candidate.service';
import { Candidate } from '../../types/candidate';

export const Dashboard = (): JSX.Element => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCandidates()
      .then(setCandidates)
      .catch(() => setError('Could not load candidates. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Candidates</h1>
        <Link
          to="/candidates/new"
          className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 transition-colors"
        >
          + Add Candidate
        </Link>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" role="status" aria-label="Loading candidates" />
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {!loading && !error && candidates.length === 0 && (
        <div className="text-center py-16">
          <p className="text-slate-500 text-base">No candidates have been added yet.</p>
          <p className="text-slate-400 text-sm mt-1">Get started by adding your first candidate.</p>
        </div>
      )}

      {!loading && !error && candidates.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-slate-200 shadow-sm">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Email
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {candidates.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-slate-800">
                    {c.firstName} {c.lastName}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {c.email}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
};
