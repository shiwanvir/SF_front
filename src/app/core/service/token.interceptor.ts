import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor ,HttpResponse ,HttpErrorResponse,HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable,BehaviorSubject } from 'rxjs';
import { tap,delay,switchMap,catchError,finalize,filter,take } from 'rxjs/operators';
import { Router } from '@angular/router';

//import { AppConfig } from '../app-config';
import { AppAlert } from '../class/app-alert';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  //readonly apiUrl = AppConfig.apiUrl()

  constructor(public auth: AuthService , private router:Router,private http:HttpClient) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    //console.log(request)
    request = request.clone({
      setHeaders: {
        Authorization: `Bearer ${this.auth.getToken()}`
      }
      /*setParams : {
        token : this.auth.getToken()
      }*/
    });

    return next.handle(request)
    .pipe(tap(
      (event: HttpEvent<any>) => {
      if (event instanceof HttpResponse) {
        //console.log(event)
        // do stuff with response if you want
      }
    } ,
    (err: any) => {
      if (err instanceof HttpErrorResponse) {
        if (err.status === 401 && !request.url.includes('auth/login'))/*this.auth.isLogedIn()*/ {
          AppAlert.showConfirm({
            'text' : 'Your session was expired or provide invalid token. Do you need to login?'
          },(result) => {
            if (result.value) {
              this.auth.deleteToken();
              this.router.navigate(['/login']);
            }
          })
        }
        else if (err.status === 403)/*this.auth.isLogedIn()*/ {
          AppAlert.showError({ title : 'Access Denied', text : "You don't have permissions to access this functionality"})
        }
      //  return throwError(err);
      }
    }
    ));

  }


}
