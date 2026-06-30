import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Helmet } from 'react-helmet-async';
import api from '../services/api';
import { 
    LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, 
    CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { 
    Calendar, CreditCard, ShieldCheck, Edit, Plus, Trash2, 
    List, User, ShieldAlert, Check, X, Shield, FileText, Image as ImageIcon,
    Layers, Wallet, MessageSquare, MonitorPlay
} from 'lucide-react';
import CMSPanel from '../components/CMSPanel';

const AdminDashboard = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [searchParams, setSearchParams] = useSearchParams();

    // Tabs: ANALYTICS, VERIFICATION, ROOMS, USERS, CMS, AUDIT_LOGS
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'ANALYTICS');

    const refreshPublicData = () => {
        queryClient.invalidateQueries();
    };

    // Selected user for booking history lookup
    const [selectedUser, setSelectedUser] = useState<any | null>(null);

    // Rejection modal states
    const [rejectProofId, setRejectProofId] = useState<string | null>(null);
    const [rejectionReason, setRejectionReason] = useState('Wrong Amount');

    // Room form modal states (for CRUD)
    const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
    const [editingRoom, setEditingRoom] = useState<any | null>(null);
    const [roomForm, setRoomForm] = useState({
        room_name: '',
        slug: '',
        room_type: 'Deluxe',
        description: '',
        price_per_night: '',
        capacity: '2',
        total_units: '5',
        availability_status: 'AVAILABLE'
    });
    const [roomCoverFile, setRoomCoverFile] = useState<File | null>(null);

    // Banners management states
    const [isSlideModalOpen, setIsSlideModalOpen] = useState(false);
    const [editingSlide, setEditingSlide] = useState<any | null>(null);
    const [slideForm, setSlideForm] = useState({
        title: '',
        subtitle: '',
        active: true
    });
    const [slideImageFile, setSlideImageFile] = useState<File | null>(null);

    // Gallery management states
    const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
    const [galleryForm, setGalleryForm] = useState({
        title: '',
        category: ''
    });
    const [galleryImageFile, setGalleryImageFile] = useState<File | null>(null);

    // Payment method states
    const [isPayMethodModalOpen, setIsPayMethodModalOpen] = useState(false);
    const [editingPayMethod, setEditingPayMethod] = useState<any | null>(null);
    const [payMethodForm, setPayMethodForm] = useState({
        method_name: '',
        account_name: '',
        account_number: '',
        instructions: '',
        is_active: true
    });
    const [payMethodQRFile, setPayMethodQRFile] = useState<File | null>(null);

    // Vacancy management states
    const [isVacancyModalOpen, setIsVacancyModalOpen] = useState(false);
    const [editingVacancy, setEditingVacancy] = useState<any | null>(null);
    const [vacancyForm, setVacancyForm] = useState({
        job_title: '',
        department: '',
        location: '',
        employment_type: 'FULL_TIME',
        vacancies_count: '1',
        salary: '',
        description: '',
        requirements: '',
        benefits: '',
        deadline: '',
        status: 'OPEN',
        published: false
    });
    const [vacancyAttachmentFile, setVacancyAttachmentFile] = useState<File | null>(null);

    // Selected Contact Message detail modal
    const [selectedMessage, setSelectedMessage] = useState<any | null>(null);

    // Query admin dashboard metrics & Recharts analytics
    const { data: dashboardData, isLoading: loadingAnalytics } = useQuery({
        queryKey: ['admin-analytics'],
        queryFn: async () => {
            const { data } = await api.get('/dashboard/admin/');
            return data;
        }
    });

    // Query payment proofs awaiting review
    const { data: proofs, isLoading: loadingProofs } = useQuery({
        queryKey: ['admin-proofs'],
        queryFn: async () => {
            const { data } = await api.get('/payments/proofs/');
            return data;
        }
    });

    // Query rooms list (include deleted to show CRUD controls)
    const { data: rooms, isLoading: loadingRooms } = useQuery({
        queryKey: ['admin-rooms'],
        queryFn: async () => {
            const { data } = await api.get('/rooms/', { params: { include_deleted: 'true' } });
            return data;
        }
    });

    // Query users list
    const { data: users, isLoading: loadingUsers } = useQuery({
        queryKey: ['admin-users'],
        queryFn: async () => {
            const { data } = await api.get('/users/'); // This hits the user list view
            return data;
        }
    });

    // Query audit logs
    const { data: auditLogs, isLoading: loadingAudits } = useQuery({
        queryKey: ['admin-audits'],
        queryFn: async () => {
            const { data } = await api.get('/users/audit-logs/');
            return data;
        }
    });

    // Query all bookings for history check
    const { data: bookings } = useQuery({
        queryKey: ['admin-bookings'],
        queryFn: async () => {
            const { data } = await api.get('/bookings/');
            return data;
        }
    });

    // Query banners / homepage slides
    const { data: slides, isLoading: loadingSlides } = useQuery({
        queryKey: ['admin-slides'],
        queryFn: async () => {
            const { data } = await api.get('/cms/slides/');
            return data;
        }
    });

    // Query gallery items
    const { data: galleryItems, isLoading: loadingGallery } = useQuery({
        queryKey: ['admin-gallery'],
        queryFn: async () => {
            const { data } = await api.get('/cms/gallery/');
            return data;
        }
    });

    // Query gallery categories
    const { data: galleryCategories } = useQuery({
        queryKey: ['admin-gallery-categories'],
        queryFn: async () => {
            const { data } = await api.get('/cms/gallery-categories/');
            return data;
        }
    });

    // Query payment methods
    const { data: paymentMethods, isLoading: loadingPaymentMethods } = useQuery({
        queryKey: ['admin-payment-methods'],
        queryFn: async () => {
            const { data } = await api.get('/payments/methods/', { params: { include_deleted: 'true' } });
            return data;
        }
    });

    // Query contact/support feedback messages
    const { data: contactMessages, isLoading: loadingMessages } = useQuery({
        queryKey: ['admin-messages'],
        queryFn: async () => {
            const { data } = await api.get('/cms/messages/');
            return data;
        }
    });

    // Query vacancies
    const { data: vacancies, isLoading: loadingVacancies } = useQuery({
        queryKey: ['admin-vacancies'],
        queryFn: async () => {
            const { data } = await api.get('/admin/vacancies/');
            return data;
        }
    });

    // Approve Payment proof mutation
    const approvePaymentMutation = useMutation({
        mutationFn: async (proofId: string) => {
            const { data } = await api.post(`/payments/proofs/${proofId}/approve/`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-proofs'] });
            queryClient.invalidateQueries({ queryKey: ['admin-analytics'] });
            queryClient.invalidateQueries({ queryKey: ['admin-audits'] });
            alert('Payment proof approved successfully! confirmation email dispatched.');
        }
    });

    // Reject Payment proof mutation
    const rejectPaymentMutation = useMutation({
        mutationFn: async ({ proofId, reason }: { proofId: string, reason: string }) => {
            const { data } = await api.post(`/payments/proofs/${proofId}/reject/`, { reason });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-proofs'] });
            queryClient.invalidateQueries({ queryKey: ['admin-analytics'] });
            queryClient.invalidateQueries({ queryKey: ['admin-audits'] });
            setRejectProofId(null);
            alert('Payment proof rejected. Notification email sent.');
        }
    });

    // Room CRUD mutations
    const saveRoomMutation = useMutation({
        mutationFn: async ({ id, payload }: { id?: string, payload: FormData }) => {
            if (id) {
                const { data } = await api.put(`/rooms/${id}/`, payload, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                return data;
            } else {
                const { data } = await api.post('/rooms/', payload, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                return data;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-rooms'] });
            queryClient.invalidateQueries({ queryKey: ['admin-audits'] });
            refreshPublicData();
            setIsRoomModalOpen(false);
            setEditingRoom(null);
            setRoomCoverFile(null);
            setRoomForm({
                room_name: '',
                slug: '',
                room_type: 'Deluxe',
                description: '',
                price_per_night: '',
                capacity: '2',
                total_units: '5',
                availability_status: 'AVAILABLE'
            });
        },
        onError: (err: any) => {
            alert('Failed to save room details.');
        }
    });

    const softDeleteRoomMutation = useMutation({
        mutationFn: async (slug: string) => {
            await api.delete(`/rooms/${slug}/`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-rooms'] });
            queryClient.invalidateQueries({ queryKey: ['admin-audits'] });
            refreshPublicData();
            alert('Room soft-deleted successfully.');
        }
    });
    // Slide CRUD Mutations
    const saveSlideMutation = useMutation({
        mutationFn: async ({ id, payload }: { id?: string, payload: FormData }) => {
            if (id) {
                const { data } = await api.put(`/cms/slides/${id}/`, payload, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                return data;
            } else {
                const { data } = await api.post('/cms/slides/', payload, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                return data;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-slides'] });
            queryClient.invalidateQueries({ queryKey: ['admin-audits'] });
            refreshPublicData();
            setIsSlideModalOpen(false);
            setEditingSlide(null);
            setSlideImageFile(null);
            setSlideForm({ title: '', subtitle: '', active: true });
        },
        onError: () => {
            alert('Failed to save banner slide details.');
        }
    });

    const deleteSlideMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/cms/slides/${id}/`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-slides'] });
            queryClient.invalidateQueries({ queryKey: ['admin-audits'] });
            refreshPublicData();
            alert('Banner slide deleted successfully.');
        }
    });

    // Gallery CRUD Mutations
    const saveGalleryMutation = useMutation({
        mutationFn: async (payload: FormData) => {
            const { data } = await api.post('/cms/gallery/', payload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-gallery'] });
            queryClient.invalidateQueries({ queryKey: ['admin-audits'] });
            refreshPublicData();
            setIsGalleryModalOpen(false);
            setGalleryImageFile(null);
            setGalleryForm({ title: '', category: galleryCategories?.[0]?.id || '' });
        },
        onError: () => {
            alert('Failed to upload gallery image.');
        }
    });

    const deleteGalleryMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/cms/gallery/${id}/`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-gallery'] });
            queryClient.invalidateQueries({ queryKey: ['admin-audits'] });
            refreshPublicData();
            alert('Gallery image deleted successfully.');
        }
    });

    // Payment Option CRUD Mutations
    const savePaymentMethodMutation = useMutation({
        mutationFn: async ({ id, payload }: { id?: string, payload: FormData }) => {
            if (id) {
                const { data } = await api.put(`/payments/methods/${id}/`, payload, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                return data;
            } else {
                const { data } = await api.post('/payments/methods/', payload, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                return data;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-payment-methods'] });
            queryClient.invalidateQueries({ queryKey: ['admin-audits'] });
            setIsPayMethodModalOpen(false);
            setEditingPayMethod(null);
            setPayMethodQRFile(null);
            setPayMethodForm({ method_name: '', account_name: '', account_number: '', instructions: '', is_active: true });
        },
        onError: () => {
            alert('Failed to save payment method.');
        }
    });

    const deletePaymentMethodMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/payments/methods/${id}/`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-payment-methods'] });
            queryClient.invalidateQueries({ queryKey: ['admin-audits'] });
            alert('Payment option deleted.');
        }
    });

    // Vacancy CRUD mutations
    const saveVacancyMutation = useMutation({
        mutationFn: async ({ id, payload }: { id?: string, payload: FormData }) => {
            if (id) {
                const { data } = await api.put(`/admin/vacancies/${id}/`, payload, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                return data;
            } else {
                const { data } = await api.post('/admin/vacancies/', payload, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                return data;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-vacancies'] });
            queryClient.invalidateQueries({ queryKey: ['admin-audits'] });
            queryClient.invalidateQueries({ queryKey: ['public-vacancies'] });
            refreshPublicData();
            setIsVacancyModalOpen(false);
            setEditingVacancy(null);
            setVacancyAttachmentFile(null);
            setVacancyForm({
                job_title: '',
                department: '',
                location: '',
                employment_type: 'FULL_TIME',
                vacancies_count: '1',
                salary: '',
                description: '',
                requirements: '',
                benefits: '',
                deadline: '',
                status: 'OPEN',
                published: false
            });
        },
        onError: () => {
            alert('Failed to save vacancy details.');
        }
    });

    const deleteVacancyMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/admin/vacancies/${id}/`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-vacancies'] });
            queryClient.invalidateQueries({ queryKey: ['admin-audits'] });
            queryClient.invalidateQueries({ queryKey: ['public-vacancies'] });
            refreshPublicData();
            alert('Vacancy deleted successfully.');
        }
    });

    const handleVacancyFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const fd = new FormData();
        fd.append('job_title', vacancyForm.job_title);
        fd.append('department', vacancyForm.department);
        fd.append('location', vacancyForm.location);
        fd.append('employment_type', vacancyForm.employment_type);
        fd.append('vacancies_count', vacancyForm.vacancies_count);
        fd.append('salary', vacancyForm.salary);
        fd.append('description', vacancyForm.description);
        fd.append('requirements', vacancyForm.requirements);
        fd.append('benefits', vacancyForm.benefits);
        fd.append('deadline', vacancyForm.deadline);
        fd.append('status', vacancyForm.status);
        fd.append('published', String(vacancyForm.published));
        if (vacancyAttachmentFile) {
            fd.append('attachment', vacancyAttachmentFile);
        }

        saveVacancyMutation.mutate({
            id: editingVacancy?.id,
            payload: fd
        });
    };

    const handleVacancyEditClick = (vac: any) => {
        setEditingVacancy(vac);
        setVacancyForm({
            job_title: vac.job_title,
            department: vac.department,
            location: vac.location,
            employment_type: vac.employment_type,
            vacancies_count: String(vac.vacancies_count),
            salary: vac.salary || '',
            description: vac.description,
            requirements: vac.requirements,
            benefits: vac.benefits || '',
            deadline: vac.deadline,
            status: vac.status,
            published: vac.published
        });
        setVacancyAttachmentFile(null);
        setIsVacancyModalOpen(true);
    };

    // Feedback Contact Messages Mutations
    const deleteMessageMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/cms/messages/${id}/`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-messages'] });
            queryClient.invalidateQueries({ queryKey: ['admin-audits'] });
            alert('Contact message deleted successfully.');
        }
    });


    const handleRoomFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('room_name', roomForm.room_name);
        formData.append('slug', roomForm.slug);
        formData.append('room_type', roomForm.room_type);
        formData.append('description', roomForm.description);
        formData.append('price_per_night', roomForm.price_per_night);
        formData.append('capacity', roomForm.capacity);
        formData.append('total_units', roomForm.total_units);
        formData.append('availability_status', roomForm.availability_status);
        
        if (roomCoverFile) {
            formData.append('cover_image', roomCoverFile);
        }

        saveRoomMutation.mutate({
            id: editingRoom?.id,
            payload: formData
        });
    };

    const handleRoomEditClick = (room: any) => {
        setEditingRoom(room);
        setRoomForm({
            room_name: room.room_name,
            slug: room.slug,
            room_type: room.room_type,
            description: room.description,
            price_per_night: String(room.price_per_night),
            capacity: String(room.capacity),
            total_units: String(room.total_units),
            availability_status: room.availability_status
        });
        setRoomCoverFile(null);
        setIsRoomModalOpen(true);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-6 sm:py-12 sm:px-6 lg:px-8 fade-in text-gray-800 dark:text-gray-200">
            <Helmet>
                <title>Admin Operations | Regal Rivulet Retreat Hotel Console</title>
            </Helmet>

            {/* Mobile Admin Header */}
            <div className="lg:hidden flex items-center space-x-3 p-4 bg-charcoal text-white rounded-lg border border-primary/20 shadow mb-4">
                <div className="p-2 bg-primary/10 rounded text-primary shrink-0"><Shield className="h-5 w-5" /></div>
                <div>
                    <h2 className="font-playfair font-bold text-base text-primary tracking-wider">ADMIN CONSOLE</h2>
                    <span className="text-[10px] text-gray-400 uppercase">{user?.full_name}</span>
                </div>
            </div>

            {/* Mobile Horizontal Tab Strip */}
            <div className="lg:hidden overflow-x-auto scrollbar-hide mb-4">
                <div className="flex space-x-2 min-w-max pb-1">
                    {[
                        {id:'ANALYTICS', icon:<Calendar className="h-3.5 w-3.5"/>, label:'Analytics'},
                        {id:'VERIFICATION', icon:<CreditCard className="h-3.5 w-3.5"/>, label:`Reviews (${proofs?.length||0})`},
                        {id:'ROOMS', icon:<List className="h-3.5 w-3.5"/>, label:'Rooms'},
                        {id:'BANNERS', icon:<Layers className="h-3.5 w-3.5"/>, label:'Banners'},
                        {id:'GALLERY', icon:<ImageIcon className="h-3.5 w-3.5"/>, label:'Gallery'},
                        {id:'PAYMENT_METHODS', icon:<Wallet className="h-3.5 w-3.5"/>, label:'Payments'},
                        {id:'CMS', icon:<MonitorPlay className="h-3.5 w-3.5"/>, label:'CMS Details'},
                        {id:'MESSAGES', icon:<MessageSquare className="h-3.5 w-3.5"/>, label:`Messages (${contactMessages?.length||0})`},
                        {id:'VACANCIES', icon:<FileText className="h-3.5 w-3.5"/>, label:'Vacancies'},
                        {id:'AUDIT_LOGS', icon:<ShieldAlert className="h-3.5 w-3.5"/>, label:'Audit'},
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center space-x-1.5 px-3 py-2 rounded-full text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap transition-all ${
                                activeTab === tab.id ? 'bg-primary text-charcoal shadow' : 'bg-white dark:bg-charcoal border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300'
                            }`}
                        >
                            {tab.icon}<span>{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                
                {/* Admin Sidebar - Desktop only */}
                <div className="hidden lg:block w-64 shrink-0 space-y-4">
                    <div className="p-6 bg-charcoal text-white rounded-lg border border-primary/20 shadow">
                        <div className="p-3 bg-primary/10 rounded text-primary w-fit mx-auto mb-2"><Shield className="h-6 w-6" /></div>
                        <h2 className="font-playfair font-bold text-lg text-center tracking-wider text-primary">ADMIN CONSOLE</h2>
                        <span className="text-[10px] text-gray-400 block text-center uppercase mt-1">Logged: {user?.full_name}</span>
                    </div>

                    <div className="bg-white dark:bg-charcoal p-2 rounded-lg border border-gray-150 dark:border-gray-800 shadow space-y-1">
                        <button 
                            onClick={() => setActiveTab('ANALYTICS')} 
                            className={`w-full flex items-center space-x-2.5 px-4 py-2.5 rounded text-sm transition-all ${activeTab === 'ANALYTICS' ? 'bg-primary text-charcoal font-bold shadow-sm' : 'hover:bg-gray-100 dark:hover:bg-charcoal-light text-gray-600 dark:text-gray-300'}`}
                        >
                            <Calendar className="h-4 w-4" /> <span>Analytics Charts</span>
                        </button>
                        <button 
                            onClick={() => setActiveTab('VERIFICATION')} 
                            className={`w-full flex items-center space-x-2.5 px-4 py-2.5 rounded text-sm transition-all ${activeTab === 'VERIFICATION' ? 'bg-primary text-charcoal font-bold shadow-sm' : 'hover:bg-gray-100 dark:hover:bg-charcoal-light text-gray-600 dark:text-gray-300'}`}
                        >
                            <CreditCard className="h-4 w-4" /> <span>Payment Reviews ({proofs?.length || 0})</span>
                        </button>
                        <button 
                            onClick={() => setActiveTab('ROOMS')} 
                            className={`w-full flex items-center space-x-2.5 px-4 py-2.5 rounded text-sm transition-all ${activeTab === 'ROOMS' ? 'bg-primary text-charcoal font-bold shadow-sm' : 'hover:bg-gray-100 dark:hover:bg-charcoal-light text-gray-600 dark:text-gray-300'}`}
                        >
                            <List className="h-4 w-4" /> <span>Room Inventory</span>
                        </button>
                        <button 
                            onClick={() => setActiveTab('BANNERS')} 
                            className={`w-full flex items-center space-x-2.5 px-4 py-2.5 rounded text-sm transition-all ${activeTab === 'BANNERS' ? 'bg-primary text-charcoal font-bold shadow-sm' : 'hover:bg-gray-100 dark:hover:bg-charcoal-light text-gray-600 dark:text-gray-300'}`}
                        >
                            <Layers className="h-4 w-4" /> <span>Homepage Banners ({slides?.length || 0})</span>
                        </button>
                        <button 
                            onClick={() => setActiveTab('GALLERY')} 
                            className={`w-full flex items-center space-x-2.5 px-4 py-2.5 rounded text-sm transition-all ${activeTab === 'GALLERY' ? 'bg-primary text-charcoal font-bold shadow-sm' : 'hover:bg-gray-100 dark:hover:bg-charcoal-light text-gray-600 dark:text-gray-300'}`}
                        >
                            <ImageIcon className="h-4 w-4" /> <span>Photo Gallery ({galleryItems?.length || 0})</span>
                        </button>
                        <button 
                            onClick={() => setActiveTab('PAYMENT_METHODS')} 
                            className={`w-full flex items-center space-x-2.5 px-4 py-2.5 rounded text-sm transition-all ${activeTab === 'PAYMENT_METHODS' ? 'bg-primary text-charcoal font-bold shadow-sm' : 'hover:bg-gray-100 dark:hover:bg-charcoal-light text-gray-600 dark:text-gray-300'}`}
                        >
                            <Wallet className="h-4 w-4" /> <span>Payment Options ({paymentMethods?.length || 0})</span>
                        </button>
                        <button 
                            onClick={() => setActiveTab('CMS')} 
                            className={`w-full flex items-center space-x-2.5 px-4 py-2.5 rounded text-sm transition-all ${activeTab === 'CMS' ? 'bg-primary text-charcoal font-bold shadow-sm' : 'hover:bg-gray-100 dark:hover:bg-charcoal-light text-gray-600 dark:text-gray-300'}`}
                        >
                            <MonitorPlay className="h-4 w-4" /> <span>Dynamic CMS</span>
                        </button>
                        <button 
                            onClick={() => setActiveTab('MESSAGES')} 
                            className={`w-full flex items-center space-x-2.5 px-4 py-2.5 rounded text-sm transition-all ${activeTab === 'MESSAGES' ? 'bg-primary text-charcoal font-bold shadow-sm' : 'hover:bg-gray-100 dark:hover:bg-charcoal-light text-gray-600 dark:text-gray-300'}`}
                        >
                            <MessageSquare className="h-4 w-4" /> <span>Support Messages ({contactMessages?.length || 0})</span>
                        </button>
                        <button 
                            onClick={() => setActiveTab('VACANCIES')} 
                            className={`w-full flex items-center space-x-2.5 px-4 py-2.5 rounded text-sm transition-all ${activeTab === 'VACANCIES' ? 'bg-primary text-charcoal font-bold shadow-sm' : 'hover:bg-gray-100 dark:hover:bg-charcoal-light text-gray-600 dark:text-gray-300'}`}
                        >
                            <FileText className="h-4 w-4" /> <span>Vacancies CRUD ({vacancies?.length || 0})</span>
                        </button>
                        <button 
                            onClick={() => setActiveTab('AUDIT_LOGS')} 
                            className={`w-full flex items-center space-x-2.5 px-4 py-2.5 rounded text-sm transition-all ${activeTab === 'AUDIT_LOGS' ? 'bg-primary text-charcoal font-bold shadow-sm' : 'hover:bg-gray-100 dark:hover:bg-charcoal-light text-gray-600 dark:text-gray-300'}`}
                        >
                            <ShieldAlert className="h-4 w-4" /> <span>System Audit Logs</span>
                        </button>
                    </div>
                </div>

                {/* Dashboard Main Canvas */}
                <div className="flex-grow min-w-0 space-y-6 overflow-hidden">
                    
                    {/* Analytics Dashboard */}
                    {activeTab === 'ANALYTICS' && (
                        <div className="space-y-8">
                            <h2 className="font-playfair text-3xl font-bold">Operations Analytics</h2>
                            
                            {loadingAnalytics && <div className="text-center py-20 text-gray-400">Loading analytics records...</div>}

                            {!loadingAnalytics && dashboardData && (
                                <>
                                    {/* Stats grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                                        <div className="p-4 bg-white dark:bg-charcoal border border-gray-100 dark:border-gray-800 rounded-lg shadow">
                                            <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider block">Total Revenue</span>
                                            <span className="font-playfair text-2xl font-bold mt-1 block text-primary">${dashboardData.metrics?.total_revenue}</span>
                                        </div>
                                        <div className="p-4 bg-white dark:bg-charcoal border border-gray-100 dark:border-gray-800 rounded-lg shadow">
                                            <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider block">Today's Revenue</span>
                                            <span className="font-playfair text-2xl font-bold mt-1 block text-primary">${dashboardData.metrics?.today_revenue}</span>
                                        </div>
                                        <div className="p-4 bg-white dark:bg-charcoal border border-gray-100 dark:border-gray-800 rounded-lg shadow">
                                            <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider block">Total Bookings</span>
                                            <span className="font-playfair text-2xl font-bold mt-1 block">{dashboardData.metrics?.total_bookings}</span>
                                        </div>
                                        <div className="p-4 bg-white dark:bg-charcoal border border-gray-100 dark:border-gray-800 rounded-lg shadow">
                                            <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider block">Awaiting Verifications</span>
                                            <span className="font-playfair text-2xl font-bold mt-1 block text-yellow-500">{proofs?.length || 0}</span>
                                        </div>
                                    </div>

                                    {/* Recharts Graphs */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        
                                        {/* Revenue chart */}
                                        <div className="bg-white dark:bg-charcoal p-6 rounded-lg border border-gray-100 dark:border-gray-800 shadow">
                                            <h3 className="font-playfair text-base font-bold mb-4">Monthly Confirmed Revenue</h3>
                                            <div className="h-64">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <LineChart data={dashboardData.analytics}>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                                                        <XAxis dataKey="month" stroke="#9ca3af" fontSize={10} />
                                                        <YAxis stroke="#9ca3af" fontSize={10} />
                                                        <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #D4AF37' }} />
                                                        <Line type="monotone" dataKey="revenue" stroke="#D4AF37" strokeWidth={2.5} name="Revenue ($)" />
                                                    </LineChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>

                                        {/* Bookings chart */}
                                        <div className="bg-white dark:bg-charcoal p-6 rounded-lg border border-gray-100 dark:border-gray-800 shadow">
                                            <h3 className="font-playfair text-base font-bold mb-4">Monthly Reservation Quantities</h3>
                                            <div className="h-64">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={dashboardData.analytics}>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                                                        <XAxis dataKey="month" stroke="#9ca3af" fontSize={10} />
                                                        <YAxis stroke="#9ca3af" fontSize={10} />
                                                        <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #D4AF37' }} />
                                                        <Bar dataKey="bookings" fill="#1F2937" stroke="#D4AF37" name="Bookings" />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>

                                        {/* Occupancy Rate */}
                                        <div className="bg-white dark:bg-charcoal p-6 rounded-lg border border-gray-100 dark:border-gray-800 shadow md:col-span-2">
                                            <h3 className="font-playfair text-base font-bold mb-4">Room-Nights Occupancy Rate (%)</h3>
                                            <div className="h-64">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <AreaChart data={dashboardData.analytics}>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                                                        <XAxis dataKey="month" stroke="#9ca3af" fontSize={10} />
                                                        <YAxis stroke="#9ca3af" fontSize={10} />
                                                        <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #D4AF37' }} />
                                                        <Area type="monotone" dataKey="occupancy_rate" fill="rgba(212, 175, 55, 0.1)" stroke="#D4AF37" strokeWidth={2.5} name="Occupancy %" />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>

                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* Payment Verification Reviews */}
                    {activeTab === 'VERIFICATION' && (
                        <div className="space-y-6">
                            <h2 className="font-playfair text-3xl font-bold">Manual Payment Verifications</h2>
                            
                            {loadingProofs && <div className="text-center py-20 text-gray-400 animate-pulse">Retrieving proof list...</div>}

                            {!loadingProofs && proofs?.length === 0 && (
                                <div className="text-center py-20 bg-white dark:bg-charcoal border border-gray-100 dark:border-gray-800 rounded text-gray-400 font-light">
                                    No payment proofs are currently awaiting manual verification.
                                </div>
                            )}

                            {!loadingProofs && proofs && proofs.length > 0 && (
                                <div className="space-y-6">
                                    {proofs.map((proof: any) => (
                                        <div key={proof.id} className="bg-white dark:bg-charcoal border border-gray-100 dark:border-gray-800 rounded-lg p-6 flex flex-col md:flex-row gap-6 shadow">
                                            
                                            {/* Screenshot preview */}
                                            <div className="h-64 w-full md:w-64 bg-gray-50 border dark:border-gray-800 rounded overflow-hidden shrink-0 relative group">
                                                {proof.screenshot ? (
                                                    <img src={proof.screenshot} alt="Receipt Screenshot" className="w-full h-full object-contain" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400"><ImageIcon className="h-8 w-8" /></div>
                                                )}
                                                <a href={proof.screenshot} target="_blank" rel="noreferrer" className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-semibold uppercase tracking-wider transition-opacity">
                                                    Zoom Receipt
                                                </a>
                                            </div>

                                            {/* Details & Actions */}
                                            <div className="flex-grow space-y-4 flex flex-col justify-between">
                                                <div className="space-y-2 text-xs font-light">
                                                    <div className="flex items-center space-x-2">
                                                        <span className="font-playfair text-xl font-bold text-gray-900 dark:text-white">{proof.booking_detail?.room_detail?.room_name}</span>
                                                        <span className="text-gray-400">({proof.booking_detail?.booking_reference})</span>
                                                    </div>
                                                    <p>Guest Name: <b>{proof.booking_detail?.customer_name || 'Guest'}</b> ({proof.booking_detail?.customer_email})</p>
                                                    <p>Booking Range: <b>{proof.booking_detail?.check_in}</b> to <b>{proof.booking_detail?.check_out}</b> ({proof.booking_detail?.total_nights} nights)</p>
                                                    <p>Required Amount: <b className="text-primary text-sm">${proof.booking_detail?.total_amount}</b></p>
                                                    <div className="border-t border-gray-100 dark:border-gray-800/80 pt-2 my-2 space-y-1">
                                                        <p>Method Used: <b>{proof.payment_method_detail?.method_name || 'Generic'}</b></p>
                                                        <p>Transaction ID: <b>{proof.transaction_id || 'Not Provided'}</b></p>
                                                        {proof.notes && <p className="text-gray-400 italic">Guest Notes: {proof.notes}</p>}
                                                    </div>
                                                </div>

                                                <div className="flex space-x-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                                                    <button
                                                        onClick={() => {
                                                            if (window.confirm(`Approve payment for ${proof.booking_detail?.booking_reference}?`)) {
                                                                approvePaymentMutation.mutate(proof.id);
                                                            }
                                                        }}
                                                        className="bg-green-650 hover:bg-green-700 text-white font-bold uppercase text-[10px] tracking-wider px-5 py-2.5 rounded transition-all shadow"
                                                    >
                                                        Approve & Confirm
                                                    </button>
                                                    <button
                                                        onClick={() => setRejectProofId(proof.id)}
                                                        className="bg-red-650 hover:bg-red-700 text-white font-bold uppercase text-[10px] tracking-wider px-5 py-2.5 rounded transition-all shadow"
                                                    >
                                                        Reject Proof
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Rejection Modal/Form */}
                            {rejectProofId && (
                                <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
                                    <div className="bg-white dark:bg-charcoal p-6 rounded-lg max-w-md w-full border border-gray-200 dark:border-gray-800 space-y-4">
                                        <h3 className="font-playfair text-xl font-bold">Document Rejection Reason</h3>
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold uppercase text-gray-500 block">Reason</label>
                                            <select
                                                value={rejectionReason}
                                                onChange={(e) => setRejectionReason(e.target.value)}
                                                className="w-full px-3 py-2 bg-gray-50 dark:bg-charcoal border border-gray-200 dark:border-gray-800 rounded text-sm"
                                            >
                                                <option value="Wrong Amount">Wrong Amount</option>
                                                <option value="Invalid Screenshot">Invalid Screenshot</option>
                                                <option value="Payment Not Found">Payment Not Found</option>
                                                <option value="Duplicate Payment">Duplicate Payment</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                        <div className="flex space-x-2 pt-2">
                                            <button
                                                onClick={() => rejectPaymentMutation.mutate({ proofId: rejectProofId, reason: rejectionReason })}
                                                className="bg-red-650 hover:bg-red-750 text-white text-xs font-bold py-2 px-4 rounded"
                                            >
                                                Reject Payment
                                            </button>
                                            <button
                                                onClick={() => setRejectProofId(null)}
                                                className="border border-gray-200 dark:border-gray-800 text-gray-400 text-xs font-bold py-2 px-4 rounded"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Room Inventory CRUD */}
                    {activeTab === 'ROOMS' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h2 className="font-playfair text-3xl font-bold">Room Inventory</h2>
                                <button 
                                    onClick={() => {
                                        setEditingRoom(null);
                                        setRoomForm({
                                            room_name: '',
                                            slug: '',
                                            room_type: 'Deluxe',
                                            description: '',
                                            price_per_night: '',
                                            capacity: '2',
                                            total_units: '5',
                                            availability_status: 'AVAILABLE'
                                        });
                                        setRoomCoverFile(null);
                                        setIsRoomModalOpen(true);
                                    }}
                                    className="bg-primary hover:bg-primary-dark text-charcoal font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded shadow flex items-center space-x-1"
                                >
                                    <Plus className="h-4 w-4" /> <span>Add New Room</span>
                                </button>
                            </div>

                            {loadingRooms && <div className="text-center py-20 text-gray-400 animate-pulse">Loading inventory database...</div>}

                            {!loadingRooms && rooms && (
                                <div className="bg-white dark:bg-charcoal rounded-lg border border-gray-150 dark:border-gray-800 overflow-x-auto shadow">
                                    <table className="w-full text-left text-sm font-light">
                                        <thead className="bg-gray-50 dark:bg-charcoal-light border-b border-gray-100 dark:border-gray-800 text-xs font-bold uppercase tracking-wider text-gray-500">
                                            <tr>
                                                <th className="px-6 py-4">Room Name</th>
                                                <th className="px-6 py-4">Type</th>
                                                <th className="px-6 py-4">Price</th>
                                                <th className="px-6 py-4">Capacity</th>
                                                <th className="px-6 py-4">Units</th>
                                                <th className="px-6 py-4">Status</th>
                                                <th className="px-6 py-4 text-center">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                            {rooms.map((room: any) => (
                                                <tr key={room.id} className={room.is_deleted ? 'opacity-40 bg-red-950/5' : ''}>
                                                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                                                        {room.room_name} {room.is_deleted && <span className="text-[10px] text-red-500 font-bold uppercase ml-1.5">[Soft Deleted]</span>}
                                                    </td>
                                                    <td className="px-6 py-4">{room.room_type}</td>
                                                    <td className="px-6 py-4 text-primary font-semibold">${room.price_per_night}</td>
                                                    <td className="px-6 py-4">{room.capacity} Guests</td>
                                                    <td className="px-6 py-4">{room.total_units}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                                                            room.availability_status === 'AVAILABLE' ? 'bg-green-100 text-green-800 dark:bg-green-950/20 dark:text-green-400' :
                                                            room.availability_status === 'MAINTENANCE' ? 'bg-orange-100 text-orange-850 dark:bg-orange-950/20 dark:text-orange-400' :
                                                            'bg-gray-100 text-gray-800'
                                                        }`}>
                                                            {room.availability_status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center space-x-3">
                                                        {!room.is_deleted && (
                                                            <>
                                                                <button 
                                                                    onClick={() => handleRoomEditClick(room)}
                                                                    className="text-primary hover:text-primary-dark"
                                                                    title="Edit Room"
                                                                >
                                                                    <Edit className="h-4.5 w-4.5 inline" />
                                                                </button>
                                                                <button 
                                                                    onClick={() => {
                                                                        if (window.confirm(`Are you sure you want to delete ${room.room_name}?`)) {
                                                                            softDeleteRoomMutation.mutate(room.slug);
                                                                        }
                                                                    }}
                                                                    className="text-red-500 hover:text-red-650"
                                                                    title="Soft Delete"
                                                                >
                                                                    <Trash2 className="h-4.5 w-4.5 inline" />
                                                                </button>
                                                            </>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Create/Edit Room Modal */}
                            {isRoomModalOpen && (
                                <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 overflow-y-auto">
                                    <div className="bg-white dark:bg-charcoal p-8 rounded-lg max-w-lg w-full border border-gray-200 dark:border-gray-800 space-y-6">
                                        <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-gray-800">
                                            <h3 className="font-playfair text-2xl font-bold">{editingRoom ? 'Modify Room details' : 'Add New Room'}</h3>
                                            <button onClick={() => setIsRoomModalOpen(false)}><X className="h-6 w-6 text-gray-400" /></button>
                                        </div>

                                        <form onSubmit={handleRoomFormSubmit} className="space-y-4 text-xs">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <label className="text-gray-500 font-semibold block uppercase">Room Name</label>
                                                    <input
                                                        type="text" required
                                                        value={roomForm.room_name}
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            const slugVal = editingRoom ? roomForm.slug : val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                                                            setRoomForm({...roomForm, room_name: val, slug: slugVal});
                                                        }}
                                                        placeholder="Deluxe King Room"
                                                        className="w-full px-3 py-2 bg-gray-50 dark:bg-charcoal border border-gray-200 dark:border-gray-800 rounded text-sm text-gray-900 dark:text-white"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-gray-500 font-semibold block uppercase">URL Slug (Unique)</label>
                                                    <input
                                                        type="text" required
                                                        value={roomForm.slug}
                                                        onChange={(e) => setRoomForm({...roomForm, slug: e.target.value})}
                                                        placeholder="deluxe-king-room"
                                                        className="w-full px-3 py-2 bg-gray-50 dark:bg-charcoal border border-gray-200 dark:border-gray-800 rounded text-sm text-gray-900 dark:text-white"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                <div className="space-y-1">
                                                    <label className="text-gray-500 font-semibold block uppercase">Type</label>
                                                    <select
                                                        value={roomForm.room_type}
                                                        onChange={(e) => setRoomForm({...roomForm, room_type: e.target.value})}
                                                        className="w-full px-3 py-2 bg-gray-50 dark:bg-charcoal border border-gray-200 dark:border-gray-800 rounded text-sm text-gray-900 dark:text-white"
                                                    >
                                                        <option value="Suite">Suite</option>
                                                        <option value="Deluxe">Deluxe</option>
                                                        <option value="Standard">Standard</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-gray-500 font-semibold block uppercase">Price/Night</label>
                                                    <input
                                                        type="number" required
                                                        value={roomForm.price_per_night}
                                                        onChange={(e) => setRoomForm({...roomForm, price_per_night: e.target.value})}
                                                        placeholder="250.00"
                                                        className="w-full px-3 py-2 bg-gray-50 dark:bg-charcoal border border-gray-200 dark:border-gray-800 rounded text-sm text-gray-900 dark:text-white"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-gray-500 font-semibold block uppercase">Capacity</label>
                                                    <input
                                                        type="number" required
                                                        value={roomForm.capacity}
                                                        onChange={(e) => setRoomForm({...roomForm, capacity: e.target.value})}
                                                        className="w-full px-3 py-2 bg-gray-50 dark:bg-charcoal border border-gray-200 dark:border-gray-800 rounded text-sm text-gray-900 dark:text-white"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <label className="text-gray-500 font-semibold block uppercase">Total Units</label>
                                                    <input
                                                        type="number" required
                                                        value={roomForm.total_units}
                                                        onChange={(e) => setRoomForm({...roomForm, total_units: e.target.value})}
                                                        className="w-full px-3 py-2 bg-gray-50 dark:bg-charcoal border border-gray-200 dark:border-gray-800 rounded text-sm text-gray-900 dark:text-white"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-gray-500 font-semibold block uppercase">Operational Status</label>
                                                    <select
                                                        value={roomForm.availability_status}
                                                        onChange={(e) => setRoomForm({...roomForm, availability_status: e.target.value})}
                                                        className="w-full px-3 py-2 bg-gray-50 dark:bg-charcoal border border-gray-200 dark:border-gray-800 rounded text-sm text-gray-900 dark:text-white"
                                                    >
                                                        <option value="AVAILABLE">Available</option>
                                                        <option value="MAINTENANCE">Maintenance</option>
                                                        <option value="INACTIVE">Inactive</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="space-y-1">
                                                <label className="text-gray-500 font-semibold block uppercase">Description</label>
                                                <textarea
                                                    rows={4} required
                                                    value={roomForm.description}
                                                    onChange={(e) => setRoomForm({...roomForm, description: e.target.value})}
                                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-charcoal border border-gray-200 dark:border-gray-800 rounded text-sm text-gray-900 dark:text-white"
                                                />
                                            </div>

                                            <div className="space-y-1">
                                                <label className="text-gray-500 font-semibold block uppercase">Cover Image</label>
                                                <input
                                                    type="file"
                                                    onChange={(e) => {
                                                        if (e.target.files && e.target.files[0]) {
                                                            setRoomCoverFile(e.target.files[0]);
                                                        }
                                                    }}
                                                    className="w-full text-sm"
                                                />
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={saveRoomMutation.isPending}
                                                className="w-full bg-primary hover:bg-primary-dark text-charcoal font-bold uppercase text-xs tracking-wider py-3 rounded transition-all mt-4"
                                            >
                                                {saveRoomMutation.isPending ? 'Saving...' : 'Save Room Details'}
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Registered Customers lookup */}
                    {activeTab === 'USERS' && (
                        <div className="space-y-6">
                            <h2 className="font-playfair text-3xl font-bold">Registered Customers</h2>
                            
                            {loadingUsers && <div className="text-center py-20 text-gray-400 animate-pulse">Loading customer records...</div>}

                            {!loadingUsers && users && (
                                <div className="bg-white dark:bg-charcoal rounded-lg border border-gray-150 dark:border-gray-800 overflow-x-auto shadow">
                                    <table className="w-full text-left text-sm font-light">
                                        <thead className="bg-gray-50 dark:bg-charcoal-light border-b border-gray-100 dark:border-gray-800 text-xs font-bold uppercase tracking-wider text-gray-500">
                                            <tr>
                                                <th className="px-6 py-4">Customer Name</th>
                                                <th className="px-6 py-4">Email</th>
                                                <th className="px-6 py-4">Phone Number</th>
                                                <th className="px-6 py-4">Joined Date</th>
                                                <th className="px-6 py-4 text-center">History</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                            {users.map((u: any) => (
                                                <tr key={u.id}>
                                                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{u.full_name || 'Guest'}</td>
                                                    <td className="px-6 py-4">{u.email}</td>
                                                    <td className="px-6 py-4">{u.phone_number || '-'}</td>
                                                    <td className="px-6 py-4">{new Date(u.created_at).toLocaleDateString()}</td>
                                                    <td className="px-6 py-4 text-center">
                                                        <button 
                                                            onClick={() => setSelectedUser(u)}
                                                            className="text-primary hover:underline font-bold text-xs uppercase"
                                                        >
                                                            Inspect
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* User booking history modal */}
                            {selectedUser && (
                                <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
                                    <div className="bg-white dark:bg-charcoal p-8 rounded-lg max-w-3xl w-full border border-gray-200 dark:border-gray-800 space-y-6 max-h-[85vh] overflow-y-auto">
                                        <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-gray-800">
                                            <div>
                                                <h3 className="font-playfair text-2xl font-bold">Guest Booking History</h3>
                                                <p className="text-xs text-gray-400 mt-1">{selectedUser.full_name} | {selectedUser.email}</p>
                                            </div>
                                            <button onClick={() => setSelectedUser(null)}><X className="h-6 w-6 text-gray-400" /></button>
                                        </div>

                                        {/* List booking history */}
                                        <div className="space-y-4">
                                            {/* Since we don't have separate user bookings endpoint, we can query all bookings filtering by user email */}
                                            {queryClient.getQueryData<any>(['admin-bookings']) ? (
                                                <p>Loading...</p>
                                            ) : (
                                                <div className="space-y-3">
                                                    {/* We pull from general bookings list */}
                                                    {bookings?.filter((b: any) => b.customer_email === selectedUser.email).length === 0 ? (
                                                        <p className="text-xs text-gray-400 italic text-center py-6">No reservations booked by this guest.</p>
                                                    ) : (
                                                        bookings?.filter((b: any) => b.customer_email === selectedUser.email).map((bk: any) => (
                                                            <div key={bk.id} className="p-4 bg-gray-50 dark:bg-charcoal-light rounded border border-gray-100 dark:border-gray-800 flex justify-between items-center">
                                                                <div className="text-xs space-y-1">
                                                                    <div className="font-bold text-sm text-gray-900 dark:text-white">{bk.room_detail?.room_name} <span className="text-[10px] text-gray-400 font-normal">({bk.booking_reference})</span></div>
                                                                    <p>Range: {bk.check_in} to {bk.check_out} | Amount: ${bk.total_amount}</p>
                                                                </div>
                                                                <span className="px-2 py-0.5 rounded text-[9px] uppercase font-bold bg-primary/20 text-primary border border-primary/30">
                                                                    {bk.booking_status}
                                                                </span>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Audit Logs tab */}
                    {activeTab === 'AUDIT_LOGS' && (
                        <div className="space-y-6">
                            <h2 className="font-playfair text-3xl font-bold">System Audit Logs</h2>
                            
                            {loadingAudits && <div className="text-center py-20 text-gray-400 animate-pulse">Loading logs database...</div>}

                            {!loadingAudits && auditLogs && (
                                <div className="bg-white dark:bg-charcoal rounded-lg border border-gray-150 dark:border-gray-800 overflow-x-auto shadow text-xs">
                                    <table className="w-full text-left font-light">
                                        <thead className="bg-gray-50 dark:bg-charcoal-light border-b border-gray-100 dark:border-gray-800 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                                            <tr>
                                                <th className="px-6 py-3">Timestamp</th>
                                                <th className="px-6 py-3">Operator</th>
                                                <th className="px-6 py-3">Action</th>
                                                <th className="px-6 py-3">Reference details</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-mono">
                                            {auditLogs.map((log: any) => (
                                                <tr key={log.id}>
                                                    <td className="px-6 py-3 whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</td>
                                                    <td className="px-6 py-3 font-semibold text-primary">{log.user_email || 'System'}</td>
                                                    <td className="px-6 py-3"><span className="bg-gray-100 dark:bg-charcoal-light px-2 py-0.5 rounded text-[10px] uppercase font-bold text-gray-300">{log.action}</span></td>
                                                    <td className="px-6 py-3 font-light text-gray-400">{log.description}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Banners Tab */}
                    {activeTab === 'BANNERS' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h2 className="font-playfair text-3xl font-bold">Homepage Banners</h2>
                                <button
                                    onClick={() => {
                                        setEditingSlide(null);
                                        setSlideForm({ title: '', subtitle: '', active: true });
                                        setSlideImageFile(null);
                                        setIsSlideModalOpen(true);
                                    }}
                                    className="bg-primary hover:bg-primary-dark text-charcoal font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded shadow flex items-center space-x-1"
                                >
                                    <Plus className="h-4 w-4" /> <span>Add New Banner</span>
                                </button>
                            </div>

                            {loadingSlides && <div className="text-center py-20 text-gray-400 animate-pulse">Loading banners...</div>}

                            {!loadingSlides && slides && slides.length === 0 && (
                                <div className="text-center py-20 bg-white dark:bg-charcoal border border-gray-100 dark:border-gray-800 rounded text-gray-400 font-light">
                                    No banners created. Banners are shown on the homepage hero carousel.
                                </div>
                            )}

                            {!loadingSlides && slides && slides.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {slides.map((slide: any) => (
                                        <div key={slide.id} className="bg-white dark:bg-charcoal border border-gray-150 dark:border-gray-800 rounded-lg overflow-hidden shadow-md flex flex-col justify-between">
                                            <div className="h-48 bg-gray-100 dark:bg-gray-800 overflow-hidden relative">
                                                {slide.image ? (
                                                    <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400"><ImageIcon className="h-8 w-8" /></div>
                                                )}
                                                <div className="absolute top-3 right-3">
                                                    <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase tracking-wider ${slide.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                        {slide.active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="p-4 flex-grow space-y-1">
                                                <h3 className="font-playfair text-lg font-bold text-gray-950 dark:text-white leading-snug">{slide.title}</h3>
                                                {slide.subtitle && <p className="text-xs text-gray-450 dark:text-gray-400 font-light">{slide.subtitle}</p>}
                                            </div>
                                            <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-end space-x-2">
                                                <button
                                                    onClick={() => {
                                                        setEditingSlide(slide);
                                                        setSlideForm({
                                                            title: slide.title,
                                                            subtitle: slide.subtitle || '',
                                                            active: slide.active
                                                        });
                                                        setSlideImageFile(null);
                                                        setIsSlideModalOpen(true);
                                                    }}
                                                    className="text-primary hover:bg-primary/10 border border-primary/20 px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider flex items-center space-x-1"
                                                >
                                                    <Edit className="h-3.5 w-3.5" /> <span>Edit</span>
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (window.confirm(`Delete slide: "${slide.title}"?`)) {
                                                            deleteSlideMutation.mutate(slide.id);
                                                        }
                                                    }}
                                                    className="text-red-505 hover:bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider flex items-center space-x-1"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" /> <span>Delete</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Banner Modal */}
                            {isSlideModalOpen && (
                                <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
                                    <div className="bg-white dark:bg-charcoal p-6 rounded-lg max-w-md w-full border border-gray-200 dark:border-gray-800 space-y-4">
                                        <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-gray-800">
                                            <h3 className="font-playfair text-xl font-bold">{editingSlide ? 'Modify Banner details' : 'Add New Banner'}</h3>
                                            <button onClick={() => setIsSlideModalOpen(false)}><X className="h-6 w-6 text-gray-400" /></button>
                                        </div>
                                        <form onSubmit={(e) => {
                                            e.preventDefault();
                                            const fd = new FormData();
                                            fd.append('title', slideForm.title);
                                            fd.append('subtitle', slideForm.subtitle);
                                            fd.append('active', String(slideForm.active));
                                            if (slideImageFile) fd.append('image', slideImageFile);
                                            saveSlideMutation.mutate({ id: editingSlide?.id, payload: fd });
                                        }} className="space-y-4 text-xs">
                                            <div className="space-y-1">
                                                <label className="text-gray-500 font-semibold block uppercase">Title</label>
                                                <input
                                                    type="text" required
                                                    value={slideForm.title}
                                                    onChange={(e) => setSlideForm({...slideForm, title: e.target.value})}
                                                    placeholder="Welcome to Luxury"
                                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-charcoal border border-gray-200 dark:border-gray-800 rounded text-sm text-gray-900 dark:text-white"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-gray-500 font-semibold block uppercase">Subtitle</label>
                                                <input
                                                    type="text"
                                                    value={slideForm.subtitle}
                                                    onChange={(e) => setSlideForm({...slideForm, subtitle: e.target.value})}
                                                    placeholder="Enjoy world class services"
                                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-charcoal border border-gray-200 dark:border-gray-800 rounded text-sm text-gray-900 dark:text-white"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-gray-500 font-semibold block uppercase">Banner Image</label>
                                                <input
                                                    type="file" required={!editingSlide}
                                                    onChange={(e) => {
                                                        if (e.target.files && e.target.files[0]) setSlideImageFile(e.target.files[0]);
                                                    }}
                                                    className="w-full text-xs"
                                                />
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    id="slide-active"
                                                    checked={slideForm.active}
                                                    onChange={(e) => setSlideForm({...slideForm, active: e.target.checked})}
                                                    className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                                                />
                                                <label htmlFor="slide-active" className="text-gray-500 font-semibold uppercase">Active / Visible on Home</label>
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={saveSlideMutation.isPending}
                                                className="w-full bg-primary hover:bg-primary-dark text-charcoal font-bold uppercase text-xs tracking-wider py-3 rounded transition-all mt-4"
                                            >
                                                {saveSlideMutation.isPending ? 'Saving...' : 'Save Banner'}
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Gallery Tab */}
                    {activeTab === 'GALLERY' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h2 className="font-playfair text-3xl font-bold">Photo Gallery</h2>
                                <button
                                    onClick={() => {
                                        setGalleryForm({ title: '', category: galleryCategories?.[0]?.id || '' });
                                        setGalleryImageFile(null);
                                        setIsGalleryModalOpen(true);
                                    }}
                                    className="bg-primary hover:bg-primary-dark text-charcoal font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded shadow flex items-center space-x-1"
                                >
                                    <Plus className="h-4 w-4" /> <span>Add Gallery Image</span>
                                </button>
                            </div>

                            {loadingGallery && <div className="text-center py-20 text-gray-400 animate-pulse">Loading gallery items...</div>}

                            {!loadingGallery && galleryItems && galleryItems.length === 0 && (
                                <div className="text-center py-20 bg-white dark:bg-charcoal border border-gray-100 dark:border-gray-800 rounded text-gray-400 font-light">
                                    No gallery images uploaded. Images are displayed in the Photo Gallery page.
                                </div>
                            )}

                            {!loadingGallery && galleryItems && galleryItems.length > 0 && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    {galleryItems.map((item: any) => (
                                        <div key={item.id} className="bg-white dark:bg-charcoal border border-gray-150 dark:border-gray-800 rounded-lg overflow-hidden shadow group relative h-48">
                                            {item.image ? (
                                                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400"><ImageIcon className="h-6 w-6" /></div>
                                            )}
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                                                <div className="flex justify-between items-start">
                                                    <span className="bg-primary text-charcoal font-bold text-[9px] uppercase px-2 py-0.5 rounded tracking-wider">{item.category_name}</span>
                                                    <button
                                                        onClick={() => {
                                                            if (window.confirm(`Delete gallery item "${item.title}"?`)) {
                                                                deleteGalleryMutation.mutate(item.id);
                                                            }
                                                        }}
                                                        className="text-red-500 bg-white/20 p-1.5 rounded hover:bg-red-650 hover:text-white transition-colors"
                                                        title="Delete Image"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                                <p className="text-white text-xs font-semibold truncate leading-snug">{item.title}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Gallery Upload Modal */}
                            {isGalleryModalOpen && (
                                <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
                                    <div className="bg-white dark:bg-charcoal p-6 rounded-lg max-w-md w-full border border-gray-200 dark:border-gray-800 space-y-4">
                                        <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-gray-800">
                                            <h3 className="font-playfair text-xl font-bold">Add Gallery Image</h3>
                                            <button onClick={() => setIsGalleryModalOpen(false)}><X className="h-6 w-6 text-gray-400" /></button>
                                        </div>
                                        <form onSubmit={(e) => {
                                            e.preventDefault();
                                            if (!galleryImageFile) {
                                                alert('Please select an image file to upload.');
                                                return;
                                            }
                                            const fd = new FormData();
                                            fd.append('title', galleryForm.title);
                                            fd.append('category', galleryForm.category);
                                            fd.append('image', galleryImageFile);
                                            saveGalleryMutation.mutate(fd);
                                        }} className="space-y-4 text-xs">
                                            <div className="space-y-1">
                                                <label className="text-gray-500 font-semibold block uppercase">Title / Caption</label>
                                                <input
                                                    type="text" required
                                                    value={galleryForm.title}
                                                    onChange={(e) => setGalleryForm({...galleryForm, title: e.target.value})}
                                                    placeholder="Spa Treatment Room"
                                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-charcoal border border-gray-200 dark:border-gray-800 rounded text-sm text-gray-900 dark:text-white"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-gray-500 font-semibold block uppercase">Category</label>
                                                <select
                                                    value={galleryForm.category}
                                                    onChange={(e) => setGalleryForm({...galleryForm, category: e.target.value})}
                                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-charcoal border border-gray-200 dark:border-gray-800 rounded text-sm text-gray-900 dark:text-white"
                                                    required
                                                >
                                                    <option value="">Select a Category</option>
                                                    {galleryCategories?.map((cat: any) => (
                                                        <option key={cat.id} value={cat.id}>
                                                            {cat.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-gray-500 font-semibold block uppercase">Gallery Image File</label>
                                                <input
                                                    type="file" required
                                                    onChange={(e) => {
                                                        if (e.target.files && e.target.files[0]) setGalleryImageFile(e.target.files[0]);
                                                    }}
                                                    className="w-full text-xs"
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={saveGalleryMutation.isPending}
                                                className="w-full bg-primary hover:bg-primary-dark text-charcoal font-bold uppercase text-xs tracking-wider py-3 rounded transition-all mt-4"
                                            >
                                                {saveGalleryMutation.isPending ? 'Uploading...' : 'Upload Image'}
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Payment Options Tab */}
                    {activeTab === 'PAYMENT_METHODS' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h2 className="font-playfair text-3xl font-bold">Payment Options & QR Setup</h2>
                                <button
                                    onClick={() => {
                                        setEditingPayMethod(null);
                                        setPayMethodForm({
                                            method_name: '',
                                            account_name: '',
                                            account_number: '',
                                            instructions: '',
                                            is_active: true
                                        });
                                        setPayMethodQRFile(null);
                                        setIsPayMethodModalOpen(true);
                                    }}
                                    className="bg-primary hover:bg-primary-dark text-charcoal font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded shadow flex items-center space-x-1"
                                >
                                    <Plus className="h-4 w-4" /> <span>Add Payment Option</span>
                                </button>
                            </div>

                            {loadingPaymentMethods && <div className="text-center py-20 text-gray-400 animate-pulse">Loading payment options...</div>}

                            {!loadingPaymentMethods && paymentMethods && paymentMethods.length === 0 && (
                                <div className="text-center py-20 bg-white dark:bg-charcoal border border-gray-100 dark:border-gray-800 rounded text-gray-400 font-light">
                                    No payment methods set up. Customers won't be able to submit transaction proofs.
                                </div>
                            )}

                            {!loadingPaymentMethods && paymentMethods && paymentMethods.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {paymentMethods.map((method: any) => (
                                        <div key={method.id} className={`bg-white dark:bg-charcoal border rounded-lg p-6 flex gap-6 shadow hover:border-primary/20 transition-all ${method.is_deleted ? 'opacity-40 bg-red-950/5' : ''}`}>
                                            {/* QR Preview */}
                                            <div className="h-32 w-32 bg-white border dark:border-gray-800 p-1.5 rounded overflow-hidden shrink-0 relative group">
                                                {method.qr_image ? (
                                                    <img src={method.qr_image} alt={`${method.method_name} QR`} className="w-full h-full object-contain" />
                                                ) : (
                                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 text-[10px]">
                                                        <ImageIcon className="h-6 w-6 mb-1 text-gray-500" />
                                                        <span>No QR Image</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Account Details */}
                                            <div className="flex-grow flex flex-col justify-between">
                                                <div className="space-y-1.5 text-xs">
                                                    <div className="flex items-center space-x-2">
                                                        <h3 className="font-playfair text-lg font-bold text-gray-950 dark:text-white leading-tight">{method.method_name}</h3>
                                                        {method.is_deleted ? (
                                                            <span className="bg-red-950/20 text-red-500 border border-red-500/20 px-2 py-0.5 rounded text-[8px] uppercase font-bold tracking-wider">Deleted</span>
                                                        ) : (
                                                            <span className={`px-2 py-0.5 text-[8px] font-bold rounded uppercase tracking-wider ${method.is_active ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                                {method.is_active ? 'Active' : 'Inactive'}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-gray-500 dark:text-gray-400">Holder: <b>{method.account_name}</b></p>
                                                    <p className="text-gray-500 dark:text-gray-400">Number: <b>{method.account_number}</b></p>
                                                    {method.instructions && <p className="text-gray-400 italic text-[11px] leading-snug font-light mt-1">Instructions: {method.instructions}</p>}
                                                </div>

                                                {!method.is_deleted && (
                                                    <div className="flex space-x-2 pt-3 border-t border-gray-100 dark:border-gray-800 mt-3">
                                                        <button
                                                            onClick={() => {
                                                                setEditingPayMethod(method);
                                                                setPayMethodForm({
                                                                    method_name: method.method_name,
                                                                    account_name: method.account_name,
                                                                    account_number: method.account_number,
                                                                    instructions: method.instructions || '',
                                                                    is_active: method.is_active
                                                                });
                                                                setPayMethodQRFile(null);
                                                                setIsPayMethodModalOpen(true);
                                                            }}
                                                            className="text-primary hover:underline font-bold text-[10px] uppercase tracking-wider"
                                                        >
                                                            Configure / Edit
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                if (window.confirm(`Delete payment method "${method.method_name}"?`)) {
                                                                    deletePaymentMethodMutation.mutate(method.id);
                                                                }
                                                            }}
                                                            className="text-red-500 hover:underline font-bold text-[10px] uppercase tracking-wider"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Payment Method Modal */}
                            {isPayMethodModalOpen && (
                                <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
                                    <div className="bg-white dark:bg-charcoal p-6 rounded-lg max-w-md w-full border border-gray-200 dark:border-gray-800 space-y-4">
                                        <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-gray-800">
                                            <h3 className="font-playfair text-xl font-bold">{editingPayMethod ? 'Configure Account/QR' : 'Add Payment Option'}</h3>
                                            <button onClick={() => setIsPayMethodModalOpen(false)}><X className="h-6 w-6 text-gray-400" /></button>
                                        </div>
                                        <form onSubmit={(e) => {
                                            e.preventDefault();
                                            const fd = new FormData();
                                            fd.append('method_name', payMethodForm.method_name);
                                            fd.append('account_name', payMethodForm.account_name);
                                            fd.append('account_number', payMethodForm.account_number);
                                            fd.append('instructions', payMethodForm.instructions);
                                            fd.append('is_active', String(payMethodForm.is_active));
                                            if (payMethodQRFile) fd.append('qr_image', payMethodQRFile);
                                            savePaymentMethodMutation.mutate({ id: editingPayMethod?.id, payload: fd });
                                        }} className="space-y-4 text-xs">
                                            <div className="space-y-1">
                                                <label className="text-gray-500 font-semibold block uppercase">Payment Method Name</label>
                                                <input
                                                    type="text" required
                                                    value={payMethodForm.method_name}
                                                    onChange={(e) => setPayMethodForm({...payMethodForm, method_name: e.target.value})}
                                                    placeholder="eSewa Transfer, Bank Transfer, Khalti"
                                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-charcoal border border-gray-200 dark:border-gray-800 rounded text-sm text-gray-900 dark:text-white"
                                                />
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <label className="text-gray-500 font-semibold block uppercase">Account Name</label>
                                                    <input
                                                        type="text" required
                                                        value={payMethodForm.account_name}
                                                        onChange={(e) => setPayMethodForm({...payMethodForm, account_name: e.target.value})}
                                                        placeholder="REGAL RIVULET HOTEL"
                                                        className="w-full px-3 py-2 bg-gray-50 dark:bg-charcoal border border-gray-200 dark:border-gray-800 rounded text-sm text-gray-900 dark:text-white"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-gray-500 font-semibold block uppercase">Account / Mobile Number</label>
                                                    <input
                                                        type="text" required
                                                        value={payMethodForm.account_number}
                                                        onChange={(e) => setPayMethodForm({...payMethodForm, account_number: e.target.value})}
                                                        placeholder="9841234567"
                                                        className="w-full px-3 py-2 bg-gray-50 dark:bg-charcoal border border-gray-200 dark:border-gray-800 rounded text-sm text-gray-900 dark:text-white"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-gray-500 font-semibold block uppercase">Upload QR Image Code</label>
                                                <input
                                                    type="file"
                                                    onChange={(e) => {
                                                        if (e.target.files && e.target.files[0]) setPayMethodQRFile(e.target.files[0]);
                                                    }}
                                                    className="w-full text-xs"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-gray-500 font-semibold block uppercase">Payment Instructions</label>
                                                <textarea
                                                    rows={3}
                                                    value={payMethodForm.instructions}
                                                    onChange={(e) => setPayMethodForm({...payMethodForm, instructions: e.target.value})}
                                                    placeholder="Specify the terms or references needed..."
                                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-charcoal border border-gray-200 dark:border-gray-800 rounded text-sm text-gray-900 dark:text-white font-light"
                                                />
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    id="method-active"
                                                    checked={payMethodForm.is_active}
                                                    onChange={(e) => setPayMethodForm({...payMethodForm, is_active: e.target.checked})}
                                                    className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                                                />
                                                <label htmlFor="method-active" className="text-gray-500 font-semibold uppercase">Active payment option</label>
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={savePaymentMethodMutation.isPending}
                                                className="w-full bg-primary hover:bg-primary-dark text-charcoal font-bold uppercase text-xs tracking-wider py-3 rounded transition-all mt-4"
                                            >
                                                {savePaymentMethodMutation.isPending ? 'Saving...' : 'Save Configuration'}
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Contact messages tab */}
                    {activeTab === 'MESSAGES' && (
                        <div className="space-y-6">
                            <h2 className="font-playfair text-3xl font-bold">Feedback & Support Contacts</h2>

                            {loadingMessages && <div className="text-center py-20 text-gray-400 animate-pulse">Retrieving messages list...</div>}

                            {!loadingMessages && contactMessages && contactMessages.length === 0 && (
                                <div className="text-center py-20 bg-white dark:bg-charcoal border border-gray-100 dark:border-gray-800 rounded text-gray-400 font-light">
                                    No support messages or feedback has been submitted yet.
                                </div>
                            )}

                            {!loadingMessages && contactMessages && contactMessages.length > 0 && (
                                <div className="bg-white dark:bg-charcoal rounded-lg border border-gray-150 dark:border-gray-800 overflow-x-auto shadow">
                                    <table className="w-full text-left text-sm font-light">
                                        <thead className="bg-gray-50 dark:bg-charcoal-light border-b border-gray-100 dark:border-gray-800 text-xs font-bold uppercase tracking-wider text-gray-500">
                                            <tr>
                                                <th className="px-6 py-4">Sender</th>
                                                <th className="px-6 py-4">Subject</th>
                                                <th className="px-6 py-4">Phone</th>
                                                <th className="px-6 py-4">Date</th>
                                                <th className="px-6 py-4 text-center">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                            {contactMessages.map((msg: any) => (
                                                <tr key={msg.id} className="hover:bg-gray-50 dark:hover:bg-charcoal-light/30 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="font-semibold text-gray-900 dark:text-white">{msg.name}</div>
                                                        <div className="text-[10px] text-gray-400 -mt-0.5">{msg.email}</div>
                                                    </td>
                                                    <td className="px-6 py-4 font-medium">{msg.subject}</td>
                                                    <td className="px-6 py-4">{msg.phone || '-'}</td>
                                                    <td className="px-6 py-4 text-xs">{new Date(msg.created_at).toLocaleString()}</td>
                                                    <td className="px-6 py-4 text-center space-x-3">
                                                        <button
                                                            onClick={() => setSelectedMessage(msg)}
                                                            className="text-primary hover:underline text-xs font-bold uppercase"
                                                        >
                                                            Read
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                if (window.confirm(`Delete message from ${msg.name}?`)) {
                                                                    deleteMessageMutation.mutate(msg.id);
                                                                }
                                                            }}
                                                            className="text-red-500 hover:text-red-650"
                                                            title="Delete Message"
                                                        >
                                                            <Trash2 className="h-4.5 w-4.5 inline" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Message detail modal */}
                            {selectedMessage && (
                                <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
                                    <div className="bg-white dark:bg-charcoal p-8 rounded-lg max-w-lg w-full border border-gray-200 dark:border-gray-800 space-y-6">
                                        <div className="flex justify-between items-start pb-3 border-b border-gray-100 dark:border-gray-800">
                                            <div>
                                                <span className="text-[10px] text-primary font-bold uppercase tracking-wider">Message Details</span>
                                                <h3 className="font-playfair text-2xl font-bold mt-1">{selectedMessage.subject}</h3>
                                            </div>
                                            <button onClick={() => setSelectedMessage(null)}><X className="h-6 w-6 text-gray-400" /></button>
                                        </div>
                                        <div className="space-y-4 text-xs font-light">
                                            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-charcoal-light rounded border border-gray-100 dark:border-gray-850">
                                                <div>
                                                    <span className="text-[10px] text-gray-400 uppercase font-semibold">From</span>
                                                    <p className="font-bold text-gray-900 dark:text-white mt-0.5">{selectedMessage.name}</p>
                                                    <p className="text-[10px] text-gray-500 dark:text-gray-400">{selectedMessage.email}</p>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] text-gray-400 uppercase font-semibold">Contact Info</span>
                                                    <p className="font-bold text-gray-900 dark:text-white mt-0.5">{selectedMessage.phone || 'No phone provided'}</p>
                                                    <p className="text-[10px] text-gray-500 dark:text-gray-400">{new Date(selectedMessage.created_at).toLocaleString()}</p>
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-[10px] text-gray-400 uppercase font-semibold">Message Body</span>
                                                <div className="bg-gray-50 dark:bg-charcoal-light/60 p-5 rounded border border-gray-100 dark:border-gray-850 text-sm leading-relaxed text-gray-800 dark:text-gray-200 whitespace-pre-wrap font-sans font-light">
                                                    {selectedMessage.message}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex justify-end pt-3 border-t border-gray-100 dark:border-gray-800">
                                            <button
                                                onClick={() => setSelectedMessage(null)}
                                                className="bg-primary hover:bg-primary-dark text-charcoal font-bold uppercase text-xs tracking-wider px-5 py-2.5 rounded transition-all shadow"
                                            >
                                                Close
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* CMS Detail Panel */}
                    {activeTab === 'CMS' && (
                        <div className="space-y-8">
                            <h2 className="font-playfair text-3xl font-bold mb-8">Dynamic Content Management</h2>
                            <CMSPanel />
                        </div>
                    )}

                    {/* Vacancies management tab */}
                    {activeTab === 'VACANCIES' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h2 className="font-playfair text-3xl font-bold">Vacancy Operations</h2>
                                <button
                                    onClick={() => {
                                        setEditingVacancy(null);
                                        setVacancyForm({
                                            job_title: '',
                                            department: '',
                                            location: '',
                                            employment_type: 'FULL_TIME',
                                            vacancies_count: '1',
                                            salary: '',
                                            description: '',
                                            requirements: '',
                                            benefits: '',
                                            deadline: '',
                                            status: 'OPEN',
                                            published: false
                                        });
                                        setVacancyAttachmentFile(null);
                                        setIsVacancyModalOpen(true);
                                    }}
                                    className="bg-primary hover:bg-primary-dark text-charcoal font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded shadow flex items-center space-x-1"
                                >
                                    <Plus className="h-4 w-4" /> <span>Add New Vacancy</span>
                                </button>
                            </div>

                            {loadingVacancies && <div className="text-center py-20 text-gray-400 animate-pulse">Loading vacancies...</div>}

                            {!loadingVacancies && vacancies && vacancies.length === 0 && (
                                <div className="text-center py-20 bg-white dark:bg-charcoal border border-gray-100 dark:border-gray-800 rounded text-gray-400 font-light">
                                    No vacancies found in the system. Use "Add New Vacancy" to create one.
                                </div>
                            )}

                            {!loadingVacancies && vacancies && vacancies.length > 0 && (
                                <div className="bg-white dark:bg-charcoal rounded-lg border border-gray-150 dark:border-gray-800 overflow-x-auto shadow text-xs">
                                    <table className="w-full text-left font-light">
                                        <thead className="bg-gray-50 dark:bg-charcoal-light border-b border-gray-100 dark:border-gray-800 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                                            <tr>
                                                <th className="px-6 py-4">Job Title</th>
                                                <th className="px-6 py-4">Department</th>
                                                <th className="px-6 py-4">Type</th>
                                                <th className="px-6 py-4">Deadline</th>
                                                <th className="px-6 py-4">Status</th>
                                                <th className="px-6 py-4">Published</th>
                                                <th className="px-6 py-4 text-center">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                            {vacancies.map((vac: any) => (
                                                <tr key={vac.id} className="hover:bg-gray-50 dark:hover:bg-charcoal-light/30 transition-colors">
                                                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{vac.job_title}</td>
                                                    <td className="px-6 py-4">{vac.department}</td>
                                                    <td className="px-6 py-4">{vac.employment_type}</td>
                                                    <td className="px-6 py-4">{vac.deadline}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${vac.status === 'OPEN' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                            {vac.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${vac.published ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                            {vac.published ? 'Yes' : 'No'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center space-x-3">
                                                        <button
                                                            onClick={() => handleVacancyEditClick(vac)}
                                                            className="text-primary hover:underline text-[10px] font-bold uppercase"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                if (window.confirm(`Are you sure you want to delete vacancy "${vac.job_title}"?`)) {
                                                                    deleteVacancyMutation.mutate(vac.id);
                                                                }
                                                            }}
                                                            className="text-red-550 hover:text-red-650"
                                                        >
                                                            <Trash2 className="h-4.5 w-4.5 inline" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Create / Edit Vacancy Modal */}
                            {isVacancyModalOpen && (
                                <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 overflow-y-auto">
                                    <div className="bg-white dark:bg-charcoal p-8 rounded-lg max-w-2xl w-full border border-gray-200 dark:border-gray-800 space-y-6 max-h-[90vh] overflow-y-auto">
                                        <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-gray-800">
                                            <h3 className="font-playfair text-2xl font-bold">{editingVacancy ? 'Modify Vacancy details' : 'Add New Vacancy'}</h3>
                                            <button onClick={() => setIsVacancyModalOpen(false)}><X className="h-6 w-6 text-gray-400" /></button>
                                        </div>

                                        <form onSubmit={handleVacancyFormSubmit} className="space-y-4 text-xs">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <label className="text-gray-500 font-semibold block uppercase">Job Title</label>
                                                    <input
                                                        type="text" required
                                                        value={vacancyForm.job_title}
                                                        onChange={(e) => setVacancyForm({...vacancyForm, job_title: e.target.value})}
                                                        placeholder="Hotel Manager"
                                                        className="w-full px-3 py-2 bg-gray-50 dark:bg-charcoal border border-gray-200 dark:border-gray-800 rounded text-sm text-gray-900 dark:text-white"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-gray-500 font-semibold block uppercase">Department</label>
                                                    <input
                                                        type="text" required
                                                        value={vacancyForm.department}
                                                        onChange={(e) => setVacancyForm({...vacancyForm, department: e.target.value})}
                                                        placeholder="Front Office"
                                                        className="w-full px-3 py-2 bg-gray-50 dark:bg-charcoal border border-gray-200 dark:border-gray-800 rounded text-sm text-gray-900 dark:text-white"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                <div className="space-y-1">
                                                    <label className="text-gray-500 font-semibold block uppercase">Location</label>
                                                    <input
                                                        type="text" required
                                                        value={vacancyForm.location}
                                                        onChange={(e) => setVacancyForm({...vacancyForm, location: e.target.value})}
                                                        placeholder="Singapore"
                                                        className="w-full px-3 py-2 bg-gray-50 dark:bg-charcoal border border-gray-200 dark:border-gray-800 rounded text-sm text-gray-900 dark:text-white"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-gray-500 font-semibold block uppercase">Employment Type</label>
                                                    <select
                                                        value={vacancyForm.employment_type}
                                                        onChange={(e) => setVacancyForm({...vacancyForm, employment_type: e.target.value})}
                                                        className="w-full px-3 py-2 bg-gray-50 dark:bg-charcoal border border-gray-200 dark:border-gray-800 rounded text-sm text-gray-900 dark:text-white"
                                                    >
                                                        <option value="FULL_TIME">Full Time</option>
                                                        <option value="PART_TIME">Part Time</option>
                                                        <option value="CONTRACT">Contract</option>
                                                        <option value="INTERN">Intern</option>
                                                        <option value="REMOTE">Remote</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-gray-500 font-semibold block uppercase">Vacancies Count</label>
                                                    <input
                                                        type="number" required
                                                        value={vacancyForm.vacancies_count}
                                                        onChange={(e) => setVacancyForm({...vacancyForm, vacancies_count: e.target.value})}
                                                        className="w-full px-3 py-2 bg-gray-50 dark:bg-charcoal border border-gray-200 dark:border-gray-800 rounded text-sm text-gray-900 dark:text-white"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <label className="text-gray-500 font-semibold block uppercase">Salary (Optional)</label>
                                                    <input
                                                        type="text"
                                                        value={vacancyForm.salary}
                                                        onChange={(e) => setVacancyForm({...vacancyForm, salary: e.target.value})}
                                                        placeholder="$4,000 - $6,000"
                                                        className="w-full px-3 py-2 bg-gray-50 dark:bg-charcoal border border-gray-200 dark:border-gray-800 rounded text-sm text-gray-900 dark:text-white"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-gray-500 font-semibold block uppercase">Deadline</label>
                                                    <input
                                                        type="date" required
                                                        value={vacancyForm.deadline}
                                                        onChange={(e) => setVacancyForm({...vacancyForm, deadline: e.target.value})}
                                                        className="w-full px-3 py-2 bg-gray-50 dark:bg-charcoal border border-gray-200 dark:border-gray-800 rounded text-sm text-gray-900 dark:text-white"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <label className="text-gray-500 font-semibold block uppercase">Operational Status</label>
                                                    <select
                                                        value={vacancyForm.status}
                                                        onChange={(e) => setVacancyForm({...vacancyForm, status: e.target.value})}
                                                        className="w-full px-3 py-2 bg-gray-50 dark:bg-charcoal border border-gray-200 dark:border-gray-800 rounded text-sm text-gray-900 dark:text-white"
                                                    >
                                                        <option value="OPEN">Open</option>
                                                        <option value="CLOSED">Closed</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-gray-500 font-semibold block uppercase">Attachment (optional)</label>
                                                    <input
                                                        type="file"
                                                        onChange={(e) => {
                                                            if (e.target.files && e.target.files[0]) {
                                                                setVacancyAttachmentFile(e.target.files[0]);
                                                            }
                                                        }}
                                                        className="w-full text-sm"
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-2 py-2">
                                                <input
                                                    type="checkbox"
                                                    id="published-toggle"
                                                    checked={vacancyForm.published}
                                                    onChange={(e) => setVacancyForm({...vacancyForm, published: e.target.checked})}
                                                    className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                                                />
                                                <label htmlFor="published-toggle" className="text-gray-500 font-semibold uppercase">Published (visible on catalog & trigger popup)</label>
                                            </div>

                                            <div className="space-y-1">
                                                <label className="text-gray-500 font-semibold block uppercase">Job Description</label>
                                                <textarea
                                                    rows={4} required
                                                    value={vacancyForm.description}
                                                    onChange={(e) => setVacancyForm({...vacancyForm, description: e.target.value})}
                                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-charcoal border border-gray-200 dark:border-gray-800 rounded text-sm text-gray-900 dark:text-white font-light"
                                                    placeholder="Detail the role, tasks, daily operations..."
                                                />
                                            </div>

                                            <div className="space-y-1">
                                                <label className="text-gray-500 font-semibold block uppercase">Requirements</label>
                                                <textarea
                                                    rows={4} required
                                                    value={vacancyForm.requirements}
                                                    onChange={(e) => setVacancyForm({...vacancyForm, requirements: e.target.value})}
                                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-charcoal border border-gray-200 dark:border-gray-800 rounded text-sm text-gray-900 dark:text-white font-light"
                                                    placeholder="Specify experience, education, skills..."
                                                />
                                            </div>

                                            <div className="space-y-1">
                                                <label className="text-gray-500 font-semibold block uppercase">Benefits (Optional)</label>
                                                <textarea
                                                    rows={3}
                                                    value={vacancyForm.benefits}
                                                    onChange={(e) => setVacancyForm({...vacancyForm, benefits: e.target.value})}
                                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-charcoal border border-gray-200 dark:border-gray-800 rounded text-sm text-gray-900 dark:text-white font-light"
                                                    placeholder="Health insurance, vacation details..."
                                                />
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={saveVacancyMutation.isPending}
                                                className="w-full bg-primary hover:bg-primary-dark text-charcoal font-bold uppercase text-xs tracking-wider py-3 rounded transition-all mt-4"
                                            >
                                                {saveVacancyMutation.isPending ? 'Saving...' : 'Save Vacancy Details'}
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
