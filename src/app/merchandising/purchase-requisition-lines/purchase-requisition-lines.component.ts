import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TabsetComponent,TabDirective } from 'ngx-bootstrap';
import { PrlService } from './prl.service';
import { PrlPoListComponent } from './prl-po-list/prl-po-list.component';

@Component({
  selector: 'app-purchase-requisition-lines',
  templateUrl: './purchase-requisition-lines.component.html',
  styleUrls: ['./purchase-requisition-lines.component.css']
})
export class PurchaseRequisitionLinesComponent implements OnInit {
  @ViewChild('potabs') tabs: TabsetComponent;
  @ViewChild(PrlPoListComponent) purchaseOrderHeaderList: PrlPoListComponent;

  constructor(private prlService : PrlService, private titleService: Title) { }

  ngOnInit() {
    this.titleService.setTitle("Purchase Order")//set page title

    this.prlService.lineData
    .subscribe(data => {
      if(data != null){
        this.tabs.tabs[1].active = true;
      }
    })

    this.prlService.loadDatas
    .subscribe(data => {
      if(data != null){
        this.tabs.tabs[1].active = true;
      }
    })

  }

  ngOnDestroy(){

   this.prlService.changeData(null)
   this.prlService.loadData(null)
   this.prlService.changeContextMenuSplit(null)
 }

 onSelect(data: TabDirective): void {

   if(data.heading == 'Purchase Order Header List'){
       this.purchaseOrderHeaderList.reloadTable()
   }

 }

}
