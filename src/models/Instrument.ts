export class Instrument {
  constructor(
    public id: number,
    public name: string,
    public shortCode: string,
    public description: string
  ) {}
}

export class InstrumentWithAvailabilityTime extends Instrument {
  constructor(
    public id: number,
    public name: string,
    public shortCode: string,
    public description: string,
    public availabilityTime: number,
    public submitted: boolean
  ) {
    super(id, name, shortCode, description);
  }
}

export class CallHasInstrument {
  constructor(
    public callId: number,
    public instrumentId: number,
    public availabilityTime: number,
    public submitted: boolean
  ) {}
}
