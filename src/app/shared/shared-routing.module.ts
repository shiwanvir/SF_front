import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from '../home/home.component';
import { ErrorNotAuthorizeComponent } from './error-not-authorize/error-not-authorize.component';

const routes: Routes = [
  {path : '' , component : HomeComponent ,children:
    [
      {path : 'error-401' , component : ErrorNotAuthorizeComponent }
    ]
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SharedRoutingModule { }
