import { getTemplateSrv } from '@grafana/runtime';
import { isDataQuery } from './app/utils';
import { QueryBodyContentType, QueryBodyType } from './types/query.types';
import type { InfinityQuery, VariableQuery } from './types';
import type { ScopedVars } from '@grafana/data';

const replaceVariable = (input: string, scopedVars: ScopedVars = {}, format = 'glob'): string => {
  return getTemplateSrv().replace(input || '', scopedVars, format);
};

export const interpolateQuery = (query: InfinityQuery, scopedVars: ScopedVars): InfinityQuery => {
  const newQuery: InfinityQuery = { ...query };
  if (isDataQuery(newQuery) || newQuery.type === 'uql' || newQuery.type === 'groq') {
    if (newQuery.source === 'url') {
      newQuery.url = replaceVariable(newQuery.url || '', scopedVars);
      newQuery.url_options = {
        ...newQuery.url_options,
        data: replaceVariable(newQuery.url_options?.data || '', scopedVars),
        body_type: replaceVariable(newQuery.url_options?.body_type || '', scopedVars) as QueryBodyType,
        body_content_type: replaceVariable(newQuery.url_options?.body_content_type || '', scopedVars) as QueryBodyContentType,
        body_graphql_query: replaceVariable(newQuery.url_options?.body_graphql_query || '', scopedVars),
        // body_graphql_variables: replaceVariable(newQuery.url_options?.body_graphql_variables || '', scopedVars),
        body_form: newQuery.url_options?.body_form?.map((f) => {
          return {
            ...f,
            value: getTemplateSrv().replace(f?.value || '', scopedVars, 'glob'),
          };
        }),
        params: newQuery.url_options?.params?.map((param) => {
          return {
            ...param,
            value: getTemplateSrv().replace(param?.value || '', scopedVars, 'glob'),
          };
        }),
        headers: newQuery.url_options?.headers?.map((header) => {
          return {
            ...header,
            value: getTemplateSrv().replace(header?.value || '', scopedVars, 'glob'),
          };
        }),
      };
    }
    if (newQuery.source === 'inline') {
      newQuery.data = replaceVariable(newQuery.data, scopedVars);
    }
    if (isDataQuery(newQuery)) {
      newQuery.filters = (newQuery.filters || []).map((filter) => {
        const value = (filter.value || []).map((val) => {
          return getTemplateSrv().replace(val || '', scopedVars, 'glob');
        });
        return { ...filter, value };
      });
    }
    if (
      newQuery.type === 'uql' ||
      ((newQuery.type === 'json' || newQuery.type === 'csv' || newQuery.type === 'tsv' || newQuery.type === 'graphql' || newQuery.type === 'xml') && newQuery.parser === 'uql')
    ) {
      newQuery.uql = replaceVariable(newQuery.uql || '', scopedVars);
    }
    if (newQuery.type === 'groq' || (newQuery.type === 'json' && newQuery.parser === 'groq')) {
      newQuery.groq = replaceVariable(newQuery.groq || '', scopedVars);
    }
  }
  return newQuery;
};

export const interpolateVariableQuery = (query: VariableQuery): VariableQuery => {
  switch (query.queryType) {
    case 'random':
      return {
        ...query,
        values: (query.values || []).map((v) => replaceVariable(v)),
      };
    default:
      return {
        ...query,
      };
  }
};
