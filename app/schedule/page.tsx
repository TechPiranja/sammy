"use client";

import Scheduler from "../../src/sections/Scheduler";
import { platforms } from "../../src/data/mockData";
import { useSchedule } from "../../src/context/ScheduleContext";

export default function SchedulePage() {
  const { scheduledPosts, createPost } = useSchedule();

  return (
    <Scheduler
      platforms={platforms}
      scheduledPosts={scheduledPosts}
      onCreatePost={createPost}
    />
  );
}
