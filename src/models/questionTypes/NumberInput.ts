/* eslint-disable @typescript-eslint/camelcase */
import * as Yup from 'yup';

import {
  NumberInputConfig,
  NumberValueConstraint,
} from '../../resolvers/types/FieldConfig';
import { DataType, QuestionTemplateRelation } from '../Template';
import { Question } from './QuestionRegistry';

export const numberInputDefinition: Question = {
  dataType: DataType.NUMBER_INPUT,
  isReadOnly: false,
  getDefaultAnswer: field => {
    return {
      value: '',
      unit: (field.config as NumberInputConfig).units?.[0] || null,
    };
  },
  validate: (
    field: QuestionTemplateRelation,
    value: { value: number; unit: string | null }
  ) => {
    if (field.question.dataType !== DataType.NUMBER_INPUT) {
      throw new Error('DataType should be NUMBER_INPUT');
    }

    const config = field.config as NumberInputConfig;

    let scheme = Yup.number().transform(value =>
      isNaN(value) ? undefined : value
    );

    if (config.required) {
      scheme = scheme.required();
    }

    if (config.numberValueConstraint === NumberValueConstraint.ONLY_NEGATIVE) {
      scheme = scheme.negative();
    }

    if (config.numberValueConstraint === NumberValueConstraint.ONLY_POSITIVE) {
      scheme = scheme.positive();
    }

    return Yup.object()
      .shape({
        value: scheme,
        unit:
          config.property !== 'UNITLESS'
            ? Yup.string().required()
            : Yup.string().nullable(),
      })
      .isValidSync(value);
  },
  createBlankConfig: (): NumberInputConfig => {
    const config = new NumberInputConfig();
    config.small_label = '';
    config.required = false;
    config.tooltip = '';
    config.property = '';
    config.units = [];

    return config;
  },
};
