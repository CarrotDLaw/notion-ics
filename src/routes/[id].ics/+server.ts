import ical from 'ical-generator';
import { Client } from '@notionhq/client';
import type { QueryDatabaseResponse } from '@notionhq/client/build/src/api-endpoints';

import config from '$lib/config';
import { ACCESS_KEY, NOTION_TOKEN } from '$env/static/private';
import type { RequestHandler } from './$types';

export const trailingSlash = 'never';

const notion = new Client({ auth: NOTION_TOKEN });

export const GET: RequestHandler = async ({ params, url }) => {
	const secret = url.searchParams.get('secret');
	if (secret !== ACCESS_KEY) {
		return new Response('Forbidden', { status: 403 });
	}

	const { id } = params;

	const databaseMetadata = await notion.databases.retrieve({ database_id: id });

	const databaseEntries = [];
	let query: QueryDatabaseResponse | { has_more: true; next_cursor: undefined } = {
		has_more: true,
		next_cursor: undefined
	};
	while (query.has_more) {
		query = await notion.databases.query({
			database_id: id,
			page_size: 100,
			start_cursor: query.next_cursor,
			filter: config.filter
		});
		databaseEntries.push(...query.results);
	}

	const filtered: {
		title: string;
		date: { start: string; end: string | null; time_zone: string | null };
		location?: string;
	}[] = databaseEntries.flatMap((object) => {
		if (object.properties[config.dateProperty].date === null) {
			return [];
		}
		
		let location: string | undefined = undefined;
        const locationProp = object.properties[config.locationProperty];
        if (
            locationProp &&
            'rich_text' in locationProp &&
            Array.isArray(locationProp.rich_text) &&
            locationProp.rich_text.length > 0
        ) {
            location = locationProp.rich_text[0].plain_text;
        }

		return [
			{
				title: object.properties[config.titleProperty].title[0].text.content,
				date: object.properties[config.dateProperty].date,
				location: location,
			}
		];
	});

	const calendar = ical({
		name: databaseMetadata.title[0].text.content,
		prodId: { company: 'CarrotDLaw', language: 'EN', product: 'notion-ics' }
	});
	filtered.forEach((event) => {
		const isTimedEvent = event.date.start.includes('T');

        if (isTimedEvent) {
            const start = new Date(event.date.start);
            const eventOptions: Record<string, any> = {
                start,
                allDay: false,
                summary: event.title,
                location: event.location,
                busystatus: config.busy
            };

            // Set the end to the provided value or default to the start time
            if (event.date.end) {
                eventOptions.end = new Date(event.date.end);
            } else {
                eventOptions.end = start;
            }
            calendar.createEvent(eventOptions);
        } else {
            const start = new Date(event.date.start);
            const eventOptions: Record<string, any> = {
                start,
                allDay: true,
                summary: event.title,
                location: event.location,
                busystatus: config.busy
            };

            if (event.date.end) {
                eventOptions.end = new Date(Date.parse(event.date.end));
            } else {
                eventOptions.end = start;
            }
            calendar.createEvent(eventOptions);
        }
	});

	return new Response(calendar.toString(), {
		status: 200,
		headers: {
			'content-type': 'text/calendar'
		}
	});
};
