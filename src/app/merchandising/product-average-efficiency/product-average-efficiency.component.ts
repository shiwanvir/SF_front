import { Component, OnInit, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TabsetComponent, TabDirective} from 'ngx-bootstrap';

import { ProductAverageEfficiencyHistoryComponent } from './product-average-efficiency-history.component';
import { ProductAverageEfficiencyListComponent } from './product-average-efficiency-list.component';

@Component({
  selector: 'app-product-average-efficiency',
  templateUrl: './product-average-efficiency.component.html',
  styleUrls: []
})
export class ProductAverageEfficiencyComponent implements OnInit {

  @ViewChild(ProductAverageEfficiencyHistoryComponent) childHisList: ProductAverageEfficiencyHistoryComponent;
  @ViewChild(ProductAverageEfficiencyListComponent) childList: ProductAverageEfficiencyListComponent;

  constructor(private titleService: Title) { }

  ngOnInit() {
    this.titleService.setTitle("Product Average Efficiency")//set page title
  }

  onSelect(data: TabDirective): void{
    if(data.heading == 'Product Average Efficiency History'){
      this.childHisList.reloadTable()
    }else if(data.heading == 'Product Average Efficiency'){
      this.childList.reloadTable()
    }
  }

}
