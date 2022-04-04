export class Facility {
  constructor(public id: number, public name: string) {}
}

export class FacilityWithAvailabilityTime extends Facility {
  constructor(
    public id: number,
    public name: string,
    public availabilityTime: number
  ) {
    super(id, name);
  }
}
