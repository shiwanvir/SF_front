import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HotTableModule } from '@handsontable/angular';
import { BsDatepickerModule,ModalModule,TabsModule } from 'ngx-bootstrap';
import { SnotifyModule, SnotifyService, ToastDefaults } from 'ng-snotify';
import { NgSelectModule } from '@ng-select/ng-select';

import { ReactiveFormsModule , FormsModule } from '@angular/forms';
import { AdminRoutingModule } from './admin-routing.module';
import { UserComponent } from './user/user.component';
import { RegisterComponent } from './register/register.component';

import { CoreModule } from '../core';
import { HomeModule } from '../home';
import { SharedModule } from '../shared';
import { RoleComponent } from './role/role/role.component';
import { RoleHomeComponent } from './role/role-home/role-home.component';
import { RoleListComponent } from './role/role-list/role-list.component';
import { ApprovalStageComponent } from './approval-stage/approval-stage/approval-stage.component';
import { ApprovalStageHomeComponent } from './approval-stage/approval-stage-home/approval-stage-home.component';
import { ApprovalStageListComponent } from './approval-stage/approval-stage-list/approval-stage-list.component';
import { ProcessApprovalsComponent } from './process-approvals/process-approvals.component';
import { NotificationsComponent } from './notifications/notifications.component';

@NgModule({
  imports: [
    CommonModule,
    AdminRoutingModule,
    ReactiveFormsModule,
    HomeModule,
    ModalModule.forRoot(),
    BsDatepickerModule.forRoot(),
    TabsModule.forRoot(),
    CoreModule,
    SharedModule,
    NgSelectModule,
    SnotifyModule,
    FormsModule,
    HotTableModule.forRoot(),
  ],
  declarations: [
    UserComponent,
    RegisterComponent,
    RoleComponent,
    RoleHomeComponent,
    RoleListComponent,
    ApprovalStageComponent,
    ApprovalStageHomeComponent,
    ApprovalStageListComponent,
    ProcessApprovalsComponent,
    NotificationsComponent
  ],
  providers : [
    { provide: 'SnotifyToastConfig', useValue: ToastDefaults},
    SnotifyService
  ],
  exports : [UserComponent]
})
export class AdminModule { }
