
function person(dataC, epidI)
{
    /*
    person(dataC, epidI) => void

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
    this.tX = 0;
    this.tY = 0;
    this.travelling = false;

    this.status = 0; //0 = sano, 1 = incubante, 2 = infetto, 3 = rimosso, 4 = morto
    this.pulseRadius = 0;
    this.timeSinceInfection = 0;
    this.dataCollector = dataC;
    this.epidemicInfo = epidI;

    const suscectibleColor = params.person.colors.suscectible;
    const infectedColor = params.person.colors.infected;
    const removedColor = params.person.colors.removed;
    const deadColor = params.person.colors.dead;
    const pulseColor = params.person.colors.pulse;
    const radius = params.person.radius;

    this.reset = function()
    {
        this.status = 0;
        this.pulseRadius = 0;
        this.timeSinceInfection = 0;
        this.travelling = false;
    }

    this.infect = function()
    {
        /*
        this.infect() => void
        rende la persona infetta, incrementando le statistiche sugli infetti
        */
       if (this.status == 0)
       {
           this.status = 1;
           this.dataCollector.nInfected++;
       }
    }

    this.liveDay = function()
    {
        /*
        this.liveDay() => void
        Fa passare un giorno per la persona, 
        Ha effetto solo se la persona è infetta, e incrementa il contatore del tempo passato dall'infezione (this.timeSinceInfectio)
        Se quest'ultimo valore diventa maggiore della durata massima (this.epidemicInfo.infectionSpan) la persona guarisce o muore
        */
        if (this.status == 1)
        {
            this.status = 2;
        }
        else if (this.status == 2)
        {
            this.timeSinceInfection++;
            if (this.timeSinceInfection >= this.epidemicInfo.infectionSpan)
            {
                this.dataCollector.nInfected--;
                if (Math.random() < this.epidemicInfo.deathIndex)
                {
                    this.dataCollector.nDead++;
                    this.status = 4;
                }
                else
                {
                    this.dataCollector.nRecovered++;
                    this.status = 3;
                }
            }
        }
    }

    this.updatePosition = function()
    {
        if (this.travelling)
        {
            this.vX = this.tX - this.x;
            this.vY = this.tY - this.y;
        }
        var v = Math.sqrt(this.vX * this.vX + this.vY * this.vY);
        this.vX = this.vX * params.person.speed / v;
        this.vY = this.vY * params.person.speed / v;
        this.x += this.vX;
        this.y += this.vY;

        var dx = this.x - this.tX;
        var dy = this.y - this.tY;

        var d = Math.sqrt(dx * dx + dy * dy);

        if (d < 10)
        {
            this.travelling = false;
        }
    }

    this.updateSprite = function(canvas)
    {
        /*
        this.updatesprite(canvas) => void

        Disegna un cerchio nel canvas, basandosi sulla posizione x e y
        Il colore del cerchio dipende dallo stato (this.status) della persona (suscettibile/infetta)
        Disegna anche una circonferenza il cui raggio dipende dal tempo passato dal raggio (this.pulseRadius) e incrementa quest'ultimo valore (siccome la funzione viene chiamata ogni frame)

        Input: 
        canvas => il canvas sul quale verrà disegnato il cerchio
        */

        var ctx = canvas.getContext("2d");

        ctx.fillStyle = [suscectibleColor, infectedColor, infectedColor, removedColor, deadColor][this.status];

        ctx.beginPath();
        ctx.arc(this.x, this.y, radius, 0, 2 * Math.PI);
        ctx.fill();

        pulseBeginFade = params.person.pulse.beginFade;
        pulseFinal = params.person.pulse.final;
        pulseIncrement = params.person.pulse.increment;

        if (this.status == 2 && this.pulseRadius < pulseFinal)
        {
            if (this.pulseRadius > pulseBeginFade)
            {
                ctx.globalAlpha = 1 - (this.pulseRadius - pulseBeginFade) / (pulseFinal - pulseBeginFade);
            }
            ctx.strokeStyle = pulseColor;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.pulseRadius, 0, 2*Math.PI);
            ctx.stroke();
            ctx.globalAlpha = 1;
            this.pulseRadius += pulseIncrement;

            if (this.pulseRadius >= pulseFinal)
            {
                this.pulseRadius = Math.Infinity;
            }
        }
    }
}

