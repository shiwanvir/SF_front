import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule , FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { ModalModule,TabsModule } from 'ngx-bootstrap';

import { IntegrationRoutingModule } from './integration-routing.module';
import { FastReactComponent } from './fast-react/fast-react.component';
import { HotTableModule } from '@handsontable/angular';

import { HomeModule } from '../home';
import { CoreModule } from '../core';
import { FastReactOrdersComponent } from './fast-react-orders/fast-react-orders.component';

@NgModule({
  imports: [
    CommonModule,
    NgSelectModule,
    ReactiveFormsModule,
    FormsModule,
    TabsModule.forRoot(),
    ModalModule.forRoot(),
    IntegrationRoutingModule,
    HomeModule,
    CoreModule,
    HotTableModule.forRoot(),
  ],
  declarations: [
    FastReactComponent,
    FastReactOrdersComponent
  ]
})
export class IntegrationModule { }
