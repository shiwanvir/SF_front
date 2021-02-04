import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule , FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { ModalModule,TabsModule } from 'ngx-bootstrap';
import { HotTableModule } from '@handsontable/angular';

import { IncentiveCalculationSystemRoutingModule } from './incentive-calculation-system-routing.module';
import { IncDashboardComponent } from './inc-dashboard/inc-dashboard.component';

import { HomeModule } from '../home';
import { CoreModule } from '../core';
import { IncAqlComponent } from './inc-aql/inc-aql.component';
import { IncCniComponent } from './inc-cni/inc-cni.component';
import { IncSpecialFactorComponent } from './inc-special-factor/inc-special-factor.component';
import { IncDesignationComponent } from './inc-designation/inc-designation.component';
import { IncEquationComponent } from './inc-equation/inc-equation.component';
import { IncOrderTypeComponent } from './inc-order-type/inc-order-type.component';
import { IncLadderComponent } from './inc-ladder/inc-ladder.component';
import { IncBufferPolicyComponent } from './inc-buffer-policy/inc-buffer-policy.component';
import { IncIncentivePolicyComponent } from './inc-incentive-policy/inc-incentive-policy.component';
import { IncLadderViewComponent } from './inc-ladder/inc-ladder-view/inc-ladder-view.component';
import { IncSectionComponent } from './inc-section/inc-section.component';
import { IncDashboardHomeComponent } from './inc-dashboard/inc-dashboard-home/inc-dashboard-home.component';
import { IncDashboardIncentiveCalculateComponent } from './inc-dashboard/inc-dashboard-incentive-calculate/inc-dashboard-incentive-calculate.component';
import { IncLadderIndirectComponent } from './inc-ladder-indirect/inc-ladder-indirect.component';
import { IncPaymentSummaryReportComponent } from './inc-payment-summary-report/inc-payment-summary-report.component';




@NgModule({
  imports: [
    CommonModule,
    NgSelectModule,
    ReactiveFormsModule,
    FormsModule,
    TabsModule.forRoot(),
    ModalModule.forRoot(),
    HomeModule,
    CoreModule,
    HotTableModule.forRoot(),
    IncentiveCalculationSystemRoutingModule
  ],
  declarations: [IncDashboardComponent, IncAqlComponent, IncCniComponent, IncSpecialFactorComponent, IncDesignationComponent, IncEquationComponent, IncOrderTypeComponent, IncLadderComponent, IncBufferPolicyComponent, IncIncentivePolicyComponent, IncLadderViewComponent, IncSectionComponent, IncDashboardHomeComponent, IncDashboardIncentiveCalculateComponent, IncLadderIndirectComponent, IncPaymentSummaryReportComponent]
})
export class IncentiveCalculationSystemModule { }
