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
import * as Handsontable from 'handsontable';
import { HotTableRegisterer } from '@handsontable/angular';
declare var $:any;

@Component({
  selector: 'app-silhouette-operation-mapping',
  templateUrl: './silhouette-operation-mapping.component.html',
  styleUrls: ['./silhouette-operation-mapping.component.css']
})
export class SilhouetteOperationMappingComponent implements OnInit {
  //MODAL FOR DATA ADDING
  @ViewChild(ModalDirective) garmentOperationModel: ModalDirective;
  formValidator : AppFormValidator = null
  formGroup : FormGroup
  formGroupXlUp : FormGroup
  modelTitle : string = "New Operation Sub Component"
  readonly apiUrl = AppConfig.apiUrl()
  appValidator : AppValidator
  datatable:any = null
  saveStatus = 'SAVE'
  processing : boolean = false
  loading : boolean = false
  addButtonNotClicked:boolean=true
  loadingCount : number = 0
  initialized : boolean = false
  disableSave=true;
  operationCompoent$: Observable<any[]>;//use to load customer list in ng-select
  operationCompoentLoading = false;
  operationCompoentInput$ = new Subject<string>();
  selectedOperationCompoent: any[]

  silhouette$:Observable<any[]>;//use tp load customer list in ng-select
  silhouetteLoading=false;
  silhouetteInput$ =new Subject<string>();
  selectedSilhouette:any[]

  instance: string = 'instance';
  hotOptions: any
  dataset: any[] = [];
  currentDataSetIndexMaintable:number=-1
  //to manage form error messages
  formFields = {
        mapping_header_id:'',
        silhouette_code:'',
        operation_component_id: '',
        validation_error:''
  }

  constructor(private fb:FormBuilder , private http:HttpClient,private hotRegisterer: HotTableRegisterer,private permissionService : PermissionsService,
    private auth : AuthService,private layoutChangerService : LayoutChangerService, private titleService: Title) { }

    ngOnInit() {
      this.titleService.setTitle("Silhouette Operation Mapping")//set page title

      let primaryValidator = new PrimaryValidators(this.http)//create object of basic validation class
      let remoteValidationConfig = { //configuration for location code remote validation
        url:this.apiUrl + 'ie/silhouette_operation_mapping/validate?for=duplicate',
        formFields : this.formFields,
        fieldCode : 'silhouette_code',
        /*error : 'Dep code already exists',*/
          data : {

          product_silhouette_id: function(controls){ if(controls['silhouette_code']['value']!=null){return (controls['silhouette_code']['value']['product_silhouette_id'])}
          else
          return null;
        },
        mapping_header_id : function(controls){
          //debugger
          return controls['mapping_header_id']['value']},

        },


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
            mapping_header_id : 0,
            silhouette_code : [null , [Validators.required],[primaryValidator.remote(remoteValidationConfig)]],
            operation_component_id : [null , [Validators.required],[/*primaryValidator.remote(remoteValidationConfig)*/]],
              })

          this.formValidator = new AppFormValidator(this.formGroup , {});

          //create new validation object

            this.appValidator = new AppValidator(this.formFields,{},this.formGroup);
            this.formGroup.valueChanges.subscribe(data => { //validate form when form value changes
              this.appValidator.validate();
            })

          if(this.permissionService.hasDefined('SIL_OPE_MAPPING_VIEW')){
          this.createTable() //load data list
        }
          //change header nevigation pagePath
          this.layoutChangerService.changeHeaderPath([
            'Catalogue',
            'IE',
            'Silhouette Operation Mapping'
          ])

          this.layoutChangerService.headerMinButtonEvent.subscribe(data => {
            if(data == false){return;}
            if(this.datatable != null){
              this.datatable.draw(false);
            }
          })

