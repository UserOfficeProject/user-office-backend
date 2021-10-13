import { ScheduledEventCore } from '../../models/ScheduledEventCore';
import { ScheduledEventDataSource } from '../ScheduledEventDataSource';

export default class ScheduledEventDataSourceMock
  implements ScheduledEventDataSource
{
  getScheduledEvent(id: number): Promise<ScheduledEventCore | null> {
    throw new Error('Method not implemented.');
  }
}
