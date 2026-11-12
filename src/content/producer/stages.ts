import type { ReaperStep, Verification } from '../types';

export interface Advice {
  text: string;
  why: string;
  level: Verification;
}

export interface Param {
  name: string;
  value: string;
  note?: string;
}

export interface StageGuide {
  recommendations: Advice[];
  avoid?: Advice[];
  reaper?: ReaperStep[];
  params?: Param[];
  check?: string[]; // cómo comprobar que funcionó
}

export interface Stage {
  id: string;
  order: number;
  title: string;
  short: string;
  goal: string;
  checklist: { id: string; text: string }[];
  generic: StageGuide;
  byGenre: Partial<Record<string, StageGuide>>;
  lessons?: string[]; // lecciones relacionadas
  sounds?: string[]; // categorías de la biblioteca relacionadas
}

export const STAGES: Stage[] = [
  // 1 ------------------------------------------------------------------
  {
    id: 'idea',
    order: 1,
    title: 'Idea musical',
    short: 'Qué quieres transmitir',
    goal: 'Definir la emoción, la imagen y las referencias de tu canción antes de tocar REAPER.',
    checklist: [
      { id: 'mood', text: 'Escribí 3 palabras que describen el ambiente (p. ej. nocturno, cálido, hipnótico)' },
      { id: 'refs', text: 'Registré al menos 2 canciones de referencia en la ficha del proyecto' },
      { id: 'reaper', text: 'Creé y guardé el proyecto de REAPER en su propia carpeta' },
    ],
    generic: {
      recommendations: [
        { text: 'Describe la canción en una frase ("un viaje nocturno en coche junto al mar").', why: 'Una idea clara te ayuda a decidir qué sonidos entran y cuáles sobran en cada etapa.', level: 'general' },
        { text: 'Elige 2 o 3 canciones de referencia del género.', why: 'Las referencias son tu mapa: las usarás para comparar sonidos, estructura y mezcla.', level: 'general' },
      ],
      reaper: [
        { text: 'Crea un proyecto nuevo.', menu: { en: ['File', 'New project'], es: ['Archivo', 'Nuevo proyecto'] }, shortcut: 'Ctrl+N', level: 'verificado' },
        { text: 'Guárdalo con el nombre de la canción en una carpeta propia.', menu: { en: ['File', 'Save project as...'], es: ['Archivo', 'Guardar proyecto como...'] }, level: 'verificado' },
      ],
      check: ['Puedes explicar tu canción en una frase.', 'Tienes las referencias anotadas para compararlas después.'],
    },
    byGenre: {
      'deep-house': {
        recommendations: [
          { text: 'Piensa en atmósferas nocturnas, cálidas o melancólicas.', why: 'El Deep House se apoya en la sensación de profundidad y en un groove hipnótico más que en la euforia.', level: 'general' },
          { text: 'Escoge referencias con groove, bajo cálido y acordes jazzeados.', why: 'Son los rasgos que definen el género; compararás tus decisiones con ellos.', level: 'general' },
          { text: 'Decide si tendrá voz (aunque sea un vocal chop) o será instrumental.', why: 'Si hay voz, el arreglo debe dejarle espacio en los medios (aprox. 300 Hz–3 kHz).', level: 'general' },
        ],
      },
    },
    lessons: ['l1-daw'],
  },
  // 2 ------------------------------------------------------------------
  {
    id: 'genero',
    order: 2,
    title: 'Selección del género',
    short: 'Rasgos y referencias',
    goal: 'Entender qué elementos definen el género y escuchar las referencias de forma analítica.',
    checklist: [
      { id: 'listen', text: 'Escuché una referencia identificando kick, bajo, hats, acordes y efectos' },
      { id: 'traits', text: 'Anoté 3 rasgos del género que quiero en mi canción' },
      { id: 'sections', text: 'Identifiqué cuándo entra el bajo y dónde está el break en una referencia' },
    ],
    generic: {
      recommendations: [
        { text: 'Escucha cada referencia tres veces: una para disfrutar, otra para el ritmo y otra para los sonidos.', why: 'La escucha analítica entrena tu oído y te da decisiones concretas.', level: 'general' },
        { text: 'Importa una referencia a REAPER en una pista silenciada para comparar.', why: 'Tenerla en el proyecto permite compararla al instante (recuerda igualar su volumen).', level: 'general' },
      ],
      reaper: [
        { text: 'Importa la referencia en una pista nueva.', menu: { en: ['Insert', 'Media file...'], es: ['Insertar', 'Archivo multimedia...'] }, shortcut: 'Insert', level: 'verificado' },
        { text: 'Silencia la pista de referencia con su botón M (mute) cuando no la uses.', level: 'verificado' },
      ],
    },
    byGenre: {
      'deep-house': {
        recommendations: [
          { text: 'Fíjate en el swing de hats y shakers.', why: 'El groove con swing es una de las firmas del Deep House frente a estilos más rígidos.', level: 'general' },
          { text: 'Escucha cómo el bajo "respira" con el kick.', why: 'Suele usarse sidechain o un arreglo donde bajo y kick no golpean a la vez.', level: 'general' },
          { text: 'Identifica los acordes: suelen ser menores con séptimas o novenas.', why: 'Las extensiones (7ª, 9ª) aportan el color "jazzy/soul" típico.', level: 'general' },
        ],
        avoid: [
          { text: 'Tomar como referencia temas de EDM festivalero.', why: 'Tienen otra energía, otros sonidos (supersaws, drops enormes) y otra mezcla.', level: 'general' },
        ],
      },
    },
    sounds: ['kick', 'bass', 'pad'],
  },
  // 3 ------------------------------------------------------------------
  {
    id: 'tempo-tono',
    order: 3,
    title: 'BPM y tonalidad',
    short: 'Tempo y notas base',
    goal: 'Fijar tempo, métrica y tonalidad antes de crear sonidos.',
    checklist: [
      { id: 'bpm', text: 'Fijé el BPM en Project settings de REAPER' },
      { id: 'sig', text: 'Comprobé que la métrica es 4/4' },
      { id: 'key', text: 'Elegí la tonalidad y la guardé en la ficha del proyecto' },
      { id: 'notes', text: 'Anoté las notas de la escala' },
    ],
    generic: {
      recommendations: [
        { text: 'Usa el BPM típico del género como punto de partida.', why: 'Encaja con lo que esperan oyentes y DJ; puedes moverte dentro del rango.', level: 'general' },
        { text: 'Si dudas, elige una tonalidad menor sencilla (La menor).', why: 'Solo usa teclas blancas: menos errores mientras aprendes.', level: 'general' },
      ],
      reaper: [
        { text: 'Abre Project settings y escribe el BPM y la métrica.', menu: { en: ['File', 'Project settings...'], es: ['Archivo', 'Configuración del proyecto...'] }, shortcut: 'Alt+Enter', level: 'verificado' },
        { text: 'Activa el metrónomo con su botón de la barra de transporte y verifica el tempo.', level: 'confirmar' },
      ],
    },
    byGenre: {
      'deep-house': {
        recommendations: [
          { text: 'BPM entre 120 y 124 (122 es un buen inicio).', why: 'Es la zona más habitual del género: groove relajado pero bailable.', level: 'general' },
          { text: 'Tonalidad menor: La menor, Fa menor, Sol menor o Re menor son opciones comunes.', why: 'La sonoridad menor refuerza el carácter nocturno; La menor es la más fácil para empezar.', level: 'general' },
        ],
        params: [
          { name: 'BPM', value: '122', note: 'Rango típico 118–125' },
          { name: 'Métrica', value: '4/4' },
          { name: 'Tonalidad inicial', value: 'La menor (A B C D E F G)' },
          { name: 'Frecuencia de muestreo', value: '44100 o 48000 Hz', note: 'Mantén la misma durante todo el proyecto' },
        ],
      },
    },
    lessons: ['l1-bpm', 'l1-compases', 'l1-tonalidades'],
  },
  // 4 ------------------------------------------------------------------
  {
    id: 'kick',
    order: 4,
    title: 'Selección del kick',
    short: 'El corazón del groove',
    goal: 'Elegir un kick que tenga cuerpo, deje espacio al bajo y encaje con la tonalidad.',
    checklist: [
      { id: 'pick', text: 'Comparé al menos 5 kicks y elegí uno' },
      { id: 'pattern', text: 'Lo programé four-on-the-floor (1, 2, 3, 4)' },
      { id: 'level', text: 'Ajusté su nivel dejando margen (picos por debajo de 0 dBFS en su pista)' },
      { id: 'tune', text: 'Comprobé si su tono choca con la tonalidad (y lo afiné si hizo falta)' },
    ],
    generic: {
      recommendations: [
        { text: 'Compara kicks al mismo volumen.', why: 'El oído tiende a preferir lo que suena más fuerte; igualar el volumen hace la comparación justa.', level: 'general' },
        { text: 'Carga el sample en ReaSamplOmatic5000 (RS5k) o en tu sampler.', why: 'RS5k viene con REAPER y consume muy poca CPU.', level: 'general' },
      ],
      reaper: [
        { text: 'Inserta RS5k en una pista nueva: Insert › Virtual instrument on new track… y busca "ReaSamplOmatic5000".', menu: { en: ['Insert', 'Virtual instrument on new track...'], es: ['Insertar', 'Instrumento virtual en nueva pista...'] }, level: 'verificado' },
        { text: 'Arrastra el sample de kick desde el explorador de archivos a la ventana de RS5k.', level: 'verificado' },
        { text: 'Si necesitas afinarlo, usa el control de tono (pitch) de RS5k.', level: 'confirmar' },
        { text: 'Crea un ítem MIDI de 1 compás con notas en los pasos 1, 5, 9 y 13 de la cuadrícula a 1/16.', menu: { en: ['Insert', 'New MIDI item'], es: ['Insertar', 'Nuevo ítem MIDI'] }, level: 'verificado' },
      ],
      check: ['El kick se oye claro a volumen bajo.', 'No hace clip en el medidor de su pista.'],
    },
    byGenre: {
      'deep-house': {
        recommendations: [
          { text: 'Busca un kick redondo, con cuerpo aprox. entre 50 y 80 Hz.', why: 'El Deep House necesita peso grave pero suave; el cuerpo da el pulso en la pista de baile.', level: 'general' },
          { text: 'Ataque presente pero no agresivo (sin "click" exagerado).', why: 'Un transitorio suave encaja con la estética cálida; un click muy marcado suena más a techno o EDM.', level: 'general' },
          { text: 'Cola corta o media.', why: 'Una cola larga ocupa el espacio del bajo y provoca choques en los graves.', level: 'general' },
          { text: 'Si tiene un tono claro, que coincida con la tónica o la quinta.', why: 'Evita disonancias en los graves con el bajo.', level: 'general' },
        ],
        avoid: [
          { text: 'Kicks distorsionados tipo hardstyle o techno industrial.', why: 'Rompen la calidez del género y saturan la zona media-grave.', level: 'general' },
          { text: 'Kicks tipo 808 con cola larga y afinada.', why: 'Funcionan en trap, pero aquí compiten directamente con el bajo.', level: 'general' },
          { text: 'Apilar 3 o 4 kicks a la vez sin saber por qué.', why: 'Las capas provocan cancelaciones de fase y un sonido confuso; empieza con un solo kick bueno.', level: 'general' },
        ],
      },
    },
    lessons: ['l1-patrones', 'l1-audio'],
    sounds: ['kick'],
  },
  // 5 ------------------------------------------------------------------
  {
    id: 'groove',
    order: 5,
    title: 'Creación del groove',
    short: 'Clap, hats y swing',
    goal: 'Construir el patrón de batería que hace mover el cuerpo, todavía sin bajo.',
    checklist: [
      { id: 'clap', text: 'Clap (o snare) en los pulsos 2 y 4' },
      { id: 'ohat', text: 'Hi-hat abierto en los contratiempos' },
      { id: 'shaker', text: 'Hats cerrados o shaker en semicorcheas con velocity variable' },
      { id: 'swing', text: 'Probé el swing hasta encontrar el balanceo' },
      { id: 'folder', text: 'Agrupé la batería en una carpeta (folder) "Drums"' },
    ],
    generic: {
      recommendations: [
        { text: 'Añade un elemento cada vez y escúchalo en bucle.', why: 'Así sabes qué aporta cada sonido y evitas saturar el groove.', level: 'general' },
        { text: 'Varía las velocities de hats y shakers.', why: 'La alternancia fuerte-débil crea movimiento y sensación humana.', level: 'general' },
      ],
      reaper: [
        { text: 'Crea una pista por sonido (Clap, Hat abierto, Shaker) con RS5k en cada una.', level: 'verificado' },
        { text: 'Crea una pista carpeta (folder) para la batería: con la carpeta encima, usa el icono de carpeta del panel de la pista o arrastra las pistas dentro.', level: 'confirmar', tip: 'Una carpeta permite subir o bajar toda la batería con un solo fader.' },
        { text: 'Aplica swing mediante la cuantización del editor MIDI.', level: 'confirmar' },
      ],
      check: ['El loop de 4 compases es bailable sin bajo.', 'Ningún elemento tapa al kick.'],
    },
    byGenre: {
      'deep-house': {
        recommendations: [
          { text: 'Clap suave con algo de cola, o snare con poco cuerpo, en 2 y 4.', why: 'Marca el backbeat sin agresividad.', level: 'general' },
          { text: 'Hat abierto en contratiempos (pasos 3, 7, 11, 15).', why: 'El "tss" en contratiempo es la firma clásica del house.', level: 'general' },
          { text: 'Shaker en semicorcheas con swing aprox. entre 10 % y 25 %.', why: 'El swing da el balanceo relajado del Deep House; más allá suele sonar descuadrado.', level: 'general' },
          { text: 'Un rimshot o percusión corta en lugares sincopados.', why: 'Aporta interés rítmico sin ocupar mucho espacio.', level: 'experimental' },
        ],
        avoid: [
          { text: 'Hi-hats demasiado brillantes y fuertes.', why: 'El Deep House suele tener agudos suaves; unos hats estridentes cansan el oído.', level: 'general' },
        ],
      },
    },
    lessons: ['l1-patrones'],
    sounds: ['clap', 'snare', 'hihat', 'perc'],
  },
  // 6 ------------------------------------------------------------------
  {
    id: 'bajo',
    order: 6,
    title: 'Bajo',
    short: 'Graves que dialogan con el kick',
    goal: 'Crear una línea de bajo en la tonalidad que encaje rítmicamente con el kick.',
    checklist: [
      { id: 'sound', text: 'Elegí un sonido de bajo (sinte o sample)' },
      { id: 'notes', text: 'La línea usa notas de la escala (empezando por la tónica)' },
      { id: 'rhythm', text: 'El bajo evita coincidir siempre con el golpe del kick' },
      { id: 'mono', text: 'Comprobé el bajo en mono' },
    ],
    generic: {
      recommendations: [
        { text: 'Empieza con la tónica y añade 2 o 3 notas de la escala.', why: 'Las líneas sencillas funcionan mejor en los graves; demasiadas notas enturbian.', level: 'general' },
        { text: 'Mantén el bajo en mono en los graves.', why: 'Los graves en estéreo pierden potencia en sistemas mono y en clubes.', level: 'general' },
      ],
      reaper: [
        { text: 'Inserta tu sintetizador en una pista nueva (si no tienes otro, ReaSynth sirve para un bajo sencillo).', menu: { en: ['Insert', 'Virtual instrument on new track...'], es: ['Insertar', 'Instrumento virtual en nueva pista...'] }, level: 'verificado' },
        { text: 'Programa la línea en el editor MIDI en la octava 1–2 (aprox. C1–C3).', level: 'verificado' },
      ],
      check: ['Escucha kick + bajo a volumen bajo: debes distinguir ambos.', 'Las notas del bajo no chocan con la tonalidad.'],
    },
    byGenre: {
      'deep-house': {
        recommendations: [
          { text: 'Sonido cálido y redondo: onda senoidal o diente de sierra filtrada con paso bajo.', why: 'Aporta peso sin aspereza; el filtro quita los agudos que competirían con otros elementos.', level: 'general' },
          { text: 'Ritmo sincopado: notas en contratiempos o entre los kicks.', why: 'Así el bajo "responde" al kick en lugar de pisarlo; es la base del groove.', level: 'general' },
          { text: 'Sigue la raíz de los acordes (cuando los tengas).', why: 'Refuerza la armonía y da coherencia.', level: 'general' },
          { text: 'Prepara un sidechain suave desde el kick (lo afinarás en la mezcla).', why: 'Produce el efecto de "respiración" típico y limpia el choque de graves.', level: 'general' },
        ],
        avoid: [
          { text: 'Bajos tipo "reese" o muy distorsionados.', why: 'Son propios de drum & bass o bass house; aquí rompen la calidez.', level: 'general' },
          { text: 'Notas por debajo de E1 sin necesidad.', why: 'Por debajo de ~40 Hz casi no se reproduce en altavoces normales y gasta headroom.', level: 'general' },
        ],
        params: [
          { name: 'Octava', value: 'A1–A2 en La menor', note: 'A1 ≈ 55 Hz' },
          { name: 'Filtro paso bajo del sinte', value: 'aprox. 300–800 Hz', note: 'Ajusta a oído' },
          { name: 'Duración de notas', value: 'Cortas (1/16–1/8) para groove', note: 'Las largas dan más "colchón"' },
        ],
      },
    },
    sounds: ['bass'],
  },
  // 7 ------------------------------------------------------------------
  {
    id: 'percusiones',
    order: 7,
    title: 'Percusiones',
    short: 'Groove secundario',
    goal: 'Añadir percusión que enriquezca el groove sin taparlo.',
    checklist: [
      { id: 'add', text: 'Añadí 1–3 percusiones (congas, bongos, tambourine, rims...)' },
      { id: 'pan', text: 'Paneé ligeramente las percusiones a izquierda y derecha' },
      { id: 'level', text: 'Su volumen está por debajo del kick y del clap' },
    ],
    generic: {
      recommendations: [
        { text: 'Pocas percusiones bien elegidas.', why: 'Cada sonido extra ocupa espacio; dos percusiones buenas valen más que seis mediocres.', level: 'general' },
        { text: 'Pregunta y respuesta: una percusión en un lado, otra respondiendo en el otro.', why: 'Crea movimiento estéreo e interés.', level: 'experimental' },
      ],
      reaper: [
        { text: 'Ajusta el paneo con el control "pan" de la pista (en el panel de pistas o en el mezclador).', level: 'verificado' },
      ],
    },
    byGenre: {
      'deep-house': {
        recommendations: [
          { text: 'Congas, bongos o percusiones de madera con algo de reverb.', why: 'Aportan el toque orgánico y "humano" del género.', level: 'general' },
          { text: 'Paneos moderados (aprox. 15–40 % a cada lado).', why: 'Ensanchan el groove sin vaciar el centro.', level: 'general' },
        ],
      },
    },
    sounds: ['perc', 'hihat'],
  },
  // 8 ------------------------------------------------------------------
  {
    id: 'acordes',
    order: 8,
    title: 'Acordes',
    short: 'Armonía y color',
    goal: 'Escribir una progresión de 2–4 acordes en la tonalidad que dé color emocional.',
    checklist: [
      { id: 'prog', text: 'Escribí una progresión de 2–4 acordes en la tonalidad' },
      { id: 'sound', text: 'Elegí un sonido (piano eléctrico, órgano, pad...)' },
      { id: 'range', text: 'Los acordes están en la zona media (aprox. C3–C5)' },
      { id: 'bassroot', text: 'El bajo sigue la raíz de los acordes' },
    ],
    generic: {
      recommendations: [
        { text: 'Usa acordes construidos con las notas de la escala.', why: 'Garantiza que bajo, acordes y melodía suenen juntos sin choques.', level: 'general' },
        { text: 'Repite la progresión cada 2 o 4 compases.', why: 'La repetición crea el efecto hipnótico de la música de baile.', level: 'general' },
      ],
    },
    byGenre: {
      'deep-house': {
        recommendations: [
          { text: 'Acordes menores con séptima (m7) o novena (m9).', why: 'Las extensiones dan el color "soul/jazz" característico del Deep House.', level: 'general' },
          { text: 'Ejemplo en La menor: Am7 (A C E G) → Dm7 (D F A C), dos compases cada uno.', why: 'i7 → iv7 es una progresión sencilla y muy usada en house; todas sus notas están en La menor.', level: 'general' },
          { text: 'Alternativa: Am7 → Fmaj7 (F A C E) → Em7 (E G B D) → Dm7.', why: 'Más movimiento sin salir de la escala.', level: 'general' },
          { text: 'Sonido: piano eléctrico tipo Rhodes, órgano o un "stab" corto en contratiempo.', why: 'Son timbres clásicos del género; el stab corto deja espacio al groove.', level: 'general' },
        ],
        avoid: [
          { text: 'Acordes en la octava del bajo.', why: 'Enturbian los graves (zona 100–300 Hz); el bajo ya cubre esa zona.', level: 'general' },
        ],
      },
    },
    lessons: ['l1-escalas', 'l1-tonalidades'],
    sounds: ['pad', 'synth', 'pluck'],
  },
  // 9 ------------------------------------------------------------------
  {
    id: 'melodia',
    order: 9,
    title: 'Melodía',
    short: 'Un motivo memorable',
    goal: 'Crear un motivo melódico corto que se recuerde y deje espacio.',
    checklist: [
      { id: 'motif', text: 'Escribí un motivo de 1–2 compases con la escala' },
      { id: 'space', text: 'El motivo tiene silencios (no llena todo)' },
      { id: 'variation', text: 'Hice una variación del motivo para otra sección' },
    ],
    generic: {
      recommendations: [
        { text: 'Empieza con la pentatónica menor.', why: 'Con solo 5 notas es muy difícil que suene mal.', level: 'general' },
        { text: 'Repite el motivo y cambia solo el final la segunda vez.', why: 'Pregunta-respuesta: el oído reconoce el motivo y disfruta la variación.', level: 'general' },
      ],
    },
    byGenre: {
      'deep-house': {
        recommendations: [
          { text: 'Melodías sencillas y espaciadas (plucks, piano, vocal chops).', why: 'En Deep House la melodía acompaña al groove; no compite con él.', level: 'general' },
          { text: 'Un delay sincronizado (1/8 con puntillo o 1/4) en el motivo.', why: 'Rellena los espacios con ecos rítmicos y aporta profundidad.', level: 'experimental' },
        ],
        avoid: [
          { text: 'Leads brillantes de EDM tocando todo el tiempo.', why: 'Saturan la zona media-aguda y cambian el carácter del género.', level: 'general' },
        ],
      },
    },
    lessons: ['l1-escalas'],
    sounds: ['lead', 'pluck', 'vocal'],
  },
  // 10 -----------------------------------------------------------------
  {
    id: 'texturas',
    order: 10,
    title: 'Texturas',
    short: 'Atmósfera y profundidad',
    goal: 'Añadir capas de fondo que den profundidad sin enturbiar la mezcla.',
    checklist: [
      { id: 'layer', text: 'Añadí al menos una textura o pad de fondo' },
      { id: 'level', text: 'La textura se nota más cuando la quito que cuando está' },
      { id: 'hpf', text: 'Le apliqué un filtro paso alto para limpiar los graves' },
    ],
    generic: {
      recommendations: [
        { text: 'Mantén las texturas a volumen bajo.', why: 'Su función es crear ambiente; si se oyen claramente, compiten con los elementos principales.', level: 'general' },
        { text: 'Aplica un filtro paso alto (HPF) a las texturas.', why: 'Los graves de las capas de fondo se acumulan y quitan claridad al kick y al bajo.', level: 'general' },
      ],
      reaper: [
        { text: 'Inserta ReaEQ en la pista de la textura: botón FX de la pista › busca "ReaEQ".', level: 'verificado' },
        { text: 'En ReaEQ, cambia el tipo de la primera banda a "High Pass" y sube su frecuencia hasta que la textura deje de aportar graves.', level: 'confirmar' },
      ],
    },
    byGenre: {
      'deep-house': {
        recommendations: [
          { text: 'Pads cálidos, ruido de vinilo, grabaciones de ambiente (lluvia, ciudad).', why: 'Son recursos habituales para la atmósfera "profunda" y nocturna.', level: 'general' },
          { text: 'Reverb larga en la textura (en un bus de envío).', why: 'Empuja la textura "hacia atrás" y crea sensación de espacio.', level: 'general' },
        ],
      },
    },
    sounds: ['texture', 'pad', 'fx'],
  },
  // 11 -----------------------------------------------------------------
  {
    id: 'estructura',
    order: 11,
    title: 'Estructura de la canción',
    short: 'Del loop a la canción',
    goal: 'Convertir tu loop en una canción completa con secciones de 8/16/32 compases.',
    checklist: [
      { id: 'markers', text: 'Marqué las secciones con marcadores o regiones en REAPER' },
      { id: 'intro', text: 'La intro permite mezclar al DJ (empieza con batería)' },
      { id: 'break', text: 'Hay al menos un break donde bajan los graves' },
      { id: 'outro', text: 'La outro va retirando elementos' },
    ],
    generic: {
      recommendations: [
        { text: 'Trabaja por secciones de 8, 16 o 32 compases.', why: 'Es la unidad que espera el oyente y facilita la mezcla de DJ.', level: 'general' },
        { text: 'Crea contraste: quitar elementos es tan importante como añadirlos.', why: 'La energía se percibe por comparación; un break hace que el drop golpee más.', level: 'general' },
      ],
      reaper: [
        { text: 'Inserta un marcador en la posición del cursor y renómbralo con doble clic (Intro, Break, Drop...).', shortcut: 'M', level: 'verificado' },
        { text: 'Para crear una región a partir de una selección de tiempo, usa el menú Insert.', menu: { en: ['Insert', 'Region from time selection'], es: ['Insertar', 'Región desde la selección de tiempo'] }, level: 'confirmar' },
        { text: 'Copia y pega ítems (Ctrl+C / Ctrl+V) para extender tu loop a lo largo de la canción.', level: 'verificado' },
      ],
    },
    byGenre: {
      'deep-house': {
        recommendations: [
          { text: 'Estructura orientativa (compases): Intro 16–32 · Groove 16 · Break 16–32 · Drop/Principal 32 · Break 2 16 · Drop 2 32 · Outro 16–32.', why: 'Es un esquema común en versiones "extended" para DJ (aprox. 5–7 min a 122 BPM). No es una regla fija.', level: 'general' },
          { text: 'Intro y outro solo con batería y percusión.', why: 'Permite al DJ mezclar tu tema con otro sin choques de tonalidad.', level: 'general' },
          { text: 'Cada 8 compases añade, quita o cambia algo pequeño.', why: 'Mantiene el interés en un género hipnótico y repetitivo.', level: 'general' },
        ],
      },
    },
    lessons: ['l1-compases'],
  },
  // 12 -----------------------------------------------------------------
  {
    id: 'automatizacion',
    order: 12,
    title: 'Automatizaciones',
    short: 'Movimiento en el tiempo',
    goal: 'Dar vida al arreglo con cambios graduales de filtro, volumen y efectos.',
    checklist: [
      { id: 'filter', text: 'Automaticé un filtro en una transición' },
      { id: 'send', text: 'Automaticé un envío de reverb o delay' },
      { id: 'volume', text: 'Automaticé el volumen de algún elemento que entra o sale' },
    ],
    generic: {
      recommendations: [
        { text: 'Automatiza pocas cosas pero con intención.', why: 'Cada automatización debe acompañar un cambio de sección o de emoción.', level: 'general' },
      ],
      reaper: [
        { text: 'Abre el plugin (p. ej. ReaEQ), mueve el parámetro que quieras automatizar y usa el botón "Param" de la ventana del plugin para mostrar su envolvente en la pista.', level: 'confirmar' },
        { text: 'También puedes abrir las envolventes de la pista desde el botón de envolventes del panel de pistas y activar Volume o Pan.', level: 'confirmar' },
        { text: 'Haz Mayús+clic sobre la línea de la envolvente para añadir puntos y arrástralos.', level: 'confirmar' },
      ],
    },
    byGenre: {
      'deep-house': {
        recommendations: [
          { text: 'Abre lentamente el filtro paso bajo de los acordes o del bajo antes de un drop.', why: 'El barrido de filtro es una transición clásica del house: crea expectativa sin cortar el groove.', level: 'general' },
          { text: 'Sube el envío de reverb al final de una frase y bájalo al entrar la siguiente.', why: 'Crea una "cola" que une secciones.', level: 'experimental' },
        ],
      },
    },
  },
  // 13 -----------------------------------------------------------------
  {
    id: 'mezcla',
    order: 13,
    title: 'Mezcla',
    short: 'Equilibrio y claridad',
    goal: 'Que todos los elementos se oigan claros y equilibrados, dejando margen para el mastering.',
    checklist: [
      { id: 'gain', text: 'Gain staging: ninguna pista hace clip y el master tiene picos alrededor de -6 dBFS' },
      { id: 'faders', text: 'Balance de faders empezando por el kick' },
      { id: 'hpf', text: 'Filtro paso alto en los elementos que no necesitan graves' },
      { id: 'sidechain', text: 'Sidechain del kick al bajo configurado' },
      { id: 'sends', text: 'Reverb y delay en pistas de envío (buses)' },
      { id: 'mono', text: 'Comprobé la mezcla en mono y a volumen bajo' },
      { id: 'ref', text: 'Comparé con una referencia al mismo volumen percibido' },
    ],
    generic: {
      recommendations: [
        { text: 'Mezcla a volumen moderado y bajo.', why: 'A volumen alto el oído se cansa y percibe los graves y agudos distinto (curvas de igual sonoridad).', level: 'general' },
        { text: 'Primero faders y paneo; después EQ; después compresión.', why: 'Muchos problemas se resuelven solo con volumen. Procesar antes de equilibrar lleva a decisiones erróneas.', level: 'general' },
        { text: 'Usa la reverb y el delay en pistas de envío al 100 % wet.', why: 'Varias pistas comparten el mismo espacio (más coherente) y gastas menos CPU.', level: 'general' },
      ],
      reaper: [
        { text: 'Abre el mezclador para trabajar los faders.', menu: { en: ['View', 'Mixer'], es: ['Ver', 'Mezclador'] }, shortcut: 'Ctrl+M', level: 'verificado' },
        { text: 'Inserta ReaEQ: botón FX de la pista › escribe "ReaEQ" en el buscador › doble clic.', level: 'verificado' },
        { text: 'Crea un envío: arrastra desde el botón de ruteo ("Route"/IO) de una pista hasta la pista de reverb, o abre Route › Add new send.', level: 'confirmar' },
      ],
      check: ['Ningún medidor llega a rojo.', 'Puedes seguir cada elemento con atención.', 'En mono no desaparece nada importante.'],
    },
    byGenre: {
      'deep-house': {
        recommendations: [
          { text: 'Sidechain kick → bajo con ReaComp.', why: 'El bajo baja un instante cuando suena el kick: graves limpios y la "respiración" típica del género.', level: 'general' },
          { text: 'Kick y bajo al centro; percusiones y efectos repartidos en el estéreo.', why: 'Los graves en el centro mantienen la potencia en cualquier sistema.', level: 'general' },
          { text: 'Agudos suaves: controla hats y shakers con EQ si suenan estridentes.', why: 'El sonido del Deep House suele ser cálido; un exceso de 6–10 kHz cansa.', level: 'general' },
        ],
        reaper: [
          { text: '1) En la pista del BAJO, abre el botón de ruteo (Route) y pon "Track channels" en 4.', level: 'confirmar' },
          { text: '2) En la pista del KICK, abre Route › Add new send › elige la pista del bajo y como destino de audio los canales 3/4.', level: 'confirmar' },
          { text: '3) En el bajo inserta ReaComp y en "Detector input" elige "Auxiliary Input L + R".', level: 'confirmar', tip: 'Así el compresor del bajo "escucha" al kick y reacciona a él.' },
          { text: '4) Baja el Threshold hasta ver unos 3–6 dB de reducción en cada golpe de kick y ajusta el Release al ritmo.', level: 'general' },
        ],
        params: [
          { name: 'ReaComp (sidechain) · Ratio', value: '4:1 o más', note: 'Orientativo' },
          { name: 'ReaComp · Attack', value: '0–2 ms' },
          { name: 'ReaComp · Release', value: 'aprox. 80–200 ms', note: 'A 122 BPM una negra dura ~492 ms: que el bajo vuelva antes del siguiente kick' },
          { name: 'Reducción de ganancia', value: 'aprox. 3–6 dB', note: 'Más = efecto de "bombeo" más evidente' },
          { name: 'HPF en pads/acordes', value: 'aprox. 100–200 Hz', note: 'Súbelo hasta que notes que se adelgazan y retrocede un poco' },
          { name: 'Picos del master antes de masterizar', value: 'aprox. -6 dBFS', note: 'Margen (headroom) para el mastering' },
        ],
      },
    },
    lessons: ['l1-audio'],
  },
  // 14 -----------------------------------------------------------------
  {
    id: 'mastering',
    order: 14,
    title: 'Mastering',
    short: 'Volumen final y coherencia',
    goal: 'Dar el volumen final con un limitador, sin destruir la dinámica, y comparar con referencias.',
    checklist: [
      { id: 'headroom', text: 'La mezcla llega con margen (sin limitador en el master durante la mezcla)' },
      { id: 'meter', text: 'Inserté un medidor de loudness (LUFS) en el master' },
      { id: 'limiter', text: 'Limitador al final de la cadena con techo de aprox. -1 dBTP' },
      { id: 'compare', text: 'Comparé con una referencia al mismo volumen percibido' },
      { id: 'translate', text: 'Lo escuché en otros sistemas (auriculares, móvil, coche)' },
    ],
    generic: {
      recommendations: [
        { text: 'Haz cambios pequeños en el master: si necesitas mucho EQ, vuelve a la mezcla.', why: 'El mastering pule; no arregla una mezcla con problemas.', level: 'general' },
        { text: 'Compara siempre al mismo volumen percibido.', why: 'Lo más fuerte siempre "parece" mejor; igualar evita engañarte.', level: 'general' },
        { text: 'No hay un número de LUFS que garantice un buen master.', why: 'El LUFS mide sonoridad, no calidad. Las plataformas de streaming normalizan el volumen (Spotify toma -14 LUFS integrados como referencia por defecto).', level: 'general' },
      ],
      reaper: [
        { text: 'En la pista Master, pulsa su botón FX para abrir su cadena de efectos.', level: 'verificado' },
        { text: 'Inserta el medidor de loudness incluido: en el buscador de FX escribe "Loudness" y elige "JS: Loudness Meter Peak/RMS/LUFS".', level: 'confirmar' },
        { text: 'Inserta un limitador al final de la cadena (ReaLimit viene con REAPER) y ajusta su techo (ceiling) a aprox. -1 dB.', level: 'confirmar' },
      ],
    },
    byGenre: {
      'deep-house': {
        recommendations: [
          { text: 'Cadena orientativa: EQ suave → compresión de bus ligera → limitador.', why: 'Es un orden habitual: primero tono, después cohesión, al final control de picos.', level: 'general' },
          { text: 'Mide tus referencias con el mismo medidor y apunta su LUFS integrado.', why: 'Te da un objetivo realista para tu género en lugar de un número genérico.', level: 'general' },
          { text: 'Vigila que el kick conserve su pegada tras el limitador.', why: 'En música de baile, si el limitador aplasta el kick el groove pierde fuerza.', level: 'general' },
        ],
        params: [
          { name: 'Compresión de bus · Ratio', value: 'aprox. 1,5:1–2:1', note: 'Muy suave' },
          { name: 'Compresión de bus · Reducción', value: 'aprox. 1–2 dB' },
          { name: 'Limitador · Techo', value: 'aprox. -1 dBTP', note: 'Margen para la conversión a MP3/AAC' },
          { name: 'LUFS integrado', value: 'Según tus referencias medidas', note: 'Los masters de club suelen ser más fuertes que -14; mide antes de decidir' },
        ],
      },
    },
  },
  // 15 -----------------------------------------------------------------
  {
    id: 'exportacion',
    order: 15,
    title: 'Exportación final',
    short: 'Render y entrega',
    goal: 'Exportar el máster en la calidad correcta y guardar una copia de seguridad del proyecto.',
    checklist: [
      { id: 'wav', text: 'Exporté un WAV 24 bits a la frecuencia del proyecto' },
      { id: 'listen', text: 'Escuché el archivo exportado completo' },
      { id: 'backup', text: 'Guardé una copia del proyecto de REAPER con todos sus medios' },
      { id: 'notes', text: 'Registré la versión y mis observaciones en la ficha del proyecto' },
    ],
    generic: {
      recommendations: [
        { text: 'Exporta el máster en WAV y genera el MP3 a partir de él si lo necesitas.', why: 'El WAV conserva toda la calidad; el MP3 es solo para escuchas rápidas.', level: 'general' },
        { text: 'Escucha el archivo exportado de principio a fin.', why: 'A veces aparecen cortes, clics o pistas silenciadas que no notaste dentro del proyecto.', level: 'general' },
      ],
      reaper: [
        { text: 'Abre la ventana de render.', menu: { en: ['File', 'Render...'], es: ['Archivo', 'Renderizar...'] }, shortcut: 'Ctrl+Alt+R', level: 'verificado' },
        { text: 'Source: "Master mix". Bounds: "Entire project". Elige carpeta y nombre de archivo.', level: 'verificado' },
        { text: 'Formato: WAV, profundidad 24 bit PCM, frecuencia igual a la del proyecto. Pulsa "Render 1 file".', level: 'verificado' },
        { text: 'Si tu versión lo incluye, usa "Dry run" en la ventana de render para obtener estadísticas de loudness sin crear el archivo.', level: 'confirmar' },
        { text: 'Para la copia de seguridad, usa "Save project as..." marcando la opción de copiar todos los medios a la carpeta del proyecto.', menu: { en: ['File', 'Save project as...'], es: ['Archivo', 'Guardar proyecto como...'] }, level: 'confirmar' },
      ],
    },
    byGenre: {
      'deep-house': {
        recommendations: [
          { text: 'Exporta también una versión "extended" para DJ si tu arreglo es corto.', why: 'Los DJ prefieren intros y outros largas para mezclar.', level: 'general' },
          { text: 'Deja un par de segundos de silencio al final para que caigan las colas de reverb.', why: 'Evita cortar el final de los efectos.', level: 'general' },
        ],
      },
    },
  },
];

export function getStage(id: string): Stage | undefined {
  return STAGES.find((s) => s.id === id);
}

export function guideFor(stage: Stage, genreId: string): { generic: StageGuide; genre?: StageGuide } {
  return { generic: stage.generic, genre: stage.byGenre[genreId] };
}

export const STAGE_IDS = STAGES.map((s) => s.id);
