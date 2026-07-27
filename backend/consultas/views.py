from django.shortcuts import render
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from rest_framework import viewsets

from .models import (
    Consulta,
    Vacunacion,
    Cirugia,
    ServicioHigiene
)

from .serializers import (
    ConsultaSerializer,
    VacunacionSerializer,
    CirugiaSerializer,
    ServicioHigieneSerializer
)

from .comprobantes import generar_comprobante_servicio_clinico

class ConsultaViewSet(viewsets.ModelViewSet):
    queryset = Consulta.objects.all()
    serializer_class = ConsultaSerializer


class VacunacionViewSet(viewsets.ModelViewSet):
    queryset = Vacunacion.objects.all()
    serializer_class = VacunacionSerializer


class CirugiaViewSet(viewsets.ModelViewSet):
    queryset = Cirugia.objects.all()
    serializer_class = CirugiaSerializer


class ServicioHigieneViewSet(viewsets.ModelViewSet):
    queryset = ServicioHigiene.objects.all()
    serializer_class = ServicioHigieneSerializer

def comprobante_higiene_pdf(request, higiene_id):

    registro = get_object_or_404(ServicioHigiene, id=higiene_id)

    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = (
        f'attachment; filename="higiene_{registro.id}.pdf"'
    )

    generar_comprobante_servicio_clinico(
        "Comprobante de Servicio de Higiene",
        registro,
        response
    )

    return response

def comprobante_consulta_pdf(request, consulta_id):

    registro = get_object_or_404(Consulta, id=consulta_id)

    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = (
        f'attachment; filename="consulta_{registro.id}.pdf"'
    )

    generar_comprobante_servicio_clinico(
        "Comprobante de Consulta",
        registro,
        response
    )

    return response


def comprobante_vacunacion_pdf(request, vacunacion_id):

    registro = get_object_or_404(Vacunacion, id=vacunacion_id)

    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = (
        f'attachment; filename="vacunacion_{registro.id}.pdf"'
    )

    generar_comprobante_servicio_clinico(
        "Comprobante de Vacunación",
        registro,
        response
    )

    return response


def comprobante_cirugia_pdf(request, cirugia_id):

    registro = get_object_or_404(Cirugia, id=cirugia_id)

    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = (
        f'attachment; filename="cirugia_{registro.id}.pdf"'
    )

    generar_comprobante_servicio_clinico(
        "Comprobante de Cirugía",
        registro,
        response
    )

    return response