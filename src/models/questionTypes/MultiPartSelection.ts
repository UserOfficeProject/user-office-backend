import { multipleChoiceValidationSchema } from '@user-office-software/duo-validation';

import { MultiPartSelectionConfig } from '../../resolvers/types/FieldConfig';
import { QuestionFilterCompareOperator } from '../Questionary';
import { DataType, QuestionTemplateRelation } from '../Template';
import { Question } from './QuestionRegistry';

export const multiPartSelectionDefinition: Question = {
  dataType: DataType.MULTI_PART_SELECTION,
  getDefaultAnswer: () => [],
  validate: (field: QuestionTemplateRelation, value: string[]) => {
    if (field.question.dataType !== DataType.MULTI_PART_SELECTION) {
      throw new Error('DataType should be MULTI_PART_SELECTION');
    }

    return multipleChoiceValidationSchema(field).isValid(value);
  },
  createBlankConfig: (): MultiPartSelectionConfig => {
    const config = new MultiPartSelectionConfig();
    config.partOneVariant = 'radio';
    config.partTwoVariant = 'radio';
    config.small_label = '';
    config.required = false;
    config.partOneOptions = [];
    config.partTwoOptions = [];
    config.isPartOneMultipleSelect = false;
    config.isPartTwoMultipleSelect = false;

    return config;
  },
  filterQuery: (queryBuilder, filter) => {
    const value = JSON.parse(filter.value).value;
    switch (filter.compareOperator) {
      case QuestionFilterCompareOperator.INCLUDES:
        /*
        "\\?" is escaping question mark for JSONB lookup
      (read more here https://www.postgresql.org/docs/9.5/functions-json.html),
        but "?" is used for binding
                            */
        return queryBuilder.andWhereRaw(
          //eslint-disable-next-line quotes
          "(answers.answer->>'value')::jsonb \\? ?",
          value
        );
      default:
        throw new Error(
          `Unsupported comparator for SelectionFromOptions ${filter.compareOperator}`
        );
    }
  },
};
