import { Button, Hyperlink, Icon } from '@openedx/paragon';
import { Launch } from '@openedx/paragon/icons';
import React from 'react';

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
  const launchIcon = (
    <Icon src={Launch} className="ml-1" />
  );

  if (variant === 'button') {
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
      rel="noopener noreferrer"
      showLaunchIcon={false}
      className={`${className || ''}`}
      data-testid={dataTestId}
    >
      {children}
      {launchIcon}
    </Hyperlink>
  );
};

export default ExternalLink;
