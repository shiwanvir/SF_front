import { Component, OnInit,ViewChild } from '@angular/core';
import { TabsetComponent, TabDirective } from 'ngx-bootstrap';
import { MeterialTranferService} from './meterial-transfer.service';
import{MaterialTransferInComponent}from'../material-transfer-in/material-transfer-in.component';
import{MeterialTransferInListComponent}from'./meterial-transfer-in-list/meterial-transfer-in-list.component';

@Component({
  selector: 'app-meterial-transfer-in-home',
  templateUrl: './meterial-transfer-in-home.component.html',
  styleUrls: []
})


export class MeterialTransferInHomeComponent{

  @ViewChild('tabs') tabs: TabsetComponent;
  @ViewChild(MeterialTransferInListComponent) childmeterialTransferInList: MeterialTransferInListComponent;
  @ViewChild(MaterialTransferInComponent) childmeterialTransferIn: MaterialTransferInComponent;

    constructor(private meterialTransferIn:MeterialTranferService) { }

    ngOnInit() {

      this.meterialTransferIn.meterialTransferData.subscribe(data => {
        if(data != null && data != ''){
            this.tabs.tabs[1].active = true;
        }
        //this.message = data
      })
    }

    onSelect(data: TabDirective): void {

        //debugger
      let pathArr = [
        'Warehouse Managemnt',
        'Stores'
      ];

      switch(data.heading){

        case 'Material Transfer In List' :
              if(this.childmeterialTransferInList.datatable == null)
              {
              }
           this.childmeterialTransferInList.reloadTable()

          break;
        case 'Material Transfer In' :

            this.childmeterialTransferIn.clearData()
          break;


      }



    }

    reloadData(){

    }



}
