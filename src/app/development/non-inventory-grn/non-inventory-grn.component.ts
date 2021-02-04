import { Component, OnInit, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TabsetComponent, TabDirective} from 'ngx-bootstrap';
import{ NonInvGrnService} from'./non-inv-grn-services.service';
import { NonInventoryGrnListComponent } from './non-inventory-grn-list.component';

@Component({
  selector: 'app-non-inventory-grn',
  templateUrl: './non-inventory-grn.component.html',
  styleUrls: []
})
export class NonInventoryGrnComponent implements OnInit {

  @ViewChild(NonInventoryGrnListComponent) childNonInvGRNList: NonInventoryGrnListComponent;
  @ViewChild('grnTabs') grnTabs: TabsetComponent;

  constructor(private titleService: Title,private grnService :NonInvGrnService ) { }

  ngOnInit() {
      this.titleService.setTitle("Non Inventory GRN")//set page title
      this.grnService.grnData
      .subscribe(headerData=>{
         if(headerData != null){
           this.grnTabs.tabs[1].active = true;
         }
      });
  }

  onSelect(data: TabDirective): void{
    if(data.heading == 'Non Inventory GRN List'){
      this.childNonInvGRNList.reloadTable()
    }
  }

}
