/* eslint-disable @typescript-eslint/camelcase */
import {
  ConfigBase,
  RichTextInputConfig,
} from '../../resolvers/types/FieldConfig';
import { DataType } from '../Template';
import { Question } from './QuestionRegistry';

export const richTextInputDefinition: Question = {
  dataType: DataType.RICH_TEXT_INPUT,
  validate: () => {
    //fixme
    return true;
  },
  createBlankConfig: (): ConfigBase => {
    const config = new RichTextInputConfig();
    config.required = false;
    config.small_label = '';
    config.tooltip = '';

    return config;
  },
  isReadOnly: false,
  getDefaultAnswer: () => '',
};
