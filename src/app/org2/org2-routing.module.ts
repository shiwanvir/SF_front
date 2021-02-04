import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FeatureComponent } from './feature/feature.component';
import { ProductSpecificationComponent } from './product-specification/product-specification.component';
import { SilhouetteComponent } from './silhouette/silhouette.component';
import { SilhouetteClassificationComponent } from './silhouette-classification/silhouette-classification.component';
import { SizeChartComponent } from './size-chart/size-chart.component';
import { ColorComponent } from './color/color.component';
import { OriginTypeComponent } from './origin-type/origin-type.component';
import { SeasonComponent } from './season/season.component';
import { SizeComponent } from './size/size.component';

import { HomeComponent } from '../home/home.component';
import { AuthGuard } from '../core/guard/auth.guard';
import { PermissionGuard } from '../core/guard/permission.guard';
import { IPermissionGuardModel } from '../core/model/ipermission-guard.model';

const routes: Routes = [
  {path : '' , component : HomeComponent , canActivate: [AuthGuard], children:
    [
      {
        path : 'color' , component : ColorComponent , canActivate: [AuthGuard, PermissionGuard],
        data : {
          title : 'Color',
          Permission: { Only: ['COLOR_VIEW'] } as IPermissionGuardModel
        }
      },
      {
        path : 'feature' , component : FeatureComponent, canActivate: [AuthGuard, PermissionGuard],
        data: {
          title : 'Product Feature',
          Permission: { Only: ['PRODUCT_FEATURE_MANAGE'] } as IPermissionGuardModel
        }
      },
      {
        path : 'origin-type' , component : OriginTypeComponent , canActivate: [AuthGuard, PermissionGuard],
        data : {
          title : 'Origin Type',
          Permission: { Only: ['ORIGN_TYPE_VIEW'] } as IPermissionGuardModel
        }
      },
      {
        path:'product-type',component :ProductSpecificationComponent, canActivate: [AuthGuard, PermissionGuard],
        data: {
          title : 'Product Specification',
          Permission: { Only: ['PROD_SPEC_VIEW'] } as IPermissionGuardModel
        }
      },
      {
        path : 'season' , component : SeasonComponent , canActivate: [AuthGuard, PermissionGuard],
        data : {
          title : 'Season',
          Permission: { Only: ['SEASON_VIEW'] } as IPermissionGuardModel
        }
      },
      {
        path : 'silhouette' , component : SilhouetteComponent,canActivate: [AuthGuard, PermissionGuard],
        data: {
          title : 'Product Silhouette',
          Permission: { Only: ['PROD_SILHOUETTE_VIEW'] } as IPermissionGuardModel
        }
      },
      {
        path:'silhouette-classification',component :SilhouetteClassificationComponent, canActivate: [AuthGuard, PermissionGuard],
        data: {
          title : 'Silhouette Classification',
          Permission: { Only: ['PROD_CLASIFICATION_VIEW'] } as IPermissionGuardModel
        }
      },
      {
        path : 'garment-size' , component : SizeComponent , canActivate: [AuthGuard, PermissionGuard],
        data: {
          title : 'Garment Size',
          Permission: { Only: ['GARMENT_SIZE_VIEW'] } as IPermissionGuardModel
        }
      },
      {
        path:'size-chart',component:SizeChartComponent,canActivate:[AuthGuard, PermissionGuard],
        data: {
          title : 'Size Chart',
          Permission: { Only: ['SIZE_CHART_VIEW'] } as IPermissionGuardModel
        }
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class Org2RoutingModule { }
