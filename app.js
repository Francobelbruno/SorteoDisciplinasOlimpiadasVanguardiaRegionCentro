function crearEquipos() {
    return [
        { nombre: "LIHUE", ruca: "LIHUE" },
        { nombre: "CHAPELCO A", ruca: "CHAPELCO" },
        { nombre: "CHAPELCO B", ruca: "CHAPELCO" },
        { nombre: "CARAHUE A", ruca: "CARAHUE" },
        { nombre: "CARAHUE B", ruca: "CARAHUE" },
        { nombre: "CURA A", ruca: "CURA" },
        { nombre: "CURA B", ruca: "CURA" },
        { nombre: "CHAMPAQUI A", ruca: "CHAMPAQUI" },
        { nombre: "CHAMPAQUI B", ruca: "CHAMPAQUI" },
        { nombre: "CHOROY", ruca: "CHOROY" },
        { nombre: "LLAHUE A", ruca: "LLAHUE" },
        { nombre: "LLAHUE B", ruca: "LLAHUE" },
        { nombre: "MAVUL A", ruca: "MAVUL" },
        { nombre: "MAVUL B", ruca: "MAVUL" },
        { nombre: "MALEN", ruca: "MALEN" }
    ].sort(() => Math.random() - 0.5);
}

function crearEquiposQuemados() {
    return [
        { nombre: "LIHUE", ruca: "LIHUE" },
        { nombre: "CHAPELCO A", ruca: "CHAPELCO" },
        { nombre: "CHAPELCO B", ruca: "CHAPELCO" },
        { nombre: "CARAHUE A", ruca: "CARAHUE" },
        { nombre: "CARAHUE B", ruca: "CARAHUE" },
        { nombre: "CURA A", ruca: "CURA" },
        { nombre: "CURA B", ruca: "CURA" },
        { nombre: "CHAMPAQUI", ruca: "CHAMPAQUI" },
        { nombre: "CHOROY", ruca: "CHOROY" },
        { nombre: "LLAHUE A", ruca: "LLAHUE" },
        { nombre: "LLAHUE B", ruca: "LLAHUE" },
        { nombre: "MAVUL", ruca: "MAVUL" },
        { nombre: "MALEN", ruca: "MALEN" }
    ].sort(() => Math.random() - 0.5);
}

function crearEquiposB100() {
    return [
        { nombre: "LIHUE", ruca: "LIHUE" },
        { nombre: "CHAPELCO", ruca: "CHAPELCO" },
        { nombre: "CARAHUE", ruca: "CARAHUE" },
        { nombre: "CURA", ruca: "CURA" },
        { nombre: "CHAMPAQUI", ruca: "CHAMPAQUI" },
        { nombre: "CHOROY", ruca: "CHOROY" },
        { nombre: "LLAHUE", ruca: "LLAHUE" },
        { nombre: "MAVUL", ruca: "MAVUL" },
        { nombre: "MALEN", ruca: "MALEN" }
    ].sort(() => Math.random() - 0.5);
}

function crearEquiposB400() {
    return [
        { nombre: "LIHUE", ruca: "LIHUE" },
        { nombre: "CHAPELCO", ruca: "CHAPELCO" },
        { nombre: "CARAHUE", ruca: "CARAHUE" },
        { nombre: "CURA", ruca: "CURA" },
        { nombre: "CHAMPAQUI", ruca: "CHAMPAQUI" },
        { nombre: "CHOROY", ruca: "CHOROY" },
        { nombre: "LLAHUE", ruca: "LLAHUE" },
        { nombre: "MAVUL", ruca: "MAVUL" },
        { nombre: "MALEN", ruca: "MALEN" }
    ].sort(() => Math.random() - 0.5);
}

function generarCalendarioZona(equipos) {
    const nombres = equipos.map(equipo => equipo.nombre);

    if (nombres.length < 2) {
        return [];
    }

    const rotacion = nombres.slice();

    if (rotacion.length % 2 === 1) {
        rotacion.push(null);
    }

    const total = rotacion.length;
    const rondas = [];

    for (let ronda = 0; ronda < total - 1; ronda += 1) {
        const partidos = [];

        for (let i = 0; i < total / 2; i += 1) {
            const local = rotacion[i];
            const visitante = rotacion[total - 1 - i];

            if (local && visitante) {
                partidos.push([local, visitante]);
            }
        }

        rondas.push(partidos);

        const fijo = rotacion[0];
        const resto = rotacion.slice(1);
        resto.unshift(resto.pop());
        rotacion.splice(0, rotacion.length, fijo, ...resto);
    }

    return rondas;
}

