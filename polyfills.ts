/**
 * Array polyfills
 */
import 'array.prototype.tosorted/auto';

/**
 * String polyfills
 */
import 'string.prototype.iswellformed/auto';
import 'string.prototype.towellformed/auto';

/**
 * Intl polyfills
 */

// these parts of Intl are available in Hermes (as of Feb 2026), so no need to polyfill them
//   - Intl.getCanonicalLocales
//   - Intl.Collator
//   - Intl.DateTimeFormat
//   - Intl.NumberFormat

// the order is important because some of the latter ones depend on the former ones
import '@formatjs/intl-locale/polyfill.js';
import '@formatjs/intl-listformat/polyfill.js';
import '@formatjs/intl-listformat/locale-data/en.js';

import '@formatjs/intl-segmenter/polyfill.js';
import '@formatjs/intl-pluralrules/polyfill.js';
import '@formatjs/intl-supportedvaluesof/polyfill.js';

/**
 * Temporal polyfills
 */
import 'temporal-polyfill/full/global';
