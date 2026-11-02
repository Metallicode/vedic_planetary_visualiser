// Astrological knowledge base.
// Western (tropical) and Vedic (sidereal / Jyotish) perspectives side by side.

const ZODIAC = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

const LORE = {
    planets: {
        Sun: {
            symbol: "☉", sanskrit: "Surya",
            keywords: ["Identity", "Vitality", "Purpose", "Will", "Creativity", "Recognition"],
            theme: "identity, vitality and focus",
            transit: "the collective focus and sense of purpose",
            classic: "The centre of the chart and of the self: conscious identity, willpower, vitality and the drive to shine. Its sign colours how you express purpose; its house shows where you seek recognition. The Sun's ingress into the cardinal signs marks the equinoxes and solstices.",
            vedic: "Surya, the king of the planetary cabinet and natural Atmakaraka (significator of the soul). Signifies father, government and authority, bones, heart and the right eye. A mild natural malefic because of its heat. Gains directional strength (dig bala) in the 10th house. The Sun's entry into each sidereal sign is a Sankranti, with Makara Sankranti (Capricorn, mid-January) the most celebrated.",
            vedicNature: "Mild malefic (krura)",
            vedicAspects: "7th from itself",
            retrograde: null,
            cycle: "≈365 days around the zodiac; ~30 days in each sign",
            day: "Sunday", metal: "Gold", gem: "Ruby", body: "Heart, spine, eyes, overall vitality",
            rules: ["Leo"], exalt: ["Aries", 19], detriment: ["Aquarius"], fall: ["Libra"]
        },
        Moon: {
            symbol: "☽", sanskrit: "Chandra",
            keywords: ["Emotions", "Instinct", "Needs", "Memory", "Nurture", "Rhythm"],
            theme: "feelings, needs and instinctive responses",
            transit: "the day-to-day emotional weather and public mood",
            classic: "The receptive, reflective self: feelings, instinctive reactions, habits, memory and what makes you feel safe. As the fastest-moving body, changing sign every ~2.5 days, it sets the emotional tone of each day and is the timing hand of the sky.",
            vedic: "Chandra, the queen. Karaka of the mind (Manas), mother, nourishment, the public, fluids and the left eye. Benefic when waxing and bright, weaker near the new Moon. The Moon sign (Rashi) and birth nakshatra are the foundation of Vedic horoscopy: they set the dasha timing system, and daily muhurta (electional) work starts from them.",
            vedicNature: "Benefic when waxing, malefic when waning",
            vedicAspects: "7th from itself",
            retrograde: null,
            cycle: "≈27.3 days around the zodiac; ~2.5 days per sign",
            day: "Monday", metal: "Silver", gem: "Pearl", body: "Stomach, breasts, bodily fluids, sleep",
            rules: ["Cancer"], exalt: ["Taurus", 3], detriment: ["Capricorn"], fall: ["Scorpio"]
        },
        Mercury: {
            symbol: "☿", sanskrit: "Budha",
            keywords: ["Thought", "Speech", "Learning", "Trade", "Travel", "Wit"],
            theme: "thinking, communication and exchange",
            transit: "the flow of ideas, news, negotiations and plans",
            classic: "The messenger: how we think, speak, learn, write, negotiate and move information and goods. It rules both Gemini (gathering) and Virgo (sorting), and is never more than ~28° from the Sun.",
            vedic: "Budha, the prince. Significator of intellect, speech, mathematics, commerce, writing, skin and the nervous system, and maternal uncles. A neutral planet that takes on the nature of the planets it joins. Exalted in Virgo, which is also its own and moolatrikona sign.",
            vedicNature: "Neutral: benefic alone or with benefics",
            vedicAspects: "7th from itself",
            retrograde: "Retrograde about 3 times a year for ~3 weeks. Traditionally a time to review, revise, re-read and reconnect rather than launch. The clichés are misunderstandings, travel delays and tech hiccups. Good for editing, research, repairs and finishing old business. The 'shadow' periods either side are when Mercury covers the same degrees.",
            cycle: "≈1 year (it travels with the Sun); 14–30 days per sign, longer when retrograde",
            day: "Wednesday", metal: "Quicksilver", gem: "Emerald", body: "Nervous system, lungs, hands, speech",
            rules: ["Gemini", "Virgo"], exalt: ["Virgo", 15], detriment: ["Sagittarius", "Pisces"], fall: ["Pisces"]
        },
        Venus: {
            symbol: "♀", sanskrit: "Shukra",
            keywords: ["Love", "Beauty", "Pleasure", "Value", "Harmony", "Attraction"],
            theme: "love, pleasure, aesthetics and values",
            transit: "collective taste, social life, romance and spending",
            classic: "The principle of attraction: love, affection, aesthetics, art, pleasure and what we value, money included. It rules Taurus (sensual value) and Libra (relational harmony). As a morning or evening star it is never more than ~47° from the Sun.",
            vedic: "Shukra, guru of the asuras. Significator of spouse and marriage, romance, the arts and music, luxury, vehicles, beauty and the reproductive system. A natural benefic. Exalted in Pisces, debilitated in Virgo.",
            vedicNature: "Benefic (saumya)",
            vedicAspects: "7th from itself",
            retrograde: "Retrograde every ~18 months for ~6 weeks. A time to reassess relationships, values and spending as old lovers and old tastes resurface. Traditionally not ideal for weddings, cosmetic procedures or big luxury purchases.",
            cycle: "≈1 year; ~4–5 weeks per sign (up to 4 months around a retrograde)",
            day: "Friday", metal: "Copper", gem: "Diamond", body: "Throat, kidneys, skin, reproductive system",
            rules: ["Taurus", "Libra"], exalt: ["Pisces", 27], detriment: ["Scorpio", "Aries"], fall: ["Virgo"]
        },
        Mars: {
            symbol: "♂", sanskrit: "Mangala / Kuja",
            keywords: ["Drive", "Courage", "Desire", "Conflict", "Energy", "Action"],
            theme: "drive, courage and assertion",
            transit: "collective drive, ambition and conflict",
            classic: "The warrior: initiative, assertion, anger, sexuality and the energy to pursue what we want. Shows where we fight and how we compete. It rules Aries and, traditionally, Scorpio, and is exalted in Capricorn.",
            vedic: "Mangala, commander of the army. Significator of courage, younger siblings, land and property, blood, surgery, police and military, and engineering. A natural malefic. Besides the 7th it aspects the 4th and 8th houses from itself. Its placement is checked for Mangal Dosha in marriage matching.",
            vedicNature: "Malefic (krura)",
            vedicAspects: "4th, 7th and 8th from itself",
            retrograde: "Retrograde every ~26 months for ~10 weeks. Energy turns inward, bringing frustration, re-fought battles and re-done projects. Better for strategy, training and repair than for launching new initiatives or confrontations.",
            cycle: "≈687 days; ~6–7 weeks per sign, up to 7 months around a retrograde",
            day: "Tuesday", metal: "Iron", gem: "Red Coral", body: "Muscles, blood, head, adrenals",
            rules: ["Aries", "Scorpio"], exalt: ["Capricorn", 28], detriment: ["Libra", "Taurus"], fall: ["Cancer"]
        },
        Jupiter: {
            symbol: "♃", sanskrit: "Guru / Brihaspati",
            keywords: ["Growth", "Wisdom", "Faith", "Abundance", "Teaching", "Opportunity"],
            theme: "growth, meaning and opportunity",
            transit: "collective optimism, growth and excess",
            classic: "The greater benefic: expansion, optimism, meaning, generosity and opportunity. It shows where life opens up, and where we may overdo it. It rules Sagittarius and, traditionally, Pisces, and is exalted in Cancer.",
            vedic: "Guru, teacher of the gods. Significator of wisdom, dharma, children, wealth, teachers, scripture and the husband in a woman's chart. The most important natural benefic, whose aspect protects. Besides the 7th it aspects the 5th and 9th houses from itself. Its yearly sign changes are closely watched in transit (gochara) reading.",
            vedicNature: "Great benefic (saumya)",
            vedicAspects: "5th, 7th and 9th from itself",
            retrograde: "Retrograde ~4 months each year. Growth turns inward: re-evaluating beliefs, studies and long-range plans rather than expanding outwardly.",
            cycle: "≈11.9 years; ~1 year per sign",
            day: "Thursday", metal: "Tin", gem: "Yellow Sapphire", body: "Liver, fat, hips and thighs",
            rules: ["Sagittarius", "Pisces"], exalt: ["Cancer", 15], detriment: ["Gemini", "Virgo"], fall: ["Capricorn"]
        },
        Saturn: {
            symbol: "♄", sanskrit: "Shani",
            keywords: ["Structure", "Discipline", "Time", "Limits", "Responsibility", "Mastery"],
            theme: "structure, discipline and responsibility",
            transit: "the pressures and tests society faces",
            classic: "The great teacher and taskmaster: boundaries, commitment, fear, maturity and the slow building of lasting things. It shows where we feel tested and where we earn authority. It rules Capricorn and, traditionally, Aquarius, and is exalted in Libra. The Saturn return (~age 29, 58, 88) is a major life milestone.",
            vedic: "Shani, the servant and judge. Significator of longevity, hard work, delays, sorrow, detachment, the masses, labourers, old age and karma. A natural malefic, but a great giver when well placed. Besides the 7th it aspects the 3rd and 10th houses from itself. Sade Sati is its ~7½-year passage over the natal Moon sign and the signs on either side.",
            vedicNature: "Malefic (krura)",
            vedicAspects: "3rd, 7th and 10th from itself",
            retrograde: "Retrograde ~4.5 months each year. A time to revisit commitments, restructure and finish what was started, as pressures become internal.",
            cycle: "≈29.5 years; ~2.5 years per sign",
            day: "Saturday", metal: "Lead", gem: "Blue Sapphire", body: "Bones, teeth, joints, skin, knees",
            rules: ["Capricorn", "Aquarius"], exalt: ["Libra", 21], detriment: ["Cancer", "Leo"], fall: ["Aries"]
        },
        Uranus: {
            symbol: "♅", sanskrit: "Prajapati / Indra (modern)",
            keywords: ["Change", "Awakening", "Freedom", "Innovation", "Disruption", "Genius"],
            theme: "change, liberation and innovation",
            transit: "a generation's experience of sudden change and breakthrough",
            classic: "Discovered in 1781. The awakener: sudden change, liberation, rebellion, technology and insight. Its ~7 years in a sign make it generational. By house it shows where life refuses to stay predictable. Modern ruler of Aquarius.",
            vedic: "Not part of classical Jyotish, which uses nine grahas. Some modern Vedic astrologers note it as an indicator of sudden, electric and disruptive events and of technology.",
            vedicNature: "Not used classically",
            vedicAspects: "n/a",
            retrograde: "Retrograde ~5 months each year. Inner rebellion and quiet breakthroughs while changes already in motion are digested.",
            cycle: "≈84 years; ~7 years per sign",
            day: null, metal: "Uranium (modern)", gem: null, body: "Nervous impulses, ankles, circulation",
            rules: ["Aquarius"], exalt: null, detriment: ["Leo"], fall: null
        },
        Neptune: {
            symbol: "♆", sanskrit: "Varuna (modern)",
            keywords: ["Imagination", "Compassion", "Spirituality", "Dissolution", "Illusion", "Art"],
            theme: "dreams, ideals and dissolution",
            transit: "the collective dream of ideals, fashions and spiritual currents",
            classic: "Discovered in 1846. The dissolver: dreams, mysticism, compassion, art and music, as well as confusion, escapism and deception. Its ~14 years in a sign make it generational. Modern ruler of Pisces.",
            vedic: "Not part of classical Jyotish. Modern practitioners link it with the subtle, mystical and illusory, themes that overlap with Ketu.",
            vedicNature: "Not used classically",
            vedicAspects: "n/a",
            retrograde: "Retrograde ~5 months each year. Illusions surface and some fog may lift. Good for spiritual practice and creative incubation.",
            cycle: "≈165 years; ~14 years per sign",
            day: null, metal: "Neptunium (modern)", gem: null, body: "Immune and lymphatic systems, feet",
            rules: ["Pisces"], exalt: null, detriment: ["Virgo"], fall: null
        },
        Pluto: {
            symbol: "♇", sanskrit: "Yama (modern)",
            keywords: ["Power", "Transformation", "Depth", "Rebirth", "Obsession", "The hidden"],
            theme: "power, depth and transformation",
            transit: "deep generational shifts in power and control",
            classic: "Discovered in 1930 and reclassified as a dwarf planet in 2006, but still central to modern astrology. The transformer: power, compulsion, crisis, regeneration and what is buried. Its elliptical orbit keeps it in a sign for anywhere from 12 to 31 years. Modern ruler of Scorpio.",
            vedic: "Not part of classical Jyotish. Some modern Vedic astrologers relate its themes of upheaval and regeneration to Ketu and the 8th house.",
            vedicNature: "Not used classically",
            vedicAspects: "n/a",
            retrograde: "Retrograde ~5–6 months each year. Deep internal processing as power dynamics become visible for review.",
            cycle: "≈248 years; 12–31 years per sign",
            day: null, metal: "Plutonium (modern)", gem: null, body: "Reproductive and eliminative systems, cellular renewal",
            rules: ["Scorpio"], exalt: null, detriment: ["Taurus"], fall: null
        },
        NorthNode: {
            symbol: "☊", name: "North Node", sanskrit: "Rahu",
            keywords: ["Hunger", "Growth edge", "Ambition", "The foreign", "Obsession", "Future"],
            theme: "appetite, ambition and the unfamiliar",
            transit: "collective hunger, novelty and obsession",
            classic: "The Moon's ascending node: the point where the Moon's orbit crosses the ecliptic heading north. It is a mathematical point, not a body, and eclipses can only happen near the nodal axis. It is read as the direction of growth, appetite and unfamiliar territory. The mean node always moves backwards, completing a cycle every ~18.6 years.",
            vedic: "Rahu, the head of the demon serpent, is a shadow planet (chaya graha). It amplifies whatever it touches: worldly ambition, obsession, foreigners, technology, illusion and sudden rise. It behaves like Saturn and is exalted in Taurus (some say Gemini). Rahu and Ketu spend ~18 months in each sign and colour the eclipse seasons.",
            vedicNature: "Malefic shadow planet",
            vedicAspects: "5th, 7th and 9th from itself (per many authorities)",
            retrograde: "The mean node is always retrograde. The true node wobbles and turns briefly direct a few times a year, but follows the same backward drift.",
            cycle: "≈18.6 years (backwards); ~18 months per sign",
            day: null, metal: null, gem: "Hessonite (Gomed)", body: "Unusual or hard-to-diagnose conditions",
            rules: null, exalt: ["Taurus", null], detriment: null, fall: ["Scorpio"]
        },
        SouthNode: {
            symbol: "☋", name: "South Node", sanskrit: "Ketu",
            keywords: ["Release", "Past skills", "Detachment", "Spirituality", "Loss", "Insight"],
            theme: "release, detachment and inner knowing",
            transit: "what the collective is ready to let go of",
            classic: "The Moon's descending node, always exactly opposite the North Node. It represents the familiar, the already mastered and what must be released. Eclipses near it emphasise endings and clearing.",
            vedic: "Ketu, the headless body of the serpent, is a shadow planet that signifies moksha (liberation), detachment, intuition, past-life skills, sudden loss and spiritual insight. It behaves like Mars and is exalted in Scorpio (some say Sagittarius). Ketu rules the first nakshatra of each fire sign: Ashwini, Magha and Mula.",
            vedicNature: "Malefic shadow planet; spiritually liberating",
            vedicAspects: "5th, 7th and 9th from itself (per many authorities)",
            retrograde: "Always retrograde, moving in lockstep opposite Rahu.",
            cycle: "≈18.6 years (backwards); ~18 months per sign",
            day: null, metal: null, gem: "Cat's Eye (Lehsunia)", body: "Mysterious ailments, nerves, spine",
            rules: null, exalt: ["Scorpio", null], detriment: null, fall: ["Taurus"]
        }
    },

    zodiac: {
        Aries: {
            symbol: "♈", sanskrit: "Mesha", element: "Fire", modality: "Cardinal", polarity: "Yang",
            ruler: "Mars", modernRuler: null, exalted: "Sun", fall: "Saturn",
            dates: "Mar 21 – Apr 19", sidDates: "Apr 14 – May 14", body: "Head, face, brain",
            keywords: ["Initiative", "Courage", "Independence", "Impulse", "Competition"],
            classic: "Cardinal Fire, the spark that begins the zodiac at the spring equinox. Courageous, pioneering, direct and impatient. Aries wants to be first, to act and to test itself.",
            shadow: "Impulsiveness, anger, selfishness, starting things without finishing them.",
            vedic: "Mesha, the ram, is a movable (chara) fire sign ruled by Mars. It governs the head and stands for physical vitality, swift action and leadership. The Sun is exalted here (peak at 10°) and Saturn is debilitated. Nakshatras: Ashwini, Bharani and Krittika (pada 1).",
            style: "bold, direct, fast and self-starting",
            moonDay: "Moon in Aries days favour quick starts, exercise, decisive action and anything requiring nerve. Patience runs short, so avoid picking fights or making rash purchases.",
            goodFor: "Starting projects, physical activity, competition, solo initiatives"
        },
        Taurus: {
            symbol: "♉", sanskrit: "Vrishabha", element: "Earth", modality: "Fixed", polarity: "Yin",
            ruler: "Venus", modernRuler: null, exalted: "Moon", fall: "Uranus (modern)",
            dates: "Apr 20 – May 20", sidDates: "May 15 – Jun 14", body: "Throat, neck, voice",
            keywords: ["Stability", "Sensuality", "Patience", "Value", "Persistence"],
            classic: "Fixed Earth. Patient, reliable, sensual and determined. Taurus builds slowly, enjoys the physical world and protects what it values. It can be stubborn and resistant to change.",
            shadow: "Stubbornness, possessiveness, inertia, overindulgence.",
            vedic: "Vrishabha, the bull, is a fixed (sthira) earth sign ruled by Venus. It governs the face, mouth and speech and stands for accumulated wealth and enjoyment of comforts. The Moon is exalted here (peak at 3°) and Rahu is exalted by many authorities. Nakshatras: Krittika (2–4), Rohini and Mrigashira (1–2).",
            style: "steady, sensual, practical and slow to change",
            moonDay: "Moon in Taurus days are grounded and comfortable: good for finances, gardening, cooking, massage and steady work. Avoid forcing change, because people dig in.",
            goodFor: "Financial matters, buying quality items, building, self-care, planting"
        },
        Gemini: {
            symbol: "♊", sanskrit: "Mithuna", element: "Air", modality: "Mutable", polarity: "Yang",
            ruler: "Mercury", modernRuler: null, exalted: null, fall: null,
            dates: "May 21 – Jun 20", sidDates: "Jun 15 – Jul 15", body: "Shoulders, arms, hands, lungs",
            keywords: ["Curiosity", "Communication", "Versatility", "Wit", "Connection"],
            classic: "Mutable Air, the twins. Adaptable, curious, talkative and quick. Gemini gathers information, connects people and ideas, and needs variety.",
            shadow: "Scattered focus, superficiality, nervousness, gossip, inconsistency.",
            vedic: "Mithuna, the couple, is a dual (dvisvabhava) air sign ruled by Mercury. It governs the shoulders, arms and breath and stands for intellect, writing, trade, the arts and communication. Rahu is considered exalted here by some. Nakshatras: Mrigashira (3–4), Ardra and Punarvasu (1–3).",
            style: "curious, chatty, versatile and quick-changing",
            moonDay: "Moon in Gemini days buzz with messages, errands and conversation. They are ideal for writing, networking, short trips and learning, though restless minds may struggle to focus.",
            goodFor: "Writing, emails, meetings, short trips, learning, brainstorming"
        },
        Cancer: {
            symbol: "♋", sanskrit: "Karka", element: "Water", modality: "Cardinal", polarity: "Yin",
            ruler: "Moon", modernRuler: null, exalted: "Jupiter", fall: "Mars",
            dates: "Jun 21 – Jul 22", sidDates: "Jul 16 – Aug 16", body: "Chest, breasts, stomach",
            keywords: ["Nurture", "Protection", "Home", "Memory", "Sensitivity"],
            classic: "Cardinal Water, beginning at the summer solstice. Nurturing, protective, intuitive and moody. Cancer creates safety, honours family and roots, and leads through care.",
            shadow: "Clinginess, defensiveness, moodiness, living in the past.",
            vedic: "Karka, the crab, is a movable water sign ruled by the Moon. It governs the chest and heart and stands for emotions, mother, home and sensitivity. Jupiter is exalted here (peak at 5°) and Mars is debilitated. Nakshatras: Punarvasu (4), Pushya and Ashlesha. Pushya is considered the most auspicious nakshatra.",
            style: "protective, emotional, intuitive and home-centred",
            moonDay: "Moon in Cancer days pull us home. Good for family, cooking, nesting, emotional talks and self-care. Sensitivity runs high, so be gentle.",
            goodFor: "Home and family matters, cooking, real estate, rest, emotional healing"
        },
        Leo: {
            symbol: "♌", sanskrit: "Simha", element: "Fire", modality: "Fixed", polarity: "Yang",
            ruler: "Sun", modernRuler: null, exalted: null, fall: null,
            dates: "Jul 23 – Aug 22", sidDates: "Aug 17 – Sep 16", body: "Heart, upper back, spine",
            keywords: ["Self-expression", "Creativity", "Generosity", "Pride", "Play"],
            classic: "Fixed Fire, the lion. Confident, warm, dramatic, generous and proud. Leo creates, performs, leads from the heart and wants to be seen.",
            shadow: "Arrogance, vanity, need for attention, domineering behaviour.",
            vedic: "Simha, the lion, is a fixed fire sign ruled by the Sun and its moolatrikona. It governs the stomach and heart and stands for royal demeanour, authority, creativity and leadership. Nakshatras: Magha, Purva Phalguni and Uttara Phalguni (1).",
            style: "warm, proud, theatrical and generous",
            moonDay: "Moon in Leo days want fun, romance, creativity and recognition. They suit performances, parties, play with children and generous gestures. Watch for wounded pride.",
            goodFor: "Creative work, presenting, dates, celebrations, leadership"
        },
        Virgo: {
            symbol: "♍", sanskrit: "Kanya", element: "Earth", modality: "Mutable", polarity: "Yin",
            ruler: "Mercury", modernRuler: null, exalted: "Mercury", fall: "Venus",
            dates: "Aug 23 – Sep 22", sidDates: "Sep 17 – Oct 16", body: "Intestines, digestion, nervous system",
            keywords: ["Analysis", "Service", "Craft", "Health", "Discernment"],
            classic: "Mutable Earth, the maiden. Analytical, practical, modest and helpful. Virgo refines, improves, heals and pays attention to the details others miss.",
            shadow: "Over-criticism, worry, perfectionism, anxiety.",
            vedic: "Kanya, the maiden, is a dual earth sign ruled by Mercury, which is exalted here (peak at 15°) while Venus is debilitated. It governs the waist and intestines and stands for purity, service, detail, health and disease. Nakshatras: Uttara Phalguni (2–4), Hasta and Chitra (1–2).",
            style: "precise, practical, analytical and service-minded",
            moonDay: "Moon in Virgo days are for organising, cleaning, health routines, editing and solving practical problems. Nitpicking and worry can creep in.",
            goodFor: "Decluttering, health check-ups, diet changes, detailed work, planning"
        },
        Libra: {
            symbol: "♎", sanskrit: "Tula", element: "Air", modality: "Cardinal", polarity: "Yang",
            ruler: "Venus", modernRuler: null, exalted: "Saturn", fall: "Sun",
            dates: "Sep 23 – Oct 22", sidDates: "Oct 17 – Nov 15", body: "Kidneys, lower back, skin",
            keywords: ["Balance", "Partnership", "Fairness", "Beauty", "Diplomacy"],
            classic: "Cardinal Air, beginning at the autumn equinox. Diplomatic, fair, social, aesthetic and sometimes indecisive. Libra seeks harmony and initiates through relationship.",
            shadow: "People-pleasing, indecision, conflict avoidance, superficial charm.",
            vedic: "Tula, the scales, is a movable air sign ruled by Venus. It governs the lower abdomen and stands for balance, partnership, markets, trade and justice. Saturn is exalted here (peak at 20°) and the Sun is debilitated. Nakshatras: Chitra (3–4), Swati and Vishakha (1–3).",
            style: "diplomatic, social, aesthetic and relationship-oriented",
            moonDay: "Moon in Libra days favour partnerships, negotiations, art, beauty treatments and social plans. Decisions may stall as everyone weighs both sides.",
            goodFor: "Negotiations, contracts, social events, art, reconciliation"
        },
        Scorpio: {
            symbol: "♏", sanskrit: "Vrishchika", element: "Water", modality: "Fixed", polarity: "Yin",
            ruler: "Mars", modernRuler: "Pluto", exalted: "Uranus (modern)", fall: "Moon",
            dates: "Oct 23 – Nov 21", sidDates: "Nov 16 – Dec 15", body: "Reproductive and eliminative organs",
            keywords: ["Intensity", "Depth", "Transformation", "Loyalty", "Power"],
            classic: "Fixed Water. Intense, passionate, private and penetrating. Scorpio goes deep, transforms through crisis and knows how to keep a secret.",
            shadow: "Jealousy, control, vindictiveness, secrecy, all-or-nothing extremes.",
            vedic: "Vrishchika, the scorpion, is a fixed water sign ruled by Mars and co-ruled by Ketu. It governs the private parts and stands for research, hidden wealth, occult knowledge and sudden transformations. The Moon is debilitated here and Ketu is exalted by many authorities. Nakshatras: Vishakha (4), Anuradha and Jyeshtha.",
            style: "intense, strategic, private and transformative",
            moonDay: "Moon in Scorpio days are deep and focused: good for research, therapy, investigations, intimacy and clearing out. Emotions run strong and may turn suspicious.",
            goodFor: "Research, therapy, shared finances, detox, getting to the bottom of things"
        },
        Sagittarius: {
            symbol: "♐", sanskrit: "Dhanu", element: "Fire", modality: "Mutable", polarity: "Yang",
            ruler: "Jupiter", modernRuler: null, exalted: null, fall: null,
            dates: "Nov 22 – Dec 21", sidDates: "Dec 16 – Jan 13", body: "Hips, thighs, liver",
            keywords: ["Exploration", "Meaning", "Optimism", "Freedom", "Truth"],
            classic: "Mutable Fire, the archer. Optimistic, adventurous, philosophical and blunt. Sagittarius aims at the horizon, searching for meaning, truth and experience.",
            shadow: "Overpromising, preachiness, restlessness, carelessness with details.",
            vedic: "Dhanu, the bow, is a dual fire sign ruled by Jupiter, with its moolatrikona in the first part. It governs the thighs and stands for dharma, religion, higher education, gurus and truth-seeking. Nakshatras: Mula, Purva Ashadha and Uttara Ashadha (1).",
            style: "expansive, adventurous, philosophical and frank",
            moonDay: "Moon in Sagittarius days are for big-picture thinking, travel, teaching, study and getting outdoors. Optimism is high, so double-check the fine print.",
            goodFor: "Travel, study, publishing, legal matters, outdoor activity"
        },
        Capricorn: {
            symbol: "♑", sanskrit: "Makara", element: "Earth", modality: "Cardinal", polarity: "Yin",
            ruler: "Saturn", modernRuler: null, exalted: "Mars", fall: "Jupiter",
            dates: "Dec 22 – Jan 19", sidDates: "Jan 14 – Feb 12", body: "Knees, bones, skin, teeth",
            keywords: ["Ambition", "Discipline", "Structure", "Responsibility", "Endurance"],
            classic: "Cardinal Earth, beginning at the winter solstice. Ambitious, disciplined, serious, strategic and responsible. Capricorn climbs the mountain one step at a time.",
            shadow: "Coldness, pessimism, workaholism, rigid control.",
            vedic: "Makara, the sea-creature, is a movable earth sign ruled by Saturn. It governs the knees and stands for structural ambition, hard work, public status and persistence. Mars is exalted here (peak at 28°) and Jupiter is debilitated. Nakshatras: Uttara Ashadha (2–4), Shravana and Dhanishta (1–2).",
            style: "disciplined, strategic, serious and results-oriented",
            moonDay: "Moon in Capricorn days are productive and businesslike: good for planning, career moves, structure and commitments. Feelings take a back seat to duty.",
            goodFor: "Career moves, long-term planning, meetings with authorities, structure"
        },
        Aquarius: {
            symbol: "♒", sanskrit: "Kumbha", element: "Air", modality: "Fixed", polarity: "Yang",
            ruler: "Saturn", modernRuler: "Uranus", exalted: null, fall: null,
            dates: "Jan 20 – Feb 18", sidDates: "Feb 13 – Mar 13", body: "Calves, ankles, circulation",
            keywords: ["Innovation", "Community", "Independence", "Ideals", "Objectivity"],
            classic: "Fixed Air, the water-bearer. Progressive, original, independent and humanitarian. Aquarius thinks for the group and the future, sometimes from an emotional distance.",
            shadow: "Detachment, contrarianism, rigidity of ideas, aloofness.",
            vedic: "Kumbha, the water pot, is a fixed air sign ruled by Saturn (co-ruled by Rahu) and is Saturn's moolatrikona. It governs the calves and ankles and stands for networks, large organisations, gains and humanitarian ideals. Nakshatras: Dhanishta (3–4), Shatabhisha and Purva Bhadrapada (1–3).",
            style: "innovative, unconventional, group-minded and detached",
            moonDay: "Moon in Aquarius days suit networking, group projects, technology, experiments and friendship. Emotions are cooler and people want space.",
            goodFor: "Group work, tech projects, community events, trying something new"
        },
        Pisces: {
            symbol: "♓", sanskrit: "Meena", element: "Water", modality: "Mutable", polarity: "Yin",
            ruler: "Jupiter", modernRuler: "Neptune", exalted: "Venus", fall: "Mercury",
            dates: "Feb 19 – Mar 20", sidDates: "Mar 14 – Apr 13", body: "Feet, lymphatic system",
            keywords: ["Compassion", "Imagination", "Surrender", "Intuition", "Transcendence"],
            classic: "Mutable Water, the fishes and the last sign of the zodiac. Compassionate, artistic, intuitive and porous. Pisces dissolves boundaries and connects to the whole.",
            shadow: "Escapism, confusion, victimhood, lack of boundaries.",
            vedic: "Meena, the fishes, is a dual water sign ruled by Jupiter. It governs the feet and stands for liberation (moksha), losses, foreign lands, charity and deep spirituality. Venus is exalted here (peak at 27°) and Mercury is debilitated. Nakshatras: Purva Bhadrapada (4), Uttara Bhadrapada and Revati.",
            style: "dreamy, compassionate, intuitive and fluid",
            moonDay: "Moon in Pisces days are soft and intuitive: good for rest, meditation, music, art and helping others. Focus and boundaries are harder, and things get vague.",
            goodFor: "Meditation, creative work, charity, rest, near-water activities"
        }
    },

    houses: {
        "1": {
            name: "House of Self", sanskrit: "Tanu Bhava", type: "Angular", naturalSign: "Aries",
            vedicGroup: "Kendra & Trikona",
            keywords: ["Body", "Appearance", "Identity", "Beginnings", "Vitality"],
            classic: "The Ascendant (rising sign) house: self, body, appearance, temperament and how you start things and meet the world.",
            vedic: "Tanu Bhava: the physical body, overall health, fundamental ego and general well-being. As both a kendra (angle) and a trikona (trine) it is the most important house in the chart.",
            transit: "Planets transiting here put the focus on you: your body, image, energy and personal new starts."
        },
        "2": {
            name: "House of Value", sanskrit: "Dhana Bhava", type: "Succedent", naturalSign: "Taurus",
            vedicGroup: "Maraka",
            keywords: ["Money", "Possessions", "Self-worth", "Resources", "Food"],
            classic: "Money, possessions, income, self-worth and personal resources: what you have and what you value.",
            vedic: "Dhana Bhava: accumulated wealth, speech, family of origin, face, food and early education. A maraka (death-inflicting) house in longevity analysis.",
            transit: "Transits here activate income, spending, possessions and questions of self-worth."
        },
        "3": {
            name: "House of Communication", sanskrit: "Sahaja Bhava", type: "Cadent", naturalSign: "Gemini",
            vedicGroup: "Upachaya",
            keywords: ["Siblings", "Neighbourhood", "Learning", "Writing", "Short trips"],
            classic: "Communication, siblings, neighbours, early schooling, short trips and your immediate environment.",
            vedic: "Sahaja Bhava: courage, younger siblings, self-effort, hands, short journeys and communication. An upachaya (growth) house where malefics do well.",
            transit: "Transits here bring busy messages, errands, local travel, paperwork and sibling news."
        },
        "4": {
            name: "House of Home", sanskrit: "Sukha Bhava", type: "Angular", naturalSign: "Cancer",
            vedicGroup: "Kendra",
            keywords: ["Home", "Family", "Roots", "Parent", "Private life"],
            classic: "The IC, the base of the chart: home, family, ancestry, emotional foundations and private life.",
            vedic: "Sukha Bhava: inner peace, mother, vehicles, land and property, and foundational happiness and education.",
            transit: "Transits here stir the home front: moves, renovations, family matters and the need for retreat."
        },
        "5": {
            name: "House of Pleasure", sanskrit: "Putra Bhava", type: "Succedent", naturalSign: "Leo",
            vedicGroup: "Trikona",
            keywords: ["Creativity", "Romance", "Children", "Play", "Speculation"],
            classic: "Romance, creativity, children, pleasure, hobbies, risk-taking and self-expression.",
            vedic: "Putra Bhava: children, intellect, mantra, speculative investments and merit from past lives (Purva Punya). A trikona, so highly auspicious.",
            transit: "Transits here enliven romance, creative projects, fun and children's affairs."
        },
        "6": {
            name: "House of Health & Work", sanskrit: "Ari / Shatru Bhava", type: "Cadent", naturalSign: "Virgo",
            vedicGroup: "Dusthana & Upachaya",
            keywords: ["Routine", "Health", "Service", "Work", "Pets"],
            classic: "Health, daily routines, work, service, co-workers and pets: the maintenance of life.",
            vedic: "Ari Bhava: enemies, debts, disease, litigation, daily service and overcoming obstacles. Malefics here destroy enemies.",
            transit: "Transits here focus attention on workload, habits, health and practical problem-solving."
        },
        "7": {
            name: "House of Partnership", sanskrit: "Kalatra Bhava", type: "Angular", naturalSign: "Libra",
            vedicGroup: "Kendra & Maraka",
            keywords: ["Marriage", "Partners", "Contracts", "Open enemies", "Others"],
            classic: "The Descendant: marriage, committed partnerships, contracts, clients and open enemies.",
            vedic: "Kalatra Bhava: spouse, business partnerships, legal bonds, sexual relationships and foreign residence.",
            transit: "Transits here bring other people forward: partners, negotiations, collaborations and conflicts."
        },
        "8": {
            name: "House of Transformation", sanskrit: "Ayur / Randhra Bhava", type: "Succedent", naturalSign: "Scorpio",
            vedicGroup: "Dusthana",
            keywords: ["Intimacy", "Shared money", "Crisis", "Death & rebirth", "Occult"],
            classic: "Shared resources, debt, inheritance, taxes, intimacy, crisis, death and rebirth, and mysteries.",
            vedic: "Ayur Bhava: longevity, sudden changes, hidden things, the occult, research and unearned wealth such as inheritance.",
            transit: "Transits here deepen things: joint finances, intimacy, psychological work and endings."
        },
        "9": {
            name: "House of Philosophy", sanskrit: "Dharma Bhava", type: "Cadent", naturalSign: "Sagittarius",
            vedicGroup: "Trikona",
            keywords: ["Beliefs", "Higher learning", "Travel", "Publishing", "Law"],
            classic: "Philosophy, religion, higher education, long-distance travel, publishing, law and worldview.",
            vedic: "Dharma Bhava: fortune (bhagya), religion, father (in North Indian practice), gurus and higher wisdom. The most auspicious trikona.",
            transit: "Transits here expand horizons through study, travel, teaching and questions of meaning."
        },
        "10": {
            name: "House of Career", sanskrit: "Karma Bhava", type: "Angular", naturalSign: "Capricorn",
            vedicGroup: "Kendra & Upachaya",
            keywords: ["Career", "Status", "Reputation", "Authority", "Legacy"],
            classic: "The Midheaven (MC): career, public image, achievements, authority figures and life direction.",
            vedic: "Karma Bhava: profession, fame, government, status and actions in society. The strongest kendra.",
            transit: "Transits here put career, reputation and relations with bosses in the spotlight."
        },
        "11": {
            name: "House of Community", sanskrit: "Labha Bhava", type: "Succedent", naturalSign: "Aquarius",
            vedicGroup: "Upachaya",
            keywords: ["Friends", "Groups", "Hopes", "Networks", "Gains"],
            classic: "Friends, groups, networks, hopes, wishes and the community you belong to.",
            vedic: "Labha Bhava: gains, income, elder siblings, social networks and fulfilment of desires. Nearly every planet gives good results here.",
            transit: "Transits here activate friendships, teams, networking and progress toward goals."
        },
        "12": {
            name: "House of the Unseen", sanskrit: "Vyaya Bhava", type: "Cadent", naturalSign: "Pisces",
            vedicGroup: "Dusthana",
            keywords: ["Solitude", "Subconscious", "Endings", "Retreat", "Spirituality"],
            classic: "The subconscious, solitude, endings, hospitals and retreats, hidden enemies, self-undoing and hidden strengths.",
            vedic: "Vyaya Bhava: expenses, losses, foreign lands, isolation, sleep, bed pleasures and spiritual liberation (moksha).",
            transit: "Transits here call for rest, reflection and closure. Things work better behind the scenes."
        }
    },

    aspects: {
        conjunction: {
            name: "Conjunction", symbol: "☌", angle: 0, orb: 8, nature: "Fusion",
            keywords: ["Merging", "Intensity", "New cycle"],
            classic: "Two planets in the same place blend their energies. Intensity and focus mark the start of a new cycle between them. The result depends on the planets: Venus–Jupiter is sweet, Mars–Saturn frustrating.",
            vedic: "Yuti (conjunction). Planets in the same sign influence each other strongly. If one is within ~1° of the other they are in graha yuddha (planetary war), and the one with the lower longitude usually wins. Planets close to the Sun are combust (asta) and weakened."
        },
        sextile: {
            name: "Sextile", symbol: "⚹", angle: 60, orb: 5, nature: "Harmonious",
            keywords: ["Opportunity", "Cooperation", "Ease"],
            classic: "Planets 60° apart, usually in compatible elements (fire–air, earth–water). It offers opportunities that reward a little effort: friendly, stimulating and productive.",
            vedic: "Classical Jyotish counts aspects by whole sign (drishti) rather than by exact angle. A 3rd/11th sign relationship is partial at best, while the 11th house of gains is favourable."
        },
        square: {
            name: "Square", symbol: "□", angle: 90, orb: 7, nature: "Challenging",
            keywords: ["Tension", "Friction", "Action"],
            classic: "Planets 90° apart, in signs of the same modality but clashing elements. It creates friction and pressure that force action. Squares are the engine of growth and of crises.",
            vedic: "In drishti terms the 4th and 10th signs are kendra relationships. Mars aspects the 4th from itself and Saturn the 10th, so squares from these malefics are taken seriously."
        },
        trine: {
            name: "Trine", symbol: "△", angle: 120, orb: 7, nature: "Harmonious",
            keywords: ["Flow", "Talent", "Grace"],
            classic: "Planets 120° apart in the same element. Energy flows easily and brings natural talent and luck. The risk is complacency, because nothing pushes for change.",
            vedic: "The 5th and 9th signs from a planet are trikona (trine) houses, the most auspicious relationship. Jupiter casts special aspects on the 5th and 9th from itself."
        },
        quincunx: {
            name: "Quincunx", symbol: "⚻", angle: 150, orb: 3, nature: "Adjusting",
            keywords: ["Adjustment", "Awkwardness", "Recalibration"],
            classic: "Planets 150° apart, in signs that share neither element nor modality. It feels awkward and demands constant small adjustments. Often linked with health and work tweaks.",
            vedic: "The 6th/8th sign relationship (shadashtaka) is considered unfavourable between planets and in compatibility matching."
        },
        opposition: {
            name: "Opposition", symbol: "☍", angle: 180, orb: 8, nature: "Polarising",
            keywords: ["Awareness", "Balance", "Projection"],
            classic: "Planets 180° apart pull in opposite directions, often played out through other people. It brings awareness, negotiation and culmination. In the lunar cycle the Full Moon is a Sun–Moon opposition.",
            vedic: "The 7th-sign aspect is the full aspect (purna drishti) that every planet casts. Mutual 7th aspects link the two planets' significations strongly."
        }
    },

    phases: [
        {
            name: "New Moon", emoji: "🌑", from: 0, to: 22.5,
            classic: "Sun and Moon conjunct: a seed moment and a new monthly cycle. It is dark and inward, so set intentions and plant seeds rather than push.",
            goodFor: "Intentions, planning, quiet beginnings, rest",
            vedic: "Amavasya (no Moon) honours the ancestors (pitris) and is generally avoided for auspicious starts. Shukla Paksha (the bright fortnight) begins after it."
        },
        {
            name: "Waxing Crescent", emoji: "🌒", from: 22.5, to: 67.5,
            classic: "The first sliver appears. Momentum gathers, so gather resources and take first small steps despite early doubts.",
            goodFor: "First steps, gathering resources, commitment",
            vedic: "Early Shukla Paksha: a growing Moon strengthens new ventures. Dwitiya to Panchami are generally favourable tithis."
        },
        {
            name: "First Quarter", emoji: "🌓", from: 67.5, to: 112.5,
            classic: "A Sun–Moon square, the crisis of action. Obstacles test your intentions, so decide, push through and make adjustments.",
            goodFor: "Decisions, overcoming obstacles, building",
            vedic: "Around Ashtami (8th tithi) of the bright half, considered a tithi of conflict for many activities. It is sacred to Durga."
        },
        {
            name: "Waxing Gibbous", emoji: "🌔", from: 112.5, to: 157.5,
            classic: "Almost full. It is a time to refine, edit, perfect and prepare for culmination.",
            goodFor: "Refining, editing, practice, patience",
            vedic: "Late Shukla Paksha includes Ekadashi (11th tithi), a widely observed fasting day sacred to Vishnu."
        },
        {
            name: "Full Moon", emoji: "🌕", from: 157.5, to: 202.5,
            classic: "A Sun–Moon opposition and the culmination of the cycle. Emotions peak and things come to light. It is a time to celebrate, harvest, release and see clearly.",
            goodFor: "Celebration, completion, revelation, gratitude",
            vedic: "Purnima (full Moon) is auspicious for worship, fasting and charity. Many festivals (Guru Purnima, Holi, Kartik Purnima) fall on it."
        },
        {
            name: "Waning Gibbous", emoji: "🌖", from: 202.5, to: 247.5,
            classic: "The disseminating Moon. It is a time to share what you learned, teach, distribute and give back.",
            goodFor: "Sharing, teaching, networking, gratitude",
            vedic: "Krishna Paksha (the dark fortnight) begins. It favours inner work over new outer ventures."
        },
        {
            name: "Last Quarter", emoji: "🌗", from: 247.5, to: 292.5,
            classic: "A waning square, the crisis of consciousness. Re-evaluate, let go of what didn't work and clear the decks.",
            goodFor: "Review, decluttering, forgiveness, endings",
            vedic: "Around Krishna Ashtami, sacred to Krishna (Janmashtami falls on this tithi in Bhadrapada)."
        },
        {
            name: "Balsamic Moon", emoji: "🌘", from: 292.5, to: 337.5,
            classic: "The waning crescent before the dark Moon. Rest, surrender, dream and heal, and prepare the ground for the next cycle.",
            goodFor: "Rest, meditation, closure, letting go",
            vedic: "Late Krishna Paksha includes Chaturdashi (Shivaratri each month), a powerful night for spiritual practice."
        },
        {
            name: "New Moon", emoji: "🌑", from: 337.5, to: 360,
            classic: "Sun and Moon conjunct: a seed moment and a new monthly cycle. It is dark and inward, so set intentions and plant seeds rather than push.",
            goodFor: "Intentions, planning, quiet beginnings, rest",
            vedic: "Amavasya (no Moon) honours the ancestors (pitris) and is generally avoided for auspicious starts. Shukla Paksha (the bright fortnight) begins after it."
        }
    ],

    tithis: [
        "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami",
        "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
        "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi"
    ],
    tithiNotes: {
        4: "Chaturthi is sacred to Ganesha (Sankashti in the dark half, Vinayaka in the bright half).",
        8: "Ashtami is a tithi of struggle, sacred to Durga (bright half) and Krishna/Kalabhairava (dark half).",
        11: "Ekadashi is a fasting day sacred to Vishnu and one of the most widely observed tithis.",
        13: "Trayodashi brings Pradosh, an evening worship of Shiva.",
        14: "Chaturdashi of the dark half is Masik Shivaratri, the monthly night of Shiva.",
        15: "Purnima (full Moon) is auspicious for worship, fasting and charity.",
        30: "Amavasya (new Moon) is for honouring ancestors (tarpana) and inner work. It is avoided for new ventures."
    },

    nakshatras: [
        { name: "Ashwini", ruler: "SouthNode", deity: "Ashwini Kumaras (divine physicians)", symbol: "Horse's head", keywords: "Speed, healing, new beginnings, initiative" },
        { name: "Bharani", ruler: "Venus", deity: "Yama (lord of death & dharma)", symbol: "Yoni", keywords: "Bearing burdens, creativity, restraint, transformation" },
        { name: "Krittika", ruler: "Sun", deity: "Agni (fire)", symbol: "Razor / flame", keywords: "Cutting, purifying, sharp intellect, fierce protection" },
        { name: "Rohini", ruler: "Moon", deity: "Brahma / Prajapati (creator)", symbol: "Ox cart / chariot", keywords: "Growth, fertility, beauty, sensuality, abundance" },
        { name: "Mrigashira", ruler: "Mars", deity: "Soma (Moon nectar)", symbol: "Deer's head", keywords: "Searching, curiosity, gentleness, travel" },
        { name: "Ardra", ruler: "NorthNode", deity: "Rudra (storm god)", symbol: "Teardrop / diamond", keywords: "Storms, effort, destruction before renewal, intellect" },
        { name: "Punarvasu", ruler: "Jupiter", deity: "Aditi (mother of gods)", symbol: "Quiver of arrows", keywords: "Return, renewal, restoration of light, optimism" },
        { name: "Pushya", ruler: "Saturn", deity: "Brihaspati (priest of gods)", symbol: "Cow's udder / flower", keywords: "Nourishment, devotion, protection; the most auspicious nakshatra" },
        { name: "Ashlesha", ruler: "Mercury", deity: "Nagas (serpent deities)", symbol: "Coiled serpent", keywords: "Hypnotic, penetrating, clinging, kundalini, cunning" },
        { name: "Magha", ruler: "SouthNode", deity: "Pitris (ancestors)", symbol: "Royal throne", keywords: "Lineage, authority, tradition, honour" },
        { name: "Purva Phalguni", ruler: "Venus", deity: "Bhaga (delight & fortune)", symbol: "Front legs of a bed / hammock", keywords: "Pleasure, rest, romance, creativity" },
        { name: "Uttara Phalguni", ruler: "Sun", deity: "Aryaman (contracts, friendship)", symbol: "Back legs of a bed", keywords: "Patronage, marriage, loyalty, generosity" },
        { name: "Hasta", ruler: "Moon", deity: "Savitar (creative sun)", symbol: "Open hand", keywords: "Skill, craft, dexterity, healing touch, wit" },
        { name: "Chitra", ruler: "Mars", deity: "Vishvakarma / Tvashtar (divine architect)", symbol: "Bright jewel", keywords: "Design, beauty, architecture, brilliance" },
        { name: "Swati", ruler: "NorthNode", deity: "Vayu (wind)", symbol: "Young shoot in the wind", keywords: "Independence, flexibility, trade, movement" },
        { name: "Vishakha", ruler: "Jupiter", deity: "Indra & Agni", symbol: "Triumphal arch", keywords: "Goal-driven, determination, ambition, achievement" },
        { name: "Anuradha", ruler: "Saturn", deity: "Mitra (friendship)", symbol: "Lotus", keywords: "Devotion, friendship, cooperation, success abroad" },
        { name: "Jyeshtha", ruler: "Mercury", deity: "Indra (king of gods)", symbol: "Earring / umbrella", keywords: "Seniority, protection, power, responsibility" },
        { name: "Mula", ruler: "SouthNode", deity: "Nirriti (dissolution)", symbol: "Bunch of tied roots", keywords: "Getting to the root, destruction, research, truth" },
        { name: "Purva Ashadha", ruler: "Venus", deity: "Apas (cosmic waters)", symbol: "Fan / elephant tusk", keywords: "Invincibility, purification, persuasion, pride" },
        { name: "Uttara Ashadha", ruler: "Sun", deity: "Vishvadevas (universal gods)", symbol: "Elephant tusk / planks of a bed", keywords: "Lasting victory, integrity, leadership" },
        { name: "Shravana", ruler: "Moon", deity: "Vishnu (preserver)", symbol: "Ear / three footprints", keywords: "Listening, learning, connection, tradition" },
        { name: "Dhanishta", ruler: "Mars", deity: "Eight Vasus (elemental gods)", symbol: "Drum", keywords: "Rhythm, music, wealth, fame, adaptability" },
        { name: "Shatabhisha", ruler: "NorthNode", deity: "Varuna (cosmic waters)", symbol: "Empty circle / 100 physicians", keywords: "Healing, secrecy, mysticism, solitude" },
        { name: "Purva Bhadrapada", ruler: "Jupiter", deity: "Aja Ekapada (one-footed goat)", symbol: "Sword / front of a funeral cot", keywords: "Intensity, penance, transformation, idealism" },
        { name: "Uttara Bhadrapada", ruler: "Saturn", deity: "Ahir Budhnya (serpent of the deep)", symbol: "Back legs of a funeral cot / twins", keywords: "Depth, wisdom, restraint, stability" },
        { name: "Revati", ruler: "Mercury", deity: "Pushan (nourisher, guide of travellers)", symbol: "Fish / drum", keywords: "Nourishment, safe journeys, completion, compassion" }
    ],

    // J2000 tropical ecliptic longitudes; precession is applied at runtime.
    stars: {
        Algol: {
            lon2000: 56.17, color: "#f87171", constellation: "Perseus (β Persei)",
            classic: "The 'Demon Star', Medusa's head held by Perseus. An eclipsing binary that visibly dims every ~2.9 days. It is linked with intense passions, crisis, beheading (losing one's head) and, positively, fierce female power and the ability to face what others fear.",
            vedic: "Not a classical nakshatra marker. It falls in Krittika, the fiery, cutting nakshatra."
        },
        Alcyone: {
            lon2000: 59.98, color: "#a5b4fc", constellation: "Pleiades (η Tauri)",
            classic: "The brightest of the Pleiades, the Seven Sisters. Associated with vision, mourning, ambition and 'something to cry about'. It is also seen as a cosmic centre and a source of mystical insight.",
            vedic: "The Pleiades are Krittika itself, the six mothers who nursed Kartikeya (Skanda). Fiery, protective and purifying."
        },
        Aldebaran: {
            lon2000: 69.78, color: "#fca5a5", constellation: "Taurus (α Tauri)",
            classic: "The Eye of the Bull and one of the four Royal Stars of Persia, the Watcher of the East. It promises success, honour and courage, provided one acts with integrity.",
            vedic: "The yogatara (junction star) of Rohini, the beloved wife of the Moon and the nakshatra of growth, beauty and fertility."
        },
        Sirius: {
            lon2000: 104.08, color: "#e0f2fe", constellation: "Canis Major (α CMa)",
            classic: "The brightest star in the night sky. Its heliacal rising heralded the Nile flood and the 'dog days' of summer. It stands for fame, honour, devotion, guardianship and burning ambition.",
            vedic: "Called Lubdhaka (the hunter). It lies in the region of the nakshatra Ardra and Punarvasu."
        },
        Pollux: {
            lon2000: 113.22, color: "#fde68a", constellation: "Gemini (β Geminorum)",
            classic: "The immortal twin, a boxer. It is linked with courage, sharpness, competitiveness, and cruelty if misused.",
            vedic: "Castor and Pollux mark Punarvasu, the nakshatra of return and renewal ruled by Jupiter."
        },
        Regulus: {
            lon2000: 149.83, color: "#93c5fd", constellation: "Leo (α Leonis)",
            classic: "The Heart of the Lion and the Royal Star of the North. It signifies kingship, success, leadership and high honour, but warns that revenge will undo it all. Regulus moved into tropical Virgo in 2011–12.",
            vedic: "The yogatara of Magha, the nakshatra of thrones, ancestors and royal lineage."
        },
        Spica: {
            lon2000: 203.83, color: "#bfdbfe", constellation: "Virgo (α Virginis)",
            classic: "The ear of wheat in the Maiden's hand and one of the most fortunate stars, bringing gifts, talent, brilliance, protection and success in the arts and sciences.",
            vedic: "Spica is Chitra, 'the bright one'. The Lahiri ayanamsa is defined so that Spica sits at 0° Libra (180°) sidereal."
        },
        Antares: {
            lon2000: 249.77, color: "#f87171", constellation: "Scorpius (α Scorpii)",
            classic: "The Heart of the Scorpion, 'rival of Mars' for its red colour, and the Royal Star of the West. It brings intensity, courage, strategy and obsession, with success that comes through facing one's shadow.",
            vedic: "The yogatara of Jyeshtha, the nakshatra of seniority, protection and the eldest."
        },
        Fomalhaut: {
            lon2000: 333.87, color: "#c4b5fd", constellation: "Piscis Austrinus (α PsA)",
            classic: "The Mouth of the Fish and the Royal Star of the South. Idealism, mysticism, artistic vision and fame are its gifts, but they require the ideal to stay pure.",
            vedic: "It lies in the region of Shatabhisha / Purva Bhadrapada (sidereal Aquarius)."
        }
    },

    glossary: {
        "Ingress": "A planet entering a new sign. Ingresses change the 'flavour' of a planet's expression. Sun ingresses into Aries, Cancer, Libra and Capricorn mark the equinoxes and solstices.",
        "Retrograde (℞)": "An apparent backwards motion seen from Earth, which overtakes or is overtaken by the other planet. Retrograde periods are read as times to review, revisit and redo the planet's topics. The Sun and Moon never go retrograde.",
        "Station": "The day(s) a planet appears to stand still before turning retrograde (station retrograde, SR) or direct (station direct, SD). Its themes are felt most strongly around stations.",
        "Aspect": "An angular relationship between two planets (0°, 60°, 90°, 120°, 150°, 180°). Aspects show how planetary energies interact.",
        "Orb": "How far from exact an aspect is allowed to be and still count. Tighter orbs mean stronger effects. Luminaries (Sun and Moon) are usually given wider orbs.",
        "Applying / Separating": "An applying aspect is getting closer to exact, so it is building. A separating aspect has passed exact and is waning. Applying aspects are considered more potent for upcoming events.",
        "Void of Course Moon": "The period after the Moon makes its last major aspect in a sign and before it enters the next. By tradition, actions begun now 'come to nothing', so it is good for routine, rest and reflection rather than launches.",
        "Ascendant (ASC)": "The zodiac degree rising on the eastern horizon at a given time and place. It defines the 1st house and moves through all 12 signs in roughly 24 hours.",
        "Midheaven (MC)": "The zodiac degree culminating (highest point on the meridian). It marks career, reputation and direction.",
        "Whole Sign Houses": "The oldest house system: the entire rising sign is the 1st house, the next sign the 2nd, and so on. It is used in Hellenistic and Vedic astrology and by this app.",
        "Tropical Zodiac": "The zodiac anchored to the seasons: 0° Aries is the March equinox point. It is used in Western astrology.",
        "Sidereal Zodiac": "The zodiac anchored to the fixed stars. Because of precession it is currently ~24° behind the tropical zodiac. It is used in Vedic (Jyotish) astrology.",
        "Ayanamsa": "The angular difference between the tropical and sidereal zodiacs. This app uses Lahiri (Chitrapaksha), the Indian government standard. It grows ~50 arc-seconds per year.",
        "Precession": "The slow wobble of Earth's axis (≈25,772-year cycle) that makes the equinox point drift backwards through the constellations.",
        "Dignity": "How comfortable a planet is in a sign. In domicile (rulership) and exaltation it is strong. In detriment (the sign opposite its domicile) and fall (opposite its exaltation) it is challenged.",
        "Domicile": "A sign a planet rules. The planet is 'at home' and expresses itself naturally.",
        "Exaltation": "A sign where a planet is honoured and elevated, like an honoured guest. Vedic astrology calls it uchcha.",
        "Detriment": "The sign opposite a planet's domicile. The planet must work harder in unfamiliar territory.",
        "Fall": "The sign opposite a planet's exaltation, where the planet is weakened. Vedic astrology calls it neecha (debilitation).",
        "Lunar Nodes": "The two points where the Moon's orbit crosses the ecliptic. North Node = Rahu, South Node = Ketu. Eclipses only occur when the Sun–Moon conjunction or opposition falls near the nodes.",
        "Eclipse": "A solar eclipse happens at a New Moon near a node and a lunar eclipse at a Full Moon near a node. Eclipses are considered powerful turning points, with effects said to unfold over ~6 months.",
        "Combustion": "A planet too close to the Sun (roughly within 8°, less for Mercury and Venus) is 'burnt' (asta in Jyotish) and its significations are weakened. Cazimi, within 0°17' of the Sun, is the opposite: highly empowered.",
        "Tithi": "A Vedic lunar day: each 12° of separation between Moon and Sun. There are 30 per lunar month, 15 in the bright half (Shukla Paksha) and 15 in the dark half (Krishna Paksha). Tithis are central to the Hindu calendar and to muhurta (timing).",
        "Nakshatra": "One of the 27 lunar mansions of 13°20' each in the sidereal zodiac. Each has a ruling planet, deity and symbol, and is divided into four padas of 3°20'. The Moon's nakshatra is key in Jyotish.",
        "Paksha": "A lunar fortnight. Shukla Paksha (waxing, bright) runs from New to Full Moon. Krishna Paksha (waning, dark) runs from Full to New Moon.",
        "Planetary Day & Hour": "Each weekday is ruled by a planet (Sunday–Sun, Monday–Moon, Tuesday–Mars, Wednesday–Mercury, Thursday–Jupiter, Friday–Venus, Saturday–Saturn). Daylight and night are each split into 12 unequal 'hours' ruled in Chaldean order (Saturn, Jupiter, Mars, Sun, Venus, Mercury, Moon), starting at sunrise with the day ruler.",
        "Sade Sati": "Saturn's ~7½-year transit through the 12th, 1st and 2nd signs from the natal Moon in Vedic astrology. It is seen as a period of testing, maturing and restructuring.",
        "Dasha": "The Vedic system of planetary periods. The most common, Vimshottari (120 years), starts from the ruler of the birth Moon's nakshatra.",
        "Graha Drishti": "Vedic planetary aspects counted by sign. All planets aspect the 7th sign from themselves. Mars also aspects the 4th and 8th, Jupiter the 5th and 9th, and Saturn the 3rd and 10th.",
        "Shadow Period": "The stretch before and after a retrograde in which the planet covers the same degrees it will retrace or has retraced. Retrograde themes begin and fade gradually.",
        "Precession": "The slow wobble of Earth's axis (one turn in ~25,800 years). It slides the equinox point backwards along the zodiac by about 1° every 72 years, so the tropical signs drift away from the constellations they were named after. Today the gap is about 24°.",
        "Constellation vs Sign": "A sign is an exact 30° slice of the zodiac. A constellation is a real star pattern, with an official boundary set by the International Astronomical Union (IAU) in 1930. Constellations have unequal sizes, and the ecliptic also crosses Ophiuchus, so the Sun spends anywhere from ~7 to ~45 days in each."
    },

    // The 13 IAU constellations crossed by the ecliptic. Boundaries are computed in app.js from the official
    // IAU borders; this is the sky lore. `sign` links each one to the astrological sign named after it.
    constellations: {
        Aries:       { sign: "Aries",       symbol: "♈", abbr: "Ari", stars: "Hamal, Sheratan", note: "The Ram whose golden fleece Jason sought. It is a small, faint constellation. Its brightest star, Hamal, is an orange giant. About 2,000 years ago the March equinox lay here, which is why tropical 0° is still called '0° Aries'." },
        Taurus:      { sign: "Taurus",      symbol: "♉", abbr: "Tau", stars: "Aldebaran, Elnath, the Pleiades, the Hyades", note: "The Bull, one of the oldest recognised constellations. Its red eye, Aldebaran, sits in the V-shaped Hyades cluster, and the Pleiades (Seven Sisters) ride on its shoulder. The Moon and planets regularly pass in front of both clusters." },
        Gemini:      { sign: "Gemini",      symbol: "♊", abbr: "Gem", stars: "Pollux, Castor", note: "The Twins Castor and Pollux, two bright stars side by side that are easy to spot in winter evenings. The June solstice point (the Sun's highest point on the ecliptic) now lies on the Taurus–Gemini border." },
        Cancer:      { sign: "Cancer",      symbol: "♋", abbr: "Cnc", stars: "Al Tarf, Acubens, the Beehive Cluster (M44)", note: "The Crab is the faintest zodiac constellation, with no star brighter than 3.5 magnitude. Its jewel is the Beehive Cluster (Praesepe), a hazy patch visible to the naked eye under dark skies." },
        Leo:         { sign: "Leo",         symbol: "♌", abbr: "Leo", stars: "Regulus, Denebola, Algieba", note: "The Lion, one of the few constellations that looks like its name. The 'Sickle' (a backwards question mark) forms its head and mane, with Regulus at the base, sitting almost exactly on the ecliptic." },
        Virgo:       { sign: "Virgo",       symbol: "♍", abbr: "Vir", stars: "Spica, Porrima, Vindemiatrix", note: "The Maiden is the largest zodiac constellation, and the Sun spends about 45 days in it. Spica, the ear of wheat in her hand, is the star the Lahiri ayanamsa is anchored to (sidereal 0° Libra). The September equinox point now lies in Virgo." },
        Libra:       { sign: "Libra",       symbol: "♎", abbr: "Lib", stars: "Zubeneschamali, Zubenelgenubi", note: "The Scales, the only zodiac constellation that is an object, not a creature. Its two main stars carry Arabic names meaning 'northern claw' and 'southern claw', because they were once the claws of the Scorpion." },
        Scorpius:    { sign: "Scorpio",     symbol: "♏", abbr: "Sco", stars: "Antares, Shaula, Graffias", note: "The Scorpion, with red Antares ('rival of Mars') at its heart. Only a thin strip of Scorpius touches the ecliptic, so the Sun crosses it in about a week before moving into Ophiuchus." },
        Ophiuchus:   { sign: null,          symbol: "⚕\uFE0E", abbr: "Oph", stars: "Rasalhague, Sabik", note: "The Serpent Bearer, usually identified with Asclepius, the healer who could raise the dead. The ecliptic crosses its southern foot, and the Sun spends about 18 days here, from late November to mid-December. That is longer than in Scorpius. Astrology does not use it as a sign, since the zodiac's 12 equal divisions date from Babylonian times. Constellation boundaries were only fixed in 1930.", symbolism: "Healing, medicine, hidden knowledge, the bridge between life and death" },
        Sagittarius: { sign: "Sagittarius", symbol: "♐", abbr: "Sgr", stars: "Kaus Australis, Nunki, the Teapot", note: "The Archer, a centaur aiming at the heart of the Scorpion. Its brightest stars form the 'Teapot' asterism. The centre of the Milky Way galaxy lies just beyond its spout, and the December solstice point now lies in Sagittarius." },
        Capricornus: { sign: "Capricorn",   symbol: "♑", abbr: "Cap", stars: "Deneb Algedi, Dabih, Algedi", note: "The Sea-Goat, a faint triangle of stars and one of the oldest figures, going back to Babylonian Suhurmašu ('goat-fish'). Algedi is a double star you can split with the naked eye." },
        Aquarius:    { sign: "Aquarius",    symbol: "♒", abbr: "Aqr", stars: "Sadalsuud, Sadalmelik, the Water Jar", note: "The Water Bearer lies in a region of sky the ancients called 'the Sea', full of watery constellations. Its 'Water Jar' asterism is a small Y of stars. When the equinox point crosses into Aquarius some centuries from now, the 'Age of Aquarius' begins astronomically." },
        Pisces:      { sign: "Pisces",      symbol: "♓", abbr: "Psc", stars: "Alrescha, Eta Piscium, the Circlet", note: "The Fishes, two fish tied together by a cord, with the knot at Alrescha. Faint but large. The March equinox point (tropical 0° Aries) lies in Pisces today, which is why this era is called the Age of Pisces." }
    }
};

// Planetary weekday rulers (index = Date.getDay()) and Chaldean order for planetary hours.
const DAY_RULERS = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];
const CHALDEAN = ["Saturn", "Jupiter", "Mars", "Sun", "Venus", "Mercury", "Moon"];
