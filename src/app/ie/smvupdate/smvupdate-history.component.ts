import { Component, OnInit,ViewChild,OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder , FormGroup, Validators } from '@angular/forms';
import { Observable , Subject } from 'rxjs';
import { map } from 'rxjs/operators';

//third part components
import { ModalDirective } from 'ngx-bootstrap/modal';
declare var $:any;


import { AppConfig } from '../../core/app-config';
import { AppAlert } from '../../core/class/app-alert';
import { SmvupdateService } from './smvupdate.service';
import { LayoutChangerService } from '../../core/service/layout-changer.service';


@Component({
  selector: 'app-smvupdate-history',
  templateUrl: './smvupdate-history.component.html',
  styleUrls: []
})
export class SmvupdateHistoryComponent implements OnInit {

  // @ViewChild(ModalDirective) smvupdateHisModel: ModalDirective
  formGroup : FormGroup
  datatable:any = null
  readonly apiUrl = AppConfig.apiUrl()


  formFields = {
    customer_name : '',
    division_id : '',
    product_silhouette_description : '',
    version : '',
    min_smv : '',
    max_smv : '',
  }

  constructor(private fb:FormBuilder, private http:HttpClient, private smvupdateService:SmvupdateService,private layoutChangerService : LayoutChangerService) { }

  ngOnInit() {

    this.smvupdateService.status.subscribe(status => {
      if(status == 'RELOAD_TABLE'){
        this.reloadTable()
      }
    })


    this.formGroup = this.fb.group({
      smv_his_id : 0 ,
      customer_name : [null , [Validators.required]],
      division_id : [null , [Validators.required] ],
      product_silhouette_description : [null , [Validators.required]],
      version : [null, [Validators.required]],
      min_smv : [null , [Validators.required] ],
      max_smv : [null , [Validators.required] ]

    })

    // this.createTable() //load data list

    this.layoutChangerService.headerMinButtonEvent.subscribe(data => {
      if(data == false){return;}
      if(this.datatable != null){
        this.datatable.draw(false);
      }
    })



  }


  reloadTable() {//reload datatable
    this.datatable.ajax.reload(null, false);
  }

  ngOnDestroy(){
      this.datatable = null
  }

  createTable() { //initialize datatable
    this.datatable = $('#smvupdatehis_tbl').DataTable({
      autoWidth: true,
      scrollY: "500px",
      scrollCollapse: true,
      processing: true,
      responsive: true,
      serverSide: true,
      order:[[0,'desc']],
      ajax: {
        dataType : 'JSON',
        "url": this.apiUrl + "ie/smvupdatehistories?type=datatable"
      },
      columns: [
        {data:"smv_his_id",
        visible: false,
      },
      //{data: "customer_name"},
      //{ data: "division_description"},
      { data: "version"},
      { data: "product_silhouette_description" },
      {
        data: "min_smv",className: 'dt-body-right',
        render : function(data){
          return parseFloat(data).toFixed(2);
        }
      },
      {
        data: "max_smv",className: 'dt-body-right',
        render : function(data){
          return parseFloat(data).toFixed(2);
        }
      }
      // { data: "min_smv" },
      // { data: "max_smv" }
    ],
  });

}
}
