from django.contrib import admin
from django.db.models import Sum

from .models import MovimientoCaja


@admin.register(MovimientoCaja)
class MovimientoCajaAdmin(admin.ModelAdmin):

    list_display = (
        'fecha',
        'tipo_movimiento',
        'motivo',
        'descripcion',
        'monto',
        'usuario'
    )

    list_filter = (
        'tipo_movimiento',
        'motivo',
        'fecha'
    )

    change_list_template = "admin/caja/movimientocaja/change_list.html"

    def changelist_view(self, request, extra_context=None):

        ingresos = MovimientoCaja.objects.filter(
            tipo_movimiento='ingreso'
        ).aggregate(
            total=Sum('monto')
        )['total'] or 0

        egresos = MovimientoCaja.objects.filter(
            tipo_movimiento='egreso'
        ).aggregate(
            total=Sum('monto')
        )['total'] or 0

        saldo = ingresos - egresos

        extra_context = extra_context or {}
        extra_context['ingresos'] = ingresos
        extra_context['egresos'] = egresos
        extra_context['saldo'] = saldo

        return super().changelist_view(
            request,
            extra_context=extra_context
        )