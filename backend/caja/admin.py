from django.contrib import admin
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