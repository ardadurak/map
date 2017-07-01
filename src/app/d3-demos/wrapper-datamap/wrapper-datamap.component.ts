import { Component, Input, OnInit } from '@angular/core';


export interface DatamapLayout {
  name: string;
  label: string;
  width: number;
  height: number;
  phylloRadius: number;
  pointRadius: number;
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
      label: 'Small Visualization',
      width: 400,
      height: 400,
      phylloRadius: 4,
      pointRadius: 2
    },
    {
      name: 'large',
      label: 'Large Visualization',
      width: 600,
      height: 600,
      phylloRadius: 7,
      pointRadius: 4
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
