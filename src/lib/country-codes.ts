/**
 * Country name (Spanish) ↔ ISO 3166-1 alpha-2 code mapping
 * Used to bridge Stripe AddressElement (ISO codes) with the backend (country names)
 */

const nameToCode: Record<string, string> = {
  'Afganistán': 'AF', 'Albania': 'AL', 'Alemania': 'DE', 'Andorra': 'AD',
  'Angola': 'AO', 'Argentina': 'AR', 'Armenia': 'AM', 'Australia': 'AU',
  'Austria': 'AT', 'Azerbaiyán': 'AZ', 'Bahamas': 'BS', 'Bangladés': 'BD',
  'Barbados': 'BB', 'Baréin': 'BH', 'Bélgica': 'BE', 'Belice': 'BZ',
  'Benín': 'BJ', 'Bielorrusia': 'BY', 'Bolivia': 'BO',
  'Bosnia y Herzegovina': 'BA', 'Botsuana': 'BW', 'Brasil': 'BR',
  'Brunéi': 'BN', 'Bulgaria': 'BG', 'Burkina Faso': 'BF', 'Burundi': 'BI',
  'Bután': 'BT', 'Cabo Verde': 'CV', 'Camboya': 'KH', 'Camerún': 'CM',
  'Canadá': 'CA', 'Catar': 'QA', 'Chad': 'TD', 'Chile': 'CL', 'China': 'CN',
  'Chipre': 'CY', 'Colombia': 'CO', 'Comoras': 'KM', 'Congo': 'CG',
  'Corea del Norte': 'KP', 'Corea del Sur': 'KR', 'Costa de Marfil': 'CI',
  'Costa Rica': 'CR', 'Croacia': 'HR', 'Cuba': 'CU', 'Dinamarca': 'DK',
  'Dominica': 'DM', 'Ecuador': 'EC', 'Egipto': 'EG', 'El Salvador': 'SV',
  'Emiratos Árabes Unidos': 'AE', 'Eritrea': 'ER', 'Eslovaquia': 'SK',
  'Eslovenia': 'SI', 'España': 'ES', 'Estados Unidos': 'US', 'Estonia': 'EE',
  'Etiopía': 'ET', 'Filipinas': 'PH', 'Finlandia': 'FI', 'Fiyi': 'FJ',
  'Francia': 'FR', 'Gabón': 'GA', 'Gambia': 'GM', 'Georgia': 'GE',
  'Ghana': 'GH', 'Granada': 'GD', 'Grecia': 'GR', 'Guatemala': 'GT',
  'Guinea': 'GN', 'Guinea-Bisáu': 'GW', 'Guinea Ecuatorial': 'GQ',
  'Guyana': 'GY', 'Haití': 'HT', 'Honduras': 'HN', 'Hungría': 'HU',
  'India': 'IN', 'Indonesia': 'ID', 'Irak': 'IQ', 'Irán': 'IR',
  'Irlanda': 'IE', 'Islandia': 'IS', 'Israel': 'IL', 'Italia': 'IT',
  'Jamaica': 'JM', 'Japón': 'JP', 'Jordania': 'JO', 'Kazajistán': 'KZ',
  'Kenia': 'KE', 'Kirguistán': 'KG', 'Kiribati': 'KI', 'Kuwait': 'KW',
  'Laos': 'LA', 'Lesoto': 'LS', 'Letonia': 'LV', 'Líbano': 'LB',
  'Liberia': 'LR', 'Libia': 'LY', 'Liechtenstein': 'LI', 'Lituania': 'LT',
  'Luxemburgo': 'LU', 'Madagascar': 'MG', 'Malasia': 'MY', 'Malaui': 'MW',
  'Maldivas': 'MV', 'Malí': 'ML', 'Malta': 'MT', 'Marruecos': 'MA',
  'Mauricio': 'MU', 'Mauritania': 'MR', 'México': 'MX', 'Micronesia': 'FM',
  'Moldavia': 'MD', 'Mónaco': 'MC', 'Mongolia': 'MN', 'Montenegro': 'ME',
  'Mozambique': 'MZ', 'Birmania': 'MM', 'Namibia': 'NA', 'Nauru': 'NR',
  'Nepal': 'NP', 'Nicaragua': 'NI', 'Níger': 'NE', 'Nigeria': 'NG',
  'Noruega': 'NO', 'Nueva Zelanda': 'NZ', 'Omán': 'OM', 'Países Bajos': 'NL',
  'Pakistán': 'PK', 'Palaos': 'PW', 'Panamá': 'PA',
  'Papúa Nueva Guinea': 'PG', 'Paraguay': 'PY', 'Perú': 'PE', 'Polonia': 'PL',
  'Portugal': 'PT', 'Reino Unido': 'GB', 'República Centroafricana': 'CF',
  'República Checa': 'CZ', 'República del Congo': 'CD',
  'República Dominicana': 'DO', 'Ruanda': 'RW', 'Rumania': 'RO', 'Rusia': 'RU',
  'Samoa': 'WS', 'San Cristóbal y Nieves': 'KN', 'San Marino': 'SM',
  'San Vicente y las Granadinas': 'VC', 'Santa Lucía': 'LC',
  'Santo Tomé y Príncipe': 'ST', 'Senegal': 'SN', 'Serbia': 'RS',
  'Seychelles': 'SC', 'Sierra Leona': 'SL', 'Singapur': 'SG', 'Siria': 'SY',
  'Somalia': 'SO', 'Sri Lanka': 'LK', 'Suazilandia': 'SZ', 'Sudáfrica': 'ZA',
  'Sudán': 'SD', 'Sudán del Sur': 'SS', 'Suecia': 'SE', 'Suiza': 'CH',
  'Surinam': 'SR', 'Tailandia': 'TH', 'Tanzania': 'TZ', 'Tayikistán': 'TJ',
  'Timor Oriental': 'TL', 'Togo': 'TG', 'Tonga': 'TO',
  'Trinidad y Tobago': 'TT', 'Túnez': 'TN', 'Turkmenistán': 'TM',
  'Turquía': 'TR', 'Tuvalu': 'TV', 'Ucrania': 'UA', 'Uganda': 'UG',
  'Uruguay': 'UY', 'Uzbekistán': 'UZ', 'Vanuatu': 'VU', 'Venezuela': 'VE',
  'Vietnam': 'VN', 'Yemen': 'YE', 'Yibuti': 'DJ', 'Zambia': 'ZM',
  'Zimbabue': 'ZW',
}

// Reverse map: code → name
const codeToName: Record<string, string> = Object.fromEntries(
  Object.entries(nameToCode).map(([name, code]) => [code, name])
)

/** Convert country name (Spanish) to ISO 2-letter code. Returns the input if no match. */
export function countryNameToCode(name: string): string {
  return nameToCode[name] || name.toUpperCase().slice(0, 2)
}

/** Convert ISO 2-letter code to country name (Spanish). Returns the code if no match. */
export function countryCodeToName(code: string): string {
  return codeToName[code.toUpperCase()] || code
}

/** Convert an array of country names to ISO codes for Stripe's allowedCountries */
export function countryNamesToIsoCodes(names: string[]): string[] {
  return names.map(n => nameToCode[n]).filter(Boolean)
}