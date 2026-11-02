// Astrodynamics: wheel rendering, ephemeris calculations and the info panels.
// Depends on lore.js (LORE, ZODIAC, DAY_RULERS, CHALDEAN) and astronomy-engine.

const SVG_NS = 'http://www.w3.org/2000/svg';
const DEG = Math.PI / 180;
const HOUR_MS = 3600000;
const DAY_MS = 86400000;
const VIEW_HALF = 130; // SVG viewBox is -130..130
const view = { zoom: 1, cx: 0, cy: 0, follow: null }; // zoom window centre in SVG units; follow = body id

// Wheel radii (SVG units)
const R = {
    outer: 117, band: 99, house: 89, aspect: 16,
    zodiacName: 112, zodiacSymbol: 104, houseLabel: 94,
    starDot: 120.5, starLabel: 125, angleLabel: 126
};

const bodies = [
    { id: "Moon",      name: "Moon",       symbol: "☽", color: "#e2e8f0", radius: 23,   size: 30, glow: "rgba(226, 232, 240, 0.5)" },
    { id: "Sun",       name: "Sun",        symbol: "☉", color: "#fcd34d", radius: 30,   size: 34, glow: "rgba(252, 211, 77, 0.6)" },
    { id: "Mercury",   name: "Mercury",    symbol: "☿", color: "#9ca3af", radius: 36.5, size: 24, glow: "rgba(156, 163, 175, 0.4)" },
    { id: "Venus",     name: "Venus",      symbol: "♀", color: "#f472b6", radius: 43,   size: 26, glow: "rgba(244, 114, 182, 0.5)" },
    { id: "Mars",      name: "Mars",       symbol: "♂", color: "#ef4444", radius: 49.5, size: 24, glow: "rgba(239, 68, 68, 0.5)" },
    { id: "Jupiter",   name: "Jupiter",    symbol: "♃", color: "#fb923c", radius: 56,   size: 30, glow: "rgba(251, 146, 60, 0.5)" },
    { id: "Saturn",    name: "Saturn",     symbol: "♄", color: "#fde047", radius: 62.5, size: 28, glow: "rgba(253, 224, 71, 0.4)" },
    { id: "Uranus",    name: "Uranus",     symbol: "♅", color: "#38bdf8", radius: 69,   size: 24, glow: "rgba(56, 189, 248, 0.4)" },
    { id: "Neptune",   name: "Neptune",    symbol: "♆", color: "#3b82f6", radius: 75,   size: 24, glow: "rgba(59, 130, 246, 0.4)" },
    { id: "Pluto",     name: "Pluto",      symbol: "♇", color: "#d8b4fe", radius: 80.5, size: 22, glow: "rgba(216, 180, 254, 0.4)" },
    { id: "NorthNode", name: "North Node", symbol: "☊", color: "#a3e635", radius: 85.5, size: 18, glow: "rgba(163, 230, 53, 0.4)", node: true },
    { id: "SouthNode", name: "South Node", symbol: "☋", color: "#84cc16", radius: 85.5, size: 18, glow: "rgba(132, 204, 22, 0.4)", node: true }
];
// Nodes are called Rahu/Ketu in sidereal (Vedic) mode and North/South Node in tropical mode.
const NODE_NAMES = { NorthNode: ['North Node', 'Rahu'], SouthNode: ['South Node', 'Ketu'] };
for (const b of bodies) {
    if (b.node) Object.defineProperty(b, 'name', { get: () => NODE_NAMES[b.id][state.mode === 'sidereal' ? 1 : 0] });
}
const BODY = Object.fromEntries(bodies.map(b => [b.id, b]));
const PLANET_IDS = bodies.filter(b => !b.node).map(b => b.id);
const ASPECT_TYPES = ["conjunction", "sextile", "square", "trine", "quincunx", "opposition"];
const ASPECT_COLORS = {
    conjunction: "#e2e8f0", sextile: "#38bdf8", trine: "#4ade80",
    square: "#f87171", opposition: "#fb923c", quincunx: "#c084fc"
};
const ELEMENT_COLORS = { Fire: "#f87171", Earth: "#a3e635", Air: "#fde047", Water: "#60a5fa" };
// The nine Vedic grahas and their sign-based aspects (graha drishti), counted inclusively.
const GRAHAS = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "NorthNode", "SouthNode"];
const DRISHTI = { Mars: [4, 7, 8], Jupiter: [5, 7, 9], Saturn: [3, 7, 10], NorthNode: [5, 7, 9], SouthNode: [5, 7, 9] };
const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

// ---------------------------------------------------------------------------
// State & persistence

const STORAGE_KEY = 'astrodynamics.settings.v2';
const state = {
    date: new Date(),
    mode: 'tropical',            // 'tropical' | 'sidereal'
    nodeType: 'mean',            // 'mean' | 'true'
    location: null,              // { lat, lon }
    layers: {
        zodiac: true, 'zodiac-names': true, houses: true, ticks: true,
        stars: true, aspects: true, 'planet-names': true, nodes: true
    },
    tab: 'sky',
    detail: null,                // { type, key } when the detail view is open
    eventDays: 30,
    eventMoon: false,
    librarySearch: '',
    playTimer: null,
    playStep: 'day'
};

function loadSettings() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        if (saved.mode) state.mode = saved.mode;
        if (saved.nodeType) state.nodeType = saved.nodeType;
        if (saved.location) state.location = saved.location;
        if (saved.layers) Object.assign(state.layers, saved.layers);
        if (saved.eventDays) state.eventDays = saved.eventDays;
        if (typeof saved.eventMoon === 'boolean') state.eventMoon = saved.eventMoon;
        if (saved.playStep) state.playStep = saved.playStep;
    } catch (e) {
        console.warn('Could not read saved settings', e);
    }
}

function saveSettings() {
    const { mode, nodeType, location, layers, eventDays, eventMoon, playStep } = state;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ mode, nodeType, location, layers, eventDays, eventMoon, playStep }));
}

// ---------------------------------------------------------------------------
// Math & formatting helpers

const norm360 = x => ((x % 360) + 360) % 360;
const wrap180 = x => { x = norm360(x); return x > 180 ? x - 360 : x; };
const addHours = (date, h) => new Date(date.getTime() + h * HOUR_MS);
const addDays = (date, d) => new Date(date.getTime() + d * DAY_MS);
const signIndex = lon => Math.floor(norm360(lon) / 30) % 12;
const signName = lon => ZODIAC[signIndex(lon)];
const signSymbol = name => LORE.zodiac[name].symbol;

function ordinal(n) {
    const rem100 = n % 100;
    if (rem100 >= 11 && rem100 <= 13) return `${n}th`;
    return n + ({ 1: 'st', 2: 'nd', 3: 'rd' }[n % 10] || 'th');
}

function fmtDegInSign(lon) {
    const inSign = norm360(lon) % 30;
    let d = Math.floor(inSign);
    let m = Math.round((inSign - d) * 60);
    if (m === 60) { d += 1; m = 0; }
    return `${d}°${String(m).padStart(2, '0')}'`;
}

function fmtSign(lon, withName = true) {
    const name = signName(lon);
    return `${fmtDegInSign(lon)} ${signSymbol(name)}${withName ? ' ' + name : ''}`;
}

// Position in the active zodiac: degrees into the sign, or (astronomical mode) degrees past the constellation's western border.
function fmtPos(lon, withName = true) {
    if (!isAstro()) return fmtSign(lon, withName);
    const c = constellationOf(lon);
    const into = norm360(lon - c.start);
    let d = Math.floor(into), m = Math.round((into - d) * 60);
    if (m === 60) { d += 1; m = 0; }
    return `${d}°${String(m).padStart(2, '0')}' ${c.symbol}${withName ? ' ' + c.name : ''}`;
}

function fmtOrb(orb) {
    const d = Math.floor(orb);
    return `${d}°${String(Math.round((orb - d) * 60)).padStart(2, '0')}'`;
}

function fmtDate(date, opts = {}) {
    return date.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', ...opts });
}

