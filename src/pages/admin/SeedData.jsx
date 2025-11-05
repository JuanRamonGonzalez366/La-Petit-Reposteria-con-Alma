import React, { useState } from "react";
import { db } from "../../lib/firebase";
import { doc, setDoc } from "firebase/firestore";

export default function SeedData() {
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState("");

  // <<< EDITABLE: ajusta aquí si quieres otros valores >>>
    const rules = {
    basePerKm: 8,
    lowCostFlat: 39,
    earlyOnlyAfterKm: 25,
    farLimitKm: 40,
    expressFee: 59,
    nightCutoff: "18:30",
    municipalitiesFree: ["Guadalajara"],
    };

    const branches = [
  {
    id: "el-salto",
    name: "Sucursal El Salto",
    municipality: "El Salto",
    freeRadiusKm: 5,
    lowCostRadiusKm: 12,
    coords: { lat: 20.511631205337878, lng: -103.18330092883548 },
  },
  {
    id: "obsidiana",
    name: "Sucursal Obsidiana",
    municipality: "Guadalajara",
    freeRadiusKm: 5,
    lowCostRadiusKm: 12,
    coords: { lat: 20.637467746744694, lng: -103.40414434232912 },
  },
  {
    id: "minerva",
    name: "Sucursal Minerva",
    municipality: "Guadalajara",
    freeRadiusKm: 5,
    lowCostRadiusKm: 12,
    coords: { lat: 20.674819084202625, lng: -103.38912945767086 },
  },
  {
    id: "tlaquepaque",
    name: "Sucursal Tlaquepaque",
    municipality: "San Pedro Tlaquepaque",
    freeRadiusKm: 5,
    lowCostRadiusKm: 12,
    coords: { lat: 20.642207800899136, lng: -103.31165988650629 },
  },
  {
    id: "rio-nilo",
    name: "Sucursal Río Nilo",
    municipality: "Guadalajara",
    freeRadiusKm: 5,
    lowCostRadiusKm: 12,
    coords: { lat: 20.64541025658767, lng: -103.29959904232912 },
  },
  {
    id: "revolucion",
    name: "Sucursal Revolución",
    municipality: "Guadalajara",
    freeRadiusKm: 5,
    lowCostRadiusKm: 12,
    coords: { lat: 20.65552924222063, lng: -103.31771544232913 },
  },
  {
    id: "san-luis",
    name: "Sucursal San Luis",
    municipality: "Guadalajara",
    freeRadiusKm: 5,
    lowCostRadiusKm: 12,
    coords: { lat: 20.697111728839637, lng: -103.36046111718981 },
  },
  {
    id: "zapopan",
    name: "Sucursal Zapopan",
    municipality: "Zapopan",
    freeRadiusKm: 5,
    lowCostRadiusKm: 12,
    coords: { lat: 20.72226233873481, lng: -103.38845753268926 },
  },
  {
    id: "patria",
    name: "Sucursal Patria",
    municipality: "Zapopan",
    freeRadiusKm: 5,
    lowCostRadiusKm: 12,
    coords: { lat: 20.687827025899836, lng: -103.4196315558228 },
  },
];


    const upsell = [
    { id: "velas-basicas", title: "Velas básicas", price: 35, active: true, img: "" },
    { id: "velas-numeros", title: "Vela número", price: 25, active: true, img: "" },
    ];

    const run = async () => {
    try {
        setLoading(true);
        setMsg("");

        await setDoc(doc(db, "shippingRules", "default"), rules, { merge: true });
        for (const b of branches) {
        await setDoc(doc(db, "branches", b.id), b, { merge: true });
        }
        for (const u of upsell) {
        await setDoc(doc(db, "upsellProducts", u.id), u, { merge: true });
        }

        setMsg("✅ Datos sembrados correctamente.");
    } catch (e) {
        console.error(e);
        setMsg("🔥 Error sembrando datos. Revisa consola.");
    } finally {
        setLoading(false);
    }
    };

    return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow">
        <h1 className="text-wine text-xl font-semibold mb-2">Seed Firestore</h1>
        <p className="text-sm text-wine/80 mb-4">
        Debes iniciar sesión como <strong>admin</strong>.
        </p>
        <button
        onClick={run}
        disabled={loading}
        className="bg-wine text-cream px-4 py-2 rounded hover:opacity-90 disabled:opacity-50"
        >
        {loading ? "Sembrando..." : "Sembrar datos"}
        </button>
        {msg && <p className="mt-3 text-sm">{msg}</p>}
    </div>
    );
}
