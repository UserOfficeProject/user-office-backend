import 'reflect-metadata';
import { container } from 'tsyringe';

import { dummyUserWithRole } from '../datasources/mockups/UserDataSource';
import QuestionaryQueries from './QuestionaryQueries';

let questionaryQueries: QuestionaryQueries;

beforeEach(() => {
  questionaryQueries = container.resolve(QuestionaryQueries);
});

test('Get questionary should succeed for authorized user', () => {
  return expect(
    questionaryQueries.getQuestionary(dummyUserWithRole, 1)
  ).resolves.not.toBe(null);
});

test('Get blank questionary steps should succeed for authorized user', () => {
  return expect(
    questionaryQueries.getBlankQuestionarySteps(dummyUserWithRole, 1)
  ).resolves.not.toBe(null);
});
