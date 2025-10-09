import ical from "ical-generator";
import { Client } from "@notionhq/client";
import type {
  DatabaseObjectResponse,
  QueryDataSourceResponse,
} from "@notionhq/client/build/src/api-endpoints";

import config from "$lib/config";
import { ACCESS_KEY, NOTION_TOKEN } from "$env/static/private";
import type { RequestHandler } from "./$types";

export const trailingSlash = "never";

const notion = new Client({ auth: NOTION_TOKEN, notionVersion: "2025-09-03" });

export const GET: RequestHandler = async ({ params, url }) => {
  const secret = url.searchParams.get("secret");
  if (secret !== ACCESS_KEY) {
    return new Response("Forbidden", { status: 403 });
  }

  const { id } = params;

  const databaseMetadata = (await notion.databases.retrieve({
    database_id: id,
  })) as DatabaseObjectResponse;
  const dataSource = databaseMetadata.data_sources[0];

  const databaseEntries = [];
  let query:
    | QueryDataSourceResponse
    | { has_more: true; next_cursor: undefined } = {
    has_more: true,
    next_cursor: undefined,
  };
  while (query.has_more) {
    query = await notion.dataSources.query({
      data_source_id: dataSource.id,
      page_size: 100,
      start_cursor: query.next_cursor,
      filter: config.filter,
    });
    databaseEntries.push(...query.results);
  }

  const filtered: {
    id: string;
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
      "rich_text" in locationProp &&
      Array.isArray(locationProp.rich_text) &&
      locationProp.rich_text.length > 0
    ) {
      location = locationProp.rich_text[0].plain_text;
    }

    return [
      {
        id: object.id,
        title: object.properties[config.titleProperty].title[0].text.content,
        date: object.properties[config.dateProperty].date,
        location: location,
      },
    ];
  });

  const calendar = ical({
    name: dataSource.name,
    prodId: { company: "CarrotDLaw", language: "EN", product: "notion-ics" },
  });
  filtered.forEach((event) => {
    const isTimedEvent = event.date.start.includes("T");

    if (isTimedEvent) {
      const eventOptions = {
        start: new Date(event.date.start),
        end: event.date.end
          ? new Date(event.date.end)
          : new Date(event.date.start),
        allDay: false,
        summary: event.title,
        location: event.location,
        busystatus: config.busy,
      };

      calendar.createEvent(eventOptions);
    } else {
      const eventOptions = {
        start: new Date(event.date.start),
        end: new Date(event.date.start),
        allDay: true,
        summary: event.title,
        location: event.location,
        busystatus: config.busy,
        id: event.id,
      };

      if (event.date.end) {
        const end = new Date(event.date.end);
        end.setDate(end.getDate() + 1);
        eventOptions.end = end;
      } else {
        const end = new Date(event.date.start);
        end.setDate(end.getDate() + 1);
        eventOptions.end = end;
      }

      calendar.createEvent(eventOptions);
    }
  });

  return new Response(calendar.toString(), {
    status: 200,
    headers: {
      "content-type": "text/calendar",
    },
  });
};
