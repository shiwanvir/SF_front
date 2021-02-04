import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  level1 = ''
  menuLevels = {
    /*level1 : null,
    level2 : null,
    level3 : null,
    level4 : null*/
  }

  //leftMenus : Array<any> = null //will store left side menu
  currentComponent : string = ''
  //currentComponentLink : string = ''

  constructor() { }

  menu(level,menu_code){

    if(level == 1) { // collapse all sub menus
      for (var key in this.menuLevels) {
          //if (p.hasOwnProperty(key)) {
              this.menuLevels[key] = null
          //}
      }
    /*  this.menuLevels['level2'] = null
      this.menuLevels['level3'] = null
      this.menuLevels['level4'] = null*/
    }

    level = 'level' + level
    if(this.menuLevels[level] == menu_code){
      this.menuLevels[level] = null
    }
    else{
      this.menuLevels[level] = menu_code
    }
  }



}
