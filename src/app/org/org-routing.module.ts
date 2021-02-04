import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CountryComponent } from '../org/country/country.component';
import { LocationComponent } from '../org/location/location.component';
import { DepartmentComponent } from '../org/department/department.component';
import { UomComponent } from '../org/uom/uom.component';
import { SectionComponent } from '../org/section/section.component';

import { CurrencyComponent } from '../org/currency/currency.component';
import { DesignationComponent } from './designation/designation.component';
import { ConversionFactorComponent } from './conversion-factor/conversion-factor.component';

import { HomeComponent } from '../home/home.component';
import { AuthGuard } from '../core/guard/auth.guard';
import { PermissionGuard } from '../core/guard/permission.guard';
import { IPermissionGuardModel } from '../core/model/ipermission-guard.model';


const routes: Routes = [
  //{path : 'location' , component : LocationComponent,outlet:'login'},
    {path : '' , component : HomeComponent , canActivate: [AuthGuard], children:
      [
        {
          path : 'parent-company' , component : LocationComponent , canActivate: [AuthGuard, PermissionGuard],
          data : {
            tabName : 'SOURCE', title : 'Parent Company',
            Permission: { Only: ['SOURCE_VIEW'] } as IPermissionGuardModel
           }
        },
        {
          path : 'cluster' , component : LocationComponent, canActivate: [AuthGuard, ],
          data : {
            tabName : 'CLUSTER', title : 'Cluster',
            Permission: { Only: ['CLUSTER_VIEW'] } as IPermissionGuardModel
           }
        },
        {
          path : 'company' , component : LocationComponent, canActivate: [AuthGuard, ],
          data : {
            tabName : 'COMPANY', title : 'Company',
            Permission: { Only: ['COMPANY_VIEW'] } as IPermissionGuardModel
           }
        },  
        {
          path : 'location' , component : LocationComponent, canActivate: [AuthGuard, ],
          data : {
            tabName : 'LOCATION', title : 'Location',
            Permission: { Only: ['LOCATION_VIEW'] } as IPermissionGuardModel
           }
        },
        {
          path : 'department' , component : DepartmentComponent , canActivate: [AuthGuard, PermissionGuard],
          data : {
            title : 'Department',
            Permission: { Only: ['DEPARTMENT_VIEW'] } as IPermissionGuardModel
          }
        },
        {
          path : 'uom' , component : UomComponent , canActivate: [AuthGuard, PermissionGuard],
          data : {
            title : 'Unit Of Measure',
            Permission: { Only: ['UOM_VIEW'] } as IPermissionGuardModel
          }
        },
        {
          path : 'section' , component : SectionComponent ,canActivate: [AuthGuard, PermissionGuard],
          data : {
            title : 'Section',
            Permission: { Only: ['SECTION_VIEW'] } as IPermissionGuardModel
          }
        },
        {
          path : 'currency' , component : CurrencyComponent , canActivate: [AuthGuard, PermissionGuard],
          data : {
            title : 'Currency',
            Permission: { Only: ['CURRENCY_VIEW'] } as IPermissionGuardModel
          }
        },
        {
          path : 'country' , component : CountryComponent , canActivate:[AuthGuard, PermissionGuard],
          data: {
            title : 'Country',
            Permission: { Only: ['COUNTRY_VIEW'] } as IPermissionGuardModel
          }
        },
        {
          path:'designation',component:DesignationComponent,canActivate:[AuthGuard, PermissionGuard],
          data : {
            title : 'Designation',
             Permission: { Only: ['DESIGNATION_VIEW'] } as IPermissionGuardModel
          }
        },
        {
          path:'conv-factor',component:ConversionFactorComponent,canActivate:[AuthGuard, PermissionGuard],
          data: {
            title : 'Conversion Factor',
            Permission: { Only: ['CONVERSION_FACTOR_VIEW'] } as IPermissionGuardModel
          }
        }
      ]
    },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrgRoutingModule { }

export const orgRoutingComponents = [
  LocationComponent,
  CountryComponent,
  DepartmentComponent,
  UomComponent,
  SectionComponent,
  CurrencyComponent,
]
