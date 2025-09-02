// sidebar.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  private _isSidebarOpen = new BehaviorSubject<boolean>(true);
  isSidebarOpen$ = this._isSidebarOpen.asObservable();

  constructor() { }

  toggleSidebar(): void {
    this._isSidebarOpen.next(!this._isSidebarOpen.value);
  }
}