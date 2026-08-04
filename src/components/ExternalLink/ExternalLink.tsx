import { Button, Hyperlink, Icon } from '@openedx/paragon';
import { Launch } from '@openedx/paragon/icons';
import classNames from 'classnames';
import React from 'react';
import { FormattedMessage } from 'react-intl';

interface ExternalLinkProps {
  href: string;
  children: React.ReactNode;
  variant?: 'hyperlink' | 'button';
  buttonVariant?: string;
  className?: string;
  style?: React.CSSProperties;
  iconBefore?: React.ComponentType<{}>;
  iconBeforeStyle?: React.CSSProperties;
  dataTestId?: string;
}

const ExternalLink: React.FC<ExternalLinkProps> = ({
  href,
  children,
  variant = 'hyperlink',
  buttonVariant = 'light',
  className,
  style,
  iconBefore,
  iconBeforeStyle,
  dataTestId,
}) => {
  if (variant === 'button') {
    const launchIcon = (
      <Icon
        src={Launch}
        className="ml-1"
        screenReaderText={(
          <FormattedMessage
            id="checkout.externalLink.screenReaderText"
            defaultMessage="Opens in a new tab"
            description="Screen reader text announcing that a link opens in a new browser tab"
          />
        )}
      />
    );

    return (
      <Button
        variant={buttonVariant}
        className={className}
        style={style}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        data-testid={dataTestId}
      >
        {iconBefore && <Icon src={iconBefore} style={iconBeforeStyle} />}
        <span>{children}</span>
        {launchIcon}
      </Button>
    );
  }

  return (
    <Hyperlink
      destination={href}
      target="_blank"
      className={classNames('external-link', className)}
      rel="noopener noreferrer"
      data-testid={dataTestId}
    >
      {children}
    </Hyperlink>
  );
};

export default ExternalLink;
