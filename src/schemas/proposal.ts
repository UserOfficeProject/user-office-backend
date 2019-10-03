export const typeDefs = `
    extend type Query {
        proposal(id: ID!): Proposal
        proposals(filter: String, first: Int, offset: Int): ProposalQueryResult
        proposalTemplate: ProposalTemplate
    }

    extend type Mutation {
        createProposal: ProposalMutationResult
        updateProposal(id:ID!, title: String, abstract: String, answers:[ProposalAnswerInput], status: Int, users: [Int]): ProposalMutationResult
        updateProposalFiles(proposal_id:ID!, question_id:ID!, files:[String]): FilesMutationResult
        approveProposal(id: Int!): ProposalMutationResult
        submitProposal(id: Int!): ProposalMutationResult
        rejectProposal(id: Int!): ProposalMutationResult
        createTopic(title: String): TopicMutationResult
        updateTopic(id:Int!, title: String, isEnabled: Boolean): TopicMutationResult
        updateFieldTopicRel(topic_id:Int!, field_ids:[String]): BooleanMutationResult
    }

    type ProposalQueryResult {
        proposals: [Proposal]
        totalCount: Int
    }

    type ProposalMutationResult {
        proposal: Proposal
        error: String
    }

    type TopicMutationResult {
        topic: Topic
        error: String
    }

    type BooleanMutationResult {
        result: Boolean
        error: String
    }

    type Proposal {
        id: Int
        title: String
        abstract: String
        status: Int
        users: [User!]
        proposer: Int
        questionary: ProposalTemplate
        created: String
        updated: String
        reviews: [Review]
    }

    type ProposalTemplate {
        topics: [Topic]
    }

    type Topic {
        topic_id:Int,
        topic_title: String,
        sort_order:Int,
        fields:[ProposalTemplateField]
    }

    type ProposalTemplateField {
        proposal_question_id: String,
        data_type: String,
        question: String,
        value: String,
        config: String,
        dependencies: [FieldDependency]
    }

    type FieldDependency {
        proposal_question_dependency: String,
        proposal_question_id: String,
        condition: String,
    }

    input ProposalAnswerInput {
        proposal_question_id: ID!,
        data_type:String,
        value: String
    }

    input TopicInput {
        topic_id:Int,
        topic_title: String
    }

    type ProposalAnswer {
        proposal_question_id: ID!,
        answer: String
    }
`;
