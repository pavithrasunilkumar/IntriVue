const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function getToken(): string | null {
  return localStorage.getItem('token');
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token
    ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    : { 'Content-Type': 'application/json' };
}

async function handleResponse(res: Response) {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

// ─── AUTH ────────────────────────────────

export async function register(payload: Record<string, unknown>) {
  const res = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function login(username: string, password: string) {
  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await handleResponse(res);
  // Persist token + user
  localStorage.setItem('token', data.token);
  localStorage.setItem('userData', JSON.stringify(data.user));
  localStorage.setItem('userRole', data.user.role);
  return data;
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('userData');
  localStorage.removeItem('userRole');
}

export function getCurrentUser() {
  const raw = localStorage.getItem('userData');
  return raw ? JSON.parse(raw) : null;
}

// ─── PROFILE ─────────────────────────────

export async function saveProfile(payload: Record<string, unknown>) {
  const res = await fetch(`${API_URL}/save-profile`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await handleResponse(res);
  if (data.user) localStorage.setItem('userData', JSON.stringify(data.user));
  return data;
}

export async function getProfile() {
  const res = await fetch(`${API_URL}/get-profile`, {
    method: 'POST',
    headers: authHeaders(),
  });
  const data = await handleResponse(res);
  if (data.user) localStorage.setItem('userData', JSON.stringify(data.user));
  return data;
}

// ─── JOBS ─────────────────────────────────

export async function fetchJobs() {
  const res = await fetch(`${API_URL}/jobs`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
}

export async function createJob(payload: Record<string, unknown>) {
  const res = await fetch(`${API_URL}/create-job`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function fetchCompanyJobs() {
  const res = await fetch(`${API_URL}/company/jobs`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
}

// ─── APPLICATIONS ──────────────────────────

export async function applyToJob(jobId: string) {
  const res = await fetch(`${API_URL}/apply`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ jobId }),
  });
  return handleResponse(res);
}

export async function fetchAppliedJobs() {
  const res = await fetch(`${API_URL}/applied-jobs`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
}

export async function fetchJobApplicants(jobId: string) {
  const res = await fetch(`${API_URL}/company/applicants/${jobId}`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
}

export async function closeJob(jobId: string) {
  const res = await fetch(`${API_URL}/company/jobs/${jobId}/close`, {
    method: 'PATCH',
    headers: authHeaders(),
  });
  return handleResponse(res);
}