import { Component, OnInit, ViewChild,OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TabsetComponent,TabDirective } from 'ngx-bootstrap';
import { ActivatedRoute } from '@angular/router';
import{RollPlanDetailsComponent} from'../roll-plan-details/roll-plan-details.component';
import{RollPlanComponent}from'../roll-plan.component';

@Component({
  selector: 'app-roll-plan-home',
  templateUrl: './roll-plan-home.component.html',
  styleUrls: ['./roll-plan-home.component.css']
})
export class RollPlanHomeComponent implements OnInit {
  @ViewChild('rollPlanTabs') tabs: TabsetComponent;
  @ViewChild(RollPlanDetailsComponent) childRollPlanDetails: RollPlanDetailsComponent;
  @ViewChild(RollPlanComponent) childRollPlan: RollPlanComponent;

  constructor() { }

  ngOnInit() {
  }

  onSelect(data: TabDirective): void {

    let pathArr = [
      'Stores',
      'Roll Plan Update'
    ];

    switch(data.heading){
      case 'Roll Plan List' :
          if(this.childRollPlanDetails.datatable == null){
          }
          //this.childRollPlanDetails.reloadTable()

        break;
      case 'Roll Plan' :

        //  this.childRollPlan.clear();
        break;


    }



  }


}
