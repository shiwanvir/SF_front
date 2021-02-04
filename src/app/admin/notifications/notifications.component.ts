import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable , Subject } from 'rxjs';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map} from 'rxjs/operators';

import { HotTableRegisterer } from '@handsontable/angular';
import * as Handsontable from 'handsontable';

import { AppConfig } from '../../core/app-config';
import { AppAlert } from '../../core/class/app-alert';
import { AppFormValidator } from '../../core/validation/app-form-validator';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {

  readonly apiUrl = AppConfig.apiUrl()
  formGroup : FormGroup
  appValidator: AppFormValidator
  processing : boolean = false

  instance: string = 'instance'
  data: any[] = [];
  settings: any

  users$: Observable<any[]>;//use to load upcharge reason in ng-select
  usersLoading = false;
  usersInput$ = new Subject<string>();
  notificationTypes$: Observable<any[]>;

  constructor(private http:HttpClient, private fb:FormBuilder) { }

  ngOnInit() {

    this.formGroup = this.fb.group({
      type : [null, [Validators.required]],
      user_id : [null, [Validators.required]]
    })
    this.appValidator = new AppFormValidator(this.formGroup, []);

    this.initializeTable()
    this.loadUsers()
    this.loadNotificationTypes()

  }

  initializeTable(){
    this.settings = {
      data:this.data,
      columns:[
        { title : 'First Name', data : 'first_name', type: 'text' },
        { title : 'Last Name', data : 'last_name', type: 'text' },
        { title : 'User Name', data : 'user_name', type: 'text' },
      ],
      contextMenu : {
        callback: function (key, selection, clickEvent) {
          // Common callback for all options
        },
        items : {
          'remove' : {
            name : 'Remove',
            hidden: (key, selection, clickEvent) => {
                return this.data.length == 0 ? true : false;
            },
            callback : (key, selection, clickEvent) => {
              if(selection.length > 0){
                let start = selection[0].start;
                let end = selection[0].end;
                //chek user right click on merged cell
                if(start.row == end.row) {
                  AppAlert.showConfirm({
                    'text' : 'Do you want to remove this user?'
                  },(result) => {
                    if (result.value) {
                      this.removeUser(this.data[start.row]['id'])
                    }
                  })

                }

              }
            }
          },
        }
      },
      rowHeaders: true,
      colHeaders: ['Operation','Component','Quality','Price'],
      filters: true,
      dropdownMenu: true,
      manualColumnResize: true,
      autoColumnSize : true,
      height: 300,
      copyPaste: true,
      stretchH: 'all',
      selectionMode: 'range',
      className: 'htMiddle',
      readOnly: true
    }
  }


  loadUsers(){
     this.users$ = this.usersInput$
       .pipe(
          debounceTime(200),
          distinctUntilChanged(),
          tap(() => this.usersLoading = true),
          switchMap(term => this.http.get<any[]>(this.apiUrl + 'admin/users?type=autoimmidiateReport' , {params:{search:term, category_code : 'COSTING_UPCHARGE'}})
          .pipe(
              tap(() => this.usersLoading = false)
          ))
       );
   }


   loadNotificationTypes() {
     this.notificationTypes$ = this.http.get<any[]>(this.apiUrl + 'admin/notification-assign?type=types')
       .pipe(map(res => res['data']))
   }

   assignUser(){
    this.processing = true
    let formData = {
      type : this.formGroup.get('type').value,
      user_id : this.formGroup.get('user_id').value.user_id
    }
    this.http.post(this.apiUrl + 'admin/notification-assign', formData)
    .pipe( map(res => res['data']) )
    .subscribe(
       data => {
         this.processing = false
         if(data.status == 'success'){
           AppAlert.showSuccess({ text : data.message })
           //this.formGroup.reset();
           this.data = data.users
         }
         else{
           AppAlert.showError({text : data['message'] })           ;
          }
       },
       error => {
         this.processing = false
         AppAlert.closeAlert()
         console.log(error)
         if(error.status == 422){ //validation error
           AppAlert.showError({title : 'Validation Error' , text : error.error.errors.validationErrorsText })
         }
         else{
           AppAlert.showError({text : 'Process Error' })
         }
       }
   );
   }


   loadAssignedUsers(){
     let type = this.formGroup.get('type').value
     this.http.get<any[]>(this.apiUrl + 'admin/notification-assign?type=assigned_users&notification_type=' + type)
     //.pipe(map(res => res['data']))
     .subscribe(
       res => {
         this.data = res['data']
       },
       error => {
         console.log(error)
       }
     )
   }


   removeUser(_id){
     this.http.delete(this.apiUrl + 'admin/notification-assign/' + _id)
     .pipe(map(data=>data['data']))
     .subscribe(data => {
       if(data.status == 'success'){
         this.data = data.users
         AppAlert.showSuccess({ text : data.message })
       }
       else{
         AppAlert.showError({ text : data.message })
       }
     })
   }

}
