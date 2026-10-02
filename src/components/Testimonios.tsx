import Image from "next/image";
import { Star } from "lucide-react";
import { testimonios } from "@/content/clinica";

export function Testimonios() {
  return (
    <section id="testimonios" className="bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="max-w-2xl text-4xl font-semibold sm:text-5xl">Lo que cuentan nuestros pacientes</h2>

        <ul className="mt-12 grid gap-5 md:grid-cols-2">
          {testimonios.map((t) => (
            <li key={t.nombre}>
              <figure className="flex h-full flex-col rounded-3xl border border-hielo-200 p-7 sm:p-8">
                <div className="flex gap-0.5 text-amber-500" aria-label="5 de 5 estrellas" role="img">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} className="size-4 fill-current" aria-hidden />
                  ))}
                </div>
                <blockquote className="mt-4 flex-1 font-serif text-xl leading-relaxed text-marino">
                  “{t.texto}”
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-4">
                  <Image src={t.foto} alt="" width={56} height={56} className="size-14 rounded-full object-cover" />
                  <div>
                    <p className="font-semibold text-marino">{t.nombre}</p>
                    <p className="text-sm">{t.tratamiento}</p>
                  </div>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
