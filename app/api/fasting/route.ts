import { NextResponse } from "next/server";
import { fetchCurrentActiveSession, startFastingSession, stopFastingSession } from "../../../lib/fasting";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const profileId = searchParams.get("profileId");

    if (!profileId) {
      return NextResponse.json({ success: false, error: "Missing user identification index" }, { status: 400 });
    }

    const session = await fetchCurrentActiveSession(profileId);
    return NextResponse.json({ success: true, session });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { action, profileId, protocolName, targetHours, sessionId, save } = await req.json();

    if (action === "start") {
      if (!profileId || !protocolName || !targetHours) {
        return NextResponse.json({ success: false, error: "Deficient start parameters" }, { status: 400 });
      }
      const session = await startFastingSession(profileId, protocolName, targetHours);
      return NextResponse.json({ success: true, session });
    } else if (action === "stop") {
      if (!sessionId) {
        return NextResponse.json({ success: false, error: "Missing session index to end" }, { status: 400 });
      }
      const session = await stopFastingSession(sessionId, save !== false);
      return NextResponse.json({ success: true, session });
    }

    return NextResponse.json({ success: false, error: "Action parameter not supported" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
