import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { AppConfig } from '../../core/app-config';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {

  constructor(private http:HttpClient) { }

  getPermissions(requiredPermissions : Array<string>){
    return this.http.post(AppConfig.apiUrl() + 'app/required-permissions', { permissions : requiredPermissions } )
  }

}
