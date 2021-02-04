import { NgModule , ModuleWithProviders } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { SnotifyModule, SnotifyService, ToastDefaults } from 'ng-snotify';

import { HomeRoutingModule } from './home-routing.module';
import { CoreModule } from '../core';

import { HomeComponent } from './home.component';
import { LoginComponent } from './login/login.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ConfirmPasswordComponent } from './confirm-password/confirm-password.component';
/*const homeRouting: ModuleWithProviders = RouterModule.forRoot([
  {   path: '/',   redirectTo: 'home', pathMatch: 'full' },
  {   path: 'home',   component: HomeComponent }
]);*/

@NgModule({
  imports: [
    CommonModule,
    HomeRoutingModule,
    CoreModule,
    ReactiveFormsModule,
    SnotifyModule,
 ],
  declarations: [
    HomeComponent,
    LoginComponent,
    ForgotPasswordComponent,
    ConfirmPasswordComponent
  ],
  providers : [
    { provide: 'SnotifyToastConfig', useValue: ToastDefaults},
    SnotifyService,
    Title
  ],
  exports : [HomeComponent]
})
export class HomeModule { }
