import { Component, Input, OnInit } from '@angular/core';
import {IMyDpOptions, IMyDateModel} from 'mydatepicker';

@Component({
  selector: 'app-wrapper-datamap',
  templateUrl: './wrapper-datamap.component.html',
  styleUrls: ['./wrapper-datamap.component.css']
})

export class WrapperDatamapComponent implements OnInit {

  @Input() startDate: Date;
  @Input() endDate: Date;

  private myDatePickerOptions: IMyDpOptions = {
      // other options...
      dateFormat: 'dd/mm/yyyy',
      disableUntil: {year: 2016, month: 6, day: 26},
      disableSince: {year: 2017, month: 6, day: 27},
      disableWeekends: true
  };
  
  ngOnInit() {
    this.startDate = new Date('2016/06/27');
    this.endDate = new Date('2017/06/27');
  }

  public startDateChanged(event: IMyDateModel) {
    this.startDate = new Date(event.jsdate);
  }
  public endDateChanged(event: IMyDateModel) {
    this.endDate = new Date(event.jsdate);
  }
}
