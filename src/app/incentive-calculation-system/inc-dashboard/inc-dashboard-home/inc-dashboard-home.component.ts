import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { TabsetComponent,TabDirective } from 'ngx-bootstrap';

import { IncDashboardService } from '../inc_dashboard.service';
import { IncDashboardComponent } from '../inc-dashboard.component';

@Component({
  selector: 'app-inc-dashboard-home',
  templateUrl: './inc-dashboard-home.component.html',
  styleUrls: ['./inc-dashboard-home.component.css']
})
export class IncDashboardHomeComponent implements OnInit {
    @ViewChild('shopOrderTabs') tabs: TabsetComponent;
    @ViewChild(IncDashboardComponent) dashBoardCalender: IncDashboardComponent;

constructor(private incDashboardService : IncDashboardService) { }


  ngOnInit() {

    this.incDashboardService.loadData.subscribe(data => {
      if(data != null && data != ''){
          this.tabs.tabs[1].active = true;
      }
      //this.message = data
    })


  }
  ngOnDestroy(){
    this.incDashboardService.changeData(null)
  }

  onSelect(data: TabDirective): void {

    if(data.heading == 'Calendar'){
        this.dashBoardCalender.reloadTable()
    }

  }

}
