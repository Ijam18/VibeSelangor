import { supabase } from './supabase';

const normalizeTags = (tags) => {
    if (Array.isArray(tags)) {
        return tags
            .map((tag) => String(tag).trim())
            .filter(Boolean);
    }

    if (typeof tags === 'string') {
        return tags
            .split(',')
            .map((tag) => tag.trim())
            .filter(Boolean);
    }

    return [];
};

// Resource Service - Helper functions for resource management
export const resourceService = {
    // Fetch all resources
    async getResources(filters = {}) {
        try {
            let query = supabase
                .from('resources')
                .select('*')
                .order('published_at', { ascending: false });

            // Apply filters
            if (filters.category && filters.category !== 'all') {
                query = query.eq('category', filters.category);
            }

            if (filters.difficulty && filters.difficulty !== 'all') {
                query = query.eq('difficulty', filters.difficulty);
            }

            if (filters.search) {
                const search = filters.search.toLowerCase();
                query = query.or(
                    `title.ilike.%${search}%,description.ilike.%${search}%,author.ilike.%${search}%`
                );
            }

            const { data, error } = await query;

            if (error) {
                throw error;
            }

            return data || [];
        } catch (err) {
            console.error('Error fetching resources:', err);
            throw err;
        }
    },

    // Add a new resource
    async addResource(resourceData) {
        try {
            const { data, error } = await supabase
                .from('resources')
                .insert([{
                    ...resourceData,
                    tags: normalizeTags(resourceData.tags),
                    published_at: new Date().toISOString()
                }])
                .select();

            if (error) {
                throw error;
            }

            return data[0];
        } catch (err) {
            console.error('Error adding resource:', err);
            throw err;
        }
    },

    // Update a resource
    async updateResource(id, resourceData) {
        try {
            const payload = {
                ...resourceData
            };

            if (Object.prototype.hasOwnProperty.call(resourceData, 'tags')) {
                payload.tags = normalizeTags(resourceData.tags);
            }

            const { data, error } = await supabase
                .from('resources')
                .update(payload)
                .eq('id', id)
                .select();

            if (error) {
                throw error;
            }

            return data[0];
        } catch (err) {
            console.error('Error updating resource:', err);
            throw err;
        }
    },

    // Delete a resource
    async deleteResource(id) {
        try {
            const { error } = await supabase
                .from('resources')
                .delete()
                .eq('id', id);

            if (error) {
                throw error;
            }

            return true;
        } catch (err) {
            console.error('Error deleting resource:', err);
            throw err;
        }
    },

    // Get featured resources
    async getFeaturedResources() {
        try {
            const { data, error } = await supabase
                .from('resources')
                .select('*')
                .eq('is_featured', true)
                .order('published_at', { ascending: false });

            if (error) {
                throw error;
            }

            return data || [];
        } catch (err) {
            console.error('Error fetching featured resources:', err);
            throw err;
        }
    },

    // Get resources by category
    async getResourcesByCategory(category) {
        try {
            const { data, error } = await supabase
                .from('resources')
                .select('*')
                .eq('category', category)
                .order('published_at', { ascending: false });

            if (error) {
                throw error;
            }

            return data || [];
        } catch (err) {
            console.error('Error fetching resources by category:', err);
            throw err;
        }
    },

    // Get resources by difficulty
    async getResourcesByDifficulty(difficulty) {
        try {
            const { data, error } = await supabase
                .from('resources')
                .select('*')
                .eq('difficulty', difficulty)
                .order('published_at', { ascending: false });

            if (error) {
                throw error;
            }

            return data || [];
        } catch (err) {
            console.error('Error fetching resources by difficulty:', err);
            throw err;
        }
    },

    // Search resources
    async searchResources(searchTerm) {
        try {
            const search = searchTerm.toLowerCase();
            const { data, error } = await supabase
                .from('resources')
                .select('*')
                .or(
                    `title.ilike.%${search}%,description.ilike.%${search}%,author.ilike.%${search}%`
                )
                .order('published_at', { ascending: false });

            if (error) {
                throw error;
            }

            return data || [];
        } catch (err) {
            console.error('Error searching resources:', err);
            throw err;
        }
    },

    // Sort resources
    async sortResources(sortBy = 'newest') {
        try {
            let order = { ascending: false };
            let column = 'published_at';

            switch (sortBy) {
                case 'oldest':
                    order = { ascending: true };
                    break;
                case 'most_viewed':
                    column = 'views';
                    break;
                case 'highest_rated':
                    column = 'rating';
                    break;
                case 'a_z':
                    column = 'title';
                    order = { ascending: true };
                    break;
                case 'z_a':
                    column = 'title';
                    order = { ascending: false };
                    break;
                default:
                    column = 'published_at';
                    order = { ascending: false };
            }

            const { data, error } = await supabase
                .from('resources')
                .select('*')
                .order(column, order);

            if (error) {
                throw error;
            }

            return data || [];
        } catch (err) {
            console.error('Error sorting resources:', err);
            throw err;
        }
    },

    // Subscribe to resource changes
    subscribeToChanges(callback) {
        const channel = supabase
            .channel('resources-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'resources'
                },
                (payload) => {
                    console.log('Resource change detected:', payload);
                    if (callback) {
                        callback(payload);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }
};

export default resourceService;
