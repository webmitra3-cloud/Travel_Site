import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../services/api';
import { Search, MapPin, Briefcase, Calendar, DollarSign, X, FileText, ChevronLeft, ChevronRight, Award } from 'lucide-react';

const Vacancies = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    // Query params / local filters
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [department, setDepartment] = useState(searchParams.get('department') || '');
    const [location, setLocation] = useState(searchParams.get('location') || '');
    const [employmentType, setEmploymentType] = useState(searchParams.get('employment_type') || '');
    const [ordering, setOrdering] = useState(searchParams.get('ordering') || 'latest');
    const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));

    // Selected vacancy for detail modal
    const [selectedVacancy, setSelectedVacancy] = useState<any | null>(null);
    const [showApplyModal, setShowApplyModal] = useState(false);

    // Apply filters to URL
    const applyFilters = () => {
        const params: any = {};
        if (search) params.search = search;
        if (department) params.department = department;
        if (location) params.location = location;
        if (employmentType) params.employment_type = employmentType;
        if (ordering) params.ordering = ordering;
        params.page = String(page);
        setSearchParams(params);
    };

    const resetFilters = () => {
        setSearch('');
        setDepartment('');
        setLocation('');
        setEmploymentType('');
        setOrdering('latest');
        setPage(1);
        setSearchParams({});
    };

    // Query vacancies from API
    const { data, isLoading, error } = useQuery({
        queryKey: ['public-vacancies', searchParams.toString()],
        queryFn: async () => {
            const { data } = await api.get('/vacancies/', {
                params: {
                    search: searchParams.get('search') || '',
                    department: searchParams.get('department') || '',
                    location: searchParams.get('location') || '',
                    employment_type: searchParams.get('employment_type') || '',
                    ordering: searchParams.get('ordering') || 'latest',
                }
            });
            return data; // Simple array returned by public read-only list view
        }
    });

    // Client-side pagination helper (since public view returns array)
    const ITEMS_PER_PAGE = 6;
    const vacancies = data || [];
    const totalPages = Math.ceil(vacancies.length / ITEMS_PER_PAGE);
    const paginatedVacancies = vacancies.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    const getEmploymentTypeLabel = (type: string) => {
        const mapping: { [key: string]: string } = {
            'FULL_TIME': 'Full Time',
            'PART_TIME': 'Part Time',
            'CONTRACT': 'Contract',
            'INTERN': 'Intern',
            'REMOTE': 'Remote'
        };
        return mapping[type] || type;
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 text-gray-800 dark:text-gray-200 fade-in">
            <Helmet>
                <title>Careers & Vacancies | Regal Rivulet Retreat Hotel</title>
                <meta name="description" content="Join our luxury boutique team. Explore active vacancy listings, job requirements, and submit applications." />
            </Helmet>

            <div className="text-center mb-12">
                <span className="text-primary font-bold text-xs uppercase tracking-[0.2em]">Join Our Elite Team</span>
                <h1 className="font-playfair text-4xl sm:text-5xl font-bold mt-2 text-gray-900 dark:text-white">Active Vacancies</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-light max-w-xl mx-auto mt-2">
                    Build a luxurious career in hospitality. Explore our current opportunities at Regal Rivulet Retreat Hotel.
                </p>
                <div className="h-0.5 w-16 bg-primary mx-auto mt-4"></div>
            </div>

            {/* Filter Section */}
            <div className="bg-white dark:bg-charcoal p-6 rounded-lg shadow-md border border-gray-100 dark:border-gray-800 mb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end">
                    
                    {/* Search Input */}
                    <div className="space-y-1 sm:col-span-2">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Search Keywords</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Job title, department, skills..."
                                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-charcoal-light border border-gray-200 dark:border-gray-800 text-sm text-gray-900 dark:text-white rounded focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                            />
                            <Search className="h-4 w-4 text-gray-400 absolute left-3 top-3.5" />
                        </div>
                    </div>

                    {/* Department Filter */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Department</label>
                        <input
                            type="text"
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            placeholder="e.g. Front Office"
                            className="w-full px-3 py-2.5 bg-gray-50 dark:bg-charcoal-light border border-gray-200 dark:border-gray-800 text-sm text-gray-900 dark:text-white rounded focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                        />
                    </div>

                    {/* Location Filter */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Location</label>
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="e.g. Singapore"
                            className="w-full px-3 py-2.5 bg-gray-50 dark:bg-charcoal-light border border-gray-200 dark:border-gray-800 text-sm text-gray-900 dark:text-white rounded focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                        />
                    </div>

                    {/* Employment Type */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Type</label>
                        <select
                            value={employmentType}
                            onChange={(e) => setEmploymentType(e.target.value)}
                            className="w-full px-3 py-2.5 bg-gray-50 dark:bg-charcoal-light border border-gray-200 dark:border-gray-800 text-sm text-gray-900 dark:text-white rounded focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                        >
                            <option value="">All Types</option>
                            <option value="FULL_TIME">Full Time</option>
                            <option value="PART_TIME">Part Time</option>
                            <option value="CONTRACT">Contract</option>
                            <option value="INTERN">Intern</option>
                            <option value="REMOTE">Remote</option>
                        </select>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                        <button
                            onClick={() => { setPage(1); applyFilters(); }}
                            className="flex-grow bg-primary hover:bg-primary-dark text-charcoal font-bold text-xs uppercase tracking-wider py-3 rounded shadow transition-all"
                        >
                            Search
                        </button>
                        <button
                            onClick={resetFilters}
                            className="px-3 border border-gray-200 dark:border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors text-xs"
                            title="Reset Filters"
                        >
                            Reset
                        </button>
                    </div>
                </div>
            </div>

            {/* Content States */}
            {isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map((n) => (
                        <div key={n} className="bg-white dark:bg-charcoal p-6 rounded-lg border border-gray-100 dark:border-gray-800 shadow animate-pulse space-y-4">
                            <div className="h-6 bg-gray-200 dark:bg-gray-800 w-2/3 rounded"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-800 w-1/3 rounded"></div>
                            <div className="h-16 bg-gray-200 dark:bg-gray-800 w-full rounded"></div>
                        </div>
                    ))}
                </div>
            )}

            {error && (
                <div className="text-center py-20 text-red-500">
                    Failed to fetch vacancies. Please check your network connection and try again.
                </div>
            )}

            {!isLoading && !error && vacancies.length === 0 && (
                <div className="text-center py-20 bg-white dark:bg-charcoal rounded-lg border border-gray-100 dark:border-gray-800 shadow">
                    <p className="text-gray-400 font-light italic">No vacancy openings match your filters at this time.</p>
                </div>
            )}

            {!isLoading && !error && vacancies.length > 0 && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {paginatedVacancies.map((job: any) => (
                            <div
                                key={job.id}
                                className="bg-white dark:bg-charcoal border border-gray-100 dark:border-gray-800 rounded-lg p-6 flex flex-col justify-between shadow hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                            >
                                <div>
                                    {/* Header Row */}
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="font-playfair text-xl font-bold text-gray-900 dark:text-white leading-tight">{job.job_title}</h3>
                                            <span className="text-xs text-primary font-semibold uppercase tracking-wider block mt-1">{job.department}</span>
                                        </div>
                                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider ${job.status === 'OPEN' ? 'bg-green-100 dark:bg-green-950/30 text-green-800 dark:text-green-400' : 'bg-red-100 dark:bg-red-950/30 text-red-800 dark:text-red-400'}`}>
                                            {job.status}
                                        </span>
                                    </div>

                                    {/* Badges details */}
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4 text-xs font-light text-gray-500 dark:text-gray-400 border-t border-b border-gray-100 dark:border-gray-800 py-3">
                                        <p className="flex items-center space-x-1.5"><MapPin className="h-3.5 w-3.5 text-primary" /> <span>{job.location}</span></p>
                                        <p className="flex items-center space-x-1.5"><Briefcase className="h-3.5 w-3.5 text-primary" /> <span>{getEmploymentTypeLabel(job.employment_type)}</span></p>
                                        <p className="flex items-center space-x-1.5"><Calendar className="h-3.5 w-3.5 text-primary" /> <span>Deadline: {job.deadline}</span></p>
                                        {job.salary && (
                                            <p className="flex items-center space-x-1.5"><DollarSign className="h-3.5 w-3.5 text-primary" /> <span>{job.salary}</span></p>
                                        )}
                                        <p className="col-span-2 text-[10px] mt-1 text-gray-450 dark:text-gray-500">
                                            Posted: {new Date(job.created_at).toLocaleDateString()} · Count: {job.vacancies_count} vacancy{job.vacancies_count > 1 ? 'ies' : ''}
                                        </p>
                                    </div>

                                    {/* Short description preview */}
                                    <p className="text-xs text-gray-600 dark:text-gray-300 font-light line-clamp-3 leading-relaxed mb-6">
                                        {job.description}
                                    </p>
                                </div>

                                <div className="flex space-x-3 pt-4 border-t border-gray-100 dark:border-gray-800/80">
                                    <button
                                        onClick={() => setSelectedVacancy(job)}
                                        className="flex-grow border border-gray-300 dark:border-gray-700 text-center py-2.5 rounded font-bold uppercase text-[10px] tracking-wider text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                                    >
                                        View Details
                                    </button>
                                    <button
                                        onClick={() => { setSelectedVacancy(job); setShowApplyModal(true); }}
                                        className="flex-grow bg-primary hover:bg-primary-dark text-charcoal text-center py-2.5 rounded font-bold uppercase text-[10px] tracking-wider transition-all"
                                    >
                                        Apply Now
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center space-x-4 mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
                            <button
                                onClick={() => { setPage(prev => Math.max(1, prev - 1)); applyFilters(); }}
                                disabled={page === 1}
                                className="p-2 border border-gray-200 dark:border-gray-800 rounded hover:bg-primary hover:text-charcoal transition-colors disabled:opacity-40"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <span className="text-xs font-light">Page <b>{page}</b> of <b>{totalPages}</b></span>
                            <button
                                onClick={() => { setPage(prev => Math.min(totalPages, prev + 1)); applyFilters(); }}
                                disabled={page === totalPages}
                                className="p-2 border border-gray-200 dark:border-gray-800 rounded hover:bg-primary hover:text-charcoal transition-colors disabled:opacity-40"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Vacancy Details Modal */}
            {selectedVacancy && !showApplyModal && (
                <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-charcoal p-8 rounded-lg max-w-2xl w-full border border-gray-200 dark:border-gray-800 space-y-6 max-h-[85vh] overflow-y-auto shadow-2xl">
                        <div className="flex justify-between items-start pb-4 border-b border-gray-100 dark:border-gray-800">
                            <div>
                                <span className="text-[10px] text-primary font-bold uppercase tracking-wider">{selectedVacancy.department}</span>
                                <h3 className="font-playfair text-2xl sm:text-3xl font-bold mt-1 text-gray-900 dark:text-white">{selectedVacancy.job_title}</h3>
                            </div>
                            <button onClick={() => setSelectedVacancy(null)}><X className="h-6 w-6 text-gray-400 hover:text-white" /></button>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-gray-50 dark:bg-charcoal-light p-4 rounded border border-gray-100 dark:border-gray-850 text-xs font-light">
                            <div>
                                <span className="text-gray-400 block font-semibold uppercase text-[9px] tracking-wider mb-0.5">Location</span>
                                <span className="font-bold text-gray-950 dark:text-white">{selectedVacancy.location}</span>
                            </div>
                            <div>
                                <span className="text-gray-400 block font-semibold uppercase text-[9px] tracking-wider mb-0.5">Type</span>
                                <span className="font-bold text-gray-950 dark:text-white">{getEmploymentTypeLabel(selectedVacancy.employment_type)}</span>
                            </div>
                            <div>
                                <span className="text-gray-400 block font-semibold uppercase text-[9px] tracking-wider mb-0.5">Deadline</span>
                                <span className="font-bold text-red-500">{selectedVacancy.deadline}</span>
                            </div>
                            <div>
                                <span className="text-gray-400 block font-semibold uppercase text-[9px] tracking-wider mb-0.5">Salary</span>
                                <span className="font-bold text-primary">{selectedVacancy.salary || 'Negotiable'}</span>
                            </div>
                        </div>

                        <div className="space-y-4 text-xs font-light leading-relaxed">
                            <div className="space-y-1.5">
                                <span className="text-[10px] text-gray-400 uppercase font-semibold">Job Description</span>
                                <p className="text-gray-700 dark:text-gray-300 bg-gray-50/50 dark:bg-charcoal-light/30 p-4 rounded border border-gray-100 dark:border-gray-850 whitespace-pre-wrap leading-relaxed">{selectedVacancy.description}</p>
                            </div>

                            <div className="space-y-1.5">
                                <span className="text-[10px] text-gray-400 uppercase font-semibold">Requirements</span>
                                <p className="text-gray-700 dark:text-gray-300 bg-gray-50/50 dark:bg-charcoal-light/30 p-4 rounded border border-gray-100 dark:border-gray-850 whitespace-pre-wrap leading-relaxed">{selectedVacancy.requirements}</p>
                            </div>

                            {selectedVacancy.benefits && (
                                <div className="space-y-1.5">
                                    <span className="text-[10px] text-gray-400 uppercase font-semibold">Benefits</span>
                                    <p className="text-gray-700 dark:text-gray-300 bg-gray-50/50 dark:bg-charcoal-light/30 p-4 rounded border border-gray-100 dark:border-gray-850 whitespace-pre-wrap leading-relaxed">{selectedVacancy.benefits}</p>
                                </div>
                            )}

                            {selectedVacancy.attachment && (
                                <div className="pt-2">
                                    <a
                                        href={selectedVacancy.attachment}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center space-x-2 text-primary hover:underline font-bold text-xs uppercase tracking-wider"
                                    >
                                        <FileText className="h-4 w-4" /> <span>Download Job Specification Attachment</span>
                                    </a>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                            <button
                                onClick={() => setSelectedVacancy(null)}
                                className="px-5 py-2.5 border border-gray-300 dark:border-gray-700 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white rounded"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => setShowApplyModal(true)}
                                className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-charcoal font-bold uppercase text-xs tracking-widest rounded shadow"
                            >
                                Apply Now
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Apply Application Modal */}
            {selectedVacancy && showApplyModal && (
                <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-charcoal p-8 rounded-lg max-w-md w-full border border-gray-200 dark:border-gray-800 space-y-6 shadow-2xl">
                        <div className="flex justify-between items-start pb-3 border-b border-gray-100 dark:border-gray-800">
                            <div>
                                <span className="text-[10px] text-primary font-bold uppercase tracking-wider">Application Instructions</span>
                                <h3 className="font-playfair text-xl font-bold mt-0.5 text-gray-900 dark:text-white">Apply for {selectedVacancy.job_title}</h3>
                            </div>
                            <button onClick={() => setShowApplyModal(false)}><X className="h-6 w-6 text-gray-400 hover:text-white" /></button>
                        </div>

                        <div className="space-y-4 text-xs font-light leading-relaxed">
                            <p className="text-gray-650 dark:text-gray-300">
                                Thank you for your interest in joining the **Regal Rivulet Retreat** team.
                            </p>
                            <div className="p-4 bg-gray-50 dark:bg-charcoal-light rounded border border-gray-100 dark:border-gray-850 space-y-2.5">
                                <p className="font-bold flex items-center space-x-1.5"><Award className="h-4 w-4 text-primary" /> <span>How to Apply:</span></p>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                    Please send your professional CV/Resume along with a Cover Letter to:
                                </p>
                                <p className="text-primary font-mono font-bold text-center text-sm bg-charcoal/10 dark:bg-charcoal-dark p-2 rounded border border-primary/20 select-all">
                                    careers@regalrivulet.com
                                </p>
                                <p className="text-[10px] text-gray-400 italic">
                                    * Please use subject line format: **Application - [Job Title] - [Your Name]**
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end pt-3 border-t border-gray-100 dark:border-gray-800">
                            <button
                                onClick={() => setShowApplyModal(false)}
                                className="bg-primary hover:bg-primary-dark text-charcoal font-bold uppercase text-xs tracking-wider px-5 py-2.5 rounded shadow"
                            >
                                Understood
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Vacancies;
