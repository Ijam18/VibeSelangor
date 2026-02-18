import { getLevelFromXP } from './gameEngine';

/**
 * Service to handle game-related database updates
 */

export async function awardGameRewards(supabase, userId, vibes, xp) {
    if (!userId) return { success: false, error: 'No user ID provided' };

    try {
        // 1. Get current game state
        const { data, error: fetchError } = await supabase
            .from('builder_game')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();

        if (fetchError) throw fetchError;

        if (data) {
            // Update existing record
            const newVibes = (data.vibes || 0) + vibes;
            const newTotal = (data.total_vibes_earned || 0) + vibes;
            const newXP = (data.xp || 0) + xp;
            const newLevel = getLevelFromXP(newXP);

            const { error: updateError } = await supabase
                .from('builder_game')
                .update({
                    vibes: newVibes,
                    total_vibes_earned: newTotal,
                    xp: newXP,
                    level: newLevel
                })
                .eq('id', data.id);

            if (updateError) throw updateError;
            return { success: true, levelUp: newLevel > data.level };
        } else {
            // Initialize new game state if missing
            const initialXP = xp;
            const initialVibes = vibes;
            const initialLevel = getLevelFromXP(initialXP);

            const { error: insertError } = await supabase
                .from('builder_game')
                .insert([{
                    user_id: userId,
                    vibes: initialVibes,
                    total_vibes_earned: initialVibes,
                    xp: initialXP,
                    level: initialLevel,
                    build_rate: 1,
                    room_items: ['desk_basic'],
                    last_idle_claim: new Date().toISOString()
                }]);

            if (insertError) throw insertError;
            return { success: true, levelUp: initialLevel > 1 };
        }
    } catch (err) {
        console.error('Error in awardGameRewards:', err);
        return { success: false, error: err.message };
    }
}
