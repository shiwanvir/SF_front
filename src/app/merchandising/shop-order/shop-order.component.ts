import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { TabsetComponent } from 'ngx-bootstrap';

import { ShopOrderService } from './shop_order.service';

@Component({
  selector: 'app-shop-order',
  templateUrl: './shop-order.component.html',
  styleUrls: ['./shop-order.component.css']
})
export class ShopOrderComponent implements OnInit {
  @ViewChild('shopOrderTabs') tabs: TabsetComponent;

  constructor(private shopOrderService : ShopOrderService) { }

  ngOnInit() {

    this.shopOrderService.loadData.subscribe(data => {
      if(data != null && data != ''){
          this.tabs.tabs[1].active = true;
      }
      //this.message = data
    })


  }
  ngOnDestroy(){
    this.shopOrderService.changeData(null)
  }

  onSelect(e){

  }

}
