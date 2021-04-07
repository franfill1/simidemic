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