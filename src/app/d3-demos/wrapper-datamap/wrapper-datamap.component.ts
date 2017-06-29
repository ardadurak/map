import { Component, Input, OnInit } from '@angular/core';


export interface DatamapLayout {
  name: string;
  label: string;
}


@Component({
  selector: 'app-wrapper-datamap',
  templateUrl: './wrapper-datamap.component.html',
  styleUrls: ['./wrapper-datamap.component.css']
})
export class WrapperDatamapComponent implements OnInit {

  @Input() selectedLayout: DatamapLayout;

  public datamapLayouts: DatamapLayout[] = [
    {
      name: 'small',
      label: 'Small Visualization'
    },
    {
      name: 'large',
      label: 'Large Visualization'
    }
  ];

  ngOnInit() {
    if (this.selectedLayout === undefined) {
      this.selectedLayout = this.datamapLayouts[0];
    }
  }

  public onActiveButtonChange(layout: DatamapLayout): void {
    this.selectedLayout = layout;
  }


}
