import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ItemgroupComponent } from '../itemcreation/itemgroup/itemgroup.component';
import { SubcategoryComponent } from '../itemcreation/subcategory/subcategory.component';
import { AssignpropertiesComponent } from '../itemcreation/assignproperties/assignproperties.component';
import { ItemcreationwizardComponent } from '../itemcreation/itemcreationwizard/itemcreationwizard.component';
import { ItemlistingComponent } from '../itemcreation/itemlisting/itemlisting.component';

import { HomeComponent } from '../home/home.component';

import { AuthGuard } from '../core/guard/auth.guard';
import { PermissionGuard } from '../core/guard/permission.guard';
import { IPermissionGuardModel } from '../core/model/ipermission-guard.model';


const routes: Routes = [
  //{path : 'location' , component : LocationComponent,outlet:'login'},
    {path : '' , component : HomeComponent ,children:
      [
        {
          path : 'item-creation', component:ItemgroupComponent, canActivate: [AuthGuard, PermissionGuard],
          data : {
            title : 'Item Creation',
            Permission: { Only: ['ITEM_CREATION_VIEW'] } as IPermissionGuardModel
          }
        },
        {
          path : 'subcategory' , component : SubcategoryComponent, canActivate: [AuthGuard, PermissionGuard],
          data : {
            title : 'Sub Category',
            Permission: { Only: ['SUB_CATEGORY_VIEW'] } as IPermissionGuardModel
          }
        }, //, canActivate: [AuthGuard]
        {
          path : 'assignproperty', component : AssignpropertiesComponent, canActivate: [AuthGuard, PermissionGuard],
          data : {
            title : 'Items Property Assign',
            Permission: { Only: ['ITEM_PROP_VIEW'] } as IPermissionGuardModel
           }
        },
        /*{
          path : 'itemcreationwizard', component : ItemcreationwizardComponent, canActivate: [AuthGuard, PermissionGuard],
          data : {
            title : 'Items Creation',
            Permission: { Only: ['ITEM_CREATION_VIEW'] } as IPermissionGuardModel
           }
       },*/
      //  {path : 'itemlisting', component : ItemlistingComponent}
      ]
    },


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ItemcreationRoutingModule { }

export const ItemcreationRoutingComponents = [
  SubcategoryComponent,
  AssignpropertiesComponent,
  ItemcreationwizardComponent
]
