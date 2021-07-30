import { Rejection } from '../../models/Rejection';
import { RiskAssessment } from '../../models/RiskAssessment';
import { RiskAssessmentsFilter } from '../../queries/RiskAssessmentQueries';
import { CreateRiskAssessmentArgs } from '../../resolvers/mutations/CreateRiskAssesssment';
import { UpdateRiskAssessmentArgs } from '../../resolvers/mutations/UpdateRiskAssessmentMutation';
import { RiskAssessmentDataSource } from '../RiskAssessmentDataSource';
import database from './database';
import { createRiskAssessmentObject, RiskAssessmentRecord } from './records';

class PostgresRiskAssessmentDataSource implements RiskAssessmentDataSource {
  createRiskAssessment(
    { proposalPk }: CreateRiskAssessmentArgs,
    creatorId: number
  ): Promise<RiskAssessment> {
    return database('risk_assessments')
      .insert({
        proposalPk: proposalPk,
        creatorUserId: creatorId,
      })
      .returning('*')
      .then((riskAssessment) => createRiskAssessmentObject(riskAssessment[0]));
  }

  getRiskAssessment(riskAssessmentId: number): Promise<RiskAssessment | null> {
    return database('risk_assessments')
      .select('*')
      .where({ risk_assessment_id: riskAssessmentId })
      .first()
      .then((riskAssessment) =>
        riskAssessment ? createRiskAssessmentObject(riskAssessment) : null
      );
  }

  async getRiskAssessments(
    filter: RiskAssessmentsFilter
  ): Promise<RiskAssessment[]> {
    const { proposalPk } = filter;

    return database('risk_assessments')
      .select('*')
      .modify((query) => {
        if (proposalPk) {
          query.where({ proposal_pk: proposalPk });
        }
      })
      .then((riskAssessments: RiskAssessmentRecord[]) =>
        riskAssessments.map((ra) => createRiskAssessmentObject(ra))
      );
  }

  async updateRiskAssessment(
    args: UpdateRiskAssessmentArgs
  ): Promise<RiskAssessment | Rejection> {
    return database('risk_assessments')
      .update({ questionary_id: args.questionaryId, status: args.status })
      .where({ risk_assessment_id: args.riskAssessmentId })
      .returning('*')
      .then(async (riskAssessments) => {
        return createRiskAssessmentObject(riskAssessments[0]);
      });
  }

  deleteRiskAssessment(
    riskAssessmentId: number
  ): Promise<RiskAssessment | Rejection> {
    return database('risk_assessments')
      .where({ riskAssessment_id: riskAssessmentId })
      .delete()
      .returning('*')
      .then((riskAssessments) => {
        return createRiskAssessmentObject(riskAssessments[0]);
      });
  }
}

export default PostgresRiskAssessmentDataSource;
