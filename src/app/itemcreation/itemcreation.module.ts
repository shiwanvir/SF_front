import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule , FormsModule } from '@angular/forms';

import { ModalModule, TabsModule } from 'ngx-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { HotTableModule } from '@handsontable/angular';

import { ItemcreationRoutingModule } from './itemcreation-routing.module';

import { SubcategoryComponent } from './subcategory/subcategory.component';
import { AssignpropertiesComponent } from './assignproperties/assignproperties.component';
import { ItemcreationwizardComponent } from './itemcreationwizard/itemcreationwizard.component';
import { ItemgroupComponent } from './itemgroup/itemgroup.component';
import { ItemlistingComponent } from './itemlisting/itemlisting.component';

import { HomeModule } from '../home';
import { CoreModule } from '../core';
import { SharedModule } from '../shared';
import { MaterialWizardComponent } from './material-wizard/material-wizard.component';
import { InventoryItemListComponent } from './inventory-item-list/inventory-item-list.component';
import { ItemcreationwizardEditComponent } from './itemcreationwizard-edit/itemcreationwizard-edit.component';

@NgModule({
  imports: [
    CommonModule,
    ItemcreationRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    ModalModule.forRoot(),
    TabsModule.forRoot(),
    HomeModule,
    CoreModule,
    SharedModule,
    NgSelectModule,
    HotTableModule.forRoot()

  ],
  declarations: [SubcategoryComponent, AssignpropertiesComponent, ItemcreationwizardComponent, ItemgroupComponent, ItemlistingComponent, MaterialWizardComponent, InventoryItemListComponent, ItemcreationwizardEditComponent],
  exports:[ReactiveFormsModule]
})

export class ItemcreationModule { }
