import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { MenuService } from '../../core/layout/menu.service';
import { LayoutChangerService } from '../../core/service/layout-changer.service';

import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: []
})
export class AdminDashboardComponent implements OnInit {



  constructor(private menuService: MenuService, private layoutChangerService : LayoutChangerService, private titleService: Title) {
  }

  ngOnInit() {
    this.titleService.setTitle("Dashboard")//set page title
    this.layoutChangerService.changeHeaderPath(['Dashboard'
    ])

  }




}
