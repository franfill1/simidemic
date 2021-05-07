
class person {
    constructor(dataC, epidI) {
        /*
        person(dataC, epidI) => void
    
        oggetto che rappresenta una persona nella simulazione
        possiede una posizione (x,y) nella griglia di persone presente nella simulazione e uno stato, che identifica se è suscettibile, infetta, rimossa o morta
    
        this.x => posizione x della persona nel canvas della simulazione
        this.y => posizione y della persona nel canvas della simulazione
        this.status => identifica lo stato della persona basato sul modello SIR (suscectible, infected, removed), questo attributo viene cambiato da funzioni esterne
        this.pulseRadius => raggio della pulsazione che viene emessa al momento dell'infezione
        this.timeSinceInfection => tempo passato dall'infezione
        this.dataCollector => oggetto in cui verrano salvati i dati raccolti durante la simulazione
        this.epidemicInfo => oggetto che contiene i dati relativi all'epidemia, come durata e probabilità di morte
        */
        this.x = 0; //posizione x nel canvas
        this.y = 0; //posizione y nel canvas

        this.status = 0; //0 = sano, 1 = incubante, 2 = infetto, 3 = rimosso, 4 = morto
        this.pulseRadius = 0;
        this.timeSinceInfection = 0;
        this.dataCollector = dataC;
        this.epidemicInfo = epidI;
    }

    reset() {
        this.status = 0;
        this.pulseRadius = 0;
        this.timeSinceInfection = 0;
    };

    infect() {
        /*
        this.infect() => void
        rende la persona infetta, incrementando le statistiche sugli infetti
        */
        if (this.status == 0) {
            this.status = 1;
            this.dataCollector.nInfected++;
        }
    };

    liveDay() {
        /*
        this.liveDay() => void
        Fa passare un giorno per la persona,
        Ha effetto solo se la persona è infetta, e incrementa il contatore del tempo passato dall'infezione (this.timeSinceInfectio)
        Se quest'ultimo valore diventa maggiore della durata massima (this.epidemicInfo.infectionSpan) la persona guarisce o muore
        */
        if (this.status == 1) {
            this.status = 2;
        }
        else if (this.status == 2) {
            this.timeSinceInfection++;
            if (this.timeSinceInfection >= this.epidemicInfo.infectionSpan) {
                this.dataCollector.nInfected--;
                if (Math.random() < this.epidemicInfo.deathIndex) {
                    this.dataCollector.nDead++;
                    this.status = 4;
                }

                else {
                    this.dataCollector.nRecovered++;
                    this.status = 3;
                }
            }
        }
    };

    updateSprite(canvas) {
        /*
        this.updatesprite(canvas) => void

        Disegna un cerchio nel canvas, basandosi sulla posizione x e y
        Il colore del cerchio dipende dallo stato (this.status) della persona (suscettibile/infetta)
        Disegna anche una circonferenza il cui raggio dipende dal tempo passato dal raggio (this.pulseRadius) e incrementa quest'ultimo valore (siccome la funzione viene chiamata ogni frame)

        Input:
        canvas => il canvas sul quale verrà disegnato il cerchio
        */

        const suscectibleColor = params.person.colors.suscectible;
        const infectedColor = params.person.colors.infected;
        const removedColor = params.person.colors.removed;
        const deadColor = params.person.colors.dead;
        const pulseColor = params.person.colors.pulse;
        const radius = params.person.radius;

        var ctx = canvas.getContext("2d");

        ctx.fillStyle = [suscectibleColor, infectedColor, infectedColor, removedColor, deadColor][this.status];

        ctx.beginPath();
        ctx.arc(this.x, this.y, radius, 0, 2 * Math.PI);
        ctx.fill();

        const pulseBeginFade = params.person.pulse.beginFade;
        const pulseFinal = params.person.pulse.final;
        const pulseIncrement = params.person.pulse.increment;

        if (this.status == 2 && this.pulseRadius < pulseFinal) {
            if (this.pulseRadius > pulseBeginFade) {
                ctx.globalAlpha = 1 - (this.pulseRadius - pulseBeginFade) / (pulseFinal - pulseBeginFade);
            }
            ctx.strokeStyle = pulseColor;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.pulseRadius, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.globalAlpha = 1;
            this.pulseRadius += pulseIncrement;

            if (this.pulseRadius >= pulseFinal) {
                this.pulseRadius = Math.Infinity;
            }
        }
    };
}

