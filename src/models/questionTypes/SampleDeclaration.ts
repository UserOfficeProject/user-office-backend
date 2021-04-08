import { container } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { SampleDataSource } from '../../datasources/SampleDataSource';
import { isRejection } from '../../rejection';
import { SubtemplateConfig } from '../../resolvers/types/FieldConfig';
import { DataType, TemplateCategoryId } from '../Template';
import { Question } from './QuestionRegistry';

export const sampleDeclarationDefinition: Question = {
  dataType: DataType.SAMPLE_DECLARATION,
  createBlankConfig: (): SubtemplateConfig => {
    const config = new SubtemplateConfig();
    config.addEntryButtonLabel = 'Add';
    config.templateCategory =
      TemplateCategoryId[TemplateCategoryId.SAMPLE_DECLARATION];
    config.templateId = null;
    config.small_label = '';
    config.required = false;

    return config;
  },
  isReadOnly: false,
  getDefaultAnswer: () => [],
  clone: async (answer) => {
    const sampleDataSource = container.resolve<SampleDataSource>(
      Tokens.SampleDataSource
    );

    const sampleIds = answer as number[];
    const clonedSampleIds = [];
    for await (const sampleId of sampleIds) {
      const clonedSample = await sampleDataSource.clone(sampleId);
      if (!isRejection(clonedSample)) {
        clonedSampleIds.push(clonedSample.id);
      }
    }

    return clonedSampleIds;
  },
};
