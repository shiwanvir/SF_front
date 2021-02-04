import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule , FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { ModalModule,TabsModule } from 'ngx-bootstrap';

import { D2dRoutingModule } from './d2d-routing.module';
import { LoginD2dIntimatesComponent } from './login-d2d-intimates/login-d2d-intimates.component';
import { HotTableModule } from '@handsontable/angular';

import { HomeModule } from '../home';
import { CoreModule } from '../core';



@NgModule({
  imports: [
    CommonModule,
    NgSelectModule,
    ReactiveFormsModule,
    FormsModule,
    TabsModule.forRoot(),
    ModalModule.forRoot(),
    D2dRoutingModule,
    HomeModule,
    CoreModule,
    HotTableModule.forRoot()

  ],
  declarations: [LoginD2dIntimatesComponent]
})
export class D2dModule { }
