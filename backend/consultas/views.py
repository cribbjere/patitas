from django.http import HttpResponse
from django.shortcuts import get_object_or_404

from rest_framework import viewsets
from rest_framework.views import APIView

from usuarios.permisos import TienePermisoModulo

from .comprobantes import (
    generar_comprobante_servicio_clinico,
)
from .models import (
    Cirugia,
    Consulta,
    ServicioHigiene,
    Vacunacion,
)
from .serializers import (
    CirugiaSerializer,
    ConsultaSerializer,
    ServicioHigieneSerializer,
    VacunacionSerializer,
)


class ConsultaViewSet(viewsets.ModelViewSet):
    queryset = (
        Consulta.objects
        .select_related(
            'mascota',
            'mascota__cliente',
            'servicio',
            'turno',
            'usuario',
        )
        .order_by(
            '-fecha_consulta',
            '-id',
        )
    )

    serializer_class = ConsultaSerializer
    permission_classes = [TienePermisoModulo]
    modulo_permiso = 'consultas'

    def perform_create(self, serializer):
        serializer.save(
            usuario=self.request.user,
        )


class VacunacionViewSet(viewsets.ModelViewSet):
    queryset = (
        Vacunacion.objects
        .select_related(
            'mascota',
            'mascota__cliente',
            'servicio',
            'turno',
            'usuario',
        )
        .order_by(
            '-fecha_aplicacion',
            '-id',
        )
    )

    serializer_class = VacunacionSerializer
    permission_classes = [TienePermisoModulo]
    modulo_permiso = 'vacunaciones'

    def perform_create(self, serializer):
        serializer.save(
            usuario=self.request.user,
        )


class CirugiaViewSet(viewsets.ModelViewSet):
    queryset = (
        Cirugia.objects
        .select_related(
            'mascota',
            'mascota__cliente',
            'servicio',
            'turno',
            'usuario',
        )
        .order_by(
            '-fecha',
            '-id',
        )
    )

    serializer_class = CirugiaSerializer
    permission_classes = [TienePermisoModulo]
    modulo_permiso = 'cirugias'

    def perform_create(self, serializer):
        serializer.save(
            usuario=self.request.user,
        )


class ServicioHigieneViewSet(
    viewsets.ModelViewSet
):
    queryset = (
        ServicioHigiene.objects
        .select_related(
            'mascota',
            'mascota__cliente',
            'servicio',
            'turno',
            'usuario',
        )
        .order_by(
            '-fecha',
            '-id',
        )
    )

    serializer_class = ServicioHigieneSerializer
    permission_classes = [TienePermisoModulo]
    modulo_permiso = 'higiene'

    def perform_create(self, serializer):
        serializer.save(
            usuario=self.request.user,
        )


class ComprobanteConsultaPDFView(APIView):
    permission_classes = [TienePermisoModulo]
    modulo_permiso = 'consultas'

    def get(self, request, consulta_id):
        registro = get_object_or_404(
            Consulta.objects.select_related(
                'mascota',
                'mascota__cliente',
                'servicio',
                'turno',
                'usuario',
            ),
            id=consulta_id,
        )

        response = HttpResponse(
            content_type='application/pdf',
        )

        response['Content-Disposition'] = (
            'attachment; '
            f'filename="consulta_{registro.id}.pdf"'
        )

        generar_comprobante_servicio_clinico(
            'Comprobante de Consulta',
            registro,
            response,
        )

        return response


class ComprobanteVacunacionPDFView(APIView):
    permission_classes = [TienePermisoModulo]
    modulo_permiso = 'vacunaciones'

    def get(self, request, vacunacion_id):
        registro = get_object_or_404(
            Vacunacion.objects.select_related(
                'mascota',
                'mascota__cliente',
                'servicio',
                'turno',
                'usuario',
            ),
            id=vacunacion_id,
        )

        response = HttpResponse(
            content_type='application/pdf',
        )

        response['Content-Disposition'] = (
            'attachment; '
            f'filename="vacunacion_{registro.id}.pdf"'
        )

        generar_comprobante_servicio_clinico(
            'Comprobante de Vacunación',
            registro,
            response,
        )

        return response


class ComprobanteCirugiaPDFView(APIView):
    permission_classes = [TienePermisoModulo]
    modulo_permiso = 'cirugias'

    def get(self, request, cirugia_id):
        registro = get_object_or_404(
            Cirugia.objects.select_related(
                'mascota',
                'mascota__cliente',
                'servicio',
                'turno',
                'usuario',
            ),
            id=cirugia_id,
        )

        response = HttpResponse(
            content_type='application/pdf',
        )

        response['Content-Disposition'] = (
            'attachment; '
            f'filename="cirugia_{registro.id}.pdf"'
        )

        generar_comprobante_servicio_clinico(
            'Comprobante de Cirugía',
            registro,
            response,
        )

        return response


class ComprobanteHigienePDFView(APIView):
    permission_classes = [TienePermisoModulo]
    modulo_permiso = 'higiene'

    def get(self, request, higiene_id):
        registro = get_object_or_404(
            ServicioHigiene.objects.select_related(
                'mascota',
                'mascota__cliente',
                'servicio',
                'turno',
                'usuario',
            ),
            id=higiene_id,
        )

        response = HttpResponse(
            content_type='application/pdf',
        )

        response['Content-Disposition'] = (
            'attachment; '
            f'filename="higiene_{registro.id}.pdf"'
        )

        generar_comprobante_servicio_clinico(
            'Comprobante de Servicio de Higiene',
            registro,
            response,
        )

        return response


comprobante_consulta_pdf = (
    ComprobanteConsultaPDFView.as_view()
)

comprobante_vacunacion_pdf = (
    ComprobanteVacunacionPDFView.as_view()
)

comprobante_cirugia_pdf = (
    ComprobanteCirugiaPDFView.as_view()
)

comprobante_higiene_pdf = (
    ComprobanteHigienePDFView.as_view()
)