// Cruces de la fase final. Como es un sorteo (todavia no se juega),
// la llave cruza POSICIONES de cada zona, nunca dos equipos de la misma zona.
const llavesConfig = {
    // Voley: 4 zonas, clasifican 2 => 8 clasificados, cuartos perfectos.
    // Cada zona queda partida en mitades distintas del cuadro.
    principal: {
        gruposRequeridos: ['g-A-principal', 'g-B-principal', 'g-C-principal', 'g-D-principal'],
        cuartos: [
            ['1° Zona A', '2° Zona B'],
            ['1° Zona C', '2° Zona D'],
            ['1° Zona B', '2° Zona A'],
            ['1° Zona D', '2° Zona C']
        ]
    },
    // Quemados: Zona A (mejores 3) + Zona B (mejores 2) + Zona C (mejores 2)
    // + el mejor 3° entre B y C = 8 clasificados. Todos los cruces son entre zonas distintas.
    quemados: {
        gruposRequeridos: ['g-A-quemados', 'g-B-quemados', 'g-C-quemados'],
        cuartos: [
            ['1° Zona A', 'Mejor 3° entre Zonas B y C'],
            ['2° Zona B', '2° Zona C'],
            ['1° Zona B', '3° Zona A'],
            ['1° Zona C', '2° Zona A']
        ]
    }
};

const CANTIDAD_CANCHAS = 3;

// Reparte todos los partidos de las zonas en la menor cantidad de fechas
// posible: hasta 3 canchas por fecha y ningún equipo juega dos veces en la
// misma fecha. En cada fecha ubica primero los partidos cuyos equipos tienen
// más partidos pendientes (los más "urgentes"), para no dejar canchas libres.
function armarCalendario(partidos) {
    const pendientes = partidos.slice();
    const fechas = [];

    while (pendientes.length > 0) {
        const gradoPendiente = {};
        pendientes.forEach(partido => {
            gradoPendiente[partido.local] = (gradoPendiente[partido.local] || 0) + 1;
            gradoPendiente[partido.visitante] = (gradoPendiente[partido.visitante] || 0) + 1;
        });

        const fecha = [];
        const equiposUsados = new Set();

        while (fecha.length < CANTIDAD_CANCHAS) {
            let mejorIndice = -1;
            let mejorPeso = -1;

            for (let i = 0; i < pendientes.length; i += 1) {
                const partido = pendientes[i];

                if (equiposUsados.has(partido.local) || equiposUsados.has(partido.visitante)) {
                    continue;
                }

                const peso = gradoPendiente[partido.local] + gradoPendiente[partido.visitante];

                if (peso > mejorPeso) {
                    mejorPeso = peso;
                    mejorIndice = i;
                }
            }

            if (mejorIndice === -1) {
                break;
            }

            const partido = pendientes[mejorIndice];
            fecha.push(partido);
            equiposUsados.add(partido.local);
            equiposUsados.add(partido.visitante);
            pendientes.splice(mejorIndice, 1);
        }

        fechas.push(fecha);
    }

    return fechas;
}

function renderFixtures(nombreSorteo) {
    const sorteo = sorteos[nombreSorteo];
    const contenedor = document.getElementById(`fixture-${nombreSorteo}`);

    if (!contenedor) {
        return;
    }

    contenedor.innerHTML = '';

    const titulo = document.createElement('h3');
    titulo.textContent = 'Calendario de partidos';
    contenedor.appendChild(titulo);

    const nota = document.createElement('p');
    nota.className = 'nota-fixture';
    nota.textContent = 'Cada zona juega todos contra todos una sola vez. Hay 3 canchas: en cada fecha se juegan hasta 3 partidos y ningún equipo juega dos veces en la misma fecha.';
    contenedor.appendChild(nota);

    // Reúne los partidos de todas las zonas en una sola lista.
    const partidos = [];
    sorteo.grupos.forEach((grupo, indiceGrupo) => {
        generarCalendarioZona(grupo.ocupantes).forEach(ronda => {
            ronda.forEach(par => {
                partidos.push({ zona: indiceGrupo + 1, local: par[0], visitante: par[1] });
            });
        });
    });

    if (partidos.length === 0) {
        const vacio = document.createElement('div');
        vacio.className = 'fixture-empty';
        vacio.textContent = 'Los partidos aparecerán cuando las zonas tengan al menos 2 equipos.';
        contenedor.appendChild(vacio);
        return;
    }

    const fechas = armarCalendario(partidos);

    const grilla = document.createElement('div');
    grilla.className = 'fixture-grid';

    fechas.forEach((fecha, indiceFecha) => {
        const tarjeta = document.createElement('div');
        tarjeta.className = 'fixture-round';

        const encabezado = document.createElement('h4');
        encabezado.textContent = `Fecha ${indiceFecha + 1}`;
        tarjeta.appendChild(encabezado);

        fecha.forEach((partido, indiceCancha) => {
            const fila = document.createElement('div');
            fila.className = 'fixture-match cancha-' + (indiceCancha + 1);
            fila.innerHTML = `<div class="fixture-equipos"><span class="equipo">${partido.local}</span><span class="vs">vs</span><span class="equipo">${partido.visitante}</span></div><span class="fixture-tag">Cancha ${indiceCancha + 1} · Zona ${partido.zona}</span>`;
            tarjeta.appendChild(fila);
        });

        grilla.appendChild(tarjeta);
    });

    contenedor.appendChild(grilla);
}

