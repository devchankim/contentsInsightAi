<template>
  <div class="workspace">
    <header class="workspace-header">
      <button class="btn btn-secondary" @click="goBack">← 목록</button>
      <input 
        v-model="projectTitle" 
        class="title-input"
        @blur="updateTitle"
        placeholder="프로젝트 제목"
      />
      <div class="header-actions">
        <select v-model="llmProvider" class="provider-select">
          <option value="openai">OpenAI</option>
          <option value="anthropic">Anthropic</option>
        </select>
      </div>
    </header>

    <div class="workspace-content">
      <!-- LEFT: Input & Context -->
      <div class="panel panel-left">
        <h2>입력</h2>
        
        <div class="input-section">
          <label>레퍼런스 텍스트 (벤치마킹 영상 자막/대본)</label>
          <textarea 
            v-model="referenceText" 
            class="textarea"
            placeholder="분석하고 싶은 영상의 자막이나 대본을 붙여넣으세요...&#10;&#10;예: 안녕하세요 여러분! 오늘은 AI가 어떻게 작동하는지 알아볼게요..."
            rows="10"
          />
          <span class="char-count">{{ referenceText.length }}자</span>
        </div>

        <div class="input-section">
          <label>내 메모/자료 (내 경험, 관점, 자료)</label>
          <textarea 
            v-model="myNotes" 
            class="textarea"
            placeholder="내가 전달하고 싶은 내용을 자유롭게 작성하세요...&#10;&#10;예: &#10;- 작년에 AI 프로젝트 하면서 겪은 실패 경험&#10;- GPT 비용이 생각보다 많이 나왔던 이유&#10;- 실무에서는 프롬프트 엔지니어링이 핵심"
            rows="10"
          />
          <span class="char-count">{{ myNotes.length }}자</span>
        </div>

        <div class="warning-box">
          <small>💡 레퍼런스는 구조 참고용입니다. 문장을 복제하지 않도록 AI가 조정합니다.</small>
        </div>
      </div>

      <!-- CENTER: Settings & Actions -->
      <div class="panel panel-center">
        <h2>설정</h2>

        <div class="settings-section">
          <label>톤앤매너</label>
          <div class="preset-buttons">
            <button 
              v-for="p in presets" 
              :key="p.value"
              :class="['preset-btn', { active: preset === p.value }]"
              @click="preset = p.value"
            >
              {{ p.label }}
            </button>
          </div>
        </div>

        <div class="settings-section">
          <label>후킹 스타일</label>
          <div class="preset-buttons">
            <button 
              v-for="h in hookStyles" 
              :key="h.value"
              :class="['preset-btn', { active: hookStyle === h.value }]"
              @click="hookStyle = h.value"
            >
              {{ h.label }}
            </button>
          </div>
        </div>

        <div class="settings-section">
          <label>목표 길이</label>
          <div class="length-selector">
            <button 
              v-for="len in lengths" 
              :key="len"
              :class="['length-btn', { active: targetLength === len }]"
              @click="targetLength = len"
            >
              {{ len }}분
            </button>
          </div>
        </div>

        <div class="action-buttons">
          <button 
            class="btn btn-primary btn-block"
            @click="generateAnalysis"
            :disabled="!canAnalyze || loading"
          >
            {{ loading && step === 'analysis' ? '분석 중...' : '🔍 분석하기' }}
          </button>

          <button 
            class="btn btn-primary btn-block"
            @click="generateScript"
            :disabled="!canGenerateScript || loading"
          >
            {{ loading && step === 'script' ? '생성 중...' : '✨ 대본 생성하기' }}
          </button>
        </div>

        <div v-if="generationTime" class="time-info">
          ⏱️ {{ generationTime }}
        </div>
      </div>

      <!-- RIGHT: Output -->
      <div class="panel panel-right">
        <h2>결과</h2>

        <div v-if="!analysisResult && !scriptResult" class="empty-state">
          <p>👈 좌측에서 입력 후 분석 또는 대본 생성을 시작하세요</p>
        </div>

        <!-- Analysis Result -->
        <div v-if="analysisResult" class="result-section">
          <h3>📊 구조 분석</h3>
          <div class="outline">
            <div class="outline-item">
              <strong>Hook:</strong> {{ analysisResult.outline.hook }}
            </div>
            <div class="outline-item">
              <strong>Body:</strong> {{ analysisResult.outline.body }}
            </div>
            <div class="outline-item">
              <strong>Turn:</strong> {{ analysisResult.outline.turn }}
            </div>
            <div class="outline-item">
              <strong>Conclusion:</strong> {{ analysisResult.outline.conclusion }}
            </div>
          </div>

          <h3>💡 인사이트 카드</h3>
          <div class="insight-cards">
            <div 
              v-for="card in analysisResult.insightCards" 
              :key="card.id"
              :class="['insight-card', { selected: selectedCards.includes(card.id) }]"
              @click="toggleCard(card.id)"
            >
              <div class="card-header">
                <input 
                  type="checkbox" 
                  :checked="selectedCards.includes(card.id)"
                  @click.stop="toggleCard(card.id)"
                />
                <strong>{{ card.title }}</strong>
                <span class="badge">{{ card.suggestedPosition }}</span>
              </div>
              <p>{{ card.description }}</p>
              <div class="intensity">
                <span v-for="i in 5" :key="i" class="dot" :class="{ filled: i <= card.intensity }"></span>
              </div>
            </div>
          </div>
        </div>

        <!-- Script Result -->
        <div v-if="scriptResult" class="result-section script-section">
          <h3>🎬 생성 결과</h3>

          <div class="titles">
            <label>제목 후보</label>
            <div 
              v-for="(title, idx) in scriptResult.titleCandidates" 
              :key="idx"
              class="title-candidate"
            >
              {{ idx + 1 }}. {{ title }}
            </div>
          </div>

          <div class="thumbnails">
            <label>썸네일 컨셉</label>
            <div 
              v-for="(concept, idx) in scriptResult.thumbnailConcepts" 
              :key="idx"
              class="thumbnail-concept"
            >
              <strong>{{ idx + 1 }}.</strong> {{ concept.layout }} / "{{ concept.text }}"
            </div>
          </div>

          <h3>📝 2-Column 스크립트</h3>
          <div class="script-table">
            <div class="script-header">
              <div class="col-visual">Visual (화면/자막)</div>
              <div class="col-audio">Audio (내레이션)</div>
            </div>
            <div 
              v-for="(row, idx) in scriptResult.script" 
              :key="idx"
              class="script-row"
              @click="selectRow(idx)"
            >
              <div class="col-visual">{{ row.visual }}</div>
              <div class="col-audio">{{ row.audio }}</div>
            </div>
          </div>

          <!-- Retouch Panel (if row selected) -->
          <div v-if="selectedRowIdx !== null" class="retouch-panel">
            <h4>선택한 문단 수정</h4>
            <div class="retouch-buttons">
              <button class="btn btn-secondary" @click="retouch('shorter')">더 짧게</button>
              <button class="btn btn-secondary" @click="retouch('stimulating')">더 자극적으로</button>
              <button class="btn btn-secondary" @click="retouch('humor')">유머 추가</button>
            </div>
            <div v-if="retouchedText" class="retouched-result">
              <label>수정 결과:</label>
              <p>{{ retouchedText }}</p>
              <button class="btn btn-primary" @click="applyRetouch">적용</button>
              <button class="btn btn-secondary" @click="cancelRetouch">취소</button>
            </div>
          </div>

          <!-- Export Actions -->
          <div class="export-actions">
            <button class="btn btn-primary" @click="exportMarkdown">📄 Markdown 다운로드</button>
            <button class="btn btn-secondary" @click="copyToClipboard">📋 클립보드 복사</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { projectApi, generateApi, type AnalysisResult, type ScriptResult } from '@/api';

