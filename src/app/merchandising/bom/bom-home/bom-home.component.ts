import { Component, OnInit, ViewChild } from '@angular/core';

import { TabsetComponent } from 'ngx-bootstrap';

import { BomService } from '../bom.service';
import { BomListComponent } from '../bom-list/bom-list.component';
import { BomComponent } from '../bom.component';

@Component({
  selector: 'app-bom-home',
  templateUrl: './bom-home.component.html',
  styleUrls: ['./bom-home.component.css']
})
export class BomHomeComponent implements OnInit {

  @ViewChild('bomTabs') tabs: TabsetComponent;
  @ViewChild(BomListComponent) bomListComponent : BomListComponent;
  @ViewChild(BomComponent) bomComponent : BomComponent;

  constructor(private bomService : BomService) { }

  ngOnInit() {
    this.bomService.bomId
    .subscribe(data => {
      if(data != null){
        this.tabs.tabs[1].active = true;
      }
    })
  }


  onSelect(data): void {
    switch(data.heading){
      case 'BOM List' :
        if(this.bomListComponent.datatable == null){
          this.bomListComponent.createTable()
        }
        else{
          this.bomListComponent.drawTable()
        }
      break
      case 'BOM' :      
        this.bomComponent.reloadTables()
      break
    }

  }

}
