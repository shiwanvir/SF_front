import { Injectable } from '@angular/core';

import { JwtHelperService } from '@auth0/angular-jwt';
import { HttpClient } from '@angular/common/http';

import { AppConfig } from '../../core/app-config';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  jwtPlugin : JwtHelperService = null;
  apiUrl = AppConfig.apiUrl()

  constructor(private http:HttpClient) {
      this.jwtPlugin = new JwtHelperService();
  }


  getPermissions(permission_category : string){
    return this.http.get(this.apiUrl + 'app/permissions?type=module_permission&permission_category=' + permission_category)
  }


  storeToken(token){
    localStorage.setItem('token' , token)
  }

  getToken(){
    return localStorage.getItem('token')
  }

  deleteToken(){
    localStorage.removeItem('token')
    this.deleteUserData()
  }

  storeUserData(data){
    localStorage.setItem('first_name' , data.first_name)
    localStorage.setItem('location' , data.location)
    localStorage.setItem('d2d_epf' , data.d2d_epf)
  }

  getUserData(){
    return {
      'first_name' : localStorage.getItem('first_name'),
      'location' : localStorage.getItem('location'),
      'd2d_epf' : localStorage.getItem('d2d_epf')
    }
  }

  deleteUserData(){
    localStorage.removeItem('first_name')
    localStorage.removeItem('location')
    localStorage.removeItem('d2d_epf')
  }

  getDecodeToken(){
    return this.jwtPlugin.decodeToken(this.getToken());
  }

  getTokenExpirationDate(){
    return this.jwtPlugin.getTokenExpirationDate(this.getToken());
  }


  isTokenExpired(){
    return this.jwtPlugin.isTokenExpired(this.getToken());
  }
  /*getTokenExpirationDate(token: string): Date {
    const decoded = jwt_decode(token);

    if (decoded.exp === undefined) return null;

    const date = new Date(0);
    date.setUTCSeconds(decoded.exp);
    return date;
  }*/


  isValidToken(){
    const token = this.getToken();
    if(token){
      return true;
    }
    else{
      return false;
    }
  }

  isLogedIn(){
    const token = this.getToken();
    if(token){
      if(this.isTokenExpired()){
        this.deleteToken()
        return false
      }
      else{
        return true;
      }
    }
    else{
      return false;
    }
  }

  needToRefresh(){
    let exDate = this.getTokenExpirationDate().getTime()
    let curDate = new Date().getTime()
    let hour = 3*60*1000;
    if((exDate - curDate) <= hour){
      return true
    }
    else{
      return false
    }
  }

}
