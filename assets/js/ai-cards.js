// AI native cards (layouts/_partials/home/ai-agents.html). Each card carries
// the same interface art as its way in on the Product menu; with Motion
// (motion.dev) the art rises into place, card by card, as the grid scrolls
// into view, and leans in a little while the card is hovered. Only the
// WAAPI animate, inView, stagger and hover are bundled (layouts/home.html
// builds this file with js.Build). Readers who ask for less motion, or
// without the script, get the cards as drawn.
import { animate } from 'motion/mini';
import { hover, inView, stagger } from 'motion';

const grid = document.querySelector('.ai-agent-cards');
if (grid && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const arts = grid.querySelectorAll('.iface-art');
  const rest = 'translateY(0px) scale(1)';
  const ease = [0.2, 0.7, 0.2, 1];
  arts.forEach((art) => { art.style.opacity = '0'; art.style.transform = 'translateY(14px) scale(0.98)'; });
  inView(grid, () => {
    animate(arts, { opacity: 1, transform: rest }, { duration: 0.6, delay: stagger(0.08), ease });
  }, { amount: 0.2 });
  hover(grid.querySelectorAll(':scope > li'), (card) => {
    const art = card.querySelector('.iface-art');
    if (!art) return undefined;
    animate(art, { transform: 'translateY(-4px) scale(1.015)' }, { duration: 0.3, ease });
    return () => animate(art, { transform: rest }, { duration: 0.3, ease });
  });
}
