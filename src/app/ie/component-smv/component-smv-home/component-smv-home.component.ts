import { Component, OnInit, ViewChild,OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { TabsetComponent,TabDirective } from 'ngx-bootstrap';
import { ActivatedRoute } from '@angular/router';
import { SmvService } from '../smv.service';
import{ComponentSmvComponent}from '../component-smv.component';
import{ComponentSmvDetailsComponent} from '../component-smv-details/component-smv-details.component';
@Component({
  selector: 'app-component-smv-home',
  templateUrl: './component-smv-home.component.html',
  styleUrls: ['./component-smv-home.component.css']
})
export class ComponentSmvHomeComponent implements OnInit{

  @ViewChild('buyerPoTabs') tabs: TabsetComponent;
  @ViewChild(ComponentSmvDetailsComponent) childSMVDetails: ComponentSmvDetailsComponent;
  @ViewChild(ComponentSmvComponent) childSMV: ComponentSmvComponent;

  constructor(private router: ActivatedRoute,private smvService : SmvService, private titleService: Title) { }

  ngOnInit() {

    this.titleService.setTitle("SMV")//set page title

    this.smvService.smvData
     .subscribe(data => {
     if(data != null){
         this.tabs.tabs[1].active = true;
       }
     })

  }

ngOnDestroy(){
  this.smvService.changeData(null);
}
  onSelect(data: TabDirective): void {

    let pathArr = [
      'Catalogue',
      'IE'
    ];

    switch(data.heading){
      case 'Component SMV List' :
            if(this.childSMVDetails.datatable == null){
            }
          this.childSMVDetails.reloadTable()

        break;
      case 'Componet SMV' :

          this.childSMV.clear();
        break;


    }



  }

}
