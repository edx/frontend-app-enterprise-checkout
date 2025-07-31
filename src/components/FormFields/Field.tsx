import { useIntl } from '@edx/frontend-platform/i18n';
import { Form } from '@openedx/paragon';
import {
  CheckCircle, Error as ErrorIcon,
} from '@openedx/paragon/icons';
import { camelCase } from 'lodash-es';
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
} from 'react';

import { CheckoutStepKey } from '@/components/Stepper/constants';
import useCheckoutFormStore from '@/hooks/useCheckoutFormStore';
import useCurrentStep from '@/hooks/useCurrentStep';

import type {
  FieldValues,
  Path,
  RegisterOptions,
  UseFormReturn,
} from 'react-hook-form';

interface FieldChildrenProps {
  isValid: boolean;
  isInvalid: boolean;
  trailingElement: React.ReactNode;
  errorMessage: string | undefined;
  defaultControl: React.ReactNode;
  defaultErrorFeedback: React.ReactNode;
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
  controlFooterNode?: React.ReactNode | ((props: ControlFooterNodeProps) => React.ReactNode);
  children?: React.ReactNode | ((props: FieldChildrenProps) => React.ReactNode);
  type?: FieldType;
  defaultValue?: string | number;
  className?: string;
  controlClassName?: string;
  options?: { value: string; label: string }[]; // New: For select fields
  // Allow any additional props to be passed to the Form.Control component
  [key: string]: any;
}

export function useIsFieldValid<T extends FieldValues>(form: UseFormReturn<T>) {
  return useCallback(
    (fieldName: keyof T): boolean => {
      const { touchedFields, errors } = form.formState;
      const isTouched = !!touchedFields[fieldName as keyof typeof touchedFields];
      return isTouched && !errors[fieldName];
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
}

export const getTrailingElement = ({ isValid, isInvalid }: TrailingElementProps) => {
  if (isValid) {
    return <CheckCircle className="text-success" />;
  }
  if (isInvalid) {
    return <ErrorIcon className="text-danger" />;
  }
  return null;
};

const DefaultFormControlBase = <T extends FieldValues>(
  {
    form,
    name,
    registerOptions = {},
    type,
    options,
    defaultValue,
    ...rest
  }: FieldProps<T>,
  ref: React.Ref<FormControlElement | null>,
) => {
  const intl = useIntl();
  const controlRef = useRef<FormControlElement | null>(null);
  const currentStep = camelCase(useCurrentStep()!);
  const formData = useCheckoutFormStore((state) => state.formData[currentStep]);
  const currentValue = formData?.[name as CheckoutStepKey];
  const setFormData = useCheckoutFormStore((state) => state.setFormData);
  const { register } = form;
  const { onChange } = registerOptions;

  // Forward the controlRef to the parent component via ref
  useImperativeHandle(ref, () => controlRef.current);

  const { ref: registerRef, ...registerFieldOptions } = register(name, {
    ...registerOptions,
    onChange: (event: React.ChangeEvent<FormControlElement>) => {
      // @ts-ignore
      setFormData(currentStep, {
        ...formData,
        [name]: event.target.value,
      });
      if (onChange) {
        onChange(event);
      }
    },
  });

  const commonProps = {
    ...registerFieldOptions,
    defaultValue: currentValue,
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
  isInvalid: boolean;
  errorMessage?: string;
}

const DefaultErrorFeedback = ({ isInvalid, errorMessage }: DefaultErrorFeedbackProps) => {
  if (!isInvalid || !errorMessage) {
    return null;
  }
  return (
    <Form.Control.Feedback type="invalid">
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
    className,
    controlClassName,
    ...rest
  }: FieldProps<T>,
  ref: React.Ref<FormControlElement>,
) => {
  const isValid = useIsFieldValid(form)(name);
  const isInvalid = useIsFieldInvalid(form)(name);
  const trailingElement = getTrailingElement({ isValid,
    isInvalid });
  const errorMessage = form.formState.errors[name]?.message as string | undefined;

  const renderDefaultControl = () => (
    <DefaultFormControl
      ref={ref}
      name={name}
      form={form}
      registerOptions={registerOptions}
      type={type}
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
          isInvalid={isInvalid}
          errorMessage={errorMessage}
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
            isInvalid={isInvalid}
            errorMessage={errorMessage}
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
