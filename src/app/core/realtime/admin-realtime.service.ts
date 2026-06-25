import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';

import { environment } from '../../../environments/environment';
import {
  ADMIN_REALTIME_EVENTS,
  AdminRealtimeConnectionStatus,
  AdminRealtimeEventName,
} from './admin-realtime.events';

@Injectable({
  providedIn: 'root',
})
export class AdminRealtimeService {
  private socket: Socket | null = null;

  connect(token: string): void {
    this.disconnect();

    const namespaceUrl = `${environment.wsBaseUrl}/admin`;

    this.socket = io(namespaceUrl, {
      auth: {
        token,
      },
      transports: ['websocket'],
      withCredentials: true,
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    this.socket.connect();
  }

  disconnect(): void {
    if (!this.socket) {
      return;
    }

    this.socket.removeAllListeners();
    this.socket.disconnect();
    this.socket = null;
  }

  joinTripRoom(tripId: string): void {
    this.socket?.emit('admin:trip:join', { tripId });
  }

  leaveTripRoom(tripId: string): void {
    this.socket?.emit('admin:trip:leave', { tripId });
  }

  on<TPayload>(eventName: AdminRealtimeEventName): Observable<TPayload> {
    return new Observable<TPayload>((observer) => {
      const socket = this.socket;

      if (!socket) {
        observer.complete();
        return undefined;
      }

      const handler = (payload: TPayload) => {
        observer.next(payload);
      };

      socket.on(eventName, handler);

      return () => {
        socket.off(eventName, handler);
      };
    });
  }

  connectionStatusChanges(): Observable<AdminRealtimeConnectionStatus> {
    return new Observable<AdminRealtimeConnectionStatus>((observer) => {
      const socket = this.socket;

      if (!socket) {
        observer.next('idle');
        observer.complete();
        return undefined;
      }

      const onConnect = () => observer.next('connected');
      const onDisconnect = () => observer.next('disconnected');
      const onConnectError = () => observer.next('error');

      observer.next(socket.connected ? 'connected' : 'connecting');

      socket.on(ADMIN_REALTIME_EVENTS.CONNECT, onConnect);
      socket.on(ADMIN_REALTIME_EVENTS.DISCONNECT, onDisconnect);
      socket.on(ADMIN_REALTIME_EVENTS.CONNECT_ERROR, onConnectError);

      return () => {
        socket.off(ADMIN_REALTIME_EVENTS.CONNECT, onConnect);
        socket.off(ADMIN_REALTIME_EVENTS.DISCONNECT, onDisconnect);
        socket.off(ADMIN_REALTIME_EVENTS.CONNECT_ERROR, onConnectError);
      };
    });
  }
}
