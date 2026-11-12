import type { ReaperStep } from '../types';
import type { Param } from '../producer/stages';

/**
 * Base de conocimiento del Profesor (modo offline).
 * Cada respuesta tiene las 6 partes: diagnóstico, explicación, solución, pasos en REAPER,
 * parámetros orientativos y cómo comprobar. `pluginCategory` permite sugerir TUS plugins.
 */
export interface TutorAnswer {
  id: string;
  title: string;
  triggers: string[][]; // grupos de términos normalizados (todos los del grupo deben aparecer)
  keywords: string[]; // términos sueltos que suman puntuación
  diagnosis: string;
  explanation: string;
  solution: string[];
  steps: ReaperStep[];
  params: Param[];
  verify: string[];
  pluginCategory?: string;
  lessons?: string[];
  stages?: string[];
}

export const TUTOR_KB: TutorAnswer[] = [
  {
    id: 'kick-bajo',
    title: 'El kick y el bajo se pelean',
    triggers: [['kick', 'bajo'], ['bombo', 'bajo'], ['kick', 'bass'], ['graves', 'chocan'], ['graves', 'pelean']],
    keywords: ['kick', 'bombo', 'bajo', 'bass', 'pelean', 'chocan', 'choque', 'graves', 'enmascar', 'embarr', 'sidechain'],
    diagnosis: 'Probablemente kick y bajo ocupan las mismas frecuencias graves (aprox. 40–120 Hz) al mismo tiempo, y uno tapa al otro (enmascaramiento).',
    explanation: 'Dos sonidos graves que suenan a la vez en la misma zona se suman y se confunden: pierdes pegada del kick y definición del bajo. Hay tres herramientas: ritmo (que no coincidan), sidechain (que el bajo se aparte cuando suena el kick) y EQ (que cada uno tenga su zona principal).',
    solution: [
      'Revisa el ritmo: desplaza notas del bajo para que no caigan siempre con el kick (contratiempos).',
      'Configura sidechain: el kick controla un compresor en el bajo.',
      'Decide quién manda en el sub-grave (normalmente el kick en su golpe) y recorta ligeramente esa zona en el otro con EQ.',
      'Revisa la tonalidad: si el kick tiene tono, que coincida con la tónica o la quinta.',
    ],
    steps: [
      { text: 'Pista del bajo › botón de ruteo (Route) › pon "Track channels" en 4.', level: 'confirmar' },
      { text: 'Pista del kick › Route › Add new send › elige la pista del bajo › destino de audio canales 3/4.', level: 'confirmar' },
      { text: 'Pista del bajo › botón FX › añade ReaComp › "Detector input": "Auxiliary Input L + R".', level: 'confirmar' },
      { text: 'Baja el Threshold de ReaComp hasta ver unos 3–6 dB de reducción en cada kick.', level: 'general' },
    ],
    params: [
      { name: 'Ratio', value: '4:1 o más' },
      { name: 'Attack', value: '0–2 ms' },
      { name: 'Release', value: 'aprox. 80–200 ms', note: 'Que el bajo se recupere antes del siguiente kick' },
      { name: 'Reducción', value: 'aprox. 3–6 dB' },
    ],
    verify: [
      'Escucha a volumen bajo: debes oír claramente cada golpe de kick y las notas del bajo.',
      'Mira el medidor de reducción de ReaComp: debe moverse con cada kick.',
      'Silencia y activa el sidechain (bypass) para comparar.',
    ],
    pluginCategory: 'comp',
    stages: ['bajo', 'mezcla'],
  },
  {
    id: 'profundidad',
    title: 'Quiero más profundidad / espacio',
    triggers: [['profundidad'], ['mas', 'espacio'], ['plana'], ['3d'], ['lejos'], ['atras']],
    keywords: ['profundidad', 'profunda', 'espacio', 'plana', 'plano', 'ambiente', 'atmosfera', 'reverb', 'delay', '3d', 'lejos', 'fondo'],
    diagnosis: 'La mezcla probablemente tiene todos los elementos "en primer plano": mismo nivel de brillo, poca reverb y poco contraste delante/detrás.',
    explanation: 'La profundidad se crea con contrastes: lo que está "delante" es más fuerte, más brillante y más seco; lo que está "detrás" es más suave, más oscuro y con más reverb. Si todo tiene el mismo tratamiento, la mezcla suena plana.',
    solution: [
      'Elige qué va delante (kick, bajo, elemento principal) y qué va detrás (pads, texturas).',
      'Crea una pista de reverb (envío) y manda más cantidad a los elementos de fondo.',
      'Oscurece ligeramente los elementos de fondo con un filtro paso bajo o un shelf de agudos.',
      'Usa un delay sincronizado en elementos melódicos para rellenar el espacio.',
      'Añade una textura de fondo muy suave (ver Biblioteca › Texturas).',
    ],
    steps: [
      { text: 'Inserta una pista nueva y nómbrala "Reverb".', shortcut: 'Ctrl+T', level: 'verificado' },
      { text: 'En esa pista, botón FX › añade ReaVerbate (o tu reverb) con Wet al 100 % y Dry al mínimo.', level: 'confirmar' },
      { text: 'Desde cada pista, crea un envío a "Reverb" (arrastra desde su botón Route hasta la pista Reverb) y ajusta el nivel del envío.', level: 'confirmar' },
      { text: 'En la pista Reverb, añade ReaEQ con un High Pass aprox. a 200–300 Hz para que la reverb no embarre los graves.', level: 'general' },
    ],
    params: [
      { name: 'Reverb · tamaño', value: 'Medio-grande para pads, pequeño para percusión' },
      { name: 'HPF en la reverb', value: 'aprox. 200–300 Hz' },
      { name: 'Delay', value: '1/8 con puntillo o 1/4, feedback bajo-medio' },
    ],
    verify: [
      'Cierra los ojos: ¿puedes señalar qué está delante y qué detrás?',
      'Desactiva el envío de reverb: la diferencia debe notarse, pero sin que la mezcla se vuelva turbia al activarlo.',
      'Escucha en mono: la reverb no debe tapar al kick ni al bajo.',
    ],
    pluginCategory: 'reverb',
    stages: ['texturas', 'mezcla'],
  },
  {
    id: 'segundo-drop',
    title: 'No sé qué poner en el segundo drop',
    triggers: [['segundo', 'drop'], ['drop', '2'], ['segunda', 'parte'], ['repetitiv']],
    keywords: ['segundo', 'drop', 'variacion', 'repetitivo', 'aburrido', 'igual', 'cambiar', 'segunda'],
    diagnosis: 'El segundo drop suele sonar igual que el primero y la canción pierde interés en la segunda mitad.',
    explanation: 'El oyente ya conoce el primer drop. El segundo debe ser reconocible (mismo groove y bajo) pero con algo nuevo. Una variación pequeña y bien colocada funciona mejor que añadir muchos elementos.',
    solution: [
      'Mantén kick, bajo y groove: son la identidad de la canción.',
      'Cambia UNA cosa importante: una nueva línea melódica, un vocal chop, un acorde distinto o una variación del bajo.',
      'Añade una capa de percusión nueva (congas, un shaker extra) que no estaba en el primer drop.',
      'Haz que el break previo sea distinto (más largo, más vacío o con un filtro) para que la llegada sorprenda.',
      'Si el primer drop tenía todo, prueba a quitar algo en el segundo y reintroducirlo después de 8 compases.',
    ],
    steps: [
      { text: 'Pon marcadores al inicio de cada drop para navegar rápido (tecla M y renombra con doble clic).', shortcut: 'M', level: 'verificado' },
      { text: 'Copia los ítems del primer drop al segundo (Ctrl+C / Ctrl+V) y modifica solo lo elegido.', level: 'verificado' },
    ],
    params: [
      { name: 'Variación', value: 'Cada 8 compases, un cambio pequeño' },
      { name: 'Elementos nuevos', value: '1 o 2, no más' },
    ],
    verify: [
      'Escucha la canción completa sin parar: ¿el segundo drop te sorprende un poco?',
      'Compara con una referencia: ¿qué cambia en su segundo drop?',
    ],
    stages: ['estructura', 'melodia'],
  },
  {
    id: 'opaca',
    title: 'Mi mezcla suena opaca / apagada',
    triggers: [['opaca'], ['apagada'], ['sin', 'brillo'], ['oscura'], ['tapada'], ['sorda']],
    keywords: ['opaca', 'opaco', 'apagada', 'brillo', 'oscura', 'tapada', 'sorda', 'agudos', 'claridad', 'definicion'],
    diagnosis: 'Probable exceso de medios-graves (aprox. 200–500 Hz) acumulados entre pistas o falta de brillo en los elementos que deberían aportarlo.',
    explanation: 'Cuando muchas pistas tienen energía en los medios-graves, la mezcla se percibe "tapada" aunque no falten agudos. Antes de subir agudos (que puede volverla estridente), limpia lo que sobra.',
    solution: [
      'Pon un filtro paso alto a todo lo que no necesita graves (pads, hats, percusión, reverbs).',
      'Busca acumulaciones en 200–500 Hz y recorta un poco donde sobren.',
      'Solo después, si falta brillo, añade un shelf de agudos suave en los elementos clave.',
      'Compara con una referencia al mismo volumen.',
    ],
    steps: [
      { text: 'En cada pista sin graves importantes: FX › ReaEQ › primera banda tipo "High Pass".', level: 'confirmar' },
      { text: 'Para encontrar zonas molestas: crea una banda estrecha con ganancia alta, barre la frecuencia, localiza la zona y luego RECORTA un poco.', level: 'general' },
      { text: 'Si tu ReaEQ no muestra el analizador, busca su opción para mostrar el espectro en la ventana del plugin.', level: 'confirmar' },
    ],
    params: [
      { name: 'HPF en pads y acordes', value: 'aprox. 100–200 Hz' },
      { name: 'Recorte en medios-graves', value: 'aprox. -2 a -4 dB en 200–500 Hz', note: 'Ancho moderado' },
      { name: 'Shelf de agudos', value: '+1 a +2 dB desde aprox. 8–10 kHz', note: 'Solo si falta' },
    ],
    verify: [
      'Activa y desactiva el EQ (bypass) al mismo volumen: debe sonar más clara, no solo más fuerte.',
      'Compara con tu referencia en el mismo punto de la canción.',
    ],
    pluginCategory: 'eq',
    stages: ['mezcla'],
  },
  {
    id: 'embarrada',
    title: 'La mezcla suena embarrada / turbia',
    triggers: [['embarrad'], ['turbia'], ['barro'], ['confusa'], ['saturada', 'graves']],
    keywords: ['embarrada', 'turbia', 'barro', 'confusa', 'graves', 'medios', 'acumul', 'mud'],
    diagnosis: 'Acumulación de energía en graves y medios-graves (aprox. 100–400 Hz): demasiados elementos compitiendo en esa zona.',
    explanation: 'Cada pista añade un poco de energía en los graves aunque no lo notes por separado. Sumadas, crean "barro". Solución: dar a cada zona un responsable principal.',
    solution: [
      'Deja los graves al kick y al bajo; filtra el resto.',
      'Revisa que acordes y pads no estén en la octava del bajo.',
      'Filtra los graves de las reverbs.',
      'Reduce el número de elementos que suenan a la vez.',
    ],
    steps: [
      { text: 'ReaEQ en pads, acordes, percusiones y reverbs con High Pass.', level: 'confirmar' },
      { text: 'Silencia (M) las pistas una a una para identificar cuál aporta más barro.', level: 'verificado' },
    ],
    params: [
      { name: 'HPF reverb', value: 'aprox. 200–300 Hz' },
      { name: 'HPF percusión/hats', value: 'aprox. 150–500 Hz según el sonido' },
    ],
    verify: ['Escucha en altavoces pequeños o en el móvil: ¿se distinguen kick y bajo?'],
    pluginCategory: 'eq',
    stages: ['mezcla', 'acordes'],
  },
  {
    id: 'despues-bateria',
    title: '¿Qué hago después de terminar la batería?',
    triggers: [['despues', 'bateria'], ['termine', 'bateria'], ['que', 'sigue'], ['siguiente', 'paso']],
    keywords: ['despues', 'bateria', 'sigue', 'siguiente', 'paso', 'ahora', 'termine', 'groove'],
    diagnosis: 'Tienes el groove y toca construir la base armónica y grave de la canción.',
    explanation: 'El orden habitual en música de baile es: batería → bajo → acordes → melodía → texturas → arreglo. El bajo va justo después porque define, con el kick, la parte más importante de la pista de baile.',
    solution: [
      'Siguiente: el BAJO, en tu tonalidad, dialogando con el kick (etapa 6 del Productor).',
      'Después: percusiones secundarias y acordes.',
      'Mantén el loop en 4–8 compases hasta que bajo + batería + acordes funcionen juntos.',
    ],
    steps: [
      { text: 'Inserta tu sinte de bajo en una pista nueva.', menu: { en: ['Insert', 'Virtual instrument on new track...'], es: ['Insertar', 'Instrumento virtual en nueva pista...'] }, level: 'verificado' },
      { text: 'Crea un ítem MIDI de 4 compases debajo del groove y programa la tónica en contratiempos.', menu: { en: ['Insert', 'New MIDI item'], es: ['Insertar', 'Nuevo ítem MIDI'] }, level: 'verificado' },
    ],
    params: [{ name: 'Octava del bajo', value: 'aprox. C1–C3' }],
    verify: ['El loop batería + bajo ya te hace mover la cabeza.', 'El bajo está en la tonalidad elegida.'],
    stages: ['bajo', 'percusiones', 'acordes'],
  },
  {
    id: 'volumen-bajo',
    title: 'Mi canción suena más baja que las comerciales',
    triggers: [['suena', 'bajo'], ['poco', 'volumen'], ['mas', 'fuerte'], ['no', 'suena', 'fuerte'], ['volumen', 'comercial']],
    keywords: ['volumen', 'fuerte', 'bajo', 'comercial', 'loudness', 'alto', 'lufs'],
    diagnosis: 'Es normal antes del mastering: la mezcla debe tener margen. El volumen comercial se consigue en el mastering con un limitador.',
    explanation: 'Subir los faders hasta el máximo produce clipping. El volumen percibido final lo da el limitador del mastering, y depende de una mezcla equilibrada. Ojo: más volumen no es mejor calidad, y las plataformas de streaming normalizan el volumen.',
    solution: [
      'No subas los faders para "ganar volumen": deja el master con picos aprox. en -6 dBFS.',
      'En el mastering, coloca un limitador al final del master y baja su threshold poco a poco.',
      'Mide LUFS en tus referencias y en tu canción con el mismo medidor.',
    ],
    steps: [
      { text: 'Master › botón FX › añade el medidor de loudness (busca "Loudness").', level: 'confirmar' },
      { text: 'Añade ReaLimit (o tu limitador) al final y ajusta su techo a aprox. -1 dB.', level: 'confirmar' },
    ],
    params: [
      { name: 'Techo del limitador', value: 'aprox. -1 dBTP' },
      { name: 'Reducción del limitador', value: 'Si pasa de unos pocos dB y se oye aplastado, revisa la mezcla' },
    ],
    verify: ['Compara con la referencia al mismo volumen percibido: ¿sigue sonando "peor" o solo más baja?'],
    pluginCategory: 'limiter',
    stages: ['mastering'],
    lessons: ['l1-audio'],
  },
  {
    id: 'clipping',
    title: 'Se distorsiona / el medidor se pone en rojo',
    triggers: [['rojo'], ['clip'], ['distorsion'], ['distorsiona'], ['satura', 'master']],
    keywords: ['rojo', 'clip', 'clipping', 'distorsion', 'distorsiona', 'satura', 'pico', 'picos'],
    diagnosis: 'La señal supera 0 dBFS en alguna pista o en el master (clipping).',
    explanation: 'En digital, 0 dBFS es el techo. Por encima, la onda se recorta y aparece distorsión. Suele pasar por acumulación: muchas pistas altas sumadas en el master.',
    solution: [
      'Identifica qué medidor está en rojo (pista o master).',
      'Baja el fader de las pistas más fuertes o la ganancia de entrada de los plugins.',
      'Si todo está alto, selecciona todas las pistas y bájalas a la vez.',
    ],
    steps: [
      { text: 'Haz clic en el indicador rojo de pico del medidor para reiniciarlo y vuelve a reproducir.', level: 'confirmar' },
      { text: 'Selecciona varias pistas (Ctrl+clic en sus nombres) y mueve un fader: se mueven todos los seleccionados.', level: 'verificado' },
    ],
    params: [
      { name: 'Picos de cada pista', value: 'Por debajo de 0 dBFS (aprox. -10 a -6 dBFS es cómodo)' },
      { name: 'Picos del master (mezcla)', value: 'aprox. -6 dBFS' },
    ],
    verify: ['Reproduce la parte más fuerte de la canción: ningún medidor debe llegar a rojo.'],
    stages: ['mezcla'],
    lessons: ['l1-audio'],
  },
  {
    id: 'cpu',
    title: 'REAPER se traba / chasquidos / CPU',
    triggers: [['chasquid'], ['cortes'], ['se', 'traba'], ['cpu'], ['lento'], ['crackl'], ['dropout']],
    keywords: ['chasquidos', 'cortes', 'traba', 'cpu', 'lento', 'pesado', 'congela', 'freeze', 'buffer', 'latencia'],
    diagnosis: 'Tu procesador no llega a calcular el audio a tiempo (Celeron N4020 + plugins pesados).',
    explanation: 'Cada plugin necesita CPU. Si el total supera lo que el equipo puede hacer en el tiempo del búfer, se producen cortes. No es un problema de la mezcla: el archivo exportado puede sonar bien.',
    solution: [
      'Sube el tamaño de búfer (512 o 1024).',
      'Congela (freeze) las pistas con sintetizadores pesados.',
      'Usa reverbs y delays en envíos compartidos en lugar de uno por pista.',
      'Prefiere plugins ligeros (ReaEQ, ReaComp, ReaVerbate, TAL-NoiseMaker...).',
      'Cierra otros programas y el navegador mientras produces.',
    ],
    steps: [
      { text: 'Options › Preferences › Audio › Device: sube "Request block size".', menu: { en: ['Options', 'Preferences', 'Audio', 'Device'], es: ['Opciones', 'Preferencias', 'Audio', 'Dispositivo'] }, shortcut: 'Ctrl+P', level: 'verificado' },
      { text: 'View › Performance meter para ver qué pistas consumen más.', menu: { en: ['View', 'Performance meter'], es: ['Ver', 'Medidor de rendimiento'] }, level: 'verificado' },
      { text: 'Clic derecho en la pista pesada › submenú de congelado (Freeze).', level: 'confirmar' },
    ],
    params: [{ name: 'Búfer', value: '512 (producir) · 1024 (mezclar)' }],
    verify: ['El medidor de rendimiento baja y desaparecen los cortes.'],
    lessons: ['l1-reaper'],
  },
  {
    id: 'midi-no-suena',
    title: 'Mi MIDI no suena',
    triggers: [['midi', 'no', 'suena'], ['no', 'se', 'oye'], ['no', 'suena', 'nada'], ['sin', 'sonido']],
    keywords: ['midi', 'suena', 'oye', 'silencio', 'sonido', 'instrumento'],
    diagnosis: 'Lo más probable: la pista no tiene un instrumento virtual, está silenciada o el volumen está abajo.',
    explanation: 'El MIDI son instrucciones: sin un instrumento virtual en la cadena de FX de la pista no se genera sonido.',
    solution: [
      'Comprueba que la pista tiene un instrumento (botón FX).',
      'Revisa que no esté en mute (M) ni que otra pista esté en solo (S).',
      'Revisa el fader de la pista y el del master.',
      'Comprueba que el ítem MIDI tiene notas y que no está silenciado.',
    ],
    steps: [
      { text: 'Botón FX de la pista: si está vacío, añade un instrumento (p. ej. ReaSynth).', level: 'verificado' },
      { text: 'Si quieres empezar de cero: Insert › Virtual instrument on new track…', menu: { en: ['Insert', 'Virtual instrument on new track...'], es: ['Insertar', 'Instrumento virtual en nueva pista...'] }, level: 'verificado' },
    ],
    params: [],
    verify: ['El medidor de la pista se mueve al reproducir.'],
    lessons: ['l1-midi'],
  },
  {
    id: 'hats-estridentes',
    title: 'Los hi-hats suenan chillones / estridentes',
    triggers: [['hats', 'chillon'], ['estridente'], ['agudos', 'molest'], ['hihat'], ['hi', 'hat'], ['hat', 'fuerte']],
    keywords: ['hats', 'hihat', 'hat', 'chillones', 'estridente', 'agudos', 'molestan', 'sibilante', 'cansa', 'shaker'],
    diagnosis: 'Exceso de energía en los agudos (aprox. 6–10 kHz) o hats demasiado fuertes en la mezcla.',
    explanation: 'Los agudos excesivos cansan el oído rápidamente, sobre todo en un género cálido como el Deep House. Muchas veces el problema es solo de volumen o de velocity.',
    solution: [
      'Baja primero el fader de los hats.',
      'Varía las velocities (fuerte-débil).',
      'Si siguen estridentes, recorta suavemente la zona molesta con EQ.',
      'Prueba otro sample más suave.',
    ],
    steps: [
      { text: 'ReaEQ en la pista de hats: banda tipo "Band" con ganancia negativa; barre aprox. entre 5 y 10 kHz hasta encontrar la zona molesta.', level: 'confirmar' },
    ],
    params: [{ name: 'Recorte', value: 'aprox. -2 a -4 dB', note: 'Ancho moderado' }],
    verify: ['Escucha 2 minutos a volumen moderado: ¿te cansan los agudos?', 'Compara con tu referencia.'],
    pluginCategory: 'eq',
    stages: ['groove', 'mezcla'],
  },
  {
    id: 'mono',
    title: 'En mono desaparecen elementos / problemas de estéreo',
    triggers: [['mono'], ['estereo'], ['fase'], ['desaparec']],
    keywords: ['mono', 'estereo', 'fase', 'ancho', 'desaparece', 'lados', 'wide'],
    diagnosis: 'Posibles problemas de fase: elementos muy abiertos en estéreo (efectos de ensanchado, chorus fuertes) se cancelan al sumarse en mono.',
    explanation: 'Muchos sistemas (móviles, altavoces de club, bluetooth) reproducen en mono o casi mono. Si un sonido existe solo por diferencias entre izquierda y derecha, en mono se cancela.',
    solution: [
      'Mantén kick, bajo y voz principal al centro.',
      'Reduce los ensanchadores estéreo en elementos importantes.',
      'Comprueba la mezcla en mono con regularidad.',
    ],
    steps: [
      { text: 'Para escuchar en mono puedes usar el botón de modo mono/estéreo del canal Master en el mezclador, si tu tema lo muestra, o un plugin de imagen estéreo en el master.', level: 'confirmar' },
    ],
    params: [{ name: 'Graves', value: 'Mono por debajo de aprox. 100–150 Hz', note: 'Orientativo' }],
    verify: ['En mono, todos los elementos importantes siguen ahí (aunque más estrechos).'],
    pluginCategory: 'stereo',
    stages: ['mezcla'],
  },
  {
    id: 'acordes',
    title: '¿Qué acordes uso?',
    triggers: [['acordes'], ['progresion'], ['armonia']],
    keywords: ['acordes', 'acorde', 'progresion', 'armonia', 'notas', 'piano'],
    diagnosis: 'Necesitas una progresión sencilla dentro de tu tonalidad.',
    explanation: 'Si construyes los acordes con las notas de tu escala, sonarán coherentes. En Deep House, los acordes menores con séptima o novena son muy característicos.',
    solution: [
      'En La menor prueba: Am7 (A C E G) → Dm7 (D F A C), dos compases cada uno.',
      'O: Am7 → Fmaj7 (F A C E) → Em7 (E G B D) → Dm7.',
      'Toca los acordes en la zona C3–C5 y deja que el bajo toque la raíz.',
    ],
    steps: [
      { text: 'En el editor MIDI, dibuja las notas de cada acorde una encima de otra en el mismo tiempo.', level: 'verificado' },
    ],
    params: [{ name: 'Registro', value: 'aprox. C3–C5' }],
    verify: ['El bajo y los acordes no chocan.', 'La progresión se puede repetir en bucle sin cansar.'],
    lessons: ['l1-escalas', 'l1-tonalidades'],
    stages: ['acordes'],
  },
  {
    id: 'loop',
    title: 'Tengo un loop y no sé convertirlo en canción',
    triggers: [['loop'], ['bucle'], ['convertir', 'cancion'], ['estructura'], ['arreglo']],
    keywords: ['loop', 'bucle', 'cancion', 'estructura', 'arreglo', 'alargar', 'secciones', 'atascado'],
    diagnosis: 'El clásico "bloqueo del loop": tienes los elementos pero no la estructura.',
    explanation: 'Una canción de baile es, en gran parte, tu loop con elementos que entran y salen en bloques de 8/16 compases. No necesitas material nuevo: necesitas decidir CUÁNDO suena cada cosa.',
    solution: [
      'Copia tu loop completo a lo largo de unos 6 minutos.',
      'Ahora RESTA: en la intro deja solo batería; en el break quita kick y bajo.',
      'Marca las secciones con marcadores (Intro, Groove, Break, Drop...).',
      'Añade transiciones (filtro, riser, crash) en los cambios de sección.',
    ],
    steps: [
      { text: 'Selecciona todos los ítems del loop, copia (Ctrl+C) y pega (Ctrl+V) a continuación varias veces.', level: 'verificado' },
      { text: 'Inserta marcadores en cada cambio de sección.', shortcut: 'M', level: 'verificado' },
      { text: 'Para borrar partes de un ítem: divide con S y borra el trozo seleccionado con Supr.', shortcut: 'S', level: 'verificado' },
    ],
    params: [{ name: 'Secciones', value: '8, 16 o 32 compases' }],
    verify: ['Al escuchar la canción completa, sientes que "viaja" y tiene momentos distintos.'],
    stages: ['estructura'],
  },
  {
    id: 'lufs',
    title: '¿Cuántos LUFS debe tener mi master?',
    triggers: [['lufs'], ['loudness'], ['spotify'], ['streaming']],
    keywords: ['lufs', 'loudness', 'spotify', 'streaming', 'youtube', 'apple', 'volumen', 'plataformas', 'true peak'],
    diagnosis: 'No existe un número de LUFS que garantice un master profesional.',
    explanation: 'LUFS mide la sonoridad percibida, no la calidad. Las plataformas normalizan el volumen: Spotify usa -14 LUFS integrados como referencia por defecto, así que un master mucho más fuerte se reproducirá bajado. Aun así, en música de club muchos masters son más fuertes; lo sensato es medir tus referencias y decidir con tus oídos.',
    solution: [
      'Mide el LUFS integrado de 2–3 referencias del género con el mismo medidor.',
      'Mantén el True Peak por debajo de aprox. -1 dBTP para evitar distorsión al convertir a MP3/AAC.',
      'Si para llegar al volumen el limitador aplasta el kick, baja el objetivo.',
    ],
    steps: [
      { text: 'Inserta el medidor de loudness en el master (busca "Loudness" en el navegador de FX).', level: 'confirmar' },
      { text: 'Reproduce la canción completa para obtener el valor integrado.', level: 'general' },
    ],
    params: [
      { name: 'True Peak', value: '≤ aprox. -1 dBTP' },
      { name: 'Referencia Spotify (normalización)', value: '-14 LUFS integrados' },
    ],
    verify: ['Tu master y la referencia suenan parecidos en energía cuando los igualas en volumen.'],
    pluginCategory: 'meter',
    stages: ['mastering', 'exportacion'],
  },
  {
    id: 'sidechain',
    title: '¿Cómo hago sidechain en REAPER?',
    triggers: [['sidechain'], ['side', 'chain'], ['bombeo'], ['pumping']],
    keywords: ['sidechain', 'bombeo', 'pumping', 'respira', 'compresor', 'kick'],
    diagnosis: 'Quieres que un sonido (bajo, pad) baje de volumen automáticamente cuando suena el kick.',
    explanation: 'En REAPER el sidechain se hace enviando el kick a los canales 3/4 de la pista que quieres comprimir, y diciéndole al compresor que escuche esos canales.',
    solution: [
      'Pista destino (bajo/pad): 4 canales.',
      'Envío desde el kick a los canales 3/4 del destino.',
      'ReaComp en el destino escuchando la entrada auxiliar.',
    ],
    steps: [
      { text: 'Pista destino › Route › "Track channels": 4.', level: 'confirmar' },
      { text: 'Pista del kick › Route › Add new send › destino › canales 3/4.', level: 'confirmar' },
      { text: 'Destino › FX › ReaComp › "Detector input": "Auxiliary Input L + R".', level: 'confirmar' },
      { text: 'Ajusta Threshold, Ratio, Attack y Release a oído.', level: 'general' },
    ],
    params: [
      { name: 'Ratio', value: '4:1 o más' },
      { name: 'Attack', value: '0–2 ms' },
      { name: 'Release', value: 'aprox. 80–200 ms' },
    ],
    verify: ['El medidor de reducción de ReaComp se mueve con cada kick.', 'El bajo "respira" al ritmo.'],
    pluginCategory: 'comp',
    stages: ['mezcla', 'bajo'],
  },
  {
    id: 'groove-rigido',
    title: 'Mi groove suena robótico / rígido',
    triggers: [['robot'], ['rigido'], ['swing'], ['mecanico'], ['sin', 'groove']],
    keywords: ['robotico', 'rigido', 'swing', 'mecanico', 'groove', 'humano', 'cuadrado', 'velocity'],
    diagnosis: 'Todas las notas están exactamente en la cuadrícula y con la misma velocity.',
    explanation: 'El groove humano tiene pequeñas variaciones de tiempo (swing) y de fuerza (velocity). En Deep House el swing en hats y shakers es casi una firma del género.',
    solution: [
      'Aplica swing a hats y shakers (no al kick).',
      'Alterna velocities fuerte-débil.',
      'Añade una percusión sincopada (rim, conga) a volumen bajo.',
    ],
    steps: [
      { text: 'En el editor MIDI selecciona las notas de hats › cuantización con swing.', level: 'confirmar' },
      { text: 'Ajusta velocities en el carril de velocity del editor MIDI.', level: 'verificado' },
    ],
    params: [{ name: 'Swing', value: 'aprox. 10–25 %' }],
    verify: ['Compara con y sin swing: con swing debe "balancear" más.'],
    lessons: ['l1-patrones'],
    stages: ['groove'],
  },
];
