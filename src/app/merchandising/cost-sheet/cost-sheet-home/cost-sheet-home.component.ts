import { Component, OnInit, ViewChild } from '@angular/core';

import { TabsetComponent,TabDirective } from 'ngx-bootstrap';

import { CostingService } from '../costing.service';
import { CostSheetComponent } from '../cost-sheet/cost-sheet.component';
import { CostSheetListComponent } from '../cost-sheet-list/cost-sheet-list.component';

@Component({
  selector: 'app-cost-sheet-home',
  templateUrl: './cost-sheet-home.component.html',
  styleUrls: ['./cost-sheet-home.component.css']
})
export class CostSheetHomeComponent implements OnInit {

  @ViewChild('costingTabs') tabs: TabsetComponent;
  @ViewChild(CostSheetListComponent) costSheetListCom: CostSheetListComponent;

  constructor(private costingService:CostingService) { }

  ngOnInit() {
    this.costingService.costingId
    .subscribe(data => {
      if(data != null){
        if(this.tabs != null && this.tabs.tabs.length > 0){
          this.tabs.tabs[1].active = true;
        }
      }
      else {
        if(this.tabs != null && this.tabs.tabs.length > 0){
          this.tabs.tabs[0].active = true;
        }
      }
    })
  }

  onSelect(data: TabDirective): void {

    if(data.heading == 'Costing List'){
        this.costSheetListCom.reloadTable()
    }

  }

}
