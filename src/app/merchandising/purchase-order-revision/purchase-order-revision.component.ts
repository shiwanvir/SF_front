import { Component, OnInit,ViewChild } from '@angular/core';
import { TabsetComponent,TabDirective } from 'ngx-bootstrap';
import { PorevisionService } from './po-revision.service';
import { Title } from '@angular/platform-browser';
import { PurchaseListComponent } from './purchase-list/purchase-list.component';

@Component({
  selector: 'app-purchase-order-revision',
  templateUrl: './purchase-order-revision.component.html',
  styleUrls: ['./purchase-order-revision.component.css']
})
export class PurchaseOrderRevisionComponent implements OnInit {

  @ViewChild('tabs') tabs: TabsetComponent;
  @ViewChild(PurchaseListComponent) poList: PurchaseListComponent;

  constructor(private porevisionService : PorevisionService, private titleService: Title) { }

  ngOnInit() {
    this.titleService.setTitle("Purchase Order Revision")
    this.porevisionService.lineData.subscribe(data => {
      if(data != null && data != ''){
          this.tabs.tabs[1].active = true;
      }
      //this.message = data
    })

  }
  ngOnDestroy(){

   this.porevisionService.changeData(null)
   this.porevisionService.changeContextMenuSplit(null)
 }

 onSelect(data: TabDirective): void {

   if(data.heading == 'Purchase Order List'){
       this.poList.reloadTable()
   }

 }

}
