import { Component, OnInit , ViewChild , AfterViewInit} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TabsetComponent,TabDirective} from 'ngx-bootstrap';
import { ActivatedRoute } from '@angular/router';
import { PermissionsService } from '../../core/service/permissions.service';
import { LayoutChangerService } from '../../core/service/layout-changer.service';

import { InventoryScarpService } from './inventory-scarp.service';
import { InventoryScarpComponent } from './inventory-scarp.component';
import { InventoryScarpSummeryComponent } from './inventory-scarp-summery.component';

@Component({
  selector: 'app-inventory-scarp-home',
  templateUrl: './inventory-scarp-home.component.html'
})
export class InventoryScarpHomeComponent implements OnInit {

  @ViewChild('menuTab') tabs: TabsetComponent;
  //Define child for tab onclick event
  @ViewChild(InventoryScarpSummeryComponent) ListingChild: InventoryScarpSummeryComponent;
  @ViewChild(InventoryScarpComponent) OperationChild: InventoryScarpComponent;

  path_name='';

  constructor(private InventoryScarpService : InventoryScarpService,private router: ActivatedRoute, private permissionService:PermissionsService,
    private layoutChangerService : LayoutChangerService, private titleService: Title) { }

  onSelect(data: TabDirective): void {
    let pathArr = [
      'Warehouse Management',
      'Stores',
      ];

    switch(data.heading){
      case 'Inventory Scarp List':
        this.path_name="Inventory Scarp List"
        //reload  form when click return to store tab
        this.ListingChild.reloadTable()
      break;
      case 'Inventory Scarp':
        this.path_name="Inventory Scarp"
        //reset  form when click return to store listing tab
        this.OperationChild.reset_feilds()
      break;
    }

    this.titleService.setTitle(this.path_name)
    pathArr.push(this.path_name);
    this.layoutChangerService.changeHeaderPath(pathArr)
    // Cahnge title and file path end
  }

  ngOnInit() {

    this.layoutChangerService.changeHeaderPath([
      'Warehouse Management',
      'Stores',
        ])
this.titleService.setTitle("Inventory Scarp")//set page titl
    this.InventoryScarpService.id
    .subscribe(data => {
      if(data != null){
        this.tabs.tabs[1].active = true;
       this.titleService.setTitle("Inventory Scarp")//set page titl
      }
    })

  }

  ngOnDestroy(){

  }


}