function fmtTime(date) {
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

function fmtDuration(ms) {
    const h = Math.round(Math.abs(ms) / HOUR_MS);
    if (h < 48) return `${h}h`;
    return `${Math.round(h / 24)}d`;
}

// Rotation that lays text along the circle at a longitude, flipped to stay upright.
function tangentRotation(lon) {
    let rot = wrap180(-90 - lon);
    if (Math.abs(rot) > 90) rot = wrap180(rot + 180);
    return rot;
}

function polar(r, lon) {
    const a = lon * DEG;
    return { x: -r * Math.cos(a), y: r * Math.sin(a) };
}

function esc(s) {
    return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

// ---------------------------------------------------------------------------
// Ephemeris

// Lahiri (Chitrapaksha) ayanamsa, linear approximation good to ~1' over 1900–2100.
function ayanamsa(date) {
    const years = (date.getTime() - Date.UTC(2000, 0, 1, 12)) / (365.25 * DAY_MS);
    return 23.853 + years * 0.0139694;
}

// ---------------------------------------------------------------------------
// Astronomical mode: the 13 IAU constellations the ecliptic passes through, with their real, unequal borders.
// Borders are found once along the J2000 ecliptic with astronomy-engine's official IAU boundary lookup, then
// shifted into the sidereal frame. That shift is a constant: the Lahiri ayanamsa grows at the same rate as the
// precession that carries the stars (and their borders) through the tropical zodiac.

const SIDEREAL_OFFSET_J2000 = 23.853; // ayanamsa(J2000)
let CONSTELLATIONS = [];               // [{ name, symbol, start, width }] in sidereal longitude, in ecliptic order

const isAstro = () => state.mode === 'astronomical';

function constellationAtJ2000(lon, lat = 0) {
    const time = Astronomy.MakeTime(new Date(Date.UTC(2000, 0, 1, 12)));
    const v = new Astronomy.Vector(Math.cos(lat * DEG) * Math.cos(lon * DEG), Math.cos(lat * DEG) * Math.sin(lon * DEG), Math.sin(lat * DEG), time);
    const eq = Astronomy.EquatorFromVector(Astronomy.RotateVector(Astronomy.Rotation_ECL_EQJ(), v));
    return Astronomy.Constellation(eq.ra, eq.dec).name;
}

function buildConstellations() {
    const borders = [];
    let prevName = constellationAtJ2000(0);
    for (let lon = 0.25; lon <= 360; lon += 0.25) {
        const name = constellationAtJ2000(lon);
        if (name === prevName) continue;
        let lo = lon - 0.25, hi = lon;
        for (let i = 0; i < 24; i++) {
            const mid = (lo + hi) / 2;
            if (constellationAtJ2000(mid) === prevName) lo = mid; else hi = mid;
        }
        borders.push({ lon: hi, name });
        prevName = name;
    }
    CONSTELLATIONS = borders.map((b, i) => {
        const next = borders[(i + 1) % borders.length];
        return {
            name: b.name,
            symbol: LORE.constellations[b.name]?.symbol || '✧',
            start: norm360(b.lon - SIDEREAL_OFFSET_J2000),
            width: norm360(next.lon - b.lon)
        };
    });
}

// Constellation segment containing a sidereal ecliptic longitude.
function constellationOf(sidLon) {
    return CONSTELLATIONS.find(c => norm360(sidLon - c.start) < c.width) || CONSTELLATIONS[0];
}

// The constellation a body is really in, using its full position (latitude included), so the Moon or a
// planet well off the ecliptic can show up in e.g. Orion, Cetus or Sextans.
function trueConstellation(id, date) {
    if (BODY[id].node) return constellationOf(norm360(tropicalLongitude(id, date) - ayanamsa(date))).name;
    const eq = Astronomy.EquatorFromVector(Astronomy.GeoVector(id, date, true));
    return Astronomy.Constellation(eq.ra, eq.dec).name;
}

// "Zones" are what ingresses are counted against: signs, or constellations in astronomical mode.
const zoneIndex = lon => isAstro() ? CONSTELLATIONS.indexOf(constellationOf(lon)) : signIndex(lon);
const zoneName = lon => isAstro() ? constellationOf(lon).name : signName(lon);
const zoneSymbol = name => (isAstro() ? LORE.constellations[name] : LORE.zodiac[name]).symbol;

function meanObliquity(date) {
    const T = Astronomy.MakeTime(date).tt / 36525;
    return 23.4392911 - 0.0130042 * T;
}

// Geocentric apparent longitude on the true ecliptic of date (tropical).
function tropicalLongitude(id, date) {
    if (id === 'NorthNode' || id === 'SouthNode') {
        const node = state.nodeType === 'true' ? trueNodeLongitude(date) : meanNodeLongitude(date);
        return id === 'NorthNode' ? node : norm360(node + 180);
    }
    return Astronomy.Ecliptic(Astronomy.GeoVector(id, date, true)).elon;
}

function meanNodeLongitude(date) {
    const T = Astronomy.MakeTime(date).tt / 36525;
    return norm360(125.04452 - 1934.136261 * T + 0.0020708 * T * T);
}

// Osculating ("true") ascending node: where the Moon's instantaneous orbital plane crosses the ecliptic of date.
function trueNodeLongitude(date) {
    const time = Astronomy.MakeTime(date);
    const s = Astronomy.RotateState(Astronomy.Rotation_EQJ_ECT(time), Astronomy.GeoMoonState(time));
    const hx = s.y * s.vz - s.z * s.vy;
    const hy = s.z * s.vx - s.x * s.vz;
    return norm360(Math.atan2(hx, -hy) / DEG);
}

function toMode(tropLon, date) {
    return state.mode === 'tropical' ? tropLon : norm360(tropLon - ayanamsa(date));
}

function longitude(id, date) {
    return toMode(tropicalLongitude(id, date), date);
}

function speedOf(id, date) {
    return wrap180(tropicalLongitude(id, addHours(date, 6)) - tropicalLongitude(id, addHours(date, -6))) * 2;
}

function computePositions(date) {
    const ayan = ayanamsa(date);
    const pos = {};
    for (const b of bodies) {
        const trop = tropicalLongitude(b.id, date);
        const speed = speedOf(b.id, date);
        const sid = norm360(trop - ayan);
        const lon = state.mode === 'tropical' ? trop : sid;
        pos[b.id] = { id: b.id, trop, sid, lon, speed, retro: speed < 0, sign: signName(lon) };
    }
    return pos;
}

function computeAngles(date, loc) {
    if (!loc) return null;
    const ramc = norm360(Astronomy.SiderealTime(date) * 15 + loc.lon) * DEG;
    const eps = meanObliquity(date) * DEG;
    const lat = loc.lat * DEG;
    const asc = norm360(Math.atan2(Math.cos(ramc), -(Math.sin(ramc) * Math.cos(eps) + Math.tan(lat) * Math.sin(eps))) / DEG);
    const mc = norm360(Math.atan2(Math.sin(ramc), Math.cos(ramc) * Math.cos(eps)) / DEG);
    return { asc: toMode(asc, date), mc: toMode(mc, date) };
}

function houseOf(lon, angles) {
    if (!angles) return null;
    return ((signIndex(lon) - signIndex(angles.asc) + 12) % 12) + 1;
}

function computeAspects(pos) {
    const list = [];
    for (let i = 0; i < PLANET_IDS.length; i++) {
        for (let j = i + 1; j < PLANET_IDS.length; j++) {
            const a = pos[PLANET_IDS[i]], b = pos[PLANET_IDS[j]];
            const sep = Math.abs(wrap180(a.trop - b.trop));
            // Separation a short while later, to tell applying from separating
            const sepLater = Math.abs(wrap180((a.trop + a.speed * 0.01) - (b.trop + b.speed * 0.01)));
            const luminary = ['Sun', 'Moon'].includes(a.id) || ['Sun', 'Moon'].includes(b.id);
            for (const type of ASPECT_TYPES) {
                const asp = LORE.aspects[type];
                const orb = Math.abs(sep - asp.angle);
                const allowed = asp.orb + (luminary ? (type === 'quincunx' ? 1 : 2) : 0);
                if (orb <= allowed) {
                    list.push({ a: a.id, b: b.id, type, orb, applying: Math.abs(sepLater - asp.angle) < orb });
                }
            }
        }
    }
    return list.sort((x, y) => x.orb - y.orb);
}

// Sign-based Vedic aspects between the nine grahas, using sidereal signs.
function computeDrishti(pos) {
    const list = [];
    for (const caster of GRAHAS) {
        const from = signIndex(pos[caster].sid);
        for (const house of DRISHTI[caster] || [7]) {
            const target = (from + house - 1) % 12;
            for (const receiver of GRAHAS) {
                if (receiver === caster || (BODY[caster].node && BODY[receiver].node)) continue;
                if (signIndex(pos[receiver].sid) === target) list.push({ caster, receiver, house, special: house !== 7 });
            }
        }
    }
    for (const d of list) d.mutual = list.some(e => e.caster === d.receiver && e.receiver === d.caster);
    return list;
}

function drishtiTargets(id, pos) {
    const from = signIndex(pos[id].sid);
    return (DRISHTI[id] || [7]).map(house => {
        const sign = ZODIAC[(from + house - 1) % 12];
        return { house, sign, planets: GRAHAS.filter(g => g !== id && signName(pos[g].sid) === sign) };
    });
}

function dignitiesOf(id, sign) {
    const p = LORE.planets[id];
    const out = [];
    if (p.rules && p.rules.includes(sign)) out.push('Domicile');
    if (p.exalt && p.exalt[0] === sign) out.push('Exalted');
    if (p.detriment && p.detriment.includes(sign)) out.push('Detriment');
    if (p.fall && p.fall.includes(sign)) out.push('Fall');
    return out;
}

function nakshatraOf(sidLon) {
    const span = 360 / 27;
    const index = Math.floor(norm360(sidLon) / span);
    const pada = Math.floor((norm360(sidLon) % span) / (span / 4)) + 1;
    return { index, pada, ...LORE.nakshatras[index] };
}

function tithiOf(pos) {
    const diff = norm360(pos.Moon.trop - pos.Sun.trop);
    const n = Math.floor(diff / 12) + 1; // 1..30
    const shukla = n <= 15;
    let name = n === 15 ? 'Purnima' : n === 30 ? 'Amavasya' : LORE.tithis[(n - 1) % 15];
    return { n, name, paksha: shukla ? 'Shukla Paksha (waxing)' : 'Krishna Paksha (waning)', note: LORE.tithiNotes[n] || LORE.tithiNotes[((n - 1) % 15) + 1] };
}

function moonPhaseInfo(date) {
    const angle = Astronomy.MoonPhase(date);
    const illum = Astronomy.Illumination('Moon', date).phase_fraction;
    const index = LORE.phases.findIndex(p => angle >= p.from && angle < p.to);
    return { angle, illum, index, ...LORE.phases[index] };
}

// Bisect between t0 (predicate false) and t1 (predicate true) to ~1 minute.
function bisect(t0, t1, pred) {
    while (t1 - t0 > 60000) {
        const mid = new Date((t0.getTime() + t1.getTime()) / 2);
        if (pred(mid)) t1 = mid; else t0 = mid;
    }
    return t1;
}

function nextIngress(id, from, maxDays, bySign = false) {
    const index = bySign ? signIndex : zoneIndex;
    const startSign = index(longitude(id, from));
    const step = id === 'Moon' ? 2 : id === 'Sun' || id === 'Mercury' || id === 'Venus' ? 12 : 24;
    let prev = from;
    for (let h = step; h <= maxDays * 24; h += step) {
        const t = addHours(from, h);
        const s = index(longitude(id, t));
        if (s !== startSign) {
            const time = bisect(prev, t, x => index(longitude(id, x)) !== startSign);
            const lon = longitude(id, addHours(time, 0.1));
            return { time, sign: bySign ? signName(lon) : zoneName(lon) };
        }
        prev = t;
    }
    return null;
}

function prevIngress(id, from, maxDays, bySign = false) {
    const index = bySign ? signIndex : zoneIndex;
    const startSign = index(longitude(id, from));
    const step = id === 'Moon' ? 2 : 24;
    let prev = from;
    for (let h = step; h <= maxDays * 24; h += step) {
        const t = addHours(from, -h);
        if (index(longitude(id, t)) !== startSign) {
            return bisect(t, prev, x => index(longitude(id, x)) === startSign);
        }
        prev = t;
    }
    return null;
}

// Stations don't depend on the zodiac mode, so results stay valid until the station passes.
const stationCache = new Map();
function nextStation(id, from, maxDays) {
    if (['Sun', 'Moon', 'NorthNode', 'SouthNode'].includes(id)) return null;
    const hit = stationCache.get(id);
    if (hit && from >= hit.from && (hit.result ? from < hit.result.time : from - hit.from < DAY_MS)) return hit.result;
    const result = searchStation(id, from, maxDays);
    stationCache.set(id, { from, result });
    return result;
}

function searchStation(id, from, maxDays) {
    const startRetro = speedOf(id, from) < 0;
    let prev = from;
    for (let d = 1; d <= maxDays; d++) {
        const t = addDays(from, d);
        if ((speedOf(id, t) < 0) !== startRetro) {
            const time = bisect(prev, t, x => (speedOf(id, x) < 0) !== startRetro);
            return { time, kind: startRetro ? 'direct' : 'retrograde' };
        }
        prev = t;
    }
    return null;
}

// Void-of-course Moon: from the Moon's last Ptolemaic aspect in its sign until it changes sign.
function voidOfCourse(date) {
    const ingress = nextIngress('Moon', date, 4, true);
    const signStart = prevIngress('Moon', date, 4, true);
    if (!ingress || !signStart) return null;
    const targets = [0, 60, 90, 120, 180, 240, 270, 300];
    const planets = PLANET_IDS.filter(id => id !== 'Moon');
    let last = null;
    const sampleAt = t => {
        const moon = tropicalLongitude('Moon', t);
        return Object.fromEntries(planets.map(id => [id, norm360(moon - tropicalLongitude(id, t))]));
    };
    let t0 = signStart, s0 = sampleAt(t0);
    while (t0 < ingress) {
        const t1 = new Date(Math.min(addHours(t0, 2).getTime(), ingress.getTime()));
        const s1 = sampleAt(t1);
        for (const id of planets) {
            for (const target of targets) {
                const f0 = wrap180(s0[id] - target), f1 = wrap180(s1[id] - target);
                if (f0 <= 0 && f1 > 0 && Math.abs(f0) < 30) {
                    const f = x => wrap180(norm360(tropicalLongitude('Moon', x) - tropicalLongitude(id, x)) - target) > 0;
                    const time = bisect(t0, t1, f);
                    if (!last || time > last.time) {
                        const type = ASPECT_TYPES.find(k => LORE.aspects[k].angle === (target > 180 ? 360 - target : target));
                        last = { time, planet: id, type };
                    }
                }
            }
        }
        t0 = t1; s0 = s1;
    }
    return {
        start: last ? last.time : signStart,
        end: ingress.time,
        nextSign: ingress.sign,
        lastAspect: last,
        active: (last ? last.time : signStart) <= date
    };
}

function planetaryHour(date, loc) {
    if (!loc) return null;
    const obs = new Astronomy.Observer(loc.lat, loc.lon, 0);
    const riseAfter = t => {
        const r = Astronomy.SearchRiseSet('Sun', obs, +1, t, 2);
        return r ? r.date : null;
    };
    let rise = riseAfter(addDays(date, -1.5));
    if (!rise) return null;
    let next = riseAfter(addHours(rise, 1));
    while (next && next <= date) { rise = next; next = riseAfter(addHours(rise, 1)); }
    const setR = Astronomy.SearchRiseSet('Sun', obs, -1, rise, 1.5);
    if (!next || !setR) return null;
    const set = setR.date;
    // Weekday by local mean solar time at the location
    const dayRuler = DAY_RULERS[new Date(rise.getTime() + loc.lon / 15 * HOUR_MS).getUTCDay()];
    const isDay = date < set;
    const span = isDay ? (set - rise) / 12 : (next - set) / 12;
    const base = isDay ? rise : set;
    const idx = Math.min(11, Math.floor((date - base) / span));
    const hourIndex = (isDay ? 0 : 12) + idx;
    const ruler = CHALDEAN[(CHALDEAN.indexOf(dayRuler) + hourIndex) % 7];
    return {
        ruler, dayRuler, isDay, hourNumber: idx + 1,
        start: new Date(base.getTime() + idx * span),
        end: new Date(base.getTime() + (idx + 1) * span),
        sunrise: rise, sunset: set, nextSunrise: next
    };
}

// Upcoming ingresses, stations, lunar phases and eclipses.
const eventCache = new Map();
function findEvents(start, days, includeMoonIngress) {
    const cacheKey = `${Math.floor(start.getTime() / HOUR_MS)}|${days}|${includeMoonIngress}|${state.mode}|${state.nodeType}`;
    if (eventCache.has(cacheKey)) return eventCache.get(cacheKey);
    const end = addDays(start, days);
    const events = [];
    const stepH = 6;
    const steps = Math.ceil(days * 24 / stepH);

    for (const b of bodies) {
        if (b.id === 'SouthNode') continue; // mirrors the North Node
        if (b.id === 'Moon' && !includeMoonIngress) continue;
        let tPrev = start, lonPrev = longitude(b.id, start), dPrev = null;
        for (let i = 1; i <= steps; i++) {
            const t = addHours(start, i * stepH);
            const lon = longitude(b.id, t);
            if (zoneIndex(lon) !== zoneIndex(lonPrev)) {
                const fromSign = zoneIndex(lonPrev);
                const time = bisect(tPrev, t, x => zoneIndex(longitude(b.id, x)) !== fromSign);
                const retro = !b.node && wrap180(lon - lonPrev) < 0; // nodes always move backwards
                events.push({
                    time, kind: 'ingress', body: b.id, sign: zoneName(lon), retro,
                    text: `${b.symbol} ${b.name} ${retro ? 're-enters' : 'enters'} ${zoneSymbol(zoneName(lon))} ${zoneName(lon)}`
                });
            }
            const d = wrap180(lon - lonPrev);
            if (!b.node && b.id !== 'Sun' && b.id !== 'Moon' && dPrev !== null && Math.sign(d) !== Math.sign(dPrev)) {
                const wasRetro = dPrev < 0;
                const time = bisect(addHours(tPrev, -stepH), t, x => (speedOf(b.id, x) < 0) !== wasRetro);
                events.push({
                    time, kind: 'station', body: b.id, retro: !wasRetro,
                    text: `${b.symbol} ${b.name} stations ${wasRetro ? 'direct' : 'retrograde'} at ${fmtPos(longitude(b.id, time))}`
                });
            }
            dPrev = d; tPrev = t; lonPrev = lon;
        }
    }

    const quarterNames = ['New Moon', 'First Quarter', 'Full Moon', 'Last Quarter'];
    const quarterEmoji = ['🌑', '🌓', '🌕', '🌗'];
    let mq = Astronomy.SearchMoonQuarter(start);
    while (mq.time.date < end) {
        const time = mq.time.date;
        events.push({
            time, kind: 'phase', body: 'Moon', phase: mq.quarter,
            text: `${quarterEmoji[mq.quarter]} ${quarterNames[mq.quarter]} at ${fmtPos(longitude('Moon', time))}`
        });
        mq = Astronomy.NextMoonQuarter(mq);
    }

    for (const ecl of nextEclipses(start)) {
        if (ecl.time < end) events.push(ecl);
    }

    events.sort((a, b) => a.time - b.time);
    if (eventCache.size > 50) eventCache.clear();
    eventCache.set(cacheKey, events);
    return events;
}

function nextEclipses(start) {
    const out = [];
    const solar = Astronomy.SearchGlobalSolarEclipse(start);
    const lunar = Astronomy.SearchLunarEclipse(start);
    if (solar) {
        const time = solar.peak.date;
        out.push({ time, kind: 'eclipse', body: 'Sun', text: `🌘 ${cap(solar.kind)} solar eclipse at ${fmtPos(longitude('Sun', time))}` });
    }
    if (lunar) {
        const time = lunar.peak.date;
        out.push({ time, kind: 'eclipse', body: 'Moon', text: `🌕 ${cap(lunar.kind)} lunar eclipse at ${fmtPos(longitude('Moon', time))}` });
    }
    return out.sort((a, b) => a.time - b.time);
}

const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

// ---------------------------------------------------------------------------
// Wheel rendering

const svgLayer = () => document.getElementById('svg-layer');

function svgEl(tag, attrs, parent) {
    const el = document.createElementNS(SVG_NS, tag);
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    if (parent) parent.appendChild(el);
    return el;
}

function attachHover(el, type, key) {
    el.style.pointerEvents = 'auto';
    el.style.cursor = 'pointer';
    el.addEventListener('mouseenter', e => showTooltip(e, type, key));
    el.addEventListener('mousemove', moveTooltip);
    el.addEventListener('mouseleave', hideTooltip);
    el.addEventListener('click', () => openDetail(type, key));
}

function drawStaticWheel() {
    const g = document.getElementById('wheel-static-elements');
    g.innerHTML = '';
    if (isAstro()) drawConstellationRing(g);
    else drawSignRing(g);

    // Degree ticks: every degree, longer at 5° and 10°
    const ticks = svgEl('g', { class: 'layer-fade layer-ticks' }, g);
    for (let d = 0; d < 360; d++) {
        if (d % 30 === 0 && !isAstro()) continue;
        const len = d % 10 === 0 ? 3 : d % 5 === 0 ? 2 : 1;
        const p = polar(R.band, d), q = polar(R.band - len, d);
        svgEl('line', { x1: p.x, y1: p.y, x2: q.x, y2: q.y, stroke: '#475569', 'stroke-width': d % 5 === 0 ? '0.35' : '0.2' }, ticks);
    }

    // House ring hover targets & numerals are drawn per update (they depend on the Ascendant).
}

function bandPath(r0, r1, from, to) {
    const a0 = polar(r1, from), a1 = polar(r1, to), b0 = polar(r0, from), b1 = polar(r0, to);
    return `M${b0.x},${b0.y} L${a0.x},${a0.y} A${r1},${r1} 0 0,0 ${a1.x},${a1.y} L${b1.x},${b1.y} A${r0},${r0} 0 0,1 ${b0.x},${b0.y}Z`;
}

// Unequal constellation segments; names shrink to fit narrow ones like Scorpius.
function drawConstellationRing(g) {
    for (const c of CONSTELLATIONS) {
        const sign = LORE.constellations[c.name]?.sign;
        const color = sign ? ELEMENT_COLORS[LORE.zodiac[sign].element] : '#94a3b8';
        const band = svgEl('path', { d: bandPath(R.band, R.outer, c.start, c.start + c.width), fill: color, 'fill-opacity': '0.05' }, g);
        attachHover(band, 'constellation', c.name);

        const p = polar(R.outer, c.start), q = polar(R.aspect, c.start);
        svgEl('line', { x1: q.x, y1: q.y, x2: p.x, y2: p.y, stroke: '#334155', 'stroke-width': '0.5' }, g);

        const mid = c.start + c.width / 2;
        const n = polar(R.zodiacName, mid);
        const label = c.name.toUpperCase();
        const nameSize = Math.min(4, c.width * DEG * R.zodiacName * 1.15 / label.length);
        const name = svgEl('text', {
            x: n.x, y: n.y, fill: '#64748b', 'font-size': nameSize.toFixed(2), 'font-weight': '600', 'letter-spacing': (nameSize / 8).toFixed(2),
            'text-anchor': 'middle', 'dominant-baseline': 'middle',
            transform: `rotate(${tangentRotation(mid)}, ${n.x}, ${n.y})`, class: 'layer-fade layer-zodiac-names'
        }, g);
        name.textContent = label;
        attachHover(name, 'constellation', c.name);

        const z = polar(R.zodiacSymbol, mid);
        const sym = svgEl('text', {
            x: z.x, y: z.y, fill: color, 'fill-opacity': '0.8',
            'font-size': Math.min(7.5, c.width * DEG * R.zodiacSymbol * 0.55).toFixed(2), 'text-anchor': 'middle', 'dominant-baseline': 'central',
            class: 'layer-fade layer-zodiac zodiac-glyph'
        }, g);
        sym.textContent = c.symbol;
        attachHover(sym, 'constellation', c.name);
    }
}

function drawSignRing(g) {
    // Element-coloured band behind each sign
    for (let i = 0; i < 12; i++) {
        const sign = LORE.zodiac[ZODIAC[i]];
        const path = svgEl('path', {
            d: bandPath(R.band, R.outer, i * 30, i * 30 + 30),
            fill: ELEMENT_COLORS[sign.element], 'fill-opacity': '0.05'
        }, g);
        attachHover(path, 'zodiac', ZODIAC[i]);
    }

    for (let i = 0; i < 12; i++) {
        const angleDeg = i * 30;
        const p = polar(R.outer, angleDeg), q = polar(R.aspect, angleDeg);
        svgEl('line', { x1: q.x, y1: q.y, x2: p.x, y2: p.y, stroke: '#334155', 'stroke-width': '0.5' }, g);

        const mid = angleDeg + 15;
        const n = polar(R.zodiacName, mid);
        const rot = tangentRotation(mid);
        const name = svgEl('text', {
            x: n.x, y: n.y, fill: '#64748b', 'font-size': '4', 'font-weight': '600', 'letter-spacing': '0.5',
            'text-anchor': 'middle', 'dominant-baseline': 'middle',
            transform: `rotate(${rot}, ${n.x}, ${n.y})`, class: 'layer-fade layer-zodiac-names'
        }, g);
        name.textContent = ZODIAC[i].toUpperCase();
        attachHover(name, 'zodiac', ZODIAC[i]);

        const z = polar(R.zodiacSymbol, mid);
        const sym = svgEl('text', {
            x: z.x, y: z.y, fill: ELEMENT_COLORS[LORE.zodiac[ZODIAC[i]].element], 'fill-opacity': '0.8',
            'font-size': '7.5', 'text-anchor': 'middle', 'dominant-baseline': 'central',
            class: 'layer-fade layer-zodiac zodiac-glyph'
        }, g);
        sym.textContent = LORE.zodiac[ZODIAC[i]].symbol;
        attachHover(sym, 'zodiac', ZODIAC[i]);
    }

}

function updateHouses(angles) {
    const g = document.getElementById('houses-group');
    g.innerHTML = '';
    if (isAstro()) return;
    for (let i = 0; i < 12; i++) {
        const house = angles ? ((i - signIndex(angles.asc) + 12) % 12) + 1 : i + 1;
        const p = polar(R.houseLabel, i * 30 + 15);
        const t = svgEl('text', {
            x: p.x, y: p.y, fill: angles ? '#94a3b8' : '#475569', 'font-size': '3.6', 'font-weight': '600',
            'text-anchor': 'middle', 'dominant-baseline': 'central', class: 'house-label'
        }, g);
        t.textContent = ROMAN[house - 1];
        attachHover(t, 'houses', String(house));
    }
}

function updateStars(date) {
    const g = document.getElementById('stars-group');
    g.innerHTML = '';
    for (const [name, star] of Object.entries(LORE.stars)) {
        const lon = starLongitude(star, date);
        const dot = polar(R.starDot, lon);
        const c = svgEl('circle', { cx: dot.x, cy: dot.y, r: '1.3', fill: star.color }, g);
        attachHover(c, 'stars', name);
        const lp = polar(R.starLabel, lon);
        const rot = tangentRotation(lon);
        const t = svgEl('text', {
            x: lp.x, y: lp.y, fill: star.color, 'fill-opacity': '0.85', 'font-size': '2.8',
            'text-anchor': 'middle', 'dominant-baseline': 'middle', transform: `rotate(${rot}, ${lp.x}, ${lp.y})`
        }, g);
        t.textContent = name;
        attachHover(t, 'stars', name);
    }
}

function starLongitude(star, date) {
    const years = (date.getTime() - Date.UTC(2000, 0, 1, 12)) / (365.25 * DAY_MS);
    return toMode(norm360(star.lon2000 + years * 0.0139694), date);
}

function updateAngles(angles) {
    const g = document.getElementById('angles-group');
    g.innerHTML = '';
    if (!angles) return;
    const axes = [
        { lon: angles.asc, a: 'ASC', b: 'DSC', color: '#f59e0b', key: 'Ascendant (ASC)' },
        { lon: angles.mc, a: 'MC', b: 'IC', color: '#22d3ee', key: 'Midheaven (MC)' }
    ];
    for (const ax of axes) {
        const p = polar(R.outer, ax.lon), q = polar(R.outer, ax.lon + 180);
        svgEl('line', { x1: p.x, y1: p.y, x2: q.x, y2: q.y, stroke: ax.color, 'stroke-width': '0.6', 'stroke-dasharray': '3,2', 'stroke-opacity': '0.7' }, g);
        for (const [lon, label] of [[ax.lon, ax.a], [ax.lon + 180, ax.b]]) {
            const lp = polar(R.angleLabel - 3, lon);
            const t = svgEl('text', {
                x: lp.x, y: lp.y, fill: ax.color, 'font-size': '4.2', 'font-weight': '700',
                'text-anchor': 'middle', 'dominant-baseline': 'central'
            }, g);
            t.textContent = label;
            attachHover(t, 'glossary', ax.key);
        }
    }
}

function updateAspectLines(aspects, pos) {
    const g = document.getElementById('aspects-group');
    g.innerHTML = '';
    for (const asp of aspects) {
        if (asp.type === 'conjunction') continue;
        const p = polar(R.aspect, pos[asp.a].lon), q = polar(R.aspect, pos[asp.b].lon);
        const strength = 1 - asp.orb / (LORE.aspects[asp.type].orb + 2);
        const line = svgEl('line', {
            x1: p.x, y1: p.y, x2: q.x, y2: q.y, stroke: ASPECT_COLORS[asp.type],
            'stroke-width': (0.25 + strength * 0.6).toFixed(2), 'stroke-opacity': (0.35 + strength * 0.55).toFixed(2),
            'stroke-dasharray': asp.type === 'quincunx' ? '1,1' : ''
        }, g);
        line.addEventListener('click', () => openDetail('aspectPair', `${asp.a}|${asp.b}|${asp.type}`));
    }
}

function updateDrishtiLines(drishti, pos) {
    const g = document.getElementById('aspects-group');
    g.innerHTML = '';
    const drawn = new Set();
    for (const d of drishti) {
        const pair = [d.caster, d.receiver].sort().join('|');
        if (d.mutual && drawn.has(pair)) continue;
        drawn.add(pair);
        const p = polar(R.aspect, pos[d.caster].lon), q = polar(R.aspect, pos[d.receiver].lon);
        const line = svgEl('line', {
            x1: p.x, y1: p.y, x2: q.x, y2: q.y,
            stroke: d.mutual ? '#e2e8f0' : BODY[d.caster].color,
            'stroke-width': d.special ? '0.7' : '0.5', 'stroke-opacity': '0.75',
            'stroke-dasharray': d.mutual ? '' : '1.5,0.8'
        }, g);
        line.addEventListener('click', () => openDetail('drishti', `${d.caster}|${d.receiver}`));
    }
}

function updatePlanetTicks(pos) {
    const g = document.getElementById('planet-ticks');
    g.innerHTML = '';
    for (const b of bodies) {
        const lon = pos[b.id].lon;
        const p = polar(R.band, lon), q = polar(R.band - 4, lon);
        svgEl('line', {
            x1: p.x, y1: p.y, x2: q.x, y2: q.y, stroke: b.color, 'stroke-width': '0.8',
            class: b.node ? 'layer-fade layer-nodes' : ''
        }, g);
        const r = polar(R.aspect, lon);
        if (!b.node) svgEl('circle', { cx: r.x, cy: r.y, r: '0.9', fill: b.color }, g);
    }
}

function createPlanetElements() {
    const layer = document.getElementById('planets-layer');
    layer.innerHTML = '';
    bodies.forEach(body => {
        const el = document.createElement('div');
        el.className = 'planet' + (body.node ? ' layer-fade layer-nodes' : '');
        el.id = `planet-${body.id}`;
        el.style.color = body.color;
        el.style.textShadow = `0 0 10px ${body.glow}`;
        el.innerHTML = `${body.symbol}<span class="planet-label"><span class="planet-name"></span><span class="retro-mark"></span></span>`;
        el.addEventListener('mouseenter', e => showTooltip(e, 'planets', body.id));
        el.addEventListener('mousemove', moveTooltip);
        el.addEventListener('mouseleave', hideTooltip);
        el.addEventListener('click', () => openDetail('planets', body.id));
        layer.appendChild(el);
    });
    new ResizeObserver(sizePlanets).observe(document.getElementById('wheel'));
}

// Glyph sizes are tuned for a ~700px wheel; scale them with the actual wheel size (and gently with zoom).
function sizePlanets() {
    const scale = Math.max(0.55, Math.min(1.1, document.getElementById('wheel').clientWidth / 700)) * view.zoom ** 0.25;
    for (const body of bodies) {
        const el = document.getElementById(`planet-${body.id}`);
        const size = body.size * scale;
        el.style.fontSize = `${size}px`;
        el.style.width = el.style.height = `${size}px`;
        el.style.marginTop = el.style.marginLeft = `-${size / 2}px`;
        el.querySelector('.planet-label').style.fontSize = `${Math.max(7, 9 * scale)}px`;
    }
}

function updatePlanets(pos) {
    placePlanets(pos);
    for (const b of bodies) {
        const el = document.getElementById(`planet-${b.id}`);
        el.querySelector('.planet-name').textContent = b.name;
        el.querySelector('.retro-mark').textContent = pos[b.id].retro && !b.node ? ' ℞' : '';
        el.classList.toggle('is-retro', pos[b.id].retro && !b.node);
    }
}

// Planets are HTML elements over the SVG, so they are placed in the same (zoomed) view window.
function placePlanets(pos) {
    const half = VIEW_HALF / view.zoom, pct = 100 / (2 * half);
    for (const b of bodies) {
        const el = document.getElementById(`planet-${b.id}`);
        const p = polar(b.radius, pos[b.id].lon);
        el.style.left = `calc(50% + ${(p.x - view.cx) * pct}%)`;
        el.style.top = `calc(50% + ${(p.y - view.cy) * pct}%)`;
    }
}

// ---------------------------------------------------------------------------
// Zoom & pan: the SVG viewBox shrinks around a centre point; strokes and text grow
// slower than the zoom so the zoomed-in wheel stays crisp instead of chunky.

const ZOOM_MIN = 1, ZOOM_MAX = 8;

function clampView() {
    view.zoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, view.zoom));
    const lim = VIEW_HALF - VIEW_HALF / view.zoom;
    view.cx = Math.max(-lim, Math.min(lim, view.cx));
    view.cy = Math.max(-lim, Math.min(lim, view.cy));
}

