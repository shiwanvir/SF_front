import { Component, OnInit , ViewChild} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable , Subject } from 'rxjs';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map} from 'rxjs/operators';
import {SnotifyService , SnotifyPosition} from 'ng-snotify';
import { HotTableRegisterer } from '@handsontable/angular';

import { AppConfig } from '../../core/app-config';
import { AppAlert } from '../../core/class/app-alert';
import { AppFormValidator } from '../../core/validation/app-form-validator';
import { PrimaryValidators } from '../../core/validation/primary-validators';
import { AuthService } from '../../core/service/auth.service';
import { LayoutChangerService } from '../../core/service/layout-changer.service';

import { Customer } from '../../org/models/customer.model';
import { Item } from '../../org/models/item.model';
import { Supplier } from '../../org/models/supplier.model';
import { Cuspo } from '../../org/models/customerpo.model';
import { Division } from '../../org/models/division.model';
import { Style } from '../../merchandising/models/style.model';
import { Salesorder } from '../../merchandising/models/salesorder.model';
import { Po_type } from '../../merchandising/models/po_type.model';
import { Sup_po } from '../../merchandising/models/Sup_po.model';

import * as jspdf from 'jspdf';
import * as html2canvas from 'html2canvas';

declare var $:any;

@Component({
  selector: 'app-fabric-roll-barcode',
  templateUrl: './fabric-roll-barcode.component.html'
})

export class FabricRollBarcodeComponent implements OnInit {

  formGroup : FormGroup
  readonly apiUrl = AppConfig.apiUrl()
  getData: Array<Object> = [];
  printData: Array<Object>;
  printFabricBarcode: Array<Object>;
  printTrimBarcode: Array<Object>;
  pdf: jspdf;
  counter: number;
  length: number;
  marked = false;
  brandFont: any;
  defaultFont: any;
  printOrDown: any;
  printBarcode: any;

  po_no$: Observable<Sup_po[]>;
  poNoLoading = false;
  poNoInput$ = new Subject<string>();

  invoiceNo$: Observable<any[]>;//use to load customer list in ng-select
  invoiceNoLoading = false;
  invoiceNoInput$ = new Subject<string>();
  selectedInvoiceNo: any[];

  settingsBarcode: any = null //for items table
  //dataB: any = [] //items list
  tblBarcode : string = 'barcodeList' //items table name


  constructor(private fb:FormBuilder, private http:HttpClient, private snotifyService: SnotifyService,
    private layoutChangerService : LayoutChangerService,private auth : AuthService,
    private titleService: Title, private hotRegisterer: HotTableRegisterer) { }

