import { Contacto } from "@/components/Contacto";
import { Equipo } from "@/components/Equipo";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Instalaciones } from "@/components/Instalaciones";
import { Testimonios } from "@/components/Testimonios";
import { Tratamientos } from "@/components/Tratamientos";
import { WhatsAppFlotante } from "@/components/WhatsAppFlotante";

export default function Inicio() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Tratamientos />
        <Equipo />
        <Instalaciones />
        <Testimonios />
        <Contacto />
      </main>
      <Footer />
      <WhatsAppFlotante />
    </>
  );
}
