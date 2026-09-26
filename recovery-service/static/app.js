// API Base URL
const API_BASE = '/api';

// Navigation & Layout State
function openRecoveryWorkspace() {
    document.body.classList.remove('landing-active');
    window.scrollTo(0, 0);
}

function showLanding() {
    document.body.classList.add('landing-active');
    window.scrollTo(0, 0);
}

// Workspace Tabs
function setRecoveryMode(mode) {
    // Reset buttons
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    // Hide panels
    document.querySelectorAll('.panel').forEach(panel => panel.classList.remove('active'));
    
    // Activate target
    const targetBtn = document.querySelector(`[data-target="panel-${mode}"]`);
    if (targetBtn) targetBtn.classList.add('active');
    
    const targetPanel = document.getElementById(`panel-${mode}`);
    if (targetPanel) targetPanel.classList.add('active');
}

// Modal State
function closeInspector() {
    document.getElementById('inspector-modal').classList.add('hidden');
}

function openInspector(artifactId) {
    document.getElementById('inspector-modal').classList.remove('hidden');
    // Fetch and populate artifact details here in the future
}

function switchModalTab(tabId) {
    // Reset tabs
    document.querySelectorAll('.modal-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.modal-panel').forEach(panel => panel.classList.remove('active'));
    
    // Activate target
    const targetTab = document.querySelector(`.modal-tab[onclick="switchModalTab('${tabId}')"]`);
    if (targetTab) targetTab.classList.add('active');
    
    const targetPanel = document.getElementById(`tab-${tabId}`);
    if (targetPanel) targetPanel.classList.add('active');
}

// Toast Notifications
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerText = message;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Actions
function loadSample(type) {
    showToast(`Loading sample ${type}...`, 'info');
    // For demo purposes, we can simulate an upload
    setTimeout(() => {
        showToast('Sample loaded successfully', 'success');
        document.getElementById('workspace-grid').classList.remove('hidden');
    }, 1000);
}

// Upload & Recovery Flow
document.addEventListener('DOMContentLoaded', () => {
    const fileUpload = document.getElementById('file-upload');
    const btnSelectFiles = document.getElementById('btn-select-files');
    const btnUploadFolder = document.getElementById('btn-upload-folder');
    
    if (btnSelectFiles && fileUpload) {
        btnSelectFiles.addEventListener('click', () => fileUpload.click());
        
        fileUpload.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            showToast(`Uploading ${file.name}...`, 'info');
            
            const formData = new FormData();
            formData.append('file', file);
            
            try {
                const response = await fetch(`${API_BASE}/recover/upload`, {
                    method: 'POST',
                    body: formData
                });
                
                if (!response.ok) {
                    const err = await response.json();
                    throw new Error(err.detail || 'Upload failed');
                }
                
                const data = await response.json();
                showToast('Recovery scan complete', 'success');
                
                if (data.job_id) {
                    await fetchArtifacts(data.job_id);
                }
            } catch (error) {
                showToast(`Error: ${error.message}`, 'error');
            }
            
            // Reset input
            fileUpload.value = '';
        });
    }
});

async function fetchArtifacts(jobId) {
    try {
        const response = await fetch(`${API_BASE}/recoveries/${jobId}/artifacts`);
        if (!response.ok) throw new Error('Failed to fetch artifacts');
        
        const artifacts = await response.json();
        
        const artifactList = document.getElementById('artifact-list');
        const evidenceList = document.getElementById('evidence-list');
        
        if (artifactList) artifactList.innerHTML = '';
        if (evidenceList) evidenceList.innerHTML = `
            <li class="evidence-item">
                <div>
                    <strong>Job ${jobId.substring(0, 8)}</strong>
                    <div style="font-size:0.75rem; color:var(--text-muted)">Source Evidence</div>
                </div>
            </li>
        `;
        
        artifacts.forEach(a => {
            const li = document.createElement('li');
            li.className = 'artifact-item';
            li.innerHTML = `
                <div>
                    <strong>${a.filename || 'Unknown'}</strong>
                    <div style="font-size:0.75rem; color:var(--text-muted)">${a.type || 'Unknown Type'} | ${a.size} bytes</div>
                </div>
                <button class="pill-btn small primary" onclick="openInspector('${a.artifact_id}')">Inspect</button>
            `;
            if (artifactList) artifactList.appendChild(li);
        });
        
        document.getElementById('workspace-grid').classList.remove('hidden');
        
    } catch (error) {
        showToast(`Error fetching artifacts: ${error.message}`, 'error');
    }
}

function scanDrive() {
    const driveSelect = document.getElementById('drive-select');
    if (!driveSelect.value) {
        showToast('Please select a drive', 'error');
        return;
    }
    
    // Simulate error banner for admin rights
    document.getElementById('admin-error').classList.remove('hidden');
    showToast('Requires Administrator Privileges', 'error');
}
