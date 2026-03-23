export const UK_CITY_AREAS = [
  'Bath, Somerset',
  'Birmingham, West Midlands',
  'Bradford, West Yorkshire',
  'Brighton, East Sussex',
  'Bristol, South West',
  'Cambridge, Cambridgeshire',
  'Cardiff, South Glamorgan',
  'Cheltenham, Gloucestershire',
  'Coventry, West Midlands',
  'Edinburgh, Lothian',
  'Exeter, Devon',
  'Glasgow, Lanarkshire',
  'Gloucester, Gloucestershire',
  'Leeds, West Yorkshire',
  'Leicester, Leicestershire',
  'Liverpool, Merseyside',
  'London, Greater London',
  'Manchester, Greater Manchester',
  'Newcastle, Tyne and Wear',
  'Nottingham, Nottinghamshire',
  'Oxford, Oxfordshire',
  'Plymouth, Devon',
  'Reading, Berkshire',
  'Sheffield, South Yorkshire',
  'Southampton, Hampshire',
  'Stoke-on-Trent, Staffordshire',
  'Swansea, West Glamorgan',
  'York, North Yorkshire',
];

const CITY_POSTCODE_HINTS = {
  'Bath, Somerset': 'BA1 1AA',
  'Birmingham, West Midlands': 'B1 1AA',
  'Bradford, West Yorkshire': 'BD1 1AA',
  'Brighton, East Sussex': 'BN1 1AA',
  'Bristol, South West': 'BS1 1AA',
  'Cambridge, Cambridgeshire': 'CB1 1AA',
  'Cardiff, South Glamorgan': 'CF10 1AA',
  'Cheltenham, Gloucestershire': 'GL50 1AA',
  'Coventry, West Midlands': 'CV1 1AA',
  'Edinburgh, Lothian': 'EH1 1AA',
  'Exeter, Devon': 'EX1 1AA',
  'Glasgow, Lanarkshire': 'G1 1AA',
  'Gloucester, Gloucestershire': 'GL1 1AA',
  'Leeds, West Yorkshire': 'LS1 1AA',
  'Leicester, Leicestershire': 'LE1 1AA',
  'Liverpool, Merseyside': 'L1 1AA',
  'London, Greater London': 'SW1A 1AA',
  'Manchester, Greater Manchester': 'M1 1AA',
  'Newcastle, Tyne and Wear': 'NE1 1AA',
  'Nottingham, Nottinghamshire': 'NG1 1AA',
  'Oxford, Oxfordshire': 'OX1 1AA',
  'Plymouth, Devon': 'PL1 1AA',
  'Reading, Berkshire': 'RG1 1AA',
  'Sheffield, South Yorkshire': 'S1 1AA',
  'Southampton, Hampshire': 'SO14 1AA',
  'Stoke-on-Trent, Staffordshire': 'ST1 1AA',
  'Swansea, West Glamorgan': 'SA1 1AA',
  'York, North Yorkshire': 'YO1 1AA',
};

export function getUkPostcodeHint(cityOrArea = '') {
  return CITY_POSTCODE_HINTS[cityOrArea] || 'GL1 1AA';
}

export function normalizeUkPhone(rawValue = '') {
  const compact = String(rawValue).trim().replace(/[^\d+]/g, '');

  if (!compact) return '';

  if (compact.startsWith('+44')) {
    const rest = compact.slice(3).replace(/\D/g, '');
    return rest.length === 10 ? `+44${rest}` : '';
  }

  const digits = compact.replace(/\D/g, '');

  if (digits.startsWith('44') && digits.length === 12) {
    return `+44${digits.slice(2)}`;
  }

  if (digits.startsWith('0') && digits.length === 11) {
    return `+44${digits.slice(1)}`;
  }

  if (digits.length === 10 && digits.startsWith('7')) {
    return `+44${digits}`;
  }

  return '';
}

export function formatUkPhoneInput(rawValue = '') {
  const normalized = normalizeUkPhone(rawValue);
  if (!normalized) return String(rawValue).replace(/[^\d+\s]/g, '');

  const local = normalized.slice(3);
  return `+44 ${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7)}`;
}

export function normalizeUkPostcode(rawValue = '') {
  const compact = String(rawValue).toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (compact.length < 5 || compact.length > 7) return '';

  const withSpace = `${compact.slice(0, -3)} ${compact.slice(-3)}`;
  const postcodeRegex = /^(GIR 0AA|[A-PR-UWYZ][A-HK-Y]?\d[\dA-HJKSTUW]? \d[ABD-HJLNP-UW-Z]{2})$/;

  return postcodeRegex.test(withSpace) ? withSpace : '';
}

export function isValidUkPostcode(rawValue = '') {
  return !!normalizeUkPostcode(rawValue);
}

export function formatUkPostcodeInput(rawValue = '') {
  const safe = String(rawValue).toUpperCase().replace(/[^A-Z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
  const normalized = normalizeUkPostcode(safe);
  return normalized || safe;
}