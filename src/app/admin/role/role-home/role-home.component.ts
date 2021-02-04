import { Component, OnInit, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TabsetComponent,TabDirective } from 'ngx-bootstrap';

import { RoleService } from '../role.service';
import { RoleListComponent } from '../role-list/role-list.component';

@Component({
  selector: 'app-role-home',
  templateUrl: './role-home.component.html',
  styleUrls: ['./role-home.component.css']
})
export class RoleHomeComponent implements OnInit {

  @ViewChild('roleTabs') tabs: TabsetComponent;
  @ViewChild(RoleListComponent) rollListreload: RoleListComponent;
  constructor(private roleService : RoleService, private titleService: Title) { }

  ngOnInit() {
    this.titleService.setTitle("Permission Roles")//set page title

   this.roleService.role_data
    .subscribe(data => {
      if(data != null){
        this.tabs.tabs[1].active = true;
      }
    })

  }

  onSelect(data: TabDirective): void {

    if(data.heading == 'Roles List'){
        this.rollListreload.reloadTable()
    }

  }


}
