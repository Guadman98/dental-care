// Contenido central de la clínica. La landing y, más adelante, el sistema de
// citas leen de aquí: dentistas y tratamientos son la misma fuente de verdad.

import { horarioSede, type Dia, type HorarioSemanal } from "@/lib/horarios";

export const clinica = {
  nombre: "DentalCare",
  lema: "Sonrisas que se sienten bien.",
  lemaSecundario: "Cuidado dental que se nota.",
  direccion: "Calle 28 # 30 - 12, Barrio El Centro",
  ciudad: "Palmira, Valle del Cauca",
  mapaHref:
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent("Calle 28 # 30 - 12, Palmira, Valle del Cauca, Colombia"),
  zonaHoraria: "America/Bogota",
  telefono: "315 626 6520",
  telefonoHref: "tel:+573156266520",
  whatsappHref:
    "https://wa.me/573156266520?text=" +
    encodeURIComponent("Hola DentalCare, quiero agendar una cita."),
  email: "notificaciones.aplicaciones.gam@gmail.com",
  // TODO: reemplazar "#" por las URLs reales cuando la clínica abra sus redes.
  redes: [
    { nombre: "Facebook", href: "#" },
    { nombre: "Instagram", href: "#" },
    { nombre: "TikTok", href: "#" },
  ],
} as const;

export type Dentista = {
  slug: string;
  nombre: string;
  titulo: "Dra." | "Dr.";
  area: string;
  experienciaAnios: number;
  especialidades: string[];
  bio: string;
  horario: HorarioSemanal;
};

// Atajo para escribir varios días con la misma franja.
const dias = (lista: Dia[], inicio: string, fin: string): HorarioSemanal =>
  Object.fromEntries(lista.map((d) => [d, [{ inicio, fin }]]));

export const dentistas: Dentista[] = [
  {
    slug: "laura-martinez",
    titulo: "Dra.",
    nombre: "Laura Martínez",
    area: "Odontología General y Estética",
    experienciaAnios: 8,
    especialidades: ["Odontología general", "Estética dental", "Diseño de sonrisa", "Blanqueamiento"],
    bio: "Apasionada por crear sonrisas saludables y naturales. Se caracteriza por brindar una atención cercana, cuidadosa y personalizada a cada paciente.",
    horario: { ...dias([1, 2, 3, 4, 5], "08:00", "17:00"), ...dias([6], "08:00", "12:00") },
  },
  {
    slug: "sebastian-ramirez",
    titulo: "Dr.",
    nombre: "Sebastián Ramírez",
    area: "Ortodoncia y Ortopedia Maxilar",
    experienciaAnios: 10,
    especialidades: ["Ortodoncia", "Alineadores transparentes", "Ortopedia maxilar"],
    bio: "Trabaja con brackets tradicionales, estéticos y alineadores transparentes, buscando siempre soluciones cómodas y adaptadas a cada paciente.",
    horario: { ...dias([1, 3, 5], "09:00", "18:00"), ...dias([2], "13:00", "19:00") },
  },
  {
    slug: "valentina-torres",
    titulo: "Dra.",
    nombre: "Valentina Torres",
    area: "Odontopediatría",
    experienciaAnios: 6,
    especialidades: ["Odontopediatría", "Prevención", "Sellantes", "Educación en higiene oral"],
    bio: "Con un enfoque cálido y amigable, convierte cada visita de niños y adolescentes en una experiencia tranquila y positiva.",
    horario: { ...dias([2, 3, 4, 5], "08:00", "16:00"), ...dias([6], "08:00", "14:00") },
  },
  {
    slug: "andres-castillo",
    titulo: "Dr.",
    nombre: "Andrés Castillo",
    area: "Implantología y Rehabilitación Oral",
    experienciaAnios: 12,
    especialidades: ["Implantes dentales", "Coronas", "Prótesis", "Rehabilitación oral"],
    bio: "Combina funcionalidad, estética y tecnología para devolver a los pacientes la confianza y comodidad al sonreír.",
    horario: { ...dias([1, 2, 3, 4], "07:30", "16:30"), ...dias([5], "07:30", "13:00") },
  },
];

export type Tratamiento = {
  slug: string;
  nombre: string;
  descripcion: string;
  duracion: string;
  // Minutos que ocupa la cita en la agenda (lo usará el sistema de reservas).
  citaMinutos: number;
  dentistas: string[];
  // Solo aparece en el formulario de reservas, no en la lista de la landing.
  soloReserva?: boolean;
};