const route = useRoute();
const router = useRouter();
const projectId = route.params.id as string;

// Project state
const projectTitle = ref('새 프로젝트');
const llmProvider = ref<'openai' | 'anthropic'>('openai');

// Input state
const referenceText = ref('');
const myNotes = ref('');

// Settings
const preset = ref<'knowledge' | 'entertainer' | 'info'>('knowledge');
const hookStyle = ref<'curiosity' | 'benefit' | 'fear'>('curiosity');
const targetLength = ref(6);

const presets = [
  { value: 'knowledge', label: '지식전달형' },
  { value: 'entertainer', label: '엔터테이너형' },
  { value: 'info', label: '담백정보형' },
];

const hookStyles = [
  { value: 'curiosity', label: '호기심' },
  { value: 'benefit', label: '이득' },
  { value: 'fear', label: '공포/리스크' },
];

const lengths = [3, 6, 10];

// Generation state
const loading = ref(false);
const step = ref<'analysis' | 'script' | null>(null);
const analysisResult = ref<AnalysisResult | null>(null);
const scriptResult = ref<ScriptResult | null>(null);
const selectedCards = ref<string[]>([]);
const generationTime = ref('');

// Retouch state
const selectedRowIdx = ref<number | null>(null);
const retouchedText = ref('');

const canAnalyze = computed(() => 
  referenceText.value.length > 200 && myNotes.value.length > 50
);

const canGenerateScript = computed(() => 
  referenceText.value.length > 200 && myNotes.value.length > 50
);

onMounted(async () => {
  try {
    const response = await projectApi.get(projectId);
    projectTitle.value = response.data.title;
  } catch (error) {
    console.error('Failed to load project:', error);
  }
});

function goBack() {
  router.push('/');
}

