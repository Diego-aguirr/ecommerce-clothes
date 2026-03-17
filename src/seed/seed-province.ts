// data/provinces.ts
export interface Province {
  name: string;
  id: string; // Código ISO o abreviación
}

export const provinces: Province[] = [
  { name: "Buenos Aires", id: "BA" },
  { name: "Catamarca", id: "CT" },
  { name: "Chaco", id: "CH" },
  { name: "Chubut", id: "CB" },
  { name: "Ciudad Autónoma de Buenos Aires", id: "CABA" },
  { name: "Córdoba", id: "CD" },
  { name: "Corrientes", id: "CR" },
  { name: "Entre Ríos", id: "ER" },
  { name: "Formosa", id: "FO" },
  { name: "Jujuy", id: "JY" },
  { name: "La Pampa", id: "LP" },
  { name: "La Rioja", id: "LR" },
  { name: "Mendoza", id: "MZ" },
  { name: "Misiones", id: "MI" },
  { name: "Neuquén", id: "NQ" },
  { name: "Río Negro", id: "RN" },
  { name: "Salta", id: "SA" },
  { name: "San Juan", id: "SJ" },
  { name: "San Luis", id: "SL" },
  { name: "Santa Cruz", id: "SC" },
  { name: "Santa Fe", id: "SF" },
  { name: "Santiago del Estero", id: "SE" },
  { name: "Tierra del Fuego", id: "TF" },
  { name: "Tucumán", id: "TU" },
];
