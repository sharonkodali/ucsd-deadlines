import { fetchCanvas } from '@/lib/canvas';

export default defineContentScript({
  matches: ['https://canvas.ucsd.edu/*'],
  async main() {
    try {
      const deadlines = await fetchCanvas();
      await browser.storage.local.set({
        canvas: { deadlines, updatedAt: Date.now() },
      });
      console.log(`[UCSD Deadlines] saved ${deadlines.length} Canvas items`);
    } catch (e) {
      console.warn('[UCSD Deadlines] Canvas fetch failed:', e);
    }
  },
});