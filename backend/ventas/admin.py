from django.contrib import admin

from .models import (
    Venta,
    DetalleVenta
)


class DetalleVentaInline(admin.TabularInline):
    model = DetalleVenta
    extra = 1

    readonly_fields = (
        'precio_unitario',
        'subtotal',
    )

@admin.register(Venta)
class VentaAdmin(admin.ModelAdmin):

    list_display = (
        'numero_comprobante',
        'fecha',
        'cliente',
        'consumidor_final',
        'total'
    )

    readonly_fields = (
        'numero_comprobante',
        'total'
    )

    inlines = [
        DetalleVentaInline
    ]


admin.site.register(DetalleVenta)