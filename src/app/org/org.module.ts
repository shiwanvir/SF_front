import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule , FormsModule } from '@angular/forms';

import { NgSelectModule } from '@ng-select/ng-select';
import { BsDatepickerModule,ModalModule,TabsModule } from 'ngx-bootstrap';

import { OrgRoutingModule , orgRoutingComponents } from './org-routing.module';

import { CompanyLocationComponent } from './location/company-location.component';
import { CountryComponent } from '../org/country/country.component';
import { SourceComponent } from './location/source.component';
import { ClusterComponent } from './location/cluster.component';
import { CompanyComponent } from './location/company.component';
/*import { MultiselectComponent } from '../../app/core/components/multiselect/multiselect.component';*/
import { MainLocationComponent } from './location/main-location.component';
import { CoreModule } from '../core';
import { HomeModule } from '../home'
import { SharedModule } from '../shared';
import { DesignationComponent } from './designation/designation.component';
import { ConversionFactorComponent } from './conversion-factor/conversion-factor.component';

@NgModule({
  imports: [
    CommonModule,
    OrgRoutingModule,
    HomeModule,
    ReactiveFormsModule,
    FormsModule,
    NgSelectModule,
    BsDatepickerModule.forRoot(),
    ModalModule.forRoot(),
    TabsModule.forRoot(),
    CoreModule,
    SharedModule
  ],
  declarations: [
    orgRoutingComponents,
    CompanyLocationComponent,
    SourceComponent,
    ClusterComponent,
    CompanyComponent,
    /*MultiselectComponent,*/
    MainLocationComponent,
    orgRoutingComponents,
    DesignationComponent,
    ConversionFactorComponent
  ],
  exports : [
    CompanyLocationComponent,
    CountryComponent,
  ]
})
export class OrgModule { }
