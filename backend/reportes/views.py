from django.utils import timezone
from django.db import models
from django.db.models import Sum
from django.http import HttpResponse
from openpyxl import Workbook
from rest_framework.decorators import api_view
from rest_framework.response import Response

from ventas.models import Venta
from compras.models import Compra
from turnos.models import Turno
from inventario.models import Stock
from caja.models import MovimientoCaja


@api_view(['GET'])
def dashboard_resumen(request):

    hoy = timezone.localdate()

    ventas_hoy = Venta.objects.filter(
        fecha=hoy
    ).aggregate(
        total=Sum('total')
    )['total'] or 0

    compras_hoy = Compra.objects.filter(
        fecha=hoy
    ).aggregate(
        total=Sum('total')
    )['total'] or 0

    turnos_hoy = Turno.objects.filter(
        fecha=hoy
    ).count()

    stock_bajo = Stock.objects.filter(
        cantidad_disponible__lte=models.F('producto__stock_minimo')
    ).count()

    ingresos_mes = MovimientoCaja.objects.filter(
        tipo_movimiento='ingreso',
        fecha__month=hoy.month,
        fecha__year=hoy.year
    ).aggregate(
        total=Sum('monto')
    )['total'] or 0

    return Response({
        'ventas_hoy': ventas_hoy,
        'compras_hoy': compras_hoy,
        'turnos_hoy': turnos_hoy,
        'stock_bajo': stock_bajo,
        'ingresos_mes': ingresos_mes,
    })

@api_view(['GET'])
def reporte_ventas(request):

    ventas = Venta.objects.all().order_by('-fecha')

    data = []

    for venta in ventas:
        data.append({
            'id': venta.id,
            'numero_comprobante': venta.numero_comprobante,
            'fecha': venta.fecha,
            'cliente': str(venta.cliente) if venta.cliente else 'Consumidor Final',
            'total': venta.total,
            'estado_pago': venta.estado_pago,
        })

    return Response(data)


@api_view(['GET'])
def reporte_compras(request):

    compras = Compra.objects.all().order_by('-fecha')

    data = []

    for compra in compras:
        data.append({
            'id': compra.id,
            'numero_comprobante': compra.numero_comprobante,
            'fecha': compra.fecha,
            'proveedor': compra.proveedor.nombre,
            'total': compra.total,
            'estado_pago': compra.estado_pago,
        })

    return Response(data)


@api_view(['GET'])
def reporte_stock_bajo(request):

    stocks = Stock.objects.filter(
        cantidad_disponible__lte=models.F('producto__stock_minimo')
    )

    data = []

    for stock in stocks:
        data.append({
            'producto': stock.producto.descripcion,
            'cantidad_disponible': stock.cantidad_disponible,
            'stock_minimo': stock.producto.stock_minimo,
        })

    return Response(data)


@api_view(['GET'])
def reporte_caja(request):

    movimientos = MovimientoCaja.objects.all().order_by('-fecha')

    data = []

    for mov in movimientos:
        data.append({
            'fecha': mov.fecha,
            'tipo_movimiento': mov.tipo_movimiento,
            'motivo': mov.motivo,
            'descripcion': mov.descripcion,
            'monto': mov.monto,
            'usuario': mov.usuario.username,
        })

    return Response(data)

def exportar_ventas_excel(request):

    workbook = Workbook()
    hoja = workbook.active
    hoja.title = "Ventas"

    hoja.append([
        "Fecha",
        "Comprobante",
        "Cliente",
        "Total",
        "Estado de pago"
    ])

    ventas = Venta.objects.all().order_by('-fecha')

    for venta in ventas:

        cliente = "Consumidor Final"

        if venta.cliente:
            cliente = str(venta.cliente)

        hoja.append([
            venta.fecha,
            venta.numero_comprobante,
            cliente,
            venta.total,
            venta.estado_pago
        ])

    response = HttpResponse(
        content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )

    response['Content-Disposition'] = (
        'attachment; filename="reporte_ventas.xlsx"'
    )

    workbook.save(response)

    return response