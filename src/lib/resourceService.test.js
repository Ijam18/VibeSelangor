// Resource Service Test File
// This file demonstrates how to test the resource service functionality

import { resourceService } from './resourceService';

// Mock Supabase for testing
const mockSupabase = {
    from: jest.fn(() => ({
        select: jest.fn(() => ({
            eq: jest.fn(() => ({
                or: jest.fn(() => ({
                    order: jest.fn(() => ({
                        data: [],
                        error: null
                    }))
                })),
                order: jest.fn(() => ({
                    data: [],
                    error: null
                }))
            })),
            order: jest.fn(() => ({
                data: [],
                error: null
            }))
        })),
        insert: jest.fn(() => ({
            select: jest.fn(() => ({
                data: [{}],
                error: null
            }))
        })),
        update: jest.fn(() => ({
            select: jest.fn(() => ({
                data: [{}],
                error: null
            }))
        })),
        delete: jest.fn(() => ({
            data: [],
            error: null
        }))
    })),
    channel: jest.fn(() => ({
        on: jest.fn(() => ({
            subscribe: jest.fn(() => { })
        })),
        remove: jest.fn(() => { })
    }))
};

// Test functions
export const testResourceService = {
    async testGetResources() {
        console.log('Testing get resources...');
        try {
            const resources = await resourceService.getResources();
            console.log('✓ get resources successful');
            return resources;
        } catch (err) {
            console.error('✗ get resources failed:', err);
            throw err;
        }
    },

    async testAddResource() {
        console.log('Testing add resource...');
        try {
            const newResource = {
                title: 'Test Resource',
                description: 'Test Description',
                url: 'https://example.com',
                category: 'tutorial',
                difficulty: 'beginner',
                duration: '10:00',
                author: 'Test Author'
            };

            const result = await resourceService.addResource(newResource);
            console.log('✓ add resource successful');
            return result;
        } catch (err) {
            console.error('✗ add resource failed:', err);
            throw err;
        }
    },

    async testUpdateResource() {
        console.log('Testing update resource...');
        try {
            const updatedResource = {
                title: 'Updated Test Resource',
                description: 'Updated Description'
            };

            const result = await resourceService.updateResource('test-id', updatedResource);
            console.log('✓ update resource successful');
            return result;
        } catch (err) {
            console.error('✗ update resource failed:', err);
            throw err;
        }
    },

    async testDeleteResource() {
        console.log('Testing delete resource...');
        try {
            const result = await resourceService.deleteResource('test-id');
            console.log('✓ delete resource successful');
            return result;
        } catch (err) {
            console.error('✗ delete resource failed:', err);
            throw err;
        }
    },

    async testGetFeaturedResources() {
        console.log('Testing get featured resources...');
        try {
            const featured = await resourceService.getFeaturedResources();
            console.log('✓ get featured resources successful');
            return featured;
        } catch (err) {
            console.error('✗ get featured resources failed:', err);
            throw err;
        }
    },

    async testSearchResources() {
        console.log('Testing search resources...');
        try {
            const results = await resourceService.searchResources('test');
            console.log('✓ search resources successful');
            return results;
        } catch (err) {
            console.error('✗ search resources failed:', err);
            throw err;
        }
    },

    async testSortResources() {
        console.log('Testing sort resources...');
        try {
            const sorted = await resourceService.sortResources('newest');
            console.log('✓ sort resources successful');
            return sorted;
        } catch (err) {
            console.error('✗ sort resources failed:', err);
            throw err;
        }
    },

    testSubscribeToChanges() {
        console.log('Testing subscribe to changes...');
        try {
            const unsubscribe = resourceService.subscribeToChanges((payload) => {
                console.log('Resource change detected:', payload);
            });
            console.log('✓ subscribe to changes successful');
            return unsubscribe;
        } catch (err) {
            console.error('✗ subscribe to changes failed:', err);
            throw err;
        }
    }
};

// Run all tests
export const runAllTests = async () => {
    console.log('🧪 Running Resource Service Tests...\n');

    try {
        await testResourceService.testGetResources();
        await testResourceService.testAddResource();
        await testResourceService.testUpdateResource();
        await testResourceService.testDeleteResource();
        await testResourceService.testGetFeaturedResources();
        await testResourceService.testSearchResources();
        await testResourceService.testSortResources();
        const unsubscribe = testResourceService.testSubscribeToChanges();

        // Clean up
        if (unsubscribe) {
            unsubscribe();
        }

        console.log('\n🎉 All tests completed successfully!');
        return true;
    } catch (err) {
        console.error('\n❌ Tests failed:', err);
        return false;
    }
};

// Export for use in other files
export default testResourceService;