import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { UserPlus } from 'lucide-react';

const registerSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone_number: z.string().min(7, 'Phone number must be at least 7 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirm_password: z.string().min(6, 'Confirm password is required')
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords must match",
  path: ["confirm_password"]
});

type RegisterForm = z.infer<typeof registerSchema>;

const Register = () => {
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();
    
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
        resolver: zodResolver(registerSchema)
    });

    const onSubmit = async (data: RegisterForm) => {
        try {
            setError('');
            setSuccess('');
            await api.post('/users/register/', data);
            setSuccess('Registration successful! Redirecting to login page...');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data?.email?.[0] || err.response?.data?.detail || 'Registration failed. Please check details.');
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4 bg-gray-50 dark:bg-charcoal-dark fade-in">
            <Helmet>
                <title>Register | Regal Rivulet Retreat Hotel</title>
                <meta name="description" content="Create a new guest account to book and check luxury rooms." />
            </Helmet>
            
            <div className="bg-white dark:bg-charcoal p-8 rounded-lg shadow-xl w-full max-w-md border border-gray-100 dark:border-gray-800">
                <div className="flex flex-col items-center mb-6">
                    <div className="p-3 bg-primary/10 rounded-full mb-3">
                        <UserPlus className="h-6 w-6 text-primary" />
                    </div>
                    <h1 className="font-playfair text-3xl font-bold text-gray-900 dark:text-white">Create Account</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-light mt-1">Register for a premium guest experience</p>
                </div>
                
                {error && (
                    <div className="bg-red-50 dark:bg-red-950/20 text-red-500 border border-red-200 dark:border-red-900/30 p-4 rounded mb-6 text-sm">
                        {error}
                    </div>
                )}
                
                {success && (
                    <div className="bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-900/30 p-4 rounded mb-6 text-sm">
                        {success}
                    </div>
                )}
                
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1">Full Name</label>
                        <input 
                            {...register('full_name')} 
                            type="text"
                            className="w-full px-4 py-2 bg-gray-50 dark:bg-charcoal-light border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white rounded focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none placeholder-gray-400 font-light text-sm" 
                            placeholder="John Doe"
                        />
                        {errors.full_name && <p className="mt-1 text-xs text-red-500">{errors.full_name.message}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1">Email Address</label>
                        <input 
                            {...register('email')} 
                            type="email"
                            className="w-full px-4 py-2 bg-gray-50 dark:bg-charcoal-light border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white rounded focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none placeholder-gray-400 font-light text-sm" 
                            placeholder="john@example.com"
                        />
                        {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1">Phone Number</label>
                        <input 
                            {...register('phone_number')} 
                            type="text"
                            className="w-full px-4 py-2 bg-gray-50 dark:bg-charcoal-light border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white rounded focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none placeholder-gray-400 font-light text-sm" 
                            placeholder="+977 98XXXXXXXX"
                        />
                        {errors.phone_number && <p className="mt-1 text-xs text-red-500">{errors.phone_number.message}</p>}
                    </div>
                    
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1">Password</label>
                        <input 
                            {...register('password')} 
                            type="password"
                            className="w-full px-4 py-2 bg-gray-50 dark:bg-charcoal-light border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white rounded focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none placeholder-gray-400 font-light text-sm" 
                            placeholder="••••••••"
                        />
                        {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1">Confirm Password</label>
                        <input 
                            {...register('confirm_password')} 
                            type="password"
                            className="w-full px-4 py-2 bg-gray-50 dark:bg-charcoal-light border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white rounded focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none placeholder-gray-400 font-light text-sm" 
                            placeholder="••••••••"
                        />
                        {errors.confirm_password && <p className="mt-1 text-xs text-red-500">{errors.confirm_password.message}</p>}
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full bg-primary hover:bg-primary-dark text-charcoal py-3 rounded font-bold uppercase text-xs tracking-widest transition-all disabled:opacity-50 mt-2"
                    >
                        {isSubmitting ? 'Registering...' : 'Register'}
                    </button>
                    
                    <div className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4 font-light">
                        Already have an account? <Link to="/login" className="text-primary hover:underline font-semibold">Login here</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
