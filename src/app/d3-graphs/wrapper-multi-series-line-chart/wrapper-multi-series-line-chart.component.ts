import { Component, Input, OnInit } from '@angular/core';

export interface MultiSeriesLineChartLayout {
  name: string;
  label: string;
}

@Component({
  selector: 'app-wrapper-multi-series-line-chart',
  templateUrl: './wrapper-multi-series-line-chart.component.html',
  styleUrls: ['./wrapper-multi-series-line-chart.component.css']
})
export class WrapperMultiSeriesLineChartComponent implements OnInit {

  @Input() graphAttribute: string;

  public multiSeriesLineChartLayouts: MultiSeriesLineChartLayout[] = [
  ];

  ngOnInit() {
    this.graphAttribute = this.graphAttribute || 'change';
  }

  public onActiveButtonChange(layout: MultiSeriesLineChartLayout): void {
  }


}
