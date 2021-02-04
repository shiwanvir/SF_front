import { Component, OnInit , ViewChild, ElementRef} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable , Subject } from 'rxjs';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map} from 'rxjs/operators';
import {SnotifyService , SnotifyPosition} from 'ng-snotify';

import { AppConfig } from '../../core/app-config';
import { AppAlert } from '../../core/class/app-alert';
import { AppFormValidator } from '../../core/validation/app-form-validator';
import { PrimaryValidators } from '../../core/validation/primary-validators';
import { LayoutChangerService } from '../../core/service/layout-changer.service';
import { AuthService } from '../../core/service/auth.service';
import { RedirectService } from '../redirect.service';

import { MRN_no } from '../../org/models/mrn.model';
import * as jspdf from 'jspdf';
import * as html2canvas from 'html2canvas';

declare var $:any;

@Component({
  selector: 'app-mrn-note',
  templateUrl: './mrn-note.component.html'
})

export class MRNNoteComponent implements OnInit {

  formGroup : FormGroup
  readonly apiUrl = AppConfig.apiUrl()
  getData: Array<Object>;
  getItemData: Array<Object>;
  pdf: jspdf;
  counter: number;
  length: number;
  image:any;

  mrn_no$: Observable<MRN_no[]>;
  mrnNoLoading = false;
  mrnNoInput$ = new Subject<string>();

  @ViewChild('target') targetElement: any;
  result: string;

  constructor(private fb:FormBuilder, private http:HttpClient, private snotifyService: SnotifyService, private layoutChangerService : LayoutChangerService,private auth : AuthService,private titleService: Title, private opentab: RedirectService) { }

  ngOnInit() {

    this.titleService.setTitle("MRN Note")
    this.layoutChangerService.changeHeaderPath([
      'Reports',
      'MRN',
      'MRN Note'
    ]);

    this.loadMRNno();

    this.formGroup = this.fb.group({
      mrn_no : null
    })

  }

  loadMRNno() {
    this.mrn_no$ = this.mrnNoInput$
    .pipe(
      debounceTime(200),
      distinctUntilChanged(),
      tap(() => this.mrnNoLoading = true),
      switchMap(term => this.http.get<MRN_no[]>(this.apiUrl + 'reports/load_mrn?type=auto' , {params:{search:term}})
      .pipe(
        tap(() => this.mrnNoLoading = false)
      ))
    );
  }

  searchFrom() {

    let formData = this.formGroup.getRawValue();

    let mrn_id = '';
    mrn_id = formData['mrn_no']['mrn_id'];
    let mrn_no = '';
    mrn_no = formData['mrn_no']['mrn_no'];

    let param = {ci:mrn_id,bi:mrn_no};
    this.opentab.post(param,this.apiUrl + "reports/load_mrn_note");

  }

  printPdf(){
    AppAlert.showMessage('Processing...','Please wait while generating PDF');
    this.pdf = new jspdf("p", "mm", "a4");
    this.length = this.getData.length
    this.counter = 0;
    this.generatePDF();
  }

  generatePDF() {
    var data = document.getElementById('pdf' + this.counter);

    html2canvas(data,{
      scale: 3 // make better quality ouput
    }).then((canvas) => {
      this.counter++

      const height = (this.targetElement.nativeElement.offsetHeight)/3;

      const contentDataURL = canvas.toDataURL('image/jpeg', 1.0);
      this.pdf.addImage(contentDataURL,'JPEG', 5, 5, 200, height, undefined,'FAST');

      // Control if new page needed, else generate the pdf
      if (this.counter < this.length) {
        this.pdf.addPage();
        this.generatePDF();
      } else {
        AppAlert.closeAlert();
        var currentDate = new Date().toJSON("yyyy/MM/dd HH:mm");
        this.pdf.save('MRN_note' + currentDate + '.pdf');
        return true
      }
    })
  }

}