function renderLlaves(nombreSorteo) {
    const contenedor = document.getElementById(`llaves-${nombreSorteo}`);

    if (!contenedor) {
        return;
    }

    const config = llavesConfig[nombreSorteo];

    contenedor.innerHTML = '';

    if (!config) {
        return;
    }

    const titulo = document.createElement('h3');
    titulo.textContent = 'Fase final';
    contenedor.appendChild(titulo);

    const nota = document.createElement('p');
    nota.className = 'nota-fixture';
    let textoNota = 'Los cuartos cruzan las zonas: el 1° de una zona juega contra un clasificado de otra, nunca contra alguien de su propia zona. Los nombres se completan al terminar la fase de zonas.';

    if (nombreSorteo === 'quemados') {
        textoNota += ' El "Mejor 3°" es el mejor tercero entre las Zonas B y C: se compara el 3° de B con el 3° de C y clasifica el mejor de los dos.';
    }

    nota.textContent = textoNota;
    contenedor.appendChild(nota);

    const cuartos = config.cuartos.map((partido, indice) => ({
        etiqueta: `Cuartos ${indice + 1}`,
        local: partido[0],
        visitante: partido[1]
    }));

    const rondas = [
        {
            titulo: 'Cuartos de final',
            partidos: cuartos
        },
        {
            titulo: 'Semifinales',
            partidos: [
                { etiqueta: 'Semi 1', local: 'Ganador Cuartos 1', visitante: 'Ganador Cuartos 2' },
                { etiqueta: 'Semi 2', local: 'Ganador Cuartos 3', visitante: 'Ganador Cuartos 4' }
            ]
        },
        {
            titulo: 'Final',
            partidos: [
                { etiqueta: 'Final', local: 'Ganador Semi 1', visitante: 'Ganador Semi 2' }
            ]
        },
        {
            titulo: '3er puesto',
            partidos: [
                { etiqueta: '3er puesto', local: 'Perdedor Semi 1', visitante: 'Perdedor Semi 2' }
            ]
        }
    ];

    const grilla = document.createElement('div');
    grilla.className = 'fixture-grid';

    rondas.forEach(fase => {
        const tarjeta = document.createElement('div');
        tarjeta.className = 'fixture-round';

        const encabezado = document.createElement('h4');
        encabezado.textContent = fase.titulo;
        tarjeta.appendChild(encabezado);

        fase.partidos.forEach(partido => {
            const fila = document.createElement('div');
            fila.className = 'fixture-match';
            fila.innerHTML = `<div class="fixture-equipos"><span class="equipo">${partido.local}</span><span class="vs">vs</span><span class="equipo">${partido.visitante}</span></div><span class="fixture-tag">${partido.etiqueta}</span>`;
            tarjeta.appendChild(fila);
        });

        grilla.appendChild(tarjeta);
    });

    contenedor.appendChild(grilla);
}

function intercambiarConGrupoIzquierdo(sorteo, equipo) {
    const grupoOrigen = sorteo.grupos.find(grupo => grupo.ocupantes.length > 0);

    if (!grupoOrigen) {
        return null;
    }

    const equipoIntercambiado = grupoOrigen.ocupantes.pop();
    const listaOrigen = document.getElementById(grupoOrigen.id);
    const liIntercambiado = listaOrigen.lastElementChild;

    if (liIntercambiado) {
        liIntercambiado.remove();
    }

    const li = document.createElement('li');
    li.textContent = sorteo.icono + ' ' + equipo.nombre;
    listaOrigen.appendChild(li);
    grupoOrigen.ocupantes.push(equipo);

    return {
        grupo: grupoOrigen,
        equipo,
        equipoIntercambiado,
        li,
        liIntercambiado
    };
}

