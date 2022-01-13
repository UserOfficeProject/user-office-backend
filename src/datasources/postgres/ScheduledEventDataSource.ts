import { ScheduledEventCore } from '../../models/ScheduledEventCore';
import { UpdateScheduledEventArgs } from '../../resolvers/mutations/UpdateScheduledEventCoreMutation';
import { ScheduledEventsCoreFilter } from '../../resolvers/queries/ScheduledEventsCoreQuery';
import { ScheduledEventDataSource } from '../ScheduledEventDataSource';
import database from './database';
import { createScheduledEventObject, ScheduledEventRecord } from './records';

export default class PostgresScheduledEventDataSource
  implements ScheduledEventDataSource
{
  async getScheduledEvents(
    filter: ScheduledEventsCoreFilter
  ): Promise<ScheduledEventCore[]> {
    return database
      .select('*')
      .from('scheduled_events')
      .where((query) => {
        if (filter.endsBefore) {
          query.where('ends_at', '<', filter.endsBefore);
        }
        if (filter.endsAfter) {
          query.where('ends_at', '>', filter.endsAfter);
        }
      })
      .then((rows: ScheduledEventRecord[]) =>
        rows.map((row) => createScheduledEventObject(row))
      );
  }
  async getScheduledEvent(id: number): Promise<ScheduledEventCore | null> {
    return database
      .select('*')
      .from('scheduled_events')
      .where('scheduled_event_id', id)
      .first()
      .then((row: ScheduledEventRecord) =>
        row ? createScheduledEventObject(row) : null
      );
  }

  async updateScheduledEvent(
    args: UpdateScheduledEventArgs
  ): Promise<ScheduledEventCore> {
    return database('scheduled_events')
      .update({
        is_shipment_declared: args.isShipmentDeclared,
      })
      .where({ scheduled_event_id: args.scheduledEventId })
      .returning('*')
      .then((row: ScheduledEventRecord[]) =>
        createScheduledEventObject(row[0])
      );
  }
}
