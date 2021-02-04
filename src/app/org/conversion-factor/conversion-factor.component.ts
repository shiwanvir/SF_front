import { Component, OnInit,ViewChild,OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map} from 'rxjs/operators';

//third part components
import { ModalDirective } from 'ngx-bootstrap/modal';
declare var $:any;
import { AppConfig } from '../../core/app-config';
import { LayoutChangerService } from '../../core/service/layout-changer.service';

@Component({
  selector: 'app-conversion-factor',
  templateUrl: './conversion-factor.component.html',
})

export class ConversionFactorComponent implements OnInit {

  readonly apiUrl = AppConfig.apiUrl()
  datatable:any = null

  constructor(private fb:FormBuilder , private http:HttpClient, private layoutChangerService : LayoutChangerService, private titleService: Title) { }

  ngOnInit() {

    this.titleService.setTitle("Conversion Factor")//set page title
    this.createTable()

    //change header nevigation pagePath
    this.layoutChangerService.changeHeaderPath([
      'Catalogue',
      'Application Basic Setup',
      'Conversion Factor'
    ])

    //listten to the menu collapse and hide button
    this.layoutChangerService.headerMinButtonEvent.subscribe(data => {
      if(data == false){return;}
      if(this.datatable != null){
        this.datatable.draw(false);
      }
    })

  }

  ngOnDestroy(){
      this.datatable = null
  }

  createTable() { //initialize datatable
     this.datatable = $('#conv_factor_tbl').DataTable({
       autoWidth: false,
       scrollY: "500px",
       scrollCollapse: true,
       processing: true,
       serverSide: true,
       paging:true,
       searching:true,
       order : [[ 0, 'asc' ]],
       ajax: {
            dataType : 'JSON',
            "url": this.apiUrl + "org/conv-factor?type=datatable"
        },
        columns: [
          { data: "conv_id" },
          { data: "unit_code" },
          { data: "description" },
          { data: "present_factor" },
          { data: "base_unit" }
       ],
     });

  }

  reloadTable() {
      this.datatable.ajax.reload(null, false);
  }

}
