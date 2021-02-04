import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule , FormsModule } from '@angular/forms';

import { ModalModule } from "ngx-bootstrap";
import { NgSelectModule } from '@ng-select/ng-select';
import { HotTableModule } from '@handsontable/angular';

import { HomeModule } from '../home'
import { CoreModule } from '../core'
import { SharedRoutingModule } from './shared-routing.module';
import { ErrorNotAuthorizeComponent } from './error-not-authorize/error-not-authorize.component';

import { HtselectComponent } from './components/htselect/htselect.component';
import { ItemSelectorComponent } from './components/item-selector/item-selector.component';
import { ColorSelectorComponent } from './components/color-selector/color-selector.component';
import { SizeSelectorComponent } from './components/size-selector/size-selector.component';
import { CountrySelectorComponent } from './components/country-selector/country-selector.component';
import { MultiselectComponent } from './components/multiselect/multiselect.component';

@NgModule({
  imports: [
    CommonModule,
    SharedRoutingModule,
    HomeModule,
    CoreModule,
    ModalModule.forRoot(),
    ReactiveFormsModule,
    FormsModule,
    NgSelectModule,
    HotTableModule.forRoot(),
  ],
  exports : [
    ItemSelectorComponent,
    ColorSelectorComponent,
    SizeSelectorComponent,
    CountrySelectorComponent,
    MultiselectComponent,
  ],
  declarations: [
    ErrorNotAuthorizeComponent,
    HtselectComponent,
    ItemSelectorComponent,
    ColorSelectorComponent,
    SizeSelectorComponent,
    CountrySelectorComponent,
    MultiselectComponent,
  ]
})
export class SharedModule { }
