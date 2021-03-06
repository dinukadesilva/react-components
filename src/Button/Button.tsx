import * as React from 'react';
import * as cx from 'classnames';
import every = require('lodash/every');
import { props, t, stateClassUtil } from '../utils';
import { TextOverflow } from '../TextOverflow/TextOverflow';
import FlexView from 'react-flexview';
import { Icon } from '../Icon/Icon';
import { LoadingSpinner } from '../LoadingSpinner/LoadingSpinner';

export type ButtonRequiredProps = {
  /** callback */
  onClick: (e: React.SyntheticEvent<HTMLDivElement>) => void
  /** can be a String, or a dictionary { [buttonState]: String }, t.maybe(t.union([t.Str,  stringForButtonStates]) */
  label?: string | Button.ButtonStateMap
  /** otherwise just pass a string as children */
  children?: string
  /** type of the button (default, primary, positive, negative, flat) */
  type?: Button.ButtonType
  /** shortcut for type "flat" */
  flat?: boolean
  /** custom prefix for the Icon, if any */
  iconPrefix?: string
}

export type ButtonDefaultProps = {
  /** function to handle the overflow of too long labels, replacing with ellipsed string and tooltip */
  textOverflow: Button.TextOverflowCompatibleComponent;
  /** ready, not-allowed, processing, success, error; overrides `baseState`, use it if you want button to be a functional component */
  buttonState: Button.ButtonState;
  /** size of the button, one of 'tiny', 'small', 'medium' */
  size: Button.ButtonSize;
  /** fluid (block) button, takes the width of the container */
  fluid: boolean;
  /** shortcut for type "primary" */
  primary: boolean;
  /** circular button, this is allowed only if it's an icon button */
  circular: boolean;
  /** can be a String referring to an icon, or a dictionary { [buttonState]: String },t.maybe(t.union([t.Str, stringForButtonStates])) */
  icon: string | Button.ButtonStateMap;
  /** an optional class name to pass to first inner element of the component */
  className: string;
  /** an optional style object to pass to first inner element of the component */
  style: object
};

export namespace Button {
  export type TextOverflowCompatibleComponent = React.ComponentClass<TextOverflow.Props>;
  export type ButtonStateMap = { [key in Button.ButtonState]?: string };
  export type ButtonState = 'ready' | 'not-allowed' | 'processing' | 'error' | 'success';
  export type ButtonType = 'default' | 'primary' | 'positive' | 'negative' | 'flat';
  export type ButtonSize = 'tiny' | 'small' | 'medium';

  export type Props = ButtonRequiredProps & Partial<ButtonDefaultProps>;
}

type ButtonDefaultedProps = ButtonRequiredProps & ButtonDefaultProps;

// types
export const buttonStates: Button.ButtonState[] = ['ready', 'not-allowed', 'processing', 'error', 'success'];
const ButtonState = t.enums.of(buttonStates, 'ButtonState');
export const buttonTypes: Button.ButtonType[] = ['default', 'primary', 'positive', 'negative', 'flat'];
const ButtonType = t.enums.of(buttonTypes, 'ButtonType');
export const buttonSizes: Button.ButtonSize[] = ['tiny', 'small', 'medium'];
const ButtonSize = t.enums.of(buttonSizes, 'ButtonSize');

// util
const notBoth = (a: any, b: any): boolean => !(a && b);
const satisfyAll = (...conditions: Array<(props: Button.Props) => boolean>) => (props: ButtonRequiredProps) => every(conditions, c => c(props));

// invariants
const propsInvariants: Array<(props: Button.Props) => boolean> = [
  ({ label, icon, children }) => notBoth(label || icon, children), // notBothChildrenAndLabelOrIcon
  ({ primary, flat }) => notBoth(primary, flat), // notBothFlatAndPrimary
  ({ fluid, circular }) => notBoth(fluid, circular), // notBothFluidAndCircular
  ({ circular, icon, label }) => !circular || !!(icon && !label), // circularOnlyIfIconAndNotLabel
  ({ type, primary, flat }) => notBoth(type, flat || primary) // notBothTypeAndItsShortucts
];

