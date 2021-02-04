import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { TabsetComponent, TabDirective} from 'ngx-bootstrap';

import { ManualPoService } from './manual-po.service';
import { InventoryPartListPoComponent } from './inventory-part-po-list.component';
import { NonInventoryPoListComponent } from './non-inventory-po-list.component';

@Component({
  selector: 'app-manual-po',
  templateUrl: './manual-po.component.html',
  styleUrls: []
})
export class ManualPOComponent implements OnInit {

  @ViewChild('manualPoTabs') tabs: TabsetComponent;
  @ViewChild(InventoryPartListPoComponent) childInvList: InventoryPartListPoComponent;
  @ViewChild(NonInventoryPoListComponent) childNonInvList: NonInventoryPoListComponent;

  constructor(private manualPOService : ManualPoService, private titleService: Title) { }

  ngOnInit() {
    this.titleService.setTitle("Manual Purchase Order")//set page title

    this.manualPOService.poData
    .subscribe(data => {
      if(data != null && data.id != null){
        this.tabs.tabs[1].active = true;
      }
    })

    this.manualPOService.poData2
    .subscribe(data => {
      if(data != null && data.id != null){
        this.tabs.tabs[3].active = true;
      }
    })

  }

  ngOnDestroy(){
    this.manualPOService.changeData(null,null)
    this.manualPOService.changeData2(null,null)
    this.manualPOService.changeStatus(null)
    this.manualPOService.changeLineData(null)
  }

  onSelect(data: TabDirective): void{
    if(data.heading == 'Inventory Part PO List'){
      this.childInvList.reloadTable()
    }else if(data.heading == 'Non Inventory PO List'){
      this.childNonInvList.reloadTable()
    }
  }



}
