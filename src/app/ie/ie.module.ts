import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule , FormsModule } from '@angular/forms';

import { NgSelectModule } from '@ng-select/ng-select';

// import { IeRoutingModule } from './ie-routing.module';
import { ModalModule,TabsModule } from 'ngx-bootstrap';
import { IeRoutingModule , ieRoutingComponents } from './ie-routing.module';
import { HotTableModule } from '@handsontable/angular';

import { SmvupdateComponent } from '../ie/smvupdate/smvupdate.component';

import { SmvupdateHistoryComponent } from '../ie/smvupdate/smvupdate-history.component';
import { SmvupdateCostingComponent } from './smvupdate-costing/smvupdate-costing.component';
import { ServiceTypesComponent } from './service-types/service-types.component';

import { HomeModule } from '../home';
import { CoreModule } from '../core';
import { GarmentOperationMasterComponent } from './garment-operation-master/garment-operation-master.component';
import { ComponentSmvComponent } from './component-smv/component-smv.component';

import { ComponentSmvDetailsComponent } from './component-smv/component-smv-details/component-smv-details.component';
import { ComponentSmvHomeComponent } from './component-smv/component-smv-home/component-smv-home.component';
import { GarmentOperationComponentComponent } from './garment-operation-component/garment-operation-component.component';
import { OperationSubComponentComponent } from './operation-sub-component/operation-sub-component.component';
import { MachineTypeComponent } from './machine-type/machine-type.component';
import { SmvToolBoxComponent } from './smv-tool-box/smv-tool-box.component';
import { SmvToolBoxDetailsComponent } from './smv-tool-box/smv-tool-box-details/smv-tool-box-details.component';
import { SmvToolBoxHomeComponent } from './smv-tool-box/smv-tool-box-home/smv-tool-box-home.component';
import { SilhouetteOperationMappingComponent } from './silhouette-operation-mapping/silhouette-operation-mapping.component';

@NgModule({
  imports: [
    CommonModule,
    IeRoutingModule,
    ModalModule.forRoot(),
    NgSelectModule,
    ReactiveFormsModule,
    FormsModule,
    TabsModule.forRoot(),
    HomeModule,
    CoreModule,
    HotTableModule.forRoot()
  ],
  declarations: [
    SmvupdateComponent,
    ieRoutingComponents,
    SmvupdateHistoryComponent,
    SmvupdateCostingComponent,
    ServiceTypesComponent,
    GarmentOperationMasterComponent,
    ComponentSmvComponent,

    ComponentSmvDetailsComponent,

    ComponentSmvHomeComponent,

    GarmentOperationComponentComponent,

    OperationSubComponentComponent,

    MachineTypeComponent,

    SmvToolBoxComponent,

    SmvToolBoxDetailsComponent,

    SmvToolBoxHomeComponent,

    SilhouetteOperationMappingComponent,


  ]
})
export class IeModule { }
