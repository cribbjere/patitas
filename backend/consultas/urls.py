from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    ConsultaViewSet,
    VacunacionViewSet,
    CirugiaViewSet,
    ServicioHigieneViewSet,
    comprobante_higiene_pdf,
    comprobante_consulta_pdf,
    comprobante_vacunacion_pdf,
    comprobante_cirugia_pdf
)


router = DefaultRouter()

router.register(r'consultas', ConsultaViewSet)
router.register(r'vacunaciones', VacunacionViewSet)
router.register(r'cirugias', CirugiaViewSet)
router.register(r'higiene', ServicioHigieneViewSet)


urlpatterns = router.urls + [
    path(
        'higiene/<int:higiene_id>/comprobante/',
        comprobante_higiene_pdf,
        name='comprobante_higiene_pdf'
    ),
    path(
        'consultas/<int:consulta_id>/comprobante/',
        comprobante_consulta_pdf,
        name='comprobante_consulta_pdf'
    ),
    path(
        'vacunaciones/<int:vacunacion_id>/comprobante/',
        comprobante_vacunacion_pdf,
        name='comprobante_vacunacion_pdf'
    ),
    path(
        'cirugias/<int:cirugia_id>/comprobante/',
        comprobante_cirugia_pdf,
        name='comprobante_cirugia_pdf'
    ),
]