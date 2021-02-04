import { Component, OnInit, ViewChild } from '@angular/core';

import { TabsetComponent } from 'ngx-bootstrap';

import { ApprovalStageService } from '../approval-stage.service';

@Component({
  selector: 'app-approval-stage-home',
  templateUrl: './approval-stage-home.component.html',
  styleUrls: ['./approval-stage-home.component.css']
})
export class ApprovalStageHomeComponent implements OnInit {

  @ViewChild('permissionStageTabs') tabs: TabsetComponent;

  constructor(private approvalStageService : ApprovalStageService) { }

  ngOnInit() {

   this.approvalStageService.role_data
    .subscribe(data => {
      if(data != null){
        this.tabs.tabs[1].active = true;
      }
    })

  }

  onSelect(e){

  }

}