export const tratamientos: Tratamiento[] = [
  {
    slug: "valoracion",
    nombre: "Consulta de valoración",
    descripcion: "Revisamos tu boca, resolvemos tus dudas y te proponemos un plan de tratamiento.",
    duracion: "30 minutos",
    citaMinutos: 30,
    dentistas: ["laura-martinez", "sebastian-ramirez", "valentina-torres", "andres-castillo"],
    soloReserva: true,
  },
  {
    slug: "limpieza",
    nombre: "Limpieza dental",
    descripcion: "Retiramos placa y sarro para mantener encías sanas y prevenir caries.",
    duracion: "30–60 minutos",
    citaMinutos: 60,
    dentistas: ["laura-martinez", "valentina-torres"],
  },
  {
    slug: "resina",
    nombre: "Calza o resina",
    descripcion: "Restauramos el diente con resina del mismo color, para que no se note.",
    duracion: "30–60 minutos por diente",
    citaMinutos: 60,
    dentistas: ["laura-martinez", "valentina-torres"],
  },
  {
    slug: "blanqueamiento",
    nombre: "Blanqueamiento en clínica",
    descripcion: "Aclaramos varios tonos tu sonrisa en una sola sesión, de forma segura.",
    duracion: "60–90 minutos",
    citaMinutos: 90,
    dentistas: ["laura-martinez"],
  },
  {
    slug: "extraccion",
    nombre: "Extracción simple",
    descripcion: "Retiramos la pieza con anestesia local y te explicamos los cuidados posteriores.",
    duracion: "20–60 minutos",
    citaMinutos: 60,
    dentistas: ["andres-castillo", "laura-martinez"],
  },
  {
    slug: "conducto",
    nombre: "Tratamiento de conducto",
    descripcion: "Salvamos el diente limpiando y sellando su interior cuando el nervio está afectado.",
    duracion: "1–2 citas de 60–90 minutos",
    citaMinutos: 90,
    dentistas: ["laura-martinez"],
  },
  {
    slug: "ortodoncia",
    nombre: "Ortodoncia",
    descripcion: "Brackets o alineadores transparentes para alinear tus dientes y mejorar la mordida.",
    duracion: "Aproximadamente 12–24 meses",
    citaMinutos: 45,
    dentistas: ["sebastian-ramirez"],
  },
  {
    slug: "implante",
    nombre: "Implante dental",
    descripcion: "Reemplazamos dientes perdidos con una raíz de titanio y una corona natural.",
    duracion: "De 3 a 6 meses o más, por la cicatrización",
    citaMinutos: 60,
    dentistas: ["andres-castillo"],
  },
];

// Testimonios FICTICIOS para la demostración. Reemplazar por reseñas reales
// (con autorización del paciente) antes de publicar el sitio.
export const testimonios = [
  {
    nombre: "Mariana G.",
    tratamiento: "Diseño de sonrisa",
    foto: "/images/testimonios/paciente-1.jpg",
    texto: "Llegué con mucho miedo y la Dra. Laura me explicó cada paso. El resultado se ve tan natural que nadie cree que me hice algo.",
  },
  {
    nombre: "Kevin A.",
    tratamiento: "Ortodoncia",
    foto: "/images/testimonios/paciente-2.jpg",
    texto: "Llevo un año con alineadores y el cambio es enorme. Los controles siempre son puntuales y sin esperas largas.",
  },
  {
    nombre: "Daniela P.",
    tratamiento: "Odontopediatría",
    foto: "/images/testimonios/paciente-3.jpg",
    texto: "Mi hija ahora pide ir al odontólogo. La Dra. Valentina tiene una paciencia increíble con los niños.",
  },
  {
    nombre: "Santiago L.",
    tratamiento: "Implante dental",
    foto: "/images/testimonios/paciente-4.jpg",
    texto: "Volví a comer y a sonreír con tranquilidad. El Dr. Andrés me acompañó durante todo el proceso.",
  },
];

// Horario general de la sede, derivado de las agendas de los especialistas.
export const horarioClinica = horarioSede(dentistas.map((d) => d.horario));

export const nombreCompleto = (d: Dentista) => `${d.titulo} ${d.nombre}`;
