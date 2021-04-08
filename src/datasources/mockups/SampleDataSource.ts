import { Sample, SampleStatus } from '../../models/Sample';
import { rejection, Rejection } from '../../rejection';
import { UpdateSampleArgs } from '../../resolvers/mutations/UpdateSampleMutation';
import { SamplesArgs } from '../../resolvers/queries/SamplesQuery';
import { SampleDataSource } from '../SampleDataSource';

export class SampleDataSourceMock implements SampleDataSource {
  samples: Sample[];
  constructor() {
    this.init();
  }

  public init() {
    this.samples = [
      new Sample(
        1,
        'title',
        1,
        1,
        1,
        'sampleQuestionId',
        SampleStatus.LOW_RISK,
        'safety comment',
        new Date()
      ),
    ];
  }
  async getSample(sampleId: number): Promise<Sample | null> {
    return this.samples.find((sample) => sample.id === sampleId) || null;
  }

  async getSamples(_args: SamplesArgs): Promise<Sample[]> {
    return this.samples;
  }

  async getSamplesByCallId(_callId: number): Promise<Sample[]> {
    return this.samples;
  }
  async create(
    title: string,
    creatorId: number,
    proposalId: number,
    questionaryId: number,
    questionId: string
  ): Promise<Sample> {
    return new Sample(
      1,
      title,
      creatorId,
      proposalId,
      questionaryId,
      questionId,
      SampleStatus.PENDING_EVALUATION,
      '',
      new Date()
    );
  }

  async delete(sampleId: number): Promise<Sample> {
    return this.samples.splice(
      this.samples.findIndex((sample) => sample.id == sampleId),
      1
    )[0];
  }

  async updateSample(
    args: UpdateSampleArgs & { proposalId?: number }
  ): Promise<Sample> {
    const sample = await this.getSample(args.sampleId);
    if (!sample) {
      throw new Error('Sample not found');
    }
    sample.title = args.title || sample.title;
    sample.safetyComment = args.safetyComment || sample.safetyComment;
    sample.safetyStatus = args.safetyStatus || sample.safetyStatus;

    return sample;
  }

  async cloneSample(sampleId: number): Promise<Sample | Rejection> {
    const sample = await this.getSample(sampleId);
    if (!sample) {
      return rejection('NOT_FOUND');
    }

    return sample;
  }

  async getSamplesByShipmentId(_shipmentId: number): Promise<Sample[]> {
    return this.samples;
  }
}
