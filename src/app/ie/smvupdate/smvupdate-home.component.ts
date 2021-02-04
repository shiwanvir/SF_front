import { Component, OnInit, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TabsetComponent,TabDirective,TabsetConfig} from 'ngx-bootstrap';
import { SmvupdateService } from './smvupdate.service';
import { ActivatedRoute } from '@angular/router';

import { LayoutChangerService } from '../../core/service/layout-changer.service';
import { SmvupdateHistoryComponent } from './smvupdate-history.component';
import { SmvupdateComponent } from './smvupdate.component';



@Component({
  selector: 'app-smvupdate-home',
  templateUrl: './smvupdate-home.component.html',
  styleUrls: [],
  providers: [TabsetConfig]
})
export class SmvupdateHomeComponent implements OnInit {

  @ViewChild('smvupdateTabs') smvupdateTabs: TabsetComponent;
  @ViewChild(SmvupdateComponent) childSmvupdate: SmvupdateComponent;
  @ViewChild(SmvupdateHistoryComponent) childSmvupdateHistory: SmvupdateHistoryComponent;

  pageHeader:string = 'SMV Update';
  constructor(private smvupdateService:SmvupdateService, private router: ActivatedRoute, private titleService: Title, private layoutChangerService : LayoutChangerService) { }

  ngOnInit() {

    this.router.data
    .subscribe(res => {

      this.layoutChangerService.changeHeaderPath([
        'Catalogue',
        'IE',
        'SMV Update'
      ])

      // let pathArr = [
      //   'Catalogue',
      //   'IE'
      // ];

      if(res.tabName == 'SMVUPDATE'){
        this.titleService.setTitle("SMV Update")//set page title
        this.smvupdateTabs.tabs[0].active = true;
        this.pageHeader = 'SMV Update';
        // pathArr.push('SMV Update');
        this.childSmvupdate.createTable()
      }
      else if(res.tabName == 'SMVHISTORY'){
        this.titleService.setTitle("SMV History")//set page title
        this.pageHeader = 'SMV History';
        // pathArr.push('SMV History');
        this.smvupdateTabs.tabs[1].active = true;
        this.childSmvupdateHistory.createTable()
      }
    });

    // this.layoutChangerService.changeHeaderPath(pathArr)
  }

  onSelect(data: TabDirective): void {

    

    let pathArr = [
      'Catalogue',
      'IE'
    ];

    switch(data.heading){
      case 'SMV Update' :
      this.titleService.setTitle("SMV Update")//set page title
      this.pageHeader = 'SMV Update';
      pathArr.push('SMV Update');
      this.childSmvupdate.reloadTable()
      if(this.childSmvupdate.datatable == null){
        this.childSmvupdate.createTable()
      }
      break;
      case 'SMV History' :
      this.titleService.setTitle("SMV History")//set page title
      this.pageHeader = 'SMV History';
      pathArr.push('SMV History');
      if(this.childSmvupdateHistory.datatable == null){
        this.childSmvupdateHistory.createTable()
        this.smvupdateService.changeStatus('RELOAD_TABLE')

      }
      break;
    }

    this.layoutChangerService.changeHeaderPath(pathArr)
  }

}
