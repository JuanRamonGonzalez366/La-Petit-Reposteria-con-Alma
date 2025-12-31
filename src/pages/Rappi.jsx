import React, { useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { RAPPI_BRANCHES_FALLBACK } from "../data/rappiBranches";

const pickRappiUrl = (b) =>
    b?.rappiUrl || b?.rappiURL || b?.rappiLink || b?.rappi || "";

    export default function Rappi() {
    const [loading, setLoading] = useState(false);
    const [branches, setBranches] = useState([]);
    const [err, setErr] = useState("");

    useEffect(() => {
        (async () => {
        try {
            setLoading(true);
            setErr("");
            const snap = await getDocs(collection(db, "branches"));
            const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
            setBranches(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error(e);
            setErr("No se pudieron cargar las sucursales.");
            setBranches([]);
        } finally {
            setLoading(false);
        }
        })();
    }, []);

    const items = useMemo(() => {
        const fromFirestore = (branches || []).map((b) => ({
        id: b.id,
        name: b.name || b.branchName || `Sucursal ${b.id}`,
        municipality: b.municipality || "",
        url: pickRappiUrl(b) || "",
        }));

        const merged = [...fromFirestore];
        for (const fb of RAPPI_BRANCHES_FALLBACK) {
        const exists = merged.find((x) => x.id === fb.id);
        if (!exists) merged.push({ ...fb, municipality: "" });
        else if (!exists.url && fb.url) exists.url = fb.url;
        }
        return merged;
    }, [branches]);

    return (
        <main className="bg-cream min-h-[calc(100vh-80px)] pt-[96px] px-4 sm:px-6 lg:px-12 pb-10">
        <h1 className="font-display text-3xl text-wine mb-2">Pide por Rappi</h1>
        <p className="text-wineDark/70 mb-6">
            Elige tu sucursal y abre el link en Rappi. (El cobro y la entrega se gestionan allá.)
        </p>

        {err ? <p className="text-red mb-4">{err}</p> : null}

        <div className="bg-white rounded-xl border border-rose/30 p-4 shadow-sm">
            {loading ? (
            <p className="text-wineDark/70">Cargando…</p>
            ) : items.length === 0 ? (
            <p className="text-wineDark/70">
                No hay sucursales configuradas. Agrega <code>rappiUrl</code> en Firestore o llena
                <code> src/config/rappiBranches.js</code>.
            </p>
            ) : (
            <ul className="divide-y divide-rose/20">
                {items.map((b) => {
                const disabled = !b.url;
                return (
                    <li key={b.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                        <div className="text-wine font-semibold truncate">{b.name}</div>
                        {b.municipality ? (
                        <div className="text-xs text-wineDark/60">{b.municipality}</div>
                        ) : null}
                    </div>
                    <a
                        href={disabled ? undefined : b.url}
                        onClick={(e) => disabled && e.preventDefault()}
                        target="_blank"
                        rel="noreferrer"
                        className={
                        "text-sm px-4 py-2 rounded-lg transition " +
                        (disabled
                            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                            : "bg-emerald-600 text-white hover:opacity-90")
                        }
                    >
                        {disabled ? "Link pendiente" : "Abrir Rappi"}
                    </a>
                    </li>
                );
                })}
            </ul>
            )}
        </div>
        </main>
    );
}
