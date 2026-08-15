import { ICalEventBusyStatus } from "ical-generator";
import type { QueryDataSourceParameters } from "@notionhq/client/build/src/api-endpoints";

const one_week_ago = new Date(new Date().setDate(new Date().getDate() - 7))
  .toISOString()
  .split("T")[0];

export default {
  filter: {
    property: "Date",
    date: { on_or_after: one_week_ago },
  },
  dateProperty: "Date",
  titleProperty: "Task",
  addressProperty: "Address",
  busy: ICalEventBusyStatus.FREE,
} as {
  filter: Readonly<QueryDataSourceParameters["filter"]>;
  dateProperty: Readonly<string>;
  titleProperty: Readonly<string>;
  addressProperty: Readonly<string>;
  busy: Readonly<ICalEventBusyStatus>;
};
