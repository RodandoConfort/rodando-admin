export type EntityPageCardActionPlacement = 'header' | 'footer';

export type EntityPageCardActionVariant =
  | 'filled'
  | 'outlined'
  | 'text'
  | 'icon';

export type EntityPageCardActionTone =
  | 'primary'
  | 'neutral'
  | 'danger';

export type EntityPageCardActionType =
  | 'button'
  | 'submit'
  | 'reset';

export interface EntityPageCardAction {
  key: string;
  label: string;
  icon?: string;

  placement?: EntityPageCardActionPlacement;
  variant?: EntityPageCardActionVariant;
  tone?: EntityPageCardActionTone;
  type?: EntityPageCardActionType;

  formId?: string;

  visible?: boolean;
  disabled?: boolean;
  loading?: boolean;

  ariaLabel?: string;
}
