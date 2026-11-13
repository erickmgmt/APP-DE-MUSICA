import type { Lesson } from '../types';

/**
 * NIVEL 1 — FUNDAMENTOS
 * Toda la práctica se hace en el ESTUDIO de la propia app (menú Estudio).
 * Nota: el id 'l1-reaper' se conserva por compatibilidad con el progreso ya guardado.
 */
export const LEVEL1: Lesson[] = [
  // ------------------------------------------------------------------
  {
    id: 'l1-daw',
    level: 1,
    title: '¿Qué es un estudio digital (DAW)?',
    summary: 'El estudio completo dentro de tu dispositivo: pistas, instrumentos, efectos y mezclador.',
    minutes: 10,
    ready: true,
    explanation: [
      'DAW significa "Digital Audio Workstation" (estación de trabajo de audio digital): el programa donde se crea, edita, mezcla y exporta música. El Estudio de esta app es un DAW sencillo hecho para aprender.',
      'Piensa en un estudio físico: hay instrumentos, una consola de mezcla con faders, aparatos de efectos y una grabadora. Un DAW reúne todo eso en una pantalla.',
      'Todo se organiza en PISTAS. Cada pista es un sonido (kick, bajo, pad…) con lo que toca: golpes de batería o notas. Cada pista pasa por sus propios EFECTOS (EQ, reverb…) y termina en el MASTER, la salida final que escuchas y exportas.',
      'Recorrido de la señal: sonido → efectos de la pista → volumen y paneo → master → tus altavoces o el archivo WAV. Entender este recorrido te ayudará a resolver casi cualquier problema.',
    ],
    keyPoints: [
      'Pista = un carril para un sonido (kick, bajo, pad...).',
      'Patrón = lo que toca la pista: golpes o notas.',
      'Efectos = transforman el sonido (EQ, reverb, delay...).',
      'Master = la suma de todas las pistas. Es lo que exportas.',
    ],
    visual: { kind: 'daw-map', caption: 'Recorrido de la señal dentro de un DAW. Toca cada bloque para ver qué hace.' },
    example: {
      title: 'Una canción Deep House vista como DAW',
      text: 'Pista Kick (golpes en los 4 pulsos), pista Bajo (notas graves), pista Pad (acordes largos con reverb). Todas suman en el Master, donde el limitador protege los picos antes de exportar.',
    },
    steps: [
      { text: 'Abre el menú Estudio y pulsa "Empezar con plantilla Deep House". Se crea una canción que ya suena.', view: 'pistas' },
      { text: 'Pulsa ▶ (reproducir). En la lista de la izquierda verás cada pista: Kick, Clap, Hat, Shaker, Bajo, Acordes y Pad.' },
      { text: 'Pulsa M en una pista para silenciarla y S para escucharla sola. Así descubres qué aporta cada sonido.' },
      { text: 'Abre la pestaña Mezcla: cada pista es un canal con volumen y efectos, y arriba está el Master.', view: 'mezcla' },
    ],
    exercise: {
      goal: 'Abrir tu primera canción y reconocer sus pistas y el master.',
      steps: [
        'Crea la canción con la plantilla Deep House desde el Estudio.',
        'Reprodúcela y silencia (M) cada pista una por una.',
        'Escucha el Bajo solo (S) y luego el Kick solo.',
        'Abre la pestaña Mezcla y localiza el Master.',
      ],
      check: ['Creé mi canción desde la plantilla', 'Sé silenciar (M) y escuchar en solo (S) una pista', 'Encontré el Master en la pestaña Mezcla'],
    },
    mistakes: [
      { error: 'Dejar una pista en solo (S) y pensar que las demás se borraron.', fix: 'Si solo suena una pista, revisa si tiene la S encendida y apágala.' },
      { error: 'Dejar todas las pistas con nombres genéricos.', fix: 'Pon nombre a cada pista (toca su nombre en el editor). En canciones grandes es imprescindible.' },
      { error: 'Confundir el volumen de una pista con el del master.', fix: 'El volumen de pista equilibra ese sonido; el del master cambia toda la canción.' },
    ],
    quiz: [
      { q: '¿Qué es un DAW?', options: ['Un tipo de altavoz', 'Un programa para crear, mezclar y exportar música', 'Una librería de samples', 'Un formato de audio'], answer: 1, why: 'Un DAW es el estudio completo dentro del ordenador o el teléfono.' },
      { q: '¿Dónde suenan juntas todas las pistas antes de exportar?', options: ['En el Master', 'En la primera pista', 'En el pad', 'En el metrónomo'], answer: 0, why: 'Todas las pistas suman en el Master, que es lo que escuchas y exportas.' },
      { q: '¿Para qué sirve el botón S de una pista?', options: ['Para guardarla', 'Para escucharla sola', 'Para borrarla', 'Para subir el volumen'], answer: 1, why: 'S = Solo: suena solo esa pista. M = Mute: la silencia.' },
      { q: 'Lo que toca una pista (golpes o notas) se llama…', options: ['Master', 'Patrón', 'Fader', 'Limitador'], answer: 1, why: 'El patrón es el contenido musical de la pista, que se repite en bucle.' },
    ],
  },

  // ------------------------------------------------------------------
  {
    id: 'l1-reaper',
    level: 1,
    title: 'Cómo funciona el Estudio de la app',
    summary: 'Transporte, pistas, editor, mezcla y estructura: el mapa del estudio y cómo cuidar tu equipo.',
    minutes: 12,
    ready: true,
    explanation: [
      'El Estudio tiene cinco zonas: el TRANSPORTE arriba (reproducir, modo Loop/Canción, posición, BPM, deshacer y exportar), la lista de PISTAS, el EDITOR de la pista elegida, la pestaña MEZCLA y la pestaña ESTRUCTURA.',
      'Modo Loop: repite tu patrón de 1, 2 o 4 compases con todas las pistas; es donde se crea. Modo Canción: recorre la Estructura (Intro, Groove, Break, Drop…) y es lo que se exporta.',
      'La posición se muestra como compás.pulso (por ejemplo 3.2 = compás 3, pulso 2). Todo se guarda solo: arriba verás "Guardando…" y luego "Guardado". El botón ↶ deshace el último cambio.',
      'Tu equipo es modesto (Celeron N4020). Todo el sonido se genera en el dispositivo: si oyes cortes, cierra otras pestañas y aplicaciones, y usa menos pistas a la vez.',
    ],
    keyPoints: ['Transporte = reproducir, Loop/Canción, BPM, deshacer, exportar.', 'Pistas + Editor = donde se crea el patrón.', 'Mezcla = volumen y efectos.', 'Estructura = convierte el loop en canción.'],
    visual: { kind: 'studio-map', caption: 'Mapa simplificado del Estudio. Toca cada zona.' },
    example: {
      title: 'Flujo de trabajo típico',
      text: 'Creas el groove en modo Loop (Pistas), equilibras volúmenes (Mezcla), decides qué suena en cada parte (Estructura), lo escuchas en modo Canción y lo exportas a WAV.',
    },
    steps: [
      { text: 'Pulsa ▶ para reproducir y ■ para detener. En ordenador también funciona la barra espaciadora.', view: 'pistas' },
      { text: 'Cambia entre Loop y Canción en el transporte y observa cómo cambia la posición.' },
      { text: 'Toca una pista en la lista: su editor aparece a la derecha (o debajo en el teléfono).' },
      { text: 'Haz un cambio cualquiera y pulsa ↶ (deshacer) para volver atrás.' },
      { text: 'Si oyes cortes o chasquidos, cierra otras aplicaciones y pestañas del navegador.', tip: 'Los cortes al reproducir no afectan al WAV exportado: la exportación se calcula aparte, sin prisas.' },
    ],
    exercise: {
      goal: 'Moverte con soltura por el Estudio.',
      steps: [
        'Abre tu canción en el Estudio y reprodúcela en modo Loop.',
        'Cambia a modo Canción y deja que suene la Intro.',
        'Visita las pestañas Pistas, Mezcla y Estructura.',
        'Haz un cambio y deshazlo con ↶.',
      ],
      check: ['Sé la diferencia entre modo Loop y modo Canción', 'Sé leer la posición compás.pulso', 'Sé deshacer un cambio'],
    },
    mistakes: [
      { error: 'Exportar en modo Loop pensando que saldrá la canción completa.', fix: 'La exportación usa la Estructura. Revisa la pestaña Estructura antes de exportar.' },
      { error: 'Tener muchas pestañas y apps abiertas mientras produces.', fix: 'Cierra lo que no uses: el sonido se calcula en tu dispositivo y necesita CPU.' },
      { error: 'Asustarse al no ver un botón de guardar.', fix: 'El estudio guarda solo. Además, haz copias de seguridad en Sistema.' },
    ],
    quiz: [
      { q: '¿Qué hace el modo Canción?', options: ['Repite el loop sin fin', 'Recorre la Estructura (intro, drop…)', 'Graba con el micrófono', 'Borra la canción'], answer: 1, why: 'Canción reproduce las partes de la Estructura en orden; Loop repite el patrón.' },
      { q: 'La posición 5.3 significa…', options: ['Minuto 5, segundo 3', 'Compás 5, pulso 3', 'Pista 5, nota 3', 'BPM 53'], answer: 1, why: 'Formato compás.pulso.' },
      { q: 'Oyes cortes al reproducir. ¿Qué haces primero?', options: ['Borrar el kick', 'Cerrar otras apps y pestañas', 'Subir el volumen', 'Cambiar de tonalidad'], answer: 1, why: 'Los cortes suelen ser falta de CPU; libera recursos.' },
      { q: '¿Qué usa la exportación a WAV?', options: ['Solo la pista seleccionada', 'La Estructura de la canción', 'El metrónomo', 'Nada, hay que grabarla'], answer: 1, why: 'Se renderiza la canción según la Estructura (si no hay partes, el loop).' },
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
      'Decide el BPM al principio. En el estudio de la app puedes cambiarlo cuando quieras (las notas se adaptan), pero tus samples de audio con ritmo propio (loops) no se estiran: quedarían desalineados.',
    ],
    keyPoints: ['BPM = pulsos por minuto.', 'Duración de un pulso = 60 ÷ BPM segundos.', 'Deep House: aprox. 118–125 BPM.', 'Los loops de audio tienen su propio BPM.'],
    visual: { kind: 'metronome', caption: 'Metrónomo interactivo: cambia el BPM o marca el tempo tocando el botón TAP.' },
    example: {
      title: 'Deep House a 122 BPM',
      text: 'A 122 BPM cada pulso dura unos 492 ms y un compás de 4 pulsos unos 1,97 s. Un bloque de 16 compases (una sección típica) dura unos 31 segundos.',
    },
    steps: [
      { text: 'En el transporte del Estudio, usa − y + junto al número de BPM para cambiar el tempo mientras suena.', view: 'pistas' },
      { text: 'Prueba 118, 122 y 126 BPM con la plantilla y elige el que mejor te suene.' },
      { text: 'En la pestaña Estructura verás cómo cambia la duración total de la canción al cambiar el BPM.', view: 'estructura' },
    ],
    exercise: {
      goal: 'Sentir la diferencia entre tempos y elegir el de tu canción.',
      steps: [
        'En el metrónomo de esta lección escucha 100, 122 y 128 BPM.',
        'Pon una canción de Deep House que te guste y usa TAP al ritmo del kick durante 8 pulsos. Anota el BPM.',
        'En el Estudio, pon tu canción a ese BPM con − y +.',
        'Compara con el BPM de la plantilla (122). ¿Cuál prefieres?',
      ],
      check: ['Medí el BPM de una canción real con TAP', 'Cambié el BPM de mi canción en el Estudio', 'Entiendo por qué 120–124 BPM es típico del Deep House'],
    },
    mistakes: [
      { error: 'Usar loops de audio de otro BPM.', fix: 'Mira el BPM del loop (suele venir en el nombre del archivo) y pon tu canción a ese tempo.' },
      { error: 'Confundir la "energía" con el BPM.', fix: 'Una canción puede sentirse intensa a 120 BPM y relajada a 128. La energía depende también del groove y del arreglo.' },
    ],
    quiz: [
      { q: 'A 120 BPM, ¿cuánto dura un pulso?', options: ['1 segundo', '0,5 segundos', '2 segundos', '0,12 segundos'], answer: 1, why: '60 ÷ 120 = 0,5 s.' },
      { q: '¿Qué rango es típico del Deep House?', options: ['70–80 BPM', '118–125 BPM', '140–150 BPM', '170–175 BPM'], answer: 1, why: 'El Deep House suele estar aproximadamente entre 118 y 125 BPM.' },
      { q: '¿Dónde cambias el BPM en el Estudio?', options: ['En el transporte, con − y +', 'En la pestaña Mezcla', 'En el editor de notas', 'No se puede'], answer: 0, why: 'El BPM está en el transporte, arriba.' },
      { q: '¿Qué pasa con un loop de audio de 125 BPM en una canción a 120?', options: ['Se adapta solo', 'Queda desalineado con el resto', 'Suena más grave', 'Nada'], answer: 1, why: 'El audio tiene su propio tempo; las notas del estudio sí se adaptan.' },
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
      'Los pulsos se agrupan en COMPASES. Casi toda la música de baile usa 4/4: cuatro pulsos por compás. El primer pulso de cada compás se siente más fuerte.',
      'Cada pulso se puede dividir: en 2 (corcheas, 1/8), en 4 (semicorcheas, 1/16). Las semicorcheas son la rejilla básica para programar baterías: 16 casillas por compás. Es exactamente la rejilla del editor de batería del Estudio.',
      'Las canciones se construyen en bloques de 4, 8, 16 o 32 compases. Los DJ y el público esperan cambios en esos múltiplos: por eso las partes de la Estructura suelen durar 8, 16 o 32 compases.',
      'Tu loop puede durar 1, 2 o 4 compases (Ajustes del loop). Con 4 compases puedes hacer variaciones, por ejemplo cambiar el acorde en el compás 3.',
    ],
    keyPoints: ['4/4 = cuatro pulsos por compás.', '1 compás = 16 semicorcheas = 16 casillas.', 'Las partes se miden en bloques de 8, 16 o 32 compases.', 'El loop del estudio dura 1, 2 o 4 compases.'],
    visual: { kind: 'bar-grid', caption: 'Un compás de 4/4 dividido en pulsos y semicorcheas. Pulsa reproducir para seguir el cursor.' },
    example: {
      title: 'Contar como un productor',
      text: '"1 e y a, 2 e y a, 3 e y a, 4 e y a": cada sílaba es una semicorchea (una casilla). En Deep House el kick cae en 1, 2, 3 y 4; el hi-hat abierto suele caer en las "y" (contratiempos).',
    },
    steps: [
      { text: 'En el editor de batería, las 16 casillas son un compás. Los números 1, 2, 3 y 4 marcan los pulsos.', view: 'pistas' },
      { text: 'Con un loop de 4 compases, cambia de compás con las pestañas "Compás 1…4" encima de las casillas.' },
      { text: 'En "Ajustes del loop" cambia la duración a 1, 2 o 4 compases: lo programado se repite o se recorta.' },
    ],
    exercise: {
      goal: 'Contar compases y relacionarlos con la rejilla del estudio.',
      steps: [
        'En la cuadrícula de esta lección reproduce y cuenta en voz alta "1 e y a 2 e y a...".',
        'En el Estudio, abre la pista Kick y localiza los pulsos 1, 2, 3 y 4.',
        'Reproduce en Loop y observa la posición (compás.pulso) en el transporte.',
        'Cuenta cuántos compases pasan antes de que el loop vuelva a empezar.',
      ],
      check: ['Puedo contar 16 semicorcheas en un compás', 'Sé cambiar de compás en el editor', 'Sé leer la posición compás.pulso'],
    },
    mistakes: [
      { error: 'Hacer partes de longitudes raras (7 o 13 compases) sin intención.', fix: 'Usa bloques de 4, 8, 16 y 32 compases. Rompe la regla solo cuando sepas por qué.' },
      { error: 'Programar solo el compás 1 de un loop de 4 y dejar los demás vacíos.', fix: 'Usa "Copiar este compás a todos" y luego varía algún detalle.' },
    ],
    quiz: [
      { q: '¿Cuántos pulsos tiene un compás de 4/4?', options: ['2', '3', '4', '16'], answer: 2, why: '4/4 = cuatro pulsos (negras) por compás.' },
      { q: '¿Cuántas semicorcheas hay en un compás de 4/4?', options: ['4', '8', '12', '16'], answer: 3, why: '4 pulsos × 4 semicorcheas = 16 (las 16 casillas del editor).' },
      { q: 'En el transporte, "9.3" significa…', options: ['Minuto 9, segundo 3', 'Compás 9, pulso 3', 'Pista 9, nota 3', 'BPM 93'], answer: 1, why: 'El formato es compás.pulso.' },
      { q: '¿Por qué las partes suelen durar 8 o 16 compases?', options: ['Por una limitación de la app', 'Porque el oído y los DJ esperan cambios en esos bloques', 'Porque ocupa menos memoria', 'Es obligatorio'], answer: 1, why: 'La música de baile se estructura en frases de 8/16/32 compases.' },
    ],
  },

  // ------------------------------------------------------------------
  {
    id: 'l1-notas',
    level: 1,
    title: 'Notas musicales',
    summary: 'Las 12 notas, teclas blancas y negras, octavas y cómo se nombran.',
    minutes: 12,
    ready: true,
    explanation: [
      'En la música occidental hay 12 notas que se repiten: Do, Do#, Re, Re#, Mi, Fa, Fa#, Sol, Sol#, La, La#, Si. Después vuelve a empezar Do, una OCTAVA más aguda.',
      'Casi todo el software musical usa la notación anglosajona: C=Do, D=Re, E=Mi, F=Fa, G=Sol, A=La, B=Si. El signo # (sostenido) sube medio tono: C# = Do#. En el editor de notas del Estudio puedes cambiar entre "C D E" y "Do Re Mi".',
      'En el teclado, las teclas blancas son las notas naturales y las negras son los sostenidos/bemoles. Entre Mi-Fa y Si-Do no hay tecla negra: ahí la distancia es de solo medio tono (semitono).',
      'El número indica la octava: C4 es el Do central (nota MIDI 60). Los bajos están en octavas 1–2; los pads y acordes en 3–5.',
    ],
    keyPoints: ['12 notas por octava.', 'C D E F G A B = Do Re Mi Fa Sol La Si.', '# = medio tono más agudo.', 'C4 = Do central = nota MIDI 60.'],
    visual: { kind: 'piano', caption: 'Teclado interactivo. Tócalo con el ratón o el dedo; activa los nombres en español o inglés.' },
    example: {
      title: 'Dónde vive cada instrumento',
      text: 'Un bajo de Deep House suele tocar entre C1 y C3 (aprox. 33–131 Hz). Un pad de acordes funciona bien entre C3 y C5. Una melodía suele estar por encima de C4.',
    },
    steps: [
      { text: 'En el Estudio toca la pista Bajo: el editor de notas muestra los nombres de nota a la izquierda.', view: 'pistas' },
      { text: 'Toca un nombre de nota (columna izquierda) para escucharla sin añadirla.' },
      { text: 'Usa el botón "C D E / Do Re Mi" para cambiar la notación, y las flechas de "Octava" para subir o bajar.' },
    ],
    exercise: {
      goal: 'Reconocer las notas en el teclado y en el editor del Estudio.',
      steps: [
        'En el teclado de esta lección toca todas las teclas blancas desde C4 hasta C5.',
        'Encuentra los dos lugares donde no hay tecla negra entre dos blancas (E-F y B-C).',
        'En el editor del Bajo, quita "Solo notas de…" para ver las 12 notas y localiza A1 y C2.',
        'Escribe en tus notas: ¿en qué octava sonaría un bajo?',
      ],
      check: ['Sé encontrar C (Do) en el teclado', 'Conozco la equivalencia Do=C … Si=B', 'Sé escuchar una nota en el editor del Estudio'],
    },
    mistakes: [
      { error: 'Pensar que solo existen 7 notas.', fix: 'Hay 12: las 7 naturales y 5 alteradas (teclas negras).' },
      { error: 'Programar el bajo en una octava demasiado aguda o demasiado grave.', fix: 'Para bajos usa aprox. C1–C3. Por debajo de ~30 Hz casi no se oye en altavoces normales.' },
    ],
    quiz: [
      { q: '¿Cómo se llama "La" en notación anglosajona?', options: ['L', 'A', 'G', 'B'], answer: 1, why: 'A = La. (G = Sol, B = Si).' },
      { q: '¿Cuántas notas distintas hay en una octava?', options: ['7', '8', '12', '24'], answer: 2, why: '7 naturales + 5 alteradas = 12.' },
      { q: '¿Entre qué notas NO hay tecla negra?', options: ['C-D', 'E-F', 'G-A', 'A-B'], answer: 1, why: 'Entre Mi-Fa (E-F) y Si-Do (B-C) hay solo un semitono.' },
      { q: 'La nota MIDI 60 es…', options: ['C3', 'C4 (Do central)', 'C5', 'A4'], answer: 1, why: 'MIDI 60 = C4, el Do central.' },
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
      text: 'La menor natural = A B C D E F G: solo teclas blancas. Por eso la plantilla Deep House está en La menor.',
    },
    steps: [
      { text: 'En el editor de notas, la casilla "Solo notas de A menor" muestra solo las notas de la escala de tu canción: así no puedes desafinar.', view: 'pistas' },
      { text: 'Las filas en turquesa son la tónica (La). Empezar y terminar en ella da sensación de "casa".' },
      { text: 'La escala viene de la tonalidad del proyecto (Guía › Ficha del proyecto).' },
    ],
    exercise: {
      goal: 'Escribir una melodía de 8 notas usando solo la escala.',
      steps: [
        'En el reproductor de escalas elige tónica A y "Pentatónica menor". Escúchala: A, C, D, E, G.',
        'En el Estudio añade una pista con el instrumento "Pluck" (Añadir pista › Instrumentos).',
        'Con "Solo notas de A menor" activado, coloca 8 notas usando A, C, D, E y G.',
        'Reprodúcelo en Loop y cambia notas hasta que te guste.',
      ],
      check: ['Escuché la diferencia entre mayor y menor', 'Escribí 8 notas dentro de la escala', 'La melodía no tiene notas "fuera"'],
    },
    mistakes: [
      { error: 'Usar notas al azar y que la melodía suene "desafinada".', fix: 'Activa "Solo notas de la escala" mientras aprendes.' },
      { error: 'Creer que la escala mayor es "mejor".', fix: 'Ninguna es mejor; cada una tiene un carácter. Para Deep House las menores suelen encajar con la atmósfera.' },
    ],
    quiz: [
      { q: '¿Qué es la tónica?', options: ['La nota más aguda', 'La nota principal o "casa" de la escala', 'Un tipo de acorde', 'Un efecto'], answer: 1, why: 'La tónica da nombre a la escala y es donde la música "descansa".' },
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
      'La tonalidad también afecta al bajo: si la tónica es muy grave (por ejemplo Fa, ~44 Hz en F1), el bajo tendrá más peso; tonalidades como La (A1 ≈ 55 Hz) dejan el bajo en una zona cómoda para casi todos los altavoces.',
      'Afinar el kick a la tonalidad es una práctica habitual: si el kick tiene una nota clara, que coincida con la tónica (o la quinta) evita choques con el bajo. En el estudio se hace con "Afinación" en el editor de batería.',
    ],
    keyPoints: ['Tonalidad = tónica + modo (mayor/menor).', 'Relativas: mismas notas, distinta "casa".', 'Todo el proyecto comparte una tonalidad.', 'Se define en la ficha del proyecto.'],
    visual: { kind: 'key-explorer', caption: 'Explorador de tonalidades: elige una tonalidad, mira sus notas, su relativa y escucha sus acordes.' },
    example: {
      title: 'Elegir tonalidad para tu Deep House',
      text: 'Empieza por La menor: solo teclas blancas, bajo cómodo (A1 ≈ 55 Hz) y una sonoridad nocturna. Cuando domines el proceso, prueba Fa menor o Sol menor.',
    },
    steps: [
      { text: 'Abre Guía paso a paso › tu canción › Ficha del proyecto y elige la tonalidad. El editor de notas del Estudio la usa para "Solo notas de…" y para el modo Acorde.' },
      { text: 'En el editor de notas, el modo "Acorde" coloca de una vez un acorde de 4 notas de tu tonalidad (con séptima).', view: 'pistas' },
    ],
    exercise: {
      goal: 'Elegir la tonalidad de tu canción y escuchar sus acordes.',
      steps: [
        'En el explorador escucha La menor y Do mayor. Observa que tienen las mismas notas.',
        'Toca los acordes de La menor en el explorador (i, iv, v…). ¿Cuáles te gustan más?',
        'Comprueba en la ficha de tu proyecto que la tonalidad está definida.',
        'En el Estudio, usa el modo Acorde en la pista Acordes para probar otro acorde en el compás 3.',
      ],
      check: ['Entiendo qué es una tonalidad relativa', 'Mi proyecto tiene tonalidad definida', 'Probé el modo Acorde en el Estudio'],
    },
    mistakes: [
      { error: 'Usar samples con notas (loops) de tonalidades distintas sin transponerlos.', fix: 'Revisa la tonalidad del sample (suele venir en el nombre) y ajusta su "Afinación" en semitonos.' },
      { error: 'Cambiar de tonalidad a mitad del proyecto sin querer.', fix: 'Fíjala en la etapa 3 de la guía y no la cambies salvo que sepas por qué.' },
    ],
    quiz: [
      { q: '¿Cuál es la relativa menor de Do mayor?', options: ['Mi menor', 'La menor', 'Re menor', 'Do menor'], answer: 1, why: 'La relativa menor está 3 semitonos por debajo: La menor.' },
      { q: 'Una tonalidad se define por…', options: ['El BPM', 'La tónica y la escala (modo)', 'El número de pistas', 'El volumen'], answer: 1, why: 'Tónica + modo (mayor/menor).' },
      { q: '¿Por qué es útil afinar el kick a la tonalidad?', options: ['Para que suene más fuerte', 'Para evitar choques de notas con el bajo', 'Para ahorrar CPU', 'No sirve para nada'], answer: 1, why: 'Un kick con tono que coincide con la tónica o la quinta convive mejor con el bajo.' },
      { q: 'Do mayor y La menor…', options: ['No comparten notas', 'Comparten exactamente las mismas notas', 'Son la misma tonalidad', 'Solo comparten Do'], answer: 1, why: 'Son relativas: mismas 7 notas, distinta tónica.' },
    ],
  },

  // ------------------------------------------------------------------
  {
    id: 'l1-midi',
    level: 1,
    title: 'Notas e instrumentos (MIDI)',
    summary: 'Notas, duración y fuerza. Las notas no son sonido: son instrucciones para un instrumento.',
    minutes: 15,
    ready: true,
    explanation: [
      'Las notas que colocas en el editor no son audio: son INSTRUCCIONES (qué nota, cuándo empieza, cuánto dura y con qué fuerza). El instrumento de la pista las convierte en sonido. En los DAW esto se llama MIDI.',
      'Ventaja enorme: puedes cambiar notas, ritmo o incluso el instrumento sin volver a grabar. Las mismas notas pueden sonar como piano, bajo o pad: en el Estudio cambia el sonido con el botón del instrumento.',
      'La fuerza de cada golpe se llama VELOCITY (0–127 en MIDI). En el editor de batería, el modo "Acento" pone golpes más fuertes; alternar fuertes y suaves hace que suene más humano.',
      'El editor de notas (piano roll) muestra el tiempo en horizontal y la altura en vertical. La duración la eliges antes de tocar la casilla (1/16, 1/8, 1/4…).',
    ],
    keyPoints: ['Notas = instrucciones, no sonido.', 'Nota + inicio + duración + fuerza.', 'El instrumento convierte las notas en sonido.', 'Cambiar de instrumento no borra las notas.'],
    visual: { kind: 'piano-roll', caption: 'Mini piano roll: haz clic en las casillas para crear notas y reprodúcelas.' },
    example: {
      title: 'Las mismas notas, dos instrumentos',
      text: 'Un patrón de 4 notas en La menor tocado con "Bajo Deep" suena a línea de bajo; el mismo patrón una octava arriba con "Piano eléctrico" suena a riff.',
    },
    steps: [
      { text: 'Toca la pista Acordes y pulsa el botón con el nombre del instrumento (Piano eléctrico) para cambiarlo por "Órgano" o "Pluck": las notas no cambian, el sonido sí.', view: 'pistas' },
      { text: 'Elige una duración (1/16, 1/8, 1/4…) y toca una casilla vacía para poner una nota; tócala otra vez para quitarla.' },
      { text: 'En una pista de batería, activa "Acento" para poner golpes más fuertes.', tip: 'La fuerza nota a nota en el editor de notas todavía no se puede editar: todas suenan con la misma intensidad.' },
    ],
    exercise: {
      goal: 'Programar 4 notas y oírlas con dos instrumentos.',
      steps: [
        'En el mini piano roll de esta lección crea un patrón de 4 notas y escúchalo.',
        'En el Estudio, añade una pista "Piano suave" (Añadir pista › Instrumentos).',
        'Coloca A3, C4, E4 y A3 en los pulsos 1, 2, 3 y 4 del compás 1 (duración 1/4).',
        'Cambia el instrumento a "Pluck" y luego a "Campana". Escucha la diferencia.',
      ],
      check: ['Coloqué y quité notas en el editor', 'Cambié el instrumento sin perder las notas', 'Entiendo que las notas no son audio'],
    },
    mistakes: [
      { error: 'Poner notas demasiado largas que se pisan entre sí.', fix: 'Elige la duración antes de colocar la nota; usa 1/8 o 1/4 para empezar.' },
      { error: 'Todos los golpes de batería con la misma fuerza.', fix: 'Usa "Acento" en algunos golpes para dar movimiento.' },
    ],
    quiz: [
      { q: '¿Qué contienen las notas del editor?', options: ['Sonido grabado', 'Instrucciones (altura, tiempo, duración, fuerza)', 'Un efecto', 'Un archivo MP3'], answer: 1, why: 'Son datos de interpretación: el instrumento genera el sonido.' },
      { q: 'Cambias el instrumento de una pista. ¿Qué pasa con las notas?', options: ['Se borran', 'Se conservan y suenan con el nuevo instrumento', 'Se transponen solas', 'Se duplican'], answer: 1, why: 'Las notas son independientes del sonido.' },
      { q: 'En MIDI, la fuerza de una nota se llama…', options: ['Velocity', 'Pan', 'Reverb', 'BPM'], answer: 0, why: 'Velocity = fuerza (0–127).' },
      { q: '¿Qué controla "Duración" en el editor de notas?', options: ['El volumen', 'Cuánto dura la nota que vas a colocar', 'El BPM', 'La octava'], answer: 1, why: 'Se elige antes de tocar la casilla.' },
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
      'El sonido es vibración del aire. El audio digital guarda esa vibración como miles de muestras por segundo (44.100 o 48.000: la frecuencia de muestreo). Tus samples (archivos WAV, MP3…) son audio.',
      'La FRECUENCIA (Hz) es cuántas veces vibra por segundo: graves = pocos Hz (un kick tiene su cuerpo aprox. entre 50 y 100 Hz), agudos = muchos Hz (los hi-hats brillan aprox. entre 6 y 12 kHz). El oído humano llega aprox. de 20 Hz a 20 kHz.',
      'El NIVEL se mide en decibelios. En digital, el máximo es 0 dBFS: si lo superas, la señal se recorta (clipping) y aparece distorsión. Por eso se trabaja con margen (headroom).',
      'A diferencia de las notas, un sample de audio ya es sonido: puedes cambiar cuándo suena y su afinación, pero no sus notas internas.',
    ],
    keyPoints: ['Hz = vibraciones por segundo (grave ↔ agudo).', 'Oído humano: aprox. 20 Hz – 20 kHz.', '0 dBFS = techo digital. Más = clipping.', 'Deja margen: picos por debajo de 0 dBFS.'],
    visual: { kind: 'waveform', caption: 'Generador de tonos con osciloscopio: cambia frecuencia, forma de onda y nivel. Empieza con volumen bajo.' },
    example: {
      title: 'Frecuencias de una canción Deep House',
      text: 'Sub-bajo y cuerpo del kick: aprox. 40–100 Hz. Cuerpo del bajo y acordes graves: 100–300 Hz. Voces, pianos y pads: 300 Hz–3 kHz. Brillo de hats, shakers y aire: 6–16 kHz. Zonas orientativas: cada sonido es distinto.',
    },
    steps: [
      { text: 'En la pestaña Mezcla, el medidor del Master muestra el pico real de lo que suena. Si llega a 0 dBFS, baja volúmenes.', view: 'mezcla' },
      { text: 'El espectro en vivo de la Mezcla muestra dónde hay energía: izquierda = graves, derecha = agudos.' },
      { text: 'Para usar tu propio audio: Añadir pista › Mis samples › "Subir audio desde el dispositivo".', view: 'pistas', tip: 'Se guarda solo en tu dispositivo (máximo 15 MB por archivo).' },
    ],
    exercise: {
      goal: 'Relacionar frecuencias con sonidos y vigilar el nivel.',
      steps: [
        'En el generador, con volumen bajo, escucha 50 Hz, 200 Hz, 1000 Hz y 8000 Hz. Anota cómo suena cada uno.',
        'Prueba las formas de onda seno y diente de sierra a 110 Hz: ¿cuál tiene más "brillo"?',
        'En el Estudio, pon en solo el Kick y luego el Shaker mientras miras el espectro de la Mezcla.',
        'Sube el volumen master hasta que el pico se acerque a 0 dBFS y vuelve a bajarlo.',
      ],
      check: ['Distingo graves, medios y agudos', 'Vi en el espectro dónde suenan el kick y el shaker', 'Sé leer el medidor de pico del master'],
    },
    mistakes: [
      { error: 'Escuchar frecuencias graves a volumen alto con auriculares.', fix: 'Protege tus oídos: empieza siempre con volumen bajo.' },
      { error: 'Subir todas las pistas al máximo y que el master distorsione.', fix: 'Deja margen: que la mezcla tenga picos alrededor de -6 dBFS antes del volumen final.' },
    ],
    quiz: [
      { q: '¿Qué indica la frecuencia de un sonido?', options: ['Su volumen', 'Si es grave o agudo', 'Su duración', 'Su paneo'], answer: 1, why: 'Más Hz = más agudo.' },
      { q: '¿Qué ocurre si una señal supera 0 dBFS?', options: ['Suena más profesional', 'Se recorta (clipping) y distorsiona', 'Se vuelve mono', 'Nada'], answer: 1, why: '0 dBFS es el techo digital.' },
      { q: 'El cuerpo de un kick suele estar en…', options: ['Aprox. 50–100 Hz', 'Aprox. 2–5 kHz', 'Aprox. 10–16 kHz', 'Por encima de 20 kHz'], answer: 0, why: 'La energía grave del kick suele concentrarse aprox. entre 50 y 100 Hz.' },
      { q: 'Un sample de audio, a diferencia de las notas…', options: ['Ya es sonido grabado', 'No se puede usar en el estudio', 'No ocupa espacio', 'Cambia de tonalidad solo'], answer: 0, why: 'El audio ya es sonido; las notas son instrucciones.' },
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
      'Las variaciones pequeñas (una percusión extra en el compás 4, un hat que se calla) mantienen el interés sin perder el groove.',
    ],
    keyPoints: ['Kick: 1, 2, 3, 4.', 'Clap: 2 y 4.', 'Hat abierto: contratiempos.', 'Swing = groove más humano.'],
    visual: { kind: 'step-seq', preset: 'deep-basic', caption: 'Secuenciador de 16 pasos. Carga los patrones de ejemplo, modifícalos y ajusta el swing.' },
    example: {
      title: 'Groove Deep House básico (1 compás, 16 pasos)',
      text: 'Kick: pasos 1, 5, 9, 13. Clap: 5 y 13. Hat abierto: 3, 7, 11, 15. Shaker: todos los pasos alternando fuerte y suave. Swing moderado. Es lo que trae la plantilla Deep House.',
    },
    steps: [
      { text: 'En el Estudio, crea una canción vacía (Guía › Nueva canción › plantilla "Canción vacía") o usa la tuya.', view: 'pistas' },
      { text: 'Añadir pista › Batería: añade Clap, Hi-hat abierto y Shaker.' },
      { text: 'En cada pista toca las casillas del patrón. Usa "Copiar este compás a todos" para repetirlo en los 4 compases.' },
      { text: 'Ajusta el Swing en "Ajustes del loop" entre 10 % y 25 %.' },
      { text: 'En el compás 4 añade un golpe extra (por ejemplo un Rim) para crear una variación.' },
    ],
    exercise: {
      goal: 'Programar tu propio groove de Deep House de 4 compases.',
      steps: [
        'En el secuenciador de esta lección carga "Four-on-the-floor" y luego "Deep House básico".',
        'Recrea el groove en el Estudio con Kick, Clap, Hat abierto y Shaker.',
        'Prueba el swing entre 0 % y 30 %.',
        'Haz una pequeña variación en el compás 4.',
      ],
      check: ['Mi kick está en los 4 pulsos', 'El clap cae en 2 y 4', 'El hat abierto cae en los contratiempos', 'Probé el swing'],
    },
    mistakes: [
      { error: 'Llenar todos los pasos con sonidos: groove saturado.', fix: 'El espacio también es ritmo. Empieza con poco y añade de uno en uno.' },
      { error: 'Todos los golpes iguales en hats y shakers.', fix: 'Usa "Acento" en algunos golpes para dar movimiento.' },
      { error: 'Swing exagerado que suena descuadrado.', fix: 'Empieza con poco swing y súbelo poco a poco.' },
    ],
    quiz: [
      { q: '"Four-on-the-floor" significa…', options: ['Cuatro claps por compás', 'Un kick en cada pulso del compás', 'Cuatro pistas de batería', 'Un compás de 4 segundos'], answer: 1, why: 'Kick en 1, 2, 3 y 4.' },
      { q: '¿Dónde suele ir el clap en house?', options: ['En 1 y 3', 'En 2 y 4', 'En todos los pasos', 'Solo al final'], answer: 1, why: 'El backbeat (2 y 4) es la posición clásica del clap/snare.' },
      { q: 'En una rejilla de 16 pasos, los contratiempos de un compás son…', options: ['1, 5, 9, 13', '3, 7, 11, 15', '2, 4, 6, 8', '16'], answer: 1, why: 'Los pasos 3, 7, 11 y 15 caen justo entre los pulsos.' },
      { q: '¿Qué hace el swing?', options: ['Sube el BPM', 'Retrasa ligeramente algunas semicorcheas para dar groove humano', 'Añade reverb', 'Cambia la tonalidad'], answer: 1, why: 'El swing desplaza las semicorcheas pares para crear sensación de balanceo.' },
    ],
  },
];
