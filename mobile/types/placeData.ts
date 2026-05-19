export interface Place1Data {
  builtCentury: string;
  builder: string;
  architecturalStyle: string;
  heightMeters: number;
  wallThicknessMeters: number;
  renovations: { year: string; ruler: string }[];
  about: string;
  funFact: string;
}

export interface Place2Data {
  foundedYear: string;
  commissionedBy: string;
  minaretHeight: number;
  columns: number;
  renovationDates: string[];
  inscriptions: string[];
  about: string;
  uniqueFeature: string;
}

export interface Place3Data {
  period: string;
  capacityCubicMeters: number;
  depthMeters: number;
  floorAreaSqm: number;
  feedType: string;
  buildingMaterial: string;
  about: string;
  funFact: string;
}

export interface PlaceDataById {
  place1: Place1Data;
  place2: Place2Data;
  place3: Place3Data;
}
