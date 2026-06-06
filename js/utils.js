const Utils = {
    formatDate(dateStr, format = 'YYYY-MM-DD') {
        const date = new Date(dateStr);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        return format
            .replace('YYYY', year)
            .replace('MM', month)
            .replace('DD', day)
            .replace('HH', hours)
            .replace('mm', minutes);
    },

    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        
        toast.innerHTML = `
            <span class="toast-icon">${icons[type] || 'ℹ️'}</span>
            <span class="toast-message">${message}</span>
        `;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideInRight 0.3s ease reverse';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    showModal(content, options = {}) {
        const overlay = document.getElementById('modalOverlay');
        const container = document.getElementById('modalContainer');
        
        const title = options.title || '提示';
        const showFooter = options.showFooter !== false;
        const confirmText = options.confirmText || '确定';
        const cancelText = options.cancelText || '取消';
        const onConfirm = options.onConfirm || null;
        const size = options.size || 'md';
        
        let sizeClass = '';
        if (size === 'lg') sizeClass = 'max-w-4xl';
        else if (size === 'sm') sizeClass = 'max-w-sm';
        
        container.className = `modal-container ${sizeClass}`;
        container.innerHTML = `
            <div class="modal-header">
                <h3 class="modal-title">${title}</h3>
                <button class="modal-close" onclick="Utils.closeModal()">✕</button>
            </div>
            <div class="modal-body">${content}</div>
            ${showFooter ? `
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="Utils.closeModal()">${cancelText}</button>
                    <button class="btn btn-primary" id="modalConfirmBtn">${confirmText}</button>
                </div>
            ` : ''}
        `;
        
        overlay.classList.add('active');
        
        if (onConfirm) {
            document.getElementById('modalConfirmBtn').addEventListener('click', () => {
                const result = onConfirm();
                if (result !== false) {
                    Utils.closeModal();
                }
            });
        }
        
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                Utils.closeModal();
            }
        });
    },

    closeModal() {
        const overlay = document.getElementById('modalOverlay');
        overlay.classList.remove('active');
    },

    confirm(message, onConfirm) {
        this.showModal(`<p style="padding: 20px 0;">${message}</p>`, {
            title: '确认操作',
            onConfirm: onConfirm
        });
    },

    formatNumber(num) {
        if (num >= 10000) {
            return (num / 10000).toFixed(1) + 'w';
        }
        return num.toLocaleString();
    },

    getStatusText(status) {
        const statusMap = {
            active: '进行中',
            pending: '报名中',
            ended: '已结束',
            live: '直播中',
            upcoming: '即将开始',
            completed: '已完成',
            ongoing: '进行中'
        };
        return statusMap[status] || status;
    },

    getStatusClass(status) {
        const classMap = {
            active: 'status-active',
            pending: 'status-pending',
            ended: 'status-ended',
            live: 'status-live',
            upcoming: 'status-pending',
            completed: 'status-active'
        };
        return classMap[status] || 'status-pending';
    },

    generateId() {
        return Date.now() + Math.random().toString(36).substr(2, 9);
    },

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    exportToCSV(data, filename) {
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => 
                headers.map(header => {
                    let cell = row[header];
                    if (typeof cell === 'string' && cell.includes(',')) {
                        cell = `"${cell}"`;
                    }
                    return cell;
                }).join(',')
            )
        ].join('\n');

        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },

    exportToJSON(data, filename) {
        const jsonContent = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },

    getAvatarUrl(seed) {
        return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
    }
};
