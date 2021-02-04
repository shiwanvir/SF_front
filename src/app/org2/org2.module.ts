import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule , FormsModule } from '@angular/forms';

//import { ModalModule } from "ngx-bootstrap";

import { NgSelectModule } from '@ng-select/ng-select';
import { BsDatepickerModule,ModalModule,TabsModule } from 'ngx-bootstrap';

import { Org2RoutingModule } from './org2-routing.module';

import { FeatureComponent } from './feature/feature.component';
import { ProductSpecificationComponent } from './product-specification/product-specification.component';
import { SilhouetteComponent } from './silhouette/silhouette.component';
import { SilhouetteClassificationComponent } from './silhouette-classification/silhouette-classification.component';
import { SizeChartComponent } from './size-chart/size-chart.component';
import { ColorComponent } from './color/color.component';
import { OriginTypeComponent } from './origin-type/origin-type.component';
import { SeasonComponent } from './season/season.component';
import { SizeComponent } from './size/size.component';

import { CoreModule } from '../core';
import { HomeModule } from '../home'
import { SharedModule } from '../shared';

@NgModule({
  imports: [
    CommonModule,
    Org2RoutingModule,
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
    FeatureComponent,
    ProductSpecificationComponent,
    SilhouetteComponent,
    SilhouetteClassificationComponent,
    SizeChartComponent,
    ColorComponent,
    OriginTypeComponent,
    SeasonComponent,
    SizeComponent
  ]
})
export class Org2Module { }
