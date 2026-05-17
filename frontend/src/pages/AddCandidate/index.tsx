import React, { useReducer, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCandidate } from '../../services/candidate.service';
import { CreateCandidateDto } from '../../types/candidate';

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  education: string;
  workExperience: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
}

type FormAction =
  | { type: 'set'; field: keyof FormState; value: string }
  | { type: 'reset' };

const initialState: FormState = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  education: '',
  workExperience: '',
};

function formReducer(state: FormState, action: FormAction): FormState {
  if (action.type === 'reset') return initialState;
  return { ...state, [action.field]: action.value };
}

const isValidEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const labelClass = 'block text-sm font-medium text-slate-700 mb-1';
const inputClass =
  'block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500';
const inputErrorClass =
  'block w-full rounded-md border border-red-400 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 shadow-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500';

export const AddCandidate = (): JSX.Element => {
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(formReducer, initialState);
  const [cvFile, setCvFile] = useState<File | undefined>(undefined);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const validate = (): FormErrors => {
    const errs: FormErrors = {};
    if (!state.firstName.trim()) errs.firstName = 'First name is required';
    if (!state.lastName.trim()) errs.lastName = 'Last name is required';
    if (!state.email.trim()) {
      errs.email = 'Email is required';
    } else if (!isValidEmail(state.email)) {
      errs.email = 'Invalid email format';
    }
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const dto: CreateCandidateDto = {
      firstName: state.firstName,
      lastName: state.lastName,
      email: state.email,
      phone: state.phone || undefined,
      address: state.address || undefined,
      education: state.education || undefined,
      workExperience: state.workExperience || undefined,
    };

    try {
      await createCandidate(dto, cvFile);
      setSuccess(true);
      navigate('/');
    } catch {
      setSubmitError('Could not add candidate. Please try again.');
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-slate-800 mb-8">Add Candidate</h1>

      {success && (
        <div role="alert" className="mb-6 rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
          Candidate added successfully
        </div>
      )}

      {submitError && (
        <div role="alert" className="mb-6 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* First Name */}
          <div>
            <label htmlFor="firstName" className={labelClass}>
              First Name <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <input
              id="firstName"
              type="text"
              value={state.firstName}
              onChange={(e) => dispatch({ type: 'set', field: 'firstName', value: e.target.value })}
              aria-required="true"
              aria-describedby={errors.firstName ? 'firstName-error' : undefined}
              className={errors.firstName ? inputErrorClass : inputClass}
            />
            {errors.firstName && (
              <span id="firstName-error" role="alert" className="mt-1 block text-xs text-red-600">
                {errors.firstName}
              </span>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label htmlFor="lastName" className={labelClass}>
              Last Name <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <input
              id="lastName"
              type="text"
              value={state.lastName}
              onChange={(e) => dispatch({ type: 'set', field: 'lastName', value: e.target.value })}
              aria-required="true"
              aria-describedby={errors.lastName ? 'lastName-error' : undefined}
              className={errors.lastName ? inputErrorClass : inputClass}
            />
            {errors.lastName && (
              <span id="lastName-error" role="alert" className="mt-1 block text-xs text-red-600">
                {errors.lastName}
              </span>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className={labelClass}>
              Email <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <input
              id="email"
              type="email"
              value={state.email}
              onChange={(e) => dispatch({ type: 'set', field: 'email', value: e.target.value })}
              aria-required="true"
              aria-describedby={errors.email ? 'email-error' : undefined}
              className={errors.email ? inputErrorClass : inputClass}
            />
            {errors.email && (
              <span id="email-error" role="alert" className="mt-1 block text-xs text-red-600">
                {errors.email}
              </span>
            )}
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className={labelClass}>Phone</label>
            <input
              id="phone"
              type="text"
              value={state.phone}
              onChange={(e) => dispatch({ type: 'set', field: 'phone', value: e.target.value })}
              className={inputClass}
            />
          </div>

          {/* Address */}
          <div className="md:col-span-2">
            <label htmlFor="address" className={labelClass}>Address</label>
            <input
              id="address"
              type="text"
              value={state.address}
              onChange={(e) => dispatch({ type: 'set', field: 'address', value: e.target.value })}
              className={inputClass}
            />
          </div>

          {/* Education */}
          <div className="md:col-span-2">
            <label htmlFor="education" className={labelClass}>Education</label>
            <textarea
              id="education"
              rows={3}
              value={state.education}
              onChange={(e) => dispatch({ type: 'set', field: 'education', value: e.target.value })}
              className={inputClass}
            />
          </div>

          {/* Work Experience */}
          <div className="md:col-span-2">
            <label htmlFor="workExperience" className={labelClass}>Work Experience</label>
            <textarea
              id="workExperience"
              rows={3}
              value={state.workExperience}
              onChange={(e) => dispatch({ type: 'set', field: 'workExperience', value: e.target.value })}
              className={inputClass}
            />
          </div>

          {/* CV Upload */}
          <div className="md:col-span-2">
            <label htmlFor="cv" className={labelClass}>CV</label>
            <input
              id="cv"
              type="file"
              accept="application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              aria-label="Upload CV — accepted formats: PDF or DOCX, maximum 5 MB"
              onChange={(e) => setCvFile(e.target.files?.[0])}
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            />
            <p className="mt-1 text-xs text-slate-400">PDF or DOCX, max 5 MB</p>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full sm:w-auto px-6 py-2 rounded-md border border-slate-300 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2 rounded-md bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 transition-colors"
          >
            Submit
          </button>
        </div>
      </form>
    </main>
  );
};
