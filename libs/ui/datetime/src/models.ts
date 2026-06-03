export interface GuiTime {
  hours: number; // 0..23
  minutes: number; // 0..59
}

export interface GuiDateRange {
  start: Date | null;
  end: Date | null;
}
