import { Component, OnInit, ViewChild,OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

//third part components
import { ModalDirective } from 'ngx-bootstrap/modal';
import {ComponentLoaderFactory} from 'ngx-bootstrap/component-loader';
import {PositioningService} from 'ngx-bootstrap/positioning';
import { LayoutChangerService } from '../../core/service/layout-changer.service';
import * as Handsontable from 'handsontable';
import { HotTableRegisterer } from '@handsontable/angular';
declare var $:any;

import { AppValidator } from '../../core/validation/app-validator';

import { AppFormValidator } from '../../core/validation/app-form-validator';
import { BasicValidators } from '../../core/validation/basic-validators';
import { PrimaryValidators } from '../../core/validation/primary-validators';
import { AppConfig } from '../../core/app-config';
import { AppAlert } from '../../core/class/app-alert';
import { PermissionsService } from '../../core/service/permissions.service';
import { AuthService } from '../../core/service/auth.service';
import { Observable, Subject } from 'rxjs';
import { debounceTime } from 'rxjs/internal/operators/debounceTime';
import { distinctUntilChanged } from 'rxjs/internal/operators/distinctUntilChanged';
import { tap } from 'rxjs/internal/operators/tap';
import { switchMap } from 'rxjs/internal/operators/switchMap';
declare var XLSX:any;
declare var XLS:any;


@Component({
  selector: 'app-operation-sub-component',
  templateUrl: './operation-sub-component.component.html',
  styleUrls: ['./operation-sub-component.component.css']
})
export class OperationSubComponentComponent implements OnInit {

  @ViewChild(ModalDirective) garmentOperationModel: ModalDirective;
  @ViewChild(ModalDirective) xlUploadModel: ModalDirective;

  formValidator : AppFormValidator = null
  formValidatorXlUpload : AppFormValidator = null
  formGroup : FormGroup
  formGroupXlUp : FormGroup
  modelTitle : string = "New Operation Sub Component"
  modelTitleXl : string = "New Excel Upload"
  readonly apiUrl = AppConfig.apiUrl()
  appValidator : AppValidator
  appValidatorXlUpload : AppValidator
  datatable:any = null
  saveStatus = 'SAVE'
  processing : boolean = false
  loading : boolean = false
  updateMode:boolean=false
  loadingCount : number = 0
  initialized : boolean = false
  disableSave=true;
  operationCompoent$: Observable<any[]>;//use to load customer list in ng-select
  operationCompoentLoading = false;
  operationCompoentInput$ = new Subject<string>();
  selectedOperationCompoent: any[]

  instance: string = 'instance';
  hotOptions: any
  dataset: any[] = [];
  currentDataSetIndexMaintable:number=-1

  //to manage form error messages
  formFields = {
        operation_component_id:'',
        operation_sub_component_code: '',
        operation_sub_component_name:'',
        validation_error:''
  }
  formFieldsXlUpload={
    xl_sheet_id:'',
    file_name:''
  }

  constructor(private fb:FormBuilder , private http:HttpClient,private hotRegisterer: HotTableRegisterer,private permissionService : PermissionsService,
    private auth : AuthService,private layoutChangerService : LayoutChangerService, private titleService: Title) { }

    ngOnInit() {
      this.titleService.setTitle("Operation Sub Component")//set page title

      let primaryValidator = new PrimaryValidators(this.http)//create object of basic validation class
      let remoteValidationConfig = { //configuration for location code remote validation
        url:this.apiUrl + 'ie/garment_operation_sub_components/validate?for=duplicate',
        formFields : this.formFields,
        fieldCode : 'operation_sub_component_code',
        /*error : 'Dep code already exists',*/
        data : {
          operation_component_id : function(controls){ return controls['operation_component_id']['value']['operation_component_id']},
          operation_sub_component_id:function(controls){ return controls['operation_sub_component_id']['value']},
          operation_sub_component_code : function(controls){ return controls['operation_sub_component_code']['value']}
        }
      }

      this.layoutChangerService.headerMinButtonEvent.subscribe(data => {
        if(data == false){return;}
            const hotInstance = this.hotRegisterer.getInstance(this.instance);
            if(hotInstance != undefined && hotInstance != null){
              hotInstance.render(); //refresh fg items table
            }
            if(this.datatable != null){
              this.datatable.draw(false);
            }

      })

          let basicValidator = new BasicValidators(this.http)//create object of basic validation class

          this.formGroup = this.fb.group({
            operation_sub_component_id : 0,
            operation_sub_component_code : [null , [Validators.required,Validators.maxLength(15),BasicValidators.noWhitespace,PrimaryValidators.noSpecialCharactor],[primaryValidator.remote(remoteValidationConfig)]],
            operation_component_id : [null , [Validators.required]],
            operation_sub_component_name:[null , [Validators.required,Validators.maxLength(50)]],
                    })


          this.formGroupXlUp=this.fb.group({
            xl_sheet_id:0,
            file_name:[null , [Validators.required]],
          })
          this.formValidator = new AppFormValidator(this.formGroup , {});

          this.formValidatorXlUpload = new AppFormValidator(this.formGroupXlUp , {});
          //create new validation object
          this.appValidator = new AppValidator(this.formFields,{},this.formGroup);
          this.appValidatorXlUpload = new AppValidator(this.formFieldsXlUpload,{},this.formGroupXlUp);

          this.formGroup.valueChanges.subscribe(data => { //validate form when form value changes
            this.appValidator.validate();
          })
          this.formGroup.valueChanges.subscribe(data=>{
            this.appValidatorXlUpload.validate();

          })
          if(this.permissionService.hasDefined('OPERATION_SUB_COMPONENT_VIEW')){
          this.createTable() //load data list
        }
          //change header nevigation pagePath
          this.layoutChangerService.changeHeaderPath([
            'Catalogue',
            'IE',
            'Operation Sub Component'
          ])

          this.layoutChangerService.headerMinButtonEvent.subscribe(data => {
            if(data == false){return;}
            if(this.datatable != null){
              this.datatable.draw(false);
            }
          })

        this.loadOperationComponaent();
        this.initializeOrderLinesTable();
    }
    ngOnDestroy(){
        this.datatable = null
    }

    createTable() { //initialize datatable
       this.datatable = $('#garment_operation_tbl').DataTable({
        autoWidth: true,
         scrollY: "500px",
         scrollCollapse: true,
         scrollX: true,
         processing: true,
         serverSide: true,
         paging:true,
         searching:true,
         order:[[6,'desc']],
         ajax: {
              dataType : 'JSON',
              "url": this.apiUrl + "ie/garment_sub_operation_components?type=datatable"
          },
          columns: [
              {
                data: "operation_sub_component_id",
                orderable: true,
                width: '3%',
                render : (data,arg,full)=>{
                  var str = '';
                  if(this.permissionService.hasDefined('OPERATION_SUB_COMPONENT_EDIT')){
                      str = '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="EDIT" data-id="'+data+'" data-status="'+full['status']+'" data-approval-status="'+full['approval_status']+'" ></i>';

                            if( full.status== 0||full.approval_status=="PENDING" ) {
                              str = '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:not-allowed;margin-right:3px" data-action="DISABLE" data-id="'+data+'">\n\
                              </i><i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:not-allowed" data-action="DISABLE" data-id="'+data+'"></i>';
                              }

                }
                  if(this.permissionService.hasDefined('OPERATION_SUB_COMPONENT_DELETE')){
                     str += '<i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer" data-action="DELETE" data-id="'+data+'" data-status="'+full['status']+'"></i>';

                         if( full.status== 0||full.approval_status=="PENDING" ) {
                           str = '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:not-allowed;margin-right:3px" data-action="DISABLE" data-id="'+data+'">\n\
                           </i><i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:not-allowed" data-action="DISABLE" data-id="'+data+'"></i>';
                             }

                }

                  return str;
               }
             },
             {
               data: "status",
               orderable: true,
               render : function(data){
                 if(data == 1){
                     return '<span class="label label-success">Active</span>';
                 }
                 else{
                   return '<span class="label label-default">Inactive</span>';
                 }
               }
            },
            {
              data: "approval_status",
              orderable: true,
              render : function(data){
                if(data == "APPROVED"){
                    return '<span class="label label-success">Approved</span>';
                }
                else if(data == "PENDING"){
                    return '<span class="label label-warning">Pending</span>';
                }
                else{
                  return '<span class="label label-danger">Rejected</span>';
                }
              }
           },
            //{ data: "service_type_code" },
            { data: "operation_component_code"},
            { data: "operation_sub_component_code"},
            { data: "operation_sub_component_name"},
            {data:"created_date",
             visible: false,
          }

         ],
       });

       //listen to the click event of edit and delete buttons
       $('#garment_operation_tbl').on('click','i',e => {
          let att = e.target.attributes;
          if(att['data-action']['value'] === 'EDIT'){
            //debugger
              this.edit(att['data-id']['value'],att['data-status']['value'],att['data-approval-status']['value']);
          }
          else if(att['data-action']['value'] === 'DELETE'){
              this.delete(att['data-id']['value'],att['data-status']['value']);
          }
       });
    }

    reloadTable() {//reload datatable
        this.datatable.ajax.reload(null, false);
    }






      edit(id,status,approval_status){
        if(status==0||approval_status=="PENDING"){
          return 0;
        }
        this.http.get(this.apiUrl + 'ie/garment_sub_operation_components/' + id )
        .pipe( map(res => res['data']) )
        .subscribe(data => {
          //debugger
          if(data!=null){
            this.garmentOperationModel.show();
            this.formGroup.setValue({
              operation_component_id:data.oprationComponent,
              operation_sub_component_id:data.header.operation_sub_component_id,
              operation_sub_component_code:data.header.operation_sub_component_code,
              operation_sub_component_name:data.header.operation_sub_component_name
              })
              this.formGroup.get('operation_component_id').disable()
              this.formGroup.get('operation_sub_component_code').disable()
              this.dataset=data.detail;
              this.updateMode=true;
               const hotInstance = this.hotRegisterer.getInstance(this.instance);
               setTimeout(() => {
                 hotInstance.render();
                      }, 200)
          //  this.formGroup.get('operation_component_id').disable();
            this.saveStatus = 'UPDATE';
            this.modelTitle="Update Operation Sub Component"
          }

        })
      }

      delete(id,status){
        if(status==0){
          return
        }
        AppAlert.showConfirm({
          'text' : 'Do you want to deactivate selected Operation Sub Component?'
        },
        (result) => {
          if (result.value) {
            this.http.delete(this.apiUrl + 'ie/garment_sub_operation_components/' + id)
            .pipe(map( data => data['data'] ))
            .subscribe(
                (data) => {
                  if(data.status=='1'){
                    this.reloadTable()
                  }
                  else if(data.status=='0'){
                    AppAlert.showError({text:data.message})
                    this.reloadTable()
                  }

                },
                (error) => {
                  console.log(error)
                }
            )
          }
        })
      }


        save(){
        //  debugger
        if(this.dataset.length==0){
          AppAlert.showError({text:"Please Complete the Grid"});
          return 0;
        }
        //debugger
       for(var i=0;i<this.dataset.length;i++){
         if(this.dataset[i]['operation_name']==null||this.dataset[i]['operation_name']==''||this.dataset[i]['machine_type_name']==null||this.dataset[i]['machine_type_name']==''||this.dataset[i]['operation_code']==''||this.dataset[i]['operation_code']==null){
           AppAlert.showError({text:"Please Complete the Grid"});
           return 0;
         }
       }
        //  debugger
          var a=this.dataset;
          this.processing = true
          AppAlert.showMessage('Processing...','Please wait while saving details')
          let saveOrUpdate$ = null;
          var formData=this.formGroup.getRawValue();
          formData['operation_component_id']=formData['operation_component_id']['operation_component_id']
          let operationSubComponentId = this.formGroup.get('operation_sub_component_id').value
          if(this.saveStatus == 'SAVE'){
            saveOrUpdate$ = this.http.post(this.apiUrl + 'ie/garment_sub_operation_components',{'header':formData ,'detail':this.dataset})
          }
          else if(this.saveStatus == 'UPDATE'){
            saveOrUpdate$ = this.http.put(this.apiUrl + 'ie/garment_sub_operation_components/' + operationSubComponentId ,{'header': formData,'detail':this.dataset})
          }


          saveOrUpdate$.subscribe(
            (res) => {
             debugger
              if(res.data.status==1){
              this.processing=false;
              AppAlert.showSuccess({text : res.data.message })
             this.clear()
              this.reloadTable()
              this.garmentOperationModel.hide()
            }
            else if(res.data.status==0){
              this.processing=false;
              AppAlert.showError({text : res.data.message })
              this.clear()
              this.reloadTable()
              this.garmentOperationModel.hide()
            }
           },
           (error) => {
             if(error.status == 422){ //validation error
               AppAlert.showError({title : 'Validation Error' , text : error.error.errors.validationErrorsText })
             }else{
               console.log(error)
               AppAlert.showError({text : 'Process Error' })
             }
           }
         );



        }

        onFileChange(event) {

          let reader = new FileReader();
          if(event.target.files && event.target.files.length > 0) {
            let file = event.target.files[0];
          //  debugger
            if(file['type'] != 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'){
              AppAlert.showError({text:"Invalid File Format"})
              this.formGroupXlUp.reset()
              return;
            }
            if(file['size'] > 2000000 ){
              AppAlert.showError({text:"Excel File size must be less than 2MB "})
              return;
            }



          }
        }


        ExportToTable() {
          AppAlert.showMessage('Processing...','Please wait while Uploading details')
          var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.xlsx|.xls)$/;

         /*Checks whether the file is a valid excel file*/
         if (regex.test($("#excelfile").val().toLowerCase())) {
             var xlsxflag = false; /*Flag for checking whether excel is .xls format or .xlsx format*/
             if ($("#excelfile").val().toLowerCase().indexOf(".xlsx") > 0) {
                 xlsxflag = true;
             }
             /*Checks whether the browser supports HTML5*/
             if (typeof (FileReader) != "undefined") {
                 var reader = new FileReader();
                 reader.onload =  (e) => {
                     var data = e.target['result'];
                     //console.log(data)
                     /*Converts the excel data in to object*/
                     if (xlsxflag) {
                         var workbook = XLSX.read(data, { type: 'binary' });
                     }
                     else {
                         var workbook = XLS.read(data, { type: 'binary' });
                     }
                     /*Gets all the sheetnames of excel in to a variable*/
                     var sheet_name_list = workbook.SheetNames;


                     var cnt = 0; /*This is used for restricting the script to consider only first sheet of excel*/
                     sheet_name_list.forEach( (y) => { /*Iterate through all sheets*/
                         /*Convert the cell value to Json*/
                         if (xlsxflag) {
                             var exceljson = XLSX.utils.sheet_to_json(workbook.Sheets[y]);
                         }
                         else {
                             var exceljson = XLS.utils.sheet_to_row_object_array(workbook.Sheets[y]);
                         }
                         if (exceljson.length > 0 && cnt == 0) {

                              //console.log(exceljson)
                              this.upload(exceljson);
                              //this.BindTable(exceljson, '#exceltable');


                             cnt++;
                         }
                     });
                     //$('#exceltable').show();
                 }
                 if (xlsxflag) {/*If excel file is .xlsx extension than creates a Array Buffer from excel*/
                     reader.readAsArrayBuffer($("#excelfile")[0].files[0]);
                 }
                 else {
                     reader.readAsBinaryString($("#excelfile")[0].files[0]);
                 }
             }
             else {
                  AppAlert.showError({text:"Sorry! Your browser does not support HTML5!"})
                //alert("");
             }
         }
         else {
           AppAlert.showError({text:"Invalid Excel Upload"})
             //alert("");
         }


        }


        upload(data){
        //  debugger
          //var k=data[0]['Sub Category'];
          for(var i=0;i<data.length;i++){
      if(data[i]['Sub Category']!=undefined){
      if(data[i]['Sub Category'].length>50){
          this.formGroupXlUp.reset();
          AppAlert.showError({text:"Sub Category Greater Than Maximum Length"})
          return 0;
      }
    }
       if(data[i]['Operations']!=undefined){
        if(data[i]['Operations'].length>100){
            this.formGroupXlUp.reset();
          AppAlert.showError({text:"Operation Greater Than Maximum Length"})
          return 0;
        }
      }
       if(data[i]['Options']!=undefined){
        if(data[i]['Options'].length>50){
            this.formGroupXlUp.reset();
          AppAlert.showError({text:"Option Greater Than Maximum Length"})
          return 0;
        }
      }
       if(data[i]['Cost SMV']!=undefined){
        if(isNaN(data[i]['Cost SMV'])){
          this.formGroupXlUp.reset();
          AppAlert.showError({text:"Invalid Cost SMV"})
          return 0;
        }
      }
       if(data[i]['GSD SMV']!=undefined){
        if(isNaN(data[i]['GSD SMV'])){
          this.formGroupXlUp.reset();
          AppAlert.showError({text:"Invalid GSD SMV"})
          return 0;
        }
      }
       if(data[i]['Code No']!=undefined){
        if(data[i]['Code No'].length>15){
          this.formGroupXlUp.reset();
          AppAlert.showError({text:"Code No Greater Than Maximum Length"})
          return 0;
        }
        else if(this.checkWhiteSpaces(data[i]['Code No'])==false){
          this.formGroupXlUp.reset();
          AppAlert.showError({text:"Invalid Code"})
          return 0;
        }
      }

}



          var upload$=null;
            upload$ = this.http.post(this.apiUrl + 'ie/garment_sub_operation_component/xl_upload', {'data':data})
            upload$.subscribe(
              (res)=>{

                if(res.data.status==1){
                  AppAlert.closeAlert();
                  //because of couldn't closed the modal by norml .hide() event
                  document.getElementById("close_click").click();
                  AppAlert.showSuccess({text:res.data.message});
                  this.formGroupXlUp.reset();
                  this.reloadTable();
                }
                else if(res.data.status==0){
                  AppAlert.closeAlert();
                  AppAlert.showError({text:res.data.message})
                   this.formGroupXlUp.reset()
                  //this.xlUploadModel.hide();
                }
              },
              (error)=>{


              }

            );

        }


        showEvent(event){ //show event of the bs model
          //debugger

          this.formGroup.get('operation_sub_component_name').enable()
          this.formGroup.reset();
          this.modelTitle = "New Operation Sub Component"
          this.saveStatus = 'SAVE'

        }



        showEventxl(event){ //show event of the bs model
          //debugger
          this.formGroupXlUp.reset();
          this.modelTitleXl = "New Excel Upload"

        }



        formValidate(){ //validate the form on input blur event
          //debugger
          var x=this.appValidator.validate();
        }

        formValidateXlUpload(){ //validate the form on input blur event
          this.appValidatorXlUpload.validate();
        }

      clear(){

        this.formGroup.get('operation_component_id').enable()
        this.formGroup.get('operation_sub_component_code').enable()
        this.formGroup.reset();
        this.saveStatus = 'SAVE'
        this.dataset=[];
        this.updateMode=false;

      }

         loadOperationComponaent(){

           this.operationCompoent$ = this.operationCompoentInput$
           .pipe(
              debounceTime(200),
              distinctUntilChanged(),
              tap(() => this.operationCompoentLoading = true),
              switchMap(term => this.http.get<any[]>(this.apiUrl + 'ie/garment_operation_components?type=auto' , {params:{search:term}})
              .pipe(
                  //catchError(() => of([])), // empty list on error
                  tap(() => this.operationCompoentLoading = false)
              ))
           );


         }
         initializeOrderLinesTable(){
           var clipboardCache = '';
         //var sheetclip = new sheetclip();
           this.hotOptions = {
             columns: [

               { type: 'text', title : 'Operation' , data: 'operation_name',className: "htLeft",readOnly:false},
               {
                 title : 'Machine Type',
                 type: 'autocomplete',
                 className: "htLeft",
                 source:(query, process)=>{
                   var url=$('#url').val();
                   $.ajax({
                     url:this.apiUrl+'ie/machine_type?type=auto_h_table',
                     dataType: 'json',
                     data: {
                       query: query,
                       },
                     success: function (response) {
                         //console.log(response);
                         process(response);
                         }
                   });
                 },
                data:'machine_type_name',
                 strict: true,
                 readOnly: false,

               },

               { type: 'numeric', title : 'Cost SMV', data: 'cost_smv',className: "htRight",readOnly:false},
               { type: 'numeric', title : 'GSD SMV', data: 'gsd_smv',className: "htRight",readOnly:false},
               { type: 'text', title : 'Code No' , data: 'operation_code',className: "htLeft",readOnly:false},
               { type: 'text', title : 'Options' , data: 'options',className: "htLeft",readOnly:false}

             ],
             manualColumnResize: true,
             autoColumnSize : true,
             rowHeaders: true,
             colHeaders: true,
             //nestedRows: true,
             height: 250,
             copyPaste: true,
             stretchH: 'all',
             selectionMode: 'range',
             // fixedColumnsLeft: 3,
             /*columnSorting: true,*/
             className: 'htCenter htMiddle',
             readOnly: true,
             mergeCells:[],
             afterChange:(changes,surce,row,col,value,prop)=>{
              // debugger
               var a=this.dataset;
              if(surce != null && surce.length > 0){
               const hotInstance = this.hotRegisterer.getInstance(this.instance);
               //this.saved=false;
               let _row = surce[0][0]
               if(surce[0][1]=='cost_smv'){
               let _cost_smv = (surce[0][3] == '' || isNaN(surce[0][3]) ||surce[0][3]<0) ? 0 : surce[0][3]
               var x=this.countDecimals(_cost_smv) ;
               if(this.countDecimals(_cost_smv) > 4){
                 _cost_smv = this.formatDecimalNumber(_cost_smv, 4)
                 this.dataset[_row]['cost_smv']=_cost_smv
               }
               else{
                this.dataset[_row]['cost_smv']=_cost_smv
             }

             hotInstance.render()
             //hotInstance.setDataAtCell(_row, 10, _qty)
             }
             if(surce[0][1]=='gsd_smv'){
             let _gsd_smv = (surce[0][3] == '' || isNaN(surce[0][3]) ||surce[0][3]<0) ? 0 : surce[0][3]
             if(this.countDecimals(_gsd_smv) > 4){
               _gsd_smv = this.formatDecimalNumber(_gsd_smv, 4)
               this.dataset[_row]['gsd_smv']=_gsd_smv
             }
             else{
              this.dataset[_row]['gsd_smv']=_gsd_smv
           }
      //     this.datasetDetails[_row]['qty']=_qty
           hotInstance.render()
           //hotInstance.setDataAtCell(_row, 10, _qty)
           }
           if(surce[0][1]=='operation_code'){
             let _operation_code= surce[0][3]
             if(_operation_code!=null){
                if(_operation_code.length>15){
                  _operation_code="";
                  AppAlert.showError({text:"Value Greater Than Maximum Length"})
                }
                else if(this.checkWhiteSpaces(_operation_code)==false){
                  _operation_code=""
                  AppAlert.showError({text:"Invalid Code"})
                }
                else{
                  _operation_code=_operation_code.toUpperCase();
                }
             this.dataset[_row]['operation_code']=_operation_code;
             hotInstance.render()
           }
           }
           if(surce[0][1]=='operation_name'){
             let _operation_name= surce[0][3]
             if(_operation_name!=null){
               if(_operation_name.length>100){
                 _operation_name="";
                 AppAlert.showError({text:"Value Greater Than Maximum Length"})

               }
               else{
                _operation_name = _operation_name.toUpperCase();
               }
             this.dataset[_row]['operation_name']=_operation_name
             hotInstance.render()
           }

           }
           if(surce[0][1]=='options'){
             let _options= surce[0][3]
             if(_options!=null){
               if(_options.length>50){
                 _options="";
                  AppAlert.showError({text:"Value Greater Than Maximum Length"})
               }
               else{
                 _options=_options.toUpperCase();
               }
             this.dataset[_row]['options']=_options
             hotInstance.render()
           }
         }

             }
                 },
               afterCreateRow:(index,amount,source)=>{
                 //console.log(index);


               },
               afterPaste:(changes)=>{

                   const hotInstance = this.hotRegisterer.getInstance(this.instance);
                     hotInstance.render();
                     console.log('im here.....')
                     console.log(this.dataset)
               },

             cells : function(row, col, prop , value){ //table cell render event. works for every cell in the table
               var cellProperties = {};
              //debugger
               if(col == 1){
                 cellProperties['renderer'] = function defaultValueRenderer(instance, td, row, col, prop, value, cellProperties) {
                   var args = arguments;
                   if(prop == 'type_created' && value == 'GFM'){
                     td.style.background = '#ffcccc';
                   }
                   else if(prop == 'type_created' && value == 'GFS'){
                     td.style.background = '#b3ff66';
                   }
                   Handsontable.renderers.TextRenderer.apply(this, args);
                 }
               }

               return cellProperties;
             },
             contextMenu : {
                 callback: function (key, selection, clickEvent) {
                   // Common callback for all options
                 },
                 items : {
                   'Add Line':{
                    name:'Add Operation',
                    disabled:  (key, selection, clickEvent)=>{
                      // Disable option when first row was clicked
                      const hotInstance = this.hotRegisterer.getInstance(this.instance);
                      let sel_row = hotInstance.getSelectedLast()[0];
                      if(this.dataset.length == 0){

                          return hotInstance.getSelectedLast()[0] === sel_row

                      }
                    },
                    callback:(key, selection, clickEvent)=> {
                     this.addLine(key, selection, clickEvent)


                    }

                  },

                   'delete' : {
                     name : 'Delete',
                     disabled:(key, selection, clickEvent)=> {
                       //debugger
                       const hotInstance = this.hotRegisterer.getInstance(this.instance);
                       var _line=hotInstance.getSelectedLast()[0]
                       let sel_row = hotInstance.getSelectedLast()[0];
                       if(this.dataset.length == 0){

                           return hotInstance.getSelectedLast()[0] === sel_row

                       }
                     },
                     callback : (key, selection, clickEvent) => {
                       if(selection.length > 0){
                         let start = selection[0].start;
                         this.contextMenuMainTableDelete(start.row)
                       }
                     }
                   }


           }
         }
       }
       }
       contextMenuOptions(line,type){
         //debugger
         return false;
           //this.datasetDetails[_line];
       }

       contextMenuMainTableDelete(row){
         AppAlert.showConfirm({
           'text' : 'Do you want to deactivate selected Operation?'
         },
         (result) => {
           if (result.value) {
           let selectedRowData = this.dataset[row]
           if(selectedRowData['detail_id']!=''){
             this.http.get(this.apiUrl + 'ie/delete_operation?id='+selectedRowData['detail_id']+'&header_id='+selectedRowData['operation_sub_component_id'])
             .pipe(map( data => data['data'] ))
             .subscribe(
                 (data) => {
                   if(data.status=='1'){
                     this.dataset=data.activeLines
                   }
                   else if(data.status=='0'){
                     AppAlert.showError({text:data.message})

                   }

                 },
                 (error) => {
                   console.log(error)
                 }
             )
           }
            if(selectedRowData['detail_id']==''){
           this.currentDataSetIndexMaintable = row
           this.dataset.splice(row,1);
          }
            }
          if(this.dataset.length==0){
              this.dataset=[{operation_name:'',detail_id:'',machine_type_id:'',cost_smv:'',gsd_smv:'',operation_code:'',options:''}];
          }
           const hotInstance = this.hotRegisterer.getInstance(this.instance);
           hotInstance.render();
         })
       }
       countDecimals(_val) {
        if(Math.floor(_val) === _val) return 0;
        return _val.toString().split(".")[1].length || 0;
       }

       formatDecimalNumber(_number, _places){
         let num_val = parseFloat(_number+'e'+_places)//_number.toExponential(2)
         return Number(Math.round(num_val)+'e-'+_places);
       }

         addLine(key, selection, clickEvent){
           this.dataset.push({operation_name:'',detail_id:'',machine_type_id:'',machine_type_name:'',cost_smv:'',gsd_smv:'',operation_code:'',options:''});
           const hotInstance = this.hotRegisterer.getInstance(this.instance);
             hotInstance.render();

         }

         checkWhiteSpaces(text){
          // debugger
           let pattern = '\\s';
           if (new RegExp(pattern).test(text)) {
             return false;
           }
          let pattern2 = /[^\w\s-]/gi;
            if(new RegExp(pattern2).test(text)){
              return false;
           }
           else
            return true;
         }

         addDetils(){
           this.formGroup.disable()
             const hotInstance = this.hotRegisterer.getInstance(this.instance);
           this.dataset=[{operation_name:'',detail_id:'',machine_type_id:'',machine_type_name:'',cost_smv:'',gsd_smv:'',operation_code:'',options:''}];
            setTimeout(() => {
             hotInstance.render();
           }, 300)

         }
        /* checkSaveButtonStatus(){
           if(this.dataset.length<1){
             this.disableSave=true;
           }
           else{
             this.disableSave=false;
           }
         }*/

}
