import { Component, OnInit,ViewChild,OnDestroy } from '@angular/core';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

//third part components
import { ModalDirective } from 'ngx-bootstrap/modal';
declare var $:any;

import { AppFormValidator } from '../../core/validation/app-form-validator';
import { PrimaryValidators } from '../../core/validation/primary-validators';
import { AppConfig } from '../../core/app-config';
import { AppAlert } from '../../core/class/app-alert';

import { PermissionsService } from '../../core/service/permissions.service';
import { AuthService } from '../../core/service/auth.service';
import { HostListener } from '@angular/core';
import { LayoutChangerService } from '../../core/service/layout-changer.service';

@Component({
  selector: 'app-cluster',
  templateUrl: './cluster.component.html',
  styleUrls: ['../../../styles/validation.css']
})
export class ClusterComponent implements OnInit {

  @ViewChild(ModalDirective) clusterModel: ModalDirective;
  @HostListener('window:resize', ['$event'])


  formGroup : FormGroup
  popupHeaderTitle : string = "New Cluster"
  apiUrl = AppConfig.apiUrl()
  appFormValidator : AppFormValidator
  sourceList$:Observable<Array<any>>//observable to featch source list
  datatable : any = null
  saveStatus = 'SAVE'
  loading : boolean = false
  processing : boolean = false
  loadingCount : number = 0
   public innerWidth: any;
  constructor(private fb:FormBuilder , private http:HttpClient, private permissionService:PermissionsService, private auth : AuthService,private layoutChangerService : LayoutChangerService) { }

  ngOnInit() {

    this.initializeForm()
    this.loadModelData()

    this.innerWidth = window.innerWidth;

    this.layoutChangerService.headerMinButtonEvent.subscribe(data => {
    if(this.datatable != null){
    this.datatable.draw(false);
  }
})

  }


  initializeForm(){
    let remoteValidationConfig = { //configuration for location code remote validation
      url:this.apiUrl + 'org/clusters/validate?for=duplicate',
      //formFields : this.formFields,
      fieldCode : 'group_code',
      error : 'Cluster code already exists',
      data : {
        group_id : function(controls){ return controls['group_id']['value']}
      }
    }

    let primaryValidator = new PrimaryValidators(this.http)//create object of basic validation class

    this.formGroup = this.fb.group({
      group_id : 0,
      group_code : [null , [Validators.required, Validators.minLength(3), Validators.maxLength(10), PrimaryValidators.noSpecialCharactor],[primaryValidator.remote(remoteValidationConfig)]],
      group_name : [null , [Validators.required,Validators.minLength(3), Validators.maxLength(255), PrimaryValidators.noSpecialCharactor]],
      source_id : [null , [Validators.required]]
    })
    //create new validation object
    this.appFormValidator = new AppFormValidator(this.formGroup, {});
  }


  //load data for slect boxes when open the model
  async loadModelData(){
    this.loading = true
    this.loadingCount = 0
    AppAlert.showMessage('<i class="icon-spinner2 spinner text-info"></i> Loading...','Please wait while loading data')
    this.sourceList$ = this.getSourceList()
  }


  //chek all data were loaded, if loaded active save button
  checkLoadingStatus(){
    if(this.loadingCount >= 1){
      this.loading = false
      this.loadingCount = 0
      setTimeout(() => {
        AppAlert.closeAlert()
      } , 500)
    }
  }

  ngOnDestroy(){
      this.datatable = null
  }


  createTable() { //initialize datatable
     this.datatable = $('#cluster_tbl').DataTable({
     // autoWidth: true,
     scrollY: "500px",
     scrollCollapse: true,
     processing: true,
     serverSide: true,
     order : [[ 5, 'desc' ]],
     columnDefs:[{
       targets:5,
       render:function(data){
         const date = new Date(data);
         const formattedDate = date.toLocaleDateString('en-GB', {day: '2-digit', month: 'short', year: 'numeric'}).replace(/ /g, '-');
         return formattedDate;
     }}],
     ajax: {
          headers: {'Authorization':`Bearer ${this.auth.getToken()}`},
          dataType : 'JSON',
          "url": this.apiUrl + "org/clusters?type=datatable"
      },
       columns: [
            {
              data: "group_id",
              width: '3%',
              render : (data,arg,full) => {
                var str = '';
                if(this.permissionService.hasDefined('CLUSTER_EDIT')){
                  str = '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="EDIT" data-id="'+data+'"></i>';
              }
                if(this.permissionService.hasDefined('CLUSTER_DELETE')){
                  str += '<i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer" \
                  data-action="DELETE" data-id="'+data+'" data-status="'+full['status']+'" ></i>';
                }
                return str;
             }
           },
           {
             data: "status",
             render : function(data){
               if(data == 1){
                   return '<span class="label label-success">Active</span>';
               }
               else{
                 return '<span class="label label-default">Inactive</span>';
               }
             }
          },
          { data: "group_code" },
          { data: "group_name" },
          { data: "source_name" },
          { data: "created_date" }
       ]
     });

     //listen to the click event of edit and delete buttons
     $('#cluster_tbl').on('click','i',e => {
        let att = e.target.attributes;
        if(att['data-action']['value'] === 'EDIT'){
           this.edit(att['data-id']['value']);
        }
        else if(att['data-action']['value'] === 'DELETE'){
           this.delete(att['data-id']['value'], att['data-status']['value']);
        }
     });
  }

