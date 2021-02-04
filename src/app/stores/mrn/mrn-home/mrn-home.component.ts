import { Component, OnInit, ViewChild,OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { TabsetComponent,TabDirective } from 'ngx-bootstrap';
import { ActivatedRoute } from '@angular/router';
import { MRNService}from'../mrn.service';
import{MrnDetailsComponent}from '../mrn-details/mrn-details.component';
import{MrnComponent}from'../mrn.component';



@Component({
  selector: 'app-mrn-home',
  templateUrl: './mrn-home.component.html',
  styleUrls: ['./mrn-home.component.css']
})
export class MrnHomeComponent implements OnInit {

  @ViewChild('buyerPoTabs') tabs: TabsetComponent;
  @ViewChild(MrnDetailsComponent) childMRNDetails: MrnDetailsComponent;
  @ViewChild(MrnComponent) childMRN: MrnComponent;

    constructor(private router: ActivatedRoute,private mrnService: MRNService, private titleService: Title) { }

  ngOnInit() {
        this.titleService.setTitle("MRN")//set page title
        //debugger
        this.mrnService.mrnData
         .subscribe(data => {
          // debugger
         if(data != null){
             this.tabs.tabs[1].active = true;
           }
         })
  }

  ngOnDestroy(){
    this.mrnService.changeData(null);
  }


  onSelect(data: TabDirective): void {

    let pathArr = [
      'Warehouse Managemnt',
      'Stores'
    ];

    switch(data.heading){
      case 'Style MRN List' :
            //if(this.childMRNDetails.datatable == null)
            {
              this.childMRNDetails.reloadTable()
            }
        //  this.childMRNDetails.reloadTable()

        break;
      case 'Style MRN' :

          this.childMRN.clearData()
        break;


    }



  }

}
