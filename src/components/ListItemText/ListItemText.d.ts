import * as React from 'react';
import { SxProps } from '@mui/system';
import { InternalStandardProps as StandardProps, Theme } from '..';
import { TypographyProps } from '../Typography';
import { ListItemTextClasses } from './listItemTextClasses';

export interface ListItemTextProps<
  PrimaryTypographyComponent extends React.ElementType = 'span',
  SecondaryTypographyComponent extends React.ElementType = 'p',
  TertiaryTypographyComponent extends React.ElementType = 'p',
> extends StandardProps<React.HTMLAttributes<HTMLDivElement>> {
  children?: React.ReactNode;
  classes?: Partial<ListItemTextClasses>;
  disableTypography?: boolean;
  inset?: boolean;
  primary?: React.ReactNode;
  primaryTypographyProps?: TypographyProps<
    PrimaryTypographyComponent,
    { component?: PrimaryTypographyComponent }
  >;
  secondary?: React.ReactNode;
  secondaryTypographyProps?: TypographyProps<
    SecondaryTypographyComponent,
    { component?: SecondaryTypographyComponent }
  >;
  tertiary?: React.ReactNode;
  tertiaryTypographyProps?: TypographyProps<
    TertiaryTypographyComponent,
    { component?: TertiaryTypographyComponent }
  >;
  sx?: SxProps<Theme>;
}

export default function ListItemText<
  PrimaryTypographyComponent extends React.ElementType = 'span',
  SecondaryTypographyComponent extends React.ElementType = 'p',
  TertiaryTypographyComponent extends React.ElementType = 'p',
>(
  props: ListItemTextProps<PrimaryTypographyComponent, SecondaryTypographyComponent, TertiaryTypographyComponent>,
): React.JSX.Element {
  const {
    primary,
    secondary,
    tertiary,
    primaryTypographyProps,
    secondaryTypographyProps,
    tertiaryTypographyProps,
    disableTypography = false,
    ...other
  } = props;

 
}