  ngOnInit() {

    this.titleService.setTitle("Barcode Print")


    this.loadPOno();
    this.loadInvoceNo();
    this.createTable();

    this.formGroup = this.fb.group({
      type_of_po : 'auto',
      type_of_barcode : '',
      po_number: null,
      invoice_no: null,
      barcode_from: null,
      barcode_to: null
    })

  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.layoutChangerService.changeHeaderPath([
        'Reports',
        'Stores',
        'Barcode Print'
      ]);
    }, 1);
  }

  createTable(){
  /*  this.TABLE = $('#barcodes_tbl').DataTable({
      data : this.getData,
      autoWidth: true,
      scrollY: "500px",
      scrollCollapse: true,
      "columns": [
            { "data": "po_number" },
            { "data": "batch_no" },
            { "data": "roll_or_box_no" },
        ]
    });*/

    this.settingsBarcode = {
      columns: [
        { type: 'checkbox', title : 'Action', readOnly: false, colWidths : 40, data : 'selection'},
        { type: 'text', title : 'Barcode' , data: 'barcode'},
      ],
      manualColumnResize: true,
      autoColumnSize : true,
      colWidths: [10, 220],
      rowHeaders: true,
      //height: 300,
      stretchH: 'all',
      selectionMode: 'single',
      //fixedColumnsLeft: 4,
      //className: 'htCenter htMiddle',
      className: "htLeft",
      readOnly: true
    }

  }

  loadPOno() {
    this.po_no$ = this.poNoInput$
    .pipe(
      debounceTime(200),
      distinctUntilChanged(),
      tap(() => this.poNoLoading = true),
      switchMap(term => this.http.get<Sup_po[]>(this.apiUrl + 'reports/load_po?type=auto' , {params:{search:term, po_type : this.formGroup.get('type_of_po').value}})
      .pipe(
        tap(() => this.poNoLoading = false)
      ))
    );
  }

  loadInvoceNo(){
    this.invoiceNo$= this.invoiceNoInput$
    .pipe(
      debounceTime(200),
      distinctUntilChanged(),
      tap(() => this.invoiceNoLoading= true),
      switchMap(term => this.http.get<any[]>(this.apiUrl + 'stores/fabricInspection?type=autoInvoice' , {params:{search:term}})
      .pipe(
        //catchError(() => of([])), // empty list on error
        tap(() => this.invoiceNoLoading = false)
      ))
    );
  }

  searchFrom() {

    $('#barcodes_tbl').DataTable().destroy();
    let formData = this.formGroup.getRawValue();
    let type = formData['type_of_barcode'];
    let poType = formData['type_of_po'];
    this.printData = []
    this.printBarcode = []

    if(poType == null || poType == ''){
      AppAlert.showError({text : 'Enter PO Type'});
      return
    }
    if(type == null || type == ''){
      AppAlert.showError({text : 'Enter Material Type'});
      return
    }

    if(type != ''){
      if(formData['po_number'] != null || formData['invoice_no'] != null){
        this.http.post<any[]>(this.apiUrl + 'reports/fabric_roll_barcode_print' , formData).subscribe(res => {
          for(let x = 0 ; x < res['data'].length ; x++){
            res['data'][x]['selection'] = false;
            res['data'][x]['barcode'] = res['data'][x]['po_number'] + res['data'][x]['batch_no'] + res['data'][x]['roll_or_box_no']
          }
          this.getData = res['data'];
          /*$.each(this.getData, function(index, value) {
            // if(value.roll_no != undefined){
              var barcode = value.po_number + value.batch_no + value.roll_or_box_no;
              value.barcode = barcode;
            //  }else{
            //   var barcode = value.po_number + value.batch_no + value.box_no;
            //   value.barcode = barcode;
            // }
          });*/
          if(this.getData.length == 0){
            AppAlert.showError({text : 'Data not available'});
          }
        });
      }else{
        AppAlert.showError({text : 'Enter PO NO or Invoice NO'});
      }
    }else{
      AppAlert.showError({text : 'Enter Type!'});
    }

    //setTimeout (() => {
  //    $('#barcodes_tbl').DataTable();
  //  }, 2000);

  }

  toggleVisibility(e){
    //var table = $('#barcodes_tbl').DataTable();
    this.marked = e.target.checked;
    if(this.marked == true){
      for(let x = 0 ; x < this.getData.length ; x++){
        this.getData[x]['selection'] = true;
      }
    //  table.rows().every(function(){
    //    var tr = $(this.node());
    //    tr.find('td:nth-child(2) input[type="checkbox"]').prop('checked', true);
    //  });
    }else if(this.marked == false){
      for(let x = 0 ; x < this.getData.length ; x++){
        this.getData[x]['selection'] = false;
      }
    //  table.rows().every(function(){
    //    var tr = $(this.node());
    //    tr.find('td:nth-child(2) input[type="checkbox"]').prop('checked', false);
    //  });
    }

    let hotInstance = this.hotRegisterer.getInstance(this.tblBarcode);
    if(hotInstance != undefined && hotInstance != null){
        hotInstance.render() //refresh costing color table
    }
  }

  //delete fabric barcodes
  deleteBarcode(roll_paln_id, batch_no){

    AppAlert.showConfirm({
      'text' : 'Do you want to delete selected barcode number?'
    },
    (result) => {
      if (result.value) {
        this.http.post<any[]>(this.apiUrl + 'reports/delete_barcode' , {roll:roll_paln_id,batch:batch_no})
        .pipe(map( data => data['data'] ))
        .subscribe(
          (data) => {
            if(data.status==0){
              AppAlert.showError({text:data.message})
            }
            else if(data.status==1){
              window.location.reload();
            }
          },
          (error) => {
            console.log(error)
          }
        )
      }
    });
  }

  //delete trim barcodes
  deleteBarcodeTrim(trim_packing_id, batch_no){

    AppAlert.showConfirm({
      'text' : 'Do you want to delete selected barcode number?'
    },
    (result) => {
      if (result.value) {
        this.http.post<any[]>(this.apiUrl + 'reports/delete_trim_barcode' , {trim:trim_packing_id,batch:batch_no})
        .pipe(map( data => data['data'] ))
        .subscribe(
          (data) => {
            if(data.status==0){
              AppAlert.showError({text:data.message})
            }
            else if(data.status==1){
              window.location.reload();
            }
          },
          (error) => {
            console.log(error)
          }
        )
      }
    });
  }


  viewBarcodes(){
    var alldata = this.getData;
    var printData = [];
    var printFabricBarcode = [];
    var printTrimBarcode = [];

    /*var table = $('#barcodes_tbl').DataTable();

    table.rows().every(function(){
      var tr = $(this.node());

      if(tr.find('td:nth-child(2)').find('input').is(":checked")){
        var id = tr.find('td:nth-child(2)').find('input').attr('id');
        var barcode = tr.find('td:nth-child(3)').text();
        var type = tr.find('td:nth-child(3)').attr('attr-type');

        // if(type == 'fabric'){
          $.each(alldata, function(index, value) {
            if(id == index){
              printData.push(value);
              debugger
              printFabricBarcode.push(barcode);
            }
          });


      }

    });*/

    var barcodeFrom = this.formGroup.get('barcode_from').value
    var barcodeTo = this.formGroup.get('barcode_to').value

    if(barcodeFrom != null && barcodeFrom != '' && barcodeTo != null && barcodeTo != ''){
      if(barcodeFrom <= 0 || barcodeTo <= 0 || barcodeFrom > this.getData.length || barcodeTo > this.getData.length || barcodeFrom > barcodeTo){
        AppAlert.showError({text : 'Incorrect Barcode Range' });
        return
      }
      else {
        for(let x = (barcodeFrom - 1); x < barcodeTo ; x++){
            printFabricBarcode.push(this.getData[x]['barcode']);
            printData.push(this.getData[x]);
        }
      }
    }
    else {
      for(let x = 0 ; x < this.getData.length ; x++){
        if(this.getData[x]['selection'] == true){
          printFabricBarcode.push(this.getData[x]['barcode']);
          printData.push(this.getData[x]);
        }
      }
    }


    if(printData.length > 0){
      this.printData = printData;
      this.printFabricBarcode = printFabricBarcode;
      // this.printTrimBarcode = printTrimBarcode;
    }else{
      AppAlert.showError({text : 'Select Barcode numbers.' });
    }
  }


  printBarcodes(){

    if($('#hiddenContent').is(':empty')){
      $('#hiddenContent').css({
        'overflow' : 'hidden',
        'height' : '0'
      });
      this.viewBarcodes();
    }

    if(this.printData !== undefined){
      setTimeout (() => {
        let barcodes = [];
        // if(this.printFabricBarcode.length > 0){
          barcodes = this.printFabricBarcode;
          this.http.post<any[]>(this.apiUrl + 'reports/update_print_status' , {param:barcodes}).subscribe(res => {
          });
        // }else{
        //   barcodes = this.printTrimBarcode;
        //   this.http.post<any[]>(this.apiUrl + 'reports/update_print_trim_status' , {param:barcodes}).subscribe(res => {
        //   });
        // }
        this.printOrDown = 'P';

        AppAlert.showMessage('Processing...','Please wait while generating PDF');
        this.pdf = new jspdf('l', 'pt', [216, 288], true);
        this.length = this.printData.length
        this.counter = 0
        this.generatePDF(this.printOrDown);
      }, 1000);
    }else{
      AppAlert.showError({text : 'Select Barcode numbers.' });
    }

  }


  downloadBarcodes(){
    if($('#hiddenContent').is(':empty')){
      $('#hiddenContent').css({
        'overflow' : 'hidden',
        'height' : '0'
      });
      this.viewBarcodes();
    }

    if(this.printData !== undefined){
      setTimeout (() => {
        let barcodes = this.printBarcode;
        this.printOrDown = 'D';
        this.http.post<any[]>(this.apiUrl + 'reports/update_print_status' , {param:barcodes}).subscribe(res => {
        });

        AppAlert.showMessage('Processing...','Please wait while generating PDF');
        this.pdf = new jspdf('l', 'pt', [216, 288], true);
        this.length = this.printData.length
        this.counter = 0
        this.generatePDF(this.printOrDown);
      }, 1000);
    }else{
      AppAlert.showError({text : 'Select Barcode numbers.' });
    }
  }

  generatePDF(e) {
    var data = document.getElementById('pdf' + this.counter);

    html2canvas(data,{
      scale: 3 // make better quality ouput
    }).then((canvas) => {
      this.counter++

      var divHeight = $('#pdf' + this.counter).height();
      var divWidth = $('#pdf' + this.counter).width();

      const contentDataURL = canvas.toDataURL('image/jpeg', 1.0);
      this.pdf.addImage(contentDataURL,'JPEG', 16, 8, 300, 200, undefined,'FAST');

      // Control if new page needed, else generate the pdf
      if (this.counter < this.length) {
        this.pdf.addPage();
        this.generatePDF(e);
      } else {
        AppAlert.closeAlert();
        var currentDate = new Date().toJSON("yyyy/MM/dd HH:mm");
        if(e === 'P'){
          this.pdf.autoPrint();
          this.pdf.output('dataurlnewwindow');
        }else{
          this.pdf.save('Barcodes_' + currentDate + '.pdf'); // Generated PDF
        }
        return true
      }
    })
  }

  refreshPage(){
    // window.location.reload();
    this.formGroup.reset();
    this.getData = []
    this.printData = []
    this.printBarcode = []
    document.getElementById("selectAll")['checked'] = false;
    //var table = $('#barcodes_tbl').DataTable();
  //  table
    //.clear()
    //.draw();
  //  $('#hiddenContent').html('');
  }

}
