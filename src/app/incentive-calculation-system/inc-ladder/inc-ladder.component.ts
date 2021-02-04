import { Component, OnInit,ViewChild,OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
//third part Components
import { ModalDirective } from 'ngx-bootstrap/modal';
declare var $:any;
declare var XLSX:any;
declare var XLS:any;
import { HotTableRegisterer } from '@handsontable/angular';
import { AppFormValidator } from '../../core/validation/app-form-validator';
import { PrimaryValidators } from '../../core/validation/primary-validators';
import { AppValidator } from '../../core/validation/app-validator';
import { BasicValidators } from '../../core/validation/basic-validators';
import { AppConfig } from '../../core/app-config';
import { AppAlert } from '../../core/class/app-alert';

import { PermissionsService } from '../../core/service/permissions.service';
import { AuthService } from '../../core/service/auth.service';
import { LayoutChangerService } from '../../core/service/layout-changer.service';


@Component({
  selector: 'app-inc-ladder',
  templateUrl: './inc-ladder.component.html',
  styleUrls: ['./inc-ladder.component.css']
})
export class IncLadderComponent implements OnInit {

  @ViewChild(ModalDirective) ladderUploadModel: ModalDirective;
  @ViewChild('ladderViewModel') ladderViewModel: ModalDirective;

  formGroup : FormGroup
  formValidator : AppFormValidator = null
  modelTitle : string = "New AQL Incentive Factor"
  modelTitleView  : string = "View Ladder"
  datatable:any = null
  datatable2:any = null
  readonly apiUrl = AppConfig.apiUrl()
  appValidator : AppValidator
  saveStatus = 'SAVE'
  processing : boolean = false
  loading : boolean = false
  loadingCount : number = 0
  initialized : boolean = false
  dataset: any[] = [];
  hotOptions: any
  instance: string = 'hot';



  formFields = {
      excelfile : '',
      validation_error:''
  }

  constructor(private fb:FormBuilder,private http:HttpClient, private permissionService : PermissionsService,
    private auth : AuthService, private titleService: Title,private layoutChangerService : LayoutChangerService, private hotRegisterer: HotTableRegisterer ) { }

    ngOnInit() {
      this.titleService.setTitle("AQL Ladder Upload")//set page title

      let primaryValidator = new PrimaryValidators(this.http)//create object of basic validation class



      let basicValidator = new BasicValidators(this.http)//create object of basic validation class

      this.formGroup = this.fb.group({
        inc_aql_id : 0,
        excelfile : [null , [Validators.required ]],

      })

      this.formValidator = new AppFormValidator(this.formGroup , {});
      //create new validation object
      this.appValidator = new AppValidator(this.formFields,{},this.formGroup);

      this.formGroup.valueChanges.subscribe(data => { //validate form when form value changes
        this.appValidator.validate();
      })

      if(this.permissionService.hasDefined('LADDER_VIEW')){
        this.createTable()
        this.initializeTable()

      }
      //change header nevigation pagePath
      this.layoutChangerService.changeHeaderPath([
        'Production Incentive Calculation System',
        'Master Data',
        'Ladder Upload'
      ])

      //listten to the menu collapse and hide button
      this.layoutChangerService.headerMinButtonEvent.subscribe(data => {
        if(data == false){return;}
        if(this.datatable != null){
          this.datatable.draw(false);
        }
      })

      this.layoutChangerService.headerMinButtonEvent.subscribe(data => {
        if(data == false){return;}
            const hotInstance = this.hotRegisterer.getInstance(this.instance);
            if(hotInstance != undefined && hotInstance != null){
              hotInstance.render(); //refresh fg items table
            }

      })


    }

    ExportToTable() {

      var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.xlsx|.xls)$/;

     /*Checks whether the file is a valid excel file*/
     if (regex.test($("#excelfile").val().toLowerCase())) {
         var xlsxflag = false; /*Flag for checking whether excel is .xls format or .xlsx format*/
         if ($("#excelfile").val().toLowerCase().indexOf(".xlsx") > 0) {
             xlsxflag = true;
         }else{
             AppAlert.showError({text:"Please upload a valid Excel file"})
             return;
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
                          this.saveladder(exceljson)
                          //this.BindTable(exceljson, '#exceltable');


                         cnt++;
                     }
                 });
                 $('#exceltable').show();
             }
             if (xlsxflag) {/*If excel file is .xlsx extension than creates a Array Buffer from excel*/
                 reader.readAsArrayBuffer($("#excelfile")[0].files[0]);
             }
             else {
                 reader.readAsBinaryString($("#excelfile")[0].files[0]);
             }
         }
         else {
             AppAlert.showError({text:"Sorry! Your browser does not support HTML5"})
         }
     }
     else {
         AppAlert.showError({text:"Please upload a valid Excel file"})
     }


    }


 //     BindTable(jsondata, tableid) {/*Function used to convert the JSON array to Html Table*/
 //     var columns = this.BindTableHeader(jsondata, tableid); /*Gets all the column headings of Excel*/
 //     for (var i = 0; i < jsondata.length; i++) {
 //         var row$ = $('<tr/>');
 //         for (var colIndex = 0; colIndex < columns.length; colIndex++) {
 //             var cellValue = jsondata[i][columns[colIndex]];
 //             if (cellValue == null)
 //                 cellValue = "";
 //             row$.append($('<td/>').html(cellValue));
 //         }
 //         $(tableid).append(row$);
 //     }
 // }
 //
 //
 //  BindTableHeader(jsondata, tableid) {/*Function used to get all column names from JSON and bind the html table header*/
 //     var columnSet = [];
 //     var headerTr$ = $('<tr/>');
 //     for (var i = 0; i < jsondata.length; i++) {
 //         var rowHash = jsondata[i];
 //         for (var key in rowHash) {
 //             if (rowHash.hasOwnProperty(key)) {
 //                 if ($.inArray(key, columnSet) == -1) {/*Adding each unique column names to a variable array*/
 //                     columnSet.push(key);
 //                     headerTr$.append($('<th/>').html(key));
 //                 }
 //             }
 //         }
 //     }
 //     $(tableid).append(headerTr$);
 //     return columnSet;
 // }


 //save and update source details
 saveladder(data){
   //this.appValidation.validate();
   if(!this.formValidator.validate())//if validation faild return from the function
     return;
   this.processing = true
   AppAlert.showMessage('Processing...','Please wait while saving details')
   //console.log(data['length'])
   let saveOrUpdate$ = null;
   //let transId = this.formGroup.get('inc_aql_id').value
   if(this.saveStatus == 'SAVE'){
     saveOrUpdate$ = this.http.post(this.apiUrl + 'pic-system/ladder-upload' ,{ 'length' : data['length'], 'data' : data })
   }
   else if(this.saveStatus == 'UPDATE'){
     //saveOrUpdate$ = this.http.put(this.apiUrl + 'pic-system/aql-incentive-factor/' + transId , this.formGroup.getRawValue())
   }

   saveOrUpdate$.subscribe(
     (res) => {
       this.processing=false;
       if(res.data.status==0){
         AppAlert.showError({text:res.data.message})
         this.formGroup.reset();
         this.reloadTable()
         this.ladderUploadModel.hide()
       }
       else if(res.data.status=1){
       this.formGroup.reset();
       this.reloadTable()
       this.ladderUploadModel.hide()
       setTimeout(() => {
         AppAlert.closeAlert()
         AppAlert.showSuccess({text : res.data.message })
       } , 500)
     }
    },
    (error) => {
      this.processing=false;
      if(error.status == 422){ //validation error
        AppAlert.showError({title : 'Validation Error' , text : error.error.errors.validationErrorsText })
      }else{
        AppAlert.showError({text : 'Invalid Excel Upload' })
        console.log(error)
      }
    }
  );
 }


    ngOnDestroy(){
        this.datatable = null
    }

    createTable() { //initialize datatable
       this.datatable = $('#ladder-table').DataTable({
         autoWidth: false,
         scrollY: "500px",
         scrollCollapse: true,
         processing: true,
         serverSide: true,
         order:[[0,'desc']],
         ajax: {
              headers: {'Authorization':`Bearer ${this.auth.getToken()}`},
              dataType : 'JSON',
              "url": this.apiUrl + "pic-system/ladder-upload?type=datatable"
          },
          columns: [
              {
                data: "ladder_id",
                orderable: false,
                width: '3%',
                render : (data,arg,full) => {
                  var str = '';
                  if(this.permissionService.hasDefined('LADDER_VIEW')){
                  str = '<i class="icon-eye" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="EDIT" data-id="'+data+'"></i>';
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
            { data: "ladder_year" }

         ],
       });

       //listen to the click event of edit and delete buttons
       $('#ladder-table').on('click','i',e => {
          let att = e.target.attributes;
          if(att['data-action']['value'] === 'EDIT'){
              this.edit(att['data-id']['value']);
          }
          else if(att['data-action']['value'] === 'DELETE'){
            //this.delete(att['data-id']['value'], att['data-status']['value']);
          }
       });
      }

      reloadTable() {//reload datatable
          this.datatable.ajax.reload(null, false);
      }

      initializeTable(){
        this.hotOptions = {
          columns: [

            { type: 'text', title : 'Type of Order' , data: 'order_type',className: "htLeft"},
            { type: 'text', title : 'Day' , data: 'qco_date',className: "htRight" },
            { type: 'text', title : 'Efficiency %' , data: 'efficeincy_rate',className: "htRight" },
            { type: 'text', title : 'Incentive Amount (LKR)' , data: 'incentive_payment',className: "htRight" },
            { type: 'text', title : 'Year' , data: 'ladder_year',className: "htRight"},

          ],
          manualColumnResize: true,
          autoColumnSize : true,
          rowHeaders: true,
          height: 200,
          stretchH: 'all',
          selectionMode: 'range',
          className: 'htCenter htMiddle',
          readOnly: true,


        }
      }






      edit(id) { //get payment term data and open the model
        //alert(id)
        this.ladderViewModel.show()
        this.dataset=[];
        this.http.post(this.apiUrl + 'pic-system/view_data' ,{ 'ladder_id' : id })
        .pipe( map(res => res['data'] ))
        .subscribe(
          data => {

              let count_his =  data['ladder_count']
              for (var _l = 0; _l < count_his; _l++)
                  {
                    this.dataset.push(data['ladder_data'][_l])
                  }

              const hotInstance = this.hotRegisterer.getInstance(this.instance);
              hotInstance.render()

              },
              error => {
              }
            )




      }

      showEvent(event){ //show event of the bs model
        this.formGroup.get('excelfile').enable()
        this.formGroup.reset();
        this.modelTitle = "New Ladder Upload"
        this.saveStatus = 'SAVE'
      }

      showEvent2(event){ //show event of the bs model
        this.formGroup.reset();
        this.modelTitle = "View Ladder"
        this.saveStatus = 'SAVE'
      }

      formValidate(){ //validate the form on input blur event
        this.appValidator.validate();
      }


}
