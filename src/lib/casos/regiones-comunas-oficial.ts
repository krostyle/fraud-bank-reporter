// Catálogo oficial de regiones y comunas de Chile (spec 006).
// Fuente: https://github.com/climoralesg/api-regiones-provincias-comunas-Chile
// (346 comunas, 16 regiones, verificado contra el conteo oficial).
// Los alias cubren los nombres alternativos reales vistos en los CSV de origen
// (numeración romana, ordinal en palabras como "QUINTA REGION", abreviaciones
// como "RM") además de las formas oficiales completas.

export type RegionOficial = {
  nombre: string;
  aliases: string[];
  comunas: string[];
};

export const REGIONES_OFICIALES: RegionOficial[] = [
  {
    "nombre": "Arica y Parinacota",
    "aliases": [
      "XV REGION",
      "REGION XV",
      "DECIMOQUINTA REGION",
      "REGION DE ARICA Y PARINACOTA"
    ],
    "comunas": [
      "Arica",
      "Camarones",
      "Putre",
      "General Lagos"
    ]
  },
  {
    "nombre": "Tarapacá",
    "aliases": [
      "I REGION",
      "REGION I",
      "PRIMERA REGION",
      "REGION DE TARAPACA"
    ],
    "comunas": [
      "Iquique",
      "Alto Hospicio",
      "Pozo Almonte",
      "Camiña",
      "Colchane",
      "Huara",
      "Pica"
    ]
  },
  {
    "nombre": "Antofagasta",
    "aliases": [
      "II REGION",
      "REGION II",
      "SEGUNDA REGION",
      "REGION DE ANTOFAGASTA"
    ],
    "comunas": [
      "Antofagasta",
      "Mejillones",
      "Sierra Gorda",
      "Taltal",
      "Calama",
      "Ollagüe",
      "San Pedro de Atacama",
      "Tocopilla",
      "María Elena"
    ]
  },
  {
    "nombre": "Atacama",
    "aliases": [
      "III REGION",
      "REGION III",
      "TERCERA REGION",
      "REGION DE ATACAMA"
    ],
    "comunas": [
      "Copiapó",
      "Caldera",
      "Tierra Amarilla",
      "Chañaral",
      "Diego de Almagro",
      "Vallenar",
      "Alto del Carmen",
      "Freirina",
      "Huasco"
    ]
  },
  {
    "nombre": "Coquimbo",
    "aliases": [
      "IV REGION",
      "REGION IV",
      "CUARTA REGION",
      "REGION DE COQUIMBO"
    ],
    "comunas": [
      "La Serena",
      "Coquimbo",
      "Andacollo",
      "La Higuera",
      "Paiguano",
      "Vicuña",
      "Illapel",
      "Canela",
      "Los Vilos",
      "Salamanca",
      "Ovalle",
      "Combarbalá",
      "Monte Patria",
      "Punitaqui",
      "Río Hurtado"
    ]
  },
  {
    "nombre": "Valparaíso",
    "aliases": [
      "V REGION",
      "REGION V",
      "QUINTA REGION",
      "REGION DE VALPARAISO"
    ],
    "comunas": [
      "Valparaíso",
      "Casablanca",
      "Concón",
      "Juan Fernández",
      "Puchuncaví",
      "Quintero",
      "Viña del Mar",
      "Isla de Pascua",
      "Los Andes",
      "Calle Larga",
      "Riconada",
      "San Esteban",
      "La Ligua",
      "Cabildo",
      "Papudo",
      "Petorca",
      "Zapallar",
      "Quillota",
      "Calera",
      "Hijuelas",
      "La Cruz",
      "Nogales",
      "San Antonio",
      "Algarrobo",
      "Cartagena",
      "El Quisco",
      "El Tabo",
      "Santo Domingo",
      "San Felipe",
      "Catemu",
      "Llaillay",
      "Panquehue",
      "Putaendo",
      "Santa María",
      "Quilpué",
      "Limache",
      "Olmué",
      "Villa Alemana"
    ]
  },
  {
    "nombre": "O'Higgins",
    "aliases": [
      "VI REGION",
      "REGION VI",
      "SEXTA REGION",
      "REGION DE O'HIGGINS",
      "REGION DEL LIBERTADOR GENERAL BERNARDO O'HIGGINS",
      "REGION DEL LIBERTADOR BERNARDO O'HIGGINS",
      "OHIGGINS"
    ],
    "comunas": [
      "Rancagua",
      "Codegua",
      "Coinco",
      "Coltauco",
      "Doñihue",
      "Graneros",
      "Las Cabras",
      "Machalí",
      "Malloa",
      "Mostazal",
      "Olivar",
      "Peumo",
      "Pichidegua",
      "Quinta de Tilcoco",
      "Rengo",
      "Requínoa",
      "San Vicente",
      "Pichilemu",
      "La Estrella",
      "Litueche",
      "Marichihue",
      "Navidad",
      "Paredones",
      "San Fernando",
      "Chépica",
      "Chimbarongo",
      "Lolol",
      "Nancagua",
      "Palmilla",
      "Peralillo",
      "Placilla",
      "Pumanque",
      "Santa Cruz"
    ]
  },
  {
    "nombre": "Maule",
    "aliases": [
      "VII REGION",
      "REGION VII",
      "SEPTIMA REGION",
      "REGION DEL MAULE"
    ],
    "comunas": [
      "Talca",
      "Constitución",
      "Curepto",
      "Empedrado",
      "Maule",
      "Pelarco",
      "Pencahue",
      "Río Claro",
      "San Clemente",
      "San Rafael",
      "Cauquenes",
      "Chanco",
      "Pelluhue",
      "Curicó",
      "Hualañé",
      "Licantén",
      "Molina",
      "Rauco",
      "Romeral",
      "Sagrada Familia",
      "Teno",
      "Vichuquén",
      "Linares",
      "Colbún",
      "Longaví",
      "Parral",
      "Retiro",
      "San Javier",
      "Villa Alegre",
      "Yerbas Buenas"
    ]
  },
  {
    "nombre": "Biobío",
    "aliases": [
      "VIII REGION",
      "REGION VIII",
      "OCTAVA REGION",
      "REGION DEL BIOBIO",
      "REGION DEL BIO BIO"
    ],
    "comunas": [
      "Concepción",
      "Coronel",
      "Chiguayante",
      "Florida",
      "Hualqui",
      "Lota",
      "Penco",
      "San Pedro de la Paz",
      "Santa Juana",
      "Talcahuano",
      "Tomé",
      "Hualpén",
      "Lebu",
      "Arauco",
      "Cañete",
      "Contulmo",
      "Curanilahue",
      "Los Álamos",
      "Tirúa",
      "Los Ángeles",
      "Antuco",
      "Cabrero",
      "Laja",
      "Mulchén",
      "Nacimiento",
      "Negrete",
      "Quilaco",
      "Quilleco",
      "San Rosendo",
      "Santa Bárbara",
      "Tucapel",
      "Yumbel",
      "Alto Biobío"
    ]
  },
  {
    "nombre": "Ñuble",
    "aliases": [
      "XVI REGION",
      "REGION XVI",
      "DECIMOSEXTA REGION",
      "REGION DE NUBLE"
    ],
    "comunas": [
      "Bulnes",
      "Chillán",
      "Chillán Viejo",
      "El Carmen",
      "Pemuco",
      "Pinto",
      "Quillón",
      "San Ignacio",
      "Yungay",
      "Cobquecura",
      "Coelemu",
      "Ninhue",
      "Portezuelo",
      "Quirihue",
      "Ránquil",
      "Treguaco",
      "Coihueco",
      "Ñiquén",
      "San Carlos",
      "San Fabián",
      "San Nicolas"
    ]
  },
  {
    "nombre": "Araucanía",
    "aliases": [
      "IX REGION",
      "REGION IX",
      "NOVENA REGION",
      "REGION DE LA ARAUCANIA"
    ],
    "comunas": [
      "Temuco",
      "Carahu",
      "Cunco",
      "Curarrehue",
      "Freire",
      "Galvarin",
      "Gorbea",
      "Lautaro",
      "Loncoche",
      "Melipeuco",
      "Nueva Imperial",
      "Padre las Casa",
      "Perquenco",
      "Pitrufquén",
      "Pucó",
      "Saavedra",
      "Teodoro Schmid",
      "Toltén",
      "Vilcún",
      "Villarrica",
      "Cholchol",
      "Angol",
      "Collipulli",
      "Curacautín",
      "Ercilla",
      "Lonquimay",
      "Los Sauces",
      "Lumaco",
      "Purén",
      "Renaico",
      "Traiguén",
      "Victoria"
    ]
  },
  {
    "nombre": "Los Ríos",
    "aliases": [
      "XIV REGION",
      "REGION XIV",
      "DECIMOCUARTA REGION",
      "REGION DE LOS RIOS"
    ],
    "comunas": [
      "Valdivia",
      "Corral",
      "Lanco",
      "Los Lagos",
      "Máfil",
      "Mariquina",
      "Paillaco",
      "Panguipulli",
      "La Unión",
      "Futrono",
      "Lago Ranco",
      "Río Bueno"
    ]
  },
  {
    "nombre": "Los Lagos",
    "aliases": [
      "X REGION",
      "REGION X",
      "DECIMA REGION",
      "REGION DE LOS LAGOS"
    ],
    "comunas": [
      "Puerto Montt",
      "Calbuco",
      "Cochamó",
      "Fresia",
      "Frutillar",
      "Los Muermos",
      "Llanquihue",
      "Maullín",
      "Puerto Varas",
      "Castro",
      "Ancud",
      "Chonchi",
      "Curaco de Vélez",
      "Dalcahue",
      "Puqueldón",
      "Queilén",
      "Quellón",
      "Quemchi",
      "Quinchao",
      "Osorno",
      "Puerto Octay",
      "Purranque",
      "Puyehue",
      "Río Negro",
      "San Juan de la Costa",
      "San Pablo",
      "Chaitén",
      "Futaleufú",
      "Hualaihué",
      "Palena"
    ]
  },
  {
    "nombre": "Aysén",
    "aliases": [
      "XI REGION",
      "REGION XI",
      "UNDECIMA REGION",
      "REGION DE AYSEN",
      "REGION DE AISEN",
      "REGION AISEN DEL GENERAL CARLOS IBANEZ DEL CAMPO"
    ],
    "comunas": [
      "Coyhaique",
      "Lago Verde",
      "Aisén",
      "Cisnes",
      "Guaitecas",
      "Cochrane",
      "O’Higgins",
      "Tortel",
      "Chile Chico",
      "Río Ibáñez"
    ]
  },
  {
    "nombre": "Magallanes",
    "aliases": [
      "XII REGION",
      "REGION XII",
      "DUODECIMA REGION",
      "REGION DE MAGALLANES",
      "REGION DE MAGALLANES Y LA ANTARTICA CHILENA"
    ],
    "comunas": [
      "Punta Arenas",
      "Laguna Blanca",
      "Río Verde",
      "San Gregorio",
      "Cabo de Hornos (Ex. Navarino)",
      "Antártica",
      "Porvenir",
      "Primavera",
      "Timaukel",
      "Natales",
      "Torres del Paine"
    ]
  },
  {
    "nombre": "Metropolitana",
    "aliases": [
      "RM",
      "R.M.",
      "REGION METROPOLITANA",
      "XIII REGION",
      "REGION XIII",
      "DECIMOTERCERA REGION"
    ],
    "comunas": [
      "Santiago",
      "Cerrillos",
      "Cerro Navia",
      "Conchalí",
      "El Bosque",
      "Estación Central",
      "Huechuraba",
      "Independencia",
      "La Cisterna",
      "La Florida",
      "La Granja",
      "La Pintana",
      "La Reina",
      "Las Condes",
      "Lo Barnechea",
      "Lo Espejo",
      "Lo Prado",
      "Macul",
      "Maipú",
      "Ñuñoa",
      "Pedro Aguirre Cerda",
      "Peñalolén",
      "Providencia",
      "Pudahuel",
      "Quilicura",
      "Quinta Normal",
      "Recoleta",
      "Renca",
      "San Joaquín",
      "San Miguel",
      "San Ramón",
      "Vitacura",
      "Puente Alto",
      "Pirque",
      "San José de Maipo",
      "Colina",
      "Lampa",
      "Tiltil",
      "San Bernardo",
      "Buin",
      "Calera de Tango",
      "Paine",
      "Melipilla",
      "Alhué",
      "Curacaví",
      "María Pinto",
      "San Pedro",
      "Talagante",
      "El Monte",
      "Isla de Maipo",
      "Padre Hurtado",
      "Peñaflor"
    ]
  }
];
