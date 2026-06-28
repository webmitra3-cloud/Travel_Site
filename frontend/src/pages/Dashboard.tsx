import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Helmet } from 'react-helmet-async';
import api from '../services/api';
import { 
    Calendar, CreditCard, User, Bell, CheckCircle, Clock, ShieldAlert, 
    Upload, Trash2, Key, Info, HelpCircle, FileText, CheckCircle2, ChevronLeft
} from 'lucide-react';

const Dashboard = () => {
    const { user, logout, updateUser } = useAuth();
    const queryClient = useQueryClient();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    // Tabs: OVERVIEW, BOOKINGS, PROFILE, NOTIFICATIONS
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'OVERVIEW');
    const [selectedBookingId, setSelectedBookingId] = useState<string | null>(searchParams.get('booking_id') || null);

    // Profile form states
    const [fullName, setFullName] = useState(user?.full_name || '');
    const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || '');
    const [profileSuccess, setProfileSuccess] = useState('');
    const [profileError, setProfileError] = useState('');

    // Password form states
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [pwSuccess, setPwSuccess] = useState('');
    const [pwError, setPwError] = useState('');

    // Payment proof states
    const [selectedMethodId, setSelectedMethodId] = useState('');
    const [proofFile, setProofFile] = useState<File | null>(null);
    const [transactionId, setTransactionId] = useState('');
    const [proofNotes, setProofNotes] = useState('');
    const [proofError, setProofError] = useState('');
    const [proofSuccess, setProofSuccess] = useState('');

    // Sync tab state to URL
    useEffect(() => {
        const params: any = { tab: activeTab };
        if (selectedBookingId) params.booking_id = selectedBookingId;
        setSearchParams(params);
    }, [activeTab, selectedBookingId]);

    // Query dashboard overview metrics
    const { data: metrics } = useQuery({
        queryKey: ['customer-metrics'],
        queryFn: async () => {
            const { data } = await api.get('/dashboard/customer/');
            return data;
        }
    });

    // Query active payment methods
    const { data: payMethods } = useQuery({
        queryKey: ['active-payment-methods'],
        queryFn: async () => {
            const { data } = await api.get('/payments/methods/');
            return data;
        }
    });

    // Query booking lists
    const { data: bookings, isLoading: loadingBookings } = useQuery({
        queryKey: ['customer-bookings'],
        queryFn: async () => {
            const { data } = await api.get('/bookings/');
            return data;
        }
    });

    // Query notifications
    const { data: notifications } = useQuery({
        queryKey: ['customer-notifications'],
        queryFn: async () => {
            const { data } = await api.get('/users/notifications/');
            return data;
        }
    });

    const activeBooking = bookings?.find((b: any) => b.id === selectedBookingId);
    const selectedMethod = payMethods?.find((m: any) => m.id === selectedMethodId);

    // Profile mutation
    const updateProfileMutation = useMutation({
        mutationFn: async (payload: any) => {
            const { data } = await api.put('/users/profile/', payload);
            return data;
        },
        onSuccess: (data) => {
            setProfileSuccess('Profile updated successfully.');
            updateUser({ full_name: data.full_name, phone_number: data.phone_number });
            queryClient.invalidateQueries({ queryKey: ['customer-metrics'] });
        },
        onError: (err: any) => {
            setProfileError(err.response?.data?.detail || 'Failed to update profile.');
        }
    });

    // Password update mutation
    const updatePasswordMutation = useMutation({
        mutationFn: async (payload: any) => {
            const { data } = await api.put('/users/profile/', payload);
            return data;
        },
        onSuccess: () => {
            setPwSuccess('Password changed successfully.');
            setOldPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
        },
        onError: (err: any) => {
            setPwError(err.response?.data?.new_password?.[0] || err.response?.data?.old_password || 'Failed to change password.');
        }
    });

    // Notification read mutation
    const markReadMutation = useMutation({
        mutationFn: async (id: string) => {
            const { data } = await api.put(`/users/notifications/${id}/`, { is_read: true });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customer-notifications'] });
        }
    });

    // Booking cancellation mutation
    const cancelBookingMutation = useMutation({
        mutationFn: async (id: string) => {
            const { data } = await api.post(`/bookings/${id}/cancel/`, { reason: 'Cancelled by customer' });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customer-bookings'] });
            queryClient.invalidateQueries({ queryKey: ['customer-metrics'] });
        },
        onError: (err: any) => {
            alert(err.response?.data?.error || 'Cancellation failed.');
        }
    });

    const handleProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProfileSuccess('');
        setProfileError('');
        updateProfileMutation.mutate({ full_name: fullName, phone_number: phoneNumber });
    };

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setPwSuccess('');
        setPwError('');
        if (newPassword !== confirmNewPassword) {
            setPwError('New passwords do not match.');
            return;
        }
        updatePasswordMutation.mutate({
            old_password: oldPassword,
            new_password: newPassword,
            confirm_new_password: confirmNewPassword
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            // Validate size (5MB)
            if (file.size > 5 * 1024 * 1024) {
                setProofError('File size must not exceed 5 MB.');
                setProofFile(null);
                return;
            }
            // Validate extension
            const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            if (!allowed.includes(file.type)) {
                setProofError('Only JPG, JPEG, PNG, or WEBP images are allowed.');
                setProofFile(null);
                return;
            }
            setProofError('');
            setProofFile(file);
        }
    };

    const handleProofSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!proofFile || !selectedBookingId || !selectedMethodId) {
            setProofError('Please choose a payment method and upload the screenshot.');
            return;
        }
        
        setProofError('');
        setProofSuccess('');

        const formData = new FormData();
        formData.append('booking', selectedBookingId);
        formData.append('payment_method', selectedMethodId);
        formData.append('screenshot', proofFile);
        if (transactionId) formData.append('transaction_id', transactionId);
        if (proofNotes) formData.append('notes', proofNotes);

        try {
            await api.post('/payments/proofs/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setProofSuccess('Payment proof uploaded successfully! Awaiting verification.');
            setProofFile(null);
            setTransactionId('');
            setProofNotes('');
            queryClient.invalidateQueries({ queryKey: ['customer-bookings'] });
            queryClient.invalidateQueries({ queryKey: ['customer-metrics'] });
        } catch (err: any) {
            setProofError(err.response?.data?.screenshot?.[0] || 'Submission failed. Please check details.');
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-6 sm:py-12 sm:px-6 lg:px-8 fade-in text-gray-800 dark:text-gray-200">
            <Helmet>
                <title>Customer Dashboard | Regal Rivulet Retreat Hotel</title>
            </Helmet>

            {/* Mobile Profile Header (visible only on mobile) */}
            <div className="md:hidden flex items-center space-x-3 p-4 bg-white dark:bg-charcoal rounded-lg border border-gray-100 dark:border-gray-800 shadow mb-4">
                <div className="h-12 w-12 bg-primary/10 text-primary font-playfair text-xl font-bold flex items-center justify-center rounded-full shrink-0">
                    {user?.full_name?.charAt(0) || 'G'}
                </div>
                <div className="min-w-0">
                    <h2 className="font-playfair font-bold text-base leading-tight truncate">{user?.full_name || 'Guest'}</h2>
                    <span className="text-[10px] text-gray-400 tracking-wider uppercase block truncate">{user?.email}</span>
                </div>
            </div>

            {/* Mobile Horizontal Tab Strip */}
            <div className="md:hidden overflow-x-auto scrollbar-hide mb-4">
                <div className="flex space-x-2 min-w-max pb-1">
                    {[{id:'OVERVIEW',icon:<Calendar className="h-4 w-4"/>,label:'Overview'},
                      {id:'BOOKINGS',icon:<CreditCard className="h-4 w-4"/>,label:'My Bookings'},
                      {id:'PROFILE',icon:<User className="h-4 w-4"/>,label:'Profile'},
                      {id:'NOTIFICATIONS',icon:<Bell className="h-4 w-4"/>,label:'Alerts'}
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => { setActiveTab(tab.id); if(tab.id!=='BOOKINGS') setSelectedBookingId(null); }}
                            className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-all ${
                                activeTab === tab.id ? 'bg-primary text-charcoal shadow' : 'bg-white dark:bg-charcoal border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300'
                            }`}
                        >
                            {tab.icon}<span>{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Desktop Sidebar */}
                <div className="hidden md:block w-64 shrink-0 space-y-2">
                    <div className="p-6 bg-white dark:bg-charcoal rounded-lg border border-gray-100 dark:border-gray-800 text-center shadow">
                        <div className="h-16 w-16 bg-primary/10 text-primary font-playfair text-2xl font-bold flex items-center justify-center rounded-full mx-auto mb-3">
                            {user?.full_name?.charAt(0) || 'G'}
                        </div>
                        <h2 className="font-playfair font-bold text-lg leading-tight">{user?.full_name || 'Guest'}</h2>
                        <span className="text-[10px] text-gray-400 tracking-wider uppercase block mt-1">{user?.email}</span>
                    </div>

                    <div className="bg-white dark:bg-charcoal rounded-lg border border-gray-100 dark:border-gray-800 p-2 shadow space-y-1">
                        <button 
                            onClick={() => { setActiveTab('OVERVIEW'); setSelectedBookingId(null); }}
                            className={`w-full flex items-center space-x-2.5 px-4 py-2.5 rounded text-sm transition-all ${activeTab === 'OVERVIEW' ? 'bg-primary text-charcoal font-bold shadow-sm' : 'hover:bg-gray-100 dark:hover:bg-charcoal-light text-gray-600 dark:text-gray-300'}`}
                        >
                            <Calendar className="h-4 w-4" /> <span>Dashboard Overview</span>
                        </button>
                        <button 
                            onClick={() => { setActiveTab('BOOKINGS'); }}
                            className={`w-full flex items-center space-x-2.5 px-4 py-2.5 rounded text-sm transition-all ${activeTab === 'BOOKINGS' ? 'bg-primary text-charcoal font-bold shadow-sm' : 'hover:bg-gray-100 dark:hover:bg-charcoal-light text-gray-600 dark:text-gray-300'}`}
                        >
                            <CreditCard className="h-4 w-4" /> <span>My Bookings</span>
                        </button>
                        <button 
                            onClick={() => { setActiveTab('PROFILE'); setSelectedBookingId(null); }}
                            className={`w-full flex items-center space-x-2.5 px-4 py-2.5 rounded text-sm transition-all ${activeTab === 'PROFILE' ? 'bg-primary text-charcoal font-bold shadow-sm' : 'hover:bg-gray-100 dark:hover:bg-charcoal-light text-gray-600 dark:text-gray-300'}`}
                        >
                            <User className="h-4 w-4" /> <span>Profile Settings</span>
                        </button>
                        <button 
                            onClick={() => { setActiveTab('NOTIFICATIONS'); setSelectedBookingId(null); }}
                            className={`w-full flex items-center space-x-2.5 px-4 py-2.5 rounded text-sm transition-all ${activeTab === 'NOTIFICATIONS' ? 'bg-primary text-charcoal font-bold shadow-sm' : 'hover:bg-gray-100 dark:hover:bg-charcoal-light text-gray-600 dark:text-gray-300'}`}
                        >
                            <Bell className="h-4 w-4" /> <span>Notifications</span>
                        </button>
                    </div>
                </div>

                {/* Main Dashboard Canvas */}
                <div className="flex-grow min-w-0 space-y-6">
                    
                    {/* Overview Tab */}
                    {activeTab === 'OVERVIEW' && !selectedBookingId && (
                        <div className="space-y-6">
                            <h2 className="font-playfair text-3xl font-bold">Dashboard Overview</h2>
                            
                            {/* Stats */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                <div className="p-6 bg-white dark:bg-charcoal rounded-lg border border-gray-100 dark:border-gray-800 shadow flex items-center justify-between">
                                    <div>
                                        <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider block">Total Bookings</span>
                                        <span className="font-playfair text-3xl font-bold mt-1 block">{metrics?.total_bookings || 0}</span>
                                    </div>
                                    <div className="p-3 bg-primary/10 rounded text-primary"><Calendar className="h-6 w-6" /></div>
                                </div>
                                <div className="p-6 bg-white dark:bg-charcoal rounded-lg border border-gray-100 dark:border-gray-800 shadow flex items-center justify-between">
                                    <div>
                                        <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider block">Pending Payments</span>
                                        <span className="font-playfair text-3xl font-bold mt-1 block text-yellow-500">{metrics?.pending_payments || 0}</span>
                                    </div>
                                    <div className="p-3 bg-yellow-500/10 rounded text-yellow-500"><Clock className="h-6 w-6" /></div>
                                </div>
                                <div className="p-6 bg-white dark:bg-charcoal rounded-lg border border-gray-100 dark:border-gray-800 shadow flex items-center justify-between">
                                    <div>
                                        <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider block">Confirmed Stays</span>
                                        <span className="font-playfair text-3xl font-bold mt-1 block text-green-500">{metrics?.confirmed_bookings || 0}</span>
                                    </div>
                                    <div className="p-3 bg-green-500/10 rounded text-green-500"><CheckCircle className="h-6 w-6" /></div>
                                </div>
                            </div>

                            {/* Help Banner */}
                            <div className="p-5 bg-primary/10 border border-primary/20 text-charcoal dark:text-gray-200 rounded flex space-x-3.5">
                                <HelpCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-playfair text-base font-bold">Manual Booking Process</h4>
                                    <p className="text-xs font-light mt-1 leading-relaxed text-gray-600 dark:text-gray-400">
                                        Once a booking is created, it is marked as PENDING. To guarantee your room block, check My Bookings to select a payment method, scan the admin QR code, and upload a screenshot of your transaction.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Bookings Tab (Listing or details) */}
                    {activeTab === 'BOOKINGS' && !selectedBookingId && (
                        <div className="space-y-6">
                            <h2 className="font-playfair text-3xl font-bold">My Reservations</h2>
                            
                            {loadingBookings && <div className="text-center py-20 text-gray-400 animate-pulse">Loading reservations list...</div>}
                            
                            {!loadingBookings && bookings?.length === 0 && (
                                <div className="text-center py-20 bg-white dark:bg-charcoal border border-gray-100 dark:border-gray-800 rounded text-gray-400 font-light">
                                    No booking records found. Start exploring suites to book your luxury stay!
                                </div>
                            )}

                            {!loadingBookings && bookings && bookings.length > 0 && (
                                <div className="space-y-3">
                                    {bookings.map((booking: any) => (
                                        <div key={booking.id} className="bg-white dark:bg-charcoal p-4 sm:p-6 rounded-lg shadow border border-gray-100 dark:border-gray-800 hover:border-primary/20 transition-all">
                                            <div className="flex justify-between items-start gap-3">
                                                <div className="min-w-0 flex-grow">
                                                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                                        <span className="font-playfair font-bold text-base text-gray-900 dark:text-white leading-tight">{booking.room_detail?.room_name || 'Room'}</span>
                                                        <span className="text-[10px] text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded font-mono">{booking.booking_reference}</span>
                                                    </div>
                                                    <div className="text-xs font-light text-gray-500 flex flex-wrap gap-x-3 gap-y-0.5">
                                                        <span>In: <b>{booking.check_in}</b></span>
                                                        <span>Out: <b>{booking.check_out}</b></span>
                                                        <span className="text-primary font-semibold">${booking.total_amount}</span>
                                                    </div>
                                                </div>
                                                <span className={`shrink-0 px-2 py-1 rounded text-[9px] uppercase font-bold tracking-wider ${
                                                    booking.booking_status === 'CONFIRMED' ? 'bg-green-100 text-green-800 dark:bg-green-950/20 dark:text-green-400' :
                                                    booking.booking_status === 'EXPIRED' || booking.booking_status === 'REJECTED' || booking.booking_status === 'CANCELLED' ? 'bg-red-100 text-red-800 dark:bg-red-950/20 dark:text-red-400' :
                                                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/20 dark:text-yellow-400'
                                                }`}>
                                                    {booking.booking_status.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                                                <span className="text-[10px] text-gray-400">Pay: {booking.payment_status.replace('_', ' ')}</span>
                                                <button 
                                                    onClick={() => setSelectedBookingId(booking.id)}
                                                    className="bg-primary hover:bg-primary-dark text-charcoal font-semibold text-xs uppercase tracking-wider px-4 py-2 rounded transition-all shadow"
                                                >
                                                    Manage →
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Specific Booking Details & Payment Submission */}
                    {selectedBookingId && activeBooking && (
                        <div className="space-y-6">
                            <button 
                                onClick={() => { setSelectedBookingId(null); setActiveTab('BOOKINGS'); }}
                                className="inline-flex items-center space-x-1.5 text-xs text-primary hover:underline"
                            >
                                <ChevronLeft className="h-4 w-4" /> <span>Back to Bookings</span>
                            </button>                             <div className="bg-white dark:bg-charcoal p-4 sm:p-8 rounded-lg border border-gray-100 dark:border-gray-800 shadow space-y-6">
                                <div className="flex flex-wrap justify-between items-start gap-3 pb-4 border-b border-gray-100 dark:border-gray-800">
                                    <div className="min-w-0">
                                        <h2 className="font-playfair text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{activeBooking.room_detail?.room_name}</h2>
                                        <span className="text-xs text-gray-400 tracking-wider break-all">REF: {activeBooking.booking_reference} | Booked {new Date(activeBooking.created_at).toLocaleDateString()}</span>
                                    </div>
                                    
                                    {/* Expiry / Confirmation voucher links */}
                                    {activeBooking.booking_status === 'CONFIRMED' && (
                                        <a 
                                            href={(api.defaults.baseURL || 'http://localhost:8000/api/').replace(/\/api\/?$/, '/admin/')}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center space-x-1 text-xs text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded shrink-0"
                                        >
                                            <FileText className="h-4 w-4" />
                                            <span>Download Voucher</span>
                                        </a>
                                    )}
                                </div>

                                {/* Booking Grid details */}
                                <div className="grid grid-cols-3 gap-2 sm:gap-6 text-sm font-light">
                                    <div className="p-3 sm:p-4 bg-gray-50 dark:bg-charcoal-light rounded border border-gray-100 dark:border-gray-850">
                                        <span className="text-[10px] sm:text-xs text-gray-400 font-semibold block uppercase">Check-In</span>
                                        <span className="font-bold text-sm sm:text-base mt-1 block">{activeBooking.check_in}</span>
                                    </div>
                                    <div className="p-3 sm:p-4 bg-gray-50 dark:bg-charcoal-light rounded border border-gray-100 dark:border-gray-850">
                                        <span className="text-[10px] sm:text-xs text-gray-400 font-semibold block uppercase">Check-Out</span>
                                        <span className="font-bold text-sm sm:text-base mt-1 block">{activeBooking.check_out}</span>
                                    </div>
                                    <div className="p-3 sm:p-4 bg-gray-50 dark:bg-charcoal-light rounded border border-gray-100 dark:border-gray-850">
                                        <span className="text-[10px] sm:text-xs text-gray-400 font-semibold block uppercase">Total</span>
                                        <span className="font-bold text-sm sm:text-base mt-1 block text-primary">${activeBooking.total_amount} <span className="text-[9px] sm:text-xs text-gray-400 font-normal">({activeBooking.total_nights} nights)</span></span>
                                    </div>
                                </div>

                                {/* Status Details Box */}
                                <div className="p-5 rounded-lg border flex space-x-3.5 items-start bg-gray-50 dark:bg-charcoal-light border-gray-100 dark:border-gray-800">
                                    <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                                    <div className="space-y-1 text-xs">
                                        <h4 className="font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200">Reservation Status: {activeBooking.booking_status.replace('_', ' ')}</h4>
                                        <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-light">
                                            {activeBooking.booking_status === 'PENDING_PAYMENT' && "Your suite block is active for 24 hours. Please upload payment proof to submit it for administrative manual review."}
                                            {activeBooking.booking_status === 'PAYMENT_SUBMITTED' && "Payment proof submitted! An administrator is verifying your screenshot. This manual check takes 1-3 hours."}
                                            {activeBooking.booking_status === 'CONFIRMED' && "Verified and confirmed stay. The booking voucher PDF has been emailed to you. Present it at check-in."}
                                            {activeBooking.booking_status === 'REJECTED' && `Verification rejected: ${activeBooking.rejection_reason || 'Screenshot was not matched.'} Please try re-submitting.`}
                                            {activeBooking.booking_status === 'CANCELLED' && `Reservation cancelled: ${activeBooking.cancellation_reason || 'Cancelled by user.'}`}
                                            {activeBooking.booking_status === 'EXPIRED' && "Booking expired: Auto-expired by the system as no payment proof was submitted within 24 hours."}
                                        </p>
                                    </div>
                                </div>

                                {/* Dynamic Payment Form (For PENDING / REJECTED) */}
                                {(activeBooking.booking_status === 'PENDING_PAYMENT' || activeBooking.booking_status === 'REJECTED') && (
                                    <div className="border-t border-gray-100 dark:border-gray-800 pt-6 space-y-6">
                                        <h3 className="font-playfair text-xl font-bold text-gray-900 dark:text-white">Submit Payment Proof</h3>
                                        
                                        {proofSuccess && (
                                            <div className="bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 p-4 rounded text-sm">
                                                {proofSuccess}
                                            </div>
                                        )}
                                        {proofError && (
                                            <div className="bg-red-50 dark:bg-red-950/20 text-red-500 p-4 rounded border border-red-200 text-sm">
                                                {proofError}
                                            </div>
                                        )}

                                        <form onSubmit={handleProofSubmit} className="space-y-6">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                {/* Select Payment Method */}
                                                <div className="space-y-2">
                                                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Select Payment Method</label>
                                                    <select
                                                        required
                                                        value={selectedMethodId}
                                                        onChange={(e) => setSelectedMethodId(e.target.value)}
                                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-charcoal border border-gray-200 dark:border-gray-800 rounded focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none text-sm"
                                                    >
                                                        <option value="">-- Choose Method --</option>
                                                        {payMethods?.map((m: any) => (
                                                            <option key={m.id} value={m.id}>{m.method_name}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                {/* Transaction ID */}
                                                <div className="space-y-2">
                                                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Transaction ID (Optional)</label>
                                                    <input
                                                        type="text"
                                                        value={transactionId}
                                                        onChange={(e) => setTransactionId(e.target.value)}
                                                        placeholder="e.g. 1024X984L"
                                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-charcoal border border-gray-200 dark:border-gray-800 rounded focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none text-sm"
                                                    />
                                                </div>
                                            </div>

                                            {/* Dynamic QR image / details based on selected method */}
                                            {selectedMethod && (
                                                <div className="p-6 bg-gray-50 dark:bg-charcoal-light border border-primary/20 rounded-lg flex flex-col items-center gap-5">
                                                    {selectedMethod.qr_image && (
                                                        <div className="flex flex-col items-center gap-3 w-full">
                                                            <span className="text-xs font-bold uppercase tracking-widest text-primary">📷 Scan QR Code to Pay</span>
                                                            <div className="w-full max-w-sm bg-white p-1 rounded-xl border-2 border-primary/40 shadow-[0_0_32px_rgba(212,175,55,0.18)] shrink-0">
                                                                <img src={selectedMethod.qr_image} alt="QR Code" className="w-full h-auto object-contain rounded-lg" style={{minHeight: '320px'}} />
                                                            </div>
                                                            <span className="text-[11px] text-gray-400 font-light">Open your payment app and point your camera at the code above</span>
                                                        </div>
                                                    )}
                                                    <div className="w-full space-y-2 text-xs font-light border-t border-primary/10 pt-4">
                                                        <h4 className="font-bold text-sm text-primary uppercase tracking-wider text-center">{selectedMethod.method_name} Account Details</h4>
                                                        <div className="grid grid-cols-2 gap-3 text-center mt-3">
                                                            <div className="bg-white dark:bg-charcoal p-3 rounded border border-gray-100 dark:border-gray-800">
                                                                <span className="text-[9px] text-gray-400 uppercase font-semibold block mb-1">Account Holder</span>
                                                                <b className="text-gray-900 dark:text-white text-sm">{selectedMethod.account_name}</b>
                                                            </div>
                                                            <div className="bg-white dark:bg-charcoal p-3 rounded border border-gray-100 dark:border-gray-800">
                                                                <span className="text-[9px] text-gray-400 uppercase font-semibold block mb-1">Account Number</span>
                                                                <b className="text-gray-900 dark:text-white text-sm">{selectedMethod.account_number}</b>
                                                            </div>
                                                        </div>
                                                        {selectedMethod.instructions && (
                                                            <p className="text-gray-400 mt-2 italic leading-relaxed text-center">{selectedMethod.instructions}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* File upload screenshot input */}
                                            <div className="space-y-2">
                                                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 block">Upload Screenshot (Max 5MB: JPG, JPEG, PNG, WEBP)</label>
                                                <div className="border-2 border-dashed border-gray-200 dark:border-gray-800 hover:border-primary rounded-lg p-6 text-center cursor-pointer transition-all relative">
                                                    <input
                                                        type="file"
                                                        required
                                                        onChange={handleFileChange}
                                                        accept="image/jpeg, image/jpg, image/png, image/webp"
                                                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                                    />
                                                    <Upload className="h-8 w-8 text-primary mx-auto mb-2" />
                                                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-300 block">
                                                        {proofFile ? proofFile.name : 'Click or Drag screenshot file here'}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400 block mt-1">Limit 5MB. Formats: JPG, JPEG, PNG, WEBP</span>
                                                </div>
                                            </div>

                                            {/* Notes */}
                                            <div className="space-y-2">
                                                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Additional Notes</label>
                                                <textarea
                                                    rows={3}
                                                    value={proofNotes}
                                                    onChange={(e) => setProofNotes(e.target.value)}
                                                    placeholder="Enter transaction details or comments..."
                                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-charcoal border border-gray-200 dark:border-gray-800 rounded focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none text-sm font-light"
                                                />
                                            </div>

                                            <button
                                                type="submit"
                                                className="bg-primary hover:bg-primary-dark text-charcoal font-bold uppercase text-xs tracking-widest px-8 py-3 rounded transition-all"
                                            >
                                                Send Payment Proof
                                            </button>

                                        </form>
                                    </div>
                                )}

                                {/* Cancellation panel (only visible if check_in is >24 hours away and not cancelled/expired) */}
                                {activeBooking.booking_status !== 'CANCELLED' && activeBooking.booking_status !== 'EXPIRED' && (
                                    <div className="border-t border-red-950/20 pt-6">
                                        <h4 className="text-sm font-bold text-red-500 uppercase tracking-wider mb-2">Cancel Reservation</h4>
                                        <p className="text-xs text-gray-400 font-light mb-4 leading-relaxed">
                                            Cancellations are allowed up to 24 hours prior to the check-in date. Admin cancellations are unrestricted.
                                        </p>
                                        <button
                                            onClick={() => {
                                                if (window.confirm("Are you sure you want to cancel this reservation?")) {
                                                    cancelBookingMutation.mutate(activeBooking.id);
                                                }
                                            }}
                                            className="bg-red-650 hover:bg-red-700 text-white font-bold uppercase text-[10px] tracking-widest px-5 py-2.5 rounded transition-all shadow"
                                        >
                                            Cancel Booking
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Profile Settings Tab */}
                    {activeTab === 'PROFILE' && (
                        <div className="space-y-8">
                            {/* Profile Info */}
                            <div className="bg-white dark:bg-charcoal p-6 sm:p-8 rounded-lg border border-gray-100 dark:border-gray-800 shadow space-y-6">
                                <h3 className="font-playfair text-xl font-bold flex items-center space-x-2 border-b border-gray-100 dark:border-gray-800 pb-3">
                                    <User className="h-5 w-5 text-primary" />
                                    <span>Profile Information</span>
                                </h3>

                                {profileSuccess && <div className="bg-green-50 dark:bg-green-950/20 text-green-600 p-4 rounded text-sm">{profileSuccess}</div>}
                                {profileError && <div className="bg-red-50 dark:bg-red-950/20 text-red-500 p-4 rounded border border-red-200 text-sm">{profileError}</div>}

                                <form onSubmit={handleProfileSubmit} className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Full Name</label>
                                            <input
                                                type="text"
                                                required
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                                className="w-full px-4 py-2 bg-gray-50 dark:bg-charcoal border border-gray-200 dark:border-gray-800 text-sm rounded focus:ring-1 focus:ring-primary focus:outline-none"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Phone Number</label>
                                            <input
                                                type="text"
                                                required
                                                value={phoneNumber}
                                                onChange={(e) => setPhoneNumber(e.target.value)}
                                                className="w-full px-4 py-2 bg-gray-50 dark:bg-charcoal border border-gray-200 dark:border-gray-800 text-sm rounded focus:ring-1 focus:ring-primary focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                    <button type="submit" className="bg-primary hover:bg-primary-dark text-charcoal font-bold uppercase text-xs tracking-wider px-6 py-2.5 rounded transition-all">
                                        Update Details
                                    </button>
                                </form>
                            </div>

                            {/* Password Change */}
                            <div className="bg-white dark:bg-charcoal p-6 sm:p-8 rounded-lg border border-gray-100 dark:border-gray-800 shadow space-y-6">
                                <h3 className="font-playfair text-xl font-bold flex items-center space-x-2 border-b border-gray-100 dark:border-gray-800 pb-3">
                                    <Key className="h-5 w-5 text-primary" />
                                    <span>Change Password</span>
                                </h3>

                                {pwSuccess && <div className="bg-green-50 dark:bg-green-950/20 text-green-600 p-4 rounded text-sm">{pwSuccess}</div>}
                                {pwError && <div className="bg-red-50 dark:bg-red-950/20 text-red-500 p-4 rounded border border-red-200 text-sm">{pwError}</div>}

                                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Current Password</label>
                                        <input
                                            type="password"
                                            required
                                            value={oldPassword}
                                            onChange={(e) => setOldPassword(e.target.value)}
                                            className="w-full px-4 py-2 bg-gray-50 dark:bg-charcoal border border-gray-200 dark:border-gray-800 text-sm rounded focus:ring-1 focus:ring-primary focus:outline-none"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">New Password</label>
                                            <input
                                                type="password"
                                                required
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="w-full px-4 py-2 bg-gray-50 dark:bg-charcoal border border-gray-200 dark:border-gray-800 text-sm rounded focus:ring-1 focus:ring-primary focus:outline-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Confirm New Password</label>
                                            <input
                                                type="password"
                                                required
                                                value={confirmNewPassword}
                                                onChange={(e) => setConfirmNewPassword(e.target.value)}
                                                className="w-full px-4 py-2 bg-gray-50 dark:bg-charcoal border border-gray-200 dark:border-gray-800 text-sm rounded focus:ring-1 focus:ring-primary focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                    <button type="submit" className="bg-primary hover:bg-primary-dark text-charcoal font-bold uppercase text-xs tracking-wider px-6 py-2.5 rounded transition-all">
                                        Update Password
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Notifications Tab */}
                    {activeTab === 'NOTIFICATIONS' && (
                        <div className="space-y-6">
                            <h2 className="font-playfair text-3xl font-bold">In-App Notifications</h2>
                            
                            {notifications?.length === 0 ? (
                                <div className="text-center py-20 bg-white dark:bg-charcoal border border-gray-100 dark:border-gray-800 rounded text-gray-400 font-light">
                                    No notifications to display.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {notifications?.map((notif: any) => (
                                        <div 
                                            key={notif.id} 
                                            onClick={() => { if (!notif.is_read) markReadMutation.mutate(notif.id); }}
                                            className={`p-4 bg-white dark:bg-charcoal border rounded-lg shadow-sm flex justify-between items-center cursor-pointer transition-all ${
                                                notif.is_read ? 'border-gray-100 dark:border-gray-800 opacity-60' : 'border-primary/30 bg-primary/5'
                                            }`}
                                        >
                                            <div>
                                                <h4 className="font-semibold text-sm">{notif.title}</h4>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 font-light mt-1">{notif.message}</p>
                                                <span className="text-[10px] text-gray-400 font-light block mt-1.5">{new Date(notif.created_at).toLocaleString()}</span>
                                            </div>
                                            {!notif.is_read && (
                                                <span className="h-2 w-2 rounded-full bg-primary inline-block shrink-0"></span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default Dashboard;
