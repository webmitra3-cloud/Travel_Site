import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Calendar, Users, ShieldAlert, Sparkles, Check, CheckCircle2, ChevronLeft } from 'lucide-react';

const RoomDetails = () => {
    const { id } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    // Default dates from URL parameters if available
    const [checkIn, setCheckIn] = useState(searchParams.get('check_in') || '');
    const [checkOut, setCheckOut] = useState(searchParams.get('check_out') || '');
    const [guests, setGuests] = useState(searchParams.get('guests') || '1');

    const [bookingError, setBookingError] = useState('');
    const [availabilityMsg, setAvailabilityMsg] = useState('');
    const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
    const [checkingAvailability, setCheckingAvailability] = useState(false);



    // Let's check the queryFn for room detail. It should fetch `api.get(f'/rooms/{id}/')`.
    // Wait, let's fetch it using `id`.
    const { data: roomDetail, isLoading: loadingDetail, error } = useQuery({
        queryKey: ['room-detail', id],
        queryFn: async () => {
            const { data } = await api.get(`/rooms/${id}/`);
            return data;
        }
    });

    // Night calculation
    const calculateNights = () => {
        if (!checkIn || !checkOut) return 0;
        const start = new Date(checkIn);
        const end = new Date(checkOut);
        const diff = end.getTime() - start.getTime();
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    };
    const nights = calculateNights();
    const totalCost = roomDetail ? parseFloat(roomDetail.price_per_night) * nights : 0;

    // Check Availability endpoint action
    useEffect(() => {
        const checkRoomAvailability = async () => {
            if (!checkIn || !checkOut || !id) return;
            setCheckingAvailability(true);
            setIsAvailable(null);
            setAvailabilityMsg('');
            try {
                const { data } = await api.get(`/rooms/${id}/availability/`, {
                    params: { start_date: checkIn, end_date: checkOut }
                });
                
                // If nights overlap check
                const isBlocked = data.blocked_dates.length > 0; // if any night is blocked
                if (isBlocked) {
                    setIsAvailable(false);
                    setAvailabilityMsg(`Blocked dates in this range: ${data.blocked_dates.join(', ')}`);
                } else if (data.available_units <= 0) {
                    setIsAvailable(false);
                    setAvailabilityMsg('Room is fully booked for these dates.');
                } else {
                    setIsAvailable(true);
                    setAvailabilityMsg(`Available! ${data.available_units} units remaining.`);
                }
            } catch (err) {
                setIsAvailable(false);
                setAvailabilityMsg('Failed to fetch availability.');
            } finally {
                setCheckingAvailability(false);
            }
        };

        checkRoomAvailability();
    }, [checkIn, checkOut, id]);

    const handleBookingSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isAuthenticated) {
            navigate('/login?message=Please login for booking');
            return;
        }
        if (!isAvailable) {
            setBookingError('Selected dates are not available.');
            return;
        }

        try {
            setBookingError('');
            const payload = {
                room: id,
                check_in: checkIn,
                check_out: checkOut,
                guests: parseInt(guests)
            };
            const { data } = await api.post('/bookings/', payload);
            navigate(`/dashboard?booking_id=${data.id}`); // Direct to dashboard with reservation ID
        } catch (err: any) {
            setBookingError(err.response?.data?.room?.[0] || err.response?.data?.non_field_errors?.[0] || 'Failed to create booking.');
        }
    };

    if (loadingDetail) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-20 text-center animate-pulse">
                <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-lg mb-8"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-800 w-1/3 mx-auto mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-800 w-2/3 mx-auto"></div>
            </div>
        );
    }

    if (error || !roomDetail) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-20 text-center text-red-500">
                Failed to retrieve room details. Please try again.
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12 sm:px-6 lg:px-8 fade-in text-gray-800 dark:text-gray-200">
            <Helmet>
                <title>{roomDetail.room_name} | Regal Rivulet Retreat Hotel</title>
                <meta name="description" content={roomDetail.description} />
            </Helmet>

            <Link to="/rooms" className="inline-flex items-center space-x-1 text-sm text-primary hover:underline mb-6">
                <ChevronLeft className="h-4 w-4" /> <span>Back to Catalog</span>
            </Link>

            <div className="flex flex-col lg:grid lg:grid-cols-3 lg:gap-12">
                
                {/* Booking Widget — first on mobile, right column on desktop */}
                <div className="order-first lg:order-last lg:col-span-1 mb-6 lg:mb-0">
                    <div className="glass-card p-5 sm:p-8 rounded-lg lg:sticky lg:top-24 border border-gray-100 dark:border-gray-800">
                        <h3 className="font-playfair text-xl sm:text-2xl font-bold mb-4 text-center">Bespoke Reservation</h3>
                        
                        <div className="flex justify-between items-center pb-4 mb-5 border-b border-gray-100 dark:border-gray-800">
                            <span className="text-sm text-gray-500">Price Per Night</span>
                            <span className="font-playfair text-2xl font-bold text-primary">${roomDetail.price_per_night}</span>
                        </div>

                        {bookingError && (
                            <div className="bg-red-50 dark:bg-red-950/20 text-red-500 border border-red-200 dark:border-red-900/30 p-3 rounded text-xs mb-4">
                                {bookingError}
                            </div>
                        )}

                        <form onSubmit={handleBookingSubmit} className="space-y-4">
                            
                            {/* Check In + Check Out - side by side on mobile */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Check-In</label>
                                    <input
                                        type="date"
                                        required
                                        min={new Date().toISOString().split('T')[0]}
                                        value={checkIn}
                                        onChange={(e) => setCheckIn(e.target.value)}
                                        className="w-full px-3 py-2.5 bg-gray-50 dark:bg-charcoal border border-gray-200 dark:border-gray-800 text-sm rounded focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Check-Out</label>
                                    <input
                                        type="date"
                                        required
                                        min={checkIn || new Date().toISOString().split('T')[0]}
                                        value={checkOut}
                                        onChange={(e) => setCheckOut(e.target.value)}
                                        className="w-full px-3 py-2.5 bg-gray-50 dark:bg-charcoal border border-gray-200 dark:border-gray-800 text-sm rounded focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                                    />
                                </div>
                            </div>

                            {/* Guests */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Total Guests</label>
                                <select
                                    value={guests}
                                    onChange={(e) => setGuests(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-charcoal border border-gray-200 dark:border-gray-800 text-sm rounded focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                                >
                                    {[...Array(roomDetail.capacity)].map((_, idx) => (
                                        <option key={idx + 1} value={idx + 1}>{idx + 1} Guest{idx > 0 ? 's' : ''}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Availability check indicators */}
                            {(checkIn && checkOut) && (
                                <div className="p-3 bg-gray-50 dark:bg-charcoal rounded border border-gray-100 dark:border-gray-800 text-xs">
                                    {checkingAvailability ? (
                                        <span className="text-gray-400">Verifying calendar dates...</span>
                                    ) : (
                                        <div className="flex items-center space-x-1.5">
                                            {isAvailable ? (
                                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                            ) : (
                                                <ShieldAlert className="h-4 w-4 text-red-500" />
                                            )}
                                            <span className={isAvailable ? 'text-green-500' : 'text-red-500'}>{availabilityMsg}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Bill Breakdown */}
                            {nights > 0 && (
                                <div className="space-y-2 pt-4 border-t border-gray-100 dark:border-gray-800 text-sm font-light">
                                    <div className="flex justify-between">
                                        <span>Total Nights</span>
                                        <span>{nights} Night{nights > 1 ? 's' : ''}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Total Est. Cost</span>
                                        <span className="font-bold text-primary">${totalCost}</span>
                                    </div>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={checkingAvailability || isAvailable === false}
                                className="w-full bg-primary hover:bg-primary-dark text-charcoal py-3.5 rounded font-bold uppercase text-xs tracking-widest transition-all mt-2 disabled:opacity-50"
                            >
                                {!isAuthenticated ? 'Sign In to Book' : 'Submit Reservation'}
                            </button>

                        </form>
                    </div>
                </div>

                {/* Main Content (Image & Description) — below form on mobile */}
                <div className="order-last lg:order-first lg:col-span-2 space-y-8">
                    {/* Cover image */}
                    <div className="h-64 sm:h-[380px] lg:h-[450px] bg-gray-900 rounded-lg overflow-hidden relative shadow-lg">
                        {roomDetail.cover_image ? (
                            <img src={roomDetail.cover_image} alt={roomDetail.room_name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">Luxury Cover Image</div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                        <h1 className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 font-playfair text-2xl sm:text-4xl font-bold text-white tracking-wide">{roomDetail.room_name}</h1>
                    </div>

                    {/* Room Description */}
                    <div className="space-y-4">
                        <h2 className="font-playfair text-2xl font-bold text-gray-900 dark:text-white">Room Description</h2>
                        <p className="font-light text-gray-600 dark:text-gray-300 leading-relaxed">{roomDetail.description}</p>
                    </div>

                    {/* Amenities */}
                    <div className="space-y-4">
                        <h2 className="font-playfair text-2xl font-bold text-gray-900 dark:text-white">Room Amenities</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {roomDetail.amenities.map((amenity: any) => (
                                <div key={amenity.id} className="flex items-center space-x-2.5 p-3 bg-gray-50 dark:bg-charcoal rounded border border-gray-100 dark:border-gray-800">
                                    <div className="p-1.5 bg-primary/10 rounded text-primary shrink-0">
                                        <Check className="h-4 w-4" />
                                    </div>
                                    <span className="text-sm font-light text-gray-700 dark:text-gray-300">{amenity.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Reviews */}
                    <div className="space-y-6">
                        <h2 className="font-playfair text-2xl font-bold text-gray-900 dark:text-white">Guest Reviews</h2>
                        {roomDetail.reviews.length === 0 ? (
                            <p className="text-sm text-gray-400 font-light italic">No reviews submitted yet for this suite.</p>
                        ) : (
                            <div className="space-y-4">
                                {roomDetail.reviews.map((rev: any) => (
                                    <div key={rev.id} className="p-4 bg-gray-50 dark:bg-charcoal rounded border border-gray-100 dark:border-gray-800">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-bold text-xs uppercase text-primary tracking-wider">{rev.user_name || rev.user_email}</span>
                                            <div className="flex space-x-0.5">
                                                {[...Array(rev.rating)].map((_, i) => (
                                                    <Sparkles key={i} className="h-3.5 w-3.5 text-primary fill-primary" />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 font-light leading-relaxed">"{rev.comment}"</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default RoomDetails;
