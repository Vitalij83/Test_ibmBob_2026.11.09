<template>
  <div class="calculator" :class="{ scientific: mode === 'sci' }">
    <div class="header">
      <h1>Lab 1 Calculator</h1>
      <div class="mode-toggle">
        <button :class="{ active: mode === 'std' }" @click="mode = 'std'">Standard</button>
        <button :class="{ active: mode === 'sci' }" @click="mode = 'sci'">Scientific</button>
      </div>
    </div>

    <div class="display">
      <div class="expression">{{ expression || '0' }}</div>
      <div class="result" v-if="result !== null">= {{ result }}</div>
      <div class="error" v-if="error">{{ error }}</div>
    </div>

    <!-- Scientific extra buttons -->
    <div class="sci-buttons" v-if="mode === 'sci'">
      <button class="btn sci" @click="append('Math.PI')">π</button>
      <button class="btn sci" @click="append('Math.E')">e</button>
      <button class="btn sci" @click="append('(')">(</button>
      <button class="btn sci" @click="append(')')">)</button>

      <button class="btn sci" @click="wrapFn('Math.sin')">sin</button>
      <button class="btn sci" @click="wrapFn('Math.cos')">cos</button>
      <button class="btn sci" @click="wrapFn('Math.tan')">tan</button>
      <button class="btn sci" @click="wrapFn('Math.sqrt')">√</button>

      <button class="btn sci" @click="wrapFn('Math.log10')">log</button>
      <button class="btn sci" @click="wrapFn('Math.log')">ln</button>
      <button class="btn sci" @click="appendPow2">x²</button>
      <button class="btn sci" @click="append('**')">xⁿ</button>
    </div>

    <!-- Standard buttons -->
    <div class="buttons">
      <button class="btn span-two" @click="clear">C</button>
      <button class="btn" @click="backspace">⌫</button>
      <button class="btn op" @click="append('/')">÷</button>

      <button class="btn" @click="append('7')">7</button>
      <button class="btn" @click="append('8')">8</button>
      <button class="btn" @click="append('9')">9</button>
      <button class="btn op" @click="append('*')">×</button>

      <button class="btn" @click="append('4')">4</button>
      <button class="btn" @click="append('5')">5</button>
      <button class="btn" @click="append('6')">6</button>
      <button class="btn op" @click="append('-')">−</button>

      <button class="btn" @click="append('1')">1</button>
      <button class="btn" @click="append('2')">2</button>
      <button class="btn" @click="append('3')">3</button>
      <button class="btn op" @click="append('+')">+</button>

      <button class="btn span-two" @click="append('0')">0</button>
      <button class="btn" @click="append('.')">.</button>
      <button class="btn equals" @click="calculate">=</button>
    </div>

    <div class="history" v-if="history.length">
      <h2>History <span class="badge">{{ history.length }}</span></h2>
      <ul>
        <li v-for="(entry, i) in [...history].reverse()" :key="i">
          <span class="hist-expr">{{ entry.expression }}</span> = <strong>{{ entry.result }}</strong>
        </li>
      </ul>
      <button class="btn-clear-history" @click="clearHistory">Clear history</button>
    </div>

    <div class="logpath" v-if="logPath">
      <span>📄 Log: {{ logPath }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { StatsTracker } from './utils/calculator.js'

const mode = ref('std')
const expression = ref('')
const result = ref(null)
const error = ref('')
const history = ref([])
const logPath = ref('')
const tracker = new StatsTracker()

onMounted(async () => {
  if (window.electronAPI) {
    logPath.value = await window.electronAPI.getLogPath()
  }
})

function append(val) {
  error.value = ''
  result.value = null
  expression.value += val
}

function clear() {
  expression.value = ''
  result.value = null
  error.value = ''
}

function backspace() {
  // Remove last token-aware chunk
  expression.value = expression.value.replace(/Math\.\w+\($|Math\.[A-Z]+$|\($|\*\*$|.$/, '')
  result.value = null
  error.value = ''
}

function wrapFn(fn) {
  error.value = ''
  result.value = null
  if (expression.value) {
    expression.value = `${fn}(${expression.value})`
  } else {
    expression.value = `${fn}(`
  }
}

function appendPow2() {
  error.value = ''
  result.value = null
  if (expression.value) {
    expression.value = `(${expression.value})**2`
  } else {
    expression.value = '**2'
  }
}

function calculate() {
  error.value = ''
  const expr = expression.value.trim()
  if (!expr) return

  let res
  try {
    // Safe evaluation: only allow math-safe characters
    if (!/^[0-9+\-*/().^ Math.sincotaglqreEPI\s]+$/.test(expr)) {
      throw new Error('Invalid expression')
    }
    // eslint-disable-next-line no-new-func
    res = Function('"use strict"; return (' + expr + ')')()
    if (typeof res !== 'number' || !isFinite(res)) {
      throw new Error(isNaN(res) ? 'Not a number' : 'Result is infinite')
    }
  } catch (e) {
    error.value = e.message || 'Invalid expression'
    return
  }

  const rounded = parseFloat(res.toFixed(10))
  tracker.record('expr', 0, 0, rounded)
  history.value.push({ expression: expr, result: rounded })
  result.value = rounded

  if (window.electronAPI) {
    window.electronAPI.logCalculation({ operation: 'expr', expression: expr, result: rounded })
  }
}

function clearHistory() {
  tracker.counts = {}
  tracker.history = []
  history.value = []
}
</script>

<style scoped>
* { box-sizing: border-box; margin: 0; padding: 0; }

/* Make the app fill the entire Electron window */
:global(html), :global(body), :global(#app) {
  height: 100%;
  width: 100%;
  background: #1e1e2e;
}

.calculator {
  font-family: -apple-system, "Segoe UI", system-ui, sans-serif;
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  padding: 16px;
  background: #1e1e2e;
  color: #cdd6f4;
  overflow: hidden;
}

.calculator.scientific {
  /* no width override needed — always full window */
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

h1 {
  font-size: 1rem;
  margin: 0;
  color: #89b4fa;
}

.mode-toggle {
  display: flex;
  gap: 4px;
  background: #181825;
  border-radius: 8px;
  padding: 3px;
}

.mode-toggle button {
  background: none;
  border: none;
  color: #a6adc8;
  font-size: 0.75rem;
  padding: 4px 10px;
  border-radius: 6px;
  cursor: pointer;
}

.mode-toggle button.active {
  background: #45475a;
  color: #cdd6f4;
}

.display {
  background: #181825;
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 12px;
  min-height: 72px;
  text-align: right;
  flex-shrink: 0;
}

.expression {
  font-size: clamp(1rem, 2.5vw, 1.6rem);
  word-break: break-all;
  font-family: monospace;
}

.result {
  font-size: 1.1rem;
  color: #a6e3a1;
  margin-top: 4px;
}

.error {
  font-size: 0.85rem;
  color: #f38ba8;
  margin-top: 4px;
}

/* Scientific row */
.sci-buttons {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
  margin-bottom: 8px;
  flex-shrink: 0;
}

.btn.sci {
  background: #1e1e2e;
  border: 1px solid #45475a;
  border-radius: 8px;
  color: #cba6f7;
  font-size: clamp(0.7rem, 1.5vw, 0.9rem);
  padding: 0;
  height: 100%;
  min-height: 36px;
  cursor: pointer;
  transition: background 0.15s;
}

.btn.sci:hover { background: #313244; }

/* Standard grid — grows to fill remaining space */
.buttons {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(5, 1fr);
  gap: 8px;
  flex: 1;
  min-height: 0;
}

.btn {
  background: #313244;
  border: none;
  border-radius: 10px;
  color: #cdd6f4;
  font-size: clamp(1rem, 2.5vw, 1.4rem);
  padding: 0;
  cursor: pointer;
  transition: background 0.15s;
}

.btn:hover { background: #45475a; }
.btn.op { background: #45475a; color: #89b4fa; }
.btn.op:hover { background: #585b70; }
.btn.equals { background: #89b4fa; color: #1e1e2e; font-weight: 700; }
.btn.equals:hover { background: #74c7ec; }
.btn.span-two { grid-column: span 2; }

/* History */
.history {
  margin-top: 12px;
  background: #181825;
  border-radius: 10px;
  padding: 12px;
  flex-shrink: 0;
  max-height: 30vh;
  overflow-y: auto;
}

h2 {
  font-size: 0.9rem;
  margin: 0 0 10px;
  color: #89b4fa;
  display: flex;
  align-items: center;
  gap: 8px;
}

.badge {
  background: #45475a;
  border-radius: 99px;
  padding: 1px 8px;
  font-size: 0.75rem;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0 0 10px;
  max-height: 160px;
  overflow-y: auto;
}

li {
  font-size: 0.85rem;
  padding: 4px 0;
  border-bottom: 1px solid #313244;
  color: #a6adc8;
}

li:last-child { border-bottom: none; }

.hist-expr {
  font-family: monospace;
  color: #cdd6f4;
}

.btn-clear-history {
  background: none;
  border: 1px solid #45475a;
  color: #a6adc8;
  border-radius: 6px;
  padding: 4px 12px;
  font-size: 0.8rem;
  cursor: pointer;
}

.btn-clear-history:hover { background: #313244; }

.logpath {
  margin-top: 12px;
  font-size: 0.72rem;
  color: #585b70;
  word-break: break-all;
  text-align: center;
}
</style>