        this.loadOperationComponaent();
        this.loadSilhouette();
        this.initializeOrderLinesTable();
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
         order:[[4,'desc']],
         ajax: {
              dataType : 'JSON',
              "url": this.apiUrl + "ie/silhouette_operation_mapping?type=datatable"
          },
          columns: [
              {
                data: "mapping_header_id",
                orderable: true,
                width: '3%',
                render : (data,arg,full)=>{
                  var str = '';
                  if(this.permissionService.hasDefined('SIL_OPE_MAPPING_EDIT')){
                      str = '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="EDIT" data-id="'+data+'" data-status="'+full['status']+'" data-approval-status="'+full['approval_status']+'" ></i>';

                            if( full.status== 0||full.approval_status=="PENDING" ) {
                              str = '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:not-allowed;margin-right:3px" data-action="DISABLE" data-id="'+data+'">\n\
                              </i><i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:not-allowed" data-action="DISABLE" data-id="'+data+'"></i>';
                              }

                }
                  if(this.permissionService.hasDefined('SIL_OPE_MAPPING_DELETE')){
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
            { data: "silhouette_code"},
            { data: "product_silhouette_description"},
            {data:"created_date_",
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


          edit(id,status,approval_status){
            //debugger
            if(status==0||approval_status=="PENDING"){
              return 0;
            }
            this.http.get(this.apiUrl + 'ie/silhouette_operation_mapping/' + id )
            .pipe( map(res => res['data']) )
            .subscribe(data => {

              if(data!=null){
                this.garmentOperationModel.show();
                this.formGroup.patchValue({
                 mapping_header_id:data.header.mapping_header_id,
                      })
                this.formGroup.patchValue({
                  silhouette_code:data.product_silhouette,
                      })
               this.formGroup.get('silhouette_code').disable()
                var a=this.formGroup.getRawValue();
                  this.dataset=data.details;
                  this.addButtonNotClicked=false;
                   const hotInstance = this.hotRegisterer.getInstance(this.instance);
                   setTimeout(() => {
                     hotInstance.render();
                          }, 200)
              //  this.formGroup.get('operation_component_id').disable();
                this.saveStatus = 'UPDATE';
                this.modelTitle="Update Silhouette Operation Mapping"
              }

            })
          }

          delete(id,status){
            if(status==0){
              return
            }
            AppAlert.showConfirm({
              'text' : 'Do you want to deactivate selected Silhouette Operation Mapping?'
            },
            (result) => {
              if (result.value) {
                this.http.delete(this.apiUrl + 'ie/silhouette_operation_mapping/' + id)
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

          reloadTable() {//reload datatable
              this.datatable.ajax.reload(null, false);
          }


    initializeOrderLinesTable(){
      var clipboardCache = '';
    //var sheetclip = new sheetclip();
      this.hotOptions = {
        columns: [

          { type: 'text', title : 'Operation Code' , data: 'operation_component_code',className: "htLeft",readOnly:false},
          { type: 'text', title : 'Operation Component Name' , data: 'operation_component_name',className: "htLeft",readOnly:false}


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
      //debugger
      if(selectedRowData['mapping_id']!=null){
        this.http.get(this.apiUrl + 'ie/silhouette_operation_mapping_delete_operation?id='+selectedRowData['mapping_id']+'&operation_component_id='+selectedRowData['operation_component_id'])
        .pipe(map( data => data['data'] ))
        .subscribe(
            (data) => {
              if(data.status=='1'){
                this.dataset=data.activeLines
                if(this.dataset.length==0){
                 //debugger
                  this.addButtonNotClicked=true;
                  if(data.activeLines.length==0){
                    this.reloadTable()
                  }
                 }
              }
              else if(data.status=='0'){
                AppAlert.showError({text:data.message})
                if(this.dataset.length==0){
                  this.addButtonNotClicked=true;
                 }

              }

            },
            (error) => {
              console.log(error)
            }
        )
      }
       if(selectedRowData['mapping_id']==null){
      this.currentDataSetIndexMaintable = row
      this.dataset.splice(row,1);
      if(this.dataset.length==0){
        //debugger
        this.addButtonNotClicked=true;
       }
     }
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
    let formData=this.formGroup.getRawValue();
    this.formGroup.get('silhouette_code').disable()
    formData['operation_component_code']=formData['operation_component_id']['operation_component_code'];
    formData['operation_component_name']=formData['operation_component_id']['operation_component_name'];
    formData['operation_component_id']=formData['operation_component_id']['operation_component_id'];
    formData['product_silhouette_id']=formData['silhouette_code']['product_silhouette_id'];
    this.addButtonNotClicked=false;
    const hotInstance = this.hotRegisterer.getInstance(this.instance);
    for(var  i=0;i<this.dataset.length;i++){
      if(this.dataset[i]['operation_component_code']==  formData['operation_component_code']){
        AppAlert.showError({text:"Operation Component Already Exsits"})
        return 0;
      }
    }

     this.dataset.push(formData);
      // debugger
       setTimeout(() => {
        hotInstance.render();
      }, 300)

    }
    //load silhouette list
    loadSilhouette() {
         this.silhouette$ = this.silhouetteInput$
         .pipe(
            debounceTime(200),
            distinctUntilChanged(),
            tap(() => this.silhouetteLoading = true),
            switchMap(term => this.http.get<any[]>(this.apiUrl + 'org/silhouettes?type=auto' , {params:{search:term}})
            .pipe(
                //catchError(() => of([])), // empty list on error
                tap(() => this.silhouetteLoading = false)
            ))
         );
     }
    showEvent(event){ //show event of the bs model
      //debugger

      this.formGroup.reset();
      this.modelTitle = "New Silhouette Operation Mapping"
      this.saveStatus = 'SAVE'

    }
    clear(){
      this.formGroup.get('silhouette_code').enable();
      this.formGroup.enable();
      this.dataset=[]
      this.addButtonNotClicked=true;
    }



    save(){
    //  debugger
    if(this.dataset.length==0){
      AppAlert.showError({text:"Please Complete the Grid"});
      return 0;
    }
      var a=this.dataset;
      this.processing = true
      AppAlert.showMessage('Processing...','Please wait while saving details')
      let saveOrUpdate$ = null;
      var formData=this.formGroup.getRawValue();
      //formData['operation_component_code']=formData['operation_component_id']['operation_component_code'];
      //formData['operation_component_id']=formData['operation_component_id']['operation_component_id'];
      formData['product_silhouette_id']=formData['silhouette_code']['product_silhouette_id']
      let id = this.formGroup.get('mapping_header_id').value
      if(this.saveStatus == 'SAVE'){
        saveOrUpdate$ = this.http.post(this.apiUrl + 'ie/silhouette_operation_mapping',{'header':formData ,'detail':this.dataset})
      }
      else if(this.saveStatus == 'UPDATE'){
        saveOrUpdate$ = this.http.put(this.apiUrl + 'ie/silhouette_operation_mapping/' + id ,{'header': formData,'detail':this.dataset})
      }


      saveOrUpdate$.subscribe(
        (res) => {
         //debugger
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
    formValidate(){ //validate the form on input blur event
    //  debugger
      var x=this.appValidator.validate();
    }

}
