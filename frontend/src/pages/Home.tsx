import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { Calendar, Users, MapPin, Phone, Mail, Award, Compass, ShieldAlert, Sparkles, Coffee, X } from 'lucide-react';


// Fallback high-quality images for luxury styling
const FALLBACK_SLIDES = [
  {
    image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1920",
    title: "Experience True Luxury",
    subtitle: "Luxury Stays. Exceptional Experiences."
  },
  {
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1920",
    title: "A Sanctuary of Peace",
    subtitle: "A peaceful retreat in Singapore"
  },
  {
    image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=1920",
    title: "Premium World-Class Dining",
    subtitle: "Exquisite culinary delights prepared by international chefs"
  }
];

const FALLBACK_AMENITIES = [
  { name: 'Luxury Spa', icon_name: 'Compass', description: 'World-class therapeutic wellness massages & facials' },
  { name: 'Heated Infinity Pool', icon_name: 'Sparkles', description: 'Scenic outdoor swimming pool with valley views' },
  { name: 'Fine Dining Restaurant', icon_name: 'Coffee', description: 'Bespoke cuisine and organic local recipes' }
];

const FALLBACK_TESTIMONIALS = [
  { customer_name: "Eleanor Vance", review: "The service here is impeccable. The Presidential Suite was clean, spacious, and possessed stunning views of the valley. A 10/10 stay!", rating: 5 },
  { customer_name: "Julian Alvarez", review: "From the luxury airport transfer to the fine dining restaurant, every detail was perfect. The manual confirmation gave me absolute confidence.", rating: 5 },
  { customer_name: "Sarah Jenkins", review: "A peaceful sanctuary. The spa treatments are outstanding. Truly an exceptional, premium experience.", rating: 5 }
];

const asList = (data: any) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    return [];
};

