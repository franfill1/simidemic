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
        defaultRadius : 1, //valore iniziale del raggio dell'epidemia
        defaultSpan : 15,
        defaultDeathIndex : 0,
        nRows : 50,
    }
}

function main()
{
    sim = new simulation("simulationCanvas", params.infection.nRows, params.infection.nRows);
    gra = new graph("graph", params.infection.nRows * params.infection.nRows, sim.collectedData);
    sim.grid[Math.floor(params.infection.nRows/2)][Math.floor(params.infection.nRows/2)].infect();
    sim.draw();
    setUpSliders();
    frame = 0;
    paused = false;
    setInterval(update, 10);
}

function setUpSliders()
{
    document.getElementById("SliderInfectionProb").value = params.infection.defaultIndex * 100;
    document.getElementById("SliderInfectionProbValue").innerHTML = params.infection.defaultIndex;
    document.getElementById("SliderInfectionRange").value = params.infection.defaultRadius;
    document.getElementById("SliderInfectionRangeValue").innerHTML = params.infection.defaultRadius;
    params.person.pulse.beginFade = params.infection.defaultRadius * 250 / (params.infection.nRows + 1);
    params.person.pulse.final = params.infection.defaultRadius * 500 / (params.infection.nRows + 1);

    document.getElementById("SliderInfectionProb").oninput = function()
    {
        sim.epidemicInfo.index = this.value / 100;
        document.getElementById("SliderInfectionProbValue").innerHTML = Number(this.value) / 100;
    }
    document.getElementById("SliderInfectionRange").oninput = function()
    {
        sim.epidemicInfo.radius = this.value;
        document.getElementById("SliderInfectionRangeValue").innerHTML = Number(this.value);
        params.person.pulse.beginFade = this.value * 250 / (params.infection.nRows + 1);
        params.person.pulse.final = this.value * 500 / (params.infection.nRows + 1);
        params.person.pulse.increment = (this.value * 500 / (params.infection.nRows + 1)) / 20;
    }
    document.getElementById("ResetButton").onclick = function()
    {
        sim.reset();
        gra.reset();
        sim.grid[Math.floor(params.infection.nRows/2)][Math.floor(params.infection.nRows/2)].infect();
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
        sim.simulateDay();
        gra.updateData();
    }
    frame++;
}