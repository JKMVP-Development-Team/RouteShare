import { useEffect, useState } from 'react';
import { NavigationUpdate } from '../constants/route';
import { NavigationService } from '../services/navigation';

export function useNavigationUpdates(routeId: string) {
  const [updates, setUpdates] = useState<NavigationUpdate[]>([]);
  const [activeNavigators, setActiveNavigators] = useState<NavigationUpdate[]>([]);

  useEffect(() => {
    const unsubscribe = NavigationService.subscribeToNavigationUpdates(
      routeId,
      (newUpdates) => {
        setUpdates(newUpdates);
        
        // Get the latest update for each user (active navigators)
        const latestByUser = newUpdates.reduce((acc, update) => {
          if (!acc[update.userId] || update.timestamp > acc[update.userId].timestamp) {
            acc[update.userId] = update;
          }
          return acc;
        }, {} as Record<string, NavigationUpdate>);
        
        setActiveNavigators(Object.values(latestByUser));
      }
    );

    return unsubscribe;
  }, [routeId]);

  return { updates, activeNavigators };
}