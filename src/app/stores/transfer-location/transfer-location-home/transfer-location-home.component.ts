import { Component, OnInit, ViewChild,OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { TabsetComponent,TabDirective } from 'ngx-bootstrap';
import { ActivatedRoute } from '@angular/router';
import { TransferLocationService } from '../transfer-location.service';
import {TransferLocationDetailsComponent} from '../transfer-location-details/transfer-location-details.component';
import{TransferLocationComponent}from '../transfer-location.component';

@Component({
  selector: 'app-transfer-location-home',
  templateUrl: './transfer-location-home.component.html',
  styleUrls: ['./transfer-location-home.component.css']
})
export class TransferLocationHomeComponent implements OnInit {

  @ViewChild('buyerPoTabs') tabs: TabsetComponent;
  @ViewChild(TransferLocationDetailsComponent) childTransferDetails: TransferLocationDetailsComponent;
  @ViewChild(TransferLocationComponent) childTransfer: TransferLocationComponent;

  constructor(private router: ActivatedRoute,private smvService : TransferLocationService, private titleService: Title) { }

  ngOnInit() {

    this.titleService.setTitle("SMV")//set page title

    this.smvService.transferData
     .subscribe(data => {
     if(data != null){
         this.tabs.tabs[1].active = true;
       }
     })

  }

ngOnDestroy(){
  this.smvService.changeData(null);
}
  onSelect(data: TabDirective): void {

    let pathArr = [
      'Catalogue',
      'IE'
    ];

    switch(data.heading){
      case 'Gate Pass List' :
            //debugger
            if(this.childTransferDetails.datatable == null){
            }
          this.childTransferDetails.reloadTable()

        break;
      case 'Material transfer form' :
        //debugger
          this.childTransfer.clearDetails();
        break;


    }



  }
}
