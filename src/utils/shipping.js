import { kmBetween } from "./geo";

export function computeShipping({ customer, branches, rules }) {
  // customer: { coords:{lat,lng}, municipality?:string }
  if (!customer?.coords || !branches?.length || !rules) {
    return { amount: 0, notes: [], earlyOnly: false, branchId: null, branchName: "", distanceKm: 0, expressFee: 0 };
  }

  const nearest = branches.reduce((best, br) => {
    const dist = kmBetween(customer.coords, br.coords);
    return !best || dist < best.dist ? { br, dist } : best;
  }, null);

  const inFreeMunicipality = !!rules.municipalitiesFree?.includes(customer.municipality);
  let amount = 0;
  let notes = [];
  let earlyOnly = false;

  if (inFreeMunicipality || nearest.dist <= (nearest.br.freeRadiusKm ?? 5)) {
    amount = 0; notes.push("Zona cercana / municipio con envío gratis");
  } else if (nearest.dist <= (nearest.br.lowCostRadiusKm ?? 12)) {
    amount = rules.lowCostFlat ?? 39; notes.push("Tarifa de zona cercana");
  } else {
    const extraKm = Math.max(0, nearest.dist - (nearest.br.lowCostRadiusKm ?? 12));
    amount = (rules.lowCostFlat ?? 39) + extraKm * (rules.basePerKm ?? 8);
    notes.push(`Zona extendida (+${extraKm.toFixed(1)} km)`);
    if (nearest.dist >= (rules.earlyOnlyAfterKm ?? 25)) {
      earlyOnly = true; notes.push("Solo entregas tempranas por distancia");
    }
  }

  return {
    branchId: nearest.br.id,
    branchName: nearest.br.name,
    distanceKm: Number(nearest.dist.toFixed(1)),
    amount: Math.round(amount),
    earlyOnly,
    notes,
    expressFee: rules.expressFee ?? 59
  };
}
