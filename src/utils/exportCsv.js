export function exportCsv(rows, filename = "export.csv") {
    if (!rows || !rows.length) return;
    const headers = Object.keys(rows[0]);

    const escape = (val) => {
        if (val == null) return "";
        const s = String(val).replaceAll('"', '""');
        return /[",\n]/.test(s) ? `"${s}"` : s;
    };

    const lines = [
        headers.join(","),
        ...rows.map((r) => headers.map((h) => escape(r[h])).join(",")),
    ];
    const csv = lines.join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}
