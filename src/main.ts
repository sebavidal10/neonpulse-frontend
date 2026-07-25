import { type Concert, ConcertStatus } from './models';

const appContainer = document.getElementById('app');

const concertsList: Concert[] = [
  {
    id: '1',
    title: 'Latinoamerican Tour 2026',
    band: 'Arctic Monkeys',
    date: new Date('2026-08-01'),
    time: '21:00',
    status: ConcertStatus.SCHEDULED,
  },
  {
    id: '3',
    title: 'Australian Tour 2026',
    band: 'Tame Impala',
    date: new Date('2026-10-05'),
    status: ConcertStatus.FINISHED,
  },
];

const listContainer = document.createElement('ul');
listContainer.innerHTML = concertsList.reduce((acc, concert) => {
  return (
    acc +
    `<li>${concert.title} - ${concert.band} - ${concert.date.toDateString()}</li>`
  );
}, '');

if (appContainer) {
  appContainer.innerHTML = `
    <h1>NeonPulse</h1>
    <p>Entorno de desarrollo incializado con Vite y VanillaJS</p>
  `;

  appContainer.appendChild(listContainer);
}
