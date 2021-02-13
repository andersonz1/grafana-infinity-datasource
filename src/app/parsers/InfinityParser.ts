import { uniq, flatten } from 'lodash';
import { filterResults } from './filter';
import {
  InfinityQuery,
  ScrapColumn,
  GrafanaTableRow,
  timeSeriesResult,
  ScrapColumnFormat,
  InfinityQueryFormat,
} from './../../types';

export class InfinityParser {
  target: InfinityQuery;
  rows: GrafanaTableRow[];
  series: timeSeriesResult[];
  StringColumns: ScrapColumn[];
  NumbersColumns: ScrapColumn[];
  TimeColumns: ScrapColumn[];
  constructor(target: InfinityQuery) {
    this.rows = [];
    this.series = [];
    this.target = target;
    this.StringColumns = target.columns.filter(t => t.type === ScrapColumnFormat.String);
    this.NumbersColumns = target.columns.filter(t => t.type === ScrapColumnFormat.Number);
    this.TimeColumns = target.columns.filter(
      t =>
        t.type === ScrapColumnFormat.Timestamp ||
        t.type === ScrapColumnFormat.Timestamp_Epoch ||
        t.type === ScrapColumnFormat.Timestamp_Epoch_Seconds
    );
  }
  toTable() {
    return {
      rows: this.rows.filter(row => row.length > 0),
      columns: this.target.columns,
    };
  }
  toTimeSeries() {
    const targets = uniq(this.series.map(s => s.target));
    return targets.map(t => {
      return {
        target: t,
        datapoints: flatten(this.series.filter(s => s.target === t).map(s => s.datapoints)),
      };
    });
  }
  getResults() {
    if (this.target.filters && this.target.filters.length > 0) {
      this.rows = filterResults(this.rows, this.target.columns, this.target.filters);
    }
    if (this.target.format === InfinityQueryFormat.TimeSeries) {
      return this.toTimeSeries();
    } else {
      return this.toTable();
    }
  }
}
