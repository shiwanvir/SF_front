import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { IPermissionGuardModel } from '../model/ipermission-guard.model';
import { PermissionsService } from '../service/permissions.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PermissionGuard implements CanActivate {

  constructor(private _permissionService: PermissionsService,private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        let data = route.data["Permission"] as IPermissionGuardModel;

        if (Array.isArray(data.Only) && Array.isArray(data.Except))
            throw "can't use both 'Only' and 'Except' in route data.";

        if (Array.isArray(data.Only))
        {
            let hasDefined = this._permissionService.hasOneDefined(data.Only,[])
            if (hasDefined)
                return true;

            if(data.RedirectTo == undefined) {
              this.router.navigate(['/shared/error-401']);
            }
            else {
              this.router.navigate([data.RedirectTo]);
            }

            return false;
        }

        if (Array.isArray(data.Except)) {
            let hasDefined = this._permissionService.hasOneDefined(data.Except,[])
            if (!hasDefined)
                return true;

            if (data.RedirectTo && data.RedirectTo !== undefined)
                this.router.navigate([data.RedirectTo]);

            return false;
        }
    }
}
