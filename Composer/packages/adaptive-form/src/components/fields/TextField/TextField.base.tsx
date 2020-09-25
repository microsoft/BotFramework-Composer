// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { IProcessedStyleSet } from '@uifabric/merge-styles/lib/IStyleSet';
import { Label, ILabelStyleProps, ILabelStyles } from 'office-ui-fabric-react/lib/Label';
import {
  Async,
  DelayedRender,
  IStyleFunctionOrObject,
  classNamesFunction,
  getId,
  getNativeProps,
  initializeComponentRef,
  inputProperties,
  isControlled,
  textAreaProperties,
  warn,
  warnControlledUsage,
  warnMutuallyExclusive,
} from '@uifabric/utilities';
import {
  ITextField,
  ITextFieldProps,
  ITextFieldStyleProps,
  ITextFieldStyles,
} from 'office-ui-fabric-react/lib/TextField';
import debounce from 'lodash/debounce';

const getClassNames = classNamesFunction<ITextFieldStyleProps, ITextFieldStyles>();

/** @internal */
export interface ITextFieldState {
  /** Is true when the control has focus. */
  isFocused?: boolean;

  /**
   * Dynamic error message returned by `onGetErrorMessage`.
   * Use `this._errorMessage` to get the actual current error message.
   */
  errorMessage: string | JSX.Element;
}

/** @internal */
export interface ITextFieldSnapshot {
  /**
   * If set, the text field is changing between single- and multi-line, so we'll need to reset
   * selection/cursor after the change completes.
   */
  selection?: [number | null, number | null];
}

const DEFAULT_STATE_VALUE = '';
const COMPONENT_NAME = 'TextField';

