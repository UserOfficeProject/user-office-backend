import moment from 'moment';

import { ScheduledEventCore } from '../../models/ScheduledEventCore';
import { ScheduledEventsFilter } from '../../resolvers/queries/ScheduledEventsQuery';
import { ScheduledEventDataSource } from '../ScheduledEventDataSource';
import {
  ScheduledEventBookingType,
  ProposalBookingStatusCore,
} from './../../resolvers/types/ProposalBooking';

export default class ScheduledEventDataSourceMock
  implements ScheduledEventDataSource
{
  scheduledEvents: ScheduledEventCore[];
  constructor() {
    this.init();
  }

  public init() {
    this.scheduledEvents = [
      new ScheduledEventCore(
        1,
        ScheduledEventBookingType.USER_OPERATIONS,
        moment().toDate(),
        moment().add(2, 'days').toDate(),
        1,
        1,
        ProposalBookingStatusCore.ACTIVE,
        1
      ),
      new ScheduledEventCore(
        2,
        ScheduledEventBookingType.USER_OPERATIONS,
        moment().toDate(),
        moment().add(2, 'days').toDate(),
        2,
        2,
        ProposalBookingStatusCore.ACTIVE,
        1
      ),
    ];
  }

  async getScheduledEvent(id: number): Promise<ScheduledEventCore | null> {
    return this.scheduledEvents.find((esi) => esi.id === id) || null;
  }

  async getScheduledEvents(
    filter: ScheduledEventsFilter
  ): Promise<ScheduledEventCore[]> {
    return this.scheduledEvents
      .filter((esi) => {
        if (filter.endsBefore) {
          return esi.endsAt < filter.endsBefore;
        }

        return true;
      })
      .filter((esi) => {
        if (filter.endsAfter) {
          return esi.endsAt > filter.endsAfter;
        }

        return true;
      });
  }
}
