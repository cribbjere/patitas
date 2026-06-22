from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.units import cm


def generar_comprobante_venta(venta, response):

    pdf = canvas.Canvas(response, pagesize=A4)
    width, height = A4

    y = height - 2 * cm

    pdf.setFont("Helvetica-Bold", 16)
    pdf.drawString(2 * cm, y, "Veterinaria Patitas")

    y -= 1 * cm
    pdf.setFont("Helvetica", 11)
    pdf.drawString(2 * cm, y, f"Comprobante: {venta.numero_comprobante}")

    y -= 0.6 * cm
    pdf.drawString(2 * cm, y, f"Fecha: {venta.fecha}")

    y -= 0.6 * cm
    cliente = "Consumidor Final"

    if venta.cliente:
        cliente = f"{venta.cliente.nombre} {venta.cliente.apellido}"

    pdf.drawString(2 * cm, y, f"Cliente: {cliente}")

    y -= 1.2 * cm
    pdf.setFont("Helvetica-Bold", 12)
    pdf.drawString(2 * cm, y, "Detalle de venta")

    y -= 0.7 * cm
    pdf.setFont("Helvetica-Bold", 10)
    pdf.drawString(2 * cm, y, "Producto")
    pdf.drawString(9 * cm, y, "Cant.")
    pdf.drawString(11 * cm, y, "Precio")
    pdf.drawString(14 * cm, y, "Subtotal")

    y -= 0.4 * cm
    pdf.line(2 * cm, y, 18 * cm, y)

    y -= 0.6 * cm
    pdf.setFont("Helvetica", 10)

    for detalle in venta.detalles.all():

        pdf.drawString(2 * cm, y, detalle.producto.descripcion)
        pdf.drawString(9 * cm, y, str(detalle.cantidad))
        pdf.drawString(11 * cm, y, f"${detalle.precio_unitario}")
        pdf.drawString(14 * cm, y, f"${detalle.subtotal}")

        y -= 0.6 * cm

    y -= 0.5 * cm
    pdf.line(2 * cm, y, 18 * cm, y)

    y -= 0.8 * cm
    pdf.setFont("Helvetica-Bold", 12)
    pdf.drawString(12 * cm, y, f"TOTAL: ${venta.total}")

    y -= 1.5 * cm
    pdf.setFont("Helvetica", 9)
    pdf.drawString(2 * cm, y, "Gracias por confiar en Veterinaria Patitas.")

    pdf.showPage()
    pdf.save()