export const ButtonPropTypes = {
  buttonState: t.maybe(ButtonState),
  onClick: t.Function,
  label: t.maybe(t.union([t.String, t.Object])),
  icon: t.maybe(t.union([t.String, t.Object])),
  iconPrefix: t.maybe(t.String),
  children: t.maybe(t.String),
  type: t.maybe(ButtonType),
  primary: t.maybe(t.Boolean),
  flat: t.maybe(t.Boolean),
  size: t.maybe(ButtonSize),
  fluid: t.maybe(t.Boolean),
  circular: t.maybe(t.Boolean),
  textOverflow: t.maybe(t.Function),
  style: t.maybe(t.Object),
  className: t.maybe(t.String)
};

export const Props = t.refinement(t.struct(ButtonPropTypes), satisfyAll(...propsInvariants), 'ButtonProps');

const defaultLabels = {
  success: 'success',
  error: 'error',
  processing: 'processing'
};

const defaultIcons = {
  success: 'validate',
  error: 'exclamation'
};

const makeProp = (x: any) => (t.String.is(x) ? { ready: x, 'not-allowed': x } : x); // todo check if this works with children

@props(Props)
export class Button extends React.PureComponent<Button.Props> {

  static defaultProps: ButtonDefaultProps = {
    textOverflow: TextOverflow,
    buttonState: 'ready',
    size: 'medium',
    fluid: false,
    primary: false,
    circular: false,
    icon: '',
    className: '',
    style: {}
  };

  templateLoading = () => (
    <FlexView className='button-loading' shrink={false} vAlignContent='center' hAlignContent='center'>
      <LoadingSpinner size='1em' overlayColor='transparent' />
    </FlexView>
  );

  templateIcon = (icon: string, iconPrefix?: string) => (
    <FlexView className='button-icon' shrink={false}>
      <Icon icon={icon} prefix={iconPrefix} />
    </FlexView>
  );

  // TODO: the popover props is not handled by TextOverflow
  templateLabel = (label: string, TextOverflow: Button.TextOverflowCompatibleComponent) => (
    <FlexView className='button-label' column shrink={false} vAlignContent='center' hAlignContent='center'>
      <TextOverflow label={label} popover={{ offsetY: -8 }} />
    </FlexView>
  );

  render() {

    const {
      buttonState,
      circular,
      className: _className,
      flat,
      fluid,
      icon: _icon,
      iconPrefix,
      label: _label, children,
      onClick,
      primary,
      size,
      style,
      textOverflow,
      type
    } = this.props as ButtonDefaultedProps;

    const labels = {
      ...defaultLabels,
      ...makeProp(_label || children)
    };

    const icons = {
      ...defaultIcons,
      ...makeProp(_icon)
    };

    const getButtonType = () => type || (primary && 'primary') || (flat && 'flat') || 'default';

    const wrapperStyle = {
      display: fluid ? 'block' : 'inline-block',
      width: fluid ? '100%' : null
    };

    const isIconButton = (): boolean => !!_icon && !_label;

    const className = cx(
      stateClassUtil([getButtonType()]),
      { 'icon-button': isIconButton() },
      { circular },
      stateClassUtil([size]),
      _className
    );

    const label = labels[buttonState];
    const icon = icons[buttonState];
    const loading = buttonState === 'processing';

    return (
      <div className='button' style={wrapperStyle}>
        <FlexView
          className={cx('button-inner', className, stateClassUtil([buttonState]))}
          vAlignContent='center'
          hAlignContent='center'
          onClick={buttonState === 'ready' ? onClick : () => {}}
          style={style}
        >
          {loading && this.templateLoading()}
          {icon && this.templateIcon(icon, iconPrefix)}
          {label && this.templateLabel(label, textOverflow)}
        </FlexView>
      </div>
    );
  }

}
