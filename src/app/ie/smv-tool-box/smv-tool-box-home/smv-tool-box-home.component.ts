import { Component, OnInit, ViewChild,OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { TabsetComponent,TabDirective } from 'ngx-bootstrap';
import { ActivatedRoute } from '@angular/router';
import { SmvToolBoxService } from '../smv-tool-box.service';
import{SmvToolBoxComponent}from '../smv-tool-box.component';
import{SmvToolBoxDetailsComponent}from '../smv-tool-box-details/smv-tool-box-details.component';

@Component({
  selector: 'app-smv-tool-box-home',
  templateUrl: './smv-tool-box-home.component.html',
  styleUrls: ['./smv-tool-box-home.component.css']
})
export class SmvToolBoxHomeComponent implements OnInit {

  @ViewChild('buyerPoTabs') tabs: TabsetComponent;
  @ViewChild(SmvToolBoxDetailsComponent) childSMVDetails: SmvToolBoxDetailsComponent;
  @ViewChild(SmvToolBoxComponent) childSMV: SmvToolBoxComponent;

  constructor(private router: ActivatedRoute,private smvToolBoxService : SmvToolBoxService, private titleService: Title) { }


    ngOnInit() {

      this.titleService.setTitle("SMV")//set page title

      this.smvToolBoxService.smvData
       .subscribe(data => {
       if(data != null){
           this.tabs.tabs[1].active = true;
         }
       })

    }

  ngOnDestroy(){
    this.smvToolBoxService.changeData(null);
  }


  onSelect(data: TabDirective): void {

    let pathArr = [
      'Catalogue',
      'IE'
    ];

    switch(data.heading){
      case 'SMV Tool Box List' :
            if(this.childSMVDetails.datatable == null){
            }
          this.childSMVDetails.reloadTable()

        break;
      case 'SMV Tool Box' :
            this.childSMV.clear();
        break;


    }



  }
}
