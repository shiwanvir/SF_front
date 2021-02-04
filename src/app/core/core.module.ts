import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule , FormsModule } from '@angular/forms';

//import { ModalModule } from "ngx-bootstrap";
//import { HotTableModule } from '@handsontable/angular';
//import { NgSelectModule } from '@ng-select/ng-select';

import { HeaderComponent } from '../core/layout/header/header.component';
import { LeftMenuComponent } from '../core/layout/left-menu/left-menu.component';
import { FooterComponent } from '../core/layout/footer/footer.component';
import { HasPermissionDirective } from '../core/directive/has-permission.directive';
import { ExceptPermissionDirective } from '../core/directive/except-permission.directive';
import { UpperCaseDirective} from '../core/directive/upper-case.directive';


@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    //ModalModule.forRoot(),
    //HotTableModule.forRoot(),
    //NgSelectModule
  ],
  declarations: [
    HeaderComponent,
    LeftMenuComponent,
    FooterComponent,
     HasPermissionDirective,
     ExceptPermissionDirective,
     UpperCaseDirective,
  ],
  providers : [],
  exports : [
    HeaderComponent,
    LeftMenuComponent,
    FooterComponent,
    HasPermissionDirective,
    ExceptPermissionDirective,
    UpperCaseDirective,
  /*  HtselectComponent*/
  //NgSelectModule
  ]
})
export class CoreModule { }
