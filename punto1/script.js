const params = 
{
    /*
    parametri globali, accessibili da ogni funzione e oggetto
    */
    
    person :
    {
        radius : 1,
        colors :
        {
            suscectible : "lightGreen", //colore di una persona suscettibile sul canvas
            infected : "red", //colore di una persona infetta sul canvas
            pulse : "red", //colore della pulsazione emessa da una persona appena infettata sul canvas, rappresentate da una circonferenza
        },
        pulse :
        {
            beginFade : 10, //raggio raggiunto il quale le circonferenze che rappresentano le pulsazoni cominciano a scomparire
            final : 15, //raggio dopo il quale le pulsazioni non sono più visibili
            increment : 1, //incremento del raggio di una pulsazione ad ogni frame
        }
    },
    graph :
    {
        dimensions :
        {
            stepXValue : 10, //intervallo minimo di giorni rappresentato sull'asse x del grafico
            stepYValue : 25, //intervallo minimo in percentuale rappresentato sull'asse y del grafico
            lineLength : 3, //dimensione dei trattini sugli assi del grafico
            textSize : 15, //altezza del testo sugli assi del grafico
        },
        colors :
        {
            nSuscectible : "lightGreen", //colore dell'area che rappresenta la quantità di persone suscettibili sul grafico
            nInfected : "red", //colore dell'area che rappresenta la quantità di persone infette sul grafico
            textColor : "black", //colore del testo che indica i valori sugli assi del grafico
            lineColor : "black", //colore dei trattini sugli assi del grafico
        },
        textFont : "sans-serif", //stile del testo che indica i valori sugli assi del grafico
    },

    infection :
    {
        defaultIndex : 0.05, //valore di default dell'indice di infezione dell'epidemia
    }

}

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

    const pulseBeginFade = params.person.pulse.beginFade;
    const pulseFinal = params.person.pulse.final;
    const pulseIncrement = params.person.pulse.increment;

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
                    var imin = Math.max(i-1, 0), imax = Math.min(i+1, this.R - 1);
                    var jmin = Math.max(j-1, 0), jmax = Math.min(j+1, this.C - 1);
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

function graph(canvasId, dataMaxi, dataSourcei)
{
    /* 
    graph(canvasId, dataMax) => void
    oggetto che gestisce la rappresentazione di dati raccolti sulla quantità di persone infettate ogni giorno, sottoforma di un grafico

    this.canvas => canvas sul quale viene disegnato il grafico
    this.dataMax => numerosità della popolazione
    this.data => oggetto contenente i dati relativi all'epidemia
    this.dataSize => quantità di dati raccolti
    this.dataSource => oggetto con attributi necessari al raccoglimento dei dati

    Input:
    canvasId => id nel documento HTML del canvas sul quale va disegnato il grafico
    dataMaxi => numerosità della popolazione inizialmente
    dataSourcei => oggetto dal quale verranno ricavati i dati, verrà copiato in (this.dataSource)
   */

    this.init = function()
    {
        /*
        this.init() => void
        Inizializza tutti gli attributi dell'oggetto
        Il canvas (this.canvas) viene ricavato a partire dall'id fornito in input, l'array dei dati (this.data) viene svuotato
        Il valore di (dataMaxi), dato in input, viene copiato nell'apposito attributo (this.dataMax)
        Il valore di (dataSourcei), dato in input, viene copiato nell'apposito attributo (this.dataSource)
        */
        this.canvas = document.getElementById(canvasId);
        this.canvas.style.backgroundColor = params.graph.colors.nSuscectible;
        this.data = {nInfected : [], nRecovered : []};
        this.dataSize = 0;
        this.dataMax = dataMaxi;
        this.dataSource = dataSourcei;
    }

    this.updateData = function()
    {
        /*
        this.updateData() => void
        Aggiorna l'array data in base all'attributo nInfected dell'oggetto (dataSource)
        */
        for (var propt in this.data)
        {
            if (this.data.hasOwnProperty(propt))
            {
                if (this.dataSource.hasOwnProperty(propt))
                {
                    this.data[propt].push(this.dataSource[propt]);
                }
                else
                {
                    this.data[propt].push(0);
                }
            }
        }
        this.dataSize++;
        this.draw();
    }

    this.draw = function()
    {
        /*
        this.draw() => void
        Disegna il grafico, sull'asse delle x viene rappresentato il tempo, sull'asse delle y le quantità indicate dai dati raccolti
        */

        var ctx = this.canvas.getContext("2d");

        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        var stepX = this.canvas.width/(this.dataSize - 1);
        var stepY = this.canvas.height/this.dataMax;

        var offSets = [];
        for (var i = 0; i < this.dataSize; i++)
        {
            offSets[i] = 0;
        }
        
        for (var propt in this.data)
        {
            if (this.data.hasOwnProperty(propt))
            {
                ctx.fillStyle = params.graph.colors[propt];
                ctx.moveTo(0, this.canvas.height);
                ctx.beginPath();

                for (var i = 0; i < this.dataSize; i++)
                {
                    ctx.lineTo(i*stepX, this.canvas.height - offSets[i] * stepY);
                    offSets[i] += this.data[propt][i];
                }
                for (var i = this.dataSize-1; i >= 0; i--)
                {
                    ctx.lineTo(i*stepX, this.canvas.height - offSets[i] * stepY);
                }
                ctx.fill();
            }
        }

        const stepXValue = params.graph.dimensions.stepXValue;
        const stepYValue = params.graph.dimensions.stepYValue;
        const lineLength = params.graph.dimensions.lineLength;
        const textSize = params.graph.dimensions.textSize;

        ctx.fillStyle = params.graph.colors.textColor;
        ctx.strokeStyle = params.graph.colors.lineColor;
        ctx.font = textSize + "px " + params.graph.colors.textFont;

        for (var i = stepXValue; i < this.dataSize; i += stepXValue)
        {
            ctx.fillText(i, i * stepX - (ctx.measureText(i).width/2), this.canvas.height - lineLength);

            ctx.beginPath();
            ctx.moveTo(stepX*i, this.canvas.height);
            ctx.lineTo(stepX*i, this.canvas.height - lineLength);
            ctx.stroke();
        }

        var stepY = this.canvas.height / 100 * stepYValue;
        var percent = stepYValue;

        for (var i = this.canvas.height - stepY; i > 0; i -= stepY)
        {
            ctx.fillText(percent + "%", lineLength, i + textSize/2);
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(lineLength, i);
            ctx.stroke();
            percent += stepYValue;
        }
        
    }
    this.init();
}

function main()
{
    sim = new simulation("simulationCanvas", 50, 50);
    gra = new graph("graph", 2500, sim);
    sim.infect(sim.grid[25][25]);
    sim.draw();
    gra.draw();
    frame = 0;
    setInterval(update);
}

function update()
{
    sim.draw();
    if (sim.nInfected < 2500 && frame % 1 == 0)
    {  
        sim.infection();
        gra.updateData();
    }
    frame++;
}