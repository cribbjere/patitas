from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.units import cm


def generar_comprobante_compra(compra, response):

    pdf = canvas.Canvas(response, pagesize=A4)

    width, height = A4

    y = height - 2 * cm

    pdf.setFont("Helvetica-Bold", 16)
    pdf.drawString(2 * cm, y, "Veterinaria Patitas")

    y -= 1 * cm
    pdf.setFont("Helvetica", 11)

    pdf.drawString(
        2 * cm,
        y,
        f"Comprobante: {compra.numero_comprobante}"
    )

    y -= 0.6 * cm

    pdf.drawString(
        2 * cm,
        y,
        f"Fecha: {compra.fecha}"
    )

    y -= 0.6 * cm

    pdf.drawString(
        2 * cm,
        y,
        f"Proveedor: {compra.proveedor.nombre}"
    )

    y -= 1.2 * cm

    pdf.setFont("Helvetica-Bold", 12)
    pdf.drawString(2 * cm, y, "Detalle de compra")

    y -= 0.7 * cm

    pdf.setFont("Helvetica-Bold", 10)

    pdf.drawString(2 * cm, y, "Producto")
    pdf.drawString(9 * cm, y, "Cant.")
    pdf.drawString(11 * cm, y, "Costo")
    pdf.drawString(14 * cm, y, "Subtotal")

    y -= 0.4 * cm

    pdf.line(2 * cm, y, 18 * cm, y)

    y -= 0.6 * cm

    pdf.setFont("Helvetica", 10)

    for detalle in compra.detalles.all():

        pdf.drawString(
            2 * cm,
            y,
            detalle.producto.descripcion
        )

        pdf.drawString(
            9 * cm,
            y,
            str(detalle.cantidad)
        )

        pdf.drawString(
            11 * cm,
            y,
            f"${detalle.costo_unitario}"
        )

        pdf.drawString(
            14 * cm,
            y,
            f"${detalle.subtotal}"
        )

        y -= 0.6 * cm

    y -= 0.5 * cm

    pdf.line(2 * cm, y, 18 * cm, y)

    y -= 0.8 * cm

    pdf.setFont("Helvetica-Bold", 12)

    pdf.drawString(
        12 * cm,
        y,
        f"TOTAL: ${compra.total}"
    )

    pdf.showPage()
    pdf.save()