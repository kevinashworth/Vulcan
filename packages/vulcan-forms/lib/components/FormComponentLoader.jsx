import React from 'react';
import { Components, registerComponent, expandQueryFragments } from 'meteor/vulcan:core';
import { useQuery } from '@apollo/client';
import gql from 'graphql-tag';
import isEmpty from 'lodash/isEmpty';

const FormComponentLoader = props => {
  const { query, children, options, value, queryWaitsForValue } = props;
  let loading = false,
    error,
    data;

  // if query is a function, execute it
  const queryText = typeof query === 'function' ? query({ value }) : query;

  if (queryText) {
    // if queryText exists or query function returned something, execute query
    // use field's `query` property to load field-specific data
    // pass current field value as variable to the query just in case
    const formComponentQuery = gql(expandQueryFragments(queryText));
    const queryResult = useQuery(formComponentQuery, {
      skip: queryWaitsForValue && valueIsEmpty,
      variables: { value }
    });
    loading = queryResult.loading;
    error = queryResult.error;
    data = queryResult.data;
    if (error) {
      throw new Error(error);
    }
  }

  if (loading){
    return (
      <div className="form-component-loader">
        <Components.Loading />
      </div>
    );
  }

  // pass newly loaded data (and options if needed) to child component
  const extraProps = { data, queryData: data, queryError: error, loading };
  if (typeof options === 'function') {
    extraProps.optionsFunction = options;
    extraProps.options = options.call({}, { ...props, data });
  }

  const fci = React.cloneElement(children, extraProps);

  return <div className="form-component-loader">{fci}</div>;
};

FormComponentLoader.propTypes = {};
registerComponent({
  name: 'FormComponentLoader',
  component: FormComponentLoader,
});