function applyView() {
    clampView();
    const half = VIEW_HALF / view.zoom;
    document.getElementById('svg-layer').setAttribute('viewBox', `${view.cx - half} ${view.cy - half} ${2 * half} ${2 * half}`);
    const zoomed = view.zoom > 1.001;
    const wheel = document.getElementById('wheel');
    wheel.classList.toggle('zoomed', zoomed);
    if (!zoomed) wheel.classList.remove('panning');
    document.getElementById('zoom-level').textContent = `${view.zoom.toFixed(1)}×`;
    const follow = document.getElementById('zoom-follow');
    follow.classList.toggle('hidden', !view.follow);
    if (view.follow) follow.textContent = `following ${BODY[view.follow].name}`;
    if (current.pos) placePlanets(current.pos);
    sizePlanets();
    scaleSvgDetail();
}

function scaleSvgDetail() {
    const strokeK = view.zoom ** -0.7, fontK = view.zoom ** -0.55;
    document.getElementById('svg-layer').querySelectorAll('[stroke-width], [font-size]').forEach(el => {
        for (const [attr, key, k] of [['stroke-width', 'sw', strokeK], ['font-size', 'fs', fontK]]) {
            if (!el.hasAttribute(attr)) continue;
            if (el.dataset[key] === undefined) el.dataset[key] = el.getAttribute(attr);
            el.setAttribute(attr, (parseFloat(el.dataset[key]) * k).toFixed(3));
        }
    });
}

