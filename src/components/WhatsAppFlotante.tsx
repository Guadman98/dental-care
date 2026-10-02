import { clinica } from "@/content/clinica";
import { IconoRed } from "./IconosRedes";

export function WhatsAppFlotante() {
  return (
    <a
      href={clinica.whatsappHref}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribir a DentalCare por WhatsApp"
      className="fixed right-4 bottom-4 z-50 grid size-14 place-items-center rounded-full bg-[#1fa855] text-white shadow-lg shadow-black/20 transition-transform hover:scale-105 sm:right-6 sm:bottom-6"
    >
      <IconoRed nombre="WhatsApp" className="size-7" />
    </a>
  );
}
