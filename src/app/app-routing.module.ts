import { NgModule }     from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
/*  {path : 'finance' , loadChildren : './finance/finance.module#FinanceModule' },*/
/*{path : 'home/org' , loadChildren : './org/org.module#OrgModule' },*/
  {path : 'admin' , loadChildren : './admin/admin.module#AdminModule' }
  /*{path : 'payment-term' , component : PaymentTermComponent},
  {path : 'cost-center' , component : CostCenterComponent}*/
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}

export const routingComponents = [/*AccountingRulesComponent , PaymentMethodComponent , PaymentTermComponent , CostCenterComponent*/];
