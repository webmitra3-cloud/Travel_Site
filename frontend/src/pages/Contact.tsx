import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Helmet } from 'react-helmet-async';
import api from '../services/api';
import { Phone, Mail, MapPin, Send, MessageSquareCheck } from 'lucide-react';

const messageSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  subject: z.string().min(3, 'Subject must be at least 3 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters')
});

type MessageForm = z.infer<typeof messageSchema>;

const Contact = () => {
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<MessageForm>({
        resolver: zodResolver(messageSchema)
    });

    const onSubmit = async (data: MessageForm) => {
        try {
            setError('');
            setSuccess('');
            await api.post('/cms/messages/', data);
            setSuccess('Thank you! Your message has been sent successfully. We will get back to you shortly.');
            reset();
        } catch (err: any) {
            setError('Failed to send message. Please try again later.');
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 fade-in text-gray-800 dark:text-gray-200">
            <Helmet>
                <title>Contact Us | Regal Rivulet Retreat Hotel</title>
                <meta name="description" content="Send us a message, view our location on Google Maps, and reach our support desk for reservation inquiries." />
            </Helmet>

            <div className="text-center mb-12">
                <span className="text-primary font-bold text-xs uppercase tracking-[0.2em]">Reach Us</span>
                <h1 className="font-playfair text-4xl sm:text-5xl font-bold mt-2 text-gray-900 dark:text-white">Contact & Support</h1>
                <div className="h-0.5 w-16 bg-primary mx-auto mt-4"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-20">
                
                {/* Contact details Col */}
                <div className="space-y-6">
                    <h2 className="font-playfair text-2xl font-bold text-gray-900 dark:text-white mb-4">Get in Touch</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-light leading-relaxed">
                        Do you have inquiries about special suites, long-term retreats, private events, or dining reservations? Feel free to reach out. Our concierge desk is active 24/7.
                    </p>

                    <div className="space-y-4">
                        <div className="flex items-start space-x-3 p-4 bg-white dark:bg-charcoal rounded border border-gray-100 dark:border-gray-800">
                            <div className="p-2 bg-primary/10 rounded text-primary shrink-0">
                                <MapPin className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Address</h4>
                                <p className="text-sm text-gray-700 dark:text-gray-300 font-light mt-0.5">10 Bayfront Avenue, Singapore 018956</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-3 p-4 bg-white dark:bg-charcoal rounded border border-gray-100 dark:border-gray-800">
                            <div className="p-2 bg-primary/10 rounded text-primary shrink-0">
                                <Phone className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Call Concierge</h4>
                                <p className="text-sm text-gray-700 dark:text-gray-300 font-light mt-0.5">+977 1 555-BELL</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-3 p-4 bg-white dark:bg-charcoal rounded border border-gray-100 dark:border-gray-800">
                            <div className="p-2 bg-primary/10 rounded text-primary shrink-0">
                                <Mail className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Email Address</h4>
                                <p className="text-sm text-gray-700 dark:text-gray-300 font-light mt-0.5">info@booking-bell.com</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Col */}
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-charcoal p-8 rounded-lg shadow-md border border-gray-100 dark:border-gray-800">
                        <h3 className="font-playfair text-2xl font-bold mb-6">Send a Message</h3>
                        
                        {success && (
                            <div className="bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-900/30 p-4 rounded-lg flex items-start space-x-2.5 mb-6 text-sm">
                                <MessageSquareCheck className="h-5 w-5 shrink-0 text-green-500" />
                                <span>{success}</span>
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-50 dark:bg-red-950/20 text-red-500 border border-red-200 dark:border-red-900/30 p-4 rounded mb-6 text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Your Name</label>
                                    <input
                                        {...register('name')}
                                        type="text"
                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-charcoal-light border border-gray-200 dark:border-gray-800 rounded focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none text-sm"
                                        placeholder="John Doe"
                                    />
                                    {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Email Address</label>
                                    <input
                                        {...register('email')}
                                        type="email"
                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-charcoal-light border border-gray-200 dark:border-gray-800 rounded focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none text-sm"
                                        placeholder="john@example.com"
                                    />
                                    {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Phone Number (Optional)</label>
                                    <input
                                        {...register('phone')}
                                        type="text"
                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-charcoal-light border border-gray-200 dark:border-gray-800 rounded focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none text-sm"
                                        placeholder="+977"
                                    />
                                    {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Subject</label>
                                    <input
                                        {...register('subject')}
                                        type="text"
                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-charcoal-light border border-gray-200 dark:border-gray-800 rounded focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none text-sm"
                                        placeholder="Inquiry about..."
                                    />
                                    {errors.subject && <p className="mt-1 text-xs text-red-500">{errors.subject.message}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Your Message</label>
                                <textarea
                                    {...register('message')}
                                    rows={5}
                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-charcoal-light border border-gray-200 dark:border-gray-800 rounded focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none text-sm font-light leading-relaxed"
                                    placeholder="Write your inquiry here..."
                                />
                                {errors.message && <p className="mt-1 text-xs text-red-500">{errors.message.message}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full sm:w-fit bg-primary hover:bg-primary-dark text-charcoal font-bold uppercase text-xs tracking-widest px-8 py-3 rounded transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                            >
                                <Send className="h-4 w-4" />
                                <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
                            </button>
                        </form>
                    </div>
                </div>

            </div>

            {/* Embedded Map Section */}
            <div className="space-y-4">
                <h3 className="font-playfair text-2xl font-bold mb-4">Find Us</h3>
                <div className="h-[400px] w-full bg-gray-200 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 shadow-lg relative">
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3532.7486807963283!2d85.31976211506168!3d27.69418298279893!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb19ab38b8125b%3A0x82b4a37fb4b2c174!2sKathmandu%2044600!5e0!3m2!1sen!2snp!4v1686259000000!5m2!1sen!2snp"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen={true}
                        loading="lazy"
                        title="Regal Rivulet Retreat Location Map"
                    ></iframe>
                </div>
            </div>
        </div>
    );
};

export default Contact;
