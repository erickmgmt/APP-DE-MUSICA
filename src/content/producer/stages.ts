import type { StudioStep, Verification } from '../types';

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
  steps?: StudioStep[]; // cómo hacerlo en el estudio de la app
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
    goal: 'Definir la emoción, la imagen y las referencias de tu canción antes de empezar a producir.',
    checklist: [
      { id: 'mood', text: 'Escribí 3 palabras que describen el ambiente (p. ej. nocturno, cálido, hipnótico)' },
      { id: 'refs', text: 'Registré al menos 2 canciones de referencia en la ficha del proyecto' },
      { id: 'reaper', text: 'Abrí mi canción en el Estudio de la app' },
    ],
    generic: {
      recommendations: [
        { text: 'Describe la canción en una frase ("un viaje nocturno en coche junto al mar").', why: 'Una idea clara te ayuda a decidir qué sonidos entran y cuáles sobran en cada etapa.', level: 'general' },
        { text: 'Elige 2 o 3 canciones de referencia del género.', why: 'Las referencias son tu mapa: las usarás para comparar sonidos, estructura y mezcla.', level: 'general' },
      ],
      steps: [
        { text: 'Escribe tu idea y tus referencias en la pestaña "Ficha del proyecto" de esta guía.' },
        { text: 'Abre tu canción en el Estudio: si la creaste con la plantilla Deep House ya tendrás un groove sonando para inspirarte.', view: 'pistas' },
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
        { text: 'Sube una referencia como sample y úsala en una pista silenciada para comparar.', why: 'Tenerla dentro de la canción permite compararla al instante (recuerda igualar su volumen).', level: 'experimental' },
      ],
      steps: [
        { text: 'Añadir pista › Mis samples › "Subir audio" y elige tu canción de referencia (máx. 15 MB).', view: 'pistas', tip: 'Como pista de sample sonará desde el inicio de cada parte: sirve para comparar el sonido, no para seguirla entera.' },
        { text: 'Pulsa M en la pista de referencia para silenciarla cuando no la uses.' },
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
      { id: 'bpm', text: 'Fijé el BPM en el transporte del Estudio' },
      { id: 'sig', text: 'Entiendo que el estudio trabaja en compases de 4/4' },
      { id: 'key', text: 'Elegí la tonalidad y la guardé en la ficha del proyecto' },
      { id: 'notes', text: 'Anoté las notas de la escala' },
    ],
    generic: {
      recommendations: [
        { text: 'Usa el BPM típico del género como punto de partida.', why: 'Encaja con lo que esperan oyentes y DJ; puedes moverte dentro del rango.', level: 'general' },
        { text: 'Si dudas, elige una tonalidad menor sencilla (La menor).', why: 'Solo usa teclas blancas: menos errores mientras aprendes.', level: 'general' },
      ],
      steps: [
        { text: 'En el transporte del Estudio usa − y + junto al BPM.', view: 'pistas' },
        { text: 'La tonalidad se elige en la Ficha del proyecto; el editor de notas la usa para mostrar solo las notas de la escala.' },
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
      { id: 'level', text: 'Ajusté su volumen dejando margen (el pico del master no llega a 0 dBFS)' },
      { id: 'tune', text: 'Comprobé si su tono choca con la tonalidad (y lo afiné si hizo falta)' },
    ],
    generic: {
      recommendations: [
        { text: 'Compara kicks al mismo volumen.', why: 'El oído tiende a preferir lo que suena más fuerte; igualar el volumen hace la comparación justa.', level: 'general' },
        { text: 'Prueba los kicks incluidos (Kick Deep, Kick Punch, Kick 808 largo) y, si tienes, tus propios samples de kick.', why: 'Comparar opciones en tu canción es la forma más rápida de elegir bien.', level: 'general' },
      ],
      steps: [
        { text: 'Toca la pista Kick y pulsa el botón del sonido para cambiarlo: escucha cada kick con ▶ antes de usarlo.', view: 'pistas' },
        { text: 'Para usar tu sample: Cambiar sonido › Mis samples › Subir audio.' },
        { text: 'Comprueba que el kick está en los pasos 1, 5, 9 y 13 (los pulsos) de cada compás.' },
        { text: 'Afínalo con "Afinación" (semitonos) si choca con el bajo.' },
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
      { id: 'folder', text: 'Puse nombres claros a mis pistas de batería' },
    ],
    generic: {
      recommendations: [
        { text: 'Añade un elemento cada vez y escúchalo en bucle.', why: 'Así sabes qué aporta cada sonido y evitas saturar el groove.', level: 'general' },
        { text: 'Varía las velocities de hats y shakers.', why: 'La alternancia fuerte-débil crea movimiento y sensación humana.', level: 'general' },
      ],
      steps: [
        { text: 'Añadir pista › Batería: Clap, Hi-hat abierto, Hi-hat cerrado o Shaker.', view: 'pistas' },
        { text: 'Programa el compás 1 y usa "Copiar este compás a todos".' },
        { text: 'Ajusta el Swing en "Ajustes del loop".' },
        { text: 'Usa "Acento" para alternar golpes fuertes y suaves en hats y shakers.' },
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
      steps: [
        { text: 'Añadir pista › Instrumentos › Bajos (Bajo Deep, Sub bajo, Bajo órgano o Bajo filtrado).', view: 'pistas' },
        { text: 'En el editor de notas, con "Solo notas de…" activado, programa en la octava 1–2.' },
        { text: 'En Mezcla, sube el "Sidechain (kick)" del bajo para que respire con el kick.', view: 'mezcla' },
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
          { name: 'Filtro del bajo (Mezcla)', value: 'aprox. 600–1500 Hz', note: 'Ajusta a oído: más bajo = más redondo' },
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
      steps: [
        { text: 'Añadir pista › Batería › Percusión (Congas, Rim, Shaker) o tus samples.', view: 'pistas' },
        { text: 'En Mezcla, ajusta el Paneo de cada percusión a izquierda o derecha.', view: 'mezcla' },
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
      { id: 'hpf', text: 'Le quité graves para limpiar la mezcla' },
    ],
    generic: {
      recommendations: [
        { text: 'Mantén las texturas a volumen bajo.', why: 'Su función es crear ambiente; si se oyen claramente, compiten con los elementos principales.', level: 'general' },
        { text: 'Quita graves a las texturas (control "Graves" en Mezcla).', why: 'Los graves de las capas de fondo se acumulan y quitan claridad al kick y al bajo.', level: 'general' },
      ],
      steps: [
        { text: 'Añade un Pad oscuro o un sample de ambiente (lluvia, vinilo…) desde Mis samples.', view: 'pistas' },
        { text: 'En Mezcla baja los "Graves" de la textura (o baja el Filtro) y súbele la Reverb.', view: 'mezcla' },
      ],
    },
    byGenre: {
      'deep-house': {
        recommendations: [
          { text: 'Pads cálidos, ruido de vinilo, grabaciones de ambiente (lluvia, ciudad).', why: 'Son recursos habituales para la atmósfera "profunda" y nocturna.', level: 'general' },
          { text: 'Mucha reverb en la textura (control Reverb en Mezcla).', why: 'Empuja la textura "hacia atrás" y crea sensación de espacio.', level: 'general' },
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
      { id: 'markers', text: 'Creé las partes de la canción en la pestaña Estructura' },
      { id: 'intro', text: 'La intro permite mezclar al DJ (empieza con batería)' },
      { id: 'break', text: 'Hay al menos un break donde bajan los graves' },
      { id: 'outro', text: 'La outro va retirando elementos' },
    ],
    generic: {
      recommendations: [
        { text: 'Trabaja por secciones de 8, 16 o 32 compases.', why: 'Es la unidad que espera el oyente y facilita la mezcla de DJ.', level: 'general' },
        { text: 'Crea contraste: quitar elementos es tan importante como añadirlos.', why: 'La energía se percibe por comparación; un break hace que el drop golpee más.', level: 'general' },
      ],
      steps: [
        { text: 'Abre la pestaña Estructura: cada parte repite tu loop y tú eliges qué pistas suenan.', view: 'estructura' },
        { text: 'Pulsa "Estructura Deep House" para generar Intro, Groove, Break, Drop y Outro con tus pistas, y ajústala.' },
        { text: 'Toca los nombres de pista de cada parte para encenderlas o apagarlas; ▶ reproduce desde esa parte.' },
        { text: 'Escucha la canción completa en modo Canción.' },
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
    title: 'Automatizaciones y variaciones',
    short: 'Movimiento en el tiempo',
    goal: 'Dar vida al arreglo con cambios de sonido entre partes (las curvas de automatización llegarán en una próxima versión).',
    checklist: [
      { id: 'filter', text: 'Creé una versión filtrada (más oscura) de una pista para el break' },
      { id: 'send', text: 'Usé más reverb o delay en una parte para crear contraste' },
      { id: 'volume', text: 'Hice que algún elemento entre o salga entre partes' },
    ],
    generic: {
      recommendations: [
        { text: 'Automatiza pocas cosas pero con intención.', why: 'Cada automatización debe acompañar un cambio de sección o de emoción.', level: 'general' },
      ],
      steps: [
        { text: 'Duplica una pista (botón de duplicar en su editor) y, en Mezcla, baja el Filtro de la copia para que suene oscura y lejana.', view: 'pistas' },
        { text: 'En Estructura, usa la copia oscura en el Break y la original en el Drop.', view: 'estructura' },
        { text: 'Las curvas de automatización (cambios graduales dentro de una parte) todavía no están en el estudio: están planificadas.', tip: 'Puedes pedir su prioridad en Ideas y mejoras.' },
      ],
    },
    byGenre: {
      'deep-house': {
        recommendations: [
          { text: 'Usa una versión filtrada de los acordes en el Break y la abierta en el Drop.', why: 'El contraste oscuro → brillante es una transición clásica del house: crea expectativa sin cortar el groove.', level: 'general' },
          { text: 'Pon más reverb a la copia del Break que a la del Drop.', why: 'El break suena más espacioso y el drop más directo y cercano.', level: 'experimental' },
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
      { id: 'gain', text: 'El pico del master queda por debajo de 0 dBFS con margen' },
      { id: 'faders', text: 'Balance de faders empezando por el kick' },
      { id: 'hpf', text: 'Quité graves a los elementos que no los necesitan' },
      { id: 'sidechain', text: 'Sidechain del kick al bajo configurado' },
      { id: 'sends', text: 'Usé reverb y delay con moderación' },
      { id: 'mono', text: 'Comprobé la mezcla en mono y a volumen bajo' },
      { id: 'ref', text: 'Comparé con una referencia al mismo volumen percibido' },
    ],
    generic: {
      recommendations: [
        { text: 'Mezcla a volumen moderado y bajo.', why: 'A volumen alto el oído se cansa y percibe los graves y agudos distinto (curvas de igual sonoridad).', level: 'general' },
        { text: 'Primero faders y paneo; después EQ; después compresión.', why: 'Muchos problemas se resuelven solo con volumen. Procesar antes de equilibrar lleva a decisiones erróneas.', level: 'general' },
        { text: 'Usa la misma reverb compartida para todo (el estudio ya funciona así: cada pista decide cuánto envía).', why: 'Si todos los sonidos comparten el mismo espacio, la mezcla suena coherente.', level: 'general' },
      ],
      steps: [
        { text: 'Abre Mezcla. Empieza con todo el volumen master a la vista y el kick como referencia.', view: 'mezcla' },
        { text: 'Ajusta los volúmenes pista por pista: kick, bajo, clap, luego el resto.' },
        { text: 'Despliega cada canal (flecha) para EQ, Filtro, Reverb, Delay y Sidechain.' },
        { text: 'Vigila el medidor de pico del master mientras suena la parte más fuerte (el Drop).' },
      ],
      check: ['Ningún medidor llega a rojo.', 'Puedes seguir cada elemento con atención.', 'En mono no desaparece nada importante.'],
    },
    byGenre: {
      'deep-house': {
        recommendations: [
          { text: 'Sidechain kick → bajo con el control "Sidechain (kick)".', why: 'El bajo baja un instante cuando suena el kick: graves limpios y la "respiración" típica del género.', level: 'general' },
          { text: 'Kick y bajo al centro; percusiones y efectos repartidos en el estéreo.', why: 'Los graves en el centro mantienen la potencia en cualquier sistema.', level: 'general' },
          { text: 'Agudos suaves: controla hats y shakers con EQ si suenan estridentes.', why: 'El sonido del Deep House suele ser cálido; un exceso de 6–10 kHz cansa.', level: 'general' },
        ],
        steps: [
          { text: 'En Mezcla, despliega el canal del Bajo y sube "Sidechain (kick)" a 50–70 %.', view: 'mezcla' },
          { text: 'Haz lo mismo, más suave (20–50 %), en acordes y pad para que todo respire con el kick.' },
          { text: 'Compara con el sidechain a 0 % para notar la diferencia.' },
        ],
        params: [
          { name: 'Sidechain del bajo', value: 'aprox. 50–70 %', note: 'Más = efecto de "bombeo" más evidente' },
          { name: 'Sidechain de acordes y pad', value: 'aprox. 20–50 %' },
          { name: 'Graves de pads y acordes', value: 'aprox. -4 a -8 dB', note: 'Que el bajo y el kick tengan los graves para ellos' },
          { name: 'Pico del master durante la mezcla', value: 'aprox. -6 a -3 dBFS', note: 'Margen (headroom) para el volumen final' },
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
      { id: 'headroom', text: 'La mezcla llega con margen antes de subir el volumen final' },
      { id: 'meter', text: 'Exporté y revisé el pico y el loudness (LUFS) medidos' },
      { id: 'limiter', text: 'El limitador de protección está activo y el pico exportado queda por debajo de 0 dBFS' },
      { id: 'compare', text: 'Comparé con una referencia al mismo volumen percibido' },
      { id: 'translate', text: 'Lo escuché en otros sistemas (auriculares, móvil, coche)' },
    ],
    generic: {
      recommendations: [
        { text: 'Haz cambios pequeños en el master: si necesitas mucho EQ, vuelve a la mezcla.', why: 'El mastering pule; no arregla una mezcla con problemas.', level: 'general' },
        { text: 'Compara siempre al mismo volumen percibido.', why: 'Lo más fuerte siempre "parece" mejor; igualar evita engañarte.', level: 'general' },
        { text: 'No hay un número de LUFS que garantice un buen master.', why: 'El LUFS mide sonoridad, no calidad. Las plataformas de streaming normalizan el volumen (Spotify toma -14 LUFS integrados como referencia por defecto).', level: 'general' },
      ],
      steps: [
        { text: 'En Mezcla › Master activa el "Limitador de protección" y sube el volumen master poco a poco.', view: 'mezcla' },
        { text: 'Exporta (botón Exportar del transporte) y revisa el pico y el loudness integrado (LUFS) que se miden en el archivo.', view: 'exportar' },
        { text: 'Exporta también una referencia o compárala de oído al mismo volumen.', tip: 'El estudio aún no tiene EQ ni compresor en el master: el mastering avanzado llegará con el módulo de Análisis.' },
      ],
    },
    byGenre: {
      'deep-house': {
        recommendations: [
          { text: 'Antes de subir el volumen final, corrige la mezcla: el mastering solo pule.', why: 'Si algo suena mal en la mezcla, el volumen final lo hará más evidente.', level: 'general' },
          { text: 'Mide tus referencias con el mismo medidor y apunta su LUFS integrado.', why: 'Te da un objetivo realista para tu género en lugar de un número genérico.', level: 'general' },
          { text: 'Vigila que el kick conserve su pegada tras el limitador.', why: 'En música de baile, si el limitador aplasta el kick el groove pierde fuerza.', level: 'general' },
        ],
        params: [
          { name: 'Pico del archivo exportado', value: 'aprox. -1 dBFS o menos', note: 'Margen para la conversión a MP3/AAC' },
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
      { id: 'wav', text: 'Exporté mi canción en WAV' },
      { id: 'listen', text: 'Escuché el archivo exportado completo' },
      { id: 'backup', text: 'Descargué una copia de seguridad de la app (Sistema)' },
      { id: 'notes', text: 'Registré la versión y mis observaciones en la ficha del proyecto' },
    ],
    generic: {
      recommendations: [
        { text: 'Guarda el WAV como versión maestra; si necesitas MP3, conviértelo a partir del WAV.', why: 'El WAV conserva toda la calidad; el MP3 es solo para escuchas rápidas.', level: 'general' },
        { text: 'Escucha el archivo exportado de principio a fin.', why: 'A veces aparecen cortes, clics o pistas silenciadas que no notaste dentro del proyecto.', level: 'general' },
      ],
      steps: [
        { text: 'Pulsa Exportar en el transporte, elige WAV 16 bits (compatible con todo) o 24 bits (más calidad) y pulsa Renderizar.', view: 'exportar' },
        { text: 'Escucha el resultado en el reproductor que aparece y pulsa Descargar.' },
        { text: 'En Sistema › Copias de seguridad descarga un respaldo: guarda tu canción y tus samples.' },
      ],
    },
    byGenre: {
      'deep-house': {
        recommendations: [
          { text: 'Exporta también una versión "extended" para DJ si tu arreglo es corto.', why: 'Los DJ prefieren intros y outros largas para mezclar.', level: 'general' },
          { text: 'Termina con un Outro que vaya quitando elementos.', why: 'Un final gradual suena natural; el estudio añade 3 segundos al final para que caigan las colas de reverb.', level: 'general' },
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
