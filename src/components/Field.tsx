import { useCallback } from 'react';
import { Form } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import type {
  FieldValues, Path, RegisterOptions, UseFormReturn,
} from 'react-hook-form';
import { CheckCircle, Error as ErrorIcon } from '@openedx/paragon/icons';

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
  fieldOptions?: RegisterOptions<T, Path<T>>;
  controlFooterNode?: React.ReactNode | ((props: ControlFooterNodeProps) => React.ReactNode);
  children?: React.ReactNode | ((props: FieldChildrenProps) => React.ReactNode);
  type?: FieldType;
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

interface DefaultFormControlProps<T extends FieldValues> extends FieldProps<T> {}

const DefaultFormControl = <T extends FieldValues>({
  form,
  name,
  fieldOptions,
  type,
  options,
  ...rest
}: DefaultFormControlProps<T>) => {
  const intl = useIntl();
  const commonProps = { ...form.register(name, fieldOptions), ...rest };

  switch (type) {
    case 'select':
      return (
        <Form.Control as="select" {...commonProps}>
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
      return <Form.Control as="textarea" {...commonProps} />;
    default:
      return <Form.Control type={type} {...commonProps} />;
  }
};

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

const Field = <T extends FieldValues>({
  name,
  form,
  fieldOptions = {},
  controlFooterNode,
  type = 'text',
  options,
  children,
  ...rest
}: FieldProps<T>) => {
  const isValid = useIsFieldValid(form)(name);
  const isInvalid = useIsFieldInvalid(form)(name);
  const trailingElement = getTrailingElement({ isValid, isInvalid });
  const errorMessage = form.formState.errors[name]?.message as string | undefined;

  const renderControlFooterNode = () => {
    if (typeof controlFooterNode === 'function') {
      return controlFooterNode({ isValid, isInvalid });
    }
    return controlFooterNode;
  };

  const renderChildren = (props: FieldChildrenProps) => {
    if (typeof children === 'function') {
      return children(props);
    }
    return (
      <>
        <DefaultFormControl
          name={name}
          form={form}
          fieldOptions={fieldOptions}
          type={type}
          options={options}
          trailingElement={trailingElement}
          {...rest}
        />
        {renderControlFooterNode()}
        <DefaultErrorFeedback
          isInvalid={isInvalid}
          errorMessage={errorMessage}
        />
      </>
    );
  };

  return (
    <Form.Group isValid={isValid} isInvalid={isInvalid}>
      {renderChildren({
        defaultControl: (
          <DefaultFormControl
            name={name}
            form={form}
            fieldOptions={fieldOptions}
            type={type}
            options={options}
            trailingElement={trailingElement}
            {...rest}
          />
        ),
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

export default Field;
