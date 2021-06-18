import {
  Instrument,
  InstrumentHasProposals,
  InstrumentWithAvailabilityTime,
} from '../models/Instrument';
import { ProposalPKsWithNextStatus } from '../models/Proposal';
import { BasicUserDetails } from '../models/User';
import { CreateInstrumentArgs } from '../resolvers/mutations/CreateInstrumentMutation';

export interface InstrumentDataSource {
  create(args: CreateInstrumentArgs): Promise<Instrument>;
  getInstrument(instrumentId: number): Promise<Instrument | null>;
  getInstruments(
    first?: number,
    offset?: number
  ): Promise<{ totalCount: number; instruments: Instrument[] }>;
  getUserInstruments(userId: number): Promise<Instrument[]>;
  getInstrumentsByCallId(
    callIds: number[]
  ): Promise<InstrumentWithAvailabilityTime[]>;
  getCallsByInstrumentId(
    instrumentId: number,
    callIds: number[]
  ): Promise<{ callId: number; instrumentId: number }[]>;
  update(instrument: Instrument): Promise<Instrument>;
  delete(instrumentId: number): Promise<Instrument>;
  assignProposalsToInstrument(
    proposalPKs: number[],
    instrumentId: number
  ): Promise<ProposalPKsWithNextStatus>;
  removeProposalsFromInstrument(proposalPKs: number[]): Promise<boolean>;
  assignScientistsToInstrument(
    scientistIds: number[],
    instrumentId: number
  ): Promise<boolean>;
  removeScientistFromInstrument(
    scientistId: number,
    instrumentId: number
  ): Promise<boolean>;
  getInstrumentScientists(instrumentId: number): Promise<BasicUserDetails[]>;
  getInstrumentByProposalPK(proposalPK: number): Promise<Instrument | null>;
  getInstrumentsBySepId(
    sepId: number,
    callId: number
  ): Promise<InstrumentWithAvailabilityTime[]>;
  setAvailabilityTimeOnInstrument(
    callId: number,
    instrumentId: number,
    availabilityTime: number
  ): Promise<boolean>;
  submitInstrument(
    proposalPKs: number[],
    instrumentId: number
  ): Promise<InstrumentHasProposals>;
  hasInstrumentScientistInstrument(
    userId: number,
    instrumentId: number
  ): Promise<boolean>;
  hasInstrumentScientistAccess(
    userId: number,
    instrumentId: number,
    proposalPK: number
  ): Promise<boolean>;
  isProposalInstrumentSubmitted(proposalPK: number): Promise<boolean>;
}
