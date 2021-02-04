import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule , FormsModule } from '@angular/forms';

import { NgSelectModule } from '@ng-select/ng-select';
import { BsDatepickerModule,ModalModule,TabsModule } from 'ngx-bootstrap';

import { Org3RoutingModule } from './org3-routing.module';

import { CancellationReasonComponent } from './cancellation/cancellation-reason.component';
import { CancellationCategoryComponent } from './cancellation/cancellation-category.component';
import { CancellationComponent } from './cancellation/cancellation.component';
import { CustomerCreationComponent } from './customer/customer-creation.component';
import { CustomerListComponent } from './customer/customer-list.component';
import { CustomerComponent } from './customer/customer.component';
import { DivisionComponent } from './division/division.component';
import { GarmentoptionsComponent } from './garmentoptions/garmentoptions.component';
import { RequestTypeComponent } from './request-type/request-type.component';
import { StoresComponent } from './stores/stores/stores.component';
import { StoresLocationComponent } from './stores/stores-location/stores-location.component';
import { StoresHomeComponent }  from './stores/stores-home/stores-home.component';
import { SupplierComponent } from './supplier/supplier.component';
import { SupplierListComponent } from './supplier/supplier-list.component';
import { SupplierTolaranceComponent } from './supplier/supplier-tolarance/supplier-tolarance.component';
import { SupplierHomeComponent }from './supplier/supplier-home.component';

import { CoreModule } from '../core';
import { HomeModule } from '../home'
import { SharedModule } from '../shared';

@NgModule({
  imports: [
    CommonModule,
    Org3RoutingModule,
    CoreModule,
    HomeModule,
    SharedModule,
    NgSelectModule,
    BsDatepickerModule.forRoot(),
    ModalModule.forRoot(),
    TabsModule.forRoot(),
    ReactiveFormsModule,
    FormsModule,
  ],
  declarations: [
    CancellationReasonComponent,
    CancellationCategoryComponent,
    CancellationComponent,
    CustomerCreationComponent,
    CustomerListComponent,
    CustomerComponent,
    DivisionComponent,
    GarmentoptionsComponent,
    RequestTypeComponent,
    StoresComponent,
    StoresLocationComponent,
    StoresHomeComponent,
    SupplierComponent,
    SupplierListComponent,
    SupplierTolaranceComponent,
    SupplierHomeComponent
  ]
})
export class Org3Module { }
