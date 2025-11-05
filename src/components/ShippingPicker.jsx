import React, { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { computeShipping } from "../utils/shipping";
import { mxn } from "../utils/money";

export default function ShippingPicker({ onChange }) {
  const [branches, setBranches] = useState([]);
  const [rules, setRules] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [shipping, setShipping] = useState(null);
  const [express, setExpress] = useState(false);

  useEffect(() => {
    (async () => {
      const snap = await getDocs(collection(db, "branches"));
      setBranches(snap.docs.map(d => ({ id: d.id, ...d.data() })));

      const r = await getDoc(doc(db, "shippingRules", "default"));
      setRules(r.exists() ? r.data() : null);
    })();
  }, []);

  const geolocate = () => {
    if (!navigator.geolocation) return alert("Geolocalización no disponible");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCustomer({ coords, municipality: "" }); // si usas geocoding, llena municipality
      },
      () => alert("No se pudo obtener ubicación")
    );
  };

  useEffect(() => {
    if (customer && branches.length && rules) {
      const sh = computeShipping({ customer, branches, rules });
      setShipping(sh);
      onChange?.({ ...sh, express, expressFee: express ? sh.expressFee : 0 });
    }
    // eslint-disable-next-line
  }, [customer, branches, rules]);

  useEffect(() => {
    if (shipping) onChange?.({ ...shipping, express, expressFee: express ? shipping.expressFee : 0 });
    // eslint-disable-next-line
  }, [express]);

  return (
    <div className="p-3 rounded-lg border border-rose/40 bg-white space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-wine">Entrega</h3>
        <button onClick={geolocate} className="text-sm underline text-wine">Usar mi ubicación</button>
      </div>

      {!shipping ? (
        <p className="text-sm text-wineDark/70">Selecciona ubicación para calcular envío.</p>
      ) : (
        <>
          <div className="text-sm text-wineDark/80 space-y-1">
            <div><span className="font-medium">Sucursal asignada:</span> {shipping.branchName}</div>
            <div><span className="font-medium">Distancia aprox:</span> {shipping.distanceKm} km</div>
            <div><span className="font-medium">Envío:</span> {mxn(shipping.amount)}</div>
            {shipping.notes?.length ? <div className="text-xs text-wineDark/60">{shipping.notes.join(" · ")}</div> : null}
            {shipping.earlyOnly && <div className="text-xs text-red">Zona lejana: solo horarios tempranos</div>}
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={express} onChange={(e) => setExpress(e.target.checked)} />
            <span>Entrega express (+{mxn(shipping.expressFee)})</span>
          </label>
        </>
      )}
    </div>
  );
}
