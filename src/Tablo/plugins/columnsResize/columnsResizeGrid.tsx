import * as React from 'react';
import * as cx from 'classnames';
import Column, { defaultColumns, updateColumns } from '../../Column';
import { TabloProps, TabloDefaultedIntrinsicProps } from '../../Tablo';
import { UpdateColumnsProps } from '../../Column/columnUtility';
import { getArrayChildren } from "../../utils";

const addSizeProps = <T, K extends keyof T>({ col }: UpdateColumnsProps<T, K>) => ( //eslint-disable-line
  <Column
    isResizable
    {...col.props}
  />
);

const getLocals = <T, K extends keyof T>({ onColumnResize, ...props }: TabloProps<T, K>): TabloDefaultedIntrinsicProps<T, K> | TabloProps<T, K> => {

  // if `onColumnResize` is missing bypass this plugin
  if (!onColumnResize) {
    return props;
  }

  const { className, children, ...gridProps } = props;

  const onColumnResizeEndCallback = (width: number, key: K) => {
    onColumnResize({ width, key });
  };

  const _children = getArrayChildren(children) || defaultColumns(gridProps.data);

  const __children = updateColumns(_children, addSizeProps);

  return {
    className: cx('columns-resize', className),
    onColumnResizeEndCallback,
    isColumnResizing: false,
    children: __children,
    ...gridProps
  };

};

export default <T, K extends keyof T>(Grid: React.ComponentClass<TabloProps<T, K>>): React.ComponentClass<TabloProps<T, K>> => {

  return class ColumnResizeGrid extends React.PureComponent<TabloProps<T, K>> {

    render() {
      return <Grid {...getLocals(this.props)} />;
    }

  }

};
