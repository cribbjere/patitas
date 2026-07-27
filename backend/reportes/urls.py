from django.urls import path

from .views import (
    dashboard_resumen,
    reporte_ventas,
    reporte_compras,
    reporte_stock_bajo,
    reporte_caja,
    exportar_ventas_excel,
)


urlpatterns = [
    path('dashboard/', dashboard_resumen, name='dashboard_resumen'),

    path('reportes/ventas/', reporte_ventas, name='reporte_ventas'),
    path('reportes/compras/', reporte_compras, name='reporte_compras'),
    path('reportes/stock-bajo/', reporte_stock_bajo, name='reporte_stock_bajo'),
    path('reportes/caja/', reporte_caja, name='reporte_caja'),
    path(
        'reportes/ventas/excel/',
        exportar_ventas_excel,
        name='exportar_ventas_excel'
    ),
]   