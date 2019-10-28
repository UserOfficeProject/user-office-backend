import ProposalMutations from "./ProposalMutations";
import { EventBus } from "../events/eventBus";
import { UserAuthorization } from "../utils/UserAuthorization";
import { reviewDataSource } from "../datasources/mockups/ReviewDataSource";

import { ApplicationEvent } from "../events/applicationEvents";
import {
  dummyProposalSubmitted,
  dummyProposal,
  proposalDataSource
} from "../datasources/mockups/ProposalDataSource";

import {
  userDataSource,
  dummyUser,
  dummyUserNotOnProposal,
  dummyUserOfficer
} from "../datasources/mockups/UserDataSource";
import {
  DataType,
  Topic,
  ProposalTemplateField,
  ProposalTemplate
} from "../models/ProposalModel";
import { User } from "../models/User";
import { isRejection, rejection } from "../rejection";
import { DummyLogger } from "../utils/Logger";
import { bool } from "prop-types";
import { Proposal } from "../models/Proposal";
import ProposalQueries from "../queries/ProposalQueries";

const dummyLogger = new DummyLogger();
const dummyEventBus = new EventBus<ApplicationEvent>();
const dummyProposalDataSource = new proposalDataSource();
const userAuthorization = new UserAuthorization(
  new userDataSource(),
  new reviewDataSource()
);
const proposalMutations = new ProposalMutations(
  dummyProposalDataSource,
  userAuthorization,
  dummyEventBus,
  dummyLogger
);

beforeEach(() => {
  dummyProposalDataSource.init();
});

test("A user on the proposal can update it's title if it is in edit mode", () => {
  return expect(tryUpdateProposal(dummyUser, "1")).resolves.toBe(dummyProposal);
});

test("A user on the proposal can't update it's title if it is not in edit mode", () => {
  return expect(tryUpdateProposal(dummyUser, "2")).resolves.toHaveProperty(
    "reason",
    "NOT_ALLOWED_PROPOSAL_SUBMITTED"
  );
});

test("A userofficer can update a proposal in edit mode", () => {
  return expect(tryUpdateProposal(dummyUserOfficer, "1")).resolves.toBe(
    dummyProposal
  );
});

test("A userofficer can update a proposal in submit mode", () => {
  return expect(tryUpdateProposal(dummyUserOfficer, "2")).resolves.toBe(
    dummyProposalSubmitted
  );
});

test("A user not on a proposal can not update it", () => {
  return expect(
    tryUpdateProposal(dummyUserNotOnProposal, "1")
  ).resolves.toHaveProperty("reason", "NOT_ALLOWED");
});

function tryUpdateProposal(user: User, proposalId: string) {
  return proposalMutations.update(
    user,
    proposalId,
    "New project title",
    "Project abstract description",
    [
      {
        proposal_question_id: "fasta_seq",
        data_type: DataType.TEXT_INPUT,
        value: "ADQLTEEQIAEFKEAFSLFDKDGDGTITTKELG*"
      }
    ],
    undefined,
    undefined
  );
}

test("A userofficer can update topic", async () => {
  const newTopicTitle = "new topic title";
  const topicEnabled = false;
  const topic = await proposalMutations.updateTopic(
    dummyUserOfficer,
    1,
    newTopicTitle,
    topicEnabled
  );
  expect(topic instanceof Topic).toBe(true);
  expect((topic as Topic).topic_title).toEqual(newTopicTitle);
  expect((topic as Topic).is_enabled).toEqual(topicEnabled);
});

test("A user can not update topic", async () => {
  const topic = await proposalMutations.updateTopic(
    dummyUser,
    1,
    "New topic title",
    false
  );

  expect(topic instanceof Topic).toBe(false);
});

test("A userofficer can create topic", async () => {
  let template = await proposalMutations.createTopic(dummyUserOfficer, 0);
  expect(template instanceof ProposalTemplate).toBe(true); // getting back new template
  var numbefOfTopics = (template as ProposalTemplate).steps.length;

  template = await proposalMutations.createTopic(dummyUserOfficer, 1);
  expect((template as ProposalTemplate).steps.length).toEqual(
    numbefOfTopics + 1
  ); // added new one
});

test("A user can not create topic", async () => {
  const topic = await proposalMutations.createTopic(dummyUser, 0);
  expect(topic instanceof ProposalTemplate).toBe(false);
});

test("A userofficer can update fieltTopicRel", async () => {
  const response = await proposalMutations.updateFieldTopicRel(
    dummyUserOfficer,
    1,
    ["has_links_with_industry", "enable_crystallization"]
  );
  expect(isRejection(response)).toEqual(false);
});

test("A user can not update fieltTopicRel", async () => {
  const response = await proposalMutations.updateFieldTopicRel(dummyUser, 1, [
    "has_links_with_industry",
    "enable_crystallization"
  ]);
  expect(isRejection(response)).toEqual(true);
});

//Accept

test("A user officer can accept a proposal ", () => {
  return expect(proposalMutations.accept(dummyUserOfficer, 1)).resolves.toBe(
    dummyProposal
  );
});

test("A non-officer user cannot accept a proposal", () => {
  return expect(proposalMutations.accept(dummyUser, 1)).resolves.toHaveProperty(
    "reason",
    "NOT_USER_OFFICER"
  );
});

