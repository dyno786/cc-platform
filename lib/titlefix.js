// Tidies how sizes are written in a product title. It never changes a number, only the way the unit is written:
// "355 Ml" -> "355ml", "12 Oz." -> "12oz", "8 Fl. Oz" -> "8 fl oz", "500 Gr" -> "500g", "2 Ibs" -> "2lb", "1 Ltr" -> "1L".
const N = '(\\d+(?:[.,]\\d+)?)'
export function fixTitle(t) {
  let s = String(t || '')
  s = s.replace(new RegExp(N + '\\s*fl\\.?\\s*[o0]z\\.?(?![a-z])', 'gi'), '$1 fl oz')
  s = s.replace(new RegExp(N + '\\s*(?:fluid\\s+)?ounces?\\b', 'gi'), '$1oz')
  s = s.replace(new RegExp(N + '\\s*oz\\b\\.?', 'gi'), '$1oz')
  s = s.replace(new RegExp(N + '\\s*(?:mls?|millilit(?:re|er)s?)\\b\\.?', 'gi'), '$1ml')
  s = s.replace(new RegExp(N + '\\s*(?:kgs?|kilos?)\\b', 'gi'), '$1kg')
  s = s.replace(new RegExp(N + '\\s*(?:gms?|grams?|grm|gr|g)\\b(?!\\s*-?\\s*(?:pack|pcs|piece))', 'gi'), '$1g')
  s = s.replace(new RegExp(N + '\\s*(?:lit(?:re|er)s?|ltrs?|lt)\\b', 'gi'), '$1L')
  s = s.replace(new RegExp(N + '\\s*l\\b(?!\\s*[-\'’]|\\s+(?:needle|shape|part))', 'g'), '$1L')
  s = s.replace(new RegExp(N + '\\s*(?:lbs?|ibs)\\b\\.?', 'gi'), '$1lb')
  s = s.replace(/(\d)(oz|ml|g|kg|L|lb)\s*\/\s*(\d)/g, '$1$2 / $3')
  s = s.replace(/\s{2,}/g, ' ').replace(/\s+([,)])/g, '$1').trim()
  return s
}
