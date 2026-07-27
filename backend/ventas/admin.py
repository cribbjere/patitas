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

    def formfield_for_foreignkey(self, db_field, request, **kwargs):

        if db_field.name == "producto":
            kwargs["queryset"] = db_field.remote_field.model.objects.filter(
                tipo_producto__in=['comercial', 'ambos']
            )

        return super().formfield_for_foreignkey(
            db_field,
            request,
            **kwargs
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