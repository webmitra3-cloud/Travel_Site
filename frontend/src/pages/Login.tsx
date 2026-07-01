import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '../services/api';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Helmet } from 'react-helmet-async';
import { LogIn } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().min(3, 'Username or Email must be at least 3 characters'),
  password: z.string().min(1, 'Password is required')
});

type LoginForm = z.infer<typeof loginSchema>;

const Login = () => {
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    
    const queryParams = new URLSearchParams(location.search);
    const infoMessage = location.state?.message || queryParams.get('message');
    
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema)
    });

    const onSubmit = async (data: LoginForm) => {
        try {
            setError('');
            const response = await api.post('/users/login/', {
                email: data.email.trim().toLowerCase(),
                password: data.password.trim(),
            });
            
            // Extract from DRF Simple JWT response
            const token = response.data.access;
            const refresh = response.data.refresh;
            const userData = response.data.user;

            login(token, refresh, userData);
            
            // Redirect based on role
            if (userData.role === 'ADMIN' || userData.role === 'MANAGER') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4 bg-gray-50 dark:bg-charcoal-dark fade-in">
            <Helmet>
                <title>Login | Regal Rivulet Retreat Hotel</title>
                <meta name="description" content="Sign in to your Regal Rivulet hotel account to manage reservations." />
            </Helmet>
            
            <div className="bg-white dark:bg-charcoal p-8 rounded-lg shadow-xl w-full max-w-md border border-gray-100 dark:border-gray-800">
                <div className="flex flex-col items-center mb-8">
                    <div className="p-3 bg-primary/10 rounded-full mb-3">
                        <LogIn className="h-6 w-6 text-primary" />
                    </div>
                    <h1 className="font-playfair text-3xl font-bold text-gray-900 dark:text-white">Welcome Back</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-light mt-1">Sign in to your luxury account</p>
                </div>
                
                {infoMessage && !error && (
                    <div className="bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/30 p-4 rounded mb-6 text-sm font-medium text-center">
                        {infoMessage}
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 dark:bg-red-950/20 text-red-500 border border-red-200 dark:border-red-900/30 p-4 rounded mb-6 text-sm">
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2">Email Address</label>
                        <input 
                            {...register('email')} 
                            type="text"
                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-charcoal-light border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white rounded focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none placeholder-gray-400 font-light" 
                            placeholder="you@example.com or admin"
                        />
                        {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
                    </div>
                    
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2">Password</label>
                        <input 
                            {...register('password')} 
                            type="password"
                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-charcoal-light border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white rounded focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none placeholder-gray-400 font-light" 
                            placeholder="••••••••"
                        />
                        {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full bg-primary hover:bg-primary-dark text-charcoal py-3 rounded font-bold uppercase text-xs tracking-widest transition-all disabled:opacity-50"
                    >
                        {isSubmitting ? 'Signing in...' : 'Sign In'}
                    </button>
                    
                    <div className="text-center text-xs text-gray-500 dark:text-gray-400 mt-6 font-light">
                        Don't have an account? <Link to="/register" className="text-primary hover:underline font-semibold">Register here</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
