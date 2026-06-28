import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import api from '../services/api';
import { X, ZoomIn } from 'lucide-react';

const FALLBACK_GALLERY: any[] = [];

const Gallery = () => {
    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const [activeImage, setActiveImage] = useState<string | null>(null);

    // Query gallery images from API
    const { data: galleryItems, isLoading } = useQuery({
        queryKey: ['gallery', selectedCategory],
        queryFn: async () => {
            const params = selectedCategory !== 'ALL' ? { category: selectedCategory } : {};
            const { data } = await api.get('/cms/gallery/', { params });
            return data;
        },
        retry: false
    });

    const { data: categoriesData } = useQuery({
        queryKey: ['gallery-categories'],
        queryFn: async () => {
            const { data } = await api.get('/cms/gallery-categories/');
            return data;
        },
        retry: false
    });

    const activeItems = galleryItems && galleryItems.length > 0 ? galleryItems : FALLBACK_GALLERY.filter(item => {
        if (selectedCategory === 'ALL') return true;
        return item.category_name === selectedCategory;
    });

    const dynamicCategories = ['ALL', ...(categoriesData?.map((c: any) => c.name) || [])];

    return (
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 fade-in text-gray-800 dark:text-gray-200">
            <Helmet>
                <title>Photo Gallery | Regal Rivulet Retreat Hotel</title>
                <meta name="description" content="Explore photos of our rooms, fine dining, relaxing spa treatments, and events at the Regal Rivulet Retreat Hotel." />
            </Helmet>

            <div className="text-center mb-12">
                <span className="text-primary font-bold text-xs uppercase tracking-[0.2em]">Visual Journey</span>
                <h1 className="font-playfair text-4xl sm:text-5xl font-bold mt-2 text-gray-900 dark:text-white">Our Gallery</h1>
                <div className="h-0.5 w-16 bg-primary mx-auto mt-4"></div>
            </div>

            {/* Category tabs */}
            <div className="flex flex-wrap justify-center gap-2 mb-12">
                {dynamicCategories.map((cat: string) => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-5 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all ${
                            cat === selectedCategory 
                            ? 'bg-primary text-charcoal shadow-md shadow-primary/20' 
                            : 'border border-gray-200 dark:border-gray-800 hover:border-primary text-gray-600 dark:text-gray-300'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Masonry-Style Grid */}
            {isLoading ? (
                <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                    {[1, 2, 3, 4, 5, 6].map(n => (
                        <div key={n} className="bg-gray-200 dark:bg-gray-800 rounded-lg h-64 animate-pulse"></div>
                    ))}
                </div>
            ) : (
                <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                    {activeItems.map((item: any) => (
                        <div 
                            key={item.id} 
                            onClick={() => setActiveImage(item.image)}
                            className="break-inside-avoid bg-white dark:bg-charcoal p-1.5 rounded-lg border border-gray-100 dark:border-gray-800 shadow-md group relative overflow-hidden cursor-zoom-in"
                        >
                            <img 
                                src={item.image} 
                                alt={item.title} 
                                className="w-full rounded object-cover group-hover:scale-[1.02] transition-transform duration-300" 
                            />
                            
                            {/* Hover info overlay */}
                            <div className="absolute inset-0 bg-charcoal/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4 text-white">
                                <span className="text-[10px] text-primary uppercase font-bold tracking-widest">{item.category_name}</span>
                                <h3 className="font-playfair text-sm font-bold mt-0.5">{item.title}</h3>
                                <ZoomIn className="h-5 w-5 text-gray-300 absolute top-4 right-4" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Lightbox Zoom Modal */}
            {activeImage && (
                <div 
                    onClick={() => setActiveImage(null)}
                    className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm transition-all"
                >
                    <button 
                        onClick={() => setActiveImage(null)} 
                        className="absolute top-6 right-6 p-2 bg-charcoal-light rounded-full text-white border border-primary/20 hover:text-primary"
                    >
                        <X className="h-6 w-6" />
                    </button>
                    <img 
                        src={activeImage} 
                        alt="Gallery preview zoomed" 
                        className="max-w-full max-h-[90vh] rounded shadow-2xl object-contain" 
                        onClick={(e) => e.stopPropagation()} 
                    />
                </div>
            )}
        </div>
    );
};

export default Gallery;
