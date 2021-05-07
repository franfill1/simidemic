const params = 
{
    /*
    parametri globali, accessibili da ogni funzione e oggetto
    */

    person :
    {
        radius : 1,
        speed : 0.4,
        travellingSpeed : 5,
        acceleration : 0.01,
        angle : Math.PI/6,
        colors :
        {
            suscectible : "lightGreen", //colore di una persona suscettibile sul canvas
            infected : "red", //colore di una persona infetta sul canvas
            asymptomatic : "yellow",
            removed : "grey",
            dead : "black",
            pulse : "red", //colore della pulsazione emessa da una persona appena infettata sul canvas, rappresentate da una circonferenza
        },
        pulse :
        {
            beginFade : 10, //raggio raggiunto il quale le circonferenze che rappresentano le pulsazoni cominciano a scomparire
            final : 20, //raggio dopo il quale le pulsazioni non sono più visibili
            increment : 1, //incremento del raggio di una pulsazione ad ogni frame
        }
    },
    region :
    {
        colors:
        {
            edges : "white",
            quarantineEdges : "red",
        },
        border: 3,
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
            nRecovered : "gray",
            nDead : "black",
            textColor : "black", //colore del testo che indica i valori sugli assi del grafico
            lineColor : "black", //colore dei trattini sugli assi del grafico
        },
        textFont : "sans-serif", //stile del testo che indica i valori sugli assi del grafico
    },

    infection :
    {
        defaultIndex : 0.35, //valore dell'indice di infezione dell'epidemia
        defaultRadius : 10, //valore iniziale del raggio dell'epidemia
        defaultSpan : 15,
        defaultDeathIndex : 0.2,
        defaultSocialDistancing : 10,
        defaultRespectfullness : 0,
        defaultAsympMin : 3,
        defaultAsympMax : 3,
        defaultAsympProb : 0,
        maxTravelling : 10,
        travelProbability : 0.5,
        nRegions : 9,
        nPeople : 900,
    }
}

function main()
{
    sim = new simulation("simulationCanvas", params.infection.nRegions, params.infection.nPeople, true);
    gra = new graph("graph", params.infection.nPeople, sim.collectedData);
    sim.startEpidemic(1, 20);
    sim.draw();
    setUpSliders();
    frame = 0;
    paused = false;
    setInterval(update, 20);
}

function setUpSliders()
{
    document.getElementById("SliderInfectionRange").value = params.infection.defaultRadius;
    document.getElementById("SliderInfectionRangeValue").innerHTML = params.infection.defaultRadius;
    document.getElementById("SliderTravelMax").value = params.infection.maxTravelling;
    document.getElementById("SliderTravelMaxValue").innerHTML = params.infection.maxTravelling;

    document.getElementById("SliderRespect").value = params.infection.defaultRespectfullness;
    document.getElementById("SliderRespectValue").innerHTML = params.infection.defaultRespectfullness;
    params.person.pulse.beginFade = params.infection.defaultRadius / 2;
    params.person.pulse.final = params.infection.defaultRadius;

    document.getElementById("SliderInfectionRange").oninput = function()
    {
        sim.epidemicInfo.radius = Number(this.value);
        document.getElementById("SliderInfectionRangeValue").innerHTML = Number(this.value);
        params.person.pulse.beginFade = this.value / 2;
        params.person.pulse.final = this.value;
        params.person.pulse.increment = this.value / 20;
    }
    document.getElementById("SliderTravelMax").oninput = function()
    {
        params.infection.maxTravelling = this.value;
        document.getElementById("SliderTravelMaxValue").innerHTML = this.value;
    }
    document.getElementById("SliderRespect").oninput = function()
    {
        sim.epidemicInfo.respectfullness = this.value / 100;
        document.getElementById("SliderRespectValue").innerHTML = this.value / 100;
    }
    document.getElementById("ResetButton").onclick = function()
    {
        sim.reset();
        gra.reset();
        frame = 0;
        sim.startEpidemic(1, 20);
        paused = true;
    }
    document.getElementById("PlayButton").onclick = function()
    {
        paused = false;
    }
    document.getElementById("PauseButton").onclick = function()
    {
        paused = true;
    }
    document.getElementById("StepButton").onclick = function()
    {
        if (paused)
        {
            sim.simulateDay();
            gra.updateData();
        }
    }
}


function update()
{
    sim.draw();
    if (!paused)
    {
        sim.simulateMovement();
    }
    if (!paused && frame % 20 == 0)
    {  
        sim.simulateDay();
        gra.updateData();
    }
    if (!paused) frame++;
}