// Wheel-relative fraction (0..1) of a client point -> SVG coordinates in the current view.
function clientToWorld(clientX, clientY) {
    const rect = document.getElementById('wheel').getBoundingClientRect();
    const half = VIEW_HALF / view.zoom;
    return {
        fx: (clientX - rect.left) / rect.width, fy: (clientY - rect.top) / rect.height,
        x: view.cx - half + (clientX - rect.left) / rect.width * 2 * half,
        y: view.cy - half + (clientY - rect.top) / rect.height * 2 * half
    };
}

// Zoom by a factor while keeping the given client point (default: centre) fixed on screen.
function zoomBy(factor, clientX, clientY) {
    const target = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, view.zoom * factor));
    if (clientX === undefined || view.follow) {
        view.zoom = target;
    } else {
        const w = clientToWorld(clientX, clientY);
        view.zoom = target;
        const half = VIEW_HALF / view.zoom;
        view.cx = w.x - (w.fx * 2 - 1) * half;
        view.cy = w.y - (w.fy * 2 - 1) * half;
    }
    if (view.zoom <= ZOOM_MIN) resetView();
    else applyView();
}

function resetView() {
    Object.assign(view, { zoom: 1, cx: 0, cy: 0, follow: null });
    applyView();
}

// Zoom onto a body and keep it centred while time moves.
function focusBody(id) {
    const p = polar(BODY[id].radius, current.pos[id].lon);
    Object.assign(view, { zoom: Math.max(view.zoom, 3.5), cx: p.x, cy: p.y, follow: id });
    applyView();
}

function followView() {
    if (!view.follow) return;
    const p = polar(BODY[view.follow].radius, current.pos[view.follow].lon);
    view.cx = p.x; view.cy = p.y;
    applyView();
}

function bindZoom() {
    const wheel = document.getElementById('wheel');
    wheel.addEventListener('wheel', e => {
        e.preventDefault();
        zoomBy(Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0015)), e.clientX, e.clientY);
    }, { passive: false });
    wheel.addEventListener('dblclick', e => { e.preventDefault(); zoomBy(2, e.clientX, e.clientY); });

    // Pointer handling: one pointer pans (after a small threshold, so clicks still work), two pointers pinch.
    const pointers = new Map();
    let drag = null, pinch = null, suppressClick = false;
    const pinchState = () => {
        const [a, b] = [...pointers.values()];
        return { dist: Math.hypot(a.x - b.x, a.y - b.y), mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2 };
    };
    wheel.addEventListener('pointerdown', e => {
        pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (pointers.size === 2) { pinch = pinchState(); drag = null; }
        else if (pointers.size === 1) { drag = { x: e.clientX, y: e.clientY, moved: false }; suppressClick = false; }
    });
    wheel.addEventListener('pointermove', e => {
        if (!pointers.has(e.pointerId)) return;
        pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (pinch && pointers.size === 2) {
            const now = pinchState();
            zoomBy(now.dist / pinch.dist, now.mx, now.my);
            pinch = now;
            suppressClick = true;
            return;
        }
        if (!drag || view.zoom <= 1.001) return;
        const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
        if (!drag.moved && Math.hypot(dx, dy) < 4) return;
        if (!drag.moved) {
            drag.moved = true;
            wheel.setPointerCapture(e.pointerId);
            wheel.classList.add('panning');
            hideTooltip();
        }
        const scale = 2 * VIEW_HALF / view.zoom / wheel.clientWidth;
        view.cx -= dx * scale; view.cy -= dy * scale;
        view.follow = null;
        drag.x = e.clientX; drag.y = e.clientY;
        applyView();
    });
    const end = e => {
        pointers.delete(e.pointerId);
        if (pointers.size < 2) pinch = null;
        if (drag?.moved) suppressClick = true;
        if (pointers.size === 0) { drag = null; wheel.classList.remove('panning'); }
    };
    wheel.addEventListener('pointerup', end);
    wheel.addEventListener('pointercancel', end);
    // A drag or pinch ends with a click on whatever is underneath; swallow it.
    wheel.addEventListener('click', e => {
        if (suppressClick) { e.stopPropagation(); e.preventDefault(); suppressClick = false; }
    }, true);

    document.getElementById('zoom-controls').addEventListener('click', e => {
        const btn = e.target.closest('[data-zoom]');
        if (!btn) return;
        if (btn.dataset.zoom === 'in') zoomBy(1.6);
        else if (btn.dataset.zoom === 'out') zoomBy(1 / 1.6);
        else resetView();
    });
}

// ---------------------------------------------------------------------------
// Tooltip

function tooltipContent(type, key) {
    const pos = current.pos;
    if (type === 'planets') {
        const p = pos[key], b = BODY[key];
        const house = houseOf(p.lon, current.angles);
        const dig = dignitiesOf(key, p.sign);
        return `<div class="font-semibold" style="color:${b.color}">${b.symbol} ${b.name}${p.retro && !b.node ? ' ℞' : ''}</div>
            <div>${fmtPos(p.lon)}${house ? ` · ${ordinal(house)} house` : ''}</div>
            ${dig.length ? `<div class="text-xs text-amber-300">${dig.join(', ')}</div>` : ''}
            <div class="text-xs text-slate-400">${LORE.planets[key].keywords.slice(0, 3).join(' · ')}</div>`;
    }
    if (type === 'zodiac') {
        const z = LORE.zodiac[key];
        const here = bodies.filter(b => pos[b.id].sign === key).map(b => b.symbol).join(' ');
        return `<div class="font-semibold">${z.symbol} ${key} <span class="text-slate-400 font-normal">${z.sanskrit}</span></div>
            <div class="text-xs">${z.modality} ${z.element} · ruled by ${z.ruler}${z.modernRuler ? ' / ' + z.modernRuler : ''}</div>
            ${here ? `<div class="text-xs text-slate-300">Now: ${here}</div>` : ''}`;
    }
    if (type === 'constellation') {
        const c = CONSTELLATIONS.find(x => x.name === key), C = LORE.constellations[key];
        const here = bodies.filter(b => constellationOf(pos[b.id].sid).name === key).map(b => b.symbol).join(' ');
        return `<div class="font-semibold">${c.symbol} ${key} <span class="text-slate-400 font-normal">constellation</span></div>
            <div class="text-xs">${c.width.toFixed(1)}° of the ecliptic${C?.sign ? '' : ' · not an astrological sign'}</div>
            ${C ? `<div class="text-xs text-slate-400">${C.stars}</div>` : ''}
            ${here ? `<div class="text-xs text-slate-300">Now: ${here}</div>` : ''}`;
    }
    if (type === 'houses') {
        const h = LORE.houses[key];
        const sign = current.angles ? ZODIAC[(signIndex(current.angles.asc) + Number(key) - 1) % 12] : null;
        return `<div class="font-semibold">${ordinal(Number(key))} House: ${h.name}</div>
            <div class="text-xs">${h.keywords.join(' · ')}</div>
            <div class="text-xs text-slate-400">${sign ? `${signSymbol(sign)} ${sign} (whole sign)` : 'Natural house (set a location for real houses)'}</div>`;
    }
    if (type === 'stars') {
        const s = LORE.stars[key];
        return `<div class="font-semibold" style="color:${s.color}">✦ ${key}</div>
            <div class="text-xs">${s.constellation}</div>
            <div class="text-xs text-slate-400">${fmtPos(starLongitude(s, state.date))}</div>`;
    }
    if (type === 'glossary') return `<div class="font-semibold">${esc(key)}</div><div class="text-xs text-slate-300">${current.angles ? fmtPos(key.startsWith('Asc') ? current.angles.asc : current.angles.mc) : ''}</div>`;
    return '';
}

function showTooltip(e, type, key) {
    const tip = document.getElementById('tooltip');
    tip.innerHTML = tooltipContent(type, key);
    tip.classList.remove('hidden');
    moveTooltip(e);
}

function moveTooltip(e) {
    const tip = document.getElementById('tooltip');
    const pad = 14;
    let x = e.clientX + pad, y = e.clientY + pad;
    const w = tip.offsetWidth, h = tip.offsetHeight;
    if (x + w > window.innerWidth - 8) x = e.clientX - w - pad;
    if (y + h > window.innerHeight - 8) y = e.clientY - h - pad;
    tip.style.left = `${x}px`;
    tip.style.top = `${y}px`;
}

function hideTooltip() {
    document.getElementById('tooltip').classList.add('hidden');
}

// ---------------------------------------------------------------------------
// Side panel: tabs & detail views

let current = { pos: null, angles: null, aspects: [] };

function chip(text, cls = 'bg-slate-700/60 text-slate-300') {
    return `<span class="inline-block px-2 py-0.5 rounded-full text-xs ${cls}">${text}</span>`;
}

function card(title, body, accent = 'text-slate-400') {
    return `<section class="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
        ${title ? `<h4 class="text-xs font-semibold ${accent} uppercase tracking-wider mb-3">${title}</h4>` : ''}
        ${body}
    </section>`;
}

function link(type, key, label, extra = '') {
    return `<button class="link-btn ${extra}" data-type="${type}" data-key="${esc(key)}">${label}</button>`;
}

// The other name of a body: Sanskrit for planets, Western/Vedic counterpart for the nodes.
function altName(id) {
    const b = BODY[id];
    if (b.node) return NODE_NAMES[id][state.mode === 'sidereal' ? 0 : 1];
    return LORE.planets[id].sanskrit;
}

function planetLink(id) {
    const b = BODY[id];
    return link('planets', id, `<span style="color:${b.color}">${b.symbol}</span> ${b.name}`);
}

function signLink(name) {
    return link('zodiac', name, `${signSymbol(name)} ${name}`);
}

function zoneLink(name) {
    return isAstro() ? link('constellation', name, `${zoneSymbol(name)} ${name}`) : signLink(name);
}

// A formatted position that opens its sign (or constellation, in astronomical mode).
function posLink(lon) {
    return isAstro() ? link('constellation', constellationOf(lon).name, fmtPos(lon)) : link('zodiac', signName(lon), fmtPos(lon));
}

function dignityChips(id, sign) {
    const colors = {
        Domicile: 'bg-emerald-900/60 text-emerald-300', Exalted: 'bg-emerald-900/60 text-emerald-300',
        Detriment: 'bg-rose-900/60 text-rose-300', Fall: 'bg-rose-900/60 text-rose-300'
    };
    return dignitiesOf(id, sign).map(d => chip(d, colors[d])).join(' ');
}