export class TextFieldBase extends React.Component<ITextFieldProps, ITextFieldState, ITextFieldSnapshot>
  implements ITextField {
  public static defaultProps: ITextFieldProps = {
    resizable: true,
    deferredValidationTime: 200,
    validateOnLoad: true,
  };

  /** Fallback ID if none is provided in props. Access proper value via `this.componentId`. */
  private _fallbackId: string;
  private _descriptionId: string;
  private _labelId: string;
  private _delayedValidate: (value: string | undefined) => void;
  private _lastValidation: number;
  private _latestValidateValue: string | undefined;
  private _hasWarnedNullValue: boolean | undefined;
  private _textElement = React.createRef<HTMLTextAreaElement | HTMLInputElement>();
  private _async: Async;
  /** Most recent value from a change or input event, to help avoid processing events twice */
  private _lastChangeValue: string | undefined;

  private _syncData;

  public constructor(props: ITextFieldProps) {
    super(props);

    initializeComponentRef(this);
    this._async = new Async(this);

    if (process.env.NODE_ENV !== 'production') {
      warnMutuallyExclusive(COMPONENT_NAME, props, {
        errorMessage: 'onGetErrorMessage',
      });
    }

    this._fallbackId = getId(COMPONENT_NAME);
    this._descriptionId = getId(COMPONENT_NAME + 'Description');
    this._labelId = getId(COMPONENT_NAME + 'Label');

    this._warnControlledUsage();

    let { defaultValue = DEFAULT_STATE_VALUE } = props;
    if (typeof defaultValue === 'number') {
      // This isn't allowed per the props, but happens anyway.
      defaultValue = String(defaultValue);
    }
    this.state = {
      isFocused: false,
      errorMessage: '',
    };

    /*-----updated by composer-----*/
    // this is only use to sync the data from the other data source
    // we want to use uncontrolled feature but we still need to sync data.
    this._delayedValidate = this._async.debounce(this._validate, this.props.deferredValidationTime);
    this._lastValidation = 0;

    this._syncData = debounce((defaultValue: string | undefined) => {
      if (this._textElement.current && defaultValue !== undefined && defaultValue !== this._textElement.current.value) {
        this._textElement.current.value = defaultValue;
      }
    }, 300);
    /*-----updated by composer-----*/
  }

  /**
   * Gets the current value of the text field.
   */
  public get value(): string | undefined {
    return getValue(this.props);
  }

  public componentDidMount(): void {
    this._adjustInputHeight();

    if (this.props.validateOnLoad) {
      this._validate(this.value);
    }
  }

  public componentWillUnmount() {
    this._async.dispose();
  }

  public getSnapshotBeforeUpdate(prevProps: ITextFieldProps, prevState: ITextFieldState): ITextFieldSnapshot | null {
    return {
      selection: [this.selectionStart, this.selectionEnd],
    };
  }

  public componentDidUpdate(
    prevProps: ITextFieldProps,
    prevState: ITextFieldState,
    snapshot: ITextFieldSnapshot
  ): void {
    const props = this.props;
    const { selection = [null, null] } = snapshot || {};
    const [start, end] = selection;

    if (!!prevProps.multiline !== !!props.multiline && prevState.isFocused) {
      // The text field has just changed between single- and multi-line, so we need to reset focus
      // and selection/cursor.
      this.focus();
      if (start !== null && end !== null && start >= 0 && end >= 0) {
        this.setSelectionRange(start, end);
      }
    }

    !this.isComponentControlled && this._syncData(this.props.defaultValue);
    const prevValue = getValue(prevProps);
    const value = this.value;
    if (prevValue !== value) {
      // Handle controlled/uncontrolled warnings and status
      this._warnControlledUsage(prevProps);

      // Clear error message if needed
      // TODO: is there any way to do this without an extra render?
      if (this.state.errorMessage && !props.errorMessage) {
        this.setState({ errorMessage: '' });
      }

      // Adjust height if needed based on new value
      this._adjustInputHeight();

      // Reset the record of the last value seen by a change/input event
      this._lastChangeValue = undefined;

      // TODO: #5875 added logic to trigger validation in componentWillReceiveProps and other places.
      // This seems a bit odd and hard to integrate with the new approach.
      // (Starting to think we should just put the validation logic in a separate wrapper component...?)
      if (shouldValidateAllChanges(props)) {
        this._delayedValidate(value);
      }
    }
  }

  public render(): JSX.Element {
    const {
      iconProps,
      multiline,
      prefix,
      suffix,
      onRenderPrefix = this._onRenderPrefix,
      onRenderSuffix = this._onRenderSuffix,
      onRenderLabel = this._onRenderLabel,
      onRenderDescription = this._onRenderDescription,
    } = this.props;
    const errorMessage = this.errorComponentMessage;

    const classNames = this.componentClassNames;

    return (
      <div className={classNames.root}>
        <div className={classNames.wrapper}>
          {onRenderLabel(this.props, this._onRenderLabel)}
          <div className={classNames.fieldGroup}>
            {(prefix !== undefined || this.props.onRenderPrefix) && (
              <div className={classNames.prefix}>{onRenderPrefix(this.props, this._onRenderPrefix)}</div>
            )}
            {multiline ? this._renderTextArea() : this._renderInput()}
            {iconProps && <Icon className={classNames.icon} {...iconProps} />}
            {(suffix !== undefined || this.props.onRenderSuffix) && (
              <div className={classNames.suffix}>{onRenderSuffix(this.props, this._onRenderSuffix)}</div>
            )}
          </div>
        </div>
        {this.isDescriptionAvailable && (
          <span id={this._descriptionId}>
            {onRenderDescription(this.props, this._onRenderDescription)}
            {errorMessage && (
              <div role="alert">
                <DelayedRender>
                  <p className={classNames.errorMessage}>
                    <span data-automation-id="error-message">{errorMessage}</span>
                  </p>
                </DelayedRender>
              </div>
            )}
          </span>
        )}
      </div>
    );
  }

  /**
   * Sets focus on the text field
   */
  public focus() {
    if (this._textElement.current) {
      this._textElement.current.focus();
    }
  }

  /**
   * Blurs the text field.
   */
  public blur() {
    if (this._textElement.current) {
      this._textElement.current.blur();
    }
  }

  /**
   * Selects the text field
   */
  public select() {
    if (this._textElement.current) {
      this._textElement.current.select();
    }
  }

  /**
   * Sets the selection start of the text field to a specified value
   */
  public setSelectionStart(value: number): void {
    if (this._textElement.current) {
      this._textElement.current.selectionStart = value;
    }
  }

  /**
   * Sets the selection end of the text field to a specified value
   */
  public setSelectionEnd(value: number): void {
    if (this._textElement.current) {
      this._textElement.current.selectionEnd = value;
    }
  }

  /**
   * Gets the selection start of the text field
   */
  public get selectionStart(): number | null {
    return this._textElement.current ? this._textElement.current.selectionStart : -1;
  }

  /**
   * Gets the selection end of the text field
   */
  public get selectionEnd(): number | null {
    return this._textElement.current ? this._textElement.current.selectionEnd : -1;
  }

  /**
   * Sets the start and end positions of a selection in a text field.
   * @param start - Index of the start of the selection.
   * @param end - Index of the end of the selection.
   */
  public setSelectionRange(start: number, end: number): void {
    if (this._textElement.current) {
      (this._textElement.current as HTMLInputElement).setSelectionRange(start, end);
    }
  }

  private _warnControlledUsage = (prevProps?: ITextFieldProps): void => {
    // Show warnings if props are being used in an invalid way
    warnControlledUsage({
      componentId: this.componentId,
      componentName: COMPONENT_NAME,
      props: this.props,
      oldProps: prevProps,
      valueProp: 'value',
      defaultValueProp: 'defaultValue',
      onChangeProp: 'onChange',
      readOnlyProp: 'readOnly',
    });

    if (this.props.value === null && !this._hasWarnedNullValue) {
      this._hasWarnedNullValue = true;
      warn(
        `Warning: 'value' prop on '${COMPONENT_NAME}' should not be null. Consider using an ` +
          'empty string to clear the component or undefined to indicate an uncontrolled component.'
      );
    }
  };

  /** Returns `props.id` if available, or a fallback if not. */
  private get componentId(): string {
    return this.props.id || this._fallbackId;
  }

  private get isComponentControlled(): boolean {
    return isControlled(this.props, 'value');
  }

  private _onFocus = (ev: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    if (this.props.onFocus) {
      this.props.onFocus(ev);
    }

    this.setState({ isFocused: true }, () => {
      if (this.props.validateOnFocusIn) {
        this._validate(this.value);
      }
    });
  };

  private _onBlur = (ev: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    if (this.props.onBlur) {
      this.props.onBlur(ev);
    }

    this.setState({ isFocused: false }, () => {
      if (this.props.validateOnFocusOut) {
        this._validate(this.value);
      }
    });
  };

  private _onRenderLabel = (props: ITextFieldProps, rest: any): JSX.Element | null => {
    const { label, required } = props;
    // IProcessedStyleSet definition requires casting for what Label expects as its styles prop
    const labelStyles = this.componentClassNames.subComponentStyles
      ? (this.componentClassNames.subComponentStyles.label as IStyleFunctionOrObject<ILabelStyleProps, ILabelStyles>)
      : undefined;

    if (label) {
      return (
        <Label
          disabled={props.disabled}
          htmlFor={this.componentId}
          id={this._labelId}
          required={required}
          styles={labelStyles}
        >
          {props.label}
        </Label>
      );
    }
    return null;
  };

  private _onRenderDescription = (props: ITextFieldProps, rest: any): JSX.Element | null => {
    if (props.description) {
      return <span className={this.componentClassNames.description}>{props.description}</span>;
    }
    return null;
  };

  private _onRenderPrefix = (props: ITextFieldProps, rest: any): JSX.Element => {
    const { prefix } = props;
    return <span style={{ paddingBottom: '1px' }}>{prefix}</span>;
  };

  private _onRenderSuffix = (props: ITextFieldProps, rest: any): JSX.Element => {
    const { suffix } = props;
    return <span style={{ paddingBottom: '1px' }}>{suffix}</span>;
  };

  /**
   * Current error message from either `props.errorMessage` or the result of `props.onGetErrorMessage`.
   *
   * - If there is no validation error or we have not validated the input value, errorMessage is an empty string.
   * - If we have done the validation and there is validation error, errorMessage is the validation error message.
   */
  private get errorComponentMessage(): string | JSX.Element {
    const { errorMessage = this.state.errorMessage } = this.props;
    return errorMessage || '';
  }

  /**
   * If a custom description render function is supplied then treat description as always available.
   * Otherwise defer to the presence of description or error message text.
   */
  private get isDescriptionAvailable(): boolean {
    const props = this.props;
    return !!(props.onRenderDescription || props.description || this.errorComponentMessage);
  }

  private get componentClassNames(): IProcessedStyleSet<ITextFieldStyles> {
    const {
      borderless,
      className,
      disabled,
      iconProps,
      inputClassName,
      label,
      multiline,
      required,
      underlined,
      resizable,
      theme,
      styles,
      autoAdjustHeight,
    } = this.props;
    const { isFocused } = this.state;
    const errorMessage = this.errorComponentMessage;

    return getClassNames(styles!, {
      theme: theme!,
      className,
      disabled,
      focused: isFocused,
      required,
      multiline,
      hasLabel: !!label,
      hasErrorMessage: !!errorMessage,
      borderless,
      resizable,
      hasIcon: !!iconProps,
      underlined,
      inputClassName,
      autoAdjustHeight,
    });
  }

  private _renderTextArea = (): React.ReactElement<React.HTMLAttributes<HTMLAreaElement>> => {
    const textAreaProps = getNativeProps<React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
      this.props,
      textAreaProperties,
      ['value']
    );

    const ariaLabelledBy = this.props['aria-labelledby'] || (this.props.label ? this._labelId : undefined);
    /*-----added by composer-----*/
    // use the default value to replace the state value
    const valueProps = this.isComponentControlled ? { value: this.props.value } : {};
    /*-----added by composer-----*/
    return (
      <textarea
        id={this.componentId}
        {...textAreaProps}
        {...valueProps}
        ref={this._textElement as React.RefObject<HTMLTextAreaElement>}
        aria-describedby={this.isDescriptionAvailable ? this._descriptionId : this.props['aria-describedby']}
        aria-invalid={!!this.errorComponentMessage}
        aria-label={this.props.ariaLabel}
        aria-labelledby={ariaLabelledBy}
        className={this.componentClassNames.field}
        readOnly={this.props.readOnly}
        onBlur={this._onBlur}
        onChange={this._onInputChange}
        onFocus={this._onFocus}
        onInput={this._onInputChange}
      />
    );
  };

  private _renderInput = (): React.ReactElement<React.HTMLAttributes<HTMLInputElement>> => {
    const inputProps = getNativeProps<React.HTMLAttributes<HTMLInputElement>>(this.props, inputProperties, ['value']);
    const ariaLabelledBy = this.props['aria-labelledby'] || (this.props.label ? this._labelId : undefined);
    /*-----added by composer-----*/
    // use the default value to replace the state value
    const valueProps = this.isComponentControlled ? { value: this.props.value } : {};
    /*-----added by composer-----*/
    return (
      <input
        aria-labelledby={ariaLabelledBy}
        defaultValue={this.props.defaultValue ?? ''}
        id={this.componentId}
        type={'text'}
        {...inputProps}
        /*-----added by composer-----*/
        {...valueProps}
        /*-----added by composer-----*/
        ref={this._textElement as React.RefObject<HTMLInputElement>}
        aria-describedby={this.isDescriptionAvailable ? this._descriptionId : this.props['aria-describedby']}
        aria-invalid={!!this.errorComponentMessage}
        aria-label={this.props.ariaLabel}
        className={this.componentClassNames.field}
        readOnly={this.props.readOnly}
        onBlur={this._onBlur}
        onChange={this._onInputChange}
        onFocus={this._onFocus}
        onInput={this._onInputChange}
      />
    );
  };

  private _onInputChange = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    // Previously, we needed to call both onInput and onChange due to some weird IE/React issues,
    // which have *probably* been fixed now:
    // - https://github.com/microsoft/fluentui/issues/744 (likely fixed)
    // - https://github.com/microsoft/fluentui/issues/824 (confirmed fixed)

    // TODO (Fabric 8?) - Switch to calling only onChange. This switch is pretty disruptive for
    // tests (ours and maybe consumers' too), so it seemed best to do the switch in a major bump.

    const element = event.target as HTMLInputElement;
    const value = element.value;
    // Ignore this event if the value is undefined (in case one of the IE bugs comes back)
    if (value === undefined || value === this._lastChangeValue) {
      return;
    }
    this._lastChangeValue = value;

    // This is so developers can access the event properties in asynchronous callbacks
    // https://reactjs.org/docs/events.html#event-pooling
    event.persist();

    /*-----updated by composer-----*/
    if (this.isComponentControlled && this.props.value === value) {
      // Avoid doing unnecessary work when the value has not changed.
      return;
    }

    const { onChange } = this.props;
    if (onChange) {
      onChange(event, value);
    }
    /*-----updated by composer-----*/
  };

  private _validate = (value: string | undefined): void => {
    // In case _validate is called again while validation promise is executing
    if (this._latestValidateValue === value && shouldValidateAllChanges(this.props)) {
      return;
    }

    this._latestValidateValue = value;
    const onGetErrorMessage = this.props.onGetErrorMessage;
    const result = onGetErrorMessage && onGetErrorMessage(value || '');

    if (result !== undefined) {
      if (typeof result === 'string' || !('then' in result)) {
        this.setState({ errorMessage: result });
        this._notifyAfterValidate(value, result);
      } else {
        const currentValidation: number = ++this._lastValidation;

        result.then((errorMessage: string | JSX.Element) => {
          if (currentValidation === this._lastValidation) {
            this.setState({ errorMessage });
          }
          this._notifyAfterValidate(value, errorMessage);
        });
      }
    } else {
      this._notifyAfterValidate(value, '');
    }
  };

  private _notifyAfterValidate = (value: string | undefined, errorMessage: string | JSX.Element): void => {
    if (value === this.value && this.props.onNotifyValidationResult) {
      this.props.onNotifyValidationResult(errorMessage, value);
    }
  };

  private _adjustInputHeight = (): void => {
    if (this._textElement.current && this.props.autoAdjustHeight && this.props.multiline) {
      const textField = this._textElement.current;
      textField.style.height = '';
      textField.style.height = textField.scrollHeight + 'px';
    }
  };
}

/** Get the value from the given state and props (converting from number to string if needed) */
function getValue(props: ITextFieldProps): string | undefined {
  const { value } = props;
  if (typeof value === 'number') {
    // not allowed per typings, but happens anyway
    return String(value);
  }
  return value;
}

/**
 * If `validateOnFocusIn` or `validateOnFocusOut` is true, validation should run **only** on that event.
 * Otherwise, validation should run on every change.
 */
function shouldValidateAllChanges(props: ITextFieldProps): boolean {
  return !(props.validateOnFocusIn || props.validateOnFocusOut);
}
