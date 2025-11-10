// Haversine simple (línea recta)
function kmBetween(a, b) {
  const R = 6371;
  const dLat = (b.lat - a.lat) * Math.PI/180;
  const dLng = (b.lng - a.lng) * Math.PI/180;
  const lat1 = a.lat * Math.PI/180;
  const lat2 = b.lat * Math.PI/180;
  const x = Math.sin(dLat/2)**2 + Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLng/2)**2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

export function computeShipping({ customer, branches, rules, drivingKm }) {
  // encontrar sucursal más cercana por línea recta (rápido)
  const arr = branches.map((br) => {
    const dist = kmBetween(customer.coords, br.coords);
    return { br, dist };
  });
  arr.sort((a,b)=> a.dist - b.dist);
  const nearest = arr[0];
  const distanceKm = Number((drivingKm ?? nearest.dist).toFixed(1));

  let amount = 0;
  const notes = [];
  let earlyOnly = false;

  // reglas ejemplo:
  // - si municipality del cliente está en municipalitiesFree -> 0
  // - si dentro de freeRadiusKm de la sucursal -> 0
  // - si dentro de lowCostRadiusKm -> tarifa baja
  // - si fuera de eso -> basePerKm * distancia (cap con farLimitKm si quieres)
  const branch = nearest.br;

  const inFreeMunicipality = Array.isArray(rules.municipalitiesFree) &&
    rules.municipalitiesFree.includes((customer.municipality || "").trim());

  if (inFreeMunicipality) {
    amount = 0;
    notes.push("Municipio con envío gratuito");
  } else if (distanceKm <= (branch.freeRadiusKm || 0)) {
    amount = 0;
    notes.push("Dentro de radio de envío gratuito");
  } else if (distanceKm <= (branch.lowCostRadiusKm || 0)) {
    amount = Number(rules.lowCostFlat || 0);
    notes.push("Tarifa de envío baja");
  } else {
    const km = rules.farLimitKm ? Math.min(distanceKm, rules.farLimitKm) : distanceKm;
    amount = Math.round((rules.basePerKm || 8) * km);
    notes.push("Tarifa por distancia");
  }

  // zona lejana -> solo temprano
  if (rules.earlyOnlyAfterKm && distanceKm >= rules.earlyOnlyAfterKm) {
    earlyOnly = true;
  }

  // express fee desde reglas
  const expressFee = Number(rules.expressFee || 0);

  // por si quieres recalcular si corriges distancia fuera
  const recalcAmountFromKm = (km) => {
    if (inFreeMunicipality) return 0;
    if (km <= (branch.freeRadiusKm || 0)) return 0;
    if (km <= (branch.lowCostRadiusKm || 0)) return Number(rules.lowCostFlat || 0);
    const capped = rules.farLimitKm ? Math.min(km, rules.farLimitKm) : km;
    return Math.round((rules.basePerKm || 8) * capped);
  };

  return {
    branchId: branch.id,
    branchName: branch.name,
    distanceKm,
    amount,
    expressFee,
    earlyOnly,
    notes,
    recalcAmountFromKm
  };
}
