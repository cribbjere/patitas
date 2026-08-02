from django.db import models
from django.db.models import Sum
from django.http import HttpResponse
from django.utils import timezone

from openpyxl import Workbook
from rest_framework.response import Response
from rest_framework.views import APIView

from caja.models import MovimientoCaja
from compras.models import Compra
from inventario.models import Stock
from turnos.models import Turno
from usuarios.permisos import TienePermisoModulo
from ventas.models import Venta


def obtener_rol_usuario(usuario):
    if usuario.is_superuser:
        return 'administrador'

    perfil = getattr(usuario, 'perfil', None)

    if not perfil:
        return None

    return str(perfil.rol).strip().lower()


def calcular_resumen_completo():
    hoy = timezone.localdate()

    ventas_hoy = (
        Venta.objects
        .filter(fecha=hoy)
        .aggregate(total=Sum('total'))['total']
        or 0
    )

    compras_hoy = (
        Compra.objects
        .filter(fecha=hoy)
        .aggregate(total=Sum('total'))['total']
        or 0
    )

    turnos_hoy = Turno.objects.filter(
        fecha=hoy,
    ).count()

    stock_bajo = Stock.objects.filter(
        cantidad_disponible__lte=models.F(
            'producto__stock_minimo'
        )
    ).count()

    ingresos_mes = (
        MovimientoCaja.objects
        .filter(
            tipo_movimiento='ingreso',
            fecha__month=hoy.month,
            fecha__year=hoy.year,
        )
        .aggregate(total=Sum('monto'))['total']
        or 0
    )

    return {
        'ventas_hoy': ventas_hoy,
        'compras_hoy': compras_hoy,
        'turnos_hoy': turnos_hoy,
        'stock_bajo': stock_bajo,
        'ingresos_mes': ingresos_mes,
    }


class DashboardResumenView(APIView):
    permission_classes = [TienePermisoModulo]
    modulo_permiso = 'dashboard'

    def get(self, request):
        rol = obtener_rol_usuario(request.user)
        resumen_completo = calcular_resumen_completo()

        resumen = {
            'ventas_hoy': 0,
            'compras_hoy': 0,
            'turnos_hoy': 0,
            'stock_bajo': 0,
            'ingresos_mes': 0,
        }

        if rol == 'administrador':
            resumen = resumen_completo

        elif rol == 'ventas':
            resumen.update({
                'ventas_hoy': resumen_completo[
                    'ventas_hoy'
                ],
                'compras_hoy': resumen_completo[
                    'compras_hoy'
                ],
                'stock_bajo': resumen_completo[
                    'stock_bajo'
                ],
                'ingresos_mes': resumen_completo[
                    'ingresos_mes'
                ],
            })

        elif rol in {
            'recepcionista',
            'veterinario',
            'higiene',
        }:
            resumen['turnos_hoy'] = resumen_completo[
                'turnos_hoy'
            ]

        return Response(resumen)


class ReporteVentasView(APIView):
    permission_classes = [TienePermisoModulo]
    modulo_permiso = 'reportes'

    roles_permitidos = {
        'administrador',
        'ventas',
    }

    def get(self, request):
        ventas = (
            Venta.objects
            .select_related('cliente')
            .all()
            .order_by('-fecha', '-id')
        )

        datos = []

        for venta in ventas:
            datos.append({
                'id': venta.id,
                'numero_comprobante': (
                    venta.numero_comprobante
                ),
                'fecha': venta.fecha,
                'cliente': (
                    str(venta.cliente)
                    if venta.cliente
                    else 'Consumidor Final'
                ),
                'total': venta.total,
                'estado_pago': venta.estado_pago,
            })

        return Response(datos)


class ReporteComprasView(APIView):
    permission_classes = [TienePermisoModulo]
    modulo_permiso = 'reportes'

    roles_permitidos = {
        'administrador',
        'ventas',
    }

    def get(self, request):
        compras = (
            Compra.objects
            .select_related('proveedor')
            .all()
            .order_by('-fecha', '-id')
        )

        datos = []

        for compra in compras:
            datos.append({
                'id': compra.id,
                'numero_comprobante': (
                    compra.numero_comprobante
                ),
                'fecha': compra.fecha,
                'proveedor': (
                    compra.proveedor.nombre
                    if compra.proveedor
                    else 'Sin proveedor'
                ),
                'total': compra.total,
                'estado_pago': compra.estado_pago,
            })

        return Response(datos)


class ReporteStockBajoView(APIView):
    permission_classes = [TienePermisoModulo]
    modulo_permiso = 'reportes'

    roles_permitidos = {
        'administrador',
        'ventas',
    }

    def get(self, request):
        stocks = (
            Stock.objects
            .select_related('producto')
            .filter(
                cantidad_disponible__lte=models.F(
                    'producto__stock_minimo'
                )
            )
            .order_by('producto__descripcion')
        )

        datos = []

        for stock in stocks:
            datos.append({
                'producto': stock.producto.descripcion,
                'cantidad_disponible': (
                    stock.cantidad_disponible
                ),
                'stock_minimo': (
                    stock.producto.stock_minimo
                ),
            })

        return Response(datos)


class ReporteCajaView(APIView):
    permission_classes = [TienePermisoModulo]
    modulo_permiso = 'reportes'

    roles_permitidos = {
        'administrador',
    }

    def get(self, request):
        movimientos = (
            MovimientoCaja.objects
            .select_related('usuario')
            .all()
            .order_by('-fecha', '-id')
        )

        datos = []

        for movimiento in movimientos:
            datos.append({
                'fecha': movimiento.fecha,
                'tipo_movimiento': (
                    movimiento.tipo_movimiento
                ),
                'motivo': movimiento.motivo,
                'descripcion': movimiento.descripcion,
                'monto': movimiento.monto,
                'usuario': (
                    movimiento.usuario.username
                    if movimiento.usuario
                    else 'Sistema'
                ),
            })

        return Response(datos)


class ExportarVentasExcelView(APIView):
    permission_classes = [TienePermisoModulo]
    modulo_permiso = 'reportes'

    roles_permitidos = {
        'administrador',
        'ventas',
    }

    def get(self, request):
        workbook = Workbook()
        hoja = workbook.active
        hoja.title = 'Ventas'

        hoja.append([
            'Fecha',
            'Comprobante',
            'Cliente',
            'Total',
            'Estado de pago',
        ])

        ventas = (
            Venta.objects
            .select_related('cliente')
            .all()
            .order_by('-fecha', '-id')
        )

        for venta in ventas:
            cliente = (
                str(venta.cliente)
                if venta.cliente
                else 'Consumidor Final'
            )

            hoja.append([
                venta.fecha,
                venta.numero_comprobante,
                cliente,
                venta.total,
                venta.estado_pago,
            ])

        response = HttpResponse(
            content_type=(
                'application/vnd.openxmlformats-'
                'officedocument.spreadsheetml.sheet'
            )
        )

        response['Content-Disposition'] = (
            'attachment; '
            'filename="reporte_ventas.xlsx"'
        )

        workbook.save(response)

        return response


dashboard_resumen = DashboardResumenView.as_view()
reporte_ventas = ReporteVentasView.as_view()
reporte_compras = ReporteComprasView.as_view()
reporte_stock_bajo = ReporteStockBajoView.as_view()
reporte_caja = ReporteCajaView.as_view()
exportar_ventas_excel = ExportarVentasExcelView.as_view()