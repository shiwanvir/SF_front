import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { TabsetComponent,TabDirective } from 'ngx-bootstrap';

import { BuyerPoService } from './buyer-po.service';
import { StyleBuyerPoListComponent } from './style-buyer-po-list.component';

@Component({
  selector: 'app-style-buyer-po-home',
  templateUrl: './style-buyer-po-home.component.html',
  styleUrls: []
})
export class StyleBuyerPoHomeComponent implements OnInit {

  @ViewChild('buyerPoTabs') tabs: TabsetComponent;
  @ViewChild(StyleBuyerPoListComponent) styleBuyerPoListCom: StyleBuyerPoListComponent;

  constructor(private buyerPoService : BuyerPoService, private titleService: Title) { }

  ngOnInit() {
    this.titleService.setTitle("Sales Order")//set page title

    this.buyerPoService.poData
    .subscribe(data => {
      if(data != null && data.id != null){
        this.tabs.tabs[1].active = true;
      }
    })

  }

  ngOnDestroy(){
       this.buyerPoService.changeData(null,null)
       this.buyerPoService.changeStatus(null)
       this.buyerPoService.changeLineData(null)
       this.buyerPoService.changeSplitLineData(null)
       this.buyerPoService.changeSplitStatus(null)
       this.buyerPoService.changeRevisionLineData(null)
  }

  onSelect(data: TabDirective): void {

    if(data.heading == 'Sales Order List'){

        this.styleBuyerPoListCom.reloadTable()
    }

  }



}
