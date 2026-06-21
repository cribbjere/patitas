from django.contrib import admin
from .models import Proveedor, Compra, CompraDetalle


class CompraDetalleInline(admin.TabularInline):
    model = CompraDetalle
    extra = 1
    readonly_fields = ('subtotal',)


class CompraAdmin(admin.ModelAdmin):
    inlines = [CompraDetalleInline]

    readonly_fields = (
        'numero_comprobante',
        'total',
    )


admin.site.register(Proveedor)
admin.site.register(Compra, CompraAdmin)