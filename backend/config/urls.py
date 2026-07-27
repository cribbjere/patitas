from django.contrib import admin
from django.urls import path, include


urlpatterns = [
    path('admin/', admin.site.urls),

    path('api/', include('clientes.urls')),
    path('api/', include('ventas.urls')),
    path('api/', include('compras.urls')),
    path('api/', include('consultas.urls')),
    path('api/', include('mascotas.urls')),
    path('api/', include('turnos.urls')),
    path('api/', include('servicios.urls')),
    path('api/', include('inventario.urls')),
    path('api/', include('caja.urls')),
    path('api/', include('usuarios.urls')),
    path('api/', include('reportes.urls')),
]