function renderPanel() {
    document.querySelectorAll('[data-tab]').forEach(btn => {
        const active = !state.detail && btn.dataset.tab === state.tab;
        btn.classList.toggle('tab-active', active);
    });
    const panel = document.getElementById('panel');
    const scroll = panel.scrollTop;
    let html;
    if (state.detail) html = renderDetail(state.detail.type, state.detail.key);
    else if (state.tab === 'sky') html = renderSky();
    else if (state.tab === 'positions') html = renderPositions();
    else if (state.tab === 'events') html = renderEvents();
    else html = renderLibrary();
    panel.innerHTML = html;
    panel.scrollTop = scroll;
}

let panelTimer = null;
function schedulePanelRender() {
    clearTimeout(panelTimer);
    panelTimer = setTimeout(renderPanel, state.playTimer ? 0 : 30);
}

function renderSky() {
    const { pos, angles, aspects } = current;
    const date = state.date;
    const phase = moonPhaseInfo(date);
    const nak = nakshatraOf(pos.Moon.sid);
    const tithi = tithiOf(pos);
    const voc = voidOfCourse(date);
    const hour = planetaryHour(date, state.location);
    const dayRuler = hour ? hour.dayRuler : DAY_RULERS[date.getDay()];
    const moonSign = LORE.zodiac[pos.Moon.sign];
    const parts = [];

    // Day header
    parts.push(card('', `
        <div class="flex items-center justify-between gap-3">
            <div>
                <div class="text-xs text-slate-400 uppercase tracking-wider">Day ruler</div>
                <div class="text-lg font-semibold">${planetLink(dayRuler)}</div>
            </div>
            ${hour ? `<div class="text-right">
                <div class="text-xs text-slate-400 uppercase tracking-wider">${hour.isDay ? 'Day' : 'Night'} hour ${hour.hourNumber}</div>
                <div class="text-lg font-semibold">${planetLink(hour.ruler)}</div>
                <div class="text-xs text-slate-500">until ${fmtTime(hour.end)}</div>
            </div>` : `<div class="text-xs text-slate-500 text-right max-w-[10rem]">Set a location for planetary hours, houses &amp; Ascendant</div>`}
        </div>
        ${hour ? `<div class="mt-3 text-xs text-slate-400 flex gap-4">
            <span>☀︎↑ ${fmtTime(hour.sunrise)}</span><span>☀︎↓ ${fmtTime(hour.sunset)}</span>
            ${link('glossary', 'Planetary Day & Hour', 'What are planetary hours?', 'text-slate-500 underline')}
        </div>` : ''}
    `));

    // Sun & Moon
    parts.push(card('Luminaries', `
        <div class="grid grid-cols-2 gap-3 mb-3">
            <div>
                <div class="text-sm">${planetLink('Sun')}</div>
                <div class="font-mono text-amber-200">${posLink(pos.Sun.lon)}</div>
                ${angles ? `<div class="text-xs text-slate-500">${ordinal(houseOf(pos.Sun.lon, angles))} house</div>` : ''}
            </div>
            <div>
                <div class="text-sm">${planetLink('Moon')}</div>
                <div class="font-mono text-slate-100">${posLink(pos.Moon.lon)}</div>
                ${angles ? `<div class="text-xs text-slate-500">${ordinal(houseOf(pos.Moon.lon, angles))} house</div>` : ''}
            </div>
        </div>
        <button class="w-full text-left flex items-center gap-3 bg-slate-900/50 rounded-lg p-3 hover:bg-slate-900 transition" data-type="phase" data-key="${phase.index}">
            <span class="text-3xl">${phase.emoji}</span>
            <span>
                <span class="block font-semibold">${phase.name}</span>
                <span class="block text-xs text-slate-400">${Math.round(phase.illum * 100)}% illuminated · Sun–Moon ${Math.round(phase.angle)}°</span>
            </span>
        </button>
        <p class="text-sm text-slate-300 leading-relaxed mt-3">${isAstro() ? `<span class="text-slate-500">Sidereal ${pos.Moon.sign} Moon:</span> ` : ''}${moonSign.moonDay}</p>
        <p class="text-xs text-slate-500 mt-2"><span class="text-slate-400">Good for:</span> ${moonSign.goodFor}</p>
        ${voc ? `<div class="mt-3 text-xs rounded-lg p-2 ${voc.active ? 'bg-amber-900/30 text-amber-200 border border-amber-800/50' : 'bg-slate-900/50 text-slate-400'}">
            ${voc.active
                ? `<b>Moon void of course</b> until ${fmtDate(voc.end)} (enters ${signSymbol(voc.nextSign)} ${voc.nextSign})`
                : `Moon goes void of course ${fmtDate(voc.start)} → ${fmtDate(voc.end)}`}
            ${voc.lastAspect ? `<br>Last aspect: ☽ ${LORE.aspects[voc.lastAspect.type].symbol} ${BODY[voc.lastAspect.planet].symbol} ${BODY[voc.lastAspect.planet].name}` : ''}
            ${link('glossary', 'Void of Course Moon', ' ⓘ', 'text-slate-500')}
        </div>` : ''}
    `, 'text-amber-400'));

    // Vedic day
    parts.push(card('Vedic Panchanga (partial)', `
        <div class="grid grid-cols-2 gap-3 text-sm">
            <div>
                <div class="text-xs text-slate-500">Moon nakshatra</div>
                ${link('nakshatra', String(nak.index), `<b>${nak.name}</b> pada ${nak.pada}`)}
                <div class="text-xs text-slate-500">ruled by ${planetLink(nak.ruler)}</div>
            </div>
            <div>
                <div class="text-xs text-slate-500">Tithi ${tithi.n}/30</div>
                ${link('glossary', 'Tithi', `<b>${tithi.name}</b>`)}
                <div class="text-xs text-slate-500">${tithi.paksha}</div>
            </div>
        </div>
        <div class="text-xs text-slate-400 mt-3">Sidereal Moon: ${fmtSign(pos.Moon.sid)} · Sun: ${fmtSign(pos.Sun.sid)}</div>
        ${tithi.note ? `<p class="text-xs text-slate-400 mt-2 italic">${tithi.note}</p>` : ''}
    `, 'text-orange-400'));

    // Angles
    if (angles) {
        parts.push(card('Angles (whole sign houses)', `
            <div class="grid grid-cols-2 gap-3 text-sm">
                <div><div class="text-xs text-amber-400">Ascendant</div>${posLink(angles.asc)}</div>
                <div><div class="text-xs text-cyan-400">Midheaven</div>${posLink(angles.mc)}</div>
            </div>
            <p class="text-xs text-slate-500 mt-2">The Ascendant changes sign roughly every 2 hours. Use the ±1h buttons to watch the houses turn.</p>
        `));
    }

    // Retrogrades
    const retros = PLANET_IDS.filter(id => pos[id].retro);
    const stations = PLANET_IDS.map(id => nextStation(id, date, 400)).map((s, i) => s && { ...s, id: PLANET_IDS[i] }).filter(Boolean).sort((a, b) => a.time - b.time);
    const nextSt = stations[0];
    parts.push(card('Retrogrades', `
        ${retros.length
            ? `<div class="flex flex-wrap gap-2">${retros.map(id => `<span class="bg-rose-950/50 border border-rose-900/50 rounded-full px-2 py-0.5 text-sm">${planetLink(id)} ℞</span>`).join('')}</div>`
            : `<div class="text-sm text-emerald-300">All planets direct ✓</div>`}
        ${nextSt ? `<p class="text-xs text-slate-400 mt-3">Next station: ${BODY[nextSt.id].symbol} ${BODY[nextSt.id].name} turns <b>${nextSt.kind}</b> ${link('jump', nextSt.time.toISOString(), fmtDate(nextSt.time, { year: 'numeric' }), 'underline')} at ${fmtPos(longitude(nextSt.id, nextSt.time))}</p>` : ''}
    `, 'text-rose-400'));

    // Aspects
    const shown = aspects.slice(0, 10);
    parts.push(card('Active aspects', shown.length ? `
        <ul class="flex flex-col gap-1">${shown.map(aspectRow).join('')}</ul>
        ${aspects.length > shown.length ? `<p class="text-xs text-slate-500 mt-2">+${aspects.length - shown.length} more in the Positions tab</p>` : ''}
    ` : '<p class="text-sm text-slate-500">No major aspects within orb.</p>', 'text-sky-400'));

    if (state.mode === 'sidereal') parts.push(drishtiCard(current.drishti));

    // Coming up
    const upcoming = findEvents(date, 7, true);
    parts.push(card('Next 7 days', eventList(upcoming) + `<button class="mt-3 text-xs text-blue-400 hover:text-blue-300" data-goto-tab="events">All upcoming events →</button>`, 'text-violet-400'));

    // Eclipses
    const ecl = nextEclipses(date);
    parts.push(card('Next eclipses', `<ul class="flex flex-col gap-1 text-sm">${ecl.map(e =>
        `<li>${link('jump', e.time.toISOString(), `<span class="text-slate-500 text-xs font-mono mr-2">${e.time.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>${e.text}`)}</li>`).join('')}</ul>`));

    return parts.join('');
}

function aspectRow(a) {
    const asp = LORE.aspects[a.type];
    return `<li><button class="w-full flex items-center justify-between gap-2 text-sm hover:bg-slate-900/60 rounded px-2 py-1 transition" data-type="aspectPair" data-key="${a.a}|${a.b}|${a.type}">
        <span><span style="color:${BODY[a.a].color}">${BODY[a.a].symbol}</span> <span style="color:${ASPECT_COLORS[a.type]}">${asp.symbol}</span> <span style="color:${BODY[a.b].color}">${BODY[a.b].symbol}</span>
        <span class="text-slate-400 ml-1">${BODY[a.a].name} ${asp.name.toLowerCase()} ${BODY[a.b].name}</span></span>
        <span class="text-xs font-mono ${a.applying ? 'text-amber-300' : 'text-slate-500'}" title="${a.applying ? 'applying' : 'separating'}">${fmtOrb(a.orb)} ${a.applying ? 'a' : 's'}</span>
    </button></li>`;
}

function drishtiRow(d) {
    const c = BODY[d.caster], r = BODY[d.receiver];
    return `<li><button class="w-full flex items-center justify-between gap-2 text-sm hover:bg-slate-900/60 rounded px-2 py-1 transition" data-type="drishti" data-key="${d.caster}|${d.receiver}">
        <span><span style="color:${c.color}">${c.symbol}</span> → <span style="color:${r.color}">${r.symbol}</span>
        <span class="text-slate-400 ml-1">${c.name} aspects ${r.name}</span></span>
        <span class="text-xs ${d.special ? 'text-orange-300' : 'text-slate-500'}">${ordinal(d.house)}${d.mutual ? ' · mutual' : ''}</span>
    </button></li>`;
}

function drishtiCard(drishti) {
    return card('Graha drishti (Vedic aspects)', drishti.length
        ? `<ul class="flex flex-col gap-1">${drishti.map(drishtiRow).join('')}</ul>
           <p class="text-xs text-slate-500 mt-2">Sign-based: each graha aspects whole signs counted from its own. Orange = special aspect (Mars, Jupiter, Saturn, Rahu/Ketu). ${link('glossary', 'Graha Drishti', 'ⓘ')}</p>`
        : '<p class="text-sm text-slate-500">No graha aspects another graha right now.</p>', 'text-orange-400');
}

function eventList(events) {
    if (!events.length) return '<p class="text-sm text-slate-500">Nothing notable in this window.</p>';
    let lastDay = '';
    const rows = [];
    for (const e of events) {
        const day = e.time.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
        if (day !== lastDay) {
            rows.push(`<li class="text-xs text-slate-500 uppercase tracking-wider mt-2 first:mt-0">${day}</li>`);
            lastDay = day;
        }
        const color = { ingress: 'text-slate-200', station: 'text-rose-300', phase: 'text-amber-200', eclipse: 'text-fuchsia-300' }[e.kind];
        rows.push(`<li><button class="w-full text-left flex gap-2 text-sm hover:bg-slate-900/60 rounded px-2 py-0.5 transition" data-type="jump" data-key="${e.time.toISOString()}" title="Jump to this moment">
            <span class="font-mono text-xs text-slate-500 pt-0.5 w-12 shrink-0">${fmtTime(e.time)}</span><span class="${color}">${e.text}</span>
        </button></li>`);
    }
    return `<ul class="flex flex-col">${rows.join('')}</ul>`;
}

