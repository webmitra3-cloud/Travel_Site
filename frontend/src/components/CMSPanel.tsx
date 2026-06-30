import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Edit } from 'lucide-react';
import api from '../services/api';

const CMSPanel = () => {
    const queryClient = useQueryClient();
    const [subTab, setSubTab] = useState('GALLERY_CATEGORIES');

    const refreshSiteData = () => {
        queryClient.invalidateQueries();
    };

    // -- Queries --
    const { data: categories } = useQuery({ queryKey: ['cms', 'categories'], queryFn: async () => (await api.get('/cms/gallery-categories/')).data });
    const { data: homepageContentList } = useQuery({ queryKey: ['cms', 'homepage'], queryFn: async () => (await api.get('/cms/homepage-content/')).data });
    const { data: amenities } = useQuery({ queryKey: ['cms', 'amenities'], queryFn: async () => (await api.get('/cms/amenities/')).data });
    const { data: testimonials } = useQuery({ queryKey: ['cms', 'testimonials'], queryFn: async () => (await api.get('/cms/testimonials/', { params: { include_deleted: 'true' } })).data });
    const { data: contactInfoList } = useQuery({ queryKey: ['cms', 'contact-info'], queryFn: async () => (await api.get('/cms/contact-info/')).data });
    const { data: aboutContentList } = useQuery({ queryKey: ['cms', 'about'], queryFn: async () => (await api.get('/cms/about-content/')).data });
    const { data: team } = useQuery({ queryKey: ['cms', 'team'], queryFn: async () => (await api.get('/cms/team/')).data });
    const { data: facilities } = useQuery({ queryKey: ['cms', 'facilities'], queryFn: async () => (await api.get('/cms/facilities/')).data });

    // -- Mutations --
    const deleteMutation = useMutation({
        mutationFn: async ({ endpoint, id }: { endpoint: string, id: string | number }) => {
            await api.delete(`/cms/${endpoint}/${id}/`);
        },
        onSuccess: (_, variables) => {
            refreshSiteData();
            alert(`Deleted from ${variables.endpoint}`);
        }
    });

    const createCategoryMutation = useMutation({
        mutationFn: async (name: string) => { await api.post('/cms/gallery-categories/', { name }); },
        onSuccess: () => { refreshSiteData(); alert('Added Category'); }
    });

    const createAmenityMutation = useMutation({
        mutationFn: async (payload: any) => { await api.post('/cms/amenities/', payload); },
        onSuccess: () => { refreshSiteData(); alert('Added Amenity'); }
    });

    const createTestimonialMutation = useMutation({
        mutationFn: async (payload: any) => { await api.post('/cms/testimonials/', payload); },
        onSuccess: () => {
            refreshSiteData();
            alert('Added Testimonial');
        }
    });

    const saveContactInfoMutation = useMutation({
        mutationFn: async ({ payload, id }: { payload: any, id?: string }) => {
            if (id) {
                await api.put(`/cms/contact-info/${id}/`, payload);
            } else {
                await api.post('/cms/contact-info/', payload);
            }
        },
        onSuccess: () => {
            refreshSiteData();
            alert('Saved Contact Information');
        }
    });

    const createTeamMutation = useMutation({
        mutationFn: async (payload: FormData) => { 
            await api.post('/cms/team/', payload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            }); 
        },
        onSuccess: () => { 
            refreshSiteData();
            alert('Added Team Member'); 
        }
    });

    const createFacilityMutation = useMutation({
        mutationFn: async (payload: any) => { await api.post('/cms/facilities/', payload); },
        onSuccess: () => { refreshSiteData(); alert('Added Facility'); }
    });

    const saveHomepageMutation = useMutation({
        mutationFn: async ({ formData, id }: { formData: FormData, id?: string }) => {
            if (id) {
                await api.put(`/cms/homepage-content/${id}/`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await api.post('/cms/homepage-content/', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
        },
        onSuccess: () => { 
            refreshSiteData();
            alert('Saved Homepage Content'); 
        }
    });

    const saveAboutMutation = useMutation({
        mutationFn: async ({ formData, id }: { formData: FormData, id?: string }) => {
            if (id) {
                await api.put(`/cms/about-content/${id}/`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await api.post('/cms/about-content/', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
        },
        onSuccess: () => { 
            refreshSiteData();
            alert('Saved About Content'); 
        }
    });

    return (
        <div className="bg-white dark:bg-charcoal border border-gray-200 dark:border-gray-800 rounded-lg p-6">
            <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-800 pb-4 mb-6 overflow-x-auto">
                {['GALLERY_CATEGORIES', 'HOMEPAGE', 'AMENITIES', 'TESTIMONIALS', 'CONTACT', 'ABOUT', 'TEAM', 'FACILITIES'].map(t => (
                    <button key={t} onClick={() => setSubTab(t)} className={`px-4 py-2 text-xs font-bold uppercase rounded ${subTab === t ? 'bg-primary text-charcoal' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                        {t.replace('_', ' ')}
                    </button>
                ))}
            </div>

            {/* Gallery Categories */}
            {subTab === 'GALLERY_CATEGORIES' && (
                <div className="space-y-4">
                    <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); createCategoryMutation.mutate(fd.get('name') as string); e.currentTarget.reset(); }} className="flex space-x-2">
                        <input type="text" name="name" placeholder="New Category Name (e.g. WEDDINGS)" className="flex-grow p-2 border border-gray-300 dark:border-gray-700 rounded dark:bg-charcoal text-sm" required />
                        <button type="submit" className="bg-primary text-charcoal px-4 py-2 rounded font-bold text-xs uppercase flex items-center"><Plus className="h-4 w-4 mr-1"/> Add</button>
                    </form>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {categories?.map((c: any) => (
                            <div key={c.id} className="p-3 border border-gray-200 dark:border-gray-800 rounded flex justify-between items-center">
                                <span className="font-bold text-sm">{c.name}</span>
                                <button onClick={() => deleteMutation.mutate({ endpoint: 'gallery-categories', id: c.id })} className="text-red-500"><Trash2 className="h-4 w-4"/></button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Homepage */}
            {subTab === 'HOMEPAGE' && (() => {
                const home = homepageContentList?.[0] || {};
                return (
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData();
                        const elements = e.currentTarget.elements;
                        for (let i = 0; i < elements.length; i++) {
                            const el = elements[i] as HTMLInputElement | HTMLTextAreaElement;
                            if (el.name) {
                                if (el.type === 'file') {
                                    const fileEl = el as HTMLInputElement;
                                    if (fileEl.files && fileEl.files[0]) {
                                        formData.append(el.name, fileEl.files[0]);
                                    }
                                } else {
                                    formData.append(el.name, el.value);
                                }
                            }
                        }
                        saveHomepageMutation.mutate({ formData, id: home.id });
                    }} className="space-y-4 text-sm">
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="block mb-1 font-bold">Heritage Title</label><input name="heritage_title" defaultValue={home.heritage_title} className="w-full p-2 border rounded dark:bg-charcoal dark:border-gray-700" /></div>
                            <div><label className="block mb-1 font-bold">Heritage Subtitle</label><input name="heritage_subtitle" defaultValue={home.heritage_subtitle} className="w-full p-2 border rounded dark:bg-charcoal dark:border-gray-700" /></div>
                            <div className="col-span-2"><label className="block mb-1 font-bold">Paragraph 1</label><textarea name="heritage_paragraph_1" defaultValue={home.heritage_paragraph_1} className="w-full p-2 border rounded dark:bg-charcoal dark:border-gray-700" /></div>
                            <div className="col-span-2"><label className="block mb-1 font-bold">Paragraph 2</label><textarea name="heritage_paragraph_2" defaultValue={home.heritage_paragraph_2} className="w-full p-2 border rounded dark:bg-charcoal dark:border-gray-700" /></div>
                            <div><label className="block mb-1 font-bold">Stat 1 Number</label><input name="stat_1_number" defaultValue={home.stat_1_number} className="w-full p-2 border rounded dark:bg-charcoal dark:border-gray-700" /></div>
                            <div><label className="block mb-1 font-bold">Stat 1 Label</label><input name="stat_1_label" defaultValue={home.stat_1_label} className="w-full p-2 border rounded dark:bg-charcoal dark:border-gray-700" /></div>
                            <div><label className="block mb-1 font-bold">Stat 2 Number</label><input name="stat_2_number" defaultValue={home.stat_2_number} className="w-full p-2 border rounded dark:bg-charcoal dark:border-gray-700" /></div>
                            <div><label className="block mb-1 font-bold">Stat 2 Label</label><input name="stat_2_label" defaultValue={home.stat_2_label} className="w-full p-2 border rounded dark:bg-charcoal dark:border-gray-700" /></div>
                            <div>
                                <label className="block mb-1 font-bold">About Image 1</label>
                                <input type="file" name="image_1" className="w-full text-xs" />
                                {home.image_1 && <img src={home.image_1} alt="About 1 preview" className="h-16 mt-2 rounded object-cover" />}
                            </div>
                            <div>
                                <label className="block mb-1 font-bold">About Image 2 (Dining/Spa Style)</label>
                                <input type="file" name="image_2" className="w-full text-xs" />
                                {home.image_2 && <img src={home.image_2} alt="About 2 preview" className="h-16 mt-2 rounded object-cover" />}
                            </div>
                        </div>
                        <button type="submit" className="bg-primary text-charcoal px-4 py-2 rounded font-bold text-xs uppercase">Save Homepage Content</button>
                    </form>
                );
            })()}

            {/* About */}
            {subTab === 'ABOUT' && (() => {
                const about = aboutContentList?.[0] || {};
                return (
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData();
                        const elements = e.currentTarget.elements;
                        for (let i = 0; i < elements.length; i++) {
                            const el = elements[i] as HTMLInputElement | HTMLTextAreaElement;
                            if (el.name) {
                                if (el.type === 'file') {
                                    const fileEl = el as HTMLInputElement;
                                    if (fileEl.files && fileEl.files[0]) {
                                        formData.append(el.name, fileEl.files[0]);
                                    }
                                } else {
                                    formData.append(el.name, el.value);
                                }
                            }
                        }
                        saveAboutMutation.mutate({ formData, id: about.id });
                    }} className="space-y-4 text-sm">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2"><label className="block mb-1 font-bold">Story Title</label><input name="story_title" defaultValue={about.story_title} className="w-full p-2 border rounded dark:bg-charcoal dark:border-gray-700" /></div>
                            <div className="col-span-2"><label className="block mb-1 font-bold">Story Paragraph 1</label><textarea name="story_paragraph_1" defaultValue={about.story_paragraph_1} className="w-full p-2 border rounded dark:bg-charcoal dark:border-gray-700" /></div>
                            <div className="col-span-2"><label className="block mb-1 font-bold">Story Paragraph 2</label><textarea name="story_paragraph_2" defaultValue={about.story_paragraph_2} className="w-full p-2 border rounded dark:bg-charcoal dark:border-gray-700" /></div>
                            <div className="col-span-2"><label className="block mb-1 font-bold">Mission Text</label><textarea name="mission_text" defaultValue={about.mission_text} className="w-full p-2 border rounded dark:bg-charcoal dark:border-gray-700" /></div>
                            <div className="col-span-2"><label className="block mb-1 font-bold">Vision Text</label><textarea name="vision_text" defaultValue={about.vision_text} className="w-full p-2 border rounded dark:bg-charcoal dark:border-gray-700" /></div>
                            <div className="col-span-2">
                                <label className="block mb-1 font-bold">Story Section Image</label>
                                <input type="file" name="story_image" className="w-full text-xs" />
                                {about.story_image && <img src={about.story_image} alt="Story section preview" className="h-24 mt-2 rounded object-cover" />}
                            </div>
                        </div>
                        <button type="submit" className="bg-primary text-charcoal px-4 py-2 rounded font-bold text-xs uppercase mt-4">Save About Content</button>
                    </form>
                );
            })()}

            {/* Amenities */}
            {subTab === 'AMENITIES' && (
                <div className="space-y-4">
                    <form onSubmit={(e) => { e.preventDefault(); const fd = Object.fromEntries(new FormData(e.currentTarget)); createAmenityMutation.mutate(fd); e.currentTarget.reset(); }} className="grid grid-cols-4 gap-2 text-sm">
                        <input name="name" placeholder="Name" className="p-2 border rounded dark:bg-charcoal dark:border-gray-700" required />
                        <input name="description" placeholder="Description" className="p-2 border rounded dark:bg-charcoal dark:border-gray-700" required />
                        <input name="icon_name" placeholder="Icon Name (e.g. Star)" className="p-2 border rounded dark:bg-charcoal dark:border-gray-700" required />
                        <button type="submit" className="bg-primary text-charcoal px-4 py-2 rounded font-bold text-xs uppercase flex justify-center items-center"><Plus className="h-4 w-4 mr-1"/> Add Amenity</button>
                    </form>
                    <div className="space-y-2">
                        {amenities?.map((a: any) => (
                            <div key={a.id} className="p-3 border border-gray-200 dark:border-gray-800 rounded flex justify-between items-center text-sm">
                                <div><strong>{a.name}</strong> - {a.description} <em>({a.icon_name})</em></div>
                                <button onClick={() => deleteMutation.mutate({ endpoint: 'amenities', id: a.id })} className="text-red-500"><Trash2 className="h-4 w-4"/></button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Testimonials */}
            {subTab === 'TESTIMONIALS' && (
                <div className="space-y-4">
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        const fd = Object.fromEntries(new FormData(e.currentTarget));
                        createTestimonialMutation.mutate({
                            customer_name: fd.customer_name,
                            review: fd.review,
                            rating: Number(fd.rating || 5)
                        });
                        e.currentTarget.reset();
                    }} className="grid grid-cols-1 md:grid-cols-5 gap-2 text-sm">
                        <input name="customer_name" placeholder="Guest Name" className="p-2 border rounded dark:bg-charcoal dark:border-gray-700" required />
                        <select name="rating" defaultValue="5" className="p-2 border rounded dark:bg-charcoal dark:border-gray-700">
                            <option value="5">5 Stars</option>
                            <option value="4">4 Stars</option>
                            <option value="3">3 Stars</option>
                            <option value="2">2 Stars</option>
                            <option value="1">1 Star</option>
                        </select>
                        <input name="review" placeholder="Guest review" className="md:col-span-2 p-2 border rounded dark:bg-charcoal dark:border-gray-700" required />
                        <button type="submit" className="bg-primary text-charcoal px-4 py-2 rounded font-bold text-xs uppercase flex justify-center items-center"><Plus className="h-4 w-4 mr-1"/> Add Review</button>
                    </form>
                    <div className="space-y-2">
                        {testimonials?.map((t: any) => (
                            <div key={t.id} className="p-3 border border-gray-200 dark:border-gray-800 rounded flex justify-between items-center text-sm">
                                <div><strong>{t.customer_name}</strong> ({t.rating}/5) - {t.review}</div>
                                <button onClick={() => deleteMutation.mutate({ endpoint: 'testimonials', id: t.id })} className="text-red-500"><Trash2 className="h-4 w-4"/></button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Contact Information */}
            {subTab === 'CONTACT' && (() => {
                const contact = contactInfoList?.[0] || {};
                return (
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        const payload = Object.fromEntries(new FormData(e.currentTarget));
                        saveContactInfoMutation.mutate({ payload, id: contact.id });
                    }} className="space-y-4 text-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label className="block mb-1 font-bold">Address</label><textarea name="address" defaultValue={contact.address} className="w-full p-2 border rounded dark:bg-charcoal dark:border-gray-700" required /></div>
                            <div><label className="block mb-1 font-bold">Google Map Embed URL</label><textarea name="map_url" defaultValue={contact.map_url} className="w-full p-2 border rounded dark:bg-charcoal dark:border-gray-700" /></div>
                            <div><label className="block mb-1 font-bold">Phone</label><input name="phone" defaultValue={contact.phone} className="w-full p-2 border rounded dark:bg-charcoal dark:border-gray-700" required /></div>
                            <div><label className="block mb-1 font-bold">Email</label><input name="email" type="email" defaultValue={contact.email} className="w-full p-2 border rounded dark:bg-charcoal dark:border-gray-700" required /></div>
                        </div>
                        <button type="submit" className="bg-primary text-charcoal px-4 py-2 rounded font-bold text-xs uppercase">Save Contact Information</button>
                    </form>
                );
            })()}

            {/* Team */}
            {subTab === 'TEAM' && (
                <div className="space-y-4">
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData();
                        const elements = e.currentTarget.elements;
                        for (let i = 0; i < elements.length; i++) {
                            const el = elements[i] as HTMLInputElement | HTMLTextAreaElement;
                            if (el.name) {
                                if (el.type === 'file') {
                                    const fileEl = el as HTMLInputElement;
                                    if (fileEl.files && fileEl.files[0]) {
                                        formData.append(el.name, fileEl.files[0]);
                                    }
                                } else {
                                    formData.append(el.name, el.value);
                                }
                            }
                        }
                        createTeamMutation.mutate(formData);
                        e.currentTarget.reset();
                    }} className="grid grid-cols-4 gap-2 text-sm items-end">
                        <div>
                            <label className="block mb-1 font-bold text-xs">Name</label>
                            <input name="name" placeholder="Name" className="w-full p-2 border rounded dark:bg-charcoal dark:border-gray-700" required />
                        </div>
                        <div>
                            <label className="block mb-1 font-bold text-xs">Role</label>
                            <input name="role" placeholder="Role" className="w-full p-2 border rounded dark:bg-charcoal dark:border-gray-700" required />
                        </div>
                        <div>
                            <label className="block mb-1 font-bold text-xs">Bio</label>
                            <input name="bio" placeholder="Bio" className="w-full p-2 border rounded dark:bg-charcoal dark:border-gray-700" required />
                        </div>
                        <div>
                            <label className="block mb-1 font-bold text-xs">Photo Image</label>
                            <input name="image" type="file" className="w-full text-xs" required />
                        </div>
                        <button type="submit" className="bg-primary text-charcoal px-4 py-2 rounded font-bold text-xs uppercase flex justify-center items-center h-10 col-span-4 mt-2">
                            <Plus className="h-4 w-4 mr-1"/> Add Team Member
                        </button>
                    </form>
                    <div className="space-y-2">
                        {team?.map((t: any) => (
                            <div key={t.id} className="p-3 border border-gray-200 dark:border-gray-800 rounded flex justify-between items-center text-sm">
                                <div className="flex items-center space-x-3">
                                    {t.image && <img src={t.image} alt={t.name} className="w-10 h-10 object-cover rounded-full border border-gray-200 dark:border-gray-800" />}
                                    <div><strong>{t.name}</strong> ({t.role}) - {t.bio}</div>
                                </div>
                                <button onClick={() => deleteMutation.mutate({ endpoint: 'team', id: t.id })} className="text-red-500 hover:text-red-650"><Trash2 className="h-4 w-4"/></button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Facilities */}
            {subTab === 'FACILITIES' && (
                <div className="space-y-4">
                    <form onSubmit={(e) => { e.preventDefault(); const fd = Object.fromEntries(new FormData(e.currentTarget)); createFacilityMutation.mutate(fd); e.currentTarget.reset(); }} className="grid grid-cols-4 gap-2 text-sm">
                        <input name="name" placeholder="Name" className="p-2 border rounded dark:bg-charcoal dark:border-gray-700" required />
                        <input name="description" placeholder="Description" className="p-2 border rounded dark:bg-charcoal dark:border-gray-700" required />
                        <input name="icon_name" placeholder="Icon Name" className="p-2 border rounded dark:bg-charcoal dark:border-gray-700" required />
                        <button type="submit" className="bg-primary text-charcoal px-4 py-2 rounded font-bold text-xs uppercase flex justify-center items-center"><Plus className="h-4 w-4 mr-1"/> Add Facility</button>
                    </form>
                    <div className="space-y-2">
                        {facilities?.map((f: any) => (
                            <div key={f.id} className="p-3 border border-gray-200 dark:border-gray-800 rounded flex justify-between items-center text-sm">
                                <div><strong>{f.name}</strong> - {f.description} <em>({f.icon_name})</em></div>
                                <button onClick={() => deleteMutation.mutate({ endpoint: 'facilities', id: f.id })} className="text-red-500"><Trash2 className="h-4 w-4"/></button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CMSPanel;
