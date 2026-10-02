import type { Metadata } from "next";
import { Figtree, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const titulos = Source_Serif_4({
  variable: "--font-titulos",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const cuerpo = Figtree({
  variable: "--font-cuerpo",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DentalCare | Sonrisas que se sienten bien",
  description:
    "Clínica odontológica en el centro de Palmira, Valle del Cauca: odontología general y estética, ortodoncia, odontopediatría e implantes. Agenda tu cita en línea.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${titulos.variable} ${cuerpo.variable}`}>
      <body>{children}</body>
    </html>
  );
}