function renderPositions() {
    const { pos, angles, aspects } = current;
    const ayan = ayanamsa(state.date);
    const rows = bodies.map(b => {
        const p = pos[b.id];
        const other = state.mode === 'tropical' ? p.sid : state.mode === 'sidereal' ? p.trop : p.sid;
        const house = houseOf(p.lon, angles);
        const nak = nakshatraOf(p.sid);
        return `<tr class="border-t border-slate-800 hover:bg-slate-800/60 cursor-pointer" data-type="planets" data-key="${b.id}">
            <td class="py-1.5 pr-2"><span style="color:${b.color}" class="text-lg">${b.symbol}</span></td>
            <td class="py-1.5 pr-2">
                <div class="font-mono">${fmtPos(p.lon)}${p.retro && !b.node ? ' <span class="text-rose-400">℞</span>' : ''}</div>
                <div class="text-[11px] text-slate-500">${state.mode === 'sidereal' ? 'Trop' : 'Sid'} ${fmtSign(other, false)} · ${nak.name} ${nak.pada}</div>
            </td>
            <td class="py-1.5 pr-2 text-right font-mono text-xs ${p.retro ? 'text-rose-300' : 'text-slate-400'}">${p.speed >= 0 ? '+' : ''}${p.speed.toFixed(p.id === 'Moon' ? 1 : 2)}°</td>
            <td class="py-1.5 text-right text-xs text-slate-400">${house ? ROMAN[house - 1] : '–'}</td>
        </tr>`;
    }).join('');

    // Element & modality balance (Sun–Pluto only)
    const count = (key) => {
        const c = {};
        for (const id of PLANET_IDS) {
            const v = LORE.zodiac[pos[id].sign][key];
            c[v] = (c[v] || 0) + 1;
        }
        return c;
    };
    const bars = (counts, keys, colors) => keys.map(k => `
        <div class="flex items-center gap-2 text-xs">
            <span class="w-16 text-slate-400">${k}</span>
            <span class="flex-1 h-2 bg-slate-900 rounded"><span class="block h-2 rounded" style="width:${(counts[k] || 0) * 10}%;background:${colors[k] || '#64748b'}"></span></span>
            <span class="w-4 text-right text-slate-400">${counts[k] || 0}</span>
        </div>`).join('');

    const dignified = PLANET_IDS.map(id => ({ id, d: dignitiesOf(id, pos[id].sign) })).filter(x => x.d.length);

    return [
        card(`${{ tropical: 'Tropical', sidereal: 'Sidereal (Lahiri)', astronomical: 'Astronomical (IAU constellations)' }[state.mode]} positions`, `
            <table class="w-full text-sm">
                <thead><tr class="text-[11px] text-slate-500 uppercase"><th></th><th class="text-left font-normal">Position</th><th class="text-right font-normal">°/day</th><th class="text-right font-normal">House</th></tr></thead>
                <tbody>${rows}</tbody>
            </table>
            ${angles ? `<div class="mt-3 text-xs text-slate-400">ASC ${fmtPos(angles.asc)} · MC ${fmtPos(angles.mc)}</div>` : ''}
            <div class="mt-2 text-[11px] text-slate-500">Ayanamsa (Lahiri): ${fmtOrb(ayan)}. Nodes are ${state.nodeType} nodes.${isAstro() ? ' Positions are degrees past the constellation\'s western border; signs, houses and element balance use sidereal signs.' : ''}</div>
        `),
        state.mode === 'sidereal' ? drishtiCard(current.drishti) : '',
        card('Element balance', bars(count('element'), ['Fire', 'Earth', 'Air', 'Water'], ELEMENT_COLORS)),
        card('Modality balance', bars(count('modality'), ['Cardinal', 'Fixed', 'Mutable'], { Cardinal: '#f472b6', Fixed: '#818cf8', Mutable: '#2dd4bf' })),
        card('Essential dignities now', dignified.length
            ? `<ul class="flex flex-col gap-1 text-sm">${dignified.map(x => `<li class="flex justify-between">${planetLink(x.id)} <span>${signSymbol(pos[x.id].sign)} ${dignityChips(x.id, pos[x.id].sign)}</span></li>`).join('')}</ul>`
            : '<p class="text-sm text-slate-500">No planet is in its domicile, exaltation, detriment or fall.</p>'),
        card(`All aspects (${aspects.length})`, aspects.length ? `<ul class="flex flex-col gap-1">${aspects.map(aspectRow).join('')}</ul>` : '<p class="text-sm text-slate-500">None within orb.</p>', 'text-sky-400')
    ].join('');
}

function renderEvents() {
    const events = findEvents(state.date, state.eventDays, state.eventMoon);
    return card('Upcoming sky events', `
        <div class="flex flex-wrap items-center gap-2 mb-3 text-xs">
            ${[7, 30, 90, 365].map(d => `<button data-event-days="${d}" class="px-2 py-1 rounded ${state.eventDays === d ? 'bg-blue-600 text-white' : 'bg-slate-700 hover:bg-slate-600'}">${d === 365 ? '1 year' : d + ' days'}</button>`).join('')}
            <label class="flex items-center gap-1 ml-auto cursor-pointer"><input type="checkbox" id="event-moon" ${state.eventMoon ? 'checked' : ''}> Moon ingresses</label>
        </div>
        <p class="text-xs text-slate-500 mb-2">Starting ${fmtDate(state.date, { year: 'numeric' })}. Click an event to jump there.</p>
        ${eventList(events)}
    `, 'text-violet-400');
}

function renderLibrary(resultsOnly = false) {
    const q = state.librarySearch.trim().toLowerCase();
    const match = (...texts) => !q || texts.some(t => t && String(t).toLowerCase().includes(q));
    const section = (title, items) => items.length ? card(title, `<div class="flex flex-wrap gap-2">${items.join('')}</div>`) : '';
    const pill = (type, key, label) => `<button class="lib-pill" data-type="${type}" data-key="${esc(key)}">${label}</button>`;

    const planets = bodies.filter(b => match(b.name, LORE.planets[b.id].sanskrit, LORE.planets[b.id].keywords.join(' ')))
        .map(b => pill('planets', b.id, `<span style="color:${b.color}">${b.symbol}</span> ${b.name}`));
    const signs = ZODIAC.filter(n => match(n, LORE.zodiac[n].sanskrit, LORE.zodiac[n].keywords.join(' '), LORE.zodiac[n].element))
        .map(n => pill('zodiac', n, `${signSymbol(n)} ${n}`));
    const houses = Object.entries(LORE.houses).filter(([k, h]) => match(h.name, h.sanskrit, h.keywords.join(' '), `house ${k}`))
        .map(([k, h]) => pill('houses', k, `${ROMAN[k - 1]} ${h.name.replace('House of ', '')}`));
    const aspects = ASPECT_TYPES.filter(k => match(k, LORE.aspects[k].nature))
        .map(k => pill('aspect', k, `<span style="color:${ASPECT_COLORS[k]}">${LORE.aspects[k].symbol}</span> ${LORE.aspects[k].name}`));
    const phases = LORE.phases.slice(0, 8).map((p, i) => [p, i]).filter(([p]) => match(p.name, 'moon phase'))
        .map(([p, i]) => pill('phase', i, `${p.emoji} ${p.name}`));
    const naks = LORE.nakshatras.map((n, i) => [n, i]).filter(([n]) => match(n.name, n.deity, n.keywords, 'nakshatra'))
        .map(([n, i]) => pill('nakshatra', i, `${i + 1}. ${n.name}`));
    const cons = Object.entries(LORE.constellations).filter(([k, c]) => match(k, c.stars, c.note, 'constellation'))
        .map(([k, c]) => pill('constellation', k, `${c.symbol} ${k}`));
    const stars = Object.entries(LORE.stars).filter(([k, s]) => match(k, s.constellation, 'star'))
        .map(([k, s]) => pill('stars', k, `<span style="color:${s.color}">✦</span> ${k}`));
    const terms = Object.keys(LORE.glossary).filter(t => match(t, LORE.glossary[t]))
        .map(t => pill('glossary', t, t));

    const results = [
        section('Planets & points', planets),
        section('Signs', signs),
        section('Houses', houses),
        section('Aspects', aspects),
        section('Moon phases', phases),
        section('Nakshatras (lunar mansions)', naks),
        section('Constellations (the real sky)', cons),
        section('Fixed stars', stars),
        section('Glossary', terms)
    ].join('') || '<p class="text-sm text-slate-500 px-1">No matches.</p>';
    if (resultsOnly) return results;
    return `
        <input id="library-search" type="search" placeholder="Search the library…" value="${esc(state.librarySearch)}"
            class="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
        <div id="library-results" class="flex flex-col gap-6">${results}</div>
    `;
}

function detailHeader(icon, title, subtitle, color = '#60a5fa') {
    return `<div class="flex items-center gap-2 -mb-2">
        <button class="text-sm text-slate-400 hover:text-white" data-action="back">← Back</button>
    </div>
    <div class="flex items-center gap-3 bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700/50 rounded-xl p-4">
        <span class="text-4xl" style="color:${color}">${icon}</span>
        <div>
            <h3 class="text-xl font-bold" style="color:${color}">${title}</h3>
            ${subtitle ? `<div class="text-sm text-slate-400">${subtitle}</div>` : ''}
        </div>
    </div>`;
}

function loreBlocks(classic, vedic) {
    return card('', `
        <h4 class="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-2">Classic (Western)</h4>
        <p class="text-sm text-slate-300 leading-relaxed">${classic}</p>
        <div class="w-full h-px bg-slate-700 my-4"></div>
        <h4 class="text-xs font-semibold text-orange-400 uppercase tracking-wider mb-2">Vedic (Jyotish)</h4>
        <p class="text-sm text-slate-300 leading-relaxed">${vedic}</p>
    `);
}

function factTable(rows) {
    return `<dl class="grid grid-cols-[auto,1fr] gap-x-4 gap-y-1 text-sm">${rows.filter(r => r[1]).map(([k, v]) =>
        `<dt class="text-slate-500">${k}</dt><dd class="text-slate-300">${v}</dd>`).join('')}</dl>`;
}

