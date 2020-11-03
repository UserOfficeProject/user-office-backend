import { logger } from '../../utils/Logger';
import { DataType, QuestionTemplateRelation } from '../Template';
import { booleanDefinition } from './Boolean';
import { dateDefinition } from './Date';
import { embellishmentDefinition } from './Embellishment';
import { fileUploadDefinition } from './FileUpload';
import { proposalBasisDefinition } from './ProposalBasis';
import { sampleBasisDefinition } from './SampleBasis';
import { sampleDeclarationDefinition } from './SampleDeclaration';
import { selectionFromOptionsDefinition } from './SelectionFromOptions';
import { textInputDefinition } from './TextInput';

export interface Question {
  dataType: DataType;
  validate: (field: QuestionTemplateRelation, value: any) => boolean;
  createBlankConfig: () => any;
  isReadOnly: boolean;
  defaultAnswer: any;
}

// Add new component definitions here
const registry = [
  booleanDefinition,
  dateDefinition,
  embellishmentDefinition,
  fileUploadDefinition,
  selectionFromOptionsDefinition,
  textInputDefinition,
  sampleDeclarationDefinition,
  proposalBasisDefinition,
  sampleBasisDefinition,
];

const componentMap = new Map<DataType, Question>();
registry.forEach(definition =>
  componentMap.set(definition.dataType, definition)
);

export const getQuestionDefinition = (dataType: DataType) => {
  const definition = componentMap.get(dataType);
  if (!definition) {
    logger.logError('Tried to obtain non-existing definition', { dataType });
    throw new Error('Tried to obtain non-existing definition');
  }

  return definition;
};

/**
 * Convenience function to create config for datatype with initial data
 */
export function createConfig<T>(
  dataType: DataType,
  init: Partial<T> | string = {}
): T {
  const definition = getQuestionDefinition(dataType);
  const config: T = definition.createBlankConfig();
  const initValues: Partial<T> =
    typeof init === 'string' ? JSON.parse(init) : init;
  Object.assign(config, { ...initValues });

  return config;
}

/**
 * Convenience function to get default value for datatype
 */
export function getDefaultAnswerValue(dataType: DataType): any {
  const definition = getQuestionDefinition(dataType);

  return definition.defaultAnswer;
}
