from django.contrib import admin

from .models import (
    Producto,
    Stock,
    LoteStock,
    MovimientoStock,
)


@admin.register(Producto)
class ProductoAdmin(admin.ModelAdmin):
    list_display = (
        'descripcion',
        'categoria',
        'tipo_producto',
        'precio_venta',
        'estado',
    )

    search_fields = (
        'descripcion',
        'categoria',
    )


@admin.register(LoteStock)
class LoteStockAdmin(admin.ModelAdmin):
    list_display = (
        'numero_lote',
        'producto',
        'cantidad_disponible',
        'fecha_vencimiento',
        'costo_unitario',
    )

    list_filter = (
        'producto',
        'fecha_vencimiento',
    )

    search_fields = (
        'numero_lote',
        'producto__descripcion',
    )


admin.site.register(Stock)
admin.site.register(MovimientoStock)