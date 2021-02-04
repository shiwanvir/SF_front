import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeModule } from '../home/home.module';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { ChartsModule } from 'ng2-charts';

import { MainitemsComponent } from './mainitems/mainitems.component';
import { TaskstatusComponent } from './taskstatus/taskstatus.component';
import { InventoryagingComponent } from './inventoryaging/inventoryaging.component';
import { InventorysuboneComponent } from './inventoryaging/inventorysubone/inventorysubone.component';
import { TasksubComponent } from './taskstatus/tasksub/tasksub.component';
import { BsDatepickerModule,ModalModule,TabsModule } from 'ngx-bootstrap';
import { TasksubmenuTwoComponent } from './taskstatus/tasksub/tasksubmenu-two/tasksubmenu-two.component';
import { OtdSubComponent } from './mainitems/otd-sub/otd-sub.component';
import { RmSubComponent } from './mainitems/rm-sub/rm-sub.component';
import { InventorySubComponent } from './mainitems/inventory-sub/inventory-sub.component';
import { OtdPlantwiseComponent } from './mainitems/otd-sub/otd-plantwise/otd-plantwise.component';
// import { LocationwiseComponent } from './mainitems/inventory-sub/locationwise/locationwise.component';
// import { RmPlantwiseComponent } from './mainitems/rm-sub/rm-plantwise/rm-plantwise.component';
// import { PlantwiseTocurrentComponent } from './mainitems/rm-sub/plantwise-tocurrent/plantwise-tocurrent.component';
// import { LocationCurrentdComponent } from './mainitems/inventory-sub/location-currentd/location-currentd.component';
// import { LastYearComponent } from './mainitems/inventory-sub/last-year/last-year.component';
// import { LastYearRmComponent } from './mainitems/rm-sub/last-year-rm/last-year-rm.component';
//import { Chart } from 'chart.js';


import { SalesSubComponent } from './mainitems/sales-sub/sales-sub.component';
import { MonthlyWiseComponent } from './mainitems/sales-sub/monthly-wise/monthly-wise.component';
import { QuarterOneComponent } from './mainitems/sales-sub/quarter-one/quarter-one.component';
import { QuarterTwoComponent } from './mainitems/sales-sub/quarter-two/quarter-two.component';
import { QuarterThreeComponent } from './mainitems/sales-sub/quarter-three/quarter-three.component';
import { QuarterFourComponent } from './mainitems/sales-sub/quarter-four/quarter-four.component';
import { QuarterinLastTwoYearComponent } from './mainitems/sales-sub/quarterin-last-two-year/quarterin-last-two-year.component';
import { PendingTaskComponent } from './taskstatus/pending-task/pending-task.component';
import { RejectedTaskComponent } from './taskstatus/rejected-task/rejected-task.component';
// import { CurrentPlantwiseComponent } from './mainitems/otd-sub/current-plantwise/current-plantwise.component';
import { CurrentLdPlantwiseComponent } from './mainitems/otd-sub/current-ld-plantwise/current-ld-plantwise.component';
import { LoadRmPlantwiseOtdComponent } from './mainitems/rm-sub/load-rm-plantwise-otd/load-rm-plantwise-otd.component';
import { LoadRmPlantwiseLdComponent } from './mainitems/rm-sub/load-rm-plantwise-ld/load-rm-plantwise-ld.component';
import { LoadRmPlantwiseOtdTocurrentComponent } from './mainitems/rm-sub/load-rm-plantwise-otd-tocurrent/load-rm-plantwise-otd-tocurrent.component';
import { LoadRmPlantwiseLdTocurrentComponent } from './mainitems/rm-sub/load-rm-plantwise-ld-tocurrent/load-rm-plantwise-ld-tocurrent.component';
import { LoadRmPlantwiseOtdLastyearComponent } from './mainitems/rm-sub/load-rm-plantwise-otd-lastyear/load-rm-plantwise-otd-lastyear.component';
import { LoadRmPlantwiseLdLastyearComponent } from './mainitems/rm-sub/load-rm-plantwise-ld-lastyear/load-rm-plantwise-ld-lastyear.component';
import { InventoryPlantwiseCurrentComponent } from './mainitems/inventory-sub/inventory-plantwise-current/inventory-plantwise-current.component';
import { InventoryPlantwiseCurrentdateComponent } from './mainitems/inventory-sub/inventory-plantwise-currentdate/inventory-plantwise-currentdate.component';
import { InventoryPlantwiseLastyearComponent } from './mainitems/inventory-sub/inventory-plantwise-lastyear/inventory-plantwise-lastyear.component';
import { OtdPlantwiseUntilCurrentdatComponent } from './mainitems/otd-sub/otd-plantwise-until-currentdat/otd-plantwise-until-currentdat.component';
import { LdPlantwiseUntilCurrentdatComponent } from './mainitems/otd-sub/ld-plantwise-until-currentdat/ld-plantwise-until-currentdat.component';
import { OtdPlantwiseInlastyearComponent } from './mainitems/otd-sub/otd-plantwise-inlastyear/otd-plantwise-inlastyear.component';
import { LdPlantwiseInlastyearComponent } from './mainitems/otd-sub/ld-plantwise-inlastyear/ld-plantwise-inlastyear.component';

//Calender


@NgModule({
  imports: [
    CommonModule,
    DashboardRoutingModule,
    ChartsModule,
    HomeModule,
    BsDatepickerModule.forRoot(),

  ],
  declarations: [AdminDashboardComponent,MainitemsComponent,TaskstatusComponent, InventoryagingComponent, InventorysuboneComponent,
    TasksubComponent, TasksubmenuTwoComponent, OtdSubComponent,RmSubComponent, InventorySubComponent, OtdPlantwiseComponent,
    SalesSubComponent,MonthlyWiseComponent,QuarterOneComponent,QuarterTwoComponent,QuarterThreeComponent,
    QuarterFourComponent,QuarterinLastTwoYearComponent, PendingTaskComponent, RejectedTaskComponent, CurrentLdPlantwiseComponent, LoadRmPlantwiseOtdComponent, LoadRmPlantwiseLdComponent, LoadRmPlantwiseOtdTocurrentComponent, LoadRmPlantwiseLdTocurrentComponent, LoadRmPlantwiseOtdLastyearComponent, LoadRmPlantwiseLdLastyearComponent, InventoryPlantwiseCurrentComponent, InventoryPlantwiseCurrentdateComponent, InventoryPlantwiseLastyearComponent, OtdPlantwiseUntilCurrentdatComponent, LdPlantwiseUntilCurrentdatComponent, OtdPlantwiseInlastyearComponent, LdPlantwiseInlastyearComponent
  ]
})
export class DashboardModule { }
