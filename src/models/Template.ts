import { FieldConfigType } from '../resolvers/types/FieldConfig';
import { EvaluatorOperator } from './ConditionEvaluator';

export class FieldDependency {
  constructor(
    public questionId: string,
    public dependencyId: string,
    public dependencyNaturalKey: string,
    public condition: FieldCondition
  ) {}
}

export enum DataType {
  BOOLEAN = 'BOOLEAN',
  DATE = 'DATE',
  EMBELLISHMENT = 'EMBELLISHMENT',
  FILE_UPLOAD = 'FILE_UPLOAD',
  SELECTION_FROM_OPTIONS = 'SELECTION_FROM_OPTIONS',
  TEXT_INPUT = 'TEXT_INPUT',
  SUBTEMPLATE = 'SUBTEMPLATE',
  SAMPLE_BASIS = 'SAMPLE_BASIS',
  PROPOSAL_BASIS = 'PROPOSAL_BASIS',
}

export class Topic {
  constructor(
    public id: number,
    public title: string,
    public templateId: number,
    public sortOrder: number,
    public isEnabled: boolean
  ) {}
}

export class Question {
  constructor(
    public categoryId: TemplateCategoryId,
    public proposalQuestionId: string,
    public naturalKey: string,
    public dataType: DataType,
    public question: string,
    public config: typeof FieldConfigType
  ) {}
}

export class QuestionTemplateRelation {
  constructor(
    public question: Question,
    public topicId: number,
    public sortOrder: number,
    public config: typeof FieldConfigType,
    public dependency?: FieldDependency
  ) {}
}

export class TemplateStep {
  constructor(public topic: Topic, public fields: QuestionTemplateRelation[]) {}
}

export class TemplateCategory {
  constructor(public categoryId: TemplateCategoryId, public name: string) {}
}

export enum TemplateCategoryId {
  PROPOSAL_QUESTIONARY = 1,
  SAMPLE_DECLARATION,
}

export class FieldCondition {
  constructor(public condition: EvaluatorOperator, public params: any) {}
}

export interface DataTypeSpec {
  readonly: boolean;
}

export class Template {
  constructor(
    public templateId: number,
    public categoryId: number,
    public name: string,
    public description: string,
    public isArchived: boolean
  ) {}
}
