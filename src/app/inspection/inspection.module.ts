import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule , FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { ModalModule,TabsModule } from 'ngx-bootstrap';
import { HomeModule } from '../home';
import { CoreModule } from '../core';
import { HotTableModule } from '@handsontable/angular';

import { InspectionRoutingModule,InspectionRoutingModules  } from './inspection-routing.module';
import { FabricInspectionComponent } from './fabric-inspection/fabric-inspection.component';
import { FabricInspectionHomeComponent } from './fabric-inspection/fabric-inspection-home/fabric-inspection-home.component';
import { FabricInspectionDetailsComponent } from './fabric-inspection/fabric-inspection-details/fabric-inspection-details.component';
import { TrimInspectionComponent } from './trim-inspection/trim-inspection.component';
import { TrimInspectionHomeComponent } from './trim-inspection/trim-inspection-home/trim-inspection-home.component';
import { TrimInspectionDetailsComponent } from './trim-inspection/trim-inspection-details/trim-inspection-details.component';

@NgModule({
  imports: [
    CommonModule,
    InspectionRoutingModule,
      ModalModule.forRoot(),
      NgSelectModule,
      ReactiveFormsModule,
      FormsModule,
      TabsModule.forRoot(),
      HomeModule,
      CoreModule,
      HotTableModule.forRoot()

  ],
  declarations: [FabricInspectionComponent, FabricInspectionHomeComponent, FabricInspectionDetailsComponent, TrimInspectionComponent, TrimInspectionHomeComponent, TrimInspectionDetailsComponent]
})
export class InspectionModule { }
