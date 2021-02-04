
import { Component, OnInit , ViewChild , AfterViewInit} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TabsetComponent,TabDirective} from 'ngx-bootstrap';

import { InventoryItemListComponent } from '../inventory-item-list/inventory-item-list.component';
import { ItemcreationwizardComponent } from '../itemcreationwizard/itemcreationwizard.component';
import { ItemlistingComponent } from '../itemlisting/itemlisting.component';
import { LayoutChangerService } from '../../core/service/layout-changer.service';
import { ItemcreationwizardEditComponent } from '../itemcreationwizard-edit/itemcreationwizard-edit.component';

@Component({
  selector: 'app-itemgroup',
  templateUrl: './itemgroup.component.html',
  styleUrls: ['./itemgroup.component.css']
})
export class ItemgroupComponent implements OnInit {

  @ViewChild(InventoryItemListComponent) inventoryItemList : InventoryItemListComponent;
  @ViewChild(ItemcreationwizardComponent) itemCreationWizard : ItemcreationwizardComponent;
  @ViewChild(ItemlistingComponent) itemListing : ItemlistingComponent;
  @ViewChild(ItemcreationwizardEditComponent) itemCreationWizardEdit : ItemcreationwizardEditComponent;



  isItemCreationTabRendered : boolean = false

  constructor(private titleService: Title, private layoutChangerService : LayoutChangerService) { }

  ngOnInit() {
    this.titleService.setTitle("Item Creation")//set page title
    //change header nevigation pagePath
    this.layoutChangerService.changeHeaderPath([
      'Product Development',
      'Master Data',
      'Item Creation'
    ])
  }

  onSelect(data): void {
    switch(data.heading){
      case 'Item Creation' :
        if(this.isItemCreationTabRendered == false){
          setTimeout(()=>{
            this.itemCreationWizard.renderColorTable()
            this.itemCreationWizard.renderSizeTable()
            this.itemCreationWizard.renderItemTable()
            this.isItemCreationTabRendered = true
          },100)
        }
      break

      case 'Item Listing' :
        if(this.inventoryItemList.datatable == null){
          this.inventoryItemList.createTable()
        }
        else{
          //this.inventoryItemList.reloadTable()
          this.inventoryItemList.drawTable()
        }
      break

      case 'Material Listing' :
        this.itemListing.drawTable()
      break

      case 'Item Creation Edit' :
        this.itemCreationWizardEdit.ngOnInit()

      break
    }

  }

}
