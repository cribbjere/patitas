from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.units import cm


def generar_comprobante_servicio_clinico(titulo, registro, response):

    pdf = canvas.Canvas(response, pagesize=A4)
    width, height = A4

    y = height - 2 * cm

    pdf.setFont("Helvetica-Bold", 16)
    pdf.drawString(2 * cm, y, "Veterinaria Patitas")

    y -= 1 * cm
    pdf.setFont("Helvetica-Bold", 13)
    pdf.drawString(2 * cm, y, titulo)

    y -= 1 * cm
    pdf.setFont("Helvetica", 11)

    pdf.drawString(2 * cm, y, f"Fecha: {getattr(registro, 'fecha', getattr(registro, 'fecha_consulta', getattr(registro, 'fecha_aplicacion', '')))}")

    y -= 0.6 * cm
    pdf.drawString(2 * cm, y, f"Mascota: {registro.mascota.nombre}")

    y -= 0.6 * cm
    pdf.drawString(2 * cm, y, f"Servicio: {registro.servicio.descripcion}")

    y -= 0.6 * cm
    pdf.drawString(2 * cm, y, f"Precio: ${registro.precio}")

    y -= 0.6 * cm
    pdf.drawString(2 * cm, y, f"Usuario: {registro.usuario.username}")

    y -= 1.2 * cm
    pdf.setFont("Helvetica-Bold", 12)
    pdf.drawString(2 * cm, y, "Observaciones")

    y -= 0.7 * cm
    pdf.setFont("Helvetica", 10)

    observaciones = registro.observaciones or "-"

    text = pdf.beginText(2 * cm, y)
    text.setFont("Helvetica", 10)

    for linea in observaciones.splitlines():
        text.textLine(linea)

    pdf.drawText(text)

    y -= 2 * cm
    pdf.setFont("Helvetica", 9)
    pdf.drawString(2 * cm, y, "Gracias por confiar en Veterinaria Patitas.")

    pdf.showPage()
    pdf.save()