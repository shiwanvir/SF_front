import { Component, OnInit,ViewChild } from '@angular/core';
import { TabsetComponent,TabDirective} from 'ngx-bootstrap';

import { SupplierService } from './supplier.service';
import { LayoutChangerService } from '../../core/service/layout-changer.service';
import { SupplierTolaranceComponent } from './supplier-tolarance/supplier-tolarance.component';


@Component({
  selector: 'app-supplier-home',
  templateUrl: './supplier-home.component.html',
  styleUrls: []
})
export class SupplierHomeComponent implements OnInit {

  //message:string
  @ViewChild('tabs') tabs: TabsetComponent;
  @ViewChild(SupplierTolaranceComponent) suplierTolarnce: SupplierTolaranceComponent;
  headerTitle:string = 'Suppliers'

  constructor(private supplier:SupplierService, private layoutChangerService : LayoutChangerService) { }

  ngOnInit() {

    this.supplier.supplierData.subscribe(data => {
      if(data != null && data != ''){
          this.tabs.tabs[1].active = true;
      }
      //else if(data=='ACTIVE_TAB_ZERO')
      //this.message = data
    })
//
    this.supplier.tab1.subscribe(tab1=>{
      if(tab1=='0'){
        this.tabs.tabs[0].active = true;
      }

    } )
    //change header nevigation pagePath
    this.layoutChangerService.changeHeaderPath([
      'Supply Chain Management',
      'Sourcing',
      'Supplier'
    ])


  }

  reloadData(){

  }

  onSelect(data: TabDirective): void {

    let pathArr = [
      'Catalogue',
      'Application Basic Setup'
    ];
    this.headerTitle = data.heading


    if(data.heading == 'Supplier-Tolerance'){
      //debugger
    console.log(data.heading);
    this.suplierTolarnce.reloadTable()

    }
}

}
