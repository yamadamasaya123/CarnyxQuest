export interface FastingProtocol {
  name: string;
  description: string;
  durationHours: number;
}

export interface FastingSession {
  id: string;
  profileId: string;
  protocolName: string;
  startedAt: string;
  endedAt?: string;
  targetDurationHours: number;
  isCompleted: boolean;
  xpEarned: number;
}

export interface FastingMilestone {
  id: string;
  fastingSessionId: string;
  hoursReached: number;
  milestoneName: string;
}
