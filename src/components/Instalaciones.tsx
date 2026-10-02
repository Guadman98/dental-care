import Image from "next/image";

const detalles = [
  {
    foto: "/images/esterilizacion.jpg",
    alt: "Instrumental odontológico limpio sobre campo estéril junto a la cubeta de lavado",
    titulo: "Instrumental estéril para cada paciente",
    texto: "Lavamos, empacamos y esterilizamos el instrumental después de cada uso.",
  },
  {
    foto: "/images/fotocurado.jpg",
    alt: "Odontóloga preparando la lámpara de fotocurado para una resina",
    titulo: "Resinas que se ven naturales",
    texto: "Endurecemos las resinas con luz LED para restauraciones firmes y del color de tu diente.",
  },
];

export function Instalaciones() {
  return (
    <section id="instalaciones" className="bg-hielo py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <h2 className="text-4xl font-semibold sm:text-5xl">Un espacio pensado para tu tranquilidad</h2>
          <p className="mt-5 text-lg leading-relaxed">
            Consultorios amplios y luminosos, con protocolos de bioseguridad que cumplimos en cada cita, no solo cuando
            alguien mira.
          </p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <figure className="relative min-h-80 overflow-hidden rounded-3xl lg:min-h-[560px]">
            <Image
              src="/images/consultorio.jpg"
              alt="Consultorio de DentalCare con sillón odontológico, escritorio y amplios ventanales"
              fill
              sizes="(min-width: 1024px) 55vw, 100vw"
              className="object-cover"
            />
            <figcaption className="absolute inset-x-4 bottom-4 rounded-2xl bg-white/95 px-5 py-4 text-marino sm:inset-x-auto sm:left-5 sm:max-w-xs">
              <span className="block font-serif text-xl font-semibold">Consultorios cómodos</span>
              <span className="text-sm text-texto">Luz natural, aire acondicionado y equipos modernos.</span>
            </figcaption>
          </figure>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
            {detalles.map((d) => (
              <article key={d.titulo} className="overflow-hidden rounded-3xl bg-white">
                <div className="relative aspect-[16/9]">
                  <Image src={d.foto} alt={d.alt} fill sizes="(min-width: 1024px) 35vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold">{d.titulo}</h3>
                  <p className="mt-1.5 leading-relaxed">{d.texto}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