class simulation {
    constructor(canvasId, Ri, Ci) {
        /*
        simulation(canvasId, R, C) => void
        oggetto che si occupa di gestire l'intera simulazione, a intervalli scanditi esternamente
        possiede una matrice che rappresenta una griglia di persone, disposte come verranno visualizzate sullo schermo,
        un canvas associato, e un indice di infezione
    
        this.grid => matrice che contiene le persone (this.grid[r][c] => oggetto di tipo person, persona che si trova nella riga r e colonna c)
        this.canvas => canvas sul quale vanno disegnate le persone
        this.index => indice di infezione dell'epidemia simulata
        this.radius => raggio di infezione dell'epidemia simulata
        this.R => righe presenti nella griglia
        this.C => colonne presenti nella griglia
        this.collectedData => oggetto che contiene i dati raccolti durante la simulazione
        this.epidemicInfo => oggetto che contiene i dati dell'epidemia, che possono variare col tempo
    
        Input:
        canvasId => id del canvas da associare, nel documento HTML
        Ri => numero di righe della griglia da creare
        Ci => numero di colonne della griglia da creare
        */
        /*
        this.init() => void
        Inizializza gli attributi dell'oggetto, basandosi sui valori di default e sugli input inseriti durante la creazione dell'oggetto
        i valori in input di R e C vengono copiati negli appositi attributi (this.R e this.C), in modo che possano essere letti e modificati anche dall'esterno
        La griglia (this.grid) viene ridimensionata per avere R righe e C colonne
        Il canvas viene inizializzato in base all'id passato in input
        Il numero di persone infette (this.infectedN) viene inizializzato a 0
        */
        this.R = Ri;
        this.C = Ci;

        this.collectedData =
        {
            nInfected: 0,
            nRecovered: 0,
            nDead: 0,
            reset: function () {
                this.nInfected = 0;
                this.nRecovered = 0;
                this.nDead = 0;
            }
        };

        this.epidemicInfo = //i seguenti valori vengono inizializzati a partire da parametri globali, ma possono essere variati
        {
            index: params.infection.defaultIndex,
            radius: params.infection.defaultRadius,
            infectionSpan: params.infection.defaultSpan,
            deathIndex: params.infection.defaultDeathIndex, //probabilità di morte alla fine dell'arco dell'infezione
        };

        this.canvas = document.getElementById(canvasId);
        this.canvas.width = 500;
        this.canvas.height = 500;

        this.grid = [];
        for (var i = 0; i < this.R; i++) {
            var row = [];
            for (var j = 0; j < this.C; j++) {
                row.push(new person(this.collectedData, this.epidemicInfo));
                row[j].x = (j + 1) * (this.canvas.width / (this.R + 1));
                row[j].y = (i + 1) * (this.canvas.height / (this.C + 1));
            }
            this.grid.push(row);
        }
    };

    draw() {
        /*
        this.draw() => void
        Disegna la griglia di persone (this.grid) sul canvas (this.canvas), prima rimuovendo ciò che era già presente
        */
        this.canvas.getContext("2d").clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (var i = 0; i < this.R; i++) {
            for (var j = 0; j < this.C; j++) {
                this.grid[i][j].updateSprite(this.canvas, this.R, this.C);
            }
        }
    };

    reset = function () {
        /*
        this.reset() => void
        Rende tutte le persone nella griglia (this.grid), suscettibili, riportando i dati raccolti a 0
        */
        this.collectedData.reset();
        for (var i = 0; i < this.R; i++) {
            for (var j = 0; j < this.C; j++) {
                this.grid[i][j].reset();
            }
        }
    };

    deathIndexChanger = function () {
        //La mortalità viene cambiata simulando un sovraccarico ospedaliero 
        var act = this.collectedData.nInfected / gra.dataMax;
        var act2 = act * act;
        var num = this.epidemicInfo.deathIndex + (act2 * act2);
        var den = 1.0 + (act2 * act2);
        this.epidemicInfo.deathIndex = num / den;
        document.getElementById("actualDeatProbValue").innerHTML = this.epidemicInfo.deathIndex.toPrecision(2);
    };

    simulateDay() {
        /*
        this.simulateDay() => void
        Simula un giorno della simulazione
        Viene aggioranata la mortalità nel caso sia richiesto
        Chiama la funzione this.infection(), this.DeathIndexChanger() e la funzione person.liveDay() per ogni persona della simulazione
        */
        if (params.infection.deathIndexChange)
            this.deathIndexChanger();

        this.infection();
        for (var i = 0; i < this.R; i++) {
            for (var j = 0; j < this.C; j++) {
                this.grid[i][j].liveDay();
            }
        }
    };

    infection = function () {
        /*
        this.infection() => void
        Simula contatti e infezioni fra la popolazione nella griglia (this.grid), in base all'indice di infezione (this.index)
        Se la persona contrassegnata da una X è infetta, le persone contrassegnate da 0 hanno probabilità pari all'indice (this.index) di infettarsi
        */
        var toInfect = [];
        var radius = this.epidemicInfo.radius;
        var totEnc = 0;
        for (var i = -radius; i <= radius; i++) {
            temp = Math.floor(Math.sqrt(radius * radius - i * i));
            totEnc += temp * 2 + 1;
        }
        for (var i = 0; i < this.R; i++) {
            for (var j = 0; j < this.C; j++) {
                if (this.grid[i][j].status == 2) {
                    var imin = Math.max(i - radius, 0), imax = Math.min(i + radius, this.R - 1);
                    for (var ni = imin; ni <= imax; ni++) {
                        var temp = Math.floor(Math.sqrt(radius * radius - (ni - i) * (ni - i)));
                        var jmin = Math.max(j - temp, 0), jmax = Math.min(j + temp, this.C - 1);
                        for (var nj = jmin; nj <= jmax; nj++) {
                            if (!this.grid[ni][nj].status) {
                                if (Math.random() < (this.epidemicInfo.index / totEnc)) {
                                    toInfect.push(this.grid[ni][nj]);
                                }
                            }
                        }
                    }
                }
            }
        }

        for (var i = 0; i < toInfect.length; i++) {
            toInfect[i].infect();
        }
    };
}