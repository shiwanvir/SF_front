import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { TabsetComponent,TabDirective } from 'ngx-bootstrap';
import { StyleCreationService } from '../style-creation.service';
import { StyleCreationComponent } from '../style-creation.component';


@Component({
  selector: 'app-style-creation-home',
  templateUrl: './style-creation-home.component.html',
  styleUrls: ['./style-creation-home.component.css']
})
export class StyleCreationHomeComponent implements OnInit {

  @ViewChild('buyerPoTabs') tabs: TabsetComponent;
  @ViewChild(StyleCreationComponent) styleCreationTerm: StyleCreationComponent;
  constructor(private styleCreationService : StyleCreationService, private titleService: Title) { }

  ngOnInit() {

    this.titleService.setTitle("Style Creation")//set page title

    this.styleCreationService.styleCreation
    .subscribe(data => {
      if(data != null){
        this.tabs.tabs[1].active = true;
      }else {
        this.tabs.tabs[0].active = true;
      }
    })





  }

  ngOnDestroy(){


   //this.customerService.changeData(null)
  // this.destroySubject$.next();
  // this.destroySubject$.complete()
   this.styleCreationService.changeData(null)
   this.styleCreationService.popup(null)




 }

  onSelect(data: TabDirective): void {

    if(data.heading == 'Style Creation List'){
        this.styleCreationTerm.reloadTable()
    }

  }

}
