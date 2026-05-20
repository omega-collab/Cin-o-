export interface ProductionDay {
  id: string;
  label: string; // "J12"
  date: string; // ISO date
  location: string;
  scenes: string[]; // ["Scène 23", "Scène 24"]
  startTime: string;
  endTime: string;
  period: "day" | "night";
  status: "confirmed" | "pending" | "cancelled";
}

export const PRODUCTION_DAYS: ProductionDay[] = [
  {
    id: "j12",
    label: "J12",
    date: new Date().toISOString().split("T")[0]!,
    location: "EXT. PORT DE MARSEILLE",
    scenes: ["Scène 23", "Scène 24", "Scène 25"],
    startTime: "07:00",
    endTime: "19:00",
    period: "day",
    status: "confirmed",
  },
  {
    id: "j13",
    label: "J13",
    date: new Date(Date.now() + 86400000).toISOString().split("T")[0]!,
    location: "INT. ENTREPÔT A3",
    scenes: ["Scène 26", "Scène 27"],
    startTime: "20:00",
    endTime: "06:00",
    period: "night",
    status: "confirmed",
  },
  {
    id: "j14",
    label: "J14",
    date: new Date(Date.now() + 172800000).toISOString().split("T")[0]!,
    location: "EXT. PLATEAU CARRIÈRES",
    scenes: ["Scène 28", "Scène 29", "Scène 30"],
    startTime: "06:30",
    endTime: "18:30",
    period: "day",
    status: "pending",
  },
  {
    id: "j15",
    label: "J15",
    date: new Date(Date.now() + 259200000).toISOString().split("T")[0]!,
    location: "INT. STUDIO 2",
    scenes: ["Scène 31", "Scène 32"],
    startTime: "19:30",
    endTime: "05:30",
    period: "night",
    status: "pending",
  },
  {
    id: "j16",
    label: "J16",
    date: new Date(Date.now() + 345600000).toISOString().split("T")[0]!,
    location: "EXT. RUE OBERKAMPF",
    scenes: ["Scène 33"],
    startTime: "08:00",
    endTime: "20:00",
    period: "day",
    status: "confirmed",
  },
];
