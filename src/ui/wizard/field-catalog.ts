// Field catalog: maps WizardFieldType to React components.
// OCP: add a new field type by adding a component + registering it here.
// LSP: all components implement the same WizardFieldProps interface.

import type { ComponentType } from 'react'
import type { WizardFieldSpec, WizardFieldType } from '../../types.ts'
import WizardTextField from './WizardTextField.tsx'
import WizardPasswordField from './WizardPasswordField.tsx'
import WizardSelectField from './WizardSelectField.tsx'
import WizardInfoField from './WizardInfoField.tsx'
import WizardConfirmField from './WizardConfirmField.tsx'

// All wizard field components implement this interface
export interface WizardFieldProps {
  spec: WizardFieldSpec
  value: string
  onChange: (value: string) => void
}

type WizardFieldComponent = ComponentType<WizardFieldProps>

const FIELD_CATALOG: Record<WizardFieldType, WizardFieldComponent> = {
  text: WizardTextField,
  password: WizardPasswordField,
  select: WizardSelectField,
  info: WizardInfoField,
  confirm: WizardConfirmField,
}

export function getFieldComponent(type: WizardFieldType): WizardFieldComponent | undefined {
  return FIELD_CATALOG[type]
}
