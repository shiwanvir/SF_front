
import { Component, OnInit , ViewChild , AfterViewInit} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TabsetComponent,TabDirective} from 'ngx-bootstrap';
import { ActivatedRoute } from '@angular/router';
import { PermissionsService } from '../../core/service/permissions.service';
import { LayoutChangerService } from '../../core/service/layout-changer.service';

import { BinTransferService } from './bin-transfer.service';
import { BinTransferComponent } from './bin-transfer.component';
import { BinTransferListComponent } from './bin-transfer-list.component';

@Component({
  selector: 'app-bin-transfer-home',
  templateUrl: './bin-transfer-home.component.html',
  //styleUrls: ['./bin-transfer-home.component.css']
})

export class BinTransferHomeComponent implements OnInit {

  @ViewChild('menuTab') tabs: TabsetComponent;
  //Define child for tab onclick event
  @ViewChild(BinTransferComponent) OperationChild: BinTransferComponent;
  @ViewChild(BinTransferListComponent) ListingChild: BinTransferListComponent;

  path_name='';

  constructor(private BinTransferService : BinTransferService,private router: ActivatedRoute, private permissionService:PermissionsService,
    private layoutChangerService : LayoutChangerService, private titleService: Title) { }

  onSelect(data: TabDirective): void {
    let pathArr = [
      'Warehouse Management',
      'Stores'
    ];

    switch(data.heading){
    case 'Bin Transfer List':
      this.path_name="Bin Transfer List"
      //reload  form when click return to store tab
      this.ListingChild.reloadTable()
    break;
    case 'Bin Transfer':
      this.path_name="Bin Transfer"
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
      'Bin Transfer'
    ])

    this.BinTransferService.id
    .subscribe(data => {
      if(data != null){
        this.tabs.tabs[1].active = true;
      }
    })

  }

  ngOnDestroy(){

  }


}
