import { ScheduledEventCore } from '../models/ScheduledEventCore';
import { UpdateScheduledEventArgs } from '../resolvers/mutations/UpdateScheduledEventCoreMutation';
import { ScheduledEventsCoreFilter } from '../resolvers/queries/ScheduledEventsCoreQuery';

export interface ScheduledEventDataSource {
  getScheduledEvents(
    filter: ScheduledEventsCoreFilter
  ): Promise<ScheduledEventCore[]>;
  getScheduledEvent(id: number): Promise<ScheduledEventCore | null>;
  updateScheduledEvent(
    args: UpdateScheduledEventArgs
  ): Promise<ScheduledEventCore>;
}