function simulation (canvasId, Ri, Ci)
{
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

    this.init = function()
    {
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
            nInfected : 0,
            nRecovered : 0,
            nDead : 0,
            reset : function()
            {
                this.nInfected = 0;
                this.nRecovered = 0;
                this.nDead = 0;
            }
        };

        this.epidemicInfo = //i seguenti valori vengono inizializzati a partire da parametri globali, ma possono essere variati
        {
            index : params.infection.defaultIndex, //indice di infezione dell'epidemia, 
            radius : params.infection.defaultRadius, //raggio di infezione dell'epidemia
            infectionSpan : params.infection.defaultSpan, //durata dell'infezione
            deathIndex : params.infection.defaultDeathIndex, //probabilità di morte alla fine dell'arco dell'infezione
            socialDistancing : params.infection.defaultSocialDistancing, //distanziamento sociale
        };

        this.canvas = document.getElementById(canvasId);
  
        this.peopleList = [];
        for (var i = 0; i < this.R; i++)
        {
            for (var j = 0; j < this.C; j++)
            {
                var p = new person(this.collectedData, this.epidemicInfo);
                p.x = (j + 1) * (this.canvas.width / (this.R + 1)) / 4 + this.canvas.width / 4;
                p.y = (i + 1) * (this.canvas.height / (this.C + 1)) / 4 + this.canvas.height / 4;
                p.tX = this.canvas.width / 2;
                p.tY = this.canvas.height / 2;
                var direction = Math.random() * Math.PI * 2;
                p.vX = Math.cos(direction);
                p.vY = Math.sin(direction);
                this.peopleList.push(p);
            }
        }
    }

    this.fixCollisions = function()
    {
        /*
        this.fixCollisions() => void
        per ogni persona, fa in modo che rispetti il distanziamento sociale e che non si avvicini ai bordi dell'area
        */
        for (var i = 0; i < this.peopleList.length; i++)
        {
            var p = this.peopleList[i];
            p.vY += 10 / (p.y * p.y);
            p.vX += 10 / (p.x * p.x);
            p.vY -= 10 / ((this.canvas.height - p.y) * (this.canvas.height - p.y));
            p.vX -= 10 / ((this.canvas.width - p.x) * (this.canvas.width - p.x));

            for (var j = 0; j < this.peopleList.length; j++)
            {
                if (j != i)
                {
                    var p2 = this.peopleList[j];
                    var dx = Math.abs(p.x - p2.x);
                    var dy = Math.abs(p.y - p2.y);

                    var d = Math.sqrt(dx * dx + dy * dy);
                    
                    if (dy > 0 && d < 50)
                    {
                        if (p.y > p2.y)
                        {
                            p.vY += (0.1 / (dy * dy));
                        }
                        else 
                        {
                            p.vY -= (0.1 / (dy * dy));
                        }
                    }

                    if (dx > 0 && d < 50)
                    {
                        if (p.x > p2.x) 
                        {
                            p.vX += (0.1 / (dx * dx));
                        }
                        else 
                        {
                            p.vX -= (0.1 / (dx * dx));
                        }
                    }

                    if (d == 0)
                    {
                        var direction = Math.random() * 2 * Math.PI;
                        p.vX += Math.cos(direction);
                        p.vY += Math.sin(direction);
                    }
                }
            }
        }
    }

    this.draw = function()
    {
        /*
        this.draw() => void
        Disegna la griglia di persone (this.grid) sul canvas (this.canvas), prima rimuovendo ciò che era già presente 
        */
        this.canvas.getContext("2d").clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (var i = 0; i < this.peopleList.length; i++)
        {
            this.peopleList[i].updateSprite(this.canvas, this.R, this.C);
        }
    }

    this.simulateMovement = function()
    {
        /*
        this.simulateMovement() => void
        chiama la funzione fixCollisions e poi muove tutte le persone chiamedo la funzione updatePosition per ciascuna di esse
        */
        this.fixCollisions();
        for (var i = 0; i < this.peopleList.length; i++)
        {
            this.peopleList[i].updatePosition();
        }
    }

    this.reset = function()
    {
        /*
        this.reset() => void
        Rende tutte le persone nella griglia (this.grid), suscettibili, riportando i dati raccolti a 0
        */
        this.collectedData.reset();
        for (var i = 0; i < this.peopleList.length; i++)
        {
            this.peopleList[i].x = (i % this.C + 1) * (this.canvas.width / (this.R + 1))
            this.peopleList[i].y = (Math.floor(i / this.C) + 1) * (this.canvas.height / (this.C + 1));
            this.peopleList[i].reset();
        }
    }

    this.simulateDay = function()
    {
        /*
        this.simulateDay() => void
        Simula un giorno della simulazione
        Chiama la funzione this.infection() e la funzione person.liveDay() per ogni persona della simulazione
        */
        this.infection();
        for (var i = 0; i < this.peopleList.length; i++)
        {
            if (Math.random() < 0.01)
            {
                //this.peopleList[i].travelling = true;
            }
            this.peopleList[i].liveDay();
        }
    }

    this.infection = function()
    {
        /*
        this.infection() => void
        Simula contatti e infezioni fra la popolazione nella griglia (this.grid), in base all'indice di infezione (this.index)
        */

        var radius = this.epidemicInfo.radius;
        var totEnc = 0;
        for (var i = -radius; i <=radius; i++)
        {
            temp = Math.floor(Math.sqrt(radius * radius - i * i));
            totEnc += temp*2 + 1;
        }
        for (var i = 0; i < this.peopleList.length; i++)
        {
            for (var j = 0; j < this.peopleList.length; j++)
            {
                var p1 = this.peopleList[i];
                var p2 = this.peopleList[j];
                if (this.peopleList[i].status == 2)
                {
                    var dx = p1.x - p2.x, dy = p1.y - p2.y;
                    var dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist <= radius)
                    {
                        this.peopleList[j].infect();
                    }
                }
            }
        }
    }

    this.init();
}