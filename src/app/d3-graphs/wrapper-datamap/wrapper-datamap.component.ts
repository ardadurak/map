import { Component, Input, OnInit } from '@angular/core';
import {IMyDpOptions, IMyDateModel} from 'mydatepicker';

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
  @Input() snapshotDate: Date;

  private myDatePickerOptions: IMyDpOptions = {
      // other options...
      dateFormat: 'dd/mm/yyyy',
  };
  
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
    this.snapshotDate = new Date('2017/06/27');
    if (this.selectedLayout === undefined) {
      this.selectedLayout = this.datamapLayouts[1];
    }
  }

  public onActiveButtonChange(layout: DatamapLayout): void {
    this.selectedLayout = layout;
    alert("yis");
  }

  onDateChanged(event: IMyDateModel) {
    this.snapshotDate = new Date(event.jsdate);
  }
}