const sorteos = {
    principal: {
        pool: crearEquipos(),
        grupos: [
            { id: 'g-A-principal', max: 4, ocupantes: [] },
            { id: 'g-B-principal', max: 4, ocupantes: [] },
            { id: 'g-C-principal', max: 4, ocupantes: [] },
            { id: 'g-D-principal', max: 3, ocupantes: [] }
        ],
        historial: [],
        mensajeId: 'mensaje-principal',
        btnSortearId: 'btn-sortear-principal',
        btnDeshacerId: 'btn-deshacer-principal',
        icono: '🏐',
        poolListId: 'pool-principal',
        poolVacioTexto: 'No quedan equipos'
    },
    quemados: {
        pool: crearEquiposQuemados(),
        grupos: [
            { id: 'g-A-quemados', max: 5, ocupantes: [] },
            { id: 'g-B-quemados', max: 4, ocupantes: [] },
            { id: 'g-C-quemados', max: 4, ocupantes: [] }
        ],
        historial: [],
        mensajeId: 'mensaje-quemados',
        btnSortearId: 'btn-sortear-quemados',
        btnDeshacerId: 'btn-deshacer-quemados',
        icono: '🔥',
        poolListId: 'pool-quemados',
        poolVacioTexto: 'No quedan equipos'
    },
    carrera100: {
        pool: crearEquiposB100(),
        grupos: [
            { id: 'g-Z1-100', max: 5, ocupantes: [] },
            { id: 'g-Z2-100', max: 4, ocupantes: [] }
        ],
        historial: [],
        mensajeId: 'mensaje-carrera100',
        btnSortearId: 'btn-sortear-100',
        btnDeshacerId: 'btn-deshacer-100',
        icono: '🏃',
        poolListId: 'pool-carrera100',
        poolVacioTexto: 'No quedan equipos'
    },
    carrera400: {
        pool: crearEquiposB400(),
        grupos: [
            { id: 'g-Z1-400', max: 5, ocupantes: [] },
            { id: 'g-Z2-400', max: 4, ocupantes: [] }
        ],
        historial: [],
        mensajeId: 'mensaje-carrera400',
        btnSortearId: 'btn-sortear-400',
        btnDeshacerId: 'btn-deshacer-400',
        icono: '🏃',
        poolListId: 'pool-carrera400',
        poolVacioTexto: 'No quedan equipos'
    }
};

const configuracionesSorteo = {
    principal: {
        crearPool: crearEquipos,
        grupos: [
            { id: 'g-A-principal', max: 4 },
            { id: 'g-B-principal', max: 4 },
            { id: 'g-C-principal', max: 4 },
            { id: 'g-D-principal', max: 3 }
        ]
    },
    quemados: {
        crearPool: crearEquiposQuemados,
        grupos: [
            { id: 'g-A-quemados', max: 5 },
            { id: 'g-B-quemados', max: 4 },
            { id: 'g-C-quemados', max: 4 }
        ]
    },
    carrera100: {
        crearPool: crearEquiposB100,
        grupos: [
            { id: 'g-Z1-100', max: 5 },
            { id: 'g-Z2-100', max: 4 }
        ]
    },
    carrera400: {
        crearPool: crearEquiposB400,
        grupos: [
            { id: 'g-Z1-400', max: 5 },
            { id: 'g-Z2-400', max: 4 }
        ]
    }
};

function renderPool(nombreSorteo) {
    const sorteo = sorteos[nombreSorteo];
    const lista = document.getElementById(sorteo.poolListId);

    lista.innerHTML = "";

    if (sorteo.pool.length === 0) {
        const vacio = document.createElement("li");
        vacio.textContent = sorteo.poolVacioTexto;
        vacio.className = "pool-vacio";
        lista.appendChild(vacio);
        return;
    }

    sorteo.pool.forEach(equipo => {
        const item = document.createElement("li");
        item.textContent = equipo.nombre;
        lista.appendChild(item);
    });
}

