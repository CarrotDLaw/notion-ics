import { ICalEventBusyStatus } from 'ical-generator';
import type { QueryDatabaseParameters } from '@notionhq/client/build/src/api-endpoints';

export default {
	// filter: {
	// 	and: [
	// 		{ property: 'Status', select: { does_not_equal: 'Completed' } },
	// 		{ property: 'Status', select: { does_not_equal: 'Nope' } },
	// 		{ property: 'Type', select: { equals: 'Task' } }
	// 	]
	// },
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
