export default function ProductCard({ title, desc, price,  img }) {
    return (
      <article className="bg-white rounded-2xl shadow border border-rose/30 overflow-hidden hover:shadow-lg transition">
        <img src={img} alt={title} className="h-56 w-full object-cover" />
        <div className="p-5">
          <h3 className="font-display text-xl text-wine">{title}</h3>
          <p className="text-sm text-wineDark/70 mt-2">{desc}</p>
          {price && <p className="mt-3 font-semibold text-wine">${price}</p>}
          <button className="mt-4 bg-redBrand text-white px-5 py-2 rounded-lg font-semibold hover:opacity-90 transition">
            Ver más
          </button>
        </div>
      </article>
    )
  }
  