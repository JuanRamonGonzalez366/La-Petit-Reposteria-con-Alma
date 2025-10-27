import { useEffect, useState } from "react";
import { db } from "../../lib/firebase";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { useAuth } from "../../auth/AuthProvider";
import { toast } from "react-toastify";

export default function UsersAdmin() {
  const { role } = useAuth();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snap) => {
      setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const changeRole = async (id, newRole) => {
    try {
      await updateDoc(doc(db, "users", id), { role: newRole });
      toast.success("Rol actualizado");
    } catch (e) {
      console.error(e);
      toast.error("No se pudo actualizar el rol");
    }
  };

  if (role !== "admin") return <p className="p-6">Acceso restringido</p>;

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="font-display text-3xl text-wine mb-6">Usuarios</h1>
      <div className="bg-white border border-rose/30 rounded-2xl p-4">
        {users.map(u => (
          <div key={u.id} className="flex items-center justify-between border-b last:border-none py-3">
            <div>
              <div className="font-semibold text-wine">{u.name || u.email}</div>
              <div className="text-sm text-wineDark/70">{u.email}</div>
            </div>
            <select
              value={u.role}
              onChange={(e) => changeRole(u.id, e.target.value)}
              className="border rounded-lg px-3 py-1"
            >
              <option value="user">user</option>
              <option value="colaborador">colaborador</option>
              <option value="admin">admin</option>
            </select>
          </div>
        ))}
      </div>
    </main>
  );
}
