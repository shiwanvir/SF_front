
import { Component, OnInit , ViewChild , AfterViewInit} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TabsetComponent,TabDirective} from 'ngx-bootstrap';
import { ActivatedRoute } from '@angular/router';
import { PermissionsService } from '../../core/service/permissions.service';
import { LayoutChangerService } from '../../core/service/layout-changer.service';

import { ReturnSupplierService } from './return-to-supplier.service';
import { ReturnToSupplierComponent } from './return-to-supplier.component';
import { ReturnToSupplierListComponent } from './return-to-supplier-list.component';

@Component({
  selector: 'app-return-to-supplier-home',
  templateUrl: './return-to-supplier-home.component.html',
  //styleUrls: ['./return-to-supplier-home.component.css']
})

export class ReturnToSupplierHomeComponent implements OnInit {

  @ViewChild('menuTab') tabs: TabsetComponent;
  //Define child for tab onclick event
  @ViewChild(ReturnToSupplierComponent) OperationChild: ReturnToSupplierComponent;
  @ViewChild(ReturnToSupplierListComponent) ListingChild: ReturnToSupplierListComponent;

  path_name='';

  constructor(private ReturnSupplierService : ReturnSupplierService,private router: ActivatedRoute, private permissionService:PermissionsService,
    private layoutChangerService : LayoutChangerService, private titleService: Title) { }

  onSelect(data: TabDirective): void {
    let pathArr = [
      'Warehouse Management',
      'Stores',
      ];

    switch(data.heading){
    case 'Return to Supplier List':
      this.path_name="Return to Supplier List"
      //reload  form when click return to store tab
      this.ListingChild.reloadTable()
    break;
    case 'Return to Supplier':
      this.path_name="Return to Supplier"
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
      'Return to Supplier'
    ])

    this.ReturnSupplierService.id
    .subscribe(data => {
      if(data != null){
        this.tabs.tabs[1].active = true;
      }
    })

  }

  ngOnDestroy(){

  }


}
