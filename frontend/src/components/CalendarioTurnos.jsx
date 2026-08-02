import { useMemo, useRef, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa6'
import './CalendarioTurnos.css'

const meses = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
]

const dias = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb']

function formatearFechaCorta(fecha) {
  const dia = fecha.getDate()
  const mes = fecha.getMonth() + 1

  return `${dia}/${mes}`
}

function formatearTituloSemana(inicio, fin) {
  const fechaFin = new Date(fin)
  fechaFin.setDate(fechaFin.getDate() - 1)

  const diaInicio = inicio.getDate()
  const diaFin = fechaFin.getDate()
  const mesInicio = meses[inicio.getMonth()]
  const mesFin = meses[fechaFin.getMonth()]
  const anio = fechaFin.getFullYear()

  if (inicio.getMonth() !== fechaFin.getMonth()) {
    return `${diaInicio} de ${mesInicio} - ${diaFin} de ${mesFin} de ${anio}`
  }

  return `${diaInicio} - ${diaFin} de ${mesFin} de ${anio}`
}

function formatearTituloMes(fecha) {
  return `${meses[fecha.getMonth()]} de ${fecha.getFullYear()}`
}

function formatearTituloDia(fecha) {
  return `${fecha.getDate()} de ${meses[fecha.getMonth()]} de ${fecha.getFullYear()}`
}

function normalizarTexto(valor) {
  return String(valor ?? '').trim().toLowerCase()
}

function obtenerId(valor) {
  if (valor && typeof valor === 'object') {
    return Number(valor.id)
  }

  return Number(valor)
}

function CalendarioTurnos({ turnos = [], mascotas = [] }) {
  const calendarioRef = useRef(null)
  const [titulo, setTitulo] = useState('')

  const mascotasPorId = useMemo(
    () =>
      new Map(
        mascotas.map((mascota) => [Number(mascota.id), mascota])
      ),
    [mascotas]
  )

  const eventos = useMemo(
    () =>
      turnos
        .filter(
          (turno) => normalizarTexto(turno.estado) !== 'cancelado'
        )
        .map((turno) => {
          const mascotaId = obtenerId(
            turno.mascotaId ?? turno.mascota
          )
          const mascota = mascotasPorId.get(mascotaId)
          const nombreMascota = mascota?.nombre || 'Mascota'
          const motivo =
            turno.motivo ||
            turno.motivo_consulta ||
            'Turno'

          const fechaInicio =
            turno.fechaInicio ||
            turno.fecha_inicio ||
            (turno.fecha && turno.hora
              ? `${turno.fecha}T${turno.hora}`
              : '')

          const fechaFin =
            turno.fechaFin ||
            turno.fecha_fin ||
            (turno.fecha && turno.hora_fin
              ? `${turno.fecha}T${turno.hora_fin}`
              : '')

          return {
            id: String(turno.id),
            title: `${nombreMascota} - ${motivo}`,
            start: fechaInicio,
            end: fechaFin || undefined,
          }
        })
        .filter((evento) => evento.start),
    [turnos, mascotasPorId]
  )

  const actualizarTitulo = (info) => {
    const tipoVista = info.view.type

    if (tipoVista === 'dayGridMonth') {
      setTitulo(formatearTituloMes(info.view.currentStart))
    }

    if (tipoVista === 'timeGridWeek') {
      setTitulo(formatearTituloSemana(info.start, info.end))
    }

    if (tipoVista === 'timeGridDay') {
      setTitulo(formatearTituloDia(info.view.currentStart))
    }
  }

  const obtenerApi = () => calendarioRef.current?.getApi()

  const irAnterior = () => {
    obtenerApi()?.prev()
  }

  const irSiguiente = () => {
    obtenerApi()?.next()
  }

  const irHoy = () => {
    obtenerApi()?.today()
  }

  const cambiarVista = (vista) => {
    obtenerApi()?.changeView(vista)
  }

  const handleEventClick = (info) => {
    window.alert(`Turno seleccionado: ${info.event.title}`)
  }

  const handleDateClick = (info) => {
    window.alert(`Día seleccionado: ${info.dateStr}`)
  }

  return (
    <div className="calendario-turnos notranslate" translate="no">
      <div className="calendar-toolbar">
        <div className="calendar-toolbar-left">
          <button type="button" onClick={irAnterior}>
            <FaChevronLeft />
          </button>

          <button type="button" onClick={irSiguiente}>
            <FaChevronRight />
          </button>

          <button type="button" onClick={irHoy}>
            Hoy
          </button>
        </div>

        <h3>{titulo}</h3>

        <div className="calendar-toolbar-right">
          <button
            type="button"
            onClick={() => cambiarVista('dayGridMonth')}
          >
            Mes
          </button>

          <button
            type="button"
            onClick={() => cambiarVista('timeGridWeek')}
          >
            Semana
          </button>

          <button
            type="button"
            onClick={() => cambiarVista('timeGridDay')}
          >
            Día
          </button>
        </div>
      </div>

      <div className="calendar-box">
        <FullCalendar
          ref={calendarioRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={false}
          height="100%"
          allDaySlot={false}
          slotMinTime="08:00:00"
          slotMaxTime="19:00:00"
          events={eventos}
          eventClick={handleEventClick}
          dateClick={handleDateClick}
          datesSet={actualizarTitulo}
          dayHeaderContent={(args) =>
            `${dias[args.date.getDay()]} ${formatearFechaCorta(args.date)}`
          }
          slotLabelFormat={{
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          }}
          eventTimeFormat={{
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          }}
        />
      </div>
    </div>
  )
}

export default CalendarioTurnos