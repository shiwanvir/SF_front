import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ModuleWithProviders, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
//import { ReactiveFormsModule , FormsModule } from '@angular/forms';
//import { NgSelectModule } from '@ng-select/ng-select';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
//import { ModalModule } from 'ngx-bootstrap';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
//import { CoreModule } from './core';
/*import { OrgModule } from './org';*/
import { HomeModule } from './home';

/*import { MerchandisingModule } from './merchandising'*/
/*import { StoresModule } from './stores'*/

/*import { ItemcreationModule } from './itemcreation';*/

/*import { FinanceModule } from './finance';*/

import { AppRoutingModule,routingComponents } from './app-routing.module';
////import { TestModule } from './test';
/*import { AdminModule } from './admin';*/
// import { IeModule } from './ie';
import { DashboardModule } from './dashboard';

import { AppComponent } from './app.component';
//import { SubcategoryComponent } from './itemcreation/subcategory/subcategory.component';
//import { AssignpropertiesComponent } from './itemcreation/assignproperties/assignproperties.component';

import { TokenInterceptor } from './core/service/token.interceptor';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
//import { HotTableModule } from '@handsontable/angular';
//import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';


// import { ManProdorderComponent } from './man-prodorder/man-prodorder.component';
// import { GarmentComponentComponent } from './master/garment-component/garment-component.component';


//const rootRouting: ModuleWithProviders = RouterModule.forRoot([], { useHash: true });

@NgModule({
  declarations: [
    AppComponent,
    routingComponents,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    /*AppRoutingModule,*/
    //FormsModule,
    //ReactiveFormsModule,
    //NgSelectModule,
    AppRoutingModule,
    /*FinanceModule,*/
    //CoreModule,
    /*OrgModule,*/
    HomeModule,
    /*MerchandisingModule,*/
    // AdminModule,
    // StoresModule,
    // IeModule,
    // ItemcreationModule,
    DashboardModule,
    BrowserAnimationsModule,
    //HotTableModule.forRoot(),
    //NgMultiSelectDropDownModule.forRoot()

    /*FinanceRoutingModule*/
  ],
  //schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,//inspector to add toke to every http request
      useClass: TokenInterceptor,
      multi: true
    },
    {
      provide: LocationStrategy,
      useClass: HashLocationStrategy
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
