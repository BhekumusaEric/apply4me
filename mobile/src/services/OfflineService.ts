import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../context/AuthContext';

export interface OfflineAction {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  table: string;
  data: any;
  timestamp: number;
  userId: string;
}

export interface CachedData {
  data: any;
  timestamp: number;
  expiresAt: number;
}

export class OfflineService {
  private static instance: OfflineService;
  private isOnline: boolean = true;
  private pendingActions: OfflineAction[] = [];
  private syncInProgress: boolean = false;

  public static getInstance(): OfflineService {
    if (!OfflineService.instance) {
      OfflineService.instance = new OfflineService();
    }
    return OfflineService.instance;
  }

  async initialize(): Promise<void> {
    try {
      // Load pending actions from storage
      await this.loadPendingActions();
      
      // Set up network listener
      this.setupNetworkListener();
      
      // Check initial network state
      const netInfo = await NetInfo.fetch();
      this.isOnline = netInfo.isConnected ?? false;
      
      // Sync if online
      if (this.isOnline) {
        await this.syncPendingActions();
      }
    } catch (error) {
      console.error('Error initializing offline service:', error);
    }
  }

  private setupNetworkListener(): void {
    NetInfo.addEventListener((state) => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected ?? false;
      
      // If we just came back online, sync pending actions
      if (wasOffline && this.isOnline) {
        console.log('Network restored, syncing pending actions...');
        this.syncPendingActions();
      }
    });
  }

  private async loadPendingActions(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('offline_pending_actions');
      if (stored) {
        this.pendingActions = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading pending actions:', error);
      this.pendingActions = [];
    }
  }

  private async savePendingActions(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        'offline_pending_actions',
        JSON.stringify(this.pendingActions)
      );
    } catch (error) {
      console.error('Error saving pending actions:', error);
    }
  }

  async addPendingAction(action: Omit<OfflineAction, 'id' | 'timestamp'>): Promise<void> {
    const pendingAction: OfflineAction = {
      ...action,
      id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    this.pendingActions.push(pendingAction);
    await this.savePendingActions();

    // Try to sync immediately if online
    if (this.isOnline) {
      await this.syncPendingActions();
    }
  }

  async syncPendingActions(): Promise<void> {
    if (this.syncInProgress || !this.isOnline || this.pendingActions.length === 0) {
      return;
    }

    this.syncInProgress = true;
    console.log(`Syncing ${this.pendingActions.length} pending actions...`);

    const successfulActions: string[] = [];

    for (const action of this.pendingActions) {
      try {
        await this.executeAction(action);
        successfulActions.push(action.id);
        console.log(`Successfully synced action: ${action.type} on ${action.table}`);
      } catch (error) {
        console.error(`Failed to sync action ${action.id}:`, error);
        // Keep failed actions for retry
      }
    }

    // Remove successful actions
    this.pendingActions = this.pendingActions.filter(
      action => !successfulActions.includes(action.id)
    );

    await this.savePendingActions();
    this.syncInProgress = false;

    console.log(`Sync completed. ${successfulActions.length} actions synced, ${this.pendingActions.length} remaining.`);
  }

  private async executeAction(action: OfflineAction): Promise<void> {
    const { type, table, data } = action;

    switch (type) {
      case 'CREATE':
        const { error: createError } = await supabase
          .from(table)
          .insert(data);
        if (createError) throw createError;
        break;

      case 'UPDATE':
        const { id, ...updateData } = data;
        const { error: updateError } = await supabase
          .from(table)
          .update(updateData)
          .eq('id', id);
        if (updateError) throw updateError;
        break;

      case 'DELETE':
        const { error: deleteError } = await supabase
          .from(table)
          .delete()
          .eq('id', data.id);
        if (deleteError) throw deleteError;
        break;

      default:
        throw new Error(`Unknown action type: ${type}`);
    }
  }

  // Cache management
  async cacheData(key: string, data: any, ttlMinutes: number = 60): Promise<void> {
    try {
      const cachedData: CachedData = {
        data,
        timestamp: Date.now(),
        expiresAt: Date.now() + (ttlMinutes * 60 * 1000),
      };

      await AsyncStorage.setItem(`cache_${key}`, JSON.stringify(cachedData));
    } catch (error) {
      console.error('Error caching data:', error);
    }
  }

  async getCachedData(key: string): Promise<any | null> {
    try {
      const stored = await AsyncStorage.getItem(`cache_${key}`);
      if (!stored) return null;

      const cachedData: CachedData = JSON.parse(stored);
      
      // Check if data has expired
      if (Date.now() > cachedData.expiresAt) {
        await AsyncStorage.removeItem(`cache_${key}`);
        return null;
      }

      return cachedData.data;
    } catch (error) {
      console.error('Error getting cached data:', error);
      return null;
    }
  }

  async clearCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('cache_'));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  // Offline-aware data fetching
  async fetchWithCache<T>(
    key: string,
    fetchFunction: () => Promise<T>,
    ttlMinutes: number = 60
  ): Promise<T | null> {
    try {
      // Try to get cached data first
      const cachedData = await this.getCachedData(key);
      
      if (this.isOnline) {
        try {
          // Fetch fresh data
          const freshData = await fetchFunction();
          
          // Cache the fresh data
          await this.cacheData(key, freshData, ttlMinutes);
          
          return freshData;
        } catch (error) {
          console.error('Error fetching fresh data, falling back to cache:', error);
          return cachedData;
        }
      } else {
        // Offline: return cached data if available
        return cachedData;
      }
    } catch (error) {
      console.error('Error in fetchWithCache:', error);
      return null;
    }
  }

  // Offline-aware mutations
  async createOfflineAware(
    table: string,
    data: any,
    userId: string
  ): Promise<{ success: boolean; id?: string }> {
    if (this.isOnline) {
      try {
        const { data: result, error } = await supabase
          .from(table)
          .insert(data)
          .select()
          .single();

        if (error) throw error;
        return { success: true, id: result.id };
      } catch (error) {
        console.error('Online create failed, queuing for offline sync:', error);
      }
    }

    // Queue for offline sync
    await this.addPendingAction({
      type: 'CREATE',
      table,
      data,
      userId,
    });

    return { success: true, id: `offline_${Date.now()}` };
  }

  async updateOfflineAware(
    table: string,
    id: string,
    data: any,
    userId: string
  ): Promise<{ success: boolean }> {
    if (this.isOnline) {
      try {
        const { error } = await supabase
          .from(table)
          .update(data)
          .eq('id', id);

        if (error) throw error;
        return { success: true };
      } catch (error) {
        console.error('Online update failed, queuing for offline sync:', error);
      }
    }

    // Queue for offline sync
    await this.addPendingAction({
      type: 'UPDATE',
      table,
      data: { id, ...data },
      userId,
    });

    return { success: true };
  }

  async deleteOfflineAware(
    table: string,
    id: string,
    userId: string
  ): Promise<{ success: boolean }> {
    if (this.isOnline) {
      try {
        const { error } = await supabase
          .from(table)
          .delete()
          .eq('id', id);

        if (error) throw error;
        return { success: true };
      } catch (error) {
        console.error('Online delete failed, queuing for offline sync:', error);
      }
    }

    // Queue for offline sync
    await this.addPendingAction({
      type: 'DELETE',
      table,
      data: { id },
      userId,
    });

    return { success: true };
  }

  isConnected(): boolean {
    return this.isOnline;
  }

  getPendingActionsCount(): number {
    return this.pendingActions.length;
  }

  async forcSync(): Promise<void> {
    if (this.isOnline) {
      await this.syncPendingActions();
    }
  }
}

export const offlineService = OfflineService.getInstance();
