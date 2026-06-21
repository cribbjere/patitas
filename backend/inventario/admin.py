from django.contrib import admin
from .models import (
    Producto,
    Stock,
    MovimientoStock
)

admin.site.register(Producto)
admin.site.register(Stock)
admin.site.register(MovimientoStock)