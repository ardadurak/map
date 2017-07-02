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

  @Input() selectedLayout: MultiSeriesLineChartLayout;

  public multiSeriesLineChartLayouts: MultiSeriesLineChartLayout[] = [
  ];

  ngOnInit() {
    if (this.selectedLayout === undefined) {
      this.selectedLayout = this.multiSeriesLineChartLayouts[0];
    }
  }

  public onActiveButtonChange(layout: MultiSeriesLineChartLayout): void {
    this.selectedLayout = layout;
  }


}
