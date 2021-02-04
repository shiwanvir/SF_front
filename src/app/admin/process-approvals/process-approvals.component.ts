import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subject, Observable, of, concat } from 'rxjs';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map } from 'rxjs/operators';

import { AppConfig } from '../../core/app-config';
import { AppAlert } from '../../core/class/app-alert';

@Component({
  selector: 'app-process-approvals',
  templateUrl: './process-approvals.component.html',
  styleUrls: ['./process-approvals.component.css']
})
export class ProcessApprovalsComponent implements OnInit {

  formGroup : FormGroup
  apiUrl = AppConfig.apiUrl()
  saveStatus = 'SAVE'
  processing : boolean = false

  processList = []
  approvalStageList = []
  selectedApprovalStage : number = 0
  approvelLevels = []
  currentProcess = null

  constructor(private http : HttpClient, private titleService: Title) { }

  ngOnInit() {
    this.titleService.setTitle("Process Approvals")//set page title
    this.loadProcessList()
    this.loadApprovalStageList()
  }


  loadProcessList(){
    this.http.get(this.apiUrl + 'admin/process-approvals?type=process')
    .pipe(map(res => res['data']))
    .subscribe(
      data => {
        this.processList = data
      },
      error => {
        AppAlert.showError({text : 'Process Error' })
      }
    )
  }


  loadApprovalStageList(){
    this.http.get(this.apiUrl + 'admin/process-approvals?type=approval_stages')
    .pipe(map(res => res['data']))
    .subscribe(
      data => {
        this.approvalStageList = data
      },
      error => {
        AppAlert.showError({text : 'Process Error' })
      }
    )
  }

  addNewLevel(){
    if(this.selectedApprovalStage > 0){
      this.approvelLevels.push(this.approvalStageList[this.selectedApprovalStage])
      //console.log(this.approvalStageList[this.selectedApprovalStage])
    }
  }

  changeProcess(processName){
    this.currentProcess = processName
    this.loadApprovallevels(processName)
  }

  removeStage(stageIndex){
    this.approvelLevels.splice(stageIndex, 1)
  }

  save(){
    if(this.approvelLevels.length <= 0){
      AppAlert.showError({text : 'Must enter at least one level' })
    }
    else{
      this.processing = true
      let submitData = {
        process : this.currentProcess,
        levels : this.approvelLevels
      }
      AppAlert.showMessage('Processing...','Please wait while saving details')
      this.http.post(this.apiUrl + 'admin/process-approvals', submitData)
      .pipe( map(res => res['data'] )).
      subscribe(
        (data) => {
          this.processing = false
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
  }


  loadApprovallevels(process){
    this.processing = true
    AppAlert.showMessage('Processing...','Please wait while loading details')
    this.http.get(this.apiUrl + 'admin/process-approvals?type=process_levels&process=' + process)
    .pipe(map(res => res['data']))
    .subscribe(
      data => {
        this.approvelLevels = data
        this.processing = false
      //  setTimeout(() => {
        AppAlert.closeAlert()
      //  } , 500)
      },
      error => {
        AppAlert.closeAlert()
        AppAlert.showError({text : 'Process Error' })
        this.processing = false
      }
    )
  }

}
