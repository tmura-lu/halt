function graficoBarras() {
    const ctx = document.getElementById('graficoNumVolumes');

    new Chart(ctx, {
        type: 'bar',
        data: {
        labels: vlabels, // Alterei aqui. Acessa variável global 'labels'
        datasets: [{
            label: 'Número de Volumes',
            data: vdata,  // Alterei aqui. Acessa a variável global 'data'
            borderWidth: 1
        }]
        },
        options: {
        scales: {
            y: {
                beginAtZero: true
            }
        }
        }
    });
}          

function graficoPizza(){
    const ctx = document.getElementById('graficoPizza');

    new Chart(ctx, {
        type: 'pie',
        data: {
        labels: vlabels, // Alterei aqui. Acessa variável global 'labels'
        datasets: [{
            label: 'Número de Volumes',
            data: vdata, // Alterei aqui. Acessa a variável global 'data'
            backgroundColor: [
                'rgb(255, 99, 132)',
                'rgb(54, 162, 235)',
                'rgb(255, 205, 86)',
                'rgb(80, 60, 200)',
                'rgb(255, 100, 86)',
                'rgb(54, 255, 150)'
            ],
            hoverOffset: 8
        }]
        }
    });
}

graficoBarras();

graficoPizza();