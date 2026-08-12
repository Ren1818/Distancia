// config.js - archivo central de configuración editable por el usuario
export const relationship = {
    // Fecha de inicio de la relación (modifica aquí si lo deseas)
    startDate: "2026-07-15T00:00:00"
};

export const letterContent = `
AQUÍ ESCRIBIRÉ PERSONALMENTE MI CARTA.
`;

export const music = {
    // Nombre exacto del archivo de audio según lo solicitado
    audio: "/assets/audio/between-el-juego-y-la-vida.mp3",
    cover: "/assets/images/cover.svg",
    title: "between-el-juego-y-la-vida",
    artist: "ARTISTA",
    lyrics: `
AQUÍ COLOCARÉ LA LETRA
`
};

export const loveMessages = [
    "AQUÍ VA UNA FRASE",
    "AQUÍ VA OTRA FRASE",
    "AQUÍ VA OTRA FRASE",
    "AQUÍ VA OTRA FRASE"
];

export const locations = {
    origin: {
        city: "Esmeraldas",
        country: "Ecuador",
        // IMPORTANTE: Sustituye estas coordenadas por las reales si lo deseas.
        latitude: null,
        longitude: null
    },

    destination: {
        city: "Acapulco",
        country: "México",
        // IMPORTANTE: Sustituye estas coordenadas por las reales si lo deseas.
        latitude: null,
        longitude: null
    }
};

// ajustes adicionales
export const settings = {
    earthRotationSpeed: 0.02,
    routeHeight: 0.08
};
