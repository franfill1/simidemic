
function shuffle(arr)
{
    for (var i = 0; i < arr.length; i++)
    {
        var j = Math.floor(Math.random() * (arr.length - i))+i;
        var temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
}

class person {
    constructor(dataC, epidI, reg) {
        /*
        person(dataC, epidI)
    
        oggetto che rappresenta una persona nella simulazione
        possiede una posizione (x,y) nella griglia di persone presente nella simulazione e uno stato, che identifica se è suscettibile, infetta, rimossa o morta
    
        this.x => posizione x della persona nel canvas della simulazione
        this.y => posizione y della persona nel canvas della simulazione
        this.vX => velocità x della persona
        this.vY => velocità y della persona
        this.status => identifica lo stato della persona basato sul modello SIR (suscectible, infected, removed), questo attributo viene cambiato da funzioni esterne
        this.pulseRadius => raggio della pulsazione che viene emessa al momento dell'infezione
        this.timeSinceInfection => tempo passato dall'infezione
        this.dataCollector => oggetto in cui verrano salvati i dati raccolti durante la simulazione
        this.epidemicInfo => oggetto che contiene i dati relativi all'epidemia, come durata e probabilità di morte
        */
        this.x = 0;
        this.y = 0;
        this.vX = 0;
        this.vY = 0;
        this.accX = 0;
        this.accY = 0;
        this.travelling = false;
        this.region = reg;

        this.status = 0; //0 = sano, 1 = incubante, 2 = infetto, 3 = asintomatico, 4 = rimosso, 5 = morto
        this.pulseRadius = 0;
        this.timeSinceInfection = 0;

        this.dataCollector = dataC;
        this.epidemicInfo = epidI;
    }

    reset() {
        this.status = 0;
        this.pulseRadius = 0;
        this.timeSinceInfection = 0;
        this.travelling = false;
        var direction = Math.random() * 2 * Math.PI;
        this.accX = Math.cos(direction);
        this.accY = Math.sin(direction);
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
        if (this.status == 1) 
        {
            if (Math.random() < this.epidemicInfo.asympProb)
            {
                this.status = 3;
            }
            else
            {
                this.status = 2;
            }
        }
        else if (this.status == 2 || this.status == 3) {
            this.timeSinceInfection++;
            if (this.timeSinceInfection >= this.epidemicInfo.infectionSpan) {
                this.dataCollector.nInfected--;
                if (Math.random() < this.epidemicInfo.deathIndex) {
                    this.dataCollector.nDead++;
                    this.status = 5;
                }

                else {
                    this.dataCollector.nRecovered++;
                    this.status = 4;
                }
            }
        }
    };

    updatePosition() {
        this.rescaleAcceleration();
        this.randomTurn();
        this.vX += this.accX;
        this.vY += this.accY;

        if (this.travelling)
        {
            this.vX = this.region.getCenterX() - this.x;
            this.vY = this.region.getCenterY() - this.y;
        }

        this.rescaleSpeed();
        this.x += this.vX;
        this.y += this.vY;

        var dx = this.x - this.region.getCenterX();
        var dy = this.y - this.region.getCenterY();

        var d = Math.sqrt(dx * dx + dy * dy);

        if (this.travelling && d < 10) 
        {
            this.travelling = false;
            this.vX = this.accX / params.person.acceleration * params.person.speed;
            this.vY = this.accY / params.person.acceleration * params.person.speed;
            if (!this.region.isQuarantine)
            {
                this.dataCollector.nTravelling--;
            }
        }
    };

    travel()
    {
        /*
        this.travel() => void

        Inizia a viaggiare verso il centro della propria regione
        */
       this.travelling = true;
       if (!this.region.isQuarantine)
       {
           this.dataCollector.nTravelling++;
       }
    }

    rescaleAcceleration() {
        /*
        this.rescaleAcceleration() => void

        Porta la accelerazione ad esattamente params.person.acceleration, mantenendo le proporzioni
        */
        var a = Math.sqrt(this.accX * this.accX + this.accY * this.accY);
        this.accX *= params.person.acceleration / a;
        this.accY *= params.person.acceleration / a;
    };

    randomTurn() {
        /*
        this.randomTurn() => void
        Ruota il vettore accelerazione di un angolo compreso fra (params.person.angle) e (-params.person.angle)
        */
        var angle = Math.random() * 2 * params.person.angle - params.person.angle;
        var temp1 = this.accX * Math.cos(angle) - this.accY * Math.sin(angle);
        var temp2 = this.accX * Math.sin(angle) + this.accY * Math.cos(angle);
        this.accX = temp1;
        this.accY = temp2;
    };

    rescaleSpeed() {
        /*
        this.rescalespeed() => void

        Porta la velocità ad un massimo di params.person.speed, mantenendo le proporzioni
        */
        var v = Math.sqrt(this.vX * this.vX + this.vY * this.vY);
        if (this.travelling)
        {
            this.vX *= params.person.travellingSpeed / v;
            this.vY *= params.person.travellingSpeed / v;
        }
        else if (v > params.person.speed) {
            this.vX = this.vX * params.person.speed / v;
            this.vY = this.vY * params.person.speed / v;
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
        if (this.status != 5)
        {
            const suscectibleColor = params.person.colors.suscectible;
            const infectedColor = params.person.colors.infected;
            const asympColor = params.person.colors.asymptomatic;
            const removedColor = params.person.colors.removed;
            const deadColor = params.person.colors.dead;
            const pulseColor = params.person.colors.pulse;
            const radius = params.person.radius;
            
            var ctx = canvas.getContext("2d");

            ctx.fillStyle = [suscectibleColor, infectedColor, infectedColor, asympColor, removedColor, deadColor][this.status];


            ctx.beginPath();
            ctx.arc(this.x, this.y, radius, 0, 2 * Math.PI);
            ctx.fill();

            var pulseBeginFade = params.person.pulse.beginFade;
            var pulseFinal = params.person.pulse.final;
            var pulseIncrement = params.person.pulse.increment;

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
        }
    };
}

class region {
    /*
    region(nBound, sBound, eBound, wBound)
    oggetto che contiene i dati relativi a una delle regioni rettangolari nelle quali è suddivisa la mappa
    
    this.northBound => coordinata y del lato nord della regione (minore di this.southBound)
    this.southBound => coordinata y del lato sut della regione
    this.westBound => coordinata x del lato ovest della regione (minore di this.eastBound)
    this.eastBound => coordinata x del lato est della regione
    this.population => array contenente tutte le persone che vivono nella regione
    this.epidemicInfo => oggetto contenente i dati relativi all'epidemia
    this.collectedData => oggetto contenente i dati del contagio attuali
    this.isQuarantine => valore booleano che indica se la regione è una regione per la quarantena
    */
    constructor(nBound, sBound, wBound, eBound, N, epidemicI, collectedD, isQ) 
    {
        this.northBound = nBound;
        this.southBound = sBound;
        this.westBound = wBound;
        this.eastBound = eBound;
        this.epidemicInfo = epidemicI;  
        this.collectedData = collectedD;
        this.peopleList = [];
        this.isQuarantine = isQ;
        for (var i = 0; i < N; i++)
        {
            this.peopleList[i] = new person(this.collectedData, this.epidemicInfo, this)
        }
 
        this.disposePeople();
    }

    reset() 
    {
        /*
        this.reset() => void
        Rende tutte le persone nella griglia (this.grid)
        */
        for (var i = 0; i < this.peopleList.length; i++) 
        {
            this.peopleList[i].reset();
        }
        this.disposePeople();
    };

    disposePeople()
    {
        /*
        this.disposePeople() => void
        Allinea tutte le persone a una griglia immaginaria
        */
        var R = Math.ceil(Math.sqrt(this.peopleList.length));
        var pos = Array.from(Array(R*R).keys());
        for (var i = 0; i < this.peopleList.length; i++)
        {
            var p = this.peopleList[i];
            var j = Math.floor(Math.random() * pos.length);
            p.x = this.westBound + (pos[j] % R + 1) * (this.eastBound - this.westBound) / (R+1);
            p.y = this.northBound + (Math.floor(pos[j] / R) + 1) * (this.southBound - this.northBound) / (R+1);
            var direction = Math.random() * Math.PI * 2;
            p.vX = p.accX = Math.cos(direction);
            p.vY = p.accY = Math.sin(direction);
            pos.splice(j, 1);
        }
    }

    draw(canvas) 
    {
        /*
        this.draw(canvas) => void
        Disegna un rettangolo che rappresenta la regione, in base ai suoi confini
        Chiama la funzione person.updateSprite per tutte le persone della regione

        input:
        canvas => il canvas sul quale va disegnata la regione
        */
        var ctx = canvas.getContext("2d");
        ctx.strokeStyle = params.region.colors.edges;
        if (this.isQuarantine)
        {
            ctx.strokeStyle = params.region.colors.quarantineEdges;
        }
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.rect(this.westBound, this.northBound, this.eastBound - this.westBound, this.southBound - this.northBound);
        ctx.stroke();
        
        for (var i = 0; i < this.peopleList.length; i++)
        {
            this.peopleList[i].updateSprite(canvas);
        }
    };

    simulateMovement() 
    {
        /*
        this.simulateMovement() => void
        chiama la funzione fixCollisions e poi muove tutte le persone chiamedo la funzione updatePosition per ciascuna di esse
        */
        this.fixCollisions();
        for (var i = 0; i < this.peopleList.length; i++) {
            this.peopleList[i].updatePosition();
            if (!this.peopleList[i].travelling)
            {
                this.peopleList[i].x = Math.max(this.westBound+1, Math.min(this.peopleList[i].x, this.eastBound - 1));
                this.peopleList[i].y = Math.max(this.northBound+1, Math.min(this.peopleList[i].y, this.southBound - 1));
            }
        }
    };

    fixCollisions() 
    {
        /*
        this.fixCollisions() => void
        per ogni persona, fa in modo che rispetti il distanziamento sociale e che non si avvicini ai bordi dell'area
        */
        for (var i = 0; i < this.peopleList.length; i++) {
            const factor = this.epidemicInfo.socialDistancing;
            const borderFactor = 10;
            var p = this.peopleList[i];
            if (p.x - this.westBound < borderFactor) {
                p.accX += 1 / (p.x - this.westBound);
            }
            if (p.y - this.northBound < borderFactor) {
                p.accY += 1 / (p.y - this.northBound);
            }
            if (this.eastBound - p.x < borderFactor) {
                p.accX -= 1 / (this.eastBound - p.x);
            }
            if (this.southBound - p.y < borderFactor) {
                p.accY -= 1 / (this.southBound - p.y);
            }
            if (i < this.peopleList.length * this.epidemicInfo.respectfullness)
            {
                for (var j = 0; j < this.peopleList.length; j++) {
                    if (i != j && this.peopleList[j].status != 5) {
                        var oth = this.peopleList[j];
                        var dx = (oth.x) - (p.x);
                        var dy = (oth.y) - (p.y);
                        var d = Math.sqrt(dx * dx + dy * dy);
                        if (d <= factor) {
                            //spingo p e oth in direzioni opposte
                            var alpha = Math.atan(dy / dx);
                            var fx = Math.abs(Math.cos(alpha)) * 1 / d;
                            var fy = Math.abs(Math.sin(alpha)) * 1 / d;
                            if (oth.x > p.x) {
                                p.vX -= fx;
                            }
                            else {
                                p.vX += fx;
                            }
                            if (oth.y > p.y) {
                                p.vY -= fy;
                            }
                            else {
                                p.vY += fy;
                            }
                        }
                    }
                }
            }
        }
    };

    simulateDay() 
    {
        /*
        this.simulateDay() => void
        Simula un giorno della simulazione
        Chiama la funzione this.infection() e la funzione person.liveDay() per ogni persona della simulazione
        */

        this.infection();
        for (var i = 0; i < this.peopleList.length; i++) 
        {
            this.peopleList[i].liveDay();
        }
    };

    infection() 
    {
        /*
        this.infection() => void
        Simula contatti e infezioni fra la popolazione nella regione, in base all'indice di infezione (this.index)
        */
        var radius = this.epidemicInfo.radius;
        for (var i = 0; i < this.peopleList.length; i++) {
            for (var j = 0; j < this.peopleList.length; j++) {
                var p1 = this.peopleList[i];
                var p2 = this.peopleList[j];
                if ((p1.status == 2 || p1.status == 3) && !p1.travelling && !p2.travelling) {
                    var dx = p1.x - p2.x, dy = p1.y - p2.y;
                    var dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist <= radius) {
                        this.peopleList[j].infect();
                    }
                }
            }
        }
    };

    infectArea(x, y, r) 
    {
        /*
        this.infectArea(x, y, r) => void
        Infetta un area circolare di centro {x, y} e raggio r
        */
        for (var i = 0; i < this.peopleList.length; i++) {
            var p = this.peopleList[i];
            var dx = p.x - x;
            var dy = p.y - y;
            var d = Math.sqrt(dx * dx + dy * dy);
            if (d < r) {
                p.infect();
            }
        }
    };

    getCenterX()
    {
        /*
        this.getCenterX() => int
        Ritorna la coordinata x del centro della regione
        */
       return (this.westBound + this.eastBound) / 2;
    }
    getCenterY()
    {
        /*
        this.getCenterY() => int
        Ritorna la coordinata Y del centro della regione
        */
       return (this.northBound + this.southBound) / 2;
    }
}

class simulation 
{
    /*
    simulation(canvasId, R, C)
    oggetto che si occupa di gestire l'intera simulazione, a intervalli scanditi esternamente
    possiede una matrice che rappresenta una griglia di persone, disposte come verranno visualizzate sullo schermo,
    un canvas associato, e un indice di infezione

    this.grid => matrice che contiene le persone (this.grid[r][c] => oggetto di tipo person, persona che si trova nella riga r e colonna c)
    this.canvas => canvas sul quale vanno disegnate le persone
    this.index => indice di infezione dell'epidemia simulata
    this.radius => raggio di infezione dell'epidemia simulata
    this.collectedData => oggetto che contiene i dati raccolti durante la simulazione
    this.epidemicInfo => oggetto che contiene i dati dell'epidemia, che possono variare col tempo
    this.regionList => array contenente tutte le regioni della simulazione
    this.hasQuarantine => valore boleano che indica se è presente una regione per la quarantena
    */
    constructor(canvasId, NR, NP, hasQ) 
    {
        /*
        this.init() => void
        Inizializza gli attributi dell'oggetto, basandosi sui valori di default e sugli input inseriti durante la creazione dell'oggetto
        i valori in input di R e C vengono copiati negli appositi attributi (this.R e this.C), in modo che possano essere letti e modificati anche dall'esterno
        La griglia (this.grid) viene ridimensionata per avere R righe e C colonne
        Il canvas viene inizializzato in base all'id passato in input
        Il numero di persone infette (this.infectedN) viene inizializzato a 0
        Input:
        canvasId => id del canvas da associare, nel documento HTML
        NR => numero di regioni
        NC => numero di persone in totale
        */

        this.collectedData =
        {
            nInfected: 0,
            nRecovered: 0,
            nDead: 0,
            nTravelling: 0,
            reset: function () {
                this.nInfected = 0;
                this.nRecovered = 0;
                this.nDead = 0;
                this.nTravelling = 0;
            }
        };

        this.epidemicInfo = //i seguenti valori vengono inizializzati a partire da parametri globali, ma possono essere variati
        {
            index: params.infection.defaultIndex,
            radius: params.infection.defaultRadius,
            infectionSpan: params.infection.defaultSpan,
            deathIndex: params.infection.defaultDeathIndex,
            socialDistancing: params.infection.defaultSocialDistancing,
            respectfullness: params.infection.defaultRespectfullness, //percentuale di persone rispettose delle norme di distanziamento
            asympMin: params.infection.defaultAsympMin,
            asympMax: params.infection.defaultAsympMax,
            asympProb : params.infection.defaultAsympProb,
        };

        this.canvas = document.getElementById(canvasId);
        this.canvas.width = 500;
        this.canvas.height = 500;

        this.hasQuarantine = hasQ;
        const R = Math.ceil(Math.sqrt(NR));
        var TR = R;
        const quarantineRatio = 0.4;
        if (this.hasQuarantine)
        {
            TR += quarantineRatio;
        }
        const regionWidth = this.canvas.width / (TR);
        const regionHeight = this.canvas.height / (TR);

        this.regionList = [];
        for (var i = 0; i < R && NR > 0; i++)
        {
            for (var j = 0; j < R && NR > 0; j++)
            {
                var r = new region(j * regionHeight + params.region.border, (j+1) * regionHeight - params.region.border, i * regionWidth + params.region.border, (i+1) * regionWidth - params.region.border, Math.ceil(NP/NR), this.epidemicInfo, this.collectedData, false);
                this.regionList[i*R+j] = r;
                NP -= Math.ceil(NP/NR);
                NR--;
            }
        }
        if (this.hasQuarantine)
        {
            const quarantineWidth = regionWidth * quarantineRatio;
            const quarantineHeight = regionHeight * quarantineRatio;
            this.qRegion = new region(this.canvas.height - quarantineHeight + params.region.border, this.canvas.height - params.region.border, this.canvas.width - quarantineWidth + params.region.border, this.canvas.width - params.region.border, 0, this.epidemicInfo, this.collectedData, true);
        }

        this.peopleList = [];
        for (var i = 0; i < this.regionList.length; i++)
        {
            var r = this.regionList[i];
            for (var j = 0; j < r.peopleList.length; j++)
            {
                this.peopleList[this.peopleList.length] = r.peopleList[j];
            }
        }
    }

    reset() 
    {
        /*
        this.reset() => void
        Rende tutte le persone nella griglia (this.grid), suscettibili, riportando i dati raccolti a 0
        */
        this.collectedData.reset();
        var NP = this.peopleList.length;
        var NR = this.regionList.length;
        var c = 0;
        for (var i = 0; i < NR; i++)
        {
            this.regionList[i].peopleList = [];
            for (var j = 0; j < Math.ceil(NP/(NR-i)); j++)
            {
                this.peopleList[c].region = this.regionList[i];
                this.regionList[i].peopleList[this.regionList[i].peopleList.length] = this.peopleList[c];
                c++;
            }
            NP -= Math.ceil(NP/(NR-i));
        }
        if (this.hasQuarantine)
        {
            this.qRegion.peopleList = [];
        }
        for (var i = 0; i < this.regionList.length; i++) {
            this.regionList[i].reset();
        }
    };

    draw() 
    {
        /*
        this.draw() => void
        Disegna la griglia di persone (this.grid) sul canvas (this.canvas), prima rimuovendo ciò che era già presente
        */
        this.canvas.getContext("2d").clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (var i = 0; i < this.regionList.length; i++) {
            this.regionList[i].draw(this.canvas);
        }
        if (this.hasQuarantine)
        {
            this.qRegion.draw(this.canvas);
        }
    };
    startEpidemic(Nregions, r)
    {
        /*
        this.startEpidemic(Nregions, r) => void
        Infetta le persone in Nregions regioni prese casualmente
        */
        var pos = Array.from(this.regionList.keys());
        for (var i = 0; i < Math.min(Nregions, this.regionList.length); i++)
        {
            var k = Math.floor(Math.random() * pos.length);
            var j = pos[k];
            pos.splice(k, 1);
            var reg = this.regionList[j];
            var dx = reg.eastBound - reg.westBound;
            var dy = reg.southBound - reg.northBound;
            reg.infectArea(reg.westBound + Math.random() * dx, reg.northBound + Math.random() * dy, r);
        }
    }
    simulateMovement()
    {
        for (var i = 0; i < this.regionList.length; i++)
        {
            this.regionList[i].simulateMovement();
        }
        if (this.hasQuarantine)
        {
            this.qRegion.simulateMovement();
        }
    }

    simulateDay()
    {
        /*
        this.simulateDay() => void
        Simula un giorno della simulazione, chiamando la stessa funzione per tutte le regioni e scegliendo alcune persone casuali per viaggiare
        */
        for (var i = 0; i < this.regionList.length; i++)
        {
            this.regionList[i].simulateDay();
        }
        if (this.hasQuarantine)
        {
            this.qRegion.simulateDay();
        }

        const asympMin = this.epidemicInfo.asympMin;
        const asympRandomSpan = this.epidemicInfo.asympMax - asympMin;
        if (this.hasQuarantine)
        {
            for (var i = 0; i < this.peopleList.length; i++)
            {
                var v = Math.random() * asympRandomSpan + asympMin;
                console.log(v);
                if (this.peopleList[i].region != this.qRegion && this.peopleList[i].status == 2 && this.peopleList[i].timeSinceInfection > v)
                {
                    var id = 0;
                    var r = this.peopleList[i].region;
                    while(r.peopleList[id] != this.peopleList[i])
                    {
                        id++;
                    }
                    r.peopleList.splice(id, 1);
                    var nr = this.qRegion;
                    this.peopleList[i].region = nr;
                    nr.peopleList[nr.peopleList.length] = this.peopleList[i];
                    this.peopleList[i].travel();
                }
            }
        }

        const maxT = params.infection.maxTravelling;
        const tProb = params.infection.travelProbability;
        var T = Math.min(this.peopleList.length, maxT) - this.collectedData.nTravelling;
        var pos = Array.from(this.peopleList.keys());
        while(T)
        {
            var j = Math.floor(Math.random() * pos.length);
            var i = pos[j];
            pos.splice(j, 1);
            if (!(this.peopleList[i].travelling))
            {
                T--;
                if (this.peopleList[i].region != this.qRegion && Math.random() < tProb)
                {
                    var id = 0;
                    var r = this.peopleList[i].region;
                    while(r.peopleList[id] != this.peopleList[i])
                    {
                        id++;
                    }
                    r.peopleList.splice(id, 1);
                    var nrId = Math.floor(Math.random()*this.regionList.length);
                    var nr = this.regionList[nrId];

                    this.peopleList[i].region = nr;
                    nr.peopleList[nr.peopleList.length] = this.peopleList[i];

                    this.peopleList[i].travel();
                }
            }
        }
    }
}