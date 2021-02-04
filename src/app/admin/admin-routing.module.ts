import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RegisterComponent } from '../admin/register/register.component';
import { UserComponent } from '../admin/user/user.component';
import { RoleHomeComponent } from './role/role-home/role-home.component';
import { HomeComponent } from '../home/home.component';
import { ApprovalStageHomeComponent } from './approval-stage/approval-stage-home/approval-stage-home.component';
import { ProcessApprovalsComponent } from './process-approvals/process-approvals.component';
import { NotificationsComponent } from './notifications/notifications.component';

import { AuthGuard } from '../core/guard/auth.guard';
import { PermissionGuard } from '../core/guard/permission.guard';
import { IPermissionGuardModel } from '../core/model/ipermission-guard.model';

const routes: Routes = [
  {path : '' , component : HomeComponent ,children:
    [
      {
        path : 'user' , component : RegisterComponent, canActivate: [AuthGuard, PermissionGuard],
        data : {
          title : 'User Profile',
          Permission: { Only: ['USER_PROFILE'] } as IPermissionGuardModel
        }
      },
      {path : 'user/:id' , component : RegisterComponent, canActivate: [AuthGuard/*, PermissionGuard*/]},
      {
        path : 'users' , component : UserComponent, canActivate: [AuthGuard, PermissionGuard],
        data : {
          title : 'User Administration',
          Permission: { Only: ['USERS_VIEW'] } as IPermissionGuardModel
        }
      },
      {
        path : 'role', component : RoleHomeComponent, canActivate: [AuthGuard, PermissionGuard],
        data : {
          title : 'Permission Roles',
          Permission: { Only: ['PERMISSION_ROLE_VIEW'] } as IPermissionGuardModel
        }
      },
      {
        path : 'approval-stage', component : ApprovalStageHomeComponent, canActivate: [AuthGuard, PermissionGuard],
        data : {
          title : 'Approval Stage',
          Permission: { Only: ['APPROVAL_STAGE_MANAGE'] } as IPermissionGuardModel
        }
      },
      {
        path : 'process-approvals', component : ProcessApprovalsComponent, canActivate: [AuthGuard, PermissionGuard],
        data : {
          title : 'Process Approvals',
          Permission: { Only: ['PROCESS_APPROVALS_MANAGE'] } as IPermissionGuardModel
        }
      },
      {
        path : 'notifications-assign', component : NotificationsComponent, canActivate: [AuthGuard, PermissionGuard],
        data : {
          title : 'Notifications Assign',
          Permission: { Only: ['NOTIFICATIONS_ASSIGN_VIEW'] } as IPermissionGuardModel
        }
      }
    ]}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }

export const AdminRoutingComponents = [
  RoleHomeComponent
]

/*
export const financeRoutingComponents = [
  UserComponent


];*/
