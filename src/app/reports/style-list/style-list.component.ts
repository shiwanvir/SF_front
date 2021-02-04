import { Component, OnInit , ViewChild} from '@angular/core';
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

import { Division } from '../../org/models/division.model';
import { Style } from '../../merchandising/models/style.model';

declare var $:any;

@Component({
  selector: 'app-style-list',
  templateUrl: './style-list.component.html'
})

export class StyleListComponent implements OnInit {

  style$: Observable<Style[]>;
  styleLoading = false;
  styleInput$ = new Subject<string>();

  division$: Observable<Division[]>;
  divisionLoading = false;
  divisionInput$ = new Subject<string>();

  formGroup : FormGroup
  readonly apiUrl = AppConfig.apiUrl();
  getData: Array<Object>;

  imgURL: any;
  urls: Array<Object>;

  constructor(private fb:FormBuilder, private http:HttpClient, private snotifyService: SnotifyService, private layoutChangerService : LayoutChangerService,private auth : AuthService,private titleService: Title) { }

  ngOnInit() {

    this.titleService.setTitle("Style Report")

    this.loadStyle();
    this.loadDivision();

    this.formGroup = this.fb.group({
      style_no : null,
      division_description: null
    })

  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.layoutChangerService.changeHeaderPath([
        'Reports',
        'Style Report'
      ]);
    }, 1);
  }


  loadStyle() {
    this.style$ = this.styleInput$
    .pipe(
      debounceTime(200),
      distinctUntilChanged(),
      tap(() => this.styleLoading = true),
      switchMap(term => this.http.get<Style[]>(this.apiUrl + 'ie/styles?type=auto' , {params:{search:term}})
      .pipe(
        tap(() => this.styleLoading = false)
      ))
    );
  }

  loadDivision() {
    this.division$ = this.divisionInput$
    .pipe(
      debounceTime(200),
      distinctUntilChanged(),
      tap(() => this.divisionLoading = true),
      switchMap(term => this.http.get<Division[]>(this.apiUrl + 'org/divisions?type=auto' , {params:{search:term}})
      .pipe(
        tap(() => this.divisionLoading = false)
      ))
    );
  }

  onChange(event:any){

    let formData = this.formGroup.getRawValue();
    var style = event.target.value;
    var division = formData['division_description'];

    this.http.post<any[]>(this.apiUrl + 'reports/style-list?type=auto', {search:style,div:division}).subscribe(res => {
      this.getData = res['data'];

      if(this.getData.length != 0){

        var urls = [];
        $.each(this.getData, function(index, value) {
          var url = AppConfig.StayleImage()+value.image;
          var styleNo = value.style_no;
          var styleDes = value.style_description;
          urls[index] =  {
            'image':url,
            'style_no':styleNo,
            'style_description':styleDes
          }
        });
        this.urls = urls;

      }else{

        this.urls = [];
        AppAlert.showError({text : 'Data not available!'});

      }
    });
  }

  searchStyles() {
    let formData = this.formGroup.getRawValue();

    this.http.post<any[]>(this.apiUrl + 'reports/style-list?type=click', formData).subscribe(res => {
      this.getData = res['data'];

      if(this.getData.length != 0){

        var urls = [];
        $.each(this.getData, function(index, value) {
          var url = AppConfig.StayleImage()+value.image;
          var styleNo = value.style_no;
          var styleDes = value.style_description;
          urls[index] =  {
            'image':url,
            'style_no':styleNo,
            'style_description':styleDes
          }
        });
        this.urls = urls;

      }else{

        this.urls = [];
        AppAlert.showError({text : 'Error! Invalid Data'});

      }
    });
  }

  refreshPage(){
    window.location.reload();
  }

}
