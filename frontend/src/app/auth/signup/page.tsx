"use client";

import registerImg from '@/assets/images/register-img.png';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext'; // <-- ADD THIS

interface RegisterFormData {
  lastname: string;
  firstname: string;
  email: string;
  password: string;
  confirmpassword: string;
}

export default function Register() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { register } = useAuth(); 

  const [registerFormData, setRegisterFormData] = useState<RegisterFormData>({
    lastname: '',
    firstname: '',
    email: '',
    password: '',
    confirmpassword: '',
  });
  const [fieldErrors, setFieldErrors] = useState<RegisterFormData>({
    lastname: '',
    firstname: '',
    email: '',
    password: '',
    confirmpassword: '',
  });

  const isEmpty = (value: string) => !value.trim();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    setError(null);

    const newErrors: RegisterFormData = {
      lastname: '',
      firstname: '',
      email: '',
      password: '',
      confirmpassword: '',
    };

    if (!registerFormData.lastname.trim()) {
      newErrors.lastname = 'Please enter your last name';
    }
    if (!registerFormData.firstname.trim()) {
      newErrors.firstname = 'Please enter your first name';
    }
    if (!registerFormData.email.trim()) {
      newErrors.email = 'Please provide a valid email';
    }
    if (!registerFormData.password.trim()) {
      newErrors.password = 'Please create a password';
    }
    if (!registerFormData.confirmpassword.trim()) {
      newErrors.confirmpassword = 'Please confirm your password';
    }

    if (
      registerFormData.password &&
      registerFormData.confirmpassword &&
      registerFormData.password !== registerFormData.confirmpassword
    ) {
      const matchError = 'Passwords do not match!';
      newErrors.password = matchError;
      newErrors.confirmpassword = matchError;
    }

    if (Object.values(newErrors).some(msg => msg)) {
      setFieldErrors(newErrors);
      setIsSubmitting(false);
      return;
    }
    
    setFieldErrors({ lastname: '', firstname: '', email: '', password: '', confirmpassword: '' });
    setIsSubmitting(true);

    try {
      await register({
        firstname: registerFormData.firstname,
        lastname: registerFormData.lastname,
        email: registerFormData.email,
        password: registerFormData.password,
      });

      router.push('/auth/login');
      
    } catch (err) {
      setError((err as Error).message);
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <>
      <section className={'w-full min-h-screen px-4 md:px-5 xl:px-8 2xl:px-[220px] pt-[108px] flex items-center'}>
        <div className={'w-1/2 flex flex-col px-6 lg:px-12 py-4 bg-white rounded-xl shadow-lg min-h-[900px] justify-center mx-6'}>
          <h1 className={'header-h2 text-dark-text mb-8'}>Register</h1>
          <div className={'flex flex-col gap-2'}>
            <form onSubmit={handleSubmit} className={'flex flex-col gap-8'}>
              {error && <p className={'text-red-600 text-sm -my-4'}>{error}</p>}
              {/* Last name */}
              <div className={'flex flex-col gap-2'}>
                <label htmlFor="lname" className='paragraph-p2-medium text-dark-text'>Last name</label>
                <input
                  name="lastname"
                  onChange={handleChange}
                  type="text"
                  placeholder="Last name"
                  value={registerFormData.lastname}
                  className={`
                    px-4 py-2.5 border-2 rounded-sm bg-transparent text-dark-text paragraph-p3 regular transition 
                    focus:border-primary focus:outline-none focus:bg-white/80 not-placeholder-shown:border-primary
                    ${fieldErrors.password ? 'border-red-500' : 'border-sub-text'}
                  `}
                />
                {fieldErrors.lastname && <p className="text-red-500 text-sm mt-1">{fieldErrors.lastname}</p>}
              </div>
              {/* First name */}
              <div className={'flex flex-col gap-2'}>
                <label htmlFor="fname" className='paragraph-p2-medium text-dark-text'>First name</label>
                <input
                  name="firstname"
                  onChange={handleChange}
                  type="text"
                  placeholder="First name"
                  value={registerFormData.firstname}
                  className={`
                    px-4 py-2.5 border-2 rounded-sm bg-transparent text-dark-text paragraph-p3 regular transition 
                    focus:border-primary focus:outline-none focus:bg-white/80 not-placeholder-shown:border-primary
                    ${fieldErrors.password ? 'border-red-500' : 'border-sub-text'}
                  `}
                />
                {fieldErrors.firstname && <p className="text-red-500 text-sm mt-1">{fieldErrors.firstname}</p>}
              </div>
              {/* Email */}
              <div className={'flex flex-col gap-2'}>
                <label htmlFor="email" className='paragraph-p2-medium text-dark-text'>Email</label>
                <input
                  name="email"
                  onChange={handleChange}
                  type="email"
                  placeholder="Email address"
                  value={registerFormData.email}
                  className={`
                    px-4 py-2.5 border-2 rounded-sm bg-transparent text-dark-text paragraph-p3 regular transition 
                    focus:border-primary focus:outline-none focus:bg-white/80 not-placeholder-shown:border-primary
                    ${fieldErrors.password ? 'border-red-500' : 'border-sub-text'}
                  `}
                />
                {fieldErrors.email && <p className="text-red-500 text-sm mt-1">{fieldErrors.email}</p>}
              </div>
              {/* Password */}
              <div className={'flex flex-col gap-2'}>
                <label htmlFor="pwd" className='paragraph-p2-medium text-dark-text'>Password</label>
                <input
                  name="password"
                  onChange={handleChange}
                  type="password"
                  placeholder="Password"
                  value={registerFormData.password}
                  className={`
                    px-4 py-2.5 border-2 rounded-sm bg-transparent text-dark-text paragraph-p3 regular transition 
                    focus:border-primary focus:outline-none focus:bg-white/80 not-placeholder-shown:border-primary
                    ${fieldErrors.password ? 'border-red-500' : 'border-sub-text'}
                  `}
                />
                {fieldErrors.password && <p className="text-red-500 text-sm mt-1">{fieldErrors.password}</p>}
              </div>
              {/* Confirmed Password */}
              <div className={'flex flex-col gap-2'}>
                <label htmlFor="pwd" className='paragraph-p2-medium text-dark-text'>Confirm Password</label>
                <input
                  name="confirmpassword"
                  onChange={handleChange}
                  type="password"
                  placeholder="Confirm Password"
                  value={registerFormData.confirmpassword}
                  className={`
                    px-4 py-2.5 border-2 rounded-sm bg-transparent text-dark-text paragraph-p3 regular transition 
                    focus:border-primary focus:outline-none focus:bg-white/80 not-placeholder-shown:border-primary
                    ${fieldErrors.password ? 'border-red-500' : 'border-sub-text'}
                  `}
                />
                {fieldErrors.confirmpassword && <p className="text-red-500 text-sm mt-1">{fieldErrors.confirmpassword}</p>}
              </div>
              <button type="submit" className={'paragraph-p3-medium bg-primary py-2.5 rounded-[8px] text-light-text transition cursor-pointer hover:bg-[color-mix(in_srgb,var(--color-primary),black_10%)]'}>
                {isSubmitting ? 'Signing up...' : 'Sign up'}
              </button>
            </form>
            <p className={'text-center paragraph-p4-regular text-dark-text mt-2.5'}>
              Already have an account?
              <span className='ml-1.5 text-primary hover:text-[color-mix(in_srgb,var(--color-primary),black_10%)] transition'>
                <Link className={''} href="/auth/login">
                  Log in
                </Link>
              </span>
            </p>
          </div>
        </div>
        <div className={'w-1/2'} role="img" aria-label="Image preview">
          <Image 
            src={registerImg} 
            alt="Register Image"
            priority
            placeholder="blur" 
            style={{ width: '100%', height: 'auto' }} 
          />
        </div>
      </section>
    </>
  );
}
