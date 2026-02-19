import { supabase } from './supabase';

// Test Supabase connection
export const testSupabaseConnection = async () => {
    try {
        console.log('Testing Supabase connection...');

        // Test basic connection
        const { data, error } = await supabase.from('resources').select('*').limit(1);

        if (error) {
            console.error('Supabase connection error:', error);
            return false;
        }

        console.log('Supabase connection successful!');
        console.log('Resources data:', data);
        return true;
    } catch (err) {
        console.error('Supabase test failed:', err);
        return false;
    }
};

// Run test on import
testSupabaseConnection();