import baseContext from '../../buildContext';
import { UserWithRole } from '../../models/User';
import { getCurrentTimestamp } from '../util';

type SEPXLSXData = Array<{
  sheetName: string;
  rows: Array<Array<string | number>>;
}>;

export const defaultSEPDataColumns = [
  'Proposal Short Code',
  'Principal Investigator',
  'Instrument available time',
  'Technical review allocated time',
  'Current rank',
  'TODO',
];

export const collectSEPlXLSXData = async (
  sepId: number,
  callId: number,
  user: UserWithRole
): Promise<{ data: SEPXLSXData; filename: string }> => {
  const instruments = await baseContext.queries.instrument.getInstrumentsBySepId(
    user,
    {
      sepId,
      callId,
    }
  );

  if (!instruments) {
    throw new Error(
      `SEP with ID '${sepId}'/Call with ID '${callId}' not found, or the user has insufficient rights`
    );
  }

  const instrumentsSepsProposalIds = await Promise.all(
    instruments.map(instrument => {
      return baseContext.queries.sep.getSEPProposalsByInstrument(user, {
        sepId,
        callId,
        instrumentId: instrument.id,
      });
    })
  );

  const instrumentsProposals = await Promise.all(
    instrumentsSepsProposalIds.map(sepProposalIds => {
      if (!sepProposalIds) {
        throw new Error('todo');
      }

      return Promise.all(
        sepProposalIds.map(({ proposalId }) =>
          baseContext.queries.proposal.dataSource.get(proposalId)
        )
      );
    })
  );

  // const proposalsReviews = await Promise.all(
  //   instrumentsProposals.map(proposals => {
  //     return Promise.all(
  //       proposals.map(proposal =>
  //         proposal
  //           ? baseContext.queries.review.reviewsForProposal(user, proposal.id)
  //           : null
  //       )
  //     );
  //   })
  // );

  const proposalsTechnicalReviews = await Promise.all(
    instrumentsProposals.map(proposals => {
      return Promise.all(
        proposals.map(proposal =>
          proposal
            ? baseContext.queries.review.technicalReviewForProposal(
                user,
                proposal.id
              )
            : null
        )
      );
    })
  );

  const proposalsPrincipalInvestigators = await Promise.all(
    instrumentsProposals.map(proposals => {
      return Promise.all(
        proposals.map(proposal =>
          proposal
            ? baseContext.queries.user.getBasic(user, proposal.proposerId)
            : null
        )
      );
    })
  );

  const out: SEPXLSXData = [];

  instruments.forEach((instrument, indx) => {
    const proposals = instrumentsProposals[indx];
    // const reviews = proposalsReviews[indx];
    const proposalPrincipalInvestigators =
      proposalsPrincipalInvestigators[indx];
    const technicalReviews = proposalsTechnicalReviews[indx];

    const rows = proposals.map((proposal, pIndx) => {
      const { firstname = '<missing>', lastname = '<missing>' } =
        proposalPrincipalInvestigators[pIndx] ?? {};
      const technicalReview = technicalReviews[pIndx];

      return [
        proposal?.shortCode ?? '<missing>', // Proposal Short Code
        `${firstname} ${lastname}`, // Principal Investigator
        instrument.availabilityTime ?? '<missing>', // Instrument available time
        technicalReview?.timeAllocation ?? '<missing>', // Technical review allocated time
        proposal?.rankOrder ?? '<missing>', // Current rank
        '<TODO>', // hmm
      ];
    });

    out.push({
      sheetName: instrument.name,
      rows,
    });
  });

  //
  return {
    data: out,
    // TODO: decide on filename
    filename: `SEP_${getCurrentTimestamp()}.xlsx`,
  };
};
