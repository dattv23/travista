"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { z } from 'zod';
import loginImg from '@/assets/images/login-image.png';

// --- Validation rules ---
const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
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
      className={`
        px-4 py-2.5 border-2 rounded-sm bg-transparent text-dark-text paragraph-p3 regular transition 
        focus:border-primary focus:outline-none focus:bg-white/80 not-placeholder-shown:border-primary
        ${error ? 'border-red-500' : 'border-sub-text'}
      `}
    />
    {error && <p className="text-red-500 text-sm mt-1">* {error}</p>}
  </div>
);

// Google Button Component 
const GoogleButton = ({ onClick, disabled }: { onClick: (e: React.MouseEvent<HTMLButtonElement>) => void, disabled: boolean }) => (
  <button
    disabled={disabled}
    onClick={onClick}
    className="flex items-center justify-center gap-2 py-2.5 border-2 border-[color-mix(in_srgb,var(--color-divider),black_10%)] rounded-[8px] text-dark-text bg-white/80 paragraph-p3-medium transition cursor-pointer hover:bg-gray-50 disabled:opacity-50"
  >
    <svg className="w-8 h-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
      <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
      <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
      <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
    </svg>
    Log in with Google
  </button>
);

// --- Main Component ---
export default function Login() {
  const { userLoggedIn, login, googleLogin, isLoading } = useAuth();
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
    setFormData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name as keyof LoginFormData]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
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
    <section className="w-full min-h-screen px-4 md:px-5 xl:px-8 2xl:px-[220px] pt-[108px] flex items-center">
      <div className="w-full md:w-1/2 flex flex-col px-6 lg:px-12 py-4 bg-white rounded-xl shadow-lg min-h-[720px] justify-center mx-6">
        <h1 className="header-h2 text-dark-text mb-8">Login</h1>
        
        <div className="flex flex-col gap-2">
          <form onSubmit={handleSubmit} className="flex flex-col gap-8" autoComplete="off">
            {inputs.map(input => (
              <FormInput
                key={input.id}
                {...input}
                value={formData[input.name]}
                onChange={handleChange}
                error={fieldErrors[input.name]}
              />
            ))}

            {globalError && <p className="text-red-500 text-sm -my-4">* {globalError}</p>}
            
            <button 
              type="submit" 
              disabled={isLoggingIn} 
              className="paragraph-p3-medium bg-primary py-2.5 rounded-[8px] text-light-text transition cursor-pointer hover:bg-[color-mix(in_srgb,var(--color-primary),black_10%)] disabled:opacity-50"
            >
              {isLoggingIn ? 'Logging in...' : 'Log in'}
            </button>
          </form>
          
          <p className="text-center paragraph-p4-regular text-dark-text mt-2.5">
            Don't have an account?
            <span className="ml-1.5 text-primary hover:text-[color-mix(in_srgb,var(--color-primary),black_10%)] transition">
              <Link href="/auth/signup">Sign up</Link>
            </span>
          </p>

          <div className="flex items-center w-full my-3">
            <div className="flex-1 border-t border-[color-mix(in_srgb,var(--color-divider),black_10%)]"></div>
            <span className="px-4 text-sm text-[color-mix(in_srgb,var(--color-divider),black_30%)]">or</span>
            <div className="flex-1 border-t border-[color-mix(in_srgb,var(--color-divider),black_10%)]"></div>
          </div>
          <GoogleButton onClick={handleGoogleLogIn} disabled={isLoggingIn} />
        </div>
      </div>

      <div className="w-1/2 hidden md:block" role="img" aria-label="Image preview">
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