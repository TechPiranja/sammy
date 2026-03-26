"use client";

import CalendarPage from "../../src/sections/CalendarPage";
import { platforms } from "../../src/data/mockData";
import { useSchedule } from "../../src/context/ScheduleContext";

export default function CalendarRoute() {
  const { scheduledPosts } = useSchedule();

  return <CalendarPage platforms={platforms} scheduledPosts={scheduledPosts} />;
}
