import React from 'react';
import ReactDOM from 'react-dom';
import { pure, skinnable, props, t } from '../../../utils';
import cx from 'classnames';
import FlexView from 'react-flexview';
import ResizeSensor from '../../../resize-sensor/ResizeSensor';

const { maybe } = t;

export default (Grid) =>

  @props({
    className: maybe(t.String),
    autosize: maybe(t.Boolean)
  }, { strict: false })
  @pure
  @skinnable()
  class AutosizeGrid extends React.Component {

    state = {}

    static defaultProps = {
      autosize: true
    }

    updateSize = () => {
      const wrapper = ReactDOM.findDOMNode(this.refs.gridWrapper);
      const { clientHeight: height, clientWidth: width } = wrapper;
      this.setState({ width, height });
    }

    componentDidMount() {
      if (this.props.autosize) {
        this.updateSize();
      }
    }

    getLocals({ autosize, className, ...tableProps }) {

      const { width = 0, height = 0 } = autosize ? this.state : {};

      return {
        width,
        height,
        autosize,
        className: cx('autosize-tablo', className),
        ...tableProps
      };
    }

    template({ autosize, ...tableProps }) {

      const content = (
        <FlexView grow column width='100%' ref='gridWrapper'>
          <Grid {...tableProps} />
        </FlexView>
      );

      return autosize ? (
        <ResizeSensor onResize={this.updateSize}>
          {content}
        </ResizeSensor>
      ) : content;
    }
  };
