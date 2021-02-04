import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, Event, NavigationStart, NavigationEnd, NavigationError ,ActivationEnd,ChildActivationEnd } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { map, filter, take} from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';

import {SnotifyService , SnotifyPosition} from 'ng-snotify';

declare var $:any;

import { MenuService } from '../core/layout/menu.service';
import { AppConfig } from '../core/app-config';
import { LayoutChangerService } from '../core/service/layout-changer.service';

//import { ArticleListConfig, TagsService, UserService } from '../core';

@Component({
  selector: 'app-home-page',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  constructor(
    private router: Router,
    private activeRrouter: ActivatedRoute,
    private menuService : MenuService,
    private snotifyService: SnotifyService,
    private titleService: Title,
    private http:HttpClient,
    private layoutChangerService : LayoutChangerService
    //private tagsService: TagsService,
  //  private userService: UserService
  ) {}

  isAuthenticated: boolean;
  /*listConfig: ArticleListConfig = {
    type: 'all',
    filters: {}
  };*/
  tags: Array<string> = [];
  tagsLoaded = false;
  aaa : number = 0
  readonly apiUrl = AppConfig.apiUrl()
  pagePathItems : Array<string>

  tosterConfig = { timeout: 2000, showProgressBar: false, closeOnClick: false , position: SnotifyPosition.rightTop,}

  ngOnInit() {

    this.layoutChangerService.pagePath.subscribe((data : any )=> {
      if(data == null || data == false){
        data = []
      }
      else{
        this.pagePathItems = data
      }
    })


    //event will fire when changing route
   this.router.events.subscribe( (event: Event) => {
//console.log(event);
            if (event instanceof ChildActivationEnd) {
            //  this.layoutChangerService.addRecentPage(event.url)
            }

            if (event instanceof NavigationEnd) {
              //console.log(this.activeRrouter.firstChild)
              let currentTitle = this.activeRrouter.firstChild['snapshot']['data']['title']
              this.layoutChangerService.addRecentPage({
                'url' : event.url,
                'title' : currentTitle
              })
            //  this.titleService.setTitle(currentTitle)//set page title
            }

            if (event instanceof NavigationError) {
                // Hide loading indicator
                // Present error to user
                console.log(event.error);
            }
        });

  }


  bookmarkPage(){
    let bookmarkData = {
      url : this.router.url,
      name : this.titleService.getTitle()
    }
    this.http.post(this.apiUrl + 'app/bookmarks', bookmarkData)
    .pipe( map(res => res['data']) )
    .subscribe(
      data => {
        this.snotifyService.success(data.message , this.tosterConfig)
      },
      error => {
        this.snotifyService.error('Process Error' , this.tosterConfig)
      }
    )
     //this.snotifyService.success(this.titleService.getTitle(), this.tosterConfig)
     //this.snotifyService.success(this.router.url, this.tosterConfig)
  // alert(this.router.url)
  }

  // Calculate min height
  /*  containerHeight() {
       var availableHeight = $(window).height() - $('.page-container').offset().top - $('.navbar-fixed-bottom').outerHeight();

       $('.page-container').attr('style', 'min-height:' + availableHeight + 'px');
   }

  setListTo(type: string = '', filters: Object = {}) {
    // If feed is requested but user is not authenticated, redirect to login
    if (type === 'feed' && !this.isAuthenticated) {
      this.router.navigateByUrl('/login');
      return;
    }

    // Otherwise, set the list object
  //  this.listConfig = {type: type, filters: filters};
}*/
}