const Home = () => {
    const navigate = useNavigate();

    const [currentSlide, setCurrentSlide] = useState(0);
    const [popupClosed, setPopupClosed] = useState(false);
    const [bannerClosed, setBannerClosed] = useState(false);

    // Fetch active announcements
    const { data: activeAnnouncements } = useQuery({
        queryKey: ['active-announcements'],
        queryFn: async () => {
            const { data } = await api.get('/announcements/active/');
            return data;
        },
        retry: false
    });

    const announcementsList = asList(activeAnnouncements);
    const activeAnnouncement = announcementsList.length > 0 ? announcementsList[0] : null;

    // Check sessionStorage only once when announcement data loads
    const [dismissChecked, setDismissChecked] = useState(false);
    useEffect(() => {
        if (activeAnnouncement && !dismissChecked) {
            const wasDismissed = sessionStorage.getItem(`dismissed_popup_${activeAnnouncement.id}`) === 'true';
            const bannerWasDismissed = sessionStorage.getItem(`dismissed_banner_${activeAnnouncement.id}`) === 'true';
            if (wasDismissed) setPopupClosed(true);
            if (bannerWasDismissed) setBannerClosed(true);
            setDismissChecked(true);
        }
    }, [activeAnnouncement, dismissChecked]);

    const showPopup = activeAnnouncement && !popupClosed && dismissChecked;
    const showBanner = activeAnnouncement && !bannerClosed && dismissChecked;

    // Search widget state
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [guests, setGuests] = useState('1');

    // Fetch slides, featured rooms, testimonials from API
    const { data: slides } = useQuery({
        queryKey: ['home-slides'],
        queryFn: async () => {
            const { data } = await api.get('/cms/slides/');
            return data;
        },
        retry: false
    });

    const { data: rooms } = useQuery({
        queryKey: ['featured-rooms'],
        queryFn: async () => {
            const { data } = await api.get('/rooms/');
            return data;
        },
        retry: false
    });

    const { data: testimonials } = useQuery({
        queryKey: ['home-testimonials'],
        queryFn: async () => {
            const { data } = await api.get('/cms/testimonials/');
            return data;
        },
        retry: false
    });

    const { data: homepageContentList } = useQuery({
        queryKey: ['home-content'],
        queryFn: async () => {
            const { data } = await api.get('/cms/homepage-content/');
            return data;
        },
        retry: false
    });

    const { data: amenitiesData } = useQuery({
        queryKey: ['home-amenities'],
        queryFn: async () => {
            const { data } = await api.get('/cms/amenities/');
            return data;
        },
        retry: false
    });

    const { data: contactInfoList } = useQuery({
        queryKey: ['contact-info'],
        queryFn: async () => {
            const { data } = await api.get('/cms/contact-info/');
            return data;
        },
        retry: false
    });

    const slidesList = asList(slides);
    const testimonialsList = asList(testimonials);
    const roomsList = asList(rooms);
    const homepageContents = asList(homepageContentList);
    const amenitiesList = asList(amenitiesData);
    const contactInfos = asList(contactInfoList);

    const activeSlides = slidesList.length > 0 ? slidesList : FALLBACK_SLIDES;
    const activeTestimonials = testimonialsList.length > 0 ? testimonialsList : FALLBACK_TESTIMONIALS;
    const featuredRooms = roomsList.slice(0, 3);
    const homepageContent = homepageContents.length > 0 ? homepageContents[0] : null;
    const activeAmenities = amenitiesList.length > 0 ? amenitiesList : FALLBACK_AMENITIES;
    const contactInfo = contactInfos.length > 0 ? contactInfos[0] : null;

    // Helper to render lucide icons from string name
    const renderIcon = (iconName: string) => {
        const icons: { [key: string]: any } = { Compass, Sparkles, Coffee, Award, ShieldAlert, Users, Calendar, MapPin, Phone, Mail };
        const IconComponent = icons[iconName] || Compass;
        return <IconComponent className="h-6 w-6" />;
    };

    // Rotate slides
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [activeSlides.length]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        navigate(`/rooms?check_in=${checkIn}&check_out=${checkOut}&guests=${guests}`);
    };

    return (
        <div className="fade-in bg-white dark:bg-charcoal-dark text-gray-800 dark:text-gray-200">
            {showBanner && (
                <div className="bg-primary/20 border-b border-primary/30 text-charcoal dark:text-white px-4 py-3 text-center text-xs flex justify-between items-center z-40 relative">
                    <span className="mx-auto flex items-center space-x-1.5 font-light">
                        <span>📢</span>
                        <span>New Job Vacancy Available — Apply Before <b>{activeAnnouncement.deadline}</b></span>
                        <Link to="/vacancies" className="underline text-primary font-bold hover:underline ml-2">View Details</Link>
                    </span>
                    <button
                        onClick={() => {
                            sessionStorage.setItem(`dismissed_banner_${activeAnnouncement.id}`, 'true');
                            setBannerClosed(true);
                        }}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="h-4 w-4 text-gray-450 hover:text-red-500 shrink-0" />
                    </button>
                </div>
            )}
            <Helmet>
                <title>Regal Rivulet | Retreat Hotel Singapore</title>
                <meta name="description" content="Discover premium suites, rejuvenating spa treatments, fine dining, and manual payment bookings at the Regal Rivulet Retreat Hotel." />
            </Helmet>

            {/* Fullscreen Hero Slider */}
            <div className="relative h-[90vh] overflow-hidden bg-black">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 0.6, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${activeSlides[currentSlide].image || activeSlides[currentSlide].image_or_video})` }}
                    />
                </AnimatePresence>

                {/* Overlay Text content */}
                <div className="absolute inset-0 flex items-center justify-center text-center z-10 px-4">
                    <div className="max-w-4xl">
                        <motion.span 
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-primary font-bold text-xs uppercase tracking-[0.3em] block mb-3"
                        >
                            Regal Rivulet Retreat Hotel Singapore
                        </motion.span>
                        <motion.h1 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="font-playfair text-4xl sm:text-6xl md:text-7xl font-bold text-white tracking-tight leading-tight mb-4"
                        >
                            {activeSlides[currentSlide].title}
                        </motion.h1>
                        <motion.p 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="text-gray-200 text-lg sm:text-2xl font-light tracking-wide mb-8 max-w-2xl mx-auto"
                        >
                            {activeSlides[currentSlide].subtitle}
                        </motion.p>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                            className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4"
                        >
                            <Link to="/rooms" className="w-full sm:w-auto text-center bg-primary hover:bg-primary-dark text-charcoal font-bold uppercase text-xs tracking-widest px-8 py-3.5 rounded transition-all shadow-lg shadow-primary/20">
                                View Our Rooms
                            </Link>
                            <a href="#about" className="w-full sm:w-auto text-center border border-white hover:border-primary text-white hover:text-primary font-bold uppercase text-xs tracking-widest px-8 py-3.5 rounded transition-all">
                                Explore Story
                            </a>
                        </motion.div>
                    </div>
                </div>

                {/* Slider Indicators */}
                <div className="absolute bottom-10 left-0 right-0 flex justify-center space-x-2 z-20">
                    {activeSlides.map((_: any, idx: number) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentSlide(idx)}
                            className={`h-1.5 rounded transition-all duration-300 ${idx === currentSlide ? 'w-8 bg-primary' : 'w-2 bg-white/40'}`}
                        />
                    ))}
                </div>
            </div>

            {/* Booking Search Widget Overlay */}
            <div className="max-w-6xl mx-auto px-4 -mt-8 sm:-mt-16 relative z-30">
                <form onSubmit={handleSearchSubmit} className="glass-card p-4 sm:p-8 rounded-lg grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 items-end shadow-xl">
                    <div className="space-y-2">
                        <label className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                            <Calendar className="h-4 w-4 text-primary" />
                            <span>Check-In</span>
                        </label>
                        <input
                            type="date"
                            required
                            min={new Date().toISOString().split('T')[0]}
                            value={checkIn}
                            onChange={(e) => setCheckIn(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-charcoal border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white rounded focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none text-sm"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                            <Calendar className="h-4 w-4 text-primary" />
                            <span>Check-Out</span>
                        </label>
                        <input
                            type="date"
                            required
                            min={checkIn || new Date().toISOString().split('T')[0]}
                            value={checkOut}
                            onChange={(e) => setCheckOut(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-charcoal border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white rounded focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none text-sm"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                            <Users className="h-4 w-4 text-primary" />
                            <span>Guests</span>
                        </label>
                        <select
                            value={guests}
                            onChange={(e) => setGuests(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-charcoal border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white rounded focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none text-sm"
                        >
                            <option value="1">1 Guest</option>
                            <option value="2">2 Guests</option>
                            <option value="3">3 Guests</option>
                            <option value="4">4 Guests</option>
                        </select>
                    </div>
                    <button type="submit" className="w-full sm:col-span-2 lg:col-span-1 bg-primary hover:bg-primary-dark text-charcoal font-bold uppercase text-xs tracking-widest py-4 rounded transition-all shadow-md shadow-primary/20">
                        Check Availability
                    </button>
                </form>
            </div>

            {/* About Section */}
            <section id="about" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <span className="text-primary font-bold text-xs uppercase tracking-[0.2em]">{homepageContent?.heritage_subtitle || "Our Heritage"}</span>
                        <h2 className="font-playfair text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white">{homepageContent?.heritage_title || "A Sanctuary of Soul and Elegance"}</h2>
                        <p className="text-gray-600 dark:text-gray-300 font-light leading-relaxed">
                            {homepageContent?.heritage_paragraph_1 || "Regal Rivulet Retreat brings together refined hospitality, modern comfort, and calm design. Set in Singapore, the hotel offers elegant spaces, thoughtful service, and world-class guest care."}
                        </p>
                        <p className="text-gray-600 dark:text-gray-300 font-light leading-relaxed">
                            {homepageContent?.heritage_paragraph_2 || "Every single booking is manually verified by our reservation administrators to guarantee absolute safety and double-booking avoidance. Relax at our premium spa or experience curated local ingredients at our restaurant."}
                        </p>
                        <div className="flex pt-4 space-x-8">
                            <div>
                                <span className="font-playfair text-3xl font-bold text-primary block">{homepageContent?.stat_1_number || "30+"}</span>
                                <span className="text-xs text-gray-500 uppercase tracking-widest">{homepageContent?.stat_1_label || "Luxury Rooms"}</span>
                            </div>
                            <div>
                                <span className="font-playfair text-3xl font-bold text-primary block">{homepageContent?.stat_2_number || "100%"}</span>
                                <span className="text-xs text-gray-500 uppercase tracking-widest">{homepageContent?.stat_2_label || "Manual Safety"}</span>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 hidden sm:grid">
                        <img src={homepageContent?.image_1 || "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=600"} alt="About 1" className="rounded-lg shadow-md w-full h-64 object-cover" />
                        <img src={homepageContent?.image_2 || "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=600"} alt="About 2" className="rounded-lg shadow-md w-full h-64 object-cover mt-8" />
                    </div>
                </div>
            </section>

            {/* Featured Rooms */}
            <section className="py-20 bg-gray-50 dark:bg-charcoal border-t border-b border-gray-200/50 dark:border-charcoal-light/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <span className="text-primary font-bold text-xs uppercase tracking-[0.2em]">Bespoke Lodging</span>
                        <h2 className="font-playfair text-4xl font-bold mt-2 text-gray-900 dark:text-white">Featured Rooms & Suites</h2>
                        <div className="h-0.5 w-16 bg-primary mx-auto mt-4"></div>
                    </div>

                    {featuredRooms.length === 0 ? (
                        /* Skeleton loaders */
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[1, 2, 3].map((n) => (
                                <div key={n} className="bg-white dark:bg-charcoal-light rounded-lg overflow-hidden shadow-lg border border-gray-100 dark:border-gray-800 animate-pulse">
                                    <div className="h-64 bg-gray-200 dark:bg-gray-800"></div>
                                    <div className="p-6 space-y-4">
                                        <div className="h-6 bg-gray-200 dark:bg-gray-800 w-2/3"></div>
                                        <div className="h-4 bg-gray-200 dark:bg-gray-800 w-full"></div>
                                        <div className="h-10 bg-gray-200 dark:bg-gray-800 w-full"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {featuredRooms.map((room: any) => (
                                <div key={room.id} className="bg-white dark:bg-charcoal-light rounded-lg overflow-hidden shadow-lg border border-gray-100 dark:border-gray-800 group hover:-translate-y-1 transition-all">
                                    <div className="h-64 overflow-hidden relative">
                                        {room.cover_image ? (
                                            <img src={room.cover_image} alt={room.room_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        ) : (
                                            <div className="w-full h-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-gray-400">Luxury Room Cover</div>
                                        )}
                                        <div className="absolute top-4 right-4 bg-charcoal/85 backdrop-blur-md border border-primary/20 text-primary px-3 py-1 text-xs font-semibold rounded">
                                            ${room.price_per_night} / Night
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <h3 className="font-playfair text-xl font-bold text-gray-900 dark:text-white mb-2">{room.room_name}</h3>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm font-light line-clamp-2 mb-4">{room.description}</p>
                                        <div className="flex justify-between items-center text-xs text-gray-400 mb-6">
                                            <span>Max Capacity: {room.capacity} Guests</span>
                                            <span>Units: {room.total_units} available</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <Link to={`/rooms/${room.id}`} className="border border-charcoal dark:border-primary text-center py-2.5 rounded font-bold uppercase text-[10px] tracking-wider text-charcoal dark:text-primary hover:bg-primary hover:text-charcoal dark:hover:text-charcoal transition-all">
                                                View Details
                                            </Link>
                                            <Link to={`/rooms/${room.id}`} className="bg-primary hover:bg-primary-dark text-charcoal text-center py-2.5 rounded font-bold uppercase text-[10px] tracking-wider transition-all">
                                                Book Now
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Amenities Section */}
            <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <span className="text-primary font-bold text-xs uppercase tracking-[0.2em]">Exclusive Services</span>
                    <h2 className="font-playfair text-4xl font-bold mt-2 text-gray-900 dark:text-white">Hotel Amenities</h2>
                    <div className="h-0.5 w-16 bg-primary mx-auto mt-4"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {activeAmenities.map((amenity: any, idx: number) => (
                        <div key={idx} className="flex space-x-4 p-6 bg-gray-50 dark:bg-charcoal rounded-lg border border-gray-200/50 dark:border-gray-800/30">
                            <div className="p-3 bg-primary/10 rounded-lg text-primary h-fit">
                                {renderIcon(amenity.icon_name || 'Compass')}
                            </div>
                            <div>
                                <h3 className="font-playfair text-lg font-bold text-gray-900 dark:text-white mb-1">{amenity.name}</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm font-light leading-relaxed">{amenity.description || amenity.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-20 bg-charcoal text-white border-t border-b border-primary/20">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <span className="text-primary font-bold text-xs uppercase tracking-[0.2em] mb-3 block">Guest Experiences</span>
                    <h2 className="font-playfair text-4xl font-bold mb-12">What Our Guests Say</h2>
                    
                    <div className="space-y-6">
                        <p className="font-playfair text-xl sm:text-2xl font-light italic leading-relaxed text-gray-200">
                            "{activeTestimonials[0].review}"
                        </p>
                        <div>
                            <span className="font-bold text-primary tracking-wider uppercase block text-sm">{activeTestimonials[0].customer_name}</span>
                            <div className="flex justify-center space-x-1 mt-2">
                                {[...Array(activeTestimonials[0].rating)].map((_, i) => (
                                    <Sparkles key={i} className="h-4 w-4 text-primary fill-primary" />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Section Preview */}
            <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    <div className="space-y-3 p-8 bg-gray-50 dark:bg-charcoal rounded-lg border border-gray-100 dark:border-gray-800">
                        <div className="p-3 bg-primary/10 rounded-full text-primary w-fit mx-auto">
                            <MapPin className="h-6 w-6" />
                        </div>
                        <h3 className="font-playfair text-lg font-bold">Address</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-light">{contactInfo?.address || "Singapore"}</p>
                    </div>
                    <div className="space-y-3 p-8 bg-gray-50 dark:bg-charcoal rounded-lg border border-gray-100 dark:border-gray-800">
                        <div className="p-3 bg-primary/10 rounded-full text-primary w-fit mx-auto">
                            <Phone className="h-6 w-6" />
                        </div>
                        <h3 className="font-playfair text-lg font-bold">Reservations</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-light">{contactInfo?.phone || "+447441392410"}</p>
                    </div>
                    <div className="space-y-3 p-8 bg-gray-50 dark:bg-charcoal rounded-lg border border-gray-100 dark:border-gray-800">
                        <div className="p-3 bg-primary/10 rounded-full text-primary w-fit mx-auto">
                            <Mail className="h-6 w-6" />
                        </div>
                        <h3 className="font-playfair text-lg font-bold">Email Support</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-light">{contactInfo?.email || "info@regalrivulet.com"}</p>
                    </div>
                </div>
            </section>

            {showPopup && createPortal(
                <div className="fixed inset-0 z-[9999] bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-[fadeIn_0.3s_ease-out]">
                    <div
                        className="w-full max-w-4xl bg-white dark:bg-charcoal rounded-lg overflow-hidden shadow-2xl border border-primary/30 flex flex-col animate-[slideDown_0.3s_ease-out]"
                        style={{ maxHeight: '92vh' }}
                    >
                        <div className="bg-charcoal flex items-center justify-between gap-4 px-4 sm:px-6 py-4 border-b border-primary/20">
                            <h3 className="text-white font-playfair text-lg sm:text-2xl font-bold truncate pr-2">
                                {activeAnnouncement.title}
                            </h3>
                            <button
                                onClick={() => {
                                    sessionStorage.setItem(`dismissed_popup_${activeAnnouncement.id}`, 'true');
                                    setPopupClosed(true);
                                }}
                                className="bg-primary hover:bg-primary-dark text-charcoal font-bold text-xs uppercase tracking-wider px-5 py-2 rounded shadow transition-all shrink-0"
                            >
                                Skip
                            </button>
                        </div>

                        <div className="bg-gray-100 dark:bg-charcoal-dark overflow-y-auto flex-1 p-4 sm:p-8">
                            {activeAnnouncement.attachment ? (
                                <img
                                    src={activeAnnouncement.attachment}
                                    alt="Official Announcement Notice"
                                    className="w-full h-auto max-h-[72vh] object-contain block rounded border border-gray-200 dark:border-gray-800 bg-white"
                                />
                            ) : (
                                <div className="bg-white mx-auto max-w-3xl border border-gray-200 shadow-xl p-6 sm:p-10 text-gray-900 text-left rounded-sm">
                                    <div className="text-center pb-6 mb-7 border-b border-primary/40">
                                        <span className="inline-block text-[10px] sm:text-xs font-bold tracking-[0.26em] uppercase text-primary mb-3">
                                            Regal Rivulet Retreat Hotel
                                        </span>
                                        <h2 className="font-playfair text-2xl sm:text-4xl font-bold tracking-tight text-charcoal leading-tight">
                                            Official Vacancy Announcement
                                        </h2>
                                        <p className="text-xs text-gray-500 mt-3">
                                            Published {new Date(activeAnnouncement.created_at).toLocaleDateString()}
                                        </p>
                                    </div>

                                    <div className="text-center mb-8">
                                        <h3 className="font-playfair text-2xl sm:text-3xl font-bold text-charcoal capitalize">
                                            {activeAnnouncement.job_title}
                                        </h3>
                                        <div className="h-0.5 w-16 bg-primary mx-auto mt-3"></div>
                                    </div>

                                    <p className="text-sm sm:text-base mb-6 font-medium text-gray-700 leading-relaxed text-center whitespace-pre-wrap">
                                        {activeAnnouncement.message}
                                    </p>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-8">
                                        <div className="rounded border border-gray-200 bg-gray-50 p-4 text-center">
                                            <span className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Position</span>
                                            <span className="font-bold text-charcoal capitalize">{activeAnnouncement.job_title}</span>
                                        </div>
                                        <div className="rounded border border-primary/30 bg-primary/10 p-4 text-center">
                                            <span className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Application Deadline</span>
                                            <span className="font-bold text-red-600">{activeAnnouncement.deadline}</span>
                                        </div>
                                    </div>

                                    <div className="text-center pt-3">
                                        <Link
                                            to="/vacancies"
                                            onClick={() => {
                                                sessionStorage.setItem(`dismissed_popup_${activeAnnouncement.id}`, 'true');
                                                setPopupClosed(true);
                                            }}
                                            className="inline-flex items-center justify-center bg-primary hover:bg-primary-dark text-charcoal font-bold uppercase text-xs tracking-widest px-7 py-3 rounded transition-all shadow"
                                        >
                                            View Vacancy Details
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default Home;
