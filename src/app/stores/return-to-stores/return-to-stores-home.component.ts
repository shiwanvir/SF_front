import { Component, OnInit , ViewChild , AfterViewInit} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TabsetComponent,TabDirective} from 'ngx-bootstrap';
import { ActivatedRoute } from '@angular/router';
import { PermissionsService } from '../../core/service/permissions.service';
import { LayoutChangerService } from '../../core/service/layout-changer.service';

import { ReturnStoreService } from './return-to-stores.service';
import { ReturnToStoresComponent } from './return-to-stores.component';
import { ReturnToStoresListComponent } from './return-to-stores-list.component';

@Component({
  selector: 'app-return-to-stores-home',
  templateUrl: './return-to-stores-home.component.html',
})
export class ReturnToStoresHomeComponent implements OnInit {

  @ViewChild('menuTab') tabs: TabsetComponent;
  //Define child for tab onclick event
  @ViewChild(ReturnToStoresComponent) OperationChild: ReturnToStoresComponent;
  @ViewChild(ReturnToStoresListComponent) ListingChild: ReturnToStoresListComponent;

  path_name='';

  constructor(private ReturnStoreService : ReturnStoreService,private router: ActivatedRoute, private permissionService:PermissionsService,
    private layoutChangerService : LayoutChangerService, private titleService: Title) { }

  onSelect(data: TabDirective): void {
    let pathArr = [
      'Warehouse Management',
      'Stores',
      'Return to Stores'
    ];

    switch(data.heading){
    case 'Return to Store List':
      this.path_name="Return to Store List"
      //reload  form when click return to store tab
      this.ListingChild.reloadTable()
    break;
    case 'Return to Store':
      this.path_name="Return to Store"
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
      'Return to Stores',
      'Return to Store List'
    ])

    this.ReturnStoreService.id
    .subscribe(data => {
      if(data != null){
        this.tabs.tabs[1].active = true;
      }
    })

  }

  ngOnDestroy(){

  }


}