function actualizarControles(nombreSorteo) {
    const sorteo = sorteos[nombreSorteo];
    document.getElementById(sorteo.mensajeId).textContent = "Equipos restantes: " + sorteo.pool.length;
    document.getElementById(sorteo.btnSortearId).disabled = sorteo.pool.length === 0;
    document.getElementById(sorteo.btnDeshacerId).disabled = sorteo.historial.length === 0;
    renderPool(nombreSorteo);
    renderFixtures(nombreSorteo);
    renderLlaves(nombreSorteo);
}

function reiniciarSorteo(nombreSorteo) {
    const sorteo = sorteos[nombreSorteo];
    const configuracion = configuracionesSorteo[nombreSorteo];

    sorteo.pool = configuracion.crearPool();
    sorteo.grupos = configuracion.grupos.map(grupo => ({ id: grupo.id, max: grupo.max, ocupantes: [] }));
    sorteo.historial = [];

    sorteo.grupos.forEach(grupo => {
        const ul = document.getElementById(grupo.id);
        ul.innerHTML = "";
    });

    actualizarControles(nombreSorteo);
}

function sortearUno(nombreSorteo) {
    const sorteo = sorteos[nombreSorteo];

    if (sorteo.pool.length === 0) {
        actualizarControles(nombreSorteo);
        return;
    }

    const equipo = sorteo.pool[0];
    const gruposConEspacio = sorteo.grupos.filter(g => g.ocupantes.length < g.max);
    const gruposDisponibles = gruposConEspacio.filter(g =>
        g.ocupantes.length < g.max &&
        !g.ocupantes.some(o => o.ruca === equipo.ruca)
    );

    if (gruposDisponibles.length === 0 && gruposConEspacio.length > 0) {
        const intercambio = intercambiarConGrupoIzquierdo(sorteo, equipo);

        if (!intercambio) {
            alert("Error: No se pudo intercambiar a " + equipo.nombre + ". ¡Reintentando el sorteo!");
            location.reload();
            return;
        }

        sorteo.historial.push({ tipo: 'swap', ...intercambio });
        sorteo.pool.shift();
        sorteo.pool.unshift(intercambio.equipoIntercambiado);
        actualizarControles(nombreSorteo);
        return;
    }

    if (gruposDisponibles.length === 0) {
        alert("Error: No se pudo colocar a " + equipo.nombre + " sin repetir Ruca. ¡Reintentando el sorteo!");
        location.reload();
        return;
    }

    const grupo = gruposDisponibles[Math.floor(Math.random() * gruposDisponibles.length)];
    const ul = document.getElementById(grupo.id);
    const li = document.createElement("li");
    li.textContent = sorteo.icono + " " + equipo.nombre;

    grupo.ocupantes.push(equipo);
    ul.appendChild(li);
    sorteo.historial.push({ equipo, grupo, li });
    sorteo.pool.shift();

    actualizarControles(nombreSorteo);
}

function deshacerUltimo(nombreSorteo) {
    const sorteo = sorteos[nombreSorteo];

    if (sorteo.historial.length === 0) {
        actualizarControles(nombreSorteo);
        return;
    }

    const ultimo = sorteo.historial.pop();

    if (ultimo.tipo === 'swap') {
        const indiceIntercambiado = ultimo.grupo.ocupantes.lastIndexOf(ultimo.equipo);

        if (indiceIntercambiado !== -1) {
            ultimo.grupo.ocupantes.splice(indiceIntercambiado, 1);
        }

        if (ultimo.li) {
            ultimo.li.remove();
        }

        if (ultimo.equipoIntercambiado) {
            ultimo.grupo.ocupantes.push(ultimo.equipoIntercambiado);
            const liRestaurado = document.createElement('li');
            liRestaurado.textContent = sorteo.icono + ' ' + ultimo.equipoIntercambiado.nombre;
            document.getElementById(ultimo.grupo.id).appendChild(liRestaurado);
        }

        const indicePool = sorteo.pool.findIndex(equipo => equipo === ultimo.equipoIntercambiado);

        if (indicePool !== -1) {
            sorteo.pool.splice(indicePool, 1);
        }

        sorteo.pool.unshift(ultimo.equipo);
        actualizarControles(nombreSorteo);
        return;
    }

    const indice = ultimo.grupo.ocupantes.lastIndexOf(ultimo.equipo);

    if (indice !== -1) {
        ultimo.grupo.ocupantes.splice(indice, 1);
    }

    ultimo.li.remove();
    sorteo.pool.unshift(ultimo.equipo);

    actualizarControles(nombreSorteo);
}

actualizarControles('principal');
actualizarControles('quemados');
actualizarControles('carrera100');
actualizarControles('carrera400');
