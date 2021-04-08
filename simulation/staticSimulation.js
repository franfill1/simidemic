
function person()
{
    /*
    person() => void

    oggetto che rappresenta una persona nella simulazione
    possiede una posizione (x,y) nella griglia di persone presente nella simulazione e uno stato, che identifica se è suscettibile o infetta

    this.x => posizione x della persona nella griglia della simulazione
    this.y => posizione y della persona nella griglia della simulazione
    this.status => identifica lo stato della persona basato sul modello SI (suscectible, infected), questo attributo viene cambiato da funzioni esterne
    this.timeSinceInfection => indica quanto tempo (in frame) è passato dal cambiamento di stato (status) da 0 a 1, se è avvenuto, altrimenti è pari a 0
    */

    this.x = 0; //posizione x nella griglia
    this.y = 0; //posizione y nella griglia

    this.status = 0; //0 = sano, 1 = infetto
    this.timeSinceInfection = 0;

    const suscectibleColor = params.person.colors.suscectible;
    const infectedColor = params.person.colors.infected;
    const pulseColor = params.person.colors.pulse;
    const radius = params.person.radius;

    this.updateSprite = function(canvas, R, C)
    {
        /*
        this.updatesprite(canvas, R, C) => void

        Disegna un cerchio nel canvas, basandosi sulla posizione x e y nella griglia di R righe e C colonne
        Il colore del cerchio dipende dallo stato (this.status) della persona (suscettibile/infetta)
        Disegna anche una circonferenza il cui raggio dipende dal tempo passato dall'infezione (this.timeSinceInfection) e incrementa quest'ultimo valore (siccome la funzione viene chiamata ogni frame)

        Input: 
        canvas => il canvas sul quale verrà disegnato il cerchio
        R => le righe della griglia di persone associata al canvas
        C => le colonne della griglia di persone associata al canvas
        */

        var ctx = canvas.getContext("2d");

        var posX = canvas.width / (C + 1) * (this.x + 1);
        var posY = canvas.height / (R + 1) * (this.y + 1);
        if (this.status == 0)
        {
            ctx.fillStyle = suscectibleColor;
        }
        else
        {
            ctx.fillStyle = infectedColor;
        }

        ctx.beginPath();
        ctx.arc(posX, posY, radius, 0, 2 * Math.PI);
        ctx.fill();

        pulseBeginFade = params.person.pulse.beginFade;
        pulseFinal = params.person.pulse.final;
        pulseIncrement = params.person.pulse.increment;
        
        if (this.status && this.timeSinceInfection < pulseFinal)
        {
            
            if (this.timeSinceInfection > pulseBeginFade)
            {
                ctx.globalAlpha = 1 - (this.timeSinceInfection - pulseBeginFade) / (pulseFinal - pulseBeginFade);
            }
            ctx.strokeStyle = pulseColor;
            ctx.beginPath();
            ctx.arc(posX, posY, this.timeSinceInfection, 0, 2*Math.PI);
            ctx.stroke();
            ctx.globalAlpha = 1;
            this.timeSinceInfection += pulseIncrement;
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
    this.infectedN => quantità di persone infette
    this.R => righe presenti nella griglia
    this.C => colonne presenti nella griglia

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

        this.grid = [];
        for (var i = 0; i < this.R; i++)
        {
            var row = [];
            for (var j = 0; j < this.C; j++)
            {
                row.push(new person());
                row[j].x = j;
                row[j].y = i;
            }
            this.grid.push(row);
        }

        this.canvas = document.getElementById(canvasId);
        this.nInfected = 0;

        this.index = params.infection.defaultIndex;
        this.radius = params.infection.defaultRadius;
        this.draw();
    }

    this.draw = function()
    {
        /*
        this.draw() => void
        Disegna la griglia di persone (this.grid) sul canvas (this.canvas), prima rimuovendo ciò che era già presente 
        */
        this.canvas.getContext("2d").clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (var i = 0; i < this.R; i++)
        {
            for (var j = 0; j < this.C; j++)
            {
                this.grid[i][j].updateSprite(this.canvas, this.R, this.C);
            }
        }
    }

    this.reset = function()
    {
        /*
        this.reset() => void
        Rende tutte le persone nella griglia (this.grid), suscettibili, rendendo il numero totale di infetti (this.infectedN) pari a 0
        */
        this.nInfected = 0;
        for (var i = 0; i < this.R; i++)
        {
            for (var j = 0; j < this.C; j++)
            {
                this.grid[i][j].status = 0;
            }
        }
    }

    this.infect = function(p)
    {
        /*
        this.infect(p) => void
        Infetta la persona (p), solo se non è già infetta
        Aggiorna di conseguenza il conteggio degli infetti (this.nInfected)
        */
       
       if (p.status == 0)
       {
           p.status = 1;
           this.nInfected++;
       }
       
    }

    this.infection = function()
    {
        /*
        this.infection() => void
        Simula contatti e infezioni fra la popolazione nella griglia (this.grid), in base all'indice di infezione (this.index)
        Se la persona contrassegnata da una X è infetta, le persone contrassegnate da 0 hanno probabilità pari all'indice (this.index) di infettarsi
       
        O O O O O O O
        O 0 0 0 O O O
        O 0 X 0 O O O
        O 0 0 0 O O O
        */

        var toInfect = [];

        for (var i = 0; i < this.R; i++)
        {
            for (var j = 0; j < this.C; j++)
            {
                
                if (this.grid[i][j].status)
                {
                    var imin = Math.max(i-this.radius, 0), imax = Math.min(Number(i)+Number(this.radius), this.R - 1);
                    var jmin = Math.max(j-this.radius, 0), jmax = Math.min(Number(j)+Number(this.radius), this.C - 1);
                    for (var ni = imin; ni <= imax; ni++)
                    {
                        for (var nj = jmin; nj <= jmax; nj++)
                        {
                            if (!this.grid[ni][nj].status)
                            {
                                if (Math.random() < this.index)
                                {
                                    toInfect.push(this.grid[ni][nj]);
                                }
                            }
                        }
                    }
                }

            }
        }
        

        for (var i = 0; i < toInfect.length; i++)
        {
            this.infect(toInfect[i]);
        }

        this.draw();
    }

    this.init();
}