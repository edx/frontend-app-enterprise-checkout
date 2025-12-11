import { useIntl } from '@edx/frontend-platform/i18n';
import { Form } from '@openedx/paragon';
import { CheckCircle, Error as ErrorIcon } from '@openedx/paragon/icons';
import classNames from 'classnames';
import React, {
  forwardRef,
  ReactNode,
  useCallback,
  useImperativeHandle,
  useRef,
} from 'react';

import {
  useCheckoutFormStore,
  useCurrentStep,
} from '@/hooks/index';

import type {
  FieldValues,
  Path,
  RegisterOptions,
  UseFormReturn,
} from 'react-hook-form';

interface FieldChildrenProps {
  isValid: boolean;
  isInvalid: boolean;
  trailingElement: ReactNode;
  errorMessage: string | undefined;
  defaultControl: ReactNode;
  defaultErrorFeedback: ReactNode;
}

interface ControlFooterNodeProps {
  isValid: boolean;
  isInvalid: boolean;
}

type FieldType = 'text' | 'number' | 'email' | 'select' | 'textarea';

interface FieldProps<T extends FieldValues> {
  name: Path<T>;
  form: UseFormReturn<T>;
  registerOptions?: RegisterOptions<T, Path<T>>;
  controlFooterNode?: ReactNode | ((props: ControlFooterNodeProps) => ReactNode);
  children?: ReactNode | ((props: FieldChildrenProps) => ReactNode);
  type?: FieldType;
  defaultValue?: string | number;
  className?: string;
  controlClassName?: string;
  options?: { value: string; label: string }[]; // New: For select fields
  manageState?: boolean;
  rightIcon?: ReactNode;
  formText?: string;
  // Allow any additional props to be passed to the Form.Control component
  [key: string]: any;
}

export function useIsFieldValid<T extends FieldValues>(form: UseFormReturn<T>) {
  return useCallback(
    (fieldName: keyof T): boolean => {
      const { touchedFields, errors, dirtyFields } = form.formState;
      const isTouched = !!touchedFields[fieldName as keyof typeof touchedFields];
      const isDirty = !!dirtyFields[fieldName as keyof typeof dirtyFields];
      return isTouched && isDirty && !errors[fieldName];
    },
    [form.formState],
  );
}

export function useIsFieldInvalid<T extends FieldValues>(form: UseFormReturn<T>) {
  return useCallback(
    (fieldName: keyof T): boolean => {
      const { errors } = form.formState;
      return !!errors[fieldName as keyof typeof errors];
    },
    [form.formState],
  );
}

interface TrailingElementProps {
  isValid: boolean;
  isInvalid: boolean;
  rightIcon?: ReactNode;
  fieldType?: FieldType;
}

export const getTrailingElement = ({ isValid, isInvalid, rightIcon, fieldType }: TrailingElementProps) => {
  let validationIcon: ReactNode | null = null;
  if (isValid) {
    validationIcon = <CheckCircle className="text-success" />;
  } else if (isInvalid) {
    validationIcon = <ErrorIcon className="text-danger" />;
  }

  // If there are no icons at all, return null
  if (!rightIcon && !validationIcon) {
    return null;
  }

  // If there's no rightIcon, return just the validation icon
  if (!rightIcon) {
    return <div className={classNames({ 'pr-4.5': fieldType === 'select' })}>{validationIcon}</div>;
  }

  // If there's a rightIcon but no validation icon, return just the rightIcon
  if (!validationIcon) {
    return <div className={classNames({ 'pr-4.5': fieldType === 'select' })}>{rightIcon}</div>;
  }
  // For select fields, put validation icon to the left of the dropdown icon to avoid overlap

  // For other field types, keep the original order: rightIcon first, then validation icon
  return (
    <div className={classNames('d-flex align-items-center', { 'pr-4.5': fieldType === 'select' })} style={{ gap: '8px' }}>
      {validationIcon}
      {rightIcon}
    </div>
  );
};

const DefaultFormControlBase = <T extends FieldValues>(
  {
    form,
    name,
    registerOptions = {},
    type,
    options,
    manageState = true,
    defaultValue,
    ...rest
  }: FieldProps<T>,
  ref: React.Ref<FormControlElement | null>,
) => {
  const intl = useIntl();
  const controlRef = useRef<FormControlElement | null>(null);
  const { currentStep } = useCurrentStep();
  const stepData = useCheckoutFormStore((state) => state.formData[currentStep!]);
  const currentValue = stepData?.[name as string];
  const setFormData = useCheckoutFormStore((state) => state.setFormData);
  const { register } = form;
  const { onChange } = registerOptions;

  // Forward the controlRef to the parent component via ref
  useImperativeHandle(ref, () => controlRef.current);

  const { ref: registerRef, ...registerFieldOptions } = register(name, {
    ...registerOptions,
    onChange: (event: React.ChangeEvent<FormControlElement>) => {
      // Only manage state in store if manageState is true
      if (manageState) {
        setFormData(currentStep as keyof StepDataMap, {
          ...stepData,
          [name]: event.target.value,
        });
      }
      if (onChange) {
        onChange(event);
      }
    },
  });

  const commonProps = {
    ...registerFieldOptions,
    // Only use stored value if managing state
    defaultValue: manageState ? currentValue : defaultValue,
    ...rest,
  };

  switch (type) {
    case 'select':
      return (
        <Form.Control
          as="select"
          {...commonProps}
          ref={(e) => {
            registerRef(e);
            controlRef.current = e;
          }}
        >
          <option value="">
            {intl.formatMessage({
              id: 'common.select.placeholder',
              defaultMessage: 'Select an option',
              description: 'Placeholder for select fields',
            })}
          </option>
          {options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Form.Control>
      );
    case 'textarea':
      return (
        <Form.Control
          as="textarea"
          {...commonProps}
          ref={(e) => {
            registerRef(e);
            controlRef.current = e;
          }}
        />
      );
    default:
      return (
        <Form.Control
          type={type}
          {...commonProps}
          ref={(e) => {
            registerRef(e);
            controlRef.current = e;
          }}
        />
      );
  }
};

const DefaultFormControl = forwardRef(DefaultFormControlBase);

interface DefaultErrorFeedbackProps {
  isValid: boolean;
  formText?: string;
  isInvalid: boolean;
  errorMessage?: string;
}

const DefaultErrorFeedback = ({ isValid, isInvalid, errorMessage, formText }: DefaultErrorFeedbackProps) => {
  if (!isInvalid || !errorMessage) {
    return formText && !isValid ? (
      <Form.Control.Feedback>
        {formText}
      </Form.Control.Feedback>
    )
      : null;
  }
  return (
    <Form.Control.Feedback>
      {errorMessage}
    </Form.Control.Feedback>
  );
};

const FieldBase = <T extends FieldValues>(
  {
    name,
    form,
    registerOptions = {},
    controlFooterNode,
    type = 'text',
    options,
    children,
    manageState = true,
    className,
    controlClassName,
    rightIcon,
    formText,
    ...rest
  }: FieldProps<T>,
  ref: React.Ref<FormControlElement>,
) => {
  const isValid = useIsFieldValid(form)(name);
  const isInvalid = useIsFieldInvalid(form)(name);
  const trailingElement = getTrailingElement({
    isValid,
    isInvalid,
    rightIcon,
    fieldType: type,
  });
  const errorMessage = form.formState.errors[name]?.message as string | undefined;

  const renderDefaultControl = () => (
    <DefaultFormControl
      ref={ref}
      name={name}
      form={form}
      registerOptions={registerOptions}
      type={type}
      manageState={manageState}
      options={options}
      className={controlClassName}
      trailingElement={trailingElement}
      {...rest}
    />
  );

  const renderControlFooterNode = () => {
    if (typeof controlFooterNode === 'function') {
      return controlFooterNode({ isValid,
        isInvalid });
    }
    return controlFooterNode;
  };

  const renderChildren = (props: FieldChildrenProps) => {
    if (typeof children === 'function') {
      return children(props);
    }
    return (
      <>
        {renderDefaultControl()}
        {renderControlFooterNode()}
        <DefaultErrorFeedback
          isValid={isValid}
          isInvalid={isInvalid}
          errorMessage={errorMessage}
          formText={formText}
        />
      </>
    );
  };

  return (
    <Form.Group
      isValid={isValid}
      isInvalid={isInvalid}
      className={className}
    >
      {renderChildren({
        defaultControl: renderDefaultControl(),
        defaultErrorFeedback: (
          <DefaultErrorFeedback
            isValid={isValid}
            isInvalid={isInvalid}
            errorMessage={errorMessage}
            formText={formText}
          />
        ),
        isValid,
        isInvalid,
        trailingElement,
        errorMessage,
      })}
    </Form.Group>
  );
};

const Field = forwardRef(FieldBase);

export default Field;