  reloadTable() {//reload datatable
  	  this.datatable.ajax.reload(null, false);
  }


  getSourceList():Observable<Array<any>>{
    return this.http.get<any[]>(this.apiUrl + 'org/sources?active=1&fields=source_id,source_name')
    .pipe(
      map( res => res['data']),
      tap( res => {
        this.loadingCount++
        this.checkLoadingStatus()
      })
    )
  }

  getSourceList_auto(){

    this.sourceList$ = this.http.get<any[]>(this.apiUrl + 'org/sources?active=1&fields=source_id,source_name')
                      .pipe(
                        map( res => res['data']),
                        tap( res => {
                          this.loadingCount++
                          this.checkLoadingStatus()
                        })
                      )


  }

  //save and update source details
  saveCluster(){
    if(!this.appFormValidator.validate())//if validation faild return from the function
      return;
    this.processing = true
    AppAlert.showMessage('Processing...','Please wait while saving details')
    let saveOrUpdate$ = null;
    let clusterId = this.formGroup.get('group_id').value
    //alert(this.saveStatus );
    if(this.saveStatus == 'SAVE'){
      saveOrUpdate$ = this.http.post(this.apiUrl + 'org/clusters', this.formGroup.getRawValue())

    }
    else if(this.saveStatus == 'UPDATE'){
      saveOrUpdate$ = this.http.put(this.apiUrl + 'org/clusters/' + clusterId , this.formGroup.getRawValue())
    }

    saveOrUpdate$.subscribe(
      (res) => {

        if(res.data['status']=="0"){
          AppAlert.showError({text:"Cluster already in use"})
          this.processing = false
          this.formGroup.reset();
          this.reloadTable()
          this.clusterModel.hide()
        }else{


        this.processing = false
        this.formGroup.reset();
        this.clusterModel.hide()
        this.reloadTable()
        setTimeout(() => {
          AppAlert.closeAlert()
          AppAlert.showSuccess({text : res.data.message })
        } , 500)

      }
     },
     (error) => {
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

  onResize(event) {
    this.innerWidth = window.innerWidth;
    //debugger
      if(this.datatable!=null){
     this.reloadTable()
    //event.target.innerWidth;
  }
  }

  edit(id) { //get payment term data and open the model
    this.http.get(this.apiUrl + 'org/clusters/' + id)
    .pipe(map( data => data['data'] ))
    .subscribe(data => {
      if(data['status'] == '1')
      {
        //debugger;
        this.saveStatus = 'UPDATE'
        this.clusterModel.show()
        this.popupHeaderTitle = "Update Cluster"
        this.formGroup.get('group_code').disable()
        this.formGroup.setValue({
         'group_id' : data['group_id'],
         'group_code' : data['group_code'],
         'group_name' : data['group_name'],
         'source_id' : data['source_id']
        })

      }
    })
  }

  delete(id, status) { //deactivate payment

    if(status == 0)
      return

    AppAlert.showConfirm({
      'text' : 'Do you want to deactivate selected Cluster?'
    },(result) => {
      if (result.value) {
        AppAlert.showMessage('Processing...','Please wait while deleting cluster')
        this.http.delete(this.apiUrl + 'org/clusters/' + id)
        .subscribe(
            (data) => {
              if(data['data']['status'] == "0"){

                  AppAlert.showError({text:"Cluster already in use"})
                }else{
                  this.reloadTable()
                  AppAlert.closeAlert()
                }
            },
            (error) => {
              AppAlert.closeAlert()
              AppAlert.showError({ text : 'Process Error' })
              //console.log(error)
            }
        )
      }
    })

  }

  showEvent(event){ //show event of the bs model
    this.formGroup.get('group_code').enable()
    this.formGroup.reset();
    this.popupHeaderTitle = "New Cluster"
    //this.saveStatus = "UPDATE"
    // this.loadModelData()
  }

}
