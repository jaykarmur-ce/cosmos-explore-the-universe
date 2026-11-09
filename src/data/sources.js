/**
 * Reference sources for scientific content used throughout COSMOS.
 * Values that change over time (e.g. moon counts) carry their own "as of" date
 * in the dataset that uses them.
 */
export const SOURCES = {
  nasaFactSheet: {
    id: 'nasaFactSheet',
    label: 'NASA NSSDCA — Planetary Fact Sheet (metric)',
    url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/',
  },
  nasaSunFactSheet: {
    id: 'nasaSunFactSheet',
    label: 'NASA NSSDCA — Sun Fact Sheet',
    url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/sunfact.html',
  },
  nasaScience: {
    id: 'nasaScience',
    label: 'NASA Science — Solar System Exploration',
    url: 'https://science.nasa.gov/solar-system/',
  },
  moonCounts: {
    id: 'moonCounts',
    label: 'IAU Minor Planet Center satellite announcements (compiled by Sky & Telescope, Nov 2025)',
    url: 'https://skyandtelescope.org/astronomy-news/solar-system/a-guide-to-planetary-satellites/',
  },
  jplApproxPositions: {
    id: 'jplApproxPositions',
    label: 'JPL SSD — Approximate Positions of the Planets (mean longitudes, J2000)',
    url: 'https://ssd.jpl.nasa.gov/planets/approx_pos.html',
  },
  exoplanetArchive: {
    id: 'exoplanetArchive',
    label: 'NASA Exoplanet Archive (NExScI / Caltech-IPAC)',
    url: 'https://exoplanetarchive.ipac.caltech.edu/',
  },
  esaScience: {
    id: 'esaScience',
    label: 'ESA — Space Science',
    url: 'https://www.esa.int/Science_Exploration/Space_Science',
  },
  nasaHistory: {
    id: 'nasaHistory',
    label: 'NASA History Office',
    url: 'https://www.nasa.gov/history/',
  },
  eht: {
    id: 'eht',
    label: 'Event Horizon Telescope Collaboration',
    url: 'https://eventhorizontelescope.org/',
  },
};

export const SOURCE_LIST = Object.values(SOURCES);
