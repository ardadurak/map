import { Component, Input, OnInit } from '@angular/core';
import {IMyDpOptions, IMyDateModel} from 'mydatepicker';

@Component({
  selector: 'app-wrapper-datamap',
  templateUrl: './wrapper-datamap.component.html',
  styleUrls: ['./wrapper-datamap.component.css']
})

export class WrapperDatamapComponent implements OnInit {

  @Input() snapshotDate: Date;

  private myDatePickerOptions: IMyDpOptions = {
      // other options...
      dateFormat: 'dd/mm/yyyy',
      disableUntil: {year: 2016, month: 6, day: 26},
      disableSince: {year: 2017, month: 6, day: 27},
      disableWeekends: true
  };
  
  ngOnInit() {
    this.snapshotDate = new Date('2017/06/27');
  }

  public onDateChanged(event: IMyDateModel) {
    this.snapshotDate = new Date(event.jsdate);
  }
}
