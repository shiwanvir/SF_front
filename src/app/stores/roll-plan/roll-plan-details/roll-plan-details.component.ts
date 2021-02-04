  import { Component, OnInit,ViewChild,AfterViewInit,OnDestroy } from '@angular/core';
  import { Title } from '@angular/platform-browser';
  import { FormBuilder , FormGroup , Validators} from '@angular/forms';
  import { HttpClient } from '@angular/common/http';
  import { Router } from '@angular/router';
  import { Observable , Subject } from 'rxjs';
  import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map} from 'rxjs/operators';
  import * as Handsontable from 'handsontable';
  import { HotTableRegisterer } from '@handsontable/angular';


  //third part components
  import { ModalDirective } from 'ngx-bootstrap/modal';
  declare var $:any;
  import { AppFormValidator } from '../../../core/validation/app-form-validator';
  import { PrimaryValidators } from '../../../core/validation/primary-validators';
  import { BasicValidators } from '../../../core/validation/basic-validators';
  import { AppConfig } from '../../../core/app-config';
  import { AppAlert } from '../../../core/class/app-alert';

  import { AuthService } from '../../../core/service/auth.service';
  import { PermissionsService } from '../../../core/service/permissions.service';
  import { LayoutChangerService } from '../../../core/service/layout-changer.service';
  import { FormControl } from '@angular/forms';

  @Component({
    selector: 'app-roll-plan-details',
    templateUrl: './roll-plan-details.component.html',
    styleUrls: ['./roll-plan-details.component.css']
  })
  export class RollPlanDetailsComponent implements OnInit {
    rollPlanGroup: FormGroup;
    @ViewChild(ModalDirective) rollPlanModel: ModalDirective;

    formGroup : FormGroup
    formValidator : AppFormValidator = null
   rollPlanModelTitle:string="Roll Plan Details"
    readonly apiUrl = AppConfig.apiUrl()
    datatable:any = null
    saveStatus = 'SAVE'
    processing : boolean = false
    instanceRollPlan: string = 'instanceRollPlan';
    hotOptionsRollPlan: any
    datasetRollPlan: any[] = [];
    $_store_id:any
    $_sub_store_id:any
    $_grn_line_qty:any
    $_grn_line_excess_qty:any
    formFields = {
      roll_plan_from:'',
      roll_plan_to:'',
      lot_no:'',
      batch_no:'',
      bin:'',
      width:'',
      shade:'',
      comment:'',
      qty:'',
      validation_error:''
    }
    constructor(private router:Router, private fb:FormBuilder , private http:HttpClient, private permissionService : PermissionsService,private hotRegisterer: HotTableRegisterer,
    private auth : AuthService,private titleService: Title,private layoutChangerService : LayoutChangerService  ) { }

    ngOnInit() {
        this.titleService.setTitle("Roll Plan")//set page title
       this.createTable() //load data list
       this.initializeRollPlanTable()

       this.layoutChangerService.headerMinButtonEvent.subscribe(data => {
         if(data == false){return;}
         if(this.datatable != null){
           this.datatable.draw(false);
         }
       })


       this.rollPlanGroup=this.fb.group({
         //
         grn_qty:new FormControl(null , [Validators.required]),
         roll_plan_from:new FormControl(null , [Validators.required,this.rollNumberFromValidation(),PrimaryValidators.isNumber]),
         roll_plan_to:new FormControl(null , [Validators.required,this.rollNumberTOValidation(),PrimaryValidators.isNumber],),
         lot_no:new FormControl(null , [Validators.required]),
         batch_no:new FormControl(null , [Validators.required]),
         bin:new FormControl(null , [Validators.required]),
         width:new FormControl(null , [Validators.required,PrimaryValidators.isNumber]),
         shade:new FormControl(null , [Validators.required]),
         comment:new FormControl(null , [Validators.required]),
         qty:new FormControl(null , [Validators.required,this.isQtyInGrnQty(),PrimaryValidators.isNumber]),

       });

       this.formValidator = new AppFormValidator(this.rollPlanGroup , {roll_plan_from:{IncorrectRollNumber:"Incorrect Roll Number"},roll_plan_to:{IncorrectRollNumber:"Incorrect Roll Number"},grn_qty:{IncorrectRollQty:"Incorrect Roll Qty"}});

       this.formValidator = new AppFormValidator(this.rollPlanGroup , {});

       //change header nevigation pagePath
       this.layoutChangerService.changeHeaderPath([
         'Warehouse Management',
         'Stores',
         'Roll Plan Update'
       ])
    }



    reloadTable() {//reload datatable
        this.datatable.ajax.reload(null, false);
    }

    rollPlanshowEvent($event){
      //debugger
  this.rollPlanModelTitle="Roll Plan Details"

    }

    ngOnDestroy(){
        this.datatable = null
    }

  createTable() { //initialize datatable
     this.datatable = $('#roll_table').DataTable({
       autoWidth: false,
       scrollY: "500px",
       scrollX: true,
       scrollCollapse: true,
       processing: true,
       serverSide: true,
       fixedColumns:   {
            leftColumns: 2
        },
       order : [[ 0, 'desc' ]],
       ajax: {
            headers: {
               'Authorization':`Bearer ${this.auth.getToken()}`,
             },
             dataType : 'JSON',
             "url": this.apiUrl + "store/roll?type=datatable"
        },
        columns: [
            {
              data: "grn_detail_id",
              orderable: true,
              width: '3%',
              render : (data,arg,full) => {
                var str = '';
                  str += '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="EDIT" data-id="'+data+'" data-status="'+full['arrival_status']+'" status="'+full['status']+'"></i>';

                  str += '<i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer" \
                  data-action="DELETE" data-id="'+data+'" data-status="'+full['status']+'" ></i>';

                return str;
             }
           },
           {
             data: "status",
             orderable: false,
             render : function(data){
               if(data == 1){
                   return '<span class="label label-success">Active</span>';
               }
               else{
                 return '<span class="label label-default">Inactive</span>';
               }
             }
          },

          { data: "grn_number"},
          { data: "master_description"},
          {data:"color_name"},
          {data:"i_rec_qty"},
          {data:"excess_qty"}
          ],
     });

     //listen to the click event of edit and delete buttons
     $('#roll_table').on('click','i',e => {
        let att = e.target.attributes;
        //
        if(att['data-action']['value'] === 'EDIT'){
        //  debugger
            this.edit(att['data-id']['value'],att['data-status']['value'],att['status']['value']);
        }
        else if(att['data-action']['value'] === 'DELETE'){
            this.delete(att['data-id']['value'], att['data-status']['value']);
        }
     });
  }


    initializeRollPlanTable(){
      var clipboardCache = '';
    //var sheetclip = new sheetclip();
      this.hotOptionsRollPlan = {
        columns: [
          { type: 'checkbox', title : 'Is Excess' , readOnly: false, data : 'is_excess' , checkedTemplate: 1,  uncheckedTemplate: 0 },
          { type: 'text', title : 'LOT No' , data: 'lot_no',readOnly:true,className: "htLeft"},
          { type: 'text', title : 'Batch No' , data: 'batch_no',readOnly:false,className: "htLeft"},
          { type: 'text', title : 'Roll No' , data: 'roll_or_box_no',readOnly:false,className: "htLeft"},
        /*  { type: 'text', title : 'Actual Qty' , data: 'qty',readOnly:false},*/
          { type: 'numeric', title : 'Received Qty' , data: 'received_qty',readOnly:false,className: "htRight"},
          {
            title : 'Bin',
            type: 'autocomplete',
            source:(query, process)=> {
              var url=$('#url').val();
              $.ajax({
                  url:this.apiUrl+'stores/material-transfer?type=getBinsById',
                dataType: 'json',
                data: {
                  query: query,
                  store:this.$_store_id,
                  substore:this.$_sub_store_id
                },
                success: function (response) {
                  process(response);

                }
              });
            },
            strict: true,
            data: 'store_bin_name',
            readOnly: false
          },
          { type: 'text', title : 'Width' , data: 'width',readOnly:true,className: "htRight"},
          { type: 'text', title : 'Shade' , data: 'shade',readOnly:false,className: "htleft"},
          { type: 'text', title : 'Comment' , data: 'rm_comment',readOnly:false,className: "htleft"},





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
        fixedColumnsLeft: 3,
        /*columnSorting: true,*/
        className: 'htCenter htMiddle',
        readOnly: true,
        mergeCells:[],
        afterChange:(changes,surce,row,col,value,prop)=>{
          if(surce != null && surce.length > 0){
          //  debugger
          const hotInstance = this.hotRegisterer.getInstance(this.instanceRollPlan);
          //let x=this.dataset;
          let _row = surce[0][0]
          let _pre_value=surce[0][2]
          if(surce[0][1]=='roll_or_box_no'){
            //debugger
          let _roll_no = (surce[0][3] == '' || isNaN(surce[0][3])) ? _pre_value : surce[0][3]
          _roll_no=this.isDuplicatedRollNum(_pre_value,_roll_no,_row);

          this.datasetRollPlan[_row]['roll_or_box_no']=_roll_no
            hotInstance.render()
          }
          if(surce[0][1]=='received_qty'){
            //debugger
            let _received_qty=    (surce[0][3] == '' || isNaN(surce[0][3])) ? 0 : surce[0][3]
            if(this.countDecimals(_received_qty) > 4){
              _received_qty = this.formatDecimalNumber(_received_qty, 4)
              this.datasetRollPlan[_row]['received_qty']=_received_qty

            }
            else{
              this.datasetRollPlan[_row]['received_qty']=_received_qty
          }
            hotInstance.render()
          }
          if(surce[0][1]=='batch_no'){
            this.datasetRollPlan[_row]['batch_no']=surce[0][3].toUpperCase();
            hotInstance.render()
          }
          if(surce[0][1]=='Width'){
            let _Width=    (surce[0][3] == '' || isNaN(surce[0][3])) ? 0 : surce[0][3]
            if(this.countDecimals(_Width) > 4){
              _Width = this.formatDecimalNumber(_Width, 4)
              this.datasetRollPlan[_row]['Width']=_Width

            }
            else{
              this.datasetRollPlan[_row]['Width']=_Width
          }
          }
          if(surce[0][1]=='shade'){
            this.datasetRollPlan[_row]['shade']=surce[0][3].toUpperCase();
            hotInstance.render()
          }
          if(surce[0][1]=='comment'){
            this.datasetRollPlan[_row]['Comment']=surce[0][3].toUpperCase();
            hotInstance.render()
          }
    }
        },
        afterCreateRow:(index,amount,source)=>{
            //console.log(index);

        //    let x=this.dataset;




          },
          afterPaste:(changes)=>{

            /*  const hotInstance = this.hotRegisterer.getInstance(this.instance);
                hotInstance.render();
                console.log('im here.....')
                console.log(this.dataset)*/
          },

        cells : function(row, col, prop , value){ //table cell render event. works for every cell in the table
          var cellProperties = {};
          //var data = this.dataset;//this.instance.getData();
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
      /*  contextMenu : {
            callback: function (key, selection, clickEvent) {
              // Common callback for all options
            },
            items : {

            }
        }
        */
      }
    }

    isDuplicatedRollNum(_pre_value,_roll_no,_row){
      //debugger
      for(var i=0;i<this.datasetRollPlan.length;i++){
        if(i!=_row && this.datasetRollPlan[i]['roll_or_box_no']==_roll_no){
          AppAlert.showError({text:"Roll No Already Exists"})
          return _pre_value;
        }

      }
      return _roll_no;

    }

           edit(id,grn_status,status) { //get payment term data and open the model
             //debugger
             if(grn_status=="PLANNED"&&status==1){
            this.rollPlanModel.show()
             this.http.get(this.apiUrl + 'store/roll/' + id )
             .pipe( map(res => res['data']) )
             .subscribe(data => {
               this.datasetRollPlan=data.data
               this.$_store_id=data.store_id
               this.$_sub_store_id=data.sub_store_id
               this.$_grn_line_qty=parseFloat(data.grn_line_qty)
               this.$_grn_line_excess_qty=parseFloat(data.excess_qty)
                 const hotInstance = this.hotRegisterer.getInstance(this.instanceRollPlan);
                 hotInstance.render();
             /*if(data[0][0]['status']=='0'){
                 return 0
               */
               //this.smvService.changeData(data);
             })
           }
           }


           delete(id, status) { //deactivate payment term
             if(status == 0)
               return

             AppAlert.showConfirm({
               'text' : 'Do you want to deactivate selected  Roll Plan?'
             },
             (result) => {
               if (result.value) {
                 this.http.delete(this.apiUrl + 'store/roll/' + id)
                 .pipe( map(res => res['data']) )
                 .subscribe(
                     (data) => {
                       if(data.status==0){
                         AppAlert.showError({text:"Roll Plan Already in Use"})
                       }
                         this.reloadTable()
                     },
                     (error) => {
                       console.log(error)
                     }
                 )
               }
             })
           }


           rollNumberFromValidation() {

                 const validator = (control:FormControl): { [key: string]: any } => {

                       if(control != undefined && control != null && control.parent != undefined){
                        // debugger
                        let roll_plan_from: number = parseInt(control.value)
                      var roll_plan_to= control.parent.get('roll_plan_from') == null ? null : control.parent.get('roll_plan_to').value;
                      roll_plan_to=parseInt(roll_plan_to);

                       console.log(roll_plan_to)
                      if(roll_plan_from>roll_plan_to){
                        return { 'IncorrectRollNumber': true };
                       }
                      else if(roll_plan_from<1){

                         //this.formData.form.controls['col_quality'].setErrors({'required': false});
                         return { 'IncorrectRollNumber': true };

                      }
                      }

                 };
                 return validator;
             };


             rollNumberTOValidation() {

                   const validator = (control:FormControl): { [key: string]: any } => {

                         if(control != undefined && control != null && control.parent != undefined){
                          // debugger
                          let roll_plan_to: number = parseInt(control.value)
                        var roll_plan_from= control.parent.get('roll_plan_to') == null ? null : control.parent.get('roll_plan_from').value;
                        roll_plan_from=parseInt(roll_plan_from);

                         console.log(roll_plan_to)
                        if(roll_plan_from>roll_plan_to){
                          return { 'IncorrectRollNumber': true };
                         }
                        else if(roll_plan_to<1){

                           //this.formData.form.controls['col_quality'].setErrors({'required': false});
                           return { 'IncorrectRollNumber': true };

                        }
                        }

                   };
                   return validator;
               };
               isQtyInGrnQty(){

                 const validator = (control:FormControl): { [key: string]: any } => {

                       if(control != undefined && control != null && control.parent != undefined){
                      let qty: number = parseFloat(control.value)
                      var grn_qty= control.parent.get('qty') == null ? null : control.parent.get('grn_qty').value;
                      var from_No=control.parent.get('qty') == null ? null : control.parent.get('roll_plan_from').value;
                      var to_No=control.parent.get('qty') == null ? null : control.parent.get('roll_plan_to').value;
                              grn_qty=parseFloat(grn_qty)
                              from_No=parseInt(from_No)
                              to_No=parseInt(to_No)

                       if((to_No-from_No+1)*qty!=grn_qty){

                         return { 'IncorrectRollQty': true };

                      }
                      }

                 };
                 return validator;





               }

               resetRollPlanPopUp(){
               this.datasetRollPlan=[]
               this.rollPlanGroup.reset()
               const hotInstance = this.hotRegisterer.getInstance(this.instanceRollPlan);
               hotInstance.render();

               }

    saveRollPlanData(){
                 debugger //
            var total_with_out_excess=0;
            var total_excess_qty=0
            this.processing = true
      AppAlert.showMessage('Processing...','Please wait while saving details')
      for(var i=0;i<this.datasetRollPlan.length;i++){
      if(parseFloat(this.datasetRollPlan[i]['is_excess'])==0||this.datasetRollPlan[i]['is_excess']==null){
      total_with_out_excess=parseFloat(this.datasetRollPlan[i]['received_qty'])+total_with_out_excess
      }
      if(parseFloat(this.datasetRollPlan[i]['is_excess'])==1){
      total_excess_qty=parseFloat(this.datasetRollPlan[i]['received_qty'])+total_excess_qty
      }
        }
        //debugger
        if(total_with_out_excess!=this.$_grn_line_qty-this.$_grn_line_excess_qty){
          AppAlert.showError({text:"Qty Not within the GRN Qty"})
          this.processing = false
          return
        }

        if(total_excess_qty!=this.$_grn_line_excess_qty){
          AppAlert.showError({text:"Add Roll Details for Excess Qty"})
          this.processing = false
          return
        }


                  var grn_detail_id=this.datasetRollPlan['0']['grn_detail_id']
                     console.log(this.datasetRollPlan)
                   let saveOrUpdate$=null
                   saveOrUpdate$ = this.http.put(this.apiUrl + 'store/roll/'+grn_detail_id,{ 'dataset':this.datasetRollPlan})

                       saveOrUpdate$.subscribe(
                         (res) => {

                           AppAlert.showSuccess({text : res.data.message })
                           this.rollPlanGroup.reset();
                           this.datasetRollPlan=[]
                           this.rollPlanModel.hide()
                           //this.clearData()
                           //this.reloadTable()
                           //this.matSizeModel.hide()
                             this.processing = false
                        },
                        (error) => {
                            console.log(error)
                        }
                      );



               }
               countDecimals(_val) {
                if(Math.floor(_val) === _val) return 0;
                return _val.toString().split(".")[1].length || 0;
               }

               formatDecimalNumber(_number, _places){
                 let num_val = parseFloat(_number+'e'+_places)//_number.toExponential(2)
                 return Number(Math.round(num_val)+'e-'+_places);
               }

  }
