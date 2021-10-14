import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { ProposalDataSource } from '../datasources/ProposalDataSource';
import { QuestionaryDataSource } from '../datasources/QuestionaryDataSource';
import { SampleDataSource } from '../datasources/SampleDataSource';
import { TemplateDataSource } from '../datasources/TemplateDataSource';
import { Authorized, EventBus } from '../decorators';
import { Event } from '../events/event.enum';
import { rejection } from '../models/Rejection';
import { TemplateGroupId } from '../models/Template';
import { UserWithRole } from '../models/User';
import { CreateSampleInput } from '../resolvers/mutations/CreateSampleMutations';
import { UpdateSampleArgs } from '../resolvers/mutations/UpdateSampleMutation';
import { SampleAuthorization } from '../utils/SampleAuthorization';
import { UserAuthorization } from '../utils/UserAuthorization';

@injectable()
export default class SampleMutations {
  constructor(
    @inject(Tokens.SampleDataSource) private sampleDataSource: SampleDataSource,
    @inject(Tokens.QuestionaryDataSource)
    private questionaryDataSource: QuestionaryDataSource,
    @inject(Tokens.TemplateDataSource)
    private templateDataSource: TemplateDataSource,
    @inject(Tokens.ProposalDataSource)
    private proposalDataSource: ProposalDataSource,
    @inject(Tokens.SampleAuthorization)
    private sampleAuthorization: SampleAuthorization,
    @inject(Tokens.UserAuthorization)
    private userAuthorization: UserAuthorization
  ) {}

  @Authorized()
  async createSample(agent: UserWithRole | null, args: CreateSampleInput) {
    if (!agent) {
      return rejection('Can not create sample because user is not authorized', {
        agent,
        args,
      });
    }

    const template = await this.templateDataSource.getTemplate(args.templateId);
    if (template?.groupId !== TemplateGroupId.SAMPLE) {
      return rejection('Can not create sample with this template', {
        agent,
        args,
      });
    }

    const proposal = await this.proposalDataSource.get(args.proposalPk);
    if (!proposal) {
      return rejection('Can not create sample because proposal was not found', {
        agent,
        args,
      });
    }

    if (
      (await this.userAuthorization.hasAccessRights(agent, proposal)) === false
    ) {
      return rejection(
        'Can not create sample because of insufficient permissions',
        { agent, args }
      );
    }

    if (proposal.submitted && args.isPostProposalSubmission !== true) {
      return rejection(
        'Can not create sample because proposal is already submitted',
        { agent, args }
      );
    }

    return this.questionaryDataSource
      .create(agent.id, args.templateId)
      .then((questionary) => {
        return this.sampleDataSource.create(
          args.title,
          agent.id,
          args.proposalPk,
          questionary.questionaryId,
          args.questionId,
          args.isPostProposalSubmission
        );
      })
      .catch((error) => {
        return rejection(
          'Can not create sample because an error occurred',
          { agent, args },
          error
        );
      });
  }

  @EventBus(Event.PROPOSAL_SAMPLE_REVIEW_SUBMITTED)
  async updateSample(agent: UserWithRole | null, args: UpdateSampleArgs) {
    const hasWriteRights = await this.sampleAuthorization.hasWriteRights(
      agent,
      args.sampleId
    );

    if (hasWriteRights === false) {
      return rejection(
        'Can not update sample because of insufficient permissions',
        { agent, args }
      );
    }

    // Thi makes sure administrative fields can be only updated by user with the right role
    if (args.safetyComment || args.safetyStatus) {
      const canAdministerSample =
        this.userAuthorization.isUserOfficer(agent) ||
        (await this.userAuthorization.isSampleSafetyReviewer(agent));
      if (canAdministerSample === false) {
        delete args.safetyComment;
        delete args.safetyStatus;
      }
    }

    return this.sampleDataSource
      .updateSample(args)
      .then((sample) => sample)
      .catch((error) => {
        return rejection(
          'Can not update sample because an error occurred',
          { agent, args },
          error
        );
      });
  }

  async deleteSample(agent: UserWithRole | null, sampleId: number) {
    const sample = await this.sampleDataSource.getSample(sampleId);
    if (sample === null) {
      return rejection(
        'Could not delete sample because sample with specified ID does not exist',
        { agent, sampleId }
      );
    }
    const hasWriteRights = await this.sampleAuthorization.hasWriteRights(
      agent,
      sample
    );

    if (hasWriteRights === false) {
      return rejection(
        'Can not delete sample because of insufficient permissions',
        { agent, sampleId }
      );
    }

    const proposal = await this.proposalDataSource.get(sample.proposalPk);
    if (proposal!.submitted && sample.isPostProposalSubmission === false) {
      return rejection(
        'Could not delete sample because associated proposal is already submitted',
        { agent, sampleId }
      );
    }

    return this.sampleDataSource
      .delete(sampleId)
      .then((sample) => sample)
      .catch((error) => {
        return rejection(
          'Can not delete sample because an error occurred',
          { agent, sampleId },
          error
        );
      });
  }

  @Authorized()
  async cloneSample(
    agent: UserWithRole | null,
    sampleId: number,
    title?: string
  ) {
    if (!agent) {
      return rejection(
        'Could not clone sample because user is not authorized',
        { agent, sampleId }
      );
    }
    if (!(await this.sampleAuthorization.hasWriteRights(agent, sampleId))) {
      return rejection(
        'Could not clone sample because of insufficient permissions',
        { agent, sampleId }
      );
    }

    try {
      let clonedSample = await this.sampleDataSource.cloneSample(sampleId);
      clonedSample = await this.sampleDataSource.updateSample({
        sampleId: clonedSample.id,
        title: title ? title : `Copy of ${clonedSample.title}`,
      });

      return clonedSample;
    } catch (error) {
      return rejection(
        'Could not clone sample because an error occurred',
        { agent, sampleId },
        error
      );
    }
  }
}