test("A non-logged in user cannot accept a proposal", () => {
  return expect(proposalMutations.accept(null, 1)).resolves.toHaveProperty(
    "reason",
    "NOT_LOGGED_IN"
  );
});

test("A user officer can not accept a proposal that does not exist", () => {
  return expect(
    proposalMutations.accept(dummyUserOfficer, -1)
  ).resolves.toHaveProperty("reason", "INTERNAL_ERROR");
});

//Reject

test("A user officer can reject a proposal ", () => {
  return expect(proposalMutations.reject(dummyUserOfficer, 1)).resolves.toBe(
    dummyProposal
  );
});

test("A non-officer user cannot reject a proposal", () => {
  return expect(proposalMutations.reject(dummyUser, 1)).resolves.toHaveProperty(
    "reason",
    "NOT_USER_OFFICER"
  );
});

test("A non-logged in user cannot reject a proposal", () => {
  return expect(proposalMutations.reject(null, 1)).resolves.toHaveProperty(
    "reason",
    "NOT_LOGGED_IN"
  );
});

//Submit

test("A user officer can not reject a proposal that does not exist", () => {
  return expect(
    proposalMutations.submit(dummyUserOfficer, -1)
  ).resolves.toHaveProperty("reason", "INTERNAL_ERROR");
});

test("A user officer can submit a proposal ", () => {
  return expect(proposalMutations.submit(dummyUserOfficer, 1)).resolves.toBe(
    dummyProposal
  );
});

test("A user officer can not submit a proposal that does not exist", () => {
  return expect(
    proposalMutations.submit(dummyUserOfficer, -1)
  ).resolves.toHaveProperty("reason", "INTERNAL_ERROR");
});

test("A user on the proposal can submit a proposal ", () => {
  return expect(proposalMutations.submit(dummyUser, 1)).resolves.toBe(
    dummyProposal
  );
});

test("A user not on the proposal cannot submit a proposal ", () => {
  return expect(
    proposalMutations.submit(dummyUserNotOnProposal, 1)
  ).resolves.toHaveProperty("reason", "NOT_ALLOWED");
});

test("A non-logged in user cannot submit a proposal", () => {
  return expect(proposalMutations.submit(null, 1)).resolves.toHaveProperty(
    "reason",
    "NOT_LOGGED_IN"
  );
});

test("A user can attach files", () => {
  const dummyFileList = ["1020597501870552"];
  return expect(
    proposalMutations.updateFiles(
      dummyUser,
      1,
      "reference_files",
      dummyFileList
    )
  ).resolves.toBe(dummyFileList);
});

test("A non-belonging should not be able to attach files", () => {
  const dummyFileList = ["1020597501870552"];
  return expect(
    proposalMutations.updateFiles(
      dummyUserNotOnProposal,
      1,
      "reference_files",
      dummyFileList
    )
  ).resolves.not.toBe(dummyFileList);
});

test("User must have valid session to attach files", () => {
  return expect(
    proposalMutations.updateFiles(null, 1, "reference_files", [
      "1020597501870552"
    ])
  ).resolves.toHaveProperty("reason", "NOT_LOGGED_IN");
});

test("User can not create field", async () => {
  const response = await proposalMutations.createTemplateField(
    dummyUser,
    1,
    DataType.EMBELLISHMENT
  );
  expect(response).not.toBeInstanceOf(ProposalTemplate);
});

test("User officer can create field", async () => {
  const response = await proposalMutations.createTemplateField(
    dummyUserOfficer,
    1,
    DataType.EMBELLISHMENT
  );
  expect(response).toBeInstanceOf(ProposalTemplateField);

  const newField = response as ProposalTemplateField;
  expect(newField.topic_id).toEqual(1);
  expect(newField.data_type).toEqual(DataType.EMBELLISHMENT);
});

test("User can not delete field", async () => {
  expect(
    proposalMutations.deleteTemplateField(dummyUser, "field_id")
  ).resolves.not.toBeInstanceOf(ProposalTemplate);
});

test("User officer can delete field", async () => {
  expect(
    proposalMutations.deleteTemplateField(dummyUserOfficer, "field_id")
  ).resolves.toBeInstanceOf(ProposalTemplate);
});

test("User officer can delete a proposal", () => {
  return expect(
    proposalMutations.delete(dummyUserOfficer, 1)
  ).resolves.toBeInstanceOf(Proposal);
});

test("User cannot delete a proposal", () => {
  return expect(
    proposalMutations.delete(dummyUserNotOnProposal, 1)
  ).resolves.not.toBeInstanceOf(Proposal);
});

test("Has to be logged in to create proposal", () => {
  return expect(proposalMutations.create(null)).resolves.not.toBeInstanceOf(
    Proposal
  );
});

test("Can create a proposal", () => {
  return expect(proposalMutations.create(dummyUser)).resolves.toBeInstanceOf(
    Proposal
  );
});

test("Proposal title should not be short", () => {
  return expect(
    proposalMutations.update(dummyUser, "1", "a")
  ).resolves.not.toBeInstanceOf(Proposal);
});

test("Officer can update topic order", async () => {
  return expect(
    proposalMutations.updateTopicOrder(dummyUserOfficer, [1, 3, 2])
  ).resolves.toBeTruthy();
});

test("User can not update topic order", async () => {
  const result = await proposalMutations.updateTopicOrder(dummyUser, [1, 3, 2]);
  return expect(isRejection(result)).toBeTruthy();
});
