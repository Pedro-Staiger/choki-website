function generateGraphic() {
    const ctx = document.querySelector('.grafico-consumo').getContext('2d');

    // Gradiente de preenchimento
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'oklch(92% .2 105 / 0.4)');
    gradient.addColorStop(1, 'oklch(92% .2 105 / 0.0)');

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: [
                '00h', '01h', '02h', '03h', '04h', '05h',
                '06h', '07h', '08h', '09h', '10h', '11h',
                '12h', '13h', '14h', '15h', '16h', '17h',
                '18h', '19h', '20h', '21h', '22h', '23h'
            ],
            datasets: [{
                data: [
                    0.4, 0.2, 0.5, 0.3, 0.6, 0.8,
                    1.4, 1.1, 1.5, 1.3, 1.4, 1.2,
                    1.0, 1.1, 0.9, 1.1, 1.3, 1.5,
                    1.6, 1.8, 1.4, 1.5, 1.1, 0.7
                ],
                borderColor: 'oklch(92% .2 105)',
                borderWidth: 2.5,
                backgroundColor: gradient,
                fill: 'origin',
                tension: 0.1,
                pointBackgroundColor: 'oklch(92% .2 105)',
                pointBorderColor: 'transparent',
                pointRadius: 3,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: 'oklch(92% .2 105)',
                pointHoverBorderColor: 'oklch(92% .2 105 / 0.12)',
                pointHoverBorderWidth: 2,
            }]
        },
        options: {
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'oklch(36% .06 195)',
                    titleColor: 'oklch(78% .04 160)',
                    bodyColor: 'oklch(97% .02 100)',
                    borderColor: 'oklch(42% .05 195)',
                    borderWidth: 1,
                    padding: 10,
                    displayColors: false,
                    callbacks: {
                        label: (item) => `${item.raw} kWh`
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    border: { display: false },
                    ticks: {
                        color: '#a0b0a8',
                        font: { family: 'Sora', size: 11 }
                    }
                },
                y: {
                    display: false,
                    grid: { display: false },
                    min: 0,
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
}

generateGraphic();