async function updateTitle() {
  try {
    await projectApi.update(projectId, { title: projectTitle.value });
  } catch (error) {
    console.error('Failed to update title:', error);
  }
}

async function generateAnalysis() {
  if (!canAnalyze.value || loading.value) return;
  
  loading.value = true;
  step.value = 'analysis';
  const startTime = Date.now();
  
  try {
    const response = await generateApi.analysis({
      projectId,
      referenceText: referenceText.value,
      myNotes: myNotes.value,
      provider: llmProvider.value,
    });
    
    analysisResult.value = response.data;
    selectedCards.value = response.data.insightCards.map(c => c.id);
    
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    generationTime.value = `분석 완료 (${elapsed}초)`;
  } catch (error: any) {
    console.error('Analysis failed:', error);
    alert(`분석 실패: ${error.response?.data?.message || error.message}`);
  } finally {
    loading.value = false;
    step.value = null;
  }
}

async function generateScript() {
  if (!canGenerateScript.value || loading.value) return;
  
  loading.value = true;
  step.value = 'script';
  const startTime = Date.now();
  
  try {
    const response = await generateApi.script({
      projectId,
      referenceText: referenceText.value,
      myNotes: myNotes.value,
      preset: preset.value,
      hookStyle: hookStyle.value,
      targetLength: targetLength.value,
      selectedInsightCards: selectedCards.value.length > 0 ? selectedCards.value : undefined,
      provider: llmProvider.value,
    });
    
    scriptResult.value = response.data;
    
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    generationTime.value = `대본 생성 완료 (${elapsed}초)`;
  } catch (error: any) {
    console.error('Script generation failed:', error);
    alert(`대본 생성 실패: ${error.response?.data?.message || error.message}`);
  } finally {
    loading.value = false;
    step.value = null;
  }
}

function toggleCard(id: string) {
  const idx = selectedCards.value.indexOf(id);
  if (idx >= 0) {
    selectedCards.value.splice(idx, 1);
  } else {
    selectedCards.value.push(id);
  }
}

function selectRow(idx: number) {
  selectedRowIdx.value = idx;
  retouchedText.value = '';
}

async function retouch(style: 'shorter' | 'stimulating' | 'humor') {
  if (selectedRowIdx.value === null || !scriptResult.value) return;
  
  const row = scriptResult.value.script[selectedRowIdx.value];
  const originalText = row.audio;
  
  try {
    loading.value = true;
    const response = await generateApi.retouch({
      projectId,
      originalText,
      style,
      provider: llmProvider.value,
    });
    retouchedText.value = response.data.retouchedText;
  } catch (error: any) {
    console.error('Retouch failed:', error);
    alert(`리터칭 실패: ${error.response?.data?.message || error.message}`);
  } finally {
    loading.value = false;
  }
}

function applyRetouch() {
  if (selectedRowIdx.value === null || !scriptResult.value || !retouchedText.value) return;
  scriptResult.value.script[selectedRowIdx.value].audio = retouchedText.value;
  cancelRetouch();
}

function cancelRetouch() {
  selectedRowIdx.value = null;
  retouchedText.value = '';
}

