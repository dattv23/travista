'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { z } from 'zod';
import loginImg from '@/assets/images/login-image.png';

// --- Validation rules ---
const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

// --- Input Configuration ---
const inputs = [
  { id: 1, name: 'email', label: 'Email', type: 'email', placeholder: 'Email address' },
  { id: 2, name: 'password', label: 'Password', type: 'password', placeholder: 'Password' },
] as const;

// Form Input Component
const FormInput = ({ label, error, ...inputProps }: any) => (
  <div className="flex flex-col gap-2">
    <label htmlFor={inputProps.name} className="paragraph-p2-medium text-dark-text">
      {label}
    </label>
    <input
      {...inputProps}
      className={`text-dark-text paragraph-p3 regular focus:border-primary not-placeholder-shown:border-primary rounded-sm border-2 bg-transparent px-4 py-2.5 transition focus:bg-white/80 focus:outline-none ${error ? 'border-red-500' : 'border-sub-text'} `}
    />
    {error && <p className="mt-1 text-sm text-red-500">* {error}</p>}
  </div>
);

// Google Button Component
const GoogleButton = ({
  onClick,
  disabled,
}: {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled: boolean;
}) => (
  <button
    disabled={disabled}
    onClick={onClick}
    className="text-dark-text paragraph-p3-medium flex cursor-pointer items-center justify-center gap-2 rounded-[8px] border-2 border-[color-mix(in_srgb,var(--color-divider),black_10%)] bg-white/80 py-2.5 transition hover:bg-gray-50 disabled:opacity-50"
  >
    <svg className="h-8 w-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
      <path
        fill="#FFC107"
        d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
      ></path>
      <path
        fill="#FF3D00"
        d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
      ></path>
      <path
        fill="#4CAF50"
        d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
      ></path>
      <path
        fill="#1976D2"
        d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
      ></path>
    </svg>
    Log in with Google
  </button>
);

// --- Main Component ---
export default function Login() {
  const { userLoggedIn, login, googleLogin, isLoading } = useAuth();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      localStorage.setItem('access_token', token);
      router.push('/');
    }
  }, [token]);

  const router = useRouter();

  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const [formData, setFormData] = useState<LoginFormData>({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof LoginFormData, string>>>({});

  useEffect(() => {
    if (!isLoading && userLoggedIn) {
      router.push('/');
    }
  }, [userLoggedIn, isLoading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name as keyof LoginFormData]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoggingIn) return;

    setGlobalError(null);
    setFieldErrors({});

    const validation = loginSchema.safeParse(formData);

    if (!validation.success) {
      const formattedErrors = validation.error.flatten().fieldErrors;
      setFieldErrors({
        email: formattedErrors.email?.[0],
        password: formattedErrors.password?.[0],
      });
      return;
    }

    setIsLoggingIn(true);

    try {
      await login(formData.email, formData.password);
    } catch (error) {
      setGlobalError((error as Error).message);
      setIsLoggingIn(false);
    }
  };

  const handleGoogleLogIn = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    setGlobalError(null);
    googleLogin();
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <section className="flex min-h-screen w-full items-center px-4 pt-[108px] md:px-5 xl:px-8 2xl:px-[220px]">
      <div className="mx-6 flex min-h-[720px] w-full flex-col justify-center rounded-xl bg-white px-6 py-4 shadow-lg md:w-1/2 lg:px-12">
        <h1 className="header-h2 text-dark-text mb-8">Login</h1>

        <div className="flex flex-col gap-2">
          <form onSubmit={handleSubmit} className="flex flex-col gap-8" autoComplete="off">
            {inputs.map((input) => (
              <FormInput
                key={input.id}
                {...input}
                value={formData[input.name]}
                onChange={handleChange}
                error={fieldErrors[input.name]}
              />
            ))}

            {globalError && <p className="-my-4 text-sm text-red-500">* {globalError}</p>}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="paragraph-p3-medium bg-primary text-light-text cursor-pointer rounded-[8px] py-2.5 transition hover:bg-[color-mix(in_srgb,var(--color-primary),black_10%)] disabled:opacity-50"
            >
              {isLoggingIn ? 'Logging in...' : 'Log in'}
            </button>
          </form>

          <p className="paragraph-p4-regular text-dark-text mt-2.5 text-center">
            Don't have an account?
            <span className="text-primary ml-1.5 transition hover:text-[color-mix(in_srgb,var(--color-primary),black_10%)]">
              <Link href="/auth/signup">Sign up</Link>
            </span>
          </p>

          <div className="my-3 flex w-full items-center">
            <div className="flex-1 border-t border-[color-mix(in_srgb,var(--color-divider),black_10%)]"></div>
            <span className="px-4 text-sm text-[color-mix(in_srgb,var(--color-divider),black_30%)]">
              or
            </span>
            <div className="flex-1 border-t border-[color-mix(in_srgb,var(--color-divider),black_10%)]"></div>
          </div>
          <GoogleButton onClick={handleGoogleLogIn} disabled={isLoggingIn} />
        </div>
      </div>

      <div className="hidden w-1/2 md:block" role="img" aria-label="Image preview">
        <Image
          src={loginImg}
          alt="Login Image"
          priority
          placeholder="blur"
          style={{ width: '100%', height: 'auto' }}
        />
      </div>
    </section>
  );
}
