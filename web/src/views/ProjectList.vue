<template>
  <div class="project-list">
    <header class="header">
      <h1>InsightWorkspace</h1>
      <p class="subtitle">당신의 통찰에 AI의 날개를</p>
    </header>

    <div class="container">
      <div class="actions">
        <button class="btn btn-primary" @click="createProject">
          + 새 프로젝트
        </button>
      </div>

      <div v-if="loading" class="loading">프로젝트 로딩 중...</div>

      <div v-else-if="projects.length === 0" class="empty">
        <p>아직 프로젝트가 없습니다.</p>
        <p class="hint">새 프로젝트를 만들어 시작하세요.</p>
      </div>

      <div v-else class="projects">
        <div 
          v-for="project in projects" 
          :key="project.id" 
          class="project-card card"
          @click="openProject(project.id)"
        >
          <h3>{{ project.title }}</h3>
          <p v-if="project.topic" class="topic">{{ project.topic }}</p>
          <div class="meta">
            <span>{{ formatDate(project.updatedAt) }}</span>
            <span v-if="project._count">{{ project._count.runs }}회 생성</span>
          </div>
          <button 
            class="delete-btn" 
            @click.stop="deleteProject(project.id)"
            title="삭제"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { projectApi, type Project } from '@/api';

const router = useRouter();
const projects = ref<Project[]>([]);
const loading = ref(true);

onMounted(async () => {
  await loadProjects();
});

async function loadProjects() {
  try {
    loading.value = true;
    const response = await projectApi.list();
    projects.value = response.data;
  } catch (error) {
    console.error('Failed to load projects:', error);
    alert('프로젝트 목록을 불러오는데 실패했습니다.');
  } finally {
    loading.value = false;
  }
}

async function createProject() {
  try {
    const response = await projectApi.create({ title: '새 프로젝트' });
    router.push(`/project/${response.data.id}`);
  } catch (error) {
    console.error('Failed to create project:', error);
    alert('프로젝트 생성에 실패했습니다.');
  }
}

function openProject(id: string) {
  router.push(`/project/${id}`);
}

async function deleteProject(id: string) {
  if (!confirm('정말 삭제하시겠습니까?')) return;
  
  try {
    await projectApi.delete(id);
    await loadProjects();
  } catch (error) {
    console.error('Failed to delete project:', error);
    alert('프로젝트 삭제에 실패했습니다.');
  }
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) return '오늘';
  if (days === 1) return '어제';
  if (days < 7) return `${days}일 전`;
  return date.toLocaleDateString('ko-KR');
}
</script>

<style scoped>
.project-list {
  min-height: 100vh;
  padding: 2rem;
}

.header {
  text-align: center;
  margin-bottom: 3rem;
}

.header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: var(--color-text-secondary);
  font-size: 1.125rem;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.actions {
  margin-bottom: 2rem;
}

.loading, .empty {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--color-text-secondary);
}

.empty .hint {
  margin-top: 0.5rem;
  font-size: 0.875rem;
}

.projects {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.project-card {
  position: relative;
  cursor: pointer;
  transition: all 0.2s;
  padding: 1.5rem;
}

.project-card:hover {
  transform: translateY(-2px);
  border-color: var(--color-accent);
}

.project-card h3 {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
}

.topic {
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.delete-btn {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  background: var(--color-bg-tertiary);
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.2s;
}

.project-card:hover .delete-btn {
  opacity: 1;
}

.delete-btn:hover {
  background: var(--color-danger);
  color: white;
}
</style>

