import { Modal, Button, Select } from '@grafana/ui';
import React, { useState } from 'react';
import { EditorRow } from './../../components/extended/EditorRow';
import { EditorField } from './../../components/extended/EditorField';
import { filterOperators } from './../../app/parsers/filter';
import { isDataQuery } from './../../app/utils';
import { FilterOperator } from './../../constants';
import type { InfinityFilter, InfinityQuery } from './../../types';
import type { SelectableValue } from '@grafana/data/types';

export const TableFilter = (props: { query: InfinityQuery; onChange: (value: any) => void; onRunQuery: any }) => {
  const [popupOpenStatus, setPopupOpenStatus] = useState(false);
  const { query, onChange, onRunQuery } = props;
  if (!isDataQuery(query)) {
    return <></>;
  }
  const getFields = () => {
    return query.columns.map((col) => {
      return {
        label: col.text || col.selector,
        value: col.text || col.selector,
      };
    });
  };
  const addFilter = () => {
    let filters = [...(query.filters || [])];
    let newFilter: InfinityFilter = {
      field: query.columns && query.columns.length > 0 ? query.columns[0].text : '',
      operator: FilterOperator.Equals,
      value: [''],
    };
    filters.push(newFilter);
    onChange({ ...query, filters });
  };
  const removeFilter = (index: number) => {
    const filters = [...(query.filters || [])];
    filters.splice(index, 1);
    onChange({ ...query, filters });
  };
  const onFilterFieldChange = (index: number, value: SelectableValue) => {
    const filters = [...(query.filters || [])];
    filters[index].field = value.value;
    onChange({ ...query, filters });
  };
  const onFilterOperatorChange = (index: number, value: SelectableValue) => {
    query.filters = query.filters || [];
    query.filters[index].operator = value.value;
    onChange(query);
  };
  const onFilterValueChange = (index: number, valueIndex: number, value: string) => {
    query.filters = query.filters || [];
    query.filters[index].value[valueIndex] = value;
    onChange(query);
  };
  const closePopup = () => {
    setPopupOpenStatus(false);
    onRunQuery();
  };
  return (
    <EditorRow>
      <EditorField label={`Results Filter ${query.filters && query.filters.length > 0 ? `( ${query.filters.length} )` : ''}`}>
        <>
          <div style={{ paddingBlockStart: '4px' }}>
            <Button icon="filter" size="sm" variant="secondary" onClick={() => setPopupOpenStatus(true)}>
              Configure Filter
            </Button>
          </div>
          <Modal title={'Result Filters'} isOpen={popupOpenStatus} onDismiss={() => setPopupOpenStatus(false)}>
            {query.filters && query.filters.length > 0 ? (
              <>
                {query.filters.map((filter, index) => (
                  <div className="gf-form-inline" key={index}>
                    <label className="gf-form-label width-6">Filter {index + 1}</label>
                    <Select
                      className="width-8"
                      options={getFields()}
                      defaultValue={getFields()[0]}
                      value={getFields().find((f) => f.value === filter.field) || getFields()[0]}
                      onChange={(e) => onFilterFieldChange(index, e)}
                      menuShouldPortal={true}
                    ></Select>
                    <Select
                      className="width-8"
                      options={filterOperators}
                      defaultValue={filterOperators[0]}
                      value={filterOperators.find((f) => f.value === filter.operator) || filterOperators[0]}
                      onChange={(e) => onFilterOperatorChange(index, e)}
                      menuShouldPortal={true}
                    ></Select>
                    <input
                      type="text"
                      className="gf-form-input min-width-10 width-10"
                      value={filter.value[0]}
                      onChange={(e) => onFilterValueChange(index, 0, e.target.value)}
                      placeholder="Value"
                    ></input>
                    <span className="btn btn-success btn-small" style={{ margin: '5px' }} onClick={addFilter}>
                      +
                    </span>
                    <span
                      className="btn btn-danger btn-small"
                      style={{ margin: '5px' }}
                      onClick={() => {
                        removeFilter(index);
                      }}
                    >
                      x
                    </span>
                    <br />
                  </div>
                ))}
              </>
            ) : (
              <>
                <div className="gf-form-inline">
                  <div className="gf-form">
                    <label className="gf-form-label width-6">Filter</label>
                    <label className="gf-form-label query-keyword width-20" onClick={() => addFilter()}>
                      Click to add filter
                    </label>
                  </div>
                </div>
              </>
            )}
            <span className="btn btn-success btn-medium" style={{ marginTop: '5px', marginRight: '10px' }} onClick={closePopup}>
              OK
            </span>
            <span className="btn btn-primary btn-medium" style={{ marginTop: '5px', marginRight: '10px' }} onClick={addFilter}>
              Add filter
            </span>
            <br />
            <br />
            <br />
            <br />
          </Modal>
        </>
      </EditorField>
    </EditorRow>
  );
};
