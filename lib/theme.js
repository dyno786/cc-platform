export const T = {
  bg: '#f6f8fa',
  surface: '#ffffff',
  border: '#d0d7de',
  borderLight: '#eaeef2',
  text: '#1f2328',
  textMuted: '#656d76',
  textHint: '#9ea8b3',
  green: '#1f883d',
  greenBg: '#dafbe1',
  greenBorder: 'rgba(26,127,55,0.25)',
  blue: '#0969da',
  blueBg: '#ddf4ff',
  blueBorder: 'rgba(9,105,218,0.25)',
  amber: '#bf8700',
  amberBg: '#fff8c5',
  amberBorder: 'rgba(191,135,0,0.25)',
  red: '#cf222e',
  redBg: '#ffebe9',
  redBorder: 'rgba(207,34,46,0.25)',
  purple: '#534ab7',
  purpleBg: '#eeedfe',
  purpleBorder: 'rgba(83,74,183,0.25)',
}

export const PINS = { manager: '1979', staff: '7860' }
export const ROLES = { manager: 'manager', staff: 'staff' }

export const globalStyles = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { height: 100%; }
  body { background: #f6f8fa; color: #1f2328; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; font-size: 13px; line-height: 1.5; }
  a { color: inherit; text-decoration: none; }
  button { font-family: inherit; cursor: pointer; }
  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #d0d7de; border-radius: 99px; }
`
