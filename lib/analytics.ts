import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

type EventType = 'quiz_start' | 'quiz_complete' | 'referral_click';

/**
 * Track user events for analytics purposes
 * @param eventType The type of event to track
 * @param metadata Additional data to store with the event
 */
export async function trackEvent(eventType: EventType, metadata: Record<string, any> = {}) {
  const supabase = createClientComponentClient();
  
  try {
    // Get current user if authenticated
    const { data: { user } } = await supabase.auth.getUser();
    
    // Insert event into events table
    await supabase.from('events').insert({
      user_id: user?.id || null,
      event_type: eventType,
      metadata,
      created_at: new Date().toISOString(),
    });
    
    console.log(`Event tracked: ${eventType}`);
    return true;
  } catch (error) {
    console.error('Failed to track event:', error);
    return false;
  }
}
