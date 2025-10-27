export default function StyleGuide() {
    return (
      <main className="min-h-screen bg-crema text-vinoOscuro p-10 font-sans">
        <h1 className="font-display text-4xl mb-6 text-vinoOscuro">Guía de Estilo Petit Plaisir</h1>
  
        {/* Paleta de colores */}
        <section className="mb-12">
          <h2 className="text-2xl font-display mb-4 text-vino">Colores de Marca</h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {[
              { name: "Crema Pastel", color: "bg-crema" },
              { name: "Rosa Empolvado", color: "bg-rosa" },
              { name: "Vino Frambuesa", color: "bg-vino" },
              { name: "Vino Oscuro", color: "bg-vinoOscuro" },
              { name: "Marfil Blanco", color: "bg-marfil" },
            ].map((c) => (
              <div key={c.name} className="flex flex-col items-center">
                <div className={`${c.color} w-24 h-24 rounded-xl shadow-suave`} />
                <p className="mt-2 text-sm text-center">{c.name}</p>
              </div>
            ))}
          </div>
        </section>
  
        {/* Tipografías */}
        <section className="mb-12">
          <h2 className="text-2xl font-display mb-4 text-vino">Tipografías</h2>
          <p className="font-display text-3xl">Playfair Display – títulos y frases</p>
          <p className="font-sans text-lg mt-2">
            Poppins – cuerpo de texto y subtítulos
          </p>
        </section>
  
        {/* Botones */}
        <section>
          <h2 className="text-2xl font-display mb-4 text-vino">Botones</h2>
          <div className="flex gap-4 flex-wrap">
            <button className="bg-vino text-marfil px-6 py-3 rounded-xl font-semibold hover:bg-vinoOscuro transition">
              Primario
            </button>
            <button className="bg-rosa text-vinoOscuro px-6 py-3 rounded-xl font-semibold hover:bg-vino transition">
              Secundario
            </button>
            <button className="border border-vino px-6 py-3 rounded-xl hover:bg-vino hover:text-marfil transition">
              Contorno
            </button>
          </div>
        </section>
      </main>
    )
  }
  