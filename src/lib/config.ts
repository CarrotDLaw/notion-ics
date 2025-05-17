import { ICalEventBusyStatus } from 'ical-generator';
import type { QueryDatabaseParameters } from '@notionhq/client/build/src/api-endpoints';

export default {
	filter: {
		or: [
			{ property: 'Status', status: { equals: 'Unstarted' } },
			{ property: 'Status', status: { equals: 'Tentative' } },
			{ property: 'Status', status: { equals: 'Suspended' } },
			{ property: 'Status', status: { equals: 'Ongoing' } },
		]
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
