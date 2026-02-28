import { supabase } from '../lib/supabase';

export const BUCKETS = {
    SUBMISSIONS: 'submissions',
    CERTIFICATES: 'builder_certificates',
    SHOWCASE: 'builder_showcase'
};

/**
 * Check if a Supabase storage bucket exists
 */
export const checkBucketExists = async (bucketName) => {
    try {
        const { data, error } = await supabase.storage.getBucket(bucketName);
        return !error;
    } catch {
        return false;
    }
};

/**
 * Upload file with fallback error handling
 */
export const uploadWithFallback = async ({ bucket, path, file, onError }) => {
    try {
        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(path, file, { upsert: true });

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        if (onError) onError(error);
        return { success: false, error };
    }
};

/**
 * Get user-friendly error message for storage errors
 */
export const handleStorageError = (error, bucket) => {
    const msg = String(error?.message || error);
    if (msg.toLowerCase().includes('bucket') || msg.toLowerCase().includes('not found')) {
        return `Storage bucket "${bucket}" not found. Please contact admin or use the URL field instead.`;
    }
    if (msg.toLowerCase().includes('quota') || msg.toLowerCase().includes('limit')) {
        return `Storage limit reached. Please use the URL field instead of uploading images.`;
    }
    return `Upload failed: ${msg}`;
};
