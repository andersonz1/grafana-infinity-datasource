import type { SelectableValue } from '@grafana/data';
import type { InfinityQuery, InfinityQueryType, InfinityQueryFormat, InfinityColumnFormat, ScrapQuerySources, VariableQueryType } from './types';

export const DefaultInfinityQuery: InfinityQuery = {
  refId: '',
  type: 'json',
  source: 'url',
  format: 'table',
  url: 'https://jsonplaceholder.typicode.com/users',
  url_options: { method: 'GET', data: '' },
  root_selector: '',
  columns: [],
  filters: [],
};

export const SCRAP_QUERY_TYPES: Array<SelectableValue<InfinityQueryType>> = [
  { label: 'UQL', value: 'uql' },
  { label: 'JSON', value: 'json' },
  { label: 'CSV', value: 'csv' },
  { label: 'TSV', value: 'tsv' },
  { label: 'GraphQL', value: 'graphql' },
  { label: 'XML', value: 'xml' },
  { label: 'HTML', value: 'html' },
  { label: 'Series', value: 'series' },
  { label: 'Global Query', value: 'global' },
  { label: 'GROQ', value: 'groq' },
];
export const INFINITY_RESULT_FORMATS: Array<SelectableValue<InfinityQueryFormat>> = [
  { label: 'Data Frame', value: 'dataframe' },
  { label: 'Table', value: 'table' },
  { label: 'Time Series', value: 'timeseries' },
  { label: 'Nodes - Node Graph', value: 'node-graph-nodes' },
  { label: 'Edges - Node Graph', value: 'node-graph-edges' },
  { label: 'As Is', value: 'as-is' },
];
export const INFINITY_SOURCES: ScrapQuerySources[] = [
  { label: 'URL', value: 'url', supported_types: ['csv', 'tsv', 'json', 'html', 'xml', 'graphql', 'uql', 'groq'] },
  { label: 'Inline', value: 'inline', supported_types: ['csv', 'tsv', 'json', 'xml', 'uql', 'groq'] },
  { label: 'Random Walk', value: 'random-walk', supported_types: ['series'] },
  { label: 'Expression', value: 'expression', supported_types: ['series'] },
];
export const INFINITY_COLUMN_FORMATS: Array<SelectableValue<InfinityColumnFormat>> = [
  { label: 'String', value: 'string' },
  { label: 'Number', value: 'number' },
  { label: 'Timestamp', value: 'timestamp' },
  { label: 'Timestamp ( UNIX ms )', value: 'timestamp_epoch' },
  { label: 'Timestamp ( UNIX s )', value: 'timestamp_epoch_s' },
];

export const variableQueryTypes: Array<SelectableValue<VariableQueryType>> = [
  {
    label: 'Infinity',
    value: 'infinity',
  },
  {
    label: 'Legacy',
    value: 'legacy',
  },
  {
    label: 'Random String',
    value: 'random',
  },
];

export const IGNORE_URL = '__IGNORE_URL__';
export enum FilterOperator {
  Contains = 'contains',
  ContainsIgnoreCase = 'contains_ignorecase',
  EndsWith = 'endswith',
  EndsWithIgnoreCase = 'endswith_ignorecase',
  Equals = 'equals',
  EqualsIgnoreCase = 'equals_ignorecase',
  NotContains = 'notcontains',
  NotContainsIgnoreCase = 'notcontains_ignorecase',
  NotEquals = 'notequals',
  NotEqualsIgnoreCase = 'notequals_ignorecase',
  StartsWith = 'starswith',
  StartsWithIgnoreCase = 'starswith_ignorecase',
  RegexMatch = 'regex',
  RegexNotMatch = 'regex_not',
  In = 'in',
  NotIn = 'notin',
  NumberEquals = '==',
  NumberNotEquals = '!=',
  NumberLessThan = '<',
  NumberLessThanOrEqualTo = '<=',
  NumberGreaterThan = '>',
  NumberGreaterThanOrEqualTo = '>=',
}
