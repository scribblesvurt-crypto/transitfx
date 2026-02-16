import { applyCachedFilter } from '@/lib/page-filter';

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_start',

  main() {
    applyCachedFilter();
  },
});