function exportMarkdown() {
  if (!scriptResult.value) return;
  
  let md = `# ${projectTitle.value}\n\n`;
  
  md += `## 제목 후보\n\n`;
  scriptResult.value.titleCandidates.forEach((title, idx) => {
    md += `${idx + 1}. ${title}\n`;
  });
  
  md += `\n## 썸네일 컨셉\n\n`;
  scriptResult.value.thumbnailConcepts.forEach((concept, idx) => {
    md += `${idx + 1}. ${concept.layout} / "${concept.text}"\n`;
  });
  
  md += `\n## 2-Column 스크립트\n\n`;
  md += `| Visual (화면/자막) | Audio (내레이션) |\n`;
  md += `|---|---|\n`;
  scriptResult.value.script.forEach(row => {
    md += `| ${row.visual} | ${row.audio} |\n`;
  });
  
  const blob = new Blob([md], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${projectTitle.value}.md`;
  a.click();
  URL.revokeObjectURL(url);
}

function copyToClipboard() {
  if (!scriptResult.value) return;
  
  let text = `${projectTitle.value}\n\n`;
  text += `제목 후보:\n`;
  scriptResult.value.titleCandidates.forEach((title, idx) => {
    text += `${idx + 1}. ${title}\n`;
  });
  text += `\n2-Column 스크립트:\n\n`;
  scriptResult.value.script.forEach((row, idx) => {
    text += `[${idx + 1}]\nVisual: ${row.visual}\nAudio: ${row.audio}\n\n`;
  });
  
  navigator.clipboard.writeText(text).then(() => {
    alert('클립보드에 복사되었습니다!');
  });
}
</script>

<style scoped>
.workspace {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.workspace-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 2rem;
  background: var(--color-bg-secondary);
  border-bottom: 1px solid var(--color-border);
}

.title-input {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--color-text-primary);
  font-size: 1.25rem;
  font-weight: 600;
}

.provider-select {
  padding: 0.5rem;
  background: var(--color-bg-tertiary);
  border: 1px solid var(--color-border);
  border-radius: 0.375rem;
  color: var(--color-text-primary);
  font-size: 0.875rem;
}

.workspace-content {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 350px 1fr;
  gap: 1px;
  background: var(--color-border);
  overflow: hidden;
}

.panel {
  background: var(--color-bg-primary);
  padding: 2rem;
  overflow-y: auto;
}

.panel h2 {
  font-size: 1.25rem;
  margin-bottom: 1.5rem;
  color: var(--color-text-primary);
}

.panel h3 {
  font-size: 1rem;
  margin: 2rem 0 1rem;
  color: var(--color-accent);
}

.input-section {
  margin-bottom: 1.5rem;
}

.input-section label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.char-count {
  display: block;
  text-align: right;
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  margin-top: 0.25rem;
}

.warning-box {
  padding: 0.75rem;
  background: var(--color-bg-tertiary);
  border-left: 3px solid var(--color-warning);
  border-radius: 0.25rem;
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.settings-section {
  margin-bottom: 1.5rem;
}

.settings-section label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.preset-buttons, .length-selector {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.preset-btn, .length-btn {
  padding: 0.5rem 1rem;
  background: var(--color-bg-tertiary);
  border: 1px solid var(--color-border);
  border-radius: 0.375rem;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  transition: all 0.2s;
}

.preset-btn:hover, .length-btn:hover {
  border-color: var(--color-accent);
}

.preset-btn.active, .length-btn.active {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: white;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 2rem;
}

.btn-block {
  width: 100%;
}

.time-info {
  margin-top: 1rem;
  padding: 0.75rem;
  background: var(--color-bg-tertiary);
  border-radius: 0.375rem;
  font-size: 0.875rem;
  text-align: center;
  color: var(--color-success);
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--color-text-secondary);
}

.outline {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.outline-item {
  padding: 1rem;
  background: var(--color-bg-secondary);
  border-radius: 0.375rem;
  font-size: 0.875rem;
  line-height: 1.6;
}

.outline-item strong {
  color: var(--color-accent);
  display: block;
  margin-bottom: 0.5rem;
}

.insight-cards {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.insight-card {
  padding: 1rem;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
}

.insight-card:hover {
  border-color: var(--color-accent);
}

.insight-card.selected {
  border-color: var(--color-accent);
  background: var(--color-bg-tertiary);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.badge {
  margin-left: auto;
  padding: 0.125rem 0.5rem;
  background: var(--color-bg-tertiary);
  border-radius: 0.25rem;
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.intensity {
  display: flex;
  gap: 0.25rem;
  margin-top: 0.5rem;
}

.dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: var(--color-border);
}

.dot.filled {
  background: var(--color-accent);
}

.result-section {
  margin-bottom: 2rem;
}

.titles, .thumbnails {
  margin-bottom: 1.5rem;
}

.titles label, .thumbnails label {
  display: block;
  font-weight: 500;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.title-candidate, .thumbnail-concept {
  padding: 0.5rem;
  background: var(--color-bg-secondary);
  border-radius: 0.25rem;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.script-table {
  border: 1px solid var(--color-border);
  border-radius: 0.375rem;
  overflow: hidden;
}

.script-header {
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: var(--color-bg-tertiary);
  font-weight: 600;
  font-size: 0.875rem;
}

.script-header > div {
  padding: 0.75rem;
  border-right: 1px solid var(--color-border);
}

.script-header > div:last-child {
  border-right: none;
}

.script-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  border-top: 1px solid var(--color-border);
  cursor: pointer;
  transition: background 0.2s;
}

.script-row:hover {
  background: var(--color-bg-secondary);
}

.col-visual, .col-audio {
  padding: 0.75rem;
  font-size: 0.875rem;
  line-height: 1.6;
}

.col-visual {
  border-right: 1px solid var(--color-border);
  color: var(--color-text-secondary);
}

.retouch-panel {
  margin-top: 1.5rem;
  padding: 1rem;
  background: var(--color-bg-secondary);
  border-radius: 0.375rem;
}

.retouch-panel h4 {
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

.retouch-buttons {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.retouched-result {
  padding: 1rem;
  background: var(--color-bg-tertiary);
  border-radius: 0.375rem;
  margin-top: 1rem;
}

.retouched-result label {
  display: block;
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  margin-bottom: 0.5rem;
}

.retouched-result p {
  margin-bottom: 1rem;
  font-size: 0.875rem;
  line-height: 1.6;
}

.export-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--color-border);
}
</style>

