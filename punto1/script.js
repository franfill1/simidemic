function person()
{
    this.x = 0; //posizione x nella griglia
    this.y = 0; //posizione y nella griglia

    this.status = 0; //0 = sano, 1 = infetto

    this.updateSprite = function(canvas, R, C)
    {
        var ctx = canvas.getContext("2d");

        var posX = canvas.width / (C + 1) * (this.x + 1);
        var posY = canvas.height / (R + 1) * (this.y + 1);

        if (this.status == 0)
        {
            ctx.fillStyle = "lightGreen";
        }
        else
        {
            ctx.fillStyle = "red";
        }

        ctx.beginPath();
        ctx.arc(posX, posY, 3, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke;
    }
}

function simulation (canvasId, R, C)
{
    this.init = function()
    {
        this.grid = [];
        for (var i = 0; i < R; i++)
        {
            var row = [];
            for (var j = 0; j < C; j++)
            {
                row.push(new person());
                row[j].x = j;
                row[j].y = i;
            }
            this.grid.push(row);
        }

        this.canvas = document.getElementById(canvasId);
        this.nInfected = 1;

        this.index = 0.2;

        this.draw();
    }

    this.draw = function()
    {
        this.canvas.getContext("2d").clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (var i = 0; i < R; i++)
        {
            for (var j = 0; j < C; j++)
            {
                this.grid[i][j].updateSprite(this.canvas, R, C);
            }
        }
    }

    this.reset = function()
    {
        this.nInfected = 0;
        for (var i = 0; i < R; i++)
        {
            for (var j = 0; j < C; j++)
            {
                this.grid[i][j].status = 0;
            }
        }
    }
    
    this.infection = function()
    {
        var toUpdate = [];

        for (var i = 0; i < R; i++)
        {
            for (var j = 0; j < C; j++)
            {
                var kmin = i - 1, hmin = j - 1, kmax = i + 1, hmax = j + 1;
                if (i == 0)
                    kmin = 0;
                if (i == R - 1)
                    kmax = R - 1;
                if (j == 0)
                    hmin = 0;
                if (j == C - 1)
                    hmax = C - 1;             
                if (this.grid[i][j].status)
                {
                    for (var k = kmin; k < kmax + 1; k++)
                    {
                        for (var h = hmin; h < hmax + 1; h++)
                        {
                            if (!this.grid[k][h].status)
                            {
                                if (Math.random() < this.index)
                                    toUpdate.push(this.grid[k][h]);
                            }
                        }
                    }
                }
            }
        }

        for (var i = 0; i < toUpdate.length; i++)
        {
            if (toUpdate[i].status == 0) this.nInfected++;
            toUpdate[i].status = 1;
        }

        this.draw();
    }

    this.init();
}

function graph(canvasId, dataMax)
{
    this.init = function()
    {
        this.canvas = document.getElementById(canvasId);
        this.data = [];
    }

    this.draw = function()
    {
        var ctx = this.canvas.getContext("2d");
        
        ctx.fillStyle = "red";
        ctx.moveTo(0, this.canvas.height);
        ctx.beginPath();

        for (var i = 0; i < this.data.length; i++)
        {
            ctx.lineTo(this.canvas.width / (this.data.length - 1) * i, this.canvas.height * (1 - (this.data[i]/dataMax)));
        }
        ctx.lineTo(this.canvas.width, this.canvas.height);
        ctx.lineTo(0, this.canvas.height);
        ctx.fill();

    }
    this.init();
}

function main()
{
    sim = new simulation("simulationCanvas", 50, 50);
    sim.nInfected = 1;
    gra = new graph("graph", 2500);
    sim.grid[2][2].status = 1;
    setInterval(update, 100);
}

function update()
{
    if (sim.nInfected < 2500)
    {  
        sim.infection();
        gra.data.push(sim.nInfected);
        gra.draw();
    }
}