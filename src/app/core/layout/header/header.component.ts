import { Component, OnInit, HostListener
 } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';


import { AuthService } from '../../service/auth.service';
import { PermissionsService } from '../../service/permissions.service';
import { AppConfig } from '../../app-config';
import { AppAlert } from '../../class/app-alert';
import { LayoutChangerService } from '../../service/layout-changer.service';
//import { MenuService } from '../menu.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html'/*,
  styleUrls: ['./header.component.css']*/
})
export class HeaderComponent implements OnInit {

  locations$ : Observable<Array<any>>
  readonly apiUrl = AppConfig.apiUrl()
  display_name : string = ''
  bookmarks$ : Observable<Array<any>>
  currentUserLocation : string = null //show current location in header section

  recentPages = []
  //collapsButtonStatus:boolean = false
  //hideButtonStatus:boolean = false

  constructor(private authService:AuthService , private router:Router,private http:HttpClient, private permissionService : PermissionsService,
    private layoutChangerService : LayoutChangerService) { }

  ngOnInit() {

    this.loadLocations();
    this.loadBookmarks()
    this.display_name = this.authService.getUserData().first_name

    this.layoutChangerService.recentPages$.subscribe(res => {
      //console.log(res)
      this.recentPages = res
    })

  }

  logout(){
  //  this.menuService.leftMenus = null
    this.http.post(this.apiUrl + 'auth/logout', {})
    .subscribe(res => {
        //console.log('logout successfully')
        this.authService.deleteToken();
        this.permissionService.clearStore()
        this.permissionService.removePermissionsFromLocalStorage()
        this.layoutChangerService.headerButtonClick(false)
        this.router.navigate(['/login']);
      },
    error => {
      console.log(error)
    })
  }

  loadLocations(){
    this.locations$ = this.http.get<Array<any>>(this.apiUrl + 'admin/users/user-assigned-locations')
    .pipe(
      map(res => res['data']),
      tap(res => { //tap operator is use to view current location after login first time
        if(this.currentUserLocation == null){
          let loc_id = this.authService.getUserData().location
          for(let x = 0 ; x < res.length ; x++){
            if(loc_id == res[x]['loc_id']){
              this.currentUserLocation = res[x]['loc_name']
              break
            }
          }
        }
      })
    )
  }

  collapseMenu(){
    document.body.classList.toggle("sidebar-xs");
    document.getElementById('global_search').classList.toggle('global-search-display')
    //this.collapsButtonStatus = !this.collapsButtonStatus
    //if(this.collapsButtonStatus){
      this.layoutChangerService.headerButtonClick()
    //}
  }

  hideMenu(){
    document.body.classList.toggle('sidebar-main-hidden')
    //this.hideButtonStatus = !this.hideButtonStatus
    //if(this.hideButtonStatus){
      this.layoutChangerService.headerButtonClick()
  //  }
  }

  openFullscreen(){

    const elem = document.documentElement as HTMLElement & {
    mozRequestFullScreen(): Promise<void>;
    webkitRequestFullscreen(): Promise<void>;
    msRequestFullscreen(): Promise<void>;
  };

    //var elem = document.documentElement;

    if (elem.requestFullscreen) {
          elem.requestFullscreen();
        } else if (elem.mozRequestFullScreen) { /* Firefox */
          elem.mozRequestFullScreen();
        } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
          elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) { /* IE/Edge */
          elem.msRequestFullscreen();
        }


  }

  changeLocation(loc_id, loc_name){
    AppAlert.showConfirm({
      'text' : 'Do you want to change your location to ' + loc_name + ' ?'
    },
    (result) => {
      if (result.value) {
        AppAlert.showMessage('Processing', 'Location changing...')

        this.currentUserLocation = loc_name;
        this.http.post(this.apiUrl + 'auth/refresh', {loc_id : loc_id})
        .subscribe(data => {
          //console.log(data)
          //debugger
          this.authService.storeUserData(data['user'])
          this.authService.storeToken(data['access_token'])
          setTimeout(function(){
              AppAlert.closeAlert()
              window.location.reload()
          }, 3000)
          //this.router.navigate(['/home/dashboard']);
        })
      }
    })
  }

  loadBookmarks(){
    this.bookmarks$ = this.http.get<Array<any>>(this.apiUrl + 'app/bookmarks')
    .pipe( map(res => res['data']) )
  }

  @HostListener('window:storage', ['$event'])
    onStorageChange(ev: StorageEvent) {
    AppAlert.showMessage('<span style="color:red">Session Data Changed :(</span>','Your session data has been changed. You need to refresh the page.')
    //   console.log(ev.key);
    //   console.log(ev.newValue);
    }


}
