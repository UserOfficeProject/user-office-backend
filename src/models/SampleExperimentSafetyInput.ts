import 'reflect-metadata';

export class SampleExperimentSafetyInput {
  constructor(
    public sampleEsiId: number,
    public esiId: number,
    public sampleId: number,
    public questionaryId: number,
    public isSubmitted: boolean
  ) {}
}
