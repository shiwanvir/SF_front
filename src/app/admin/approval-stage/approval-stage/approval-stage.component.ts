import { Component, OnInit } from '@angular/core';

import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subject, Observable, of, concat } from 'rxjs';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map } from 'rxjs/operators';

import {SnotifyService , SnotifyPosition} from 'ng-snotify';

import { AppFormValidator } from '../../../core/validation/app-form-validator';
import { PrimaryValidators } from '../../../core/validation/primary-validators';
import { AppConfig } from '../../../core/app-config';
import { AppAlert } from '../../../core/class/app-alert';
import { ApprovalStageService } from '../approval-stage.service';

//models
import { User } from '../../models/user.model';

@Component({
  selector: 'app-approval-stage',
  templateUrl: './approval-stage.component.html',
  styleUrls: ['./approval-stage.component.css']
})
export class ApprovalStageComponent implements OnInit {

  formGroup : FormGroup
  apiUrl = AppConfig.apiUrl()
  formValidator : AppFormValidator
  saveStatus = 'SAVE'
  processing : boolean = false

  userList = []
  //categoryPermissionList = []

  //toster plugin
  tosterConfig = { timeout: 2000, showProgressBar: false, closeOnClick: false , position: SnotifyPosition.rightTop,}


  user$: Observable<User[]>;
  userLoading = false;
  userInput$ = new Subject<string>();
  selectedUser:User

  constructor(private fb:FormBuilder, private http:HttpClient, private approvalStageService:ApprovalStageService, private snotifyService: SnotifyService) { }

  ngOnInit() {

    this.initializeForm()

    this.approvalStageService.role_data.subscribe(data => {
      if(data != null){
        this.loadApprovalStage(data.stage_id)
        this.saveStatus = 'UPDATE'
      }
    })

    this.loadUsers()
  }


  initializeForm(){
    let remoteValidationConfig = { //configuration for location code remote validation
      url:this.apiUrl + 'admin/approval-stages/validate?for=duplicate',
      //formFields : this.formFields,
      fieldCode : 'stage_name',
      /*error : 'Group code already exists',*/
      data : {
        stage_id : function(controls){ return controls['stage_id']['value']}
      }
    }

    let primaryValidator = new PrimaryValidators(this.http)//create object of basic validation class

    this.formGroup = this.fb.group({
      stage_id : 0,
      stage_name : [null, [Validators.required, PrimaryValidators.noSpecialCharactor],[primaryValidator.remote(remoteValidationConfig)]]
    })
    this.formValidator = new AppFormValidator(this.formGroup, {});
  }


  newApprovalStage(){
    AppAlert.showConfirm({
      'text' : 'Do you want to clear unsaved data?'
    },
    (result) => {
      if (result.value) {
        this.formGroup.reset()
        this.userList = []
        this.saveStatus = 'SAVE'
      }
    })
  }


  save() {
    if(!this.formValidator.validate())//if validation faild return from the function
      return;
    this.processing = true
    AppAlert.showMessage('Processing...','Please wait while saving details')
    let saveOrUpdate$ = null;
    let data = {
      'formData' : this.formGroup.getRawValue(),
      'approvalUsers' : this.userList
    }
    console.log(data)
    if(this.saveStatus == 'SAVE'){
      saveOrUpdate$ = this.http.post(this.apiUrl + 'admin/approval-stages', data)
    }
    else if(this.saveStatus == 'UPDATE'){
      let stageId = this.formGroup.get('stage_id').value
      saveOrUpdate$ = this.http.put(this.apiUrl + 'admin/approval-stages/' + stageId , data)
    }

    saveOrUpdate$.
    pipe( map(res => res['data'] )).
    subscribe(
      (data) => {
        this.processing = false
        //this.formGroup.reset();
        this.formGroup.setValue({
          stage_id : data.approval_stage.stage_id,
          stage_name : data.approval_stage.stage_name
        })
        this.saveStatus = 'UPDATE'
        setTimeout(() => {
          AppAlert.closeAlert()
          AppAlert.showSuccess({text : data.message })
        } , 500)

     },
     (error) => {
        this.processing = false
         AppAlert.closeAlert()
         AppAlert.showError({text : 'Process Error' })
         console.log(error)
     }
   );
  }

  loadUsers() {
     this.user$ = concat(
         of([]), // default items
         this.userInput$.pipe(
            debounceTime(200),
            distinctUntilChanged(),
            tap(() => this.userLoading = true),
            switchMap(term => this.http.get<User[]>(this.apiUrl + 'admin/users?type=auto_has_login',{params:{search:term}}).pipe(
                catchError(() => of([])), // empty list on error
                tap(() => this.userLoading = false)
            ))
         )
     );
   }

   onChange(e){
     console.log(e)
     if(e != null){
       for(var i = 0; i < this.userList.length; i++) {
          if (this.userList[i].user_id == e.user_id) {
            AppAlert.showError({text : 'Duplicate user' })
            return;
          }
      }
       e.user_order = this.userList.length + 1
       this.userList.push(e)
     }
   }

   changeOrder(_index, type){
     console.log(_index + " " + type)
     if(type == 'UP'){
       if(_index > 0) {
         let arrItem = this.userList[_index - 1]
         this.userList[_index - 1] = this.userList[_index]
         this.userList[_index] = arrItem
       }
     }
     else if(type == 'DOWN'){
       if(_index < (this.userList.length - 1)) {
         let arrItem = this.userList[_index + 1]
         this.userList[_index + 1] = this.userList[_index]
         this.userList[_index] = arrItem
       }
     }
   }


   removeUser(_index){
     AppAlert.showConfirm({
       'text' : 'Do you want to remove ' + this.userList[_index].first_name + ' from the list?'
     },
     (result) => {
       if (result.value) {
         this.userList.splice(_index,1)
       }
     })
   }


   loadApprovalStage(stageId){
     this.http.get(this.apiUrl + 'admin/approval-stages/' + stageId)
     .subscribe(
       data => {
         this.formGroup.setValue({
           'stage_id' : data['approval_stage']['stage_id'],
           'stage_name' : data['approval_stage']['stage_name']
         })
         this.userList = data['users']
       },
       error => {
         AppAlert.showError({text : 'Process Error' })
       }
     )
   }

}
