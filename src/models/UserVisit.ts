export class UserVisit {
  constructor(
    public userId: number,
    public visitId: number,
    public registrationQuestionaryId: number | null,
    public trainingExpiryDate: Date | null
  ) {}
}
