import { useRef, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa6'
import { mascotas, turnos } from '../data/mockData'
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
  const mes = meses[fechaFin.getMonth()]
  const anio = fechaFin.getFullYear()

  return `${diaInicio} - ${diaFin} de ${mes} de ${anio}`
}

function formatearTituloMes(fecha) {
  return `${meses[fecha.getMonth()]} de ${fecha.getFullYear()}`
}

function formatearTituloDia(fecha) {
  return `${fecha.getDate()} de ${meses[fecha.getMonth()]} de ${fecha.getFullYear()}`
}

function CalendarioTurnos() {
  const calendarioRef = useRef(null)
  const [titulo, setTitulo] = useState('')

  const eventos = turnos.map((turno) => {
    const mascota = mascotas.find((item) => item.id === turno.mascotaId)

    return {
      id: turno.id,
      title: `${mascota?.nombre} - ${turno.motivo}`,
      start: turno.fechaInicio,
      end: turno.fechaFin,
    }
  })

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

  const irAnterior = () => {
    const api = calendarioRef.current.getApi()
    api.prev()
  }

  const irSiguiente = () => {
    const api = calendarioRef.current.getApi()
    api.next()
  }

  const irHoy = () => {
    const api = calendarioRef.current.getApi()
    api.today()
  }

  const cambiarVista = (vista) => {
    const api = calendarioRef.current.getApi()
    api.changeView(vista)
  }

  const handleEventClick = (info) => {
    alert(`Turno seleccionado: ${info.event.title}`)
  }

  const handleDateClick = (info) => {
    alert(`Día seleccionado: ${info.dateStr}`)
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
          <button type="button" onClick={() => cambiarVista('dayGridMonth')}>
            Mes
          </button>

          <button type="button" onClick={() => cambiarVista('timeGridWeek')}>
            Semana
          </button>

          <button type="button" onClick={() => cambiarVista('timeGridDay')}>
            Día
          </button>
        </div>
      </div>

      <div className="calendar-box">
        <FullCalendar
          ref={calendarioRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          initialDate="2026-06-24"
          headerToolbar={false}
          height="100%"
          allDaySlot={false}
          slotMinTime="08:00:00"
          slotMaxTime="19:00:00"
          events={eventos}
          eventClick={handleEventClick}
          dateClick={handleDateClick}
          datesSet={actualizarTitulo}
          dayHeaderContent={(args) => {
            return `${dias[args.date.getDay()]} ${formatearFechaCorta(args.date)}`
          }}
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