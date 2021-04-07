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