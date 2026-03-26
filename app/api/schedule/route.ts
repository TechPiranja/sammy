import { NextResponse } from "next/server";
import { scheduledPostsSeed } from "../../../src/data/mockData";

const backendBase = process.env.BACKEND_API_BASE_URL;

const toTargetUrl = (path: string) => {
  if (!backendBase) return null;
  return new URL(path, backendBase).toString();
};

export async function GET() {
  const target = toTargetUrl("/schedule");

  if (!target) {
    return NextResponse.json(scheduledPostsSeed);
  }

  const upstream = await fetch(target, {
    method: "GET",
    cache: "no-store",
  });

  const payload = await upstream.json();
  return NextResponse.json(payload, { status: upstream.status });
}
