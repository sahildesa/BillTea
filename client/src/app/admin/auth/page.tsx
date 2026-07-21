'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveAuthData, API_BASE } from '../../../lib/auth';

type AuthUser = Parameters<typeof saveAuthData>[2];

type AdminLoginResponse = {
  success?: boolean;
  message?: string;
  accessToken?: string;
  refreshToken?: string;
  user?: AuthUser;
};

function MailIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 6h16v12H4V6Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="m4 7 8 6 8-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
      <rect
        x="5"
        y="10"
        width="14"
        height="10"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M8 10V7a4 4 0 0 1 8 0v3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function EyeIcon({ hidden }: { hidden: boolean }) {
  if (hidden) {
    return (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
        <path
          d="M3 3l18 18"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M10.6 10.6A2 2 0 0 0 13.4 13.4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M9.9 4.2A10.7 10.7 0 0 1 12 4c5 0 9 5 9 8a8.8 8.8 0 0 1-2 3.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M6.6 6.6C4.4 8 3 10.3 3 12c0 3 4 8 9 8a10.4 10.4 0 0 0 4.3-.9"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
      <path
        d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle
        cx="12"
        cy="12"
        r="3"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 3 5 6v5c0 5 3 9 7 10 4-1 7-5 7-10V6l-7-3Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="m9 12 2 2 4-4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
      <path
        d="M12 2v2M12 20v2M2 12h2M20 12h2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="m4.93 4.93 1.41 1.41M17.66 17.66l1.41 1.41M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
      <path
        d="M21 14.5A8.5 8.5 0 0 1 9.5 3 7 7 0 1 0 21 14.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
      <path
        d="M3 11l9-8 9 8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 10v10h14V10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M9 20v-6h6v6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function AdminLoginPage() {
  const router = useRouter();

  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  const [adminError, setAdminError] = useState<string | null>(null);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminSuccess, setAdminSuccess] = useState(false);

  const [isLightTheme, setIsLightTheme] = useState(false);
  const [logoSrc, setLogoSrc] = useState('/logo.jpg');
  const [logoFailed, setLogoFailed] = useState(false);

  const isFormValid =
    adminEmail.trim().length > 0 && adminPassword.trim().length > 0;

  const getMainWebsiteOrigin = () => {
    if (typeof window === 'undefined') {
      return '';
    }

    const { protocol, hostname, port } = window.location;
    const mainHostname = hostname.replace(/^admin\./, '');

    return `${protocol}//${mainHostname}${port ? `:${port}` : ''}`;
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const shouldUseLightTheme = savedTheme === 'light';

    document.documentElement.classList.toggle('light', shouldUseLightTheme);
    document.documentElement.classList.toggle('dark', !shouldUseLightTheme);

    setIsLightTheme(shouldUseLightTheme);
    setLogoSrc(`${getMainWebsiteOrigin()}/logo.jpg`);
  }, []);

  const validateAdminForm = () => {
    const trimmedEmail = adminEmail.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(trimmedEmail)) {
      setAdminError('Please enter a valid email address.');
      return false;
    }

    if (!adminPassword.trim()) {
      setAdminError('Please enter your password.');
      return false;
    }

    return true;
  };

  const readLoginResponse = async (response: Response) => {
    try {
      return (await response.json()) as AdminLoginResponse;
    } catch {
      return {} as AdminLoginResponse;
    }
  };

  const handleThemeToggle = () => {
    const nextThemeIsLight = !isLightTheme;

    document.documentElement.classList.toggle('light', nextThemeIsLight);
    document.documentElement.classList.toggle('dark', !nextThemeIsLight);

    localStorage.setItem('theme', nextThemeIsLight ? 'light' : 'dark');
    setIsLightTheme(nextThemeIsLight);
  };

  const handleGoHome = () => {
    window.location.href = `${getMainWebsiteOrigin()}/`;
  };

  const handleForgotPassword = () => {
    router.push('/forgot-password');
  };

  const handleAdminLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setAdminError(null);

    if (!validateAdminForm()) {
      return;
    }

    try {
      setAdminLoading(true);

      const response = await fetch(`${API_BASE}/admin/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: adminEmail.trim(),
          password: adminPassword,
        }),
      });

      const data = await readLoginResponse(response);

      if (!response.ok || !data.success) {
        setAdminError(data.message || 'Invalid admin credentials.');
        return;
      }

      if (!data.accessToken || !data.refreshToken || !data.user) {
        setAdminError('Login response is missing required authentication data.');
        return;
      }

      saveAuthData(data.accessToken, data.refreshToken, data.user);

      setAdminSuccess(true);

      setTimeout(() => {
        router.push('/dashboard');
      }, 1800);
    } catch {
      setAdminError('Unable to connect to server. Please check your connection.');
    } finally {
      setAdminLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-on-surface overflow-hidden">
      <section className="relative min-h-screen flex items-center justify-center px-6 py-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent pointer-events-none" />

        <div className="absolute right-8 top-8 hidden sm:flex items-center gap-4 z-[9999] pointer-events-auto">
          <button
            type="button"
            onClick={handleThemeToggle}
            aria-label="Toggle theme"
            className="h-12 w-12 rounded-full glass-panel flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
          >
            {isLightTheme ? <MoonIcon /> : <SunIcon />}
          </button>

          <button
            type="button"
            onClick={handleGoHome}
            aria-label="Go home"
            className="h-12 w-12 rounded-full glass-panel flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
          >
            <HomeIcon />
          </button>
        </div>

        <div className="w-full max-w-md animate-fade-in relative z-10">
          <div className="flex items-center justify-center gap-4 mb-10">
            {logoFailed ? (
              <div className="h-12 w-12 rounded-xl border border-primary/30 bg-primary/10 flex items-center justify-center text-primary font-bold shadow-lg shadow-primary/20">
                IT
              </div>
            ) : (
              <img
                src={logoSrc}
                alt="Indux Technology Logo"
                onError={() => setLogoFailed(true)}
                className="h-12 w-12 rounded-xl object-cover border border-primary/30 shadow-lg shadow-primary/20"
              />
            )}

            <h1 className="text-3xl font-display font-semibold text-on-surface text-glow">
              Indux Technology
            </h1>
          </div>

          <div className="glass-panel-elevated rounded-3xl p-8 sm:p-10 relative overflow-hidden transition-all duration-300">
            <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-primary to-transparent opacity-70" />

            <div className="mb-8">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-primary">
                Admin Portal
              </p>

              <h2 className="font-headline text-4xl font-bold text-on-surface mb-3 tracking-tight">
                Admin Sign In
              </h2>

              <p className="text-on-surface-variant text-base leading-7">
                Secure access for authorized admin users only.
              </p>
            </div>

            {adminError && (
              <div className="mb-6 flex items-start gap-3 rounded-xl border border-error/20 bg-error/10 px-4 py-3 text-sm font-medium text-error animate-fade-in">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-error text-xs">
                  !
                </span>
                <span>{adminError}</span>
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-6">
              <div className="space-y-3">
                <label
                  className="block text-sm font-semibold text-on-surface"
                  htmlFor="admin-email"
                >
                  Email Address
                </label>

                <div className="input-container input-glow flex items-center rounded-full overflow-hidden px-5 py-1.5 transition-all duration-300 text-primary">
                  <MailIcon />

                  <input
                    id="admin-email"
                    type="email"
                    required
                    disabled={adminLoading}
                    value={adminEmail}
                    onChange={event => {
                      setAdminError(null);
                      setAdminEmail(event.target.value);
                    }}
                    placeholder="Enter admin email"
                    className="ml-4 w-full bg-transparent border-none text-on-surface placeholder-on-surface-variant/50 focus:ring-0 focus:outline-none py-2 text-sm disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label
                  className="block text-sm font-semibold text-on-surface"
                  htmlFor="admin-password"
                >
                  Password
                </label>

                <div className="input-container input-glow flex items-center rounded-full overflow-hidden px-5 py-1.5 transition-all duration-300 text-primary">
                  <LockIcon />

                  <input
                    id="admin-password"
                    type={showAdminPassword ? 'text' : 'password'}
                    required
                    disabled={adminLoading}
                    value={adminPassword}
                    onChange={event => {
                      setAdminError(null);
                      setAdminPassword(event.target.value);
                    }}
                    placeholder="Enter admin password"
                    className="ml-4 w-full bg-transparent border-none text-on-surface placeholder-on-surface-variant/50 focus:ring-0 focus:outline-none py-2 pr-3 text-sm disabled:opacity-50"
                  />

                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(previous => !previous)}
                    disabled={adminLoading}
                    aria-label={showAdminPassword ? 'Hide password' : 'Show password'}
                    className="text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
                  >
                    <EyeIcon hidden={showAdminPassword} />
                  </button>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={adminLoading}
                    className="text-sm text-primary font-bold hover:text-primary/80 transition-colors disabled:opacity-50"
                  >
                    Forgot Password?
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={!isFormValid || adminLoading}
                className="w-full glass-panel-elevated btn-login-glow hover:bg-surface-container/60 text-on-surface rounded-full py-4 font-semibold text-lg flex items-center justify-center gap-3 cursor-pointer border border-primary/30 transition-all duration-300 active:scale-98 disabled:opacity-50 disabled:pointer-events-none"
              >
                <ShieldIcon />
                <span>{adminLoading ? 'Signing In...' : 'Sign In as Admin'}</span>
              </button>
            </form>

            <p className="mt-8 text-center text-xs leading-6 text-on-surface-variant">
              Admin access is restricted to authorized BillTea admin.
            </p>

            <div
              className={`absolute inset-0 bg-surface/95 backdrop-blur-2xl flex flex-col items-center justify-center success-overlay shimmer-bg rounded-3xl z-20 ${
                adminSuccess ? 'active' : ''
              }`}
            >
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(125,211,252,0.3)]">
                <ShieldIcon />
              </div>

              <h3 className="font-headline text-3xl font-bold text-on-surface mb-2">
                Access Granted
              </h3>

              <p className="text-base text-primary font-semibold">
                Redirecting to admin dashboard...
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}