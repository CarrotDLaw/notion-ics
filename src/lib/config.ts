import { ICalEventBusyStatus } from 'ical-generator';
import type { QueryDatabaseParameters } from '@notionhq/client/build/src/api-endpoints';

const today = new Date().toISOString().split('T')[0];

export default {
	filter: {
		property: 'Date',
        date: { on_or_after: today }
	},
	dateProperty: 'Date',
	titleProperty: 'Task',
	locationProperty: 'Location',

	busy: ICalEventBusyStatus.FREE
} as {
	filter: Readonly<QueryDatabaseParameters['filter']>;
	dateProperty: Readonly<string>;
	titleProperty: Readonly<string>;
	locationProperty: Readonly<string>;
	busy: Readonly<ICalEventBusyStatus>;
};
