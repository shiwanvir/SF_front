import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Permission1Guard implements CanActivate {

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if(this.hasPermission(next.data["permission"])){
      //alert(next.data["permission"])
      return true;
    }
    else{
      return false;
    }
  }


  hasPermission(permission){
    return true;
  }

}
