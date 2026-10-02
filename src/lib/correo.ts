import "server-only";
import path from "node:path";
import nodemailer from "nodemailer";
import { clinica, dentistas, nombreCompleto, tratamientos } from "@/content/clinica";
import { fechaLarga, fechaLocal, horaLocal } from "./fechas";
import { formatoHora } from "./horarios";

// Envío por Gmail con contraseña de aplicación. Si no está configurado, las
// citas siguen funcionando y solo se omite el correo.
const usuario = process.env.GMAIL_USER;
const transporte =
  usuario && process.env.GMAIL_APP_PASSWORD
    ? nodemailer.createTransport({ service: "gmail", auth: { user: usuario, pass: process.env.GMAIL_APP_PASSWORD } })
    : null;

// Logo: con el sitio publicado (https) se enlaza la imagen pública; en local
// no hay URL accesible desde Gmail, así que se adjunta incrustada (cid).
const sitio = process.env.NEXT_PUBLIC_SITIO_URL ?? "";
const logoPublico = sitio.startsWith("https://");
const LOGO_SRC = logoPublico ? `${sitio}/images/logo-correo.png` : "cid:logo-dentalcare";
const adjuntos = logoPublico
  ? []
  : [{ filename: "dentalcare.png", path: path.join(process.cwd(), "public/images/logo-correo.png"), cid: "logo-dentalcare" }];

export type DatosCita = {
  dentista: string;
  tratamiento: string;
  inicio: string | Date;
  paciente_nombre: string;
  paciente_email: string;
  paciente_telefono: string;
  notas?: string | null;
  respuesta?: string | null;
};

const escapar = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function detalle(c: DatosCita) {
  const inicio = new Date(c.inicio);
  const d = dentistas.find((x) => x.slug === c.dentista);
  return {
    cuando: `${fechaLarga(fechaLocal(inicio))} a las ${formatoHora(horaLocal(inicio))}`,
    dentista: d ? nombreCompleto(d) : c.dentista,
    tratamiento: tratamientos.find((t) => t.slug === c.tratamiento)?.nombre ?? c.tratamiento,
  };
}

function plantilla(titulo: string, parrafos: string[], filas: [string, string][]) {
  const tabla = filas
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 16px 6px 0;color:#3f4b5c">${k}</td><td style="padding:6px 0;color:#0b2545;font-weight:600">${escapar(v)}</td></tr>`,
    )
    .join("");
  return `<!doctype html><html><body style="margin:0;background:#eef5fb;font-family:Arial,sans-serif">
  <div style="max-width:560px;margin:0 auto;padding:32px 20px">
    <div style="background:#fff;border-radius:16px;padding:32px">
      <img src="${LOGO_SRC}" width="220" height="50" alt="${clinica.nombre}" style="display:block;margin:0 0 28px;border:0;height:auto">

      <h1 style="margin:0 0 16px;color:#0b2545;font-family:Georgia,serif;font-size:24px">${titulo}</h1>
      ${parrafos.map((p) => `<p style="color:#3f4b5c;line-height:1.6">${p}</p>`).join("")}
      <table style="margin-top:16px;border-collapse:collapse;font-size:15px">${tabla}</table>
    </div>
    <p style="color:#3f4b5c;font-size:13px;line-height:1.6;text-align:center;margin-top:20px">
      ${clinica.direccion}, ${clinica.ciudad}<br>Tel. y WhatsApp ${clinica.telefono}
    </p>
  </div></body></html>`;
}

async function enviar(para: string, asunto: string, html: string) {
  if (!transporte) {
    console.warn(`[correo] Sin configurar GMAIL_USER/GMAIL_APP_PASSWORD; no se envió: "${asunto}" → ${para}`);
    return;
  }
  try {
    await transporte.sendMail({ from: `"${clinica.nombre}" <${usuario}>`, to: para, subject: asunto, html, attachments: adjuntos });
  } catch (error) {
    // Un correo fallido no debe tumbar la reserva ni la gestión de la cita.
    console.error("[correo] Error al enviar", asunto, error);
  }
}

export async function correoSolicitudRecibida(c: DatosCita) {
  const d = detalle(c);
  const nombre = escapar(c.paciente_nombre.split(" ")[0]);
  await Promise.all([
    enviar(
      c.paciente_email,
      "Recibimos tu solicitud de cita",
      plantilla(
        `Hola, ${nombre}`,
        ["Recibimos tu solicitud. La revisaremos y te escribiremos para <strong>confirmarla</strong> lo antes posible."],
        [["Tratamiento", d.tratamiento], ["Especialista", d.dentista], ["Fecha", d.cuando]],
      ),
    ),
    enviar(
      clinica.email,
      `Nueva solicitud: ${d.tratamiento} · ${d.cuando}`,
      plantilla(
        "Nueva solicitud de cita",
        [`Revísala en el panel: ${process.env.NEXT_PUBLIC_SITIO_URL ?? ""}/admin`],
        [
          ["Paciente", c.paciente_nombre],
          ["Teléfono", c.paciente_telefono],
          ["Correo", c.paciente_email],
          ["Tratamiento", d.tratamiento],
          ["Especialista", d.dentista],
          ["Fecha", d.cuando],
          ["Notas", c.notas || "—"],
        ],
      ),
    ),
  ]);
}

export async function correoRespuesta(c: DatosCita, estado: "confirmada" | "rechazada" | "cancelada") {
  const d = detalle(c);
  const nombre = escapar(c.paciente_nombre.split(" ")[0]);
  const mensaje = c.respuesta ? [`Mensaje de la clínica: <em>${escapar(c.respuesta)}</em>`] : [];
  const contacto = `Si quieres elegir otro horario, reserva de nuevo en línea o escríbenos al ${clinica.telefono}.`;

  const textos = {
    confirmada: {
      asunto: "Tu cita está confirmada",
      titulo: `¡Listo, ${nombre}! Tu cita está confirmada`,
      parrafos: ["Te esperamos. Si no puedes asistir, avísanos con anticipación para liberar el turno.", ...mensaje],
    },
    rechazada: {
      asunto: "No pudimos confirmar tu cita",
      titulo: `Hola, ${nombre}`,
      parrafos: ["Lo sentimos, no pudimos confirmar el horario que solicitaste.", ...mensaje, contacto],
    },
    cancelada: {
      asunto: "Tu cita fue cancelada",
      titulo: `Hola, ${nombre}`,
      parrafos: ["Tu cita fue cancelada.", ...mensaje, contacto],
    },
  }[estado];

  await enviar(
    c.paciente_email,
    textos.asunto,
    plantilla(textos.titulo, textos.parrafos, [["Tratamiento", d.tratamiento], ["Especialista", d.dentista], ["Fecha", d.cuando]]),
  );
}
