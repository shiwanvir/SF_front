import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home.component';
import { LoginComponent } from './login/login.component';

import { AuthGuard } from '../core/guard/auth.guard';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ConfirmPasswordComponent } from './confirm-password/confirm-password.component';

const routes: Routes = [
  {
    path : '', component : HomeComponent , canActivate: [AuthGuard], data : { title : 'Home' }
  },
  { path : 'login' , component : LoginComponent },
  { path : 'forgot-password' , component : ForgotPasswordComponent },
  { path : 'confirm-password/:token', component : ConfirmPasswordComponent },
  {
    path : 'home', component: HomeComponent, canActivate: [AuthGuard],
    data : { title : 'Home' }
  },
  { path : 'admin' , loadChildren : '../admin/admin.module#AdminModule' },
  { path : 'org' , loadChildren : '../org/org.module#OrgModule' },
  { path : 'org2' , loadChildren : '../org2/org2.module#Org2Module' },
  { path : 'org3' , loadChildren : '../org3/org3.module#Org3Module' },
  { path : 'finance' , loadChildren : '../finance/finance.module#FinanceModule' },
  { path : 'ie' , loadChildren : '../ie/ie.module#IeModule' },
  { path : 'itemcreation' , loadChildren : '../itemcreation/itemcreation.module#ItemcreationModule' },
  { path : 'merchandising' , loadChildren : '../merchandising/merchandising.module#MerchandisingModule' },
  { path : 'merchandising-master' , loadChildren : '../merchandising-master/merchandising-master.module#MerchandisingMasterModule' },
  { path : 'stores' , loadChildren : '../stores/stores.module#StoresModule' },
  { path : 'shared' , loadChildren : '../shared/shared.module#SharedModule' },
  { path : 'integration' , loadChildren : '../integration/integration.module#IntegrationModule' },
  { path : 'inspection' , loadChildren : '../inspection/inspection.module#InspectionModule' },
  { path : 'd2d' , loadChildren : '../d2d/d2d.module#D2dModule' },
  { path : 'reports' , loadChildren : '../reports/reports.module#ReportsModule' },
  { path : 'dashboard' , loadChildren : '../dashboard/dashboard.module#DashboardModule' },
  { path : 'development' , loadChildren : '../development/development.module#DevelopmentModule' },
  { path : 'incentive-calculation-system' , loadChildren : '../incentive-calculation-system/incentive-calculation-system.module#IncentiveCalculationSystemModule' }
];



@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }
