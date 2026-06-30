import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Shield, Sparkles, Star, Award, Compass, Heart } from 'lucide-react';

import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

const FALLBACK_TEAM = [
  { name: "Marcus Tan", role: "Owner", image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=300", bio: "Over 15 years in luxury boutique hotel administration." },
  { name: "Alicia Lim", role: "Head of Guest Relations", image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=300", bio: "Ensuring an exceptional, tailored stay for every guest." },
  { name: "Chef Daniel Koh", role: "Executive Chef", image: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?q=80&w=300", bio: "Curator of refined local recipes and fusion banquets." }
];

const FALLBACK_FACILITIES = [
  { name: "Ananda Spa & Wellness", description: "Traditional Ayurvedic and modern hot stone massage therapies.", icon_name: "Compass" },
  { name: "Lumbini Pool Hall", description: "Heated infinity pool overlooking historical valleys and landscapes.", icon_name: "Sparkles" },
  { name: "The Mandala Fine Dining", description: "An organic restaurant featuring fresh ingredients from regional farms.", icon_name: "Award" },
  { name: "Elite Business Lounge", description: "Sophisticated corporate settings equipped with global conference tools.", icon_name: "Shield" }
];

const asList = (data: any) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    return [];
};

const About = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 fade-in text-gray-800 dark:text-gray-200">
      <Helmet>
        <title>About Us | Regal Rivulet Retreat Hotel</title>
        <meta name="description" content="Discover the history, vision, executive team, and luxury spa/dining facilities of the Regal Rivulet Retreat Hotel in Singapore." />
      </Helmet>

      {/* Queries */}
      {(() => {
        const { data: aboutContentList } = useQuery({ queryKey: ['about-content'], queryFn: async () => (await api.get('/cms/about-content/')).data });
        const { data: teamData } = useQuery({ queryKey: ['about-team'], queryFn: async () => (await api.get('/cms/team/')).data });
        const { data: facilitiesData } = useQuery({ queryKey: ['about-facilities'], queryFn: async () => (await api.get('/cms/facilities/')).data });

        const aboutContents = asList(aboutContentList);
        const teamList = asList(teamData);
        const facilitiesList = asList(facilitiesData);

        const aboutContent = aboutContents.length > 0 ? aboutContents[0] : null;
        const activeTeam = teamList.length > 0 ? teamList : FALLBACK_TEAM;
        const activeFacilities = facilitiesList.length > 0 ? facilitiesList : FALLBACK_FACILITIES;

        const renderIcon = (iconName: string) => {
            const icons: { [key: string]: any } = { Shield, Sparkles, Star, Award, Compass, Heart };
            const IconComponent = icons[iconName] || Compass;
            return <IconComponent className="h-5 w-5" />;
        };

        const renderIconLarge = (iconName: string) => {
            const icons: { [key: string]: any } = { Shield, Sparkles, Star, Award, Compass, Heart };
            const IconComponent = icons[iconName] || Compass;
            return <IconComponent className="h-6 w-6" />;
        };

        return (
          <>
            {/* Hero Header */}
      <div className="text-center mb-16">
        <span className="text-primary font-bold text-xs uppercase tracking-[0.2em]">Our Heritage</span>
        <h1 className="font-playfair text-4xl sm:text-5xl font-bold mt-2 text-gray-900 dark:text-white">{aboutContent?.story_title || "The Story of Regal Rivulet"}</h1>
        <div className="h-0.5 w-16 bg-primary mx-auto mt-4"></div>
      </div>

      {/* Story Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
        <div className="space-y-6">
          <h2 className="font-playfair text-3xl font-bold text-gray-900 dark:text-white">{aboutContent?.story_title || "Echoes of Ancient Traditions"}</h2>
          <p className="text-gray-600 dark:text-gray-300 font-light leading-relaxed">
            {aboutContent?.story_paragraph_1 || "Established in 2026, Regal Rivulet Retreat was envisioned as a tranquil sanctuary where guests can experience the authentic heritage of Singapore combined with the highest standards of international luxury. Our architecture is inspired by modern aesthetics, utilizing beautiful frameworks and layouts."}
          </p>
          <p className="text-gray-600 dark:text-gray-300 font-light leading-relaxed">
            {aboutContent?.story_paragraph_2 || "We operate on a strict manual reservation verification system. A booking is never automatically confirmed. Our dedicated managers review every transaction proof to guarantee that each guest receives personalized attention and absolute security."}
          </p>
        </div>
        <div>
          <img 
            src={aboutContent?.story_image || "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=800"} 
            alt="Boutique Hotel Courtyard" 
            className="rounded-lg shadow-xl w-full h-[350px] object-cover border border-gray-100 dark:border-gray-800" 
          />
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
        <div className="p-8 bg-white dark:bg-charcoal rounded-lg shadow-md border border-gray-100 dark:border-gray-800">
          <div className="p-3 bg-primary/10 rounded-full text-primary w-fit mb-4">
            <Shield className="h-6 w-6" />
          </div>
          <h3 className="font-playfair text-xl font-bold text-gray-900 dark:text-white mb-2">Our Mission</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-light leading-relaxed">
            {aboutContent?.mission_text || "To provide a bespoke, highly secure hospitality experience that honors traditional artistry while providing unparalleled luxury, rest, and comfort for discerning travelers."}
          </p>
        </div>
        <div className="p-8 bg-white dark:bg-charcoal rounded-lg shadow-md border border-gray-100 dark:border-gray-800">
          <div className="p-3 bg-primary/10 rounded-full text-primary w-fit mb-4">
            <Heart className="h-6 w-6" />
          </div>
          <h3 className="font-playfair text-xl font-bold text-gray-900 dark:text-white mb-2">Our Vision</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-light leading-relaxed">
            {aboutContent?.vision_text || "To become a globally recognized landmark of sustainable boutique hospitality in South Asia, admired for preserving heritage and providing premium guest satisfaction."}
          </p>
        </div>
      </div>

      {/* Facilities Showcase */}
      <div className="mb-20">
        <h2 className="font-playfair text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">Exceptional Facilities</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {activeFacilities.map((fac: any, idx: number) => (
            <div key={idx} className="flex space-x-4 p-6 bg-gray-50 dark:bg-charcoal rounded border border-gray-100 dark:border-gray-800">
              <div className="p-3 bg-primary/10 rounded-lg text-primary h-fit">
                {renderIcon(fac.icon_name || 'Compass')}
              </div>
              <div>
                <h4 className="font-playfair text-lg font-bold text-gray-900 dark:text-white mb-1">{fac.name}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-light leading-relaxed">{fac.description || fac.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Team */}
      <div>
        <h2 className="font-playfair text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">Executive Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {activeTeam.map((member: any, idx: number) => (
            <div key={idx} className="bg-white dark:bg-charcoal rounded-lg overflow-hidden border border-gray-100 dark:border-gray-800 text-center shadow-lg group">
              <div className="h-64 overflow-hidden relative">
                <img src={member.image} alt={member.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-6">
                <h4 className="font-playfair text-lg font-bold text-gray-900 dark:text-white">{member.name}</h4>
                <span className="text-xs text-primary font-bold tracking-widest block uppercase mb-3 mt-1">{member.role}</span>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-light leading-relaxed">{member.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
          </>
        );
      })()}
    </div>
  );
};

export default About;
