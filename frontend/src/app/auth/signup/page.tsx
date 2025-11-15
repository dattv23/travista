"use client";

import registerImg from '@/assets/images/register-img.png';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { z } from 'zod';

// Validation Rules
const registerSchema = z.object({
  lastname: z.string().min(1, 'Please enter your last name'),
  firstname: z.string().min(1, 'Please enter your first name'),
  email: z.string().email('Please provide a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmpassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmpassword, {
  message: "Password does not match",
  path: ["confirmpassword"], 
});

type RegisterFormData = z.infer<typeof registerSchema>;

// Reusable Input Component 
interface FormInputProps {
  label: string;
  name: keyof RegisterFormData;
  type?: string;
  value: string;
  error?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
}

const FormInput = ({ label, name, type = "text", value, error, onChange, placeholder }: FormInputProps) => (
  <div className="flex flex-col gap-2">
    <label htmlFor={name} className="paragraph-p2-medium text-dark-text">
      {label}
    </label>
    <input
      name={name}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`
        px-4 py-2.5 border-2 rounded-sm bg-transparent text-dark-text paragraph-p3 regular transition 
        focus:border-primary focus:outline-none focus:bg-white/80 not-placeholder-shown:border-primary
        ${error ? 'border-red-500' : 'border-sub-text'}
      `}
    />
    {error && <p className="text-red-500 text-sm mt-1">* {error}</p>}
  </div>
);

interface InputConfig {
  id: number;
  name: keyof RegisterFormData; 
  label: string;
  type: string;
  placeholder: string;
}

const inputs: InputConfig[] = [
  { id: 1, name: 'lastname', label: 'Last name', type: 'text', placeholder: 'Last name' },
  { id: 2, name: 'firstname', label: 'First name', type: 'text', placeholder: 'First name' },
  { id: 3, name: 'email', label: 'Email', type: 'email', placeholder: 'Email address' },
  { id: 4, name: 'password', label: 'Password', type: 'password', placeholder: 'Password' },
  { id: 5, name: 'confirmpassword', label: 'Confirm Password', type: 'password', placeholder: 'Confirm Password' },
];

export default function Register() {
  const router = useRouter();
  const { register } = useAuth(); 
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<RegisterFormData>({
    lastname: '', firstname: '', email: '', password: '', confirmpassword: '',
  });
  
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof RegisterFormData, string>>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    if (fieldErrors[name as keyof RegisterFormData]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    setGlobalError(null);
    setFieldErrors({}); 

    const validation = registerSchema.safeParse(formData);

    if (!validation.success) {
      const formattedErrors = validation.error.flatten().fieldErrors;
      setFieldErrors({
        lastname: formattedErrors.lastname?.[0],
        firstname: formattedErrors.firstname?.[0],
        email: formattedErrors.email?.[0],
        password: formattedErrors.password?.[0],
        confirmpassword: formattedErrors.confirmpassword?.[0],
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await register(validation.data);
      router.push('/auth/login');
    } catch (err) {
      setGlobalError((err as Error).message);
      setIsSubmitting(false);
    }
  };

  return (
    <section className="w-full min-h-screen px-4 md:px-5 xl:px-8 2xl:px-[220px] pt-[108px] flex items-center">
      <div className="w-1/2 flex flex-col px-6 lg:px-12 py-4 bg-white rounded-xl shadow-lg min-h-[900px] justify-center mx-6">
        <h1 className="header-h2 text-dark-text mb-8">Register</h1>
        <div className="flex flex-col gap-2">
          <form onSubmit={handleSubmit} className="flex flex-col gap-8">
            {inputs.map((input) => (
              <FormInput
                key={input.id}
                {...input} 
                value={formData[input.name]} 
                onChange={handleChange}
                error={fieldErrors[input.name]} 
              />
            ))}

            {globalError && <p className="text-red-600 text-sm -my-4">* {globalError}</p>}
            
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="paragraph-p3-medium bg-primary py-2.5 rounded-[8px] text-light-text transition cursor-pointer hover:bg-[color-mix(in_srgb,var(--color-primary),black_10%)] disabled:opacity-70"
            >
              {isSubmitting ? 'Signing up...' : 'Sign up'}
            </button>
          </form>

          <p className="text-center paragraph-p4-regular text-dark-text mt-2.5">
            Already have an account?
            <span className="ml-1.5 text-primary hover:text-[color-mix(in_srgb,var(--color-primary),black_10%)] transition">
              <Link href="/auth/login">Log in</Link>
            </span>
          </p>
        </div>
      </div>
      
      <div className="w-1/2" role="img" aria-label="Image preview">
        <Image 
          src={registerImg} 
          alt="Register Image"
          priority
          placeholder="blur" 
          style={{ width: '100%', height: 'auto' }} 
        />
      </div>
    </section>
  );
}