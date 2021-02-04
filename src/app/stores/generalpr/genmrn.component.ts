import { Component, OnInit,ViewChild } from '@angular/core';
import { TabsetComponent } from 'ngx-bootstrap';

import { genmrnService } from './genmrn.service';

@Component({
  selector: 'app-genmrn',
  templateUrl: './genmrn.component.html',
  styleUrls: []
})
export class GenmrnComponent implements OnInit {

  //message:string
  @ViewChild('tabs') tabs: TabsetComponent;

  constructor(private generalpr:genmrnService) { }

  ngOnInit() {

    this.generalpr.genmrnData.subscribe(data => {
      if(data != null && data != ''){
          this.tabs.tabs[1].active = true;
      }
      //this.message = data
    })
  }

  reloadData(){

  }

}
