/**
 * Create a Stripe appearance object based on Paragon and brand CSS variables
 * @returns {Object} Stripe appearance object
 */

import { Appearance } from '@stripe/stripe-js';

import { getComputedStylePropertyCSSVariable } from '@/utils/common';

// Base appearance object
export const createStripeAppearance = (): Appearance => (
  {
    theme: 'flat',
    variables: {
      // Colors
      colorPrimary: getComputedStylePropertyCSSVariable('--pgn-color-primary-base', '#0075b4'),
      colorBackground: getComputedStylePropertyCSSVariable('--pgn-color-body-bg', '#f2f0ef'),
      colorText: getComputedStylePropertyCSSVariable('--pgn-color-body-base', '#333333'),
      colorDanger: getComputedStylePropertyCSSVariable('--pgn-color-danger-base', '#d23c50'),
      colorSuccess: getComputedStylePropertyCSSVariable('--pgn-color-success-base', '#008100'),
      colorWarning: getComputedStylePropertyCSSVariable('--pgn-color-warning-base', '#ffc107'),
      colorTextSecondary: getComputedStylePropertyCSSVariable('--pgn-color-text-secondary', '#707070'),
      colorTextPlaceholder: getComputedStylePropertyCSSVariable('--pgn-color-text-muted', '#767676'),

      // Accessible colors
      accessibleColorOnColorPrimary: getComputedStylePropertyCSSVariable('--pgn-color-white', '#ffffff'),
      accessibleColorOnColorBackground: getComputedStylePropertyCSSVariable('--pgn-color-text-primary', '#333333'),
      accessibleColorOnColorSuccess: getComputedStylePropertyCSSVariable('--pgn-color-white', '#ffffff'),
      accessibleColorOnColorDanger: getComputedStylePropertyCSSVariable('--pgn-color-white', '#ffffff'),
      accessibleColorOnColorWarning: getComputedStylePropertyCSSVariable('--pgn-color-text-primary', '#333333'),

      // Icon colors
      iconColor: getComputedStylePropertyCSSVariable('--pgn-color-text-primary', '#333333'),
      iconHoverColor: getComputedStylePropertyCSSVariable('--pgn-color-primary-base', '#0075b4'),
      iconCheckmarkColor: getComputedStylePropertyCSSVariable('--pgn-color-white', '#ffffff'),

      // Typography
      fontFamily: getComputedStylePropertyCSSVariable('--pgn-typography-font-family-base', '"Inter", "Helvetica Neue", Arial, sans-serif'),
      fontSizeBase: getComputedStylePropertyCSSVariable('--pgn-typography-font-size-base', '16px'),
      fontWeightLight: getComputedStylePropertyCSSVariable('--pgn-typography-font-weight-light', '300'),
      fontWeightNormal: getComputedStylePropertyCSSVariable('--pgn-typography-font-weight-normal', '400'),
      fontWeightMedium: getComputedStylePropertyCSSVariable('--pgn-typography-font-weight-semi-bold', '500'),
      fontWeightBold: getComputedStylePropertyCSSVariable('--pgn-typography-font-weight-bold', '600'),
      fontLineHeight: getComputedStylePropertyCSSVariable('--pgn-typography-line-height-base', '1.5'),
      fontSizeXl: getComputedStylePropertyCSSVariable('--pgn-typography-font-size-xl', '1.25rem'),
      fontSizeLg: getComputedStylePropertyCSSVariable('--pgn-typography-font-size-lg', '1.125rem'),
      fontSizeSm: getComputedStylePropertyCSSVariable('--pgn-typography-font-size-sm', '0.875rem'),
      fontSizeXs: getComputedStylePropertyCSSVariable('--pgn-typography-font-size-xs', '0.75rem'),
      fontSmooth: 'auto',

      // Spacing
      spacingUnit: getComputedStylePropertyCSSVariable('--pgn-spacing-spacer-base', '4px'),
      spacingGridRow: getComputedStylePropertyCSSVariable('--pgn-spacing-grid-gutter-width', '16px'),
      spacingGridColumn: getComputedStylePropertyCSSVariable('--pgn-spacing-grid-gutter-width', '16px'),
      accordionItemSpacing: getComputedStylePropertyCSSVariable('--pgn-spacing-spacer-3', '12px'),
      tabSpacing: getComputedStylePropertyCSSVariable('--pgn-spacing-spacer-2', '8px'),

      // Borders
      borderRadius: getComputedStylePropertyCSSVariable('--pgn-size-border-radius-base', '4px'),
    },
    rules: {
      // Input field styling
      '.Input': {
        border: `${getComputedStylePropertyCSSVariable('--pgn-size-form-input-width-border', '1px')} solid ${getComputedStylePropertyCSSVariable('--pgn-color-form-input-border', '#d2d2d2')}`,
        boxShadow: getComputedStylePropertyCSSVariable('--pgn-elevation-form-input-base', '0 1px 3px 0 rgba(0, 0, 0, 0.1)'),
        transition: getComputedStylePropertyCSSVariable('--pgn-transition-form-input', 'border-color 0.2s ease, box-shadow 0.2s ease'),
        padding: `${getComputedStylePropertyCSSVariable('--pgn-spacing-form-input-padding-y-base', '0.5625rem')} ${getComputedStylePropertyCSSVariable('--pgn-spacing-form-input-padding-x-base', '1rem')}`,
        height: getComputedStylePropertyCSSVariable('--pgn-size-form-input-height-base', 'calc(1.5em + 1.125rem + 2px)'),
        fontSize: getComputedStylePropertyCSSVariable('--pgn-typography-form-input-font-size-base', '1rem'),
        lineHeight: getComputedStylePropertyCSSVariable('--pgn-typography-form-input-line-height-base', '1.5'),
        borderRadius: getComputedStylePropertyCSSVariable('--pgn-size-form-input-radius-border-base', '0.25rem'),
      },

      // Input focus state
      '.Input:focus': {
        color: getComputedStylePropertyCSSVariable('--pgn-color-form-input-focus-base', 'inherit'),
        backgroundColor: getComputedStylePropertyCSSVariable('--pgn-color-form-input-focus-bg', '#fff'),
        borderColor: getComputedStylePropertyCSSVariable('--pgn-color-form-input-focus-border', '#0075b4'),
        boxShadow: getComputedStylePropertyCSSVariable('--pgn-elevation-form-input-focus', '0 0 0 0.2rem rgba(0, 117, 180, 0.25)'),
        outline: '0',
      },

      // Input hover state
      '.Input:hover:not(:focus)': {
        border: `solid ${getComputedStylePropertyCSSVariable('--pgn-size-form-input-width-hover', '1px')} ${getComputedStylePropertyCSSVariable('--pgn-color-dark-700', '#454545')}`,
      },

      // Input placeholder
      '.Input::placeholder': {
        color: getComputedStylePropertyCSSVariable('--pgn-color-text-muted', '#767676'),
      },

      // Invalid input state
      '.Input--invalid': {
        borderColor: getComputedStylePropertyCSSVariable('--pgn-color-danger-base', '#d23c50'),
        boxShadow: `0 0 0 1px ${getComputedStylePropertyCSSVariable('--pgn-color-danger-base', '#d23c50')}`,
      },

      // Complete input state
      '.Input--complete': {
        borderColor: getComputedStylePropertyCSSVariable('--pgn-color-success-base', '#008100'),
        boxShadow: `0 0 0 1px ${getComputedStylePropertyCSSVariable('--pgn-color-success-base', '#008100')}`,
      },

      // Label styling
      '.Label': {
        fontSize: getComputedStylePropertyCSSVariable('--pgn-typography-font-size-sm', '14px'),
        fontWeight: getComputedStylePropertyCSSVariable('--pgn-typography-font-weight-semi-bold', '500'),
        marginBottom: getComputedStylePropertyCSSVariable('--pgn-spacing-label-margin-bottom', '8px'),
        color: getComputedStylePropertyCSSVariable('--pgn-color-text-primary', '#333333'),
      },

      // Error message styling
      '.Error': {
        color: getComputedStylePropertyCSSVariable('--pgn-color-danger-base', '#d23c50'),
        fontSize: getComputedStylePropertyCSSVariable('--pgn-typography-font-size-sm', '14px'),
        marginTop: getComputedStylePropertyCSSVariable('--pgn-spacing-spacer-2', '8px'),
      },

      // Tab styling
      '.Tab': {
        borderBottom: '2px solid transparent',
        padding: `${getComputedStylePropertyCSSVariable('--pgn-spacing-tab-padding-y', '8px')} ${getComputedStylePropertyCSSVariable('--pgn-spacing-tab-padding-x', '16px')}`,
        transition: getComputedStylePropertyCSSVariable('--pgn-transition-base', 'all 0.2s ease-in-out'),
      },
      '.Tab--selected': {
        borderBottomColor: getComputedStylePropertyCSSVariable('--pgn-color-primary-base', '#0075b4'),
        fontWeight: getComputedStylePropertyCSSVariable('--pgn-typography-font-weight-bold', '600'),
      },
      '.Tab:hover': {
        color: getComputedStylePropertyCSSVariable('--pgn-color-primary-hover', '#065683'),
      },
      '.TabIcon': {
        marginRight: getComputedStylePropertyCSSVariable('--pgn-spacing-spacer-2', '8px'),
        fill: getComputedStylePropertyCSSVariable('--pgn-color-text-primary', '#333333'),
      },
      '.TabIcon--selected': {
        fill: getComputedStylePropertyCSSVariable('--pgn-color-primary-base', '#0075b4'),
      },

      // Checkbox styling
      '.Checkbox': {
        transition: getComputedStylePropertyCSSVariable('--pgn-transition-base', 'all 0.2s ease-in-out'),
      },
      '.CheckboxInput': {
        borderRadius: getComputedStylePropertyCSSVariable('--pgn-size-border-radius-sm', '0.125rem'),
        border: `${getComputedStylePropertyCSSVariable('--pgn-size-border-width', '1px')} solid ${getComputedStylePropertyCSSVariable('--pgn-color-form-input-border', '#d2d2d2')}`,
        backgroundColor: getComputedStylePropertyCSSVariable('--pgn-color-white', '#ffffff'),
      },
      '.CheckboxInput--checked': {
        backgroundColor: getComputedStylePropertyCSSVariable('--pgn-color-primary-base', '#0075b4'),
        borderColor: getComputedStylePropertyCSSVariable('--pgn-color-primary-base', '#0075b4'),
      },
      '.CheckboxLabel': {
        fontSize: getComputedStylePropertyCSSVariable('--pgn-typography-font-size-base', '1rem'),
        color: getComputedStylePropertyCSSVariable('--pgn-color-text-primary', '#333333'),
        marginLeft: getComputedStylePropertyCSSVariable('--pgn-spacing-spacer-2', '8px'),
      },

      // Switch styling
      '.Switch': {
        transition: getComputedStylePropertyCSSVariable('--pgn-transition-base', 'all 0.2s ease-in-out'),
      },
      '.SwitchControl': {
        backgroundColor: getComputedStylePropertyCSSVariable('--pgn-color-light', '#e9e9e9'),
        borderRadius: '1rem',
        transition: getComputedStylePropertyCSSVariable('--pgn-transition-base', 'all 0.2s ease-in-out'),
      },
      '.Switch--active .SwitchControl': {
        backgroundColor: getComputedStylePropertyCSSVariable('--pgn-color-primary-base', '#0075b4'),
      },

      // Block styling
      '.Block': {
        backgroundColor: getComputedStylePropertyCSSVariable('--pgn-color-white', '#ffffff'),
        border: `${getComputedStylePropertyCSSVariable('--pgn-size-border-width', '1px')} solid ${getComputedStylePropertyCSSVariable('--pgn-color-light', '#e9e9e9')}`,
        borderRadius: getComputedStylePropertyCSSVariable('--pgn-size-border-radius-base', '0.25rem'),
        padding: getComputedStylePropertyCSSVariable('--pgn-spacing-block-padding', '1rem'),
      },
      '.BlockAction': {
        color: getComputedStylePropertyCSSVariable('--pgn-color-primary-base', '#0075b4'),
        transition: getComputedStylePropertyCSSVariable('--pgn-transition-base', 'all 0.2s ease-in-out'),
      },
      '.BlockAction:hover': {
        color: getComputedStylePropertyCSSVariable('--pgn-color-primary-hover', '#065683'),
      },
      '.BlockDivider': {
        backgroundColor: getComputedStylePropertyCSSVariable('--pgn-color-light', '#e9e9e9'),
      },

      // Dropdown styling
      '.Dropdown': {
        border: `${getComputedStylePropertyCSSVariable('--pgn-size-border-width', '1px')} solid ${getComputedStylePropertyCSSVariable('--pgn-color-form-input-border', '#d2d2d2')}`,
        borderRadius: getComputedStylePropertyCSSVariable('--pgn-size-border-radius-base', '0.25rem'),
        backgroundColor: getComputedStylePropertyCSSVariable('--pgn-color-white', '#ffffff'),
      },
      '.DropdownItem': {
        padding: `${getComputedStylePropertyCSSVariable('--pgn-spacing-dropdown-item-padding-y', '0.5rem')} ${getComputedStylePropertyCSSVariable('--pgn-spacing-dropdown-item-padding-x', '0.75rem')}`,
        color: getComputedStylePropertyCSSVariable('--pgn-color-text-primary', '#333333'),
        transition: getComputedStylePropertyCSSVariable('--pgn-transition-base', 'all 0.2s ease-in-out'),
      },
      '.DropdownItem--highlight': {
        backgroundColor: getComputedStylePropertyCSSVariable('--pgn-color-light-hover', '#d2d2d2'),
      },

      // Picker styling
      '.PickerItem': {
        border: `${getComputedStylePropertyCSSVariable('--pgn-size-border-width', '1px')} solid ${getComputedStylePropertyCSSVariable('--pgn-color-form-input-border', '#d2d2d2')}`,
        borderRadius: getComputedStylePropertyCSSVariable('--pgn-size-border-radius-base', '0.25rem'),
        padding: getComputedStylePropertyCSSVariable('--pgn-spacing-picker-item-padding', '0.75rem'),
        transition: getComputedStylePropertyCSSVariable('--pgn-transition-base', 'all 0.2s ease-in-out'),
      },
      '.PickerItem--selected': {
        borderColor: getComputedStylePropertyCSSVariable('--pgn-color-primary-base', '#0075b4'),
        backgroundColor: getComputedStylePropertyCSSVariable('--pgn-color-primary-light', '#CCE5F2'),
      },
      '.PickerItem:hover': {
        borderColor: getComputedStylePropertyCSSVariable('--pgn-color-primary-hover', '#065683'),
      },
      '.PickerAction': {
        color: getComputedStylePropertyCSSVariable('--pgn-color-primary-base', '#0075b4'),
        transition: getComputedStylePropertyCSSVariable('--pgn-transition-base', 'all 0.2s ease-in-out'),
      },

      // Code input styling
      '.CodeInput': {
        border: `${getComputedStylePropertyCSSVariable('--pgn-size-border-width', '1px')} solid ${getComputedStylePropertyCSSVariable('--pgn-color-form-input-border', '#d2d2d2')}`,
        borderRadius: getComputedStylePropertyCSSVariable('--pgn-size-border-radius-base', '0.25rem'),
        padding: getComputedStylePropertyCSSVariable('--pgn-spacing-code-input-padding', '0.75rem'),
        fontSize: getComputedStylePropertyCSSVariable('--pgn-typography-font-size-lg', '1.125rem'),
        textAlign: 'center',
        backgroundColor: getComputedStylePropertyCSSVariable('--pgn-color-white', '#ffffff'),
      },

      // Accordion styling
      '.AccordionItem': {
        borderBottom: `${getComputedStylePropertyCSSVariable('--pgn-size-border-width', '1px')} solid ${getComputedStylePropertyCSSVariable('--pgn-color-light', '#e9e9e9')}`,
        padding: getComputedStylePropertyCSSVariable('--pgn-spacing-accordion-item-padding', '0.75rem'),
        transition: getComputedStylePropertyCSSVariable('--pgn-transition-base', 'all 0.2s ease-in-out'),
        border: '0',
      },
      '.AccordionItem--selected': {
        // Background color for stripe card item
        backgroundColor: getComputedStylePropertyCSSVariable('--pgn-color-light-300', '#f0eeed'),
      },

      // Radio icon styling
      '.RadioIcon': {
        width: '20px',
      },
      '.RadioIconOuter': {
        stroke: getComputedStylePropertyCSSVariable('--pgn-color-form-input-border', '#d2d2d2'),
        strokeWidth: '1',
        fill: 'none',
      },
      '.RadioIconInner': {
        fill: getComputedStylePropertyCSSVariable('--pgn-color-primary-base', '#0075b4'),
        r: '5',
      },
      '.RadioIconOuter--checked': {
        stroke: getComputedStylePropertyCSSVariable('--pgn-color-primary-base', '#0075b4'),
      },
    },
  });