function renderDetail(type, key) {
    const { pos, angles, aspects } = current;

    if (type === 'planets') {
        const L = LORE.planets[key], b = BODY[key], p = pos[key];
        const sign = LORE.zodiac[p.sign];
        const house = houseOf(p.lon, angles);
        const nak = nakshatraOf(p.sid);
        const dig = dignitiesOf(key, p.sign);
        const ingress = nextIngress(key, state.date, key === 'Moon' ? 4 : ['Sun', 'Mercury', 'Venus', 'Mars'].includes(key) ? 400 : 3 * 365);
        const station = nextStation(key, state.date, 400);
        const myAspects = aspects.filter(a => a.a === key || a.b === key);
        const digNote = {
            Domicile: `${b.name} is at home in ${p.sign}: its nature expresses itself freely and with strength.`,
            Exalted: `${b.name} is exalted in ${p.sign}: elevated and honoured, it shows its best qualities.`,
            Detriment: `${b.name} is in detriment in ${p.sign}: it works in unfamiliar territory and needs conscious effort.`,
            Fall: `${b.name} is in fall in ${p.sign}: its significations are weakened or expressed awkwardly.`
        };
        const interp = `
            <p class="text-sm text-slate-300 leading-relaxed">${b.name}'s themes of <b>${L.theme}</b> are expressed in a <b>${sign.style}</b> way.</p>
            <p class="text-sm text-slate-400 leading-relaxed mt-2">Collectively, this colours ${L.transit} with ${sign.modality.toLowerCase()} ${sign.element.toLowerCase()} energy.</p>
            ${dig.map(d => `<p class="text-sm text-amber-200/90 leading-relaxed mt-2">${digNote[d]}</p>`).join('')}
            ${p.retro && L.retrograde && !b.node ? `<p class="text-sm text-rose-300/90 leading-relaxed mt-2"><b>Retrograde:</b> ${L.retrograde}</p>` : ''}
            ${house ? `<p class="text-sm text-slate-300 leading-relaxed mt-2"><b>${ordinal(house)} house</b> (${LORE.houses[house].name}): ${LORE.houses[house].transit}</p>` : ''}
            ${key === 'Moon' ? `<p class="text-sm text-slate-300 leading-relaxed mt-2">${sign.moonDay}</p>` : ''}
        `;
        const dignityLine = (arr) => arr ? arr.map(s => signLink(s)).join(', ') : null;
        return [
            detailHeader(b.symbol, b.name, `${altName(key)} · ${L.keywords.join(' · ')}`, b.color),
            `<button class="text-xs text-slate-400 hover:text-white -mt-2 text-left" data-action="focus" data-key="${key}">🔍 Zoom in and follow ${b.name} on the wheel</button>`,
            card('Right now', `
                <div class="text-lg font-mono">${posLink(p.lon)}${p.retro && !b.node ? ' <span class="text-rose-400">℞</span>' : ''}</div>
                <div class="flex flex-wrap gap-2 mt-2">${dignityChips(key, p.sign)} ${house ? chip(`${ordinal(house)} house`) : ''} ${chip(`${p.speed >= 0 ? '+' : ''}${p.speed.toFixed(3)}°/day`)}</div>
                <div class="mt-3">${factTable([
                    ...(isAstro() ? [['Tropical', fmtSign(p.trop)], ['Sidereal', fmtSign(p.sid)]]
                        : [[state.mode === 'sidereal' ? 'Tropical' : 'Sidereal', fmtSign(state.mode === 'sidereal' ? p.trop : p.sid)]]),
                    ['In front of', b.node ? `${link('constellation', trueConstellation(key, state.date), trueConstellation(key, state.date))} <span class="text-slate-500">(a calculated point, not visible)</span>`
                        : `${link('constellation', trueConstellation(key, state.date), trueConstellation(key, state.date))} <span class="text-slate-500">(IAU constellation)</span>`],
                    ['Nakshatra', link('nakshatra', String(nak.index), `${nak.name}, pada ${nak.pada}`)],
                    ['Next ingress', ingress ? `${link('jump', ingress.time.toISOString(), fmtDate(ingress.time, { year: 'numeric' }), 'underline')} → ${zoneLink(ingress.sign)}` : 'not within search window'],
                    ['Next station', station ? `${link('jump', station.time.toISOString(), fmtDate(station.time, { year: 'numeric' }), 'underline')} (${station.kind})` : null]
                ])}</div>
            `, 'text-blue-400'),
            card(`${b.name} in ${isAstro() ? 'sidereal ' : ''}${p.sign}`, interp, 'text-emerald-400'),
            myAspects.length ? card('Current aspects', `<ul class="flex flex-col gap-1">${myAspects.map(aspectRow).join('')}</ul>`, 'text-sky-400') : '',
            GRAHAS.includes(key) ? card('Vedic aspects now (sidereal signs)', `<ul class="flex flex-col gap-1 text-sm">${drishtiTargets(key, pos).map(t =>
                `<li class="flex justify-between gap-2"><span class="${t.house !== 7 ? 'text-orange-300' : 'text-slate-400'}">${ordinal(t.house)} sign</span>
                 <span>${signLink(t.sign)}${t.planets.length ? ' · ' + t.planets.map(planetLink).join(', ') : ''}</span></li>`).join('')}</ul>`, 'text-orange-400') : '',
            loreBlocks(L.classic, L.vedic),
            card('Reference', factTable([
                ['Rules', dignityLine(L.rules)],
                ['Exalted', L.exalt ? `${signLink(L.exalt[0])}${L.exalt[1] ? ` (peak ${L.exalt[1]}°)` : ''}` : null],
                ['Detriment', dignityLine(L.detriment)],
                ['Fall', dignityLine(L.fall)],
                ['Cycle', L.cycle],
                ['Retrograde', L.retrograde ? L.retrograde.split('.')[0] + '.' : 'Never'],
                ['Weekday', L.day],
                ['Metal', L.metal],
                ['Gemstone', L.gem],
                ['Body', L.body],
                ['Vedic nature', L.vedicNature],
                ['Vedic aspects', L.vedicAspects]
            ]))
        ].join('');
    }

    if (type === 'zodiac') {
        const z = LORE.zodiac[key];
        const idx = ZODIAC.indexOf(key);
        const here = bodies.filter(b => pos[b.id].sign === key);
        const houseNum = angles ? ((idx - signIndex(angles.asc) + 12) % 12) + 1 : null;
        const nakStart = Math.floor(idx * 30 / (360 / 27)), nakEnd = Math.floor((idx * 30 + 29.999) / (360 / 27));
        const naks = [];
        for (let n = nakStart; n <= nakEnd; n++) naks.push(link('nakshatra', String(n), LORE.nakshatras[n].name, 'underline'));
        return [
            detailHeader(z.symbol, key, `${z.sanskrit} · ${z.keywords.join(' · ')}`, ELEMENT_COLORS[z.element]),
            card('', `<div class="flex flex-wrap gap-2">
                ${chip(z.element, 'bg-slate-700/60')} ${chip(z.modality)} ${chip(z.polarity)}
                ${chip('Ruler: ' + z.ruler + (z.modernRuler ? ' / ' + z.modernRuler : ''))}
                ${z.exalted ? chip('Exalts: ' + z.exalted, 'bg-emerald-900/50 text-emerald-300') : ''}
                ${z.fall ? chip('Fall: ' + z.fall, 'bg-rose-900/50 text-rose-300') : ''}
            </div>
            <div class="mt-3">${factTable([
                ['Tropical Sun', z.dates], ['Sidereal Sun', z.sidDates], ['Body', z.body],
                ['House', houseNum ? `${ordinal(houseNum)} house from your Ascendant` : `${ordinal(idx + 1)} (natural zodiac)`],
                ['Nakshatras', naks.join(', ') + ' <span class="text-slate-500">(sidereal)</span>']
            ])}</div>`),
            card('Currently here', here.length
                ? `<ul class="flex flex-col gap-1 text-sm">${here.map(b => `<li class="flex justify-between">${planetLink(b.id)}<span class="font-mono text-slate-400">${fmtDegInSign(pos[b.id].lon)}${pos[b.id].retro && !b.node ? ' ℞' : ''} ${dignityChips(b.id, key)}</span></li>`).join('')}</ul>`
                : '<p class="text-sm text-slate-500">No planets in this sign right now.</p>', 'text-emerald-400'),
            loreBlocks(z.classic + `<br><br><span class="text-slate-400"><b>Shadow:</b> ${z.shadow}</span>`, z.vedic),
            card('Moon in ' + key, `<p class="text-sm text-slate-300 leading-relaxed">${z.moonDay}</p><p class="text-xs text-slate-500 mt-2">Good for: ${z.goodFor}</p>`, 'text-slate-300')
        ].join('');
    }

    if (type === 'houses') {
        const h = LORE.houses[key];
        const n = Number(key);
        let occupancy = '<p class="text-sm text-slate-500">Set your location (left panel) to see which sign and planets occupy this house right now. Without a location the wheel shows the natural houses (Aries = 1st).</p>';
        if (angles) {
            const sign = ZODIAC[(signIndex(angles.asc) + n - 1) % 12];
            const here = bodies.filter(b => pos[b.id].sign === sign);
            occupancy = `<div class="text-sm mb-2">Sign on this house: ${signLink(sign)}</div>
                ${here.length ? `<ul class="flex flex-col gap-1 text-sm">${here.map(b => `<li>${planetLink(b.id)} <span class="text-slate-500 font-mono">${fmtDegInSign(pos[b.id].lon)}</span></li>`).join('')}</ul>` : '<p class="text-sm text-slate-500">Empty right now.</p>'}`;
        }
        return [
            detailHeader(ROMAN[n - 1], `${ordinal(n)} House`, `${h.name} · ${h.sanskrit}`),
            card('', `<div class="flex flex-wrap gap-2">${chip(h.type)} ${chip(h.vedicGroup, 'bg-orange-900/40 text-orange-300')} ${chip('Natural sign: ' + h.naturalSign)}</div>
                <div class="flex flex-wrap gap-1 mt-3">${h.keywords.map(k => chip(k)).join(' ')}</div>`),
            card('Right now', occupancy + `<p class="text-sm text-slate-400 mt-3">${h.transit}</p>`, 'text-emerald-400'),
            loreBlocks(h.classic, h.vedic),
            card('', `<p class="text-xs text-slate-500">House systems vary (Placidus, Koch, Equal, Whole Sign). This app uses Whole Sign houses, the system of Hellenistic and Vedic astrology, where each sign is one house counted from the rising sign.</p>`)
        ].join('');
    }

    if (type === 'aspect') {
        const a = LORE.aspects[key];
        const now = aspects.filter(x => x.type === key);
        return [
            detailHeader(a.symbol, a.name, `${a.angle}° · ${a.nature} · orb ${a.orb}°`, ASPECT_COLORS[key]),
            card('', `<div class="flex flex-wrap gap-1">${a.keywords.map(k => chip(k)).join(' ')}</div>`),
            loreBlocks(a.classic, a.vedic),
            card('Active now', now.length ? `<ul class="flex flex-col gap-1">${now.map(aspectRow).join('')}</ul>` : '<p class="text-sm text-slate-500">None within orb.</p>', 'text-sky-400')
        ].join('');
    }

    if (type === 'aspectPair') {
        const [ida, idb, t] = key.split('|');
        const a = LORE.aspects[t], A = LORE.planets[ida], B = LORE.planets[idb];
        const inst = aspects.find(x => x.a === ida && x.b === idb && x.type === t);
        return [
            detailHeader(`${BODY[ida].symbol}${a.symbol}${BODY[idb].symbol}`, `${BODY[ida].name} ${a.name.toLowerCase()} ${BODY[idb].name}`,
                inst ? `orb ${fmtOrb(inst.orb)} · ${inst.applying ? 'applying (building)' : 'separating (fading)'}` : 'not currently within orb', ASPECT_COLORS[t]),
            card('Reading', `<p class="text-sm text-slate-300 leading-relaxed">${BODY[ida].name}'s <b>${A.theme}</b> meets ${BODY[idb].name}'s <b>${B.theme}</b> in a <b>${a.nature.toLowerCase()}</b> relationship (${a.keywords.join(', ').toLowerCase()}).</p>
                <p class="text-sm text-slate-400 leading-relaxed mt-2">${a.classic}</p>`, 'text-emerald-400'),
            card('The planets', `<div class="flex flex-col gap-2 text-sm">
                <div>${planetLink(ida)} in ${signLink(pos[ida].sign)}: <span class="text-slate-400">${A.keywords.slice(0, 4).join(', ')}</span></div>
                <div>${planetLink(idb)} in ${signLink(pos[idb].sign)}: <span class="text-slate-400">${B.keywords.slice(0, 4).join(', ')}</span></div>
            </div>`),
            card('Vedic view', `<p class="text-sm text-slate-300 leading-relaxed">${a.vedic}</p>`, 'text-orange-400'),
            card('', link('aspect', t, `More about the ${a.name.toLowerCase()} →`, 'text-blue-400 text-sm'))
        ].join('');
    }

    if (type === 'drishti') {
        const [caster, receiver] = key.split('|');
        const d = current.drishti.find(x => x.caster === caster && x.receiver === receiver);
        const C = LORE.planets[caster], c = BODY[caster], r = BODY[receiver];
        const benefic = ['Jupiter', 'Venus'].includes(caster) || (caster === 'Moon' && moonPhaseInfo(state.date).angle < 180);
        const tone = caster === 'Mercury'
            ? 'Mercury is neutral: its aspect takes on the nature of the planets it is associated with.'
            : benefic
                ? `${c.name} is a natural benefic, so its glance protects, supports and expands ${r.name}'s significations.`
                : `${c.name} is a natural malefic, so its glance pressures, delays or heats up ${r.name}'s significations, which can also mean discipline and drive.`;
        const special = d && d.special ? {
            Mars: 'Mars\'s 4th and 8th aspects bring energy, conflict and urgency to home, property and hidden matters.',
            Jupiter: 'Jupiter\'s 5th and 9th aspects are the trinal glances of grace, blessing intelligence, children and fortune.',
            Saturn: 'Saturn\'s 3rd and 10th aspects bring effort, responsibility and slow, durable results to the areas they touch.',
            NorthNode: 'Rahu\'s 5th and 9th aspects (accepted by many, not all, authorities) amplify and destabilise what they touch.',
            SouthNode: 'Ketu\'s 5th and 9th aspects (accepted by many, not all, authorities) detach and spiritualise what they touch.'
        }[caster] : '';
        return [
            detailHeader(`${c.symbol}→${r.symbol}`, `${c.name} aspects ${r.name}`,
                d ? `${ordinal(d.house)}-sign drishti${d.special ? ' (special)' : ''}${d.mutual ? ' · mutual' : ''}` : 'not active right now', c.color),
            card('Reading', `<p class="text-sm text-slate-300 leading-relaxed">${c.name} <span class="text-slate-500">[${C.vedicNature}]</span>, sitting in sidereal ${signLink(signName(pos[caster].sid))}, casts its glance on ${planetLink(receiver)} in ${signLink(signName(pos[receiver].sid))}.</p>
                <p class="text-sm text-slate-300 leading-relaxed mt-2">${tone}</p>
                ${special ? `<p class="text-sm text-orange-200/90 leading-relaxed mt-2">${special}</p>` : ''}
                ${d && d.mutual ? `<p class="text-sm text-slate-400 leading-relaxed mt-2">The aspect is mutual, so ${r.name} also aspects ${c.name}, tightly linking the two planets' significations.</p>` : ''}`, 'text-orange-400'),
            card('', `<p class="text-xs text-slate-500">${LORE.glossary['Graha Drishti']} Unlike Western aspects there is no orb: any planet anywhere in the aspected sign receives the glance, though some authorities weight it by degree.</p>`)
        ].join('');
    }

    if (type === 'phase') {
        const ph = LORE.phases[Number(key)];
        const info = moonPhaseInfo(state.date);
        return [
            detailHeader(ph.emoji, ph.name, `Sun–Moon angle ${ph.from}°–${ph.to}°`, '#e2e8f0'),
            card('', `<p class="text-sm text-slate-400">Now: ${info.emoji} ${info.name}, ${Math.round(info.illum * 100)}% illuminated</p>`),
            loreBlocks(ph.classic, ph.vedic),
            card('Good for', `<p class="text-sm text-slate-300">${ph.goodFor}</p>`, 'text-emerald-400')
        ].join('');
    }

    if (type === 'nakshatra') {
        const i = Number(key);
        const n = LORE.nakshatras[i];
        const span = 360 / 27;
        const start = i * span;
        const here = bodies.filter(b => nakshatraOf(pos[b.id].sid).index === i);
        return [
            detailHeader('✶', `${i + 1}. ${n.name}`, `Ruled by ${BODY[n.ruler].name} (${altName(n.ruler)})`, '#fb923c'),
            card('', factTable([
                ['Span', `${fmtSign(start)} – ${fmtSign(start + span)} (sidereal)`],
                ['Deity', n.deity], ['Symbol', n.symbol], ['Ruler', planetLink(n.ruler)], ['Themes', n.keywords]
            ])),
            card('Currently here', here.length
                ? `<ul class="flex flex-col gap-1 text-sm">${here.map(b => `<li>${planetLink(b.id)} <span class="text-slate-500">pada ${nakshatraOf(pos[b.id].sid).pada}</span></li>`).join('')}</ul>`
                : '<p class="text-sm text-slate-500">No planets in this nakshatra right now.</p>', 'text-emerald-400'),
            card('', `<p class="text-xs text-slate-500">${LORE.glossary['Nakshatra']} The ruling planets cycle Ketu → Venus → Sun → Moon → Mars → Rahu → Jupiter → Saturn → Mercury three times, which is the order of the Vimshottari dasha.</p>`)
        ].join('');
    }

    if (type === 'constellation') {
        const c = CONSTELLATIONS.find(x => x.name === key);
        const C = LORE.constellations[key];
        if (!c) {
            // Off-ecliptic constellations (Orion, Cetus, Sextans...) that the Moon or a planet can wander into.
            return [
                detailHeader('✧', key, 'IAU constellation off the ecliptic'),
                card('', `<p class="text-sm text-slate-300 leading-relaxed">${key} does not touch the ecliptic, but the Moon and planets travel up to several degrees north or south of it, so they sometimes pass in front of neighbouring constellations like this one. It has no astrological sign.</p>`)
            ].join('');
        }
        const inside = t => constellationOf(norm360(tropicalLongitude('Sun', t) - ayanamsa(t))).name === key;
        const yearStart = new Date(state.date.getFullYear(), 0, 1);
        let entry = null, exit = null;
        for (let d = 1, prev = yearStart, was = inside(yearStart); d <= 366 && !exit; d++) {
            const t = addDays(yearStart, d), is = inside(t);
            if (is && !was && !entry) entry = bisect(prev, t, inside);
            if (!is && was && entry) exit = bisect(prev, t, x => !inside(x));
            prev = t; was = is;
        }
        if (entry && !exit) for (let d = 1, prev = entry; d <= 60 && !exit; d++) {
            const t = addDays(entry, d);
            if (!inside(t)) exit = bisect(prev, t, x => !inside(x));
            prev = t;
        }
        const jump = t => link('jump', t.toISOString(), fmtDate(t, { year: 'numeric' }), 'underline');
        const here = bodies.filter(b => constellationOf(pos[b.id].sid).name === key);
        const sign = C?.sign;
        return [
            detailHeader(c.symbol, key, `IAU constellation · ${C?.stars || ''}`, sign ? ELEMENT_COLORS[LORE.zodiac[sign].element] : '#94a3b8'),
            card('On the ecliptic', factTable([
                ['Span', `${fmtSign(c.start)} – ${fmtSign(c.start + c.width)} (sidereal)`],
                ['Width', `${c.width.toFixed(1)}° <span class="text-slate-500">(a sign is always 30°)</span>`],
                ['Sun inside', entry && exit ? `${jump(entry)} → ${jump(exit)} (${Math.round((exit - entry) / DAY_MS)} days)` : '–'],
                ['Bright stars', C?.stars || '–']
            ])),
            card('Currently in front of these stars', here.length
                ? `<ul class="flex flex-col gap-1 text-sm">${here.map(b => `<li>${planetLink(b.id)} <span class="text-slate-500">${fmtPos(pos[b.id].sid)}</span></li>`).join('')}</ul>`
                : '<p class="text-sm text-slate-500">No planets along this stretch of the ecliptic right now.</p>', 'text-emerald-400'),
            C ? card('Sky lore', `<p class="text-sm text-slate-300 leading-relaxed">${C.note}</p>${C.symbolism ? `<p class="text-xs text-slate-400 mt-2">Associated themes: ${C.symbolism}</p>` : ''}`, 'text-sky-400') : '',
            card('Astrology', sign
                ? `<p class="text-sm text-slate-300 leading-relaxed">The sign named after it is ${signLink(sign)}. The sidereal sign covers ${fmtSign(ZODIAC.indexOf(sign) * 30)} – ${fmtSign(ZODIAC.indexOf(sign) * 30 + 29.99)}, an even 30° slice that only roughly matches these stars. The tropical sign of the same name is about ${Math.round(ayanamsa(state.date))}° further back, set by the seasons rather than the stars.</p>`
                : `<p class="text-sm text-slate-300 leading-relaxed">Ophiuchus has no astrological sign. In the sidereal zodiac its stretch of sky falls in the last degrees of ${signLink('Scorpio')} and the start of ${signLink('Sagittarius')}.</p>`, 'text-purple-400'),
            card('', `<p class="text-xs text-slate-500">${LORE.glossary['Constellation vs Sign']}</p><p class="text-xs text-slate-500 mt-2">${LORE.glossary['Precession']}</p>`)
        ].join('');
    }

    if (type === 'stars') {
        const s = LORE.stars[key];
        const lon = starLongitude(s, state.date);
        const near = bodies.filter(b => Math.abs(wrap180(pos[b.id].lon - lon)) <= 1.5);
        return [
            detailHeader('✦', key, s.constellation, s.color),
            card('Right now', `<div class="font-mono">${fmtPos(lon)}</div>
                <p class="text-sm mt-2 ${near.length ? 'text-amber-200' : 'text-slate-500'}">${near.length ? 'Conjunct (≤1.5°): ' + near.map(b => planetLink(b.id)).join(', ') : 'No planet conjunct within 1.5°.'}</p>
                <p class="text-xs text-slate-500 mt-2">Fixed stars drift forward ~1° every 72 years against the tropical zodiac (precession).</p>`),
            loreBlocks(s.classic, s.vedic)
        ].join('');
    }

    if (type === 'glossary') {
        return [
            detailHeader('📖', key, 'Glossary'),
            card('', `<p class="text-sm text-slate-300 leading-relaxed">${LORE.glossary[key]}</p>`)
        ].join('');
    }
    return '';
}

function openDetail(type, key) {
    if (type === 'jump') {
        setDate(new Date(key));
        return;
    }
    state.detail = { type, key };
    document.getElementById('panel').scrollTop = 0;
    renderPanel();
    // On narrow layouts the panel sits below the wheel; bring it into view.
    if (window.innerWidth < 1280) document.getElementById('info-sidebar').scrollIntoView({ behavior: 'smooth' });
}

// ---------------------------------------------------------------------------
// App update & controls

function updateApp() {
    const date = state.date;
    document.getElementById('current-date-display').innerText =
        date.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
    document.getElementById('current-time-display').innerText =
        date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' });
    const input = document.getElementById('date-input');
    if (document.activeElement !== input) input.value = toLocalInputValue(date);

    current.pos = computePositions(date);
    current.angles = computeAngles(date, state.location);
    current.aspects = computeAspects(current.pos);
    current.drishti = computeDrishti(current.pos);

    updatePlanets(current.pos);
    updatePlanetTicks(current.pos);
    updateHouses(current.angles);
    updateStars(date);
    updateAngles(current.angles);
    if (state.mode === 'sidereal') updateDrishtiLines(current.drishti, current.pos);
    else updateAspectLines(current.aspects, current.pos);
    applyLayers();
    if (view.follow) followView();
    else scaleSvgDetail();

    document.getElementById('ayanamsa-display').innerText = isAstro()
        ? `Real IAU constellation borders (unequal sizes, incl. Ophiuchus) · ayanamsa ${fmtOrb(ayanamsa(date))}`
        : `Ayanamsa ${fmtOrb(ayanamsa(date))}`;
    schedulePanelRender();
}

function toLocalInputValue(date) {
    const pad = n => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function setDate(date) {
    if (isNaN(date)) return;
    state.date = date;
    updateApp();
}

function changeTime(amount, unit) {
    const d = new Date(state.date);
    if (unit === 'hour') d.setHours(d.getHours() + amount);
    else if (unit === 'day') d.setDate(d.getDate() + amount);
    else if (unit === 'week') d.setDate(d.getDate() + 7 * amount);
    else if (unit === 'month') d.setMonth(d.getMonth() + amount);
    else if (unit === 'year') d.setFullYear(d.getFullYear() + amount);
    setDate(d);
}

function resetToNow() {
    setDate(new Date());
}

function togglePlay() {
    const btn = document.getElementById('play-btn');
    if (state.playTimer) {
        clearInterval(state.playTimer);
        state.playTimer = null;
        btn.textContent = '▶ Play';
        renderPanel();
        return;
    }
    btn.textContent = '❚❚ Pause';
    state.playTimer = setInterval(() => changeTime(1, state.playStep), 250);
}

function setMode(mode) {
    state.mode = mode;
    saveSettings();
    document.querySelectorAll('[data-mode]').forEach(b => b.classList.toggle('seg-active', b.dataset.mode === mode));
    drawStaticWheel();
    updateApp();
}

function setNodeType(type) {
    state.nodeType = type;
    saveSettings();
    document.querySelectorAll('[data-node]').forEach(b => b.classList.toggle('seg-active', b.dataset.node === type));
    updateApp();
}

function toggleLayer(layerName, checked) {
    state.layers[layerName] = checked;
    saveSettings();
    applyLayers();
}

function applyLayers() {
    for (const [name, on] of Object.entries(state.layers)) {
        if (name === 'planet-names') {
            document.getElementById('planets-layer').classList.toggle('hide-names', !on);
            continue;
        }
        const groupIds = { houses: 'houses-group', stars: 'stars-group', aspects: 'aspects-group' };
        if (groupIds[name]) document.getElementById(groupIds[name]).classList.toggle('hide-layer', !on);
        document.querySelectorAll(`.layer-${name}`).forEach(el => el.classList.toggle('hide-layer', !on));
    }
}

function setLocation(lat, lon) {
    if (isNaN(lat) || isNaN(lon) || Math.abs(lat) > 89.9 || Math.abs(lon) > 180) {
        setLocationStatus('Enter a latitude (−89.9…89.9) and longitude (−180…180).', true);
        return;
    }
    state.location = { lat, lon };
    saveSettings();
    syncLocationInputs();
    updateApp();
}

function clearLocation() {
    state.location = null;
    saveSettings();
    syncLocationInputs();
    updateApp();
}

function useGeolocation() {
    if (!navigator.geolocation) {
        setLocationStatus('Geolocation is not available in this browser.', true);
        return;
    }
    setLocationStatus('Locating…');
    navigator.geolocation.getCurrentPosition(
        p => setLocation(+p.coords.latitude.toFixed(4), +p.coords.longitude.toFixed(4)),
        err => setLocationStatus(`Could not get location: ${err.message}`, true),
        { timeout: 10000 }
    );
}

function syncLocationInputs() {
    const loc = state.location;
    document.getElementById('lat-input').value = loc ? loc.lat : '';
    document.getElementById('lon-input').value = loc ? loc.lon : '';
    setLocationStatus(loc
        ? `Houses & Ascendant for ${Math.abs(loc.lat).toFixed(2)}°${loc.lat >= 0 ? 'N' : 'S'}, ${Math.abs(loc.lon).toFixed(2)}°${loc.lon >= 0 ? 'E' : 'W'}`
        : 'No location set: houses shown as the natural zodiac.');
}

function setLocationStatus(text, isError = false) {
    const el = document.getElementById('location-status');
    el.textContent = text;
    el.className = `text-xs mt-2 ${isError ? 'text-rose-400' : 'text-slate-500'}`;
}

function bindEvents() {
    // Delegated clicks inside the info panel
    document.getElementById('info-sidebar').addEventListener('click', e => {
        const tabBtn = e.target.closest('[data-tab]');
        if (tabBtn) { state.tab = tabBtn.dataset.tab; state.detail = null; renderPanel(); return; }
        const gotoBtn = e.target.closest('[data-goto-tab]');
        if (gotoBtn) { state.tab = gotoBtn.dataset.gotoTab; state.detail = null; renderPanel(); return; }
        if (e.target.closest('[data-action="back"]')) { state.detail = null; renderPanel(); return; }
        const focusBtn = e.target.closest('[data-action="focus"]');
        if (focusBtn) { focusBody(focusBtn.dataset.key); return; }
        const daysBtn = e.target.closest('[data-event-days]');
        if (daysBtn) { state.eventDays = Number(daysBtn.dataset.eventDays); saveSettings(); renderPanel(); return; }
        const item = e.target.closest('[data-type]');
        if (item) openDetail(item.dataset.type, item.dataset.key);
    });
    document.getElementById('info-sidebar').addEventListener('change', e => {
        if (e.target.id === 'event-moon') { state.eventMoon = e.target.checked; saveSettings(); renderPanel(); }
    });
    document.getElementById('info-sidebar').addEventListener('input', e => {
        if (e.target.id === 'library-search') {
            state.librarySearch = e.target.value;
            document.getElementById('library-results').innerHTML = renderLibrary(true);
        }
    });

    document.getElementById('date-input').addEventListener('change', e => {
        if (e.target.value) setDate(new Date(e.target.value));
    });
    document.getElementById('play-step').value = state.playStep;
    document.getElementById('play-step').addEventListener('change', e => { state.playStep = e.target.value; saveSettings(); });

    document.getElementById('location-form').addEventListener('submit', e => {
        e.preventDefault();
        setLocation(parseFloat(document.getElementById('lat-input').value), parseFloat(document.getElementById('lon-input').value));
    });

    document.querySelectorAll('[data-layer]').forEach(cb => {
        cb.checked = state.layers[cb.dataset.layer];
        cb.addEventListener('change', () => toggleLayer(cb.dataset.layer, cb.checked));
    });
    document.querySelectorAll('[data-node]').forEach(b => {
        b.classList.toggle('seg-active', b.dataset.node === state.nodeType);
        b.addEventListener('click', () => setNodeType(b.dataset.node));
    });
    document.querySelectorAll('[data-mode]').forEach(b => {
        b.classList.toggle('seg-active', b.dataset.mode === state.mode);
        b.addEventListener('click', () => setMode(b.dataset.mode));
    });

    document.addEventListener('keydown', e => {
        if (e.target.matches('input, select, textarea') || e.metaKey || e.ctrlKey || e.altKey) return;
        const keys = {
            ArrowRight: () => changeTime(1, e.shiftKey ? 'hour' : 'day'),
            ArrowLeft: () => changeTime(-1, e.shiftKey ? 'hour' : 'day'),
            ArrowUp: () => changeTime(1, 'month'),
            ArrowDown: () => changeTime(-1, 'month'),
            n: resetToNow, N: resetToNow,
            '+': () => zoomBy(1.6), '=': () => zoomBy(1.6), '-': () => zoomBy(1 / 1.6), '0': resetView,
            ' ': togglePlay,
            Escape: () => { if (state.detail) { state.detail = null; renderPanel(); } }
        };
        if (keys[e.key]) { e.preventDefault(); keys[e.key](); }
    });
}

function init() {
    if (typeof Astronomy === 'undefined') {
        console.error("Astronomy engine failed to load.");
        document.getElementById('current-date-display').innerText = "Error loading astronomy engine";
        return;
    }
    loadSettings();
    buildConstellations();
    drawStaticWheel();
    createPlanetElements();
    bindEvents();
    bindZoom();
    syncLocationInputs();
    updateApp();
}

window.onload = init;
