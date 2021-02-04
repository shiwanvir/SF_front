import { Component, OnInit, ViewChild} from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable /*, Subject*/ } from 'rxjs';
import { map} from 'rxjs/operators';

import { AppConfig } from '../../app-config';
import { MenuService } from '../menu.service';

declare var $:any;

@Component({
  selector: 'app-left-menu',
  templateUrl: './left-menu.component.html',
  styleUrls: ['./left-menu.component.css']
})

export class LeftMenuComponent implements OnInit {

  readonly apiUrl = AppConfig.apiUrl()
  menus$ : Observable<any>
  menus : any = {
    name : "",
    sub_menus :  []
  }

  @ViewChild('recursiveList') questions: any;

  constructor(/*private router: Router*/private menuService : MenuService, private http:HttpClient) { }

  ngOnInit() {
    //debugger
    //  if(this.menuService.leftMenus == null){
    this.load_left_menu()
    //}
    //  else{
    //  this.menus = this.menuService.leftMenus
    //  }
  }

  changeMenu(level, menu_code, e){
    //console.log(level + " " + menu_code)
    this.menuService.menu(level,menu_code)
  }

  menuLevels(){
    return this.menuService.menuLevels
  }


  //load left menu
  load_left_menu() {
    /*  this.menus$ = */this.http.get<any>(this.apiUrl + "app/menus")
    .pipe( map(res => res['data']) )
    .subscribe(data => {
      this.menus = {
        name : "left_menu",
        sub_menus :  data
      }
      //console.log(data)
    })
  }


  searchMenu(e){

    let str = e.target.value;
    // console.log(str);
    // let mmm = this.searchTree(this.menus, str);
    //   console.log(mmm);
    this.getSearchMenus(str);
  }

  getSearchMenus(search){
    this.http.post<any>(this.apiUrl + "app/search_menu", {search:search})
    .pipe( map(res => res['data']) )
    .subscribe(data => {
      this.menus = {
        name : "left_menu",
        sub_menus :  data
      }
      // console.log(data);
      this.menuService.menu(data[0].level, data[0].code);
      this.menuService.menu(data[0].sub_menus[0].level, data[0].sub_menus[0].code);
    });
  }

  /*searchTree(element, matchingTitle){
      let aaa = []

      if(element.sub_menus == null && element.sub_menus.length <= 0) {
        if(element.name == matchingTitle){
             return true
        }
        else{
          return false
        }
      }
      else {

           for(let i = (element.sub_menus.length - 1); i >= 0; i--){
                let result = this.searchTree(element.sub_menus[i], matchingTitle);
                if(result == false){
                  element.sub_menus.splice(i , 1)
                }
           }

           if(element.sub_menus.length <= 0){
             if(element.name == matchingTitle){
                  return true
             }
             else{
               return false
             }
           }

          // return result;
      }
      return element;
 }*/


 /*searchTree(element, matchingTitle){

      element['sub_menus2'] = []
      if(element.sub_menus == null || element.sub_menus.length <= 0) {
        if(element.name == matchingTitle){
             return element
        }
        else
          return null
      }
      else {
        let menus = null

           for(let i = (element.sub_menus.length - 1); i >= 0; i--){
                let result = this.searchTree(element.sub_menus[i], matchingTitle);
                if(result != null){
                  element['sub_menus2'].push(result)
                }

              /// if(result == false){
              //    element.sub_menus.splice(i , 1)
              //  }
           }


           //element['sub_menus'] = element['sub_menus2'];
           return element;
          // return result;
      }

 }*/

 searchTree(element, matchingTitle){

     if(element.name.indexOf(matchingTitle) != -1 ){
          element['searched'] = true
     }
     else
       element['searched'] = false

      if(element.sub_menus != null || element.sub_menus.length > 0) {
      /*  if(element.name.indexOf(matchingTitle) != -1 ){
             element['searched'] = true
        }
        else
          element['searched'] = false
      }
      else {*/


           for(let i = (element.sub_menus.length - 1); i >= 0; i--){
                let result = this.searchTree(element.sub_menus[i], matchingTitle);
              /*  if(result != null){
                  element['sub_menus2'].push(result)
                }*/

              /*  if(result == false){
                  element.sub_menus.splice(i , 1)
                }*/
           }

           //element['sub_menus'] = element['sub_menus2'];
           return element;
          // return result;
      }

 }



 getMenus(menu, str) {

    let menus = []
    if(menu == null){
      menus = this.menus
    }
    else{
      let aaa = []
      for(let x = 0 ; x < menu.sub_menus.length ; x++){
        if(menu.sub_menus[x].name == str){
          aaa.push(menu.sub_menus[x])
        }
      }
      menu['sub_menus'] = aaa;
    }

    if (menus.length <= 0) {
      // end the recursion
      return;
    } else {
      // continue the recursion
      for(let x = 0 ; x < menus.length ; x++){
        this.getMenus(menus[x], str);
      }
  }
  return menus;
}


  /*activeRoute(routename: string): boolean{
        return this.router.url.indexOf(routename) > -1;
    }*/





  /*  changeMenu(e){
      alert();
      //e.preventDefault();
//debugger;
      // Collapsible
      $(e.target).parent('li').not('.disabled').not($('.sidebar-xs').not('.sidebar-xs-indicator').find('.navigation-main').children('li')).toggleClass('active').children('ul').slideToggle(250);

      // Accordion
      if ($('.navigation-main').hasClass('navigation-accordion')) {
          $(e.target).parent('li').not('.disabled').not($('.sidebar-xs').not('.sidebar-xs-indicator').find('.navigation-main').children('li')).siblings(':has(.has-ul)').removeClass('active').children('ul').slideUp(250);
      }
    }*/


}
