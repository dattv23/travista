"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import loginImg from '@/assets/images/login-img.png';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';

interface LoginFormData {
  email: string;
  password: string;
}

export default function Login() {
  const { userLoggedIn, login, googleLogin, isLoading, user } = useAuth();
  const router = useRouter();

  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loginFormData, setLoginFormData] = useState<LoginFormData>({ email: '', password: '' });

  useEffect(() => {
    if (!isLoading && userLoggedIn) {
      router.push('/');
    }
  }, [userLoggedIn, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoggingIn) return;

    setIsLoggingIn(true);
    setError(null);

    try {
      await login(loginFormData.email, loginFormData.password);
    } catch (error) {
      setError((error as Error).message);
      setIsLoggingIn(false);
    }
  };

  const handleGoogleLogIn = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (isLoggingIn) return;

    setIsLoggingIn(true);
    setError(null);

    googleLogin();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <section className={'w-full min-h-screen px-4 md:px-5 xl:px-8 2xl:px-[220px] pt-[108px] flex items-center'}>
      <div className={'w-1/2 flex flex-col px-6 lg:px-12 py-4 bg-white rounded-xl shadow-lg min-h-[720px] justify-center mx-6'}>
        <h1 className={'header-h2 text-dark-text mb-8'}>Login</h1>
        <div className={'flex flex-col gap-2'}>
          <form onSubmit={handleSubmit} className={'flex flex-col gap-8'} autoComplete="off">
            {error && <p>{error}</p>}
            {/* Email */}
            <div className={'flex flex-col gap-2'}>
              <label 
                htmlFor="email" 
                className='paragraph-p2-medium text-dark-text'
              >Email</label>
              <input
                name="email"
                onChange={handleChange}
                type="email"
                placeholder="Email address"
                value={loginFormData.email}
                autoComplete="new-email"
                required
                className='px-4 py-2.5 border-2 rounded-sm border-sub-text bg-transparent text-dark-text paragraph-p3 regular transition focus:border-primary focus:outline-none focus:bg-white/80 not-placeholder-shown:border-primary'
              />
            </div>
            {/* Password */}
            <div className={'flex flex-col gap-2'}>
              <label 
                htmlFor="pwd"
                className='paragraph-p2-medium text-dark-text'
              >Password</label>
              <input
                name="password"
                onChange={handleChange}
                type={'password'}
                placeholder="Password"
                value={loginFormData.password}
                autoComplete="new-password"
                required
                className='px-4 py-2.5 border-2 rounded-sm border-sub-text bg-transparent text-dark-text paragraph-p3 regular transition focus:border-primary focus:outline-none focus:bg-white/80 not-placeholder-shown:border-primary'
              />
            </div>
            <button type="submit" disabled={isLoggingIn} className={'paragraph-p3-medium bg-primary py-2.5 rounded-[8px] text-light-text transition cursor-pointer hover:bg-[color-mix(in_srgb,var(--color-primary),black_10%)]'}>
              {isLoggingIn ? 'Logging in...' : 'Log in'}
            </button>
          </form>
          <p className={'text-center paragraph-p4-regular text-dark-text mt-2.5'}>
            Don't have an account?
            <span className='ml-1.5 text-primary hover:text-[color-mix(in_srgb,var(--color-primary),black_10%)] transition'>
              <Link className={''} href="/auth/signup">
                Sign up
              </Link>
            </span>
          </p>
          <div className="flex items-center w-full my-3">
            <div className="flex-1 border-t border-[color-mix(in_srgb,var(--color-divider),black_10%)]"></div>
            <span className="px-4 text-sm text-[color-mix(in_srgb,var(--color-divider),black_30%)]">
              or
            </span>
            <div className="flex-1 border-t border-[color-mix(in_srgb,var(--color-divider),black_10%)]"></div>
          </div>
          <button
            disabled={isLoggingIn}
            onClick={(e) => {
              handleGoogleLogIn(e);
            }}
            className={'flex items-center justify-center gap-2 py-2.5 border-2 border-[color-mix(in_srgb,var(--color-divider),black_10%)] rounded-[8px] text-dark-text bg-white/80 paragraph-p3-medium transition cursor-pointer hover:bg-gray-50'}
          >
            <svg
              className={'w-[32px] h-[32px]'}
              xmlns="http://www.w3.org/2000/svg"
              x="0px"
              y="0px"
              width="100"
              height="100"
              viewBox="0 0 48 48"
            >
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
        </div>
      </div>

      <div className={'w-1/2'} role="img" aria-label="Image preview">
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
