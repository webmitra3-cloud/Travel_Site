import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../services/api';
import { Filter, Search, SlidersHorizontal, ArrowUpDown, ShieldCheck } from 'lucide-react';

const asList = (data: any) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    return [];
};

const Rooms = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    
    // Read URL params (from Home booking widget)
    const checkInUrl = searchParams.get('check_in') || '';
    const checkOutUrl = searchParams.get('check_out') || '';
    const guestsUrl = searchParams.get('guests') || '';

    // Filter states
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [roomType, setRoomType] = useState(searchParams.get('room_type') || '');
    const [capacity, setCapacity] = useState(searchParams.get('capacity') || guestsUrl || '');
    const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '');
    const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '');
    const [ordering, setOrdering] = useState(searchParams.get('ordering') || 'popular');

    useEffect(() => {
        setSearch(searchParams.get('search') || '');
        setRoomType(searchParams.get('room_type') || '');
        setCapacity(searchParams.get('capacity') || searchParams.get('guests') || '');
        setMinPrice(searchParams.get('min_price') || '');
        setMaxPrice(searchParams.get('max_price') || '');
        setOrdering(searchParams.get('ordering') || 'popular');
    }, [searchParams]);

    // Update query params in URL
    const applyFilters = (e?: React.FormEvent) => {
        e?.preventDefault();
        const params: any = {};
        if (search) params.search = search;
        if (roomType) params.room_type = roomType;
        if (capacity) params.capacity = capacity;
        if (minPrice) params.min_price = minPrice;
        if (maxPrice) params.max_price = maxPrice;
        if (ordering) params.ordering = ordering;
        
        // Preserve dates
        if (checkInUrl) params.check_in = checkInUrl;
        if (checkOutUrl) params.check_out = checkOutUrl;
        if (guestsUrl && !capacity) params.capacity = guestsUrl;

        setSearchParams(params);
    };

    // Query rooms list from API based on active URL searchParams
    const { data: rooms, isLoading, error } = useQuery({
        queryKey: ['rooms', searchParams.toString()],
        queryFn: async () => {
            const params: any = Object.fromEntries(searchParams.entries());
            if (params.guests && !params.capacity) {
                params.capacity = params.guests;
                delete params.guests;
            }
            const { data } = await api.get('/rooms/', {
                params
            });
            return data;
        }
    });

    const resetFilters = () => {
        setSearch('');
        setRoomType('');
        setCapacity('');
        setMinPrice('');
        setMaxPrice('');
        setOrdering('popular');
        setSearchParams({});
    };

    const roomList = asList(rooms);

    return (
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 fade-in text-gray-800 dark:text-gray-200">
            <Helmet>
                <title>Rooms & Suites | Regal Rivulet Retreat Hotel</title>
                <meta name="description" content="Browse our luxury Presidential Suites, Deluxe King Rooms, and Twin Rooms. Compare prices, capacities, and book with manual validation." />
            </Helmet>

            <div className="text-center mb-12">
                <span className="text-primary font-bold text-xs uppercase tracking-[0.2em]">Exquisite Stays</span>
                <h1 className="font-playfair text-4xl sm:text-5xl font-bold mt-2 text-gray-900 dark:text-white">Our Rooms & Suites</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-light max-w-xl mx-auto mt-2">
                    Select from our hand-picked collection of premium boutique rooms. Feel the harmony of traditional design and luxury finishes.
                </p>
                <div className="h-0.5 w-16 bg-primary mx-auto mt-4"></div>
            </div>

            {/* Filter Section */}
            <form onSubmit={applyFilters} className="bg-white dark:bg-charcoal p-4 sm:p-6 rounded-lg shadow-md border border-gray-100 dark:border-gray-800 mb-8">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 items-end">
                    
                    {/* Search - full width on all sizes */}
                    <div className="space-y-1 col-span-2 md:col-span-3 lg:col-span-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Search Room</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Presidential Suite..."
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-charcoal-light border border-gray-200 dark:border-gray-800 text-sm text-gray-900 dark:text-white rounded focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                            />
                            <Search className="h-4 w-4 text-gray-400 absolute left-3 top-3.5" />
                        </div>
                    </div>

                    {/* Room Type */}
                    <div className="space-y-1">
                        <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Type</label>
                        <select
                            value={roomType}
                            onChange={(e) => setRoomType(e.target.value)}
                            className="w-full px-3 py-2.5 bg-gray-50 dark:bg-charcoal-light border border-gray-200 dark:border-gray-800 text-sm text-gray-900 dark:text-white rounded focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                        >
                            <option value="">All Types</option>
                            <option value="Suite">Suite</option>
                            <option value="Deluxe">Deluxe</option>
                            <option value="Standard">Standard</option>
                        </select>
                    </div>

                    {/* Capacity */}
                    <div className="space-y-1">
                        <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Guests</label>
                        <select
                            value={capacity}
                            onChange={(e) => setCapacity(e.target.value)}
                            className="w-full px-3 py-2.5 bg-gray-50 dark:bg-charcoal-light border border-gray-200 dark:border-gray-800 text-sm text-gray-900 dark:text-white rounded focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                        >
                            <option value="">Any</option>
                            <option value="1">1+</option>
                            <option value="2">2+</option>
                            <option value="3">3+</option>
                            <option value="4">4+</option>
                        </select>
                    </div>

                    {/* Ordering */}
                    <div className="space-y-1">
                        <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Sort By</label>
                        <select
                            value={ordering}
                            onChange={(e) => setOrdering(e.target.value)}
                            className="w-full px-3 py-2.5 bg-gray-50 dark:bg-charcoal-light border border-gray-200 dark:border-gray-800 text-sm text-gray-900 dark:text-white rounded focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                        >
                            <option value="popular">Most Popular</option>
                            <option value="price_asc">Price: Low → High</option>
                            <option value="price_desc">Price: High → Low</option>
                        </select>
                    </div>

                    {/* Action buttons - span 2 cols on mobile */}
                    <div className="flex space-x-2 col-span-2 md:col-span-1">
                        <button
                            type="submit"
                            className="flex-grow bg-primary hover:bg-primary-dark text-charcoal text-xs uppercase font-bold py-3.5 rounded transition-all shadow-md"
                        >
                            Apply
                        </button>
                        <button
                            type="button"
                            onClick={resetFilters}
                            className="px-3 border border-gray-200 dark:border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors text-xs"
                            title="Reset Filters"
                        >
                            Reset
                        </button>
                    </div>

                </div>
            </form>

            {/* Catalog Grid */}
            {isLoading && (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                    {[1, 2, 3, 4].map((n) => (
                        <div key={n} className="bg-white dark:bg-charcoal rounded-xl overflow-hidden shadow border border-gray-100 dark:border-gray-800 animate-pulse flex flex-col">
                            <div className="aspect-[4/3] bg-gray-200 dark:bg-gray-800"></div>
                            <div className="p-3 space-y-2 flex-grow">
                                <div className="h-3 bg-gray-200 dark:bg-gray-800 w-1/3 rounded"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-800 w-3/4 rounded"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-800 w-1/2 rounded"></div>
                                <div className="h-3 bg-gray-200 dark:bg-gray-800 w-full rounded"></div>
                                <div className="h-3 bg-gray-200 dark:bg-gray-800 w-2/3 rounded"></div>
                            </div>
                            <div className="h-10 bg-gray-200 dark:bg-gray-800"></div>
                        </div>
                    ))}
                </div>
            )}

            {error && (
                <div className="text-center py-20 text-red-500">
                    Failed to retrieve catalog. Please check network connection.
                </div>
            )}

            {!isLoading && !error && roomList.length === 0 && (
                <div className="text-center py-20 text-gray-400 font-light">
                    No luxury rooms match your filter queries. Try resetting.
                </div>
            )}

            {!isLoading && !error && (
                <>
                    {/* Results count */}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 font-light">
                        Showing <b>{roomList.length}</b> {roomList.length === 1 ? 'room' : 'rooms'} available
                    </p>

                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                        {roomList.map((room: any) => (
                            <div
                                key={room.id}
                                className="bg-white dark:bg-charcoal rounded-xl overflow-hidden shadow border border-gray-100 dark:border-gray-800 flex flex-col group hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                            >
                                {/* Image */}
                                <div className="relative overflow-hidden aspect-[4/3]">
                                    {room.cover_image ? (
                                        <img
                                            src={room.cover_image}
                                            alt={room.room_name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-gray-400 text-xs">
                                            No Image
                                        </div>
                                    )}
                                    {/* Availability badge */}
                                    {room.availability_status !== 'AVAILABLE' && (
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                            <span className="bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                                                Unavailable
                                            </span>
                                        </div>
                                    )}
                                    {/* Price pill top-right */}
                                    <div className="absolute top-2 right-2 bg-charcoal/80 backdrop-blur-sm text-primary text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full border border-primary/30">
                                        ${room.price_per_night}<span className="text-gray-400 font-normal">/night</span>
                                    </div>
                                </div>

                                {/* Card body */}
                                <div className="flex flex-col flex-grow p-3 sm:p-4">
                                    {/* Reviews row */}
                                    <div className="flex items-center space-x-1 text-gray-400 text-[10px] sm:text-xs mb-1.5">
                                        <span>⭐</span>
                                        <span>Reviews: ({room.reviews_count ?? 0})</span>
                                    </div>

                                    {/* Type label + name */}
                                    <p className="text-[9px] sm:text-[10px] text-primary font-bold uppercase tracking-widest mb-0.5">
                                        {room.room_type}
                                    </p>
                                    <h2 className="font-playfair font-bold text-sm sm:text-base text-gray-900 dark:text-white leading-tight mb-1 line-clamp-2">
                                        {room.room_name}
                                    </h2>

                                    {/* Price text row */}
                                    <p className="text-primary font-bold text-sm sm:text-base mb-2">
                                        ${room.price_per_night}
                                        <span className="text-gray-400 text-[10px] font-normal"> / night</span>
                                    </p>

                                    {/* Description */}
                                    <p className="text-gray-500 dark:text-gray-400 text-[11px] sm:text-xs font-light line-clamp-2 leading-relaxed mb-3 flex-grow">
                                        {room.description}
                                    </p>

                                    {/* Capacity */}
                                    <p className="text-[10px] text-gray-400 mb-3">
                                        Max: <b className="text-gray-600 dark:text-gray-300">{room.capacity} guests</b>
                                        <span className="mx-1.5">·</span>
                                        <b className="text-gray-600 dark:text-gray-300">{room.total_units}</b> units
                                    </p>
                                </div>

                                {/* View Room button — flush to bottom */}
                                <Link
                                    to={`/rooms/${room.id}?check_in=${checkInUrl}&check_out=${checkOutUrl}&guests=${guestsUrl}`}
                                    className="block w-full bg-primary hover:bg-primary-dark text-charcoal text-center py-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all"
                                >
                                    View Room
                                </Link>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default Rooms;
