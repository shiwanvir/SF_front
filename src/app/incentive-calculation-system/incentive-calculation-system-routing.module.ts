import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from '../home/home.component';
import { AuthGuard } from '../core/guard/auth.guard';
import { PermissionGuard } from '../core/guard/permission.guard';
import { IPermissionGuardModel } from '../core/model/ipermission-guard.model';

import { IncDashboardComponent } from './inc-dashboard/inc-dashboard.component';
import { IncAqlComponent } from './inc-aql/inc-aql.component';
import { IncCniComponent } from './inc-cni/inc-cni.component';
import { IncSpecialFactorComponent } from './inc-special-factor/inc-special-factor.component';
import { IncDesignationComponent } from './inc-designation/inc-designation.component';
import { IncEquationComponent } from './inc-equation/inc-equation.component';
import { IncOrderTypeComponent } from './inc-order-type/inc-order-type.component';
import { IncLadderComponent } from './inc-ladder/inc-ladder.component';
import { IncBufferPolicyComponent } from './inc-buffer-policy/inc-buffer-policy.component';
import { IncIncentivePolicyComponent } from './inc-incentive-policy/inc-incentive-policy.component';
import { IncSectionComponent } from './inc-section/inc-section.component';
import { IncDashboardHomeComponent } from './inc-dashboard/inc-dashboard-home/inc-dashboard-home.component';
import { IncLadderIndirectComponent } from './inc-ladder-indirect/inc-ladder-indirect.component';
import { IncPaymentSummaryReportComponent } from './inc-payment-summary-report/inc-payment-summary-report.component';



const routes: Routes = [
  //{path : 'location' , component : LocationComponent,outlet:'login'},
    {path : '' , component : HomeComponent ,children:
      [
        {
          path : 'incentive-calendar' , component : IncDashboardHomeComponent, canActivate: [AuthGuard],
          data : { title : 'DASHBOARD' }
        },
        {
          path : 'aql-incentive-factor' , component : IncAqlComponent, canActivate: [AuthGuard],
          data : { title : 'AQL' }
        }
        ,
        {
          path : 'cni-incentive-factor' , component : IncCniComponent, canActivate: [AuthGuard],
          data : { title : 'CNI' }
        },
        {
          path : 'special-factor' , component : IncSpecialFactorComponent, canActivate: [AuthGuard],
          data : { title : 'SPECIAL FACTOR' }
        },
        {
          path : 'designation' , component : IncDesignationComponent, canActivate: [AuthGuard],
          data : { title : 'DESIGNATION' }
        },
        {
          path : 'equation' , component : IncEquationComponent, canActivate: [AuthGuard],
          data : { title : 'EQUATION' }
        },
        {
          path : 'order-type' , component : IncOrderTypeComponent, canActivate: [AuthGuard],
          data : { title : 'TYPE OF ORDER' }
        },
        {
          path : 'ladder' , component : IncLadderComponent, canActivate: [AuthGuard],
          data : { title : 'LADDER' }
        },
        {
          path : 'buffer-policy' , component : IncBufferPolicyComponent, canActivate: [AuthGuard],
          data : { title : 'BUFFER POLICY' }
        },
        {
          path : 'incentive-policy' , component : IncIncentivePolicyComponent, canActivate: [AuthGuard],
          data : { title : 'INCENTIVE POLICY' }
        },
        {
          path : 'section' , component : IncSectionComponent, canActivate: [AuthGuard],
          data : { title : 'SECTION' }
        },
        {
          path : 'indirect-ladder' , component : IncLadderIndirectComponent, canActivate: [AuthGuard],
          data : { title : 'INDIRECT LADDER' }
        },
        {
          path : 'incentive-payment-summary-report' , component : IncPaymentSummaryReportComponent, canActivate: [AuthGuard],
          data : { title : 'INCENTIVE PAYMENT SUMMARY REPORT' }
        }

      ]

}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IncentiveCalculationSystemRoutingModule { }
