import 'reflect-metadata';
import { container } from 'tsyringe';

import {
  dummyUser,
  dummyUserWithRole,
} from '../datasources/mockups/UserDataSource';
import QuestionaryQueries from '../queries/QuestionaryQueries';
import { isRejection } from '../rejection';
import QuestionaryMutations from './QuestionaryMutations';

let mutations: QuestionaryMutations;
let queries: QuestionaryQueries;

const getDummyUsersProposal = async () => {
  const USER_QUESTIONARY_ID = 1;
  const steps = await queries.getQuestionarySteps(
    dummyUserWithRole,
    USER_QUESTIONARY_ID
  );
  const firstStep = steps![0];
  const firstAnswer = firstStep.fields[0];

  return { firstAnswer, firstStep, questionaryId: USER_QUESTIONARY_ID };
};

beforeEach(() => {
  mutations = container.resolve(QuestionaryMutations);
  queries = container.resolve(QuestionaryQueries);
});

it('User should answer topic questions', async () => {
  const {
    firstAnswer,
    firstStep,
    questionaryId,
  } = await getDummyUsersProposal();
  const result = await mutations.answerTopic(dummyUser, {
    questionaryId,
    topicId: firstStep.topic.id,
    answers: [
      {
        questionId: firstAnswer.question.id,
        value: JSON.stringify({ value: 'answer' }),
      },
    ],
  });
  expect(isRejection(result)).toBeFalsy();
});

it('User should update question', async () => {
  const NEW_ANSWER = 'NEW_ANSWER';
  const {
    firstAnswer,
    firstStep,
    questionaryId,
  } = await getDummyUsersProposal();
  const result = await mutations.updateAnswer(dummyUser, {
    questionaryId,
    answer: {
      questionId: firstAnswer.question.id,
      value: NEW_ANSWER,
    },
  });
  expect(isRejection(result)).toBeFalsy();
});
