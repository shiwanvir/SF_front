import { Component, OnInit, ViewChild, Input , Output ,EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';


import { ModalDirective } from 'ngx-bootstrap/modal';

import { AppConfig } from '../../../core/app-config';

@Component({
  selector: 'app-htselect',
  templateUrl: './htselect.component.html',
  styleUrls: ['./htselect.component.css']
})
export class HtselectComponent implements OnInit {

  @Input('url') url : string = ''
//  @Output('onSearch') searchEvent = new EventEmitter()
  @ViewChild('searchingModel') searchingModel: ModalDirective;

  modelTitle : string = ''
  readonly apiUrl = AppConfig.apiUrl()
  form : FormGroup

  constructor(private fb:FormBuilder ) { }

  ngOnInit() {
    this.form = this.fb.group({
      search : null
    })

    this.form.controls['search'].valueChanges.subscribe(data => {
      console.log(data)
    })
  }


  openModel(){
    this.searchingModel.show()
  }

  showEvent(e){

  }

}
