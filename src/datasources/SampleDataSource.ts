import { Sample } from '../models/Sample';
import { Rejection } from '../rejection';
import { UpdateSampleArgs } from '../resolvers/mutations/UpdateSampleMutation';
import { SamplesArgs } from '../resolvers/queries/SamplesQuery';

export interface SampleDataSource {
  delete(sampleId: number): Promise<Sample>;
  clone(sampleId: number): Promise<Sample | Rejection>;
  updateSample(
    args: UpdateSampleArgs & { proposalId?: number }
  ): Promise<Sample>;
  create(
    title: string,
    creatorId: number,
    proposalId: number,
    questionaryId: number,
    questionId: string
  ): Promise<Sample>;
  getSample(sampleId: number): Promise<Sample | null>;
  getSamplesByCallId(callId: number): Promise<Sample[]>;
  getSamples(args: SamplesArgs): Promise<Sample[]>;
  getSamplesByShipmentId(shipmentId: number): Promise<Sample[]>;
}
