"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { scheduledPostsSeed } from "../data/mockData";
import type { ScheduledPost, UploadRequest } from "../types";
import { uploadShortVideo } from "../services/integration";

type ScheduleContextType = {
  scheduledPosts: ScheduledPost[];
  createPost: (payload: UploadRequest) => Promise<void>;
};

const ScheduleContext = createContext<ScheduleContextType | undefined>(
  undefined,
);

type Props = {
  children: ReactNode;
};

export function ScheduleProvider({ children }: Props) {
  const [scheduledPosts, setScheduledPosts] =
    useState<ScheduledPost[]>(scheduledPostsSeed);

  const createPost = async (payload: UploadRequest) => {
    await uploadShortVideo(payload);
    const newPost: ScheduledPost = {
      id: crypto.randomUUID?.() ?? String(Date.now()),
      platforms: payload.platforms,
      title: payload.title,
      description: payload.description,
      scheduledAt: payload.scheduledAt ?? new Date().toISOString(),
      status: "scheduled",
    };
    setScheduledPosts((prev) => [newPost, ...prev]);
  };

  const value = useMemo(
    () => ({
      scheduledPosts,
      createPost,
    }),
    [scheduledPosts],
  );

  return (
    <ScheduleContext.Provider value={value}>
      {children}
    </ScheduleContext.Provider>
  );
}

export function useSchedule() {
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error("useSchedule must be used within a ScheduleProvider");
  }

  return context;
}
