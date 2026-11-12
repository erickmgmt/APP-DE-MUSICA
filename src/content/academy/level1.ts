import type { Lesson } from '../types';

/**
 * NIVEL 1 — FUNDAMENTOS
 * Rutas de menú: se indican en inglés (texto original de REAPER) y con la traducción
 * habitual en español. REAPER no trae español de serie: se usa un paquete de idioma
 * (LangPack) de la comunidad, así que el texto exacto puede variar.
 */
export const LEVEL1: Lesson[] = [
  // ------------------------------------------------------------------
  {
    id: 'l1-daw',
    level: 1,
    title: '¿Qué es un DAW?',
    summary: 'El estudio completo dentro de tu computadora: pistas, instrumentos, efectos y mezclador.',
    minutes: 10,
    ready: true,
    explanation: [
      'DAW significa "Digital Audio Workstation" (estación de trabajo de audio digital). Es el programa donde grabas, programas, editas, mezclas y exportas música. REAPER es tu DAW.',
      'Piensa en un estudio físico: hay instrumentos, cables, una consola de mezcla con faders, aparatos de efectos y una grabadora. El DAW reúne todo eso en una pantalla.',
      'Todo proyecto se organiza en PISTAS (tracks). Cada pista contiene ÍTEMS (items): trozos de audio o de MIDI colocados en una línea de tiempo. Cada pista pasa por su propia cadena de EFECTOS (FX) y termina en el MASTER, la salida final que escuchas y exportas.',
      'Recorrido de la señal: instrumento o audio → efectos de la pista → fader de volumen y paneo → master → tus altavoces o el archivo final. Entender este recorrido te ayudará a resolver casi cualquier problema.',
    ],
    keyPoints: [
      'Pista = un carril para un sonido (kick, bajo, pad...).',
      'Ítem = un bloque de audio o MIDI dentro de una pista.',
      'FX = procesadores que transforman el sonido (EQ, compresor, reverb...).',
      'Master = la suma de todas las pistas. Es lo que exportas.',
    ],
    visual: { kind: 'daw-map', caption: 'Recorrido de la señal dentro de un DAW. Toca cada bloque para ver qué hace.' },
    example: {
      title: 'Una canción Deep House vista como DAW',
      text: 'Pista 1: Kick (ítem de audio con un sample). Pista 2: Bajo (ítem MIDI que toca un sintetizador virtual). Pista 3: Pad (MIDI + sinte + reverb). Todas suman en el Master, donde al final se coloca un limitador para el mastering.',
    },
    reaper: [
      { text: 'Abre REAPER. La zona grande central es el área de arreglo (arrange view): ahí viven los ítems sobre la línea de tiempo.', level: 'verificado' },
      { text: 'Crea un proyecto nuevo y vacío.', menu: { en: ['File', 'New project'], es: ['Archivo', 'Nuevo proyecto'] }, shortcut: 'Ctrl+N', level: 'verificado' },
      { text: 'Inserta una pista nueva.', menu: { en: ['Track', 'Insert new track'], es: ['Pista', 'Insertar pista nueva'] }, shortcut: 'Ctrl+T', level: 'verificado', tip: 'También puedes hacer doble clic en el espacio vacío del panel de pistas (a la izquierda).' },
      { text: 'Abre el mezclador para ver la misma pista como un canal con fader.', menu: { en: ['View', 'Mixer'], es: ['Ver', 'Mezclador'] }, shortcut: 'Ctrl+M', level: 'verificado' },
      { text: 'Guarda el proyecto en una carpeta propia (p. ej. "Mis canciones/Prueba DAW").', menu: { en: ['File', 'Save project'], es: ['Archivo', 'Guardar proyecto'] }, shortcut: 'Ctrl+S', level: 'verificado', tip: 'En la ventana de guardado marca la opción para crear una subcarpeta para el proyecto y copiar los medios, si aparece: mantiene todo ordenado.' },
    ],
    exercise: {
      goal: 'Crear tu primer proyecto con tres pistas nombradas y guardarlo.',
      steps: [
        'Crea un proyecto nuevo (Ctrl+N).',
        'Inserta 3 pistas (Ctrl+T tres veces).',
        'Haz doble clic sobre el nombre de cada pista y nómbralas: Kick, Bajo, Pad.',
        'Abre el mezclador (Ctrl+M) y localiza los tres canales y el Master.',
        'Guarda el proyecto (Ctrl+S).',
      ],
      check: ['Veo 3 pistas con nombre en el área de arreglo', 'Encontré el canal Master en el mezclador', 'El proyecto está guardado en su propia carpeta'],
    },
    mistakes: [
      { error: 'Trabajar sin guardar y perder el proyecto.', fix: 'Guarda con Ctrl+S cada pocos minutos. REAPER también tiene guardado automático en Preferencias (Options › Preferences › Project).' },
      { error: 'Dejar todas las pistas como "Track 1, Track 2...".', fix: 'Nombra cada pista desde el principio. En proyectos de 20 pistas es imprescindible.' },
      { error: 'Confundir el fader de la pista con la ganancia del sonido original.', fix: 'El fader solo cambia el volumen al final de la pista; los efectos reciben la señal antes del fader.' },
    ],
    quiz: [
      { q: '¿Qué es REAPER?', options: ['Un plugin de reverb', 'Un DAW (estación de trabajo de audio digital)', 'Una librería de samples', 'Un formato de audio'], answer: 1, why: 'REAPER es el programa completo donde produces: un DAW.' },
      { q: '¿Dónde suenan juntas todas las pistas antes de exportar?', options: ['En el Master', 'En la primera pista', 'En el ítem MIDI', 'En el metrónomo'], answer: 0, why: 'Todas las pistas suman en el Master, que es lo que escuchas y exportas.' },
      { q: 'Un trozo de audio o MIDI colocado en la línea de tiempo se llama...', options: ['Fader', 'Bus', 'Ítem', 'Plugin'], answer: 2, why: 'En REAPER cada bloque en la línea de tiempo es un ítem (media item).' },
      { q: '¿Qué atajo inserta una pista nueva en REAPER?', options: ['Ctrl+N', 'Ctrl+T', 'Ctrl+M', 'Barra espaciadora'], answer: 1, why: 'Ctrl+T = Insert new track. Ctrl+N crea un proyecto nuevo y Ctrl+M muestra el mezclador.' },
    ],
  },

  // ------------------------------------------------------------------
  {
    id: 'l1-reaper',
    level: 1,
    title: 'Cómo funciona REAPER',
    summary: 'Las zonas de la pantalla, el transporte, el mezclador y la configuración para un equipo modesto.',
    minutes: 15,
    ready: true,
    explanation: [
      'La ventana de REAPER tiene cinco zonas que usarás siempre: el menú y la barra de herramientas (arriba), el panel de pistas o TCP (izquierda), el área de arreglo con la regla de tiempo (centro), la barra de transporte (reproducir, grabar, BPM) y el mezclador o MCP (abajo, si está visible).',
      'El cursor de edición es la línea vertical que marca dónde empezará a reproducirse. Haz clic en la regla para moverlo.',
      'Tu equipo (Celeron N4020, 8 GB) es modesto. REAPER es de los DAW más ligeros, pero conviene ajustar el tamaño de búfer: un búfer mayor (512 o 1024 muestras) da más estabilidad a costa de algo más de latencia. Para mezclar, la latencia no importa; para tocar con teclado MIDI, prueba 256.',
      'Para saber cuánto CPU consumes, abre el medidor de rendimiento. Si se acerca al límite, congela (freeze) las pistas con instrumentos pesados.',
    ],
    keyPoints: [
      'TCP = panel de control de pistas (izquierda).',
      'MCP = panel de control del mezclador (abajo).',
      'Transporte = reproducir, parar, grabar, repetir, BPM.',
      'Búfer grande = más estable; búfer pequeño = menos retardo al tocar.',
    ],
    visual: { kind: 'reaper-map', caption: 'Mapa simplificado de la ventana de REAPER. Toca cada zona.' },
    example: {
      title: 'Configuración recomendada para tu equipo',
      text: 'Frecuencia de muestreo 44100 Hz o 48000 Hz, búfer 512 muestras para producir y 1024 para mezclar proyectos grandes. Usa como mucho 1 o 2 sintetizadores pesados activos a la vez y congela el resto.',
    },
    reaper: [
      { text: 'Reproducir / detener.', shortcut: 'Barra espaciadora', level: 'verificado' },
      { text: 'Ir al inicio del proyecto.', shortcut: 'Inicio (Home)', level: 'verificado' },
      { text: 'Activar o desactivar la repetición (loop) de la selección de tiempo.', shortcut: 'R', level: 'verificado', tip: 'Arrastra sobre la regla para crear una selección de tiempo y luego activa la repetición.' },
      { text: 'Abrir las preferencias y revisar el dispositivo de audio y el tamaño de búfer.', menu: { en: ['Options', 'Preferences', 'Audio', 'Device'], es: ['Opciones', 'Preferencias', 'Audio', 'Dispositivo'] }, shortcut: 'Ctrl+P', level: 'verificado', tip: 'En Windows usa el controlador ASIO de tu interfaz si lo tienes; si no, WASAPI. El campo se llama "Request block size".' },
      { text: 'Abrir el medidor de rendimiento para ver el uso de CPU.', menu: { en: ['View', 'Performance meter'], es: ['Ver', 'Medidor de rendimiento'] }, level: 'verificado' },
      { text: 'Congelar una pista pesada: clic derecho sobre el nombre de la pista y busca el submenú de congelado ("Freeze tracks").', level: 'confirmar', tip: 'El congelado renderiza la pista a audio y desactiva sus plugins; se puede descongelar cuando quieras.' },
    ],
    exercise: {
      goal: 'Configurar REAPER para que funcione estable en tu computadora.',
      steps: [
        'Abre Options › Preferences › Audio › Device (Ctrl+P).',
        'Anota qué sistema de audio usas (ASIO, WASAPI...).',
        'Ajusta el tamaño de búfer a 512 si el campo está disponible y aplica.',
        'Abre View › Performance meter y observa el % de CPU con el proyecto vacío.',
        'Crea una selección de tiempo de 4 compases en la regla, pulsa R y reproduce: debe repetir en bucle.',
      ],
      check: ['Sé dónde está la configuración de audio', 'Conozco mi uso de CPU en reposo', 'Sé crear un loop con R'],
    },
    mistakes: [
      { error: 'Usar el búfer más bajo posible y oír chasquidos o cortes.', fix: 'Sube el búfer a 512 o 1024. Los chasquidos casi siempre son falta de CPU, no un problema de la mezcla.' },
      { error: 'Cargar muchos sintetizadores pesados a la vez.', fix: 'Congela las pistas terminadas o expórtalas a audio. Un proyecto con audio pesa mucho menos que uno con 10 sintes.' },
      { error: 'Perder el mezclador o una ventana y no saber recuperarla.', fix: 'Casi todas las ventanas se abren desde el menú View (Ver). El mezclador: Ctrl+M.' },
    ],
    quiz: [
      { q: 'Tienes chasquidos durante la reproducción. ¿Qué pruebas primero?', options: ['Bajar el volumen del master', 'Subir el tamaño de búfer', 'Cambiar el BPM', 'Borrar el kick'], answer: 1, why: 'Un búfer mayor le da más tiempo a la CPU para procesar y suele eliminar cortes.' },
      { q: '¿Qué tecla reproduce y detiene en REAPER?', options: ['Enter', 'R', 'Barra espaciadora', 'Ctrl+P'], answer: 2, why: 'La barra espaciadora es Play/Stop por defecto.' },
      { q: '¿Qué significa "congelar" una pista?', options: ['Silenciarla para siempre', 'Renderizarla a audio temporalmente para ahorrar CPU', 'Bloquear su volumen', 'Borrar sus efectos'], answer: 1, why: 'Freeze convierte la pista a audio y desactiva sus plugins para liberar CPU; es reversible.' },
      { q: 'La tecla R sirve para...', options: ['Grabar', 'Activar la repetición (loop)', 'Renombrar la pista', 'Renderizar'], answer: 1, why: 'R alterna la repetición. Grabar es Ctrl+R y renderizar Ctrl+Alt+R.' },
    ],
  },

  // ------------------------------------------------------------------
  {
    id: 'l1-bpm',
    level: 1,
    title: 'BPM: la velocidad de la canción',
    summary: 'Pulsos por minuto, cómo sentirlos y qué tempos usa cada género.',
    minutes: 10,
    ready: true,
    explanation: [
      'BPM significa "beats per minute": cuántos pulsos hay en un minuto. A 120 BPM hay 2 pulsos por segundo (60 ÷ 120 = 0,5 s por pulso).',
      'El pulso es lo que marcas con el pie al escuchar música. En la música electrónica de baile, el kick suele marcar cada pulso.',
      'Cada género tiene un rango típico. El Deep House suele moverse aproximadamente entre 118 y 125 BPM: lo bastante rápido para bailar, pero relajado. El reggaetón suele ir bastante más lento (en torno a 90–100 BPM) y el tech house algo más rápido que el deep house.',
      'Fija el BPM AL PRINCIPIO del proyecto. Cambiarlo después puede desalinear audios que no se estiren automáticamente.',
    ],
    keyPoints: ['BPM = pulsos por minuto.', 'Duración de un pulso = 60 ÷ BPM segundos.', 'Deep House: aprox. 118–125 BPM.', 'Decide el BPM antes de grabar o importar audio.'],
    visual: { kind: 'metronome', caption: 'Metrónomo interactivo: cambia el BPM o marca el tempo tocando el botón TAP.' },
    example: {
      title: 'Deep House a 122 BPM',
      text: 'A 122 BPM cada pulso dura unos 492 ms y un compás de 4 pulsos unos 1,97 s. Un bloque de 16 compases (una sección típica) dura unos 31 segundos.',
    },
    reaper: [
      { text: 'Abre la configuración del proyecto y escribe el tempo en "Project BPM". En la misma pestaña está la métrica (time signature).', menu: { en: ['File', 'Project settings...'], es: ['Archivo', 'Configuración del proyecto...'] }, shortcut: 'Alt+Enter', level: 'verificado' },
      { text: 'Comprueba el tempo en la barra de transporte: muestra el BPM y la métrica (por ejemplo 122 4/4).', level: 'verificado' },
      { text: 'Activa el metrónomo con su botón en la barra de transporte. Con clic derecho sobre ese botón accedes a sus ajustes.', level: 'confirmar', tip: 'El metrónomo suena al reproducir y al grabar si está activado.' },
    ],
    exercise: {
      goal: 'Sentir la diferencia entre tempos y fijar el BPM de un proyecto.',
      steps: [
        'En el metrónomo de esta lección escucha 100, 122 y 128 BPM. ¿Cuál te parece más "deep"?',
        'Pon una canción de Deep House que te guste y usa el botón TAP al ritmo del kick durante 8 pulsos. Anota el BPM.',
        'En REAPER, abre Project settings (Alt+Enter) y fija ese BPM.',
        'Activa el metrónomo de REAPER y reproduce: debe coincidir con el que escuchas aquí.',
      ],
      check: ['Medí el BPM de una canción real con TAP', 'Fijé el BPM en Project settings', 'El metrónomo de REAPER suena al tempo correcto'],
    },
    mistakes: [
      { error: 'Elegir el BPM al final, cuando ya hay audio grabado.', fix: 'Defínelo en la etapa 3 del proyecto. Si lo cambias después, revisa que todos los audios sigan alineados.' },
      { error: 'Confundir la "energía" con el BPM.', fix: 'Una canción puede sentirse intensa a 120 BPM y relajada a 128. La energía depende también del groove, el sonido y el arreglo.' },
    ],
    quiz: [
      { q: 'A 120 BPM, ¿cuánto dura un pulso?', options: ['1 segundo', '0,5 segundos', '2 segundos', '0,12 segundos'], answer: 1, why: '60 ÷ 120 = 0,5 s.' },
      { q: '¿Qué rango es típico del Deep House?', options: ['70–80 BPM', '118–125 BPM', '140–150 BPM', '170–175 BPM'], answer: 1, why: 'El Deep House suele estar aproximadamente entre 118 y 125 BPM.' },
      { q: '¿Dónde se fija el BPM del proyecto en REAPER?', options: ['File › Project settings (Alt+Enter)', 'En el ítem MIDI', 'En el fader del master', 'En el FX browser'], answer: 0, why: 'Project settings contiene el campo Project BPM y la métrica.' },
      { q: '¿Por qué conviene fijar el BPM al principio?', options: ['Porque REAPER no permite cambiarlo', 'Porque al cambiarlo después el audio puede desalinearse', 'Porque gasta CPU', 'No importa en absoluto'], answer: 1, why: 'El MIDI sigue el tempo, pero el audio puede quedar desfasado según cómo esté configurado.' },
    ],
  },

  // ------------------------------------------------------------------
  {
    id: 'l1-compases',
    level: 1,
    title: 'Compases y subdivisiones',
    summary: 'Cómo se agrupan los pulsos: compás de 4/4, negras, corcheas y semicorcheas.',
    minutes: 12,
    ready: true,
    explanation: [
      'Los pulsos se agrupan en COMPASES (bars o measures). Casi toda la música de baile usa 4/4: cuatro pulsos por compás. El primer pulso de cada compás se siente más fuerte.',
      'Cada pulso se puede dividir: en 2 (corcheas, 1/8), en 4 (semicorcheas, 1/16). Las semicorcheas son la rejilla básica para programar baterías: 16 casillas por compás.',
      'Las canciones se construyen en bloques de 4, 8, 16 o 32 compases. Los DJ y el público esperan cambios en esos múltiplos: por eso el arreglo del Deep House suele cambiar cada 8 o 16 compases.',
      'En la regla de REAPER verás posiciones como 5.1.00: compás 5, pulso 1. Eso te permite saber exactamente dónde estás.',
    ],
    keyPoints: ['4/4 = cuatro pulsos por compás.', '1 compás = 16 semicorcheas.', 'Las secciones se miden en bloques de 8, 16 o 32 compases.', 'La regla de REAPER muestra compás.pulso.'],
    visual: { kind: 'bar-grid', caption: 'Un compás de 4/4 dividido en pulsos y semicorcheas. Pulsa reproducir para seguir el cursor.' },
    example: {
      title: 'Contar como un productor',
      text: '"1 e y a, 2 e y a, 3 e y a, 4 e y a": cada sílaba es una semicorchea. En Deep House el kick cae en 1, 2, 3 y 4; el hi-hat abierto suele caer en las "y" (contratiempos).',
    },
    reaper: [
      { text: 'Comprueba la métrica (time signature) en Project settings: debe ser 4/4 para Deep House.', menu: { en: ['File', 'Project settings...'], es: ['Archivo', 'Configuración del proyecto...'] }, shortcut: 'Alt+Enter', level: 'verificado' },
      { text: 'Activa la cuadrícula y el ajuste (snap) con los botones de la barra de herramientas principal (el icono del imán es el snap). Con clic derecho en el imán accedes a los ajustes de cuadrícula.', level: 'confirmar' },
      { text: 'Arrastra sobre la regla para seleccionar exactamente del compás 1 al 5 (4 compases) y pulsa R para escucharlo en bucle.', shortcut: 'R', level: 'verificado' },
    ],
    exercise: {
      goal: 'Contar compases y crear un bucle exacto de 4 compases.',
      steps: [
        'En la cuadrícula de esta lección reproduce y cuenta en voz alta "1 e y a 2 e y a...".',
        'En REAPER, con el snap activado, selecciona en la regla del compás 1 al compás 5.',
        'Activa la repetición (R) y reproduce con el metrónomo.',
        'Cuenta cuántos compases pasan antes de que el bucle vuelva a empezar (deben ser 4).',
      ],
      check: ['Puedo contar 16 semicorcheas en un compás', 'Creé un bucle exacto de 4 compases', 'Sé leer la posición compás.pulso en la regla'],
    },
    mistakes: [
      { error: 'Hacer secciones de longitudes raras (7 o 13 compases) sin intención.', fix: 'Trabaja en bloques de 4, 8 y 16 compases. Rompe la regla solo cuando sepas por qué.' },
      { error: 'Programar sin el snap activado y que las notas queden fuera de tiempo.', fix: 'Activa snap y cuadrícula a 1/16 para baterías.' },
    ],
    quiz: [
      { q: '¿Cuántos pulsos tiene un compás de 4/4?', options: ['2', '3', '4', '16'], answer: 2, why: '4/4 = cuatro pulsos (negras) por compás.' },
      { q: '¿Cuántas semicorcheas hay en un compás de 4/4?', options: ['4', '8', '12', '16'], answer: 3, why: '4 pulsos × 4 semicorcheas = 16.' },
      { q: 'En la regla de REAPER, "9.3.00" significa...', options: ['Minuto 9, segundo 3', 'Compás 9, pulso 3', 'Pista 9, ítem 3', 'BPM 93'], answer: 1, why: 'El formato es compás.pulso.fracción.' },
      { q: '¿Por qué las secciones suelen durar 8 o 16 compases?', options: ['Por una limitación de REAPER', 'Porque el oído y los DJ esperan cambios en esos bloques', 'Porque ocupa menos CPU', 'Es obligatorio por ley'], answer: 1, why: 'La música de baile se estructura en frases de 8/16/32 compases; facilita la mezcla de DJ y la expectativa del oyente.' },
    ],
  },

  // ------------------------------------------------------------------
  {
    id: 'l1-notas',
    level: 1,
    title: 'Notas musicales',
    summary: 'Las 12 notas, teclas blancas y negras, octavas y cómo las nombra REAPER.',
    minutes: 12,
    ready: true,
    explanation: [
      'En la música occidental hay 12 notas que se repiten: Do, Do#, Re, Re#, Mi, Fa, Fa#, Sol, Sol#, La, La#, Si. Después vuelve a empezar Do, una OCTAVA más aguda.',
      'REAPER (y casi todo el software) usa la notación anglosajona: C=Do, D=Re, E=Mi, F=Fa, G=Sol, A=La, B=Si. El signo # (sostenido) sube medio tono: C# = Do#.',
      'En el teclado, las teclas blancas son las notas naturales y las negras son los sostenidos/bemoles. Entre Mi-Fa y Si-Do no hay tecla negra: ahí la distancia es de solo medio tono (semitono).',
      'El número indica la octava. Por defecto, REAPER muestra el Do central como C4 (nota MIDI 60). Las notas graves (bajo) están en octavas 1–2; los pads y acordes suelen estar en 3–5.',
    ],
    keyPoints: ['12 notas por octava.', 'C D E F G A B = Do Re Mi Fa Sol La Si.', '# = medio tono más agudo.', 'C4 = Do central = MIDI 60 (por defecto en REAPER).'],
    visual: { kind: 'piano', caption: 'Teclado interactivo. Tócalo con el ratón o el dedo; activa los nombres en español o inglés.' },
    example: {
      title: 'Dónde vive cada instrumento',
      text: 'Un bajo de Deep House suele tocar entre C1 y C3 (aprox. 33–131 Hz). Un pad de acordes funciona bien entre C3 y C5. Una melodía o lead suele estar por encima de C4.',
    },
    reaper: [
      { text: 'Inserta una pista con un instrumento virtual. Para empezar sin consumir CPU puedes usar ReaSynth, el sintetizador sencillo que incluye REAPER.', menu: { en: ['Insert', 'Virtual instrument on new track...'], es: ['Insertar', 'Instrumento virtual en nueva pista...'] }, level: 'verificado' },
      { text: 'Inserta un ítem MIDI vacío en esa pista.', menu: { en: ['Insert', 'New MIDI item'], es: ['Insertar', 'Nuevo ítem MIDI'] }, level: 'verificado' },
      { text: 'Haz doble clic en el ítem MIDI para abrir el editor MIDI. A la izquierda verás el teclado vertical con los nombres de nota.', level: 'verificado' },
      { text: 'Haz clic en las teclas del teclado vertical del editor para escuchar cada nota.', level: 'verificado' },
    ],
    exercise: {
      goal: 'Reconocer las notas en el teclado y en el editor MIDI de REAPER.',
      steps: [
        'En el teclado de esta lección toca todas las teclas blancas desde C4 hasta C5.',
        'Encuentra los dos lugares donde no hay tecla negra entre dos blancas (E-F y B-C).',
        'En REAPER abre el editor MIDI y localiza C4, A4 y C2 en el teclado vertical.',
        'Escribe en tus notas: ¿en qué octava sonaría un bajo?',
      ],
      check: ['Sé encontrar C (Do) en el teclado', 'Conozco la equivalencia Do=C … Si=B', 'Localicé C4 en el editor MIDI de REAPER'],
    },
    mistakes: [
      { error: 'Pensar que solo existen 7 notas.', fix: 'Hay 12: las 7 naturales y 5 alteradas (teclas negras).' },
      { error: 'Programar el bajo en una octava demasiado aguda o demasiado grave.', fix: 'Para bajos usa aprox. C1–C3. Por debajo de ~30 Hz casi no se oye en altavoces normales.' },
    ],
    quiz: [
      { q: '¿Cómo se llama "La" en notación anglosajona?', options: ['L', 'A', 'G', 'B'], answer: 1, why: 'A = La. (G = Sol, B = Si).' },
      { q: '¿Cuántas notas distintas hay en una octava?', options: ['7', '8', '12', '24'], answer: 2, why: '7 naturales + 5 alteradas = 12.' },
      { q: '¿Entre qué notas NO hay tecla negra?', options: ['C-D', 'E-F', 'G-A', 'A-B'], answer: 1, why: 'Entre Mi-Fa (E-F) y Si-Do (B-C) hay solo un semitono.' },
      { q: 'Por defecto en REAPER, la nota MIDI 60 se muestra como...', options: ['C3', 'C4', 'C5', 'A4'], answer: 1, why: 'REAPER muestra el Do central (MIDI 60) como C4 salvo que cambies la preferencia de nombres de octava.' },
    ],
  },

  // ------------------------------------------------------------------
  {
    id: 'l1-escalas',
    level: 1,
    title: 'Escalas: las notas que combinan',
    summary: 'Mayor, menor y pentatónica: un "filtro" de notas para que tus melodías no desafinen.',
    minutes: 15,
    ready: true,
    explanation: [
      'Una ESCALA es una selección de notas de las 12 posibles, ordenadas desde una nota principal llamada TÓNICA. Si usas solo las notas de la escala, las melodías y acordes sonarán coherentes entre sí.',
      'Las escalas se definen por sus distancias: T = tono (2 teclas) y S = semitono (1 tecla). La escala mayor es T T S T T T S; la menor natural es T S T T S T T.',
      'La escala MENOR suena más melancólica y nocturna; es muy común en Deep House. La DÓRICA es una menor con la sexta nota más alta: suena menor pero más "soul".',
      'La PENTATÓNICA MENOR tiene solo 5 notas y es casi imposible que suene mal: perfecta para tus primeras melodías y bajos.',
    ],
    keyPoints: ['Escala = conjunto de notas que combinan.', 'Tónica = nota "casa" de la escala.', 'Menor natural: T S T T S T T.', 'Pentatónica menor: 5 notas, muy segura.'],
    visual: { kind: 'scale-player', caption: 'Elige tónica y escala: se resaltan las notas y puedes escucharla.' },
    example: {
      title: 'La menor: la escala "sin teclas negras"',
      text: 'La menor natural = A B C D E F G: solo teclas blancas. Es ideal para practicar en el editor MIDI porque no tienes que buscar teclas negras.',
    },
    reaper: [
      { text: 'Abre el editor MIDI (doble clic en un ítem MIDI).', level: 'verificado' },
      { text: 'Activa la función de escala/tonalidad del editor MIDI para resaltar o restringir las notas de una escala: busca en la barra inferior del editor el ajuste de "Key snap" y elige la tónica y la escala.', level: 'confirmar', tip: 'Así el editor te ayuda a no salirte de la escala. El nombre exacto del control puede variar según la versión.' },
      { text: 'Si no encuentras la función, usa la tabla de notas de esta lección y dibuja solo esas notas.', level: 'general' },
    ],
    exercise: {
      goal: 'Escribir una melodía de 8 notas usando solo la escala de La menor pentatónica.',
      steps: [
        'En el reproductor de escalas elige tónica A y "Pentatónica menor". Escúchala.',
        'Anota sus notas: A, C, D, E, G.',
        'En REAPER, abre un ítem MIDI de 2 compases y dibuja 8 notas usando solo esas notas (entre A3 y A4).',
        'Reprodúcelo en bucle. Cambia una nota por otra de la escala hasta que te guste.',
      ],
      check: ['Escuché la diferencia entre mayor y menor', 'Escribí 8 notas dentro de la escala', 'La melodía no tiene notas "fuera"'],
    },
    mistakes: [
      { error: 'Usar notas al azar y que la melodía suene "desafinada".', fix: 'Elige una escala y no te salgas de ella hasta que entiendas por qué querrías hacerlo.' },
      { error: 'Creer que la escala mayor es "mejor".', fix: 'Ninguna es mejor; cada una tiene un carácter. Para Deep House las menores suelen encajar con la atmósfera.' },
    ],
    quiz: [
      { q: '¿Qué es la tónica?', options: ['La nota más aguda', 'La nota principal o "casa" de la escala', 'Un tipo de acorde', 'Un plugin de afinación'], answer: 1, why: 'La tónica da nombre a la escala y es donde la música "descansa".' },
      { q: 'Patrón de la escala menor natural:', options: ['T T S T T T S', 'T S T T S T T', 'S S S S S S S', 'T T T T T T'], answer: 1, why: 'Menor natural (eólica) = T S T T S T T.' },
      { q: '¿Cuántas notas tiene una escala pentatónica?', options: ['5', '6', '7', '12'], answer: 0, why: '"Penta" = cinco.' },
      { q: '¿Qué escala usa solo teclas blancas empezando en La?', options: ['La mayor', 'La menor natural', 'La dórica', 'La pentatónica mayor'], answer: 1, why: 'A B C D E F G = La menor natural (relativa de Do mayor).' },
    ],
  },

  // ------------------------------------------------------------------
  {
    id: 'l1-tonalidades',
    level: 1,
    title: 'Tonalidades',
    summary: 'Tónica + escala = tonalidad. Relativas mayor/menor y cómo elegir la tonalidad de tu canción.',
    minutes: 12,
    ready: true,
    explanation: [
      'La TONALIDAD de una canción es la combinación de su tónica y su escala: "La menor", "Fa menor", "Do mayor". Todas las partes (bajo, acordes, melodía) deben compartir esa tonalidad.',
      'Cada tonalidad mayor tiene una RELATIVA menor con exactamente las mismas notas: Do mayor ↔ La menor. La diferencia es qué nota se siente como "casa".',
      'Para tu canción, la tonalidad también afecta al bajo y al kick: si la tónica es muy grave (por ejemplo Fa, ~44 Hz en F1), el bajo tendrá más peso; tonalidades como La (A1 ≈ 55 Hz) dejan el bajo en una zona cómoda para casi todos los sistemas.',
      'Afinar el kick a la tonalidad es una práctica habitual: si el kick tiene una nota clara, que coincida con la tónica (o la quinta) evita choques con el bajo.',
    ],
    keyPoints: ['Tonalidad = tónica + modo (mayor/menor).', 'Relativas: mismas notas, distinta "casa".', 'Todo el proyecto comparte una tonalidad.', 'Anótala en el proyecto desde el principio.'],
    visual: { kind: 'key-explorer', caption: 'Explorador de tonalidades: elige una tonalidad, mira sus notas, su relativa y escucha su acorde de tónica.' },
    example: {
      title: 'Elegir tonalidad para tu Deep House',
      text: 'Empieza por La menor: solo teclas blancas, bajo cómodo (A1 ≈ 55 Hz) y una sonoridad nocturna. Cuando domines el proceso, prueba Fa menor o Sol menor.',
    },
    reaper: [
      { text: 'Anota la tonalidad en las notas del proyecto de REAPER para no olvidarla.', menu: { en: ['File', 'Project settings...', 'Notes'], es: ['Archivo', 'Configuración del proyecto...', 'Notas'] }, level: 'confirmar', tip: 'Además, guárdala en la ficha del proyecto de esta app.' },
      { text: 'En el editor MIDI, configura la tonalidad en la función de escala ("Key snap") para que resalte esas notas.', level: 'confirmar' },
    ],
    exercise: {
      goal: 'Elegir la tonalidad de tu primera canción y comprobar sus notas.',
      steps: [
        'En el explorador escucha La menor y Do mayor. Observa que tienen las mismas notas.',
        'Escucha Fa menor y Sol menor. ¿Cuál te transmite más "noche"?',
        'Elige una tonalidad para tu canción y escríbela en la ficha de tu proyecto en esta app.',
        'Escribe sus 7 notas en tus notas personales.',
      ],
      check: ['Entiendo qué es una tonalidad relativa', 'Elegí la tonalidad de mi canción', 'Conozco sus 7 notas'],
    },
    mistakes: [
      { error: 'Usar samples (loops con notas) de tonalidades distintas sin transponerlos.', fix: 'Revisa la tonalidad del sample (suele venir en el nombre del archivo) y transpónlo a la de tu proyecto.' },
      { error: 'Cambiar de tonalidad a mitad del proyecto sin querer.', fix: 'Fija la tonalidad en la etapa 3 y anótala.' },
    ],
    quiz: [
      { q: '¿Cuál es la relativa menor de Do mayor?', options: ['Mi menor', 'La menor', 'Re menor', 'Do menor'], answer: 1, why: 'La relativa menor está una 6ª por encima (o 3 semitonos por debajo): La menor.' },
      { q: 'Una tonalidad se define por...', options: ['El BPM', 'La tónica y la escala (modo)', 'El número de pistas', 'El volumen'], answer: 1, why: 'Tónica + modo (mayor/menor).' },
      { q: '¿Por qué es útil afinar el kick a la tonalidad?', options: ['Para que suene más fuerte', 'Para evitar choques de notas con el bajo', 'Para ahorrar CPU', 'No tiene ninguna utilidad'], answer: 1, why: 'Un kick con tono definido que coincide con la tónica o la quinta convive mejor con el bajo.' },
      { q: 'Do mayor y La menor...', options: ['No comparten notas', 'Comparten exactamente las mismas notas', 'Son la misma tonalidad', 'Solo comparten Do'], answer: 1, why: 'Son relativas: mismas 7 notas, distinta tónica.' },
    ],
  },

  // ------------------------------------------------------------------
  {
    id: 'l1-midi',
    level: 1,
    title: 'MIDI: partituras para instrumentos virtuales',
    summary: 'Notas, duración y velocity. El MIDI no es sonido: son instrucciones.',
    minutes: 15,
    ready: true,
    explanation: [
      'MIDI no es audio. Es un conjunto de INSTRUCCIONES: qué nota tocar, cuándo empieza, cuánto dura y con qué fuerza (velocity). Un instrumento virtual (sintetizador o sampler) recibe esas instrucciones y genera el sonido.',
      'Ventaja enorme: puedes cambiar notas, ritmo o incluso el instrumento sin volver a grabar. Un mismo patrón MIDI puede sonar como piano, bajo o pad.',
      'La VELOCITY (0–127) es la fuerza con que se toca la nota. Variarla un poco en los hi-hats o el piano hace que suenen más humanos.',
      'El editor MIDI de REAPER (piano roll) muestra el tiempo en horizontal y la altura de las notas en vertical, con un carril de velocity abajo.',
    ],
    keyPoints: ['MIDI = instrucciones, no sonido.', 'Nota + inicio + duración + velocity.', 'Velocity 0–127.', 'El instrumento virtual convierte MIDI en audio.'],
    visual: { kind: 'piano-roll', caption: 'Mini piano roll: haz clic en las casillas para crear notas y reprodúcelas.' },
    example: {
      title: 'El mismo MIDI, dos instrumentos',
      text: 'Un patrón de 4 notas en La menor tocado con un sonido de bajo suena a línea de bajo; el mismo patrón una octava arriba con un piano eléctrico suena a riff de acordes.',
    },
    reaper: [
      { text: 'Inserta un instrumento virtual en una pista nueva (por ejemplo ReaSynth).', menu: { en: ['Insert', 'Virtual instrument on new track...'], es: ['Insertar', 'Instrumento virtual en nueva pista...'] }, level: 'verificado' },
      { text: 'Crea una selección de tiempo de 1 compás en la regla e inserta un ítem MIDI nuevo.', menu: { en: ['Insert', 'New MIDI item'], es: ['Insertar', 'Nuevo ítem MIDI'] }, level: 'verificado' },
      { text: 'Doble clic sobre el ítem para abrir el editor MIDI.', level: 'verificado' },
      { text: 'Elige la cuadrícula 1/16 en el selector de cuadrícula ("Grid") de la barra inferior del editor.', level: 'confirmar' },
      { text: 'Haz clic y arrastra en una zona vacía para dibujar una nota. Selecciona una nota y pulsa Supr (Delete) para borrarla.', level: 'verificado' },
      { text: 'Ajusta la velocity arrastrando las barras del carril inferior del editor ("Velocity").', level: 'verificado' },
    ],
    exercise: {
      goal: 'Programar un patrón de 4 notas y cambiar su velocity.',
      steps: [
        'En el mini piano roll de esta lección crea un patrón de 4 notas y escúchalo.',
        'En REAPER, crea un ítem MIDI de 1 compás con ReaSynth.',
        'Dibuja las notas A2, C3, E3, A2 en los pulsos 1, 2, 3 y 4.',
        'Baja la velocity de las notas 2 y 4 a la mitad. Reproduce en bucle y nota la diferencia.',
      ],
      check: ['Dibujé notas en el editor MIDI de REAPER', 'Cambié la velocity', 'Entiendo que MIDI no es audio'],
    },
    mistakes: [
      { error: 'Crear un ítem MIDI en una pista sin instrumento y no oír nada.', fix: 'El MIDI necesita un instrumento virtual en la cadena de FX de la pista.' },
      { error: 'Todas las notas con velocity 127 (máxima).', fix: 'Varía la velocity: suena más natural y deja más margen dinámico.' },
      { error: 'Dibujar notas sin cuadrícula y que queden fuera de tiempo.', fix: 'Activa la cuadrícula a 1/16 o usa la cuantización.' },
    ],
    quiz: [
      { q: '¿Qué contiene un ítem MIDI?', options: ['Sonido grabado', 'Instrucciones de notas (altura, tiempo, duración, velocity)', 'Un plugin', 'Un archivo MP3'], answer: 1, why: 'MIDI son datos de interpretación, no audio.' },
      { q: 'Tienes un ítem MIDI pero no suena nada. Causa más probable:', options: ['El BPM está mal', 'No hay un instrumento virtual en la pista', 'La velocity es 64', 'El proyecto no está guardado'], answer: 1, why: 'Sin instrumento virtual, el MIDI no genera sonido.' },
      { q: 'El rango de la velocity MIDI es...', options: ['0–10', '0–100', '0–127', '20–20000'], answer: 2, why: 'MIDI usa valores de 0 a 127.' },
      { q: 'Una ventaja del MIDI frente al audio:', options: ['Siempre suena mejor', 'Puedes cambiar notas e instrumento sin regrabar', 'No necesita CPU', 'No necesita tempo'], answer: 1, why: 'El MIDI es editable nota a nota y puedes cambiar el instrumento que lo toca.' },
    ],
  },

  // ------------------------------------------------------------------
  {
    id: 'l1-audio',
    level: 1,
    title: 'Audio: ondas, frecuencia y nivel',
    summary: 'Qué es una onda, graves vs. agudos, decibelios y por qué no debes pasar de 0 dBFS.',
    minutes: 15,
    ready: true,
    explanation: [
      'El sonido es vibración del aire. El audio digital guarda esa vibración como miles de muestras por segundo (44.100 o 48.000 por segundo: la frecuencia de muestreo).',
      'La FRECUENCIA (Hz) es cuántas veces vibra por segundo: graves = pocos Hz (un kick tiene su cuerpo aprox. entre 50 y 100 Hz), agudos = muchos Hz (los hi-hats brillan aprox. entre 6 y 12 kHz). El oído humano llega aprox. de 20 Hz a 20 kHz.',
      'El NIVEL se mide en decibelios. En digital, el máximo es 0 dBFS: si lo superas, la señal se recorta (clipping) y aparece distorsión. Por eso se trabaja con margen (headroom).',
      'Un ítem de audio en REAPER muestra la forma de onda: picos altos = partes fuertes. A diferencia del MIDI, el audio ya es sonido: para cambiar sus notas hay que procesarlo o regrabarlo.',
    ],
    keyPoints: ['Hz = vibraciones por segundo (grave ↔ agudo).', 'Oído humano: aprox. 20 Hz – 20 kHz.', '0 dBFS = techo digital. Más = clipping.', 'Deja margen: picos de pista por debajo de 0 dBFS.'],
    visual: { kind: 'waveform', caption: 'Generador de tonos con osciloscopio: cambia frecuencia, forma de onda y nivel. Empieza con volumen bajo.' },
    example: {
      title: 'Frecuencias de una canción Deep House',
      text: 'Sub-bajo y cuerpo del kick: aprox. 40–100 Hz. Cuerpo del bajo y acordes graves: 100–300 Hz. Voces, pianos y pads: 300 Hz–3 kHz. Brillo de hats, shakers y aire: 6–16 kHz. Son zonas orientativas: cada sonido es distinto.',
    },
    reaper: [
      { text: 'Importa un archivo de audio (por ejemplo un sample de kick) a la pista seleccionada en la posición del cursor.', menu: { en: ['Insert', 'Media file...'], es: ['Insertar', 'Archivo multimedia...'] }, shortcut: 'Insert', level: 'verificado', tip: 'También puedes arrastrar el archivo desde el explorador de Windows a una pista.' },
      { text: 'Observa el medidor de nivel de la pista mientras reproduces: si se enciende en rojo (clip), baja el volumen o la ganancia.', level: 'verificado' },
      { text: 'Divide un ítem de audio en la posición del cursor.', shortcut: 'S', level: 'verificado' },
      { text: 'Ajusta el volumen del ítem arrastrando su línea superior hacia abajo (aparece al pasar el ratón por el borde superior del ítem).', level: 'confirmar' },
    ],
    exercise: {
      goal: 'Relacionar frecuencias con sonidos y vigilar el nivel.',
      steps: [
        'En el generador, con volumen bajo, escucha 50 Hz, 200 Hz, 1000 Hz y 8000 Hz. Anota cómo suena cada uno.',
        'Prueba las formas de onda seno y diente de sierra a 110 Hz: ¿cuál tiene más "brillo"?',
        'En REAPER, importa un sample de kick y uno de hi-hat. Reprodúcelos y observa sus formas de onda.',
        'Sube el fader de una pista hasta que el medidor llegue a rojo y vuelve a bajarlo.',
      ],
      check: ['Distingo graves, medios y agudos', 'Importé audio en REAPER', 'Sé reconocer cuándo una pista hace clip'],
    },
    mistakes: [
      { error: 'Escuchar frecuencias graves a volumen alto con auriculares.', fix: 'Protege tus oídos: empieza siempre con volumen bajo y súbelo poco a poco.' },
      { error: 'Llevar todas las pistas al máximo y que el master haga clip.', fix: 'Deja margen: que la mezcla completa tenga picos alrededor de -6 dBFS antes del mastering es un buen punto de partida.' },
      { error: 'Pensar que se puede editar un audio nota a nota como el MIDI.', fix: 'El audio ya es sonido; para eso necesitas otras herramientas (o trabajar con MIDI).' },
    ],
    quiz: [
      { q: '¿Qué indica la frecuencia de un sonido?', options: ['Su volumen', 'Si es grave o agudo', 'Su duración', 'Su paneo'], answer: 1, why: 'Más Hz = más agudo.' },
      { q: '¿Qué ocurre si una señal supera 0 dBFS?', options: ['Suena más profesional', 'Se recorta (clipping) y distorsiona', 'Se vuelve mono', 'Nada'], answer: 1, why: '0 dBFS es el techo digital; por encima la onda se recorta.' },
      { q: 'El cuerpo de un kick suele estar en...', options: ['Aprox. 50–100 Hz', 'Aprox. 2–5 kHz', 'Aprox. 10–16 kHz', 'Por encima de 20 kHz'], answer: 0, why: 'La energía grave del kick suele concentrarse aprox. entre 50 y 100 Hz.' },
      { q: '¿Qué atajo divide un ítem en la posición del cursor?', options: ['S', 'D', 'Ctrl+T', 'R'], answer: 0, why: 'S = Split items at edit or play cursor.' },
    ],
  },

  // ------------------------------------------------------------------
  {
    id: 'l1-patrones',
    level: 1,
    title: 'Patrones rítmicos',
    summary: 'Four-on-the-floor, contratiempos y swing: el esqueleto del Deep House.',
    minutes: 20,
    ready: true,
    explanation: [
      'El patrón base del house se llama FOUR-ON-THE-FLOOR ("cuatro al suelo"): un kick en cada pulso del compás (1, 2, 3, 4). Da la sensación de avance constante que hace bailar.',
      'Encima, el CLAP o SNARE suele caer en los pulsos 2 y 4 (el "backbeat"). El HI-HAT abierto en los contratiempos (las "y": entre pulso y pulso) crea el típico "tss" del house.',
      'Los hi-hats cerrados o shakers en semicorcheas rellenan el espacio. Con SWING (retrasar ligeramente las semicorcheas pares) el groove se vuelve más humano y "bailable", muy característico del Deep House.',
      'Las variaciones pequeñas (una percusión extra cada 4 compases, un hat que se calla) mantienen el interés sin perder el groove.',
    ],
    keyPoints: ['Kick: 1, 2, 3, 4.', 'Clap: 2 y 4.', 'Hat abierto: contratiempos.', 'Swing = groove más humano.'],
    visual: { kind: 'step-seq', preset: 'deep-basic', caption: 'Secuenciador de 16 pasos. Carga los patrones de ejemplo, modifícalos y ajusta el swing.' },
    example: {
      title: 'Groove Deep House básico (1 compás, 16 pasos)',
      text: 'Kick: pasos 1, 5, 9, 13. Clap: 5 y 13. Hat abierto: 3, 7, 11, 15. Shaker: todos los pasos con velocity variable. Swing moderado. Cárgalo en el secuenciador con el preset "Deep House básico".',
    },
    reaper: [
      { text: 'Crea una pista con un sampler por cada sonido de batería. REAPER incluye ReaSamplOmatic5000 (RS5k): arrastra un sample a su ventana para cargarlo.', menu: { en: ['Insert', 'Virtual instrument on new track...'], es: ['Insertar', 'Instrumento virtual en nueva pista...'] }, level: 'verificado', tip: 'En el buscador de FX escribe "ReaSamplOmatic" para encontrarlo.' },
      { text: 'Inserta un ítem MIDI de 1 compás, ábrelo y pon la cuadrícula en 1/16.', menu: { en: ['Insert', 'New MIDI item'], es: ['Insertar', 'Nuevo ítem MIDI'] }, level: 'verificado' },
      { text: 'Dibuja las notas en los pasos del patrón. Con RS5k, por defecto cualquier nota dispara el sample; usa una sola nota (p. ej. C4) por pista.', level: 'confirmar' },
      { text: 'Para el swing, selecciona las notas y usa la cuantización del editor MIDI, que incluye un ajuste de swing.', level: 'confirmar' },
      { text: 'Duplica el compás para tener 4: selecciona el ítem, copia (Ctrl+C), coloca el cursor al final y pega (Ctrl+V).', level: 'verificado' },
    ],
    exercise: {
      goal: 'Programar un groove de Deep House de 4 compases.',
      steps: [
        'En el secuenciador carga "Four-on-the-floor" y escúchalo. Luego carga "Deep House básico".',
        'Añade y quita pasos de shaker hasta que el groove te guste. Prueba el swing entre 0 % y 30 %.',
        'Recrea tu patrón en REAPER con RS5k (kick, clap, hat abierto, shaker) a tu BPM.',
        'Haz 4 compases e introduce una pequeña variación en el compás 4.',
      ],
      check: ['Mi kick está en los 4 pulsos', 'El clap cae en 2 y 4', 'El hat abierto cae en los contratiempos', 'Probé el swing'],
    },
    mistakes: [
      { error: 'Llenar todos los pasos con sonidos: groove saturado.', fix: 'El espacio también es ritmo. Empieza con poco y añade de uno en uno.' },
      { error: 'Todas las velocities iguales en hats y shakers.', fix: 'Alterna velocities (fuerte-débil) para dar movimiento.' },
      { error: 'Swing exagerado que suena descuadrado.', fix: 'Empieza con poco swing y súbelo poco a poco.' },
    ],
    quiz: [
      { q: '"Four-on-the-floor" significa...', options: ['Cuatro claps por compás', 'Un kick en cada pulso del compás', 'Cuatro pistas de batería', 'Un compás de 4 segundos'], answer: 1, why: 'Kick en 1, 2, 3 y 4.' },
      { q: '¿Dónde suele ir el clap en house?', options: ['En 1 y 3', 'En 2 y 4', 'En todos los pasos', 'Solo al final'], answer: 1, why: 'El backbeat (2 y 4) es la posición clásica del clap/snare.' },
      { q: 'En una rejilla de 16 pasos, los contratiempos de un compás son...', options: ['1, 5, 9, 13', '3, 7, 11, 15', '2, 4, 6, 8', '16'], answer: 1, why: 'Los pasos 3, 7, 11 y 15 caen justo entre los pulsos.' },
      { q: '¿Qué hace el swing?', options: ['Sube el BPM', 'Retrasa ligeramente algunas semicorcheas para dar groove humano', 'Añade reverb', 'Cambia la tonalidad'], answer: 1, why: 'El swing desplaza las semicorcheas pares para crear sensación de balanceo.' },
    ],
  },
];
