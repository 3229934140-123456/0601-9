const LivePage = {
    currentMatchId: 6,
    isCollected: false,
    danmakuEnabled: true,
    danmakuInterval: null,

    render(container) {
        if (this.danmakuInterval) {
            clearInterval(this.danmakuInterval);
            this.danmakuInterval = null;
        }
        container.innerHTML = this.generateHTML();
        this.bindEvents();
        this.startDanmakuSimulation();
    },

    generateHTML() {
        const currentMatch = getMatchById(this.currentMatchId);
        const liveMatches = AppData.matches.filter(m => m.status === 'live');
        const upcomingMatches = AppData.matches.filter(m => m.status === 'upcoming').slice(0, 4);
        const danmakuList = AppData.danmakuList.filter(d => d.status === 'approved');

        this.isCollected = userCollections.includes(this.currentMatchId);

        const hasStream = currentMatch && currentMatch.streamUrl && currentMatch.streamPlatform;

        return `
            <div class="live-container">
                <div class="live-main">
                    <div class="live-player">
                        <div class="live-badge">直播中</div>
                        <div class="live-viewers">
                            👁️ 12,580
                        </div>
                        ${hasStream ? this.renderStreamPlayer(currentMatch) : this.renderPlaceholder(currentMatch)}
                    </div>

                    <div class="live-info-bar">
                        <div>
                            <h3 class="live-title">
                                ${currentMatch ? `【${currentMatch.round}】${currentMatch.team1Name} VS ${currentMatch.team2Name}` : '暂无直播比赛'}
                            </h3>
                            <p class="text-muted text-sm mt-1">
                                ${currentMatch ? `${currentMatch.date} · ${currentMatch.venue}` : ''}
                            </p>
                        </div>
                        <div class="live-actions">
                            <button class="collect-btn ${this.isCollected ? 'active' : ''}" id="collectBtn">
                                ${this.isCollected ? '⭐ 已收藏' : '☆ 收藏'}
                            </button>
                            <button class="collect-btn" id="shareBtn">
                                📤 分享
                            </button>
                            <button class="btn btn-primary btn-sm" id="embedStreamBtn">
                                🔗 ${hasStream ? '更换直播源' : '嵌入直播源'}
                            </button>
                            <button class="btn btn-secondary btn-sm" id="fullscreenBtn">
                                ⛶ 全屏
                            </button>
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">⚡ 精彩瞬间</h3>
                        </div>
                        <div class="card-body">
                            <div class="grid grid-4">
                                ${[1, 2, 3, 4].map(i => `
                                    <div class="moment-thumbnail">
                                        <img src="https://picsum.photos/seed/moment${i}/300/180" alt="精彩瞬间">
                                        <div class="moment-time">第${i}局 精彩团战</div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>

                    <div class="live-list-section">
                        <h3 class="text-lg font-bold mb-4">📺 更多直播</h3>
                        <div class="live-list">
                            ${[...liveMatches, ...upcomingMatches].slice(0, 4).map((match, i) => `
                                <div class="live-card ${match.id === this.currentMatchId ? 'active' : ''}" data-match-id="${match.id}">
                                    <div class="live-card-cover">
                                        <img src="https://picsum.photos/seed/live${match.id}/400/225" alt="${match.team1Name} vs ${match.team2Name}">
                                        <div class="live-card-badge ${match.status === 'live' ? 'live' : 'upcoming'}">
                                            ${match.status === 'live' ? '直播中' : '即将开始'}
                                        </div>
                                    </div>
                                    <div class="live-card-info">
                                        <div class="live-card-title">${match.team1Name} vs ${match.team2Name}</div>
                                        <div class="live-card-meta">
                                            <span>${match.round}</span>
                                            <span>${match.status === 'live' ? '1.2万' : '预约'}</span>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <div class="live-sidebar">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">👥 对阵信息</h3>
                        </div>
                        <div class="card-body">
                            <div class="flex-between items-center">
                                <div class="text-center flex-1">
                                    <div class="text-3xl mb-2">🚀</div>
                                    <div class="font-bold">${currentMatch?.team1Name || '队伍1'}</div>
                                </div>
                                <div class="text-center px-4">
                                    <div class="text-3xl font-bold text-primary">
                                        ${currentMatch ? `${currentMatch.team1Score}:${currentMatch.team2Score}` : '0:0'}
                                    </div>
                                    <div class="text-xs text-muted mt-1">第2局</div>
                                </div>
                                <div class="text-center flex-1">
                                    <div class="text-3xl mb-2">⚡</div>
                                    <div class="font-bold">${currentMatch?.team2Name || '队伍2'}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="danmaku-panel">
                        <div class="danmaku-header">
                            <span class="danmaku-title">💬 弹幕互动</span>
                            <span class="danmaku-count">${danmakuList.length}条</span>
                        </div>
                        <div class="danmaku-list" id="danmakuList">
                            ${danmakuList.map(d => this.renderDanmakuItem(d)).join('')}
                        </div>
                        <div class="danmaku-input-area">
                            <input type="text" class="danmaku-input" id="danmakuInput" placeholder="发个弹幕聊聊...">
                            <button class="danmaku-send" id="sendDanmakuBtn">发送</button>
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">🏆 数据统计</h3>
                        </div>
                        <div class="card-body">
                            <div class="space-y-3">
                                <div class="flex-between text-sm">
                                    <span class="text-muted">击杀</span>
                                    <span class="font-bold">18 : 15</span>
                                </div>
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: 55%; background: linear-gradient(90deg, #6366f1 0%, #6366f1 100%);"></div>
                                </div>
                                <div class="flex-between text-sm mt-4">
                                    <span class="text-muted">经济</span>
                                    <span class="font-bold">52.3k : 48.7k</span>
                                </div>
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: 52%;"></div>
                                </div>
                                <div class="flex-between text-sm mt-4">
                                    <span class="text-muted">防御塔</span>
                                    <span class="font-bold">6 : 4</span>
                                </div>
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: 60%;"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    renderPlaceholder(currentMatch) {
        return `
            <div class="live-placeholder">
                <div class="live-placeholder-icon">📺</div>
                <div class="live-placeholder-text">直播画面区域</div>
                <div class="live-placeholder-desc text-muted text-sm mt-2">
                    ${currentMatch ? `${currentMatch.team1Name} VS ${currentMatch.team2Name}` : '暂无直播'}
                </div>
                <button class="btn btn-primary mt-4" id="embedStreamBtn">
                    🔗 嵌入直播源
                </button>
            </div>
        `;
    },

    renderStreamPlayer(match) {
        const platformIcons = {
            'B站直播': '📺',
            '虎牙直播': '🐯',
            '斗鱼直播': '🐟',
            '抖音直播': '🎵',
            '自定义URL': '🔗'
        };
        const icon = platformIcons[match.streamPlatform] || '🔗';

        return `
            <div class="live-stream-container">
                <div class="stream-embed-area">
                    <div class="stream-info-banner">
                        <div class="stream-platform">
                        <span class="stream-platform-icon">${icon}</span>
                        <span class="stream-platform-name">${match.streamPlatform}</span>
                    </div>
                    <div class="stream-url-info">
                        <span class="text-muted text-sm">直播地址：</span>
                        <a href="${match.streamUrl}" target="_blank" class="stream-url-link">${match.streamUrl}</a>
                    </div>
                </div>
                <div class="stream-preview">
                    <img src="https://picsum.photos/seed/stream${match.id}/800/450" alt="直播画面预览" class="stream-preview-img">
                    <div class="stream-overlay">
                        <div class="stream-play-btn">▶</div>
                        <div class="stream-live-indicator">
                            <span class="live-dot"></span>
                            LIVE
                        </div>
                    </div>
                </div>
                <div class="stream-quality-bar">
                    <span class="text-sm text-muted">画质：${match.streamQuality || '自动'}</span>
                    <span class="text-sm text-muted">分辨率：1920x1080</span>
                </div>
            </div>
        `;
    },

    renderDanmakuItem(danmaku) {
        return `
            <div class="danmaku-item">
                <span class="danmaku-user">${danmaku.user}：</span>
                <span>${danmaku.content}</span>
            </div>
        `;
    },

    bindEvents() {
        document.getElementById('collectBtn')?.addEventListener('click', () => {
            this.toggleCollection();
        });

        document.querySelectorAll('[id^="embedStreamBtn"], .embed-stream-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.showEmbedModal();
            });
        });

        document.getElementById('sendDanmakuBtn')?.addEventListener('click', () => {
            this.sendDanmaku();
        });

        document.getElementById('danmakuInput')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendDanmaku();
            }
        });

        document.querySelectorAll('.live-card').forEach(card => {
            card.addEventListener('click', () => {
                const matchId = parseInt(card.dataset.matchId);
                this.currentMatchId = matchId;
                this.refresh();
            });
        });

        document.getElementById('shareBtn')?.addEventListener('click', () => {
            Utils.showToast('分享链接已复制到剪贴板', 'success');
        });

        document.getElementById('fullscreenBtn')?.addEventListener('click', () => {
            Utils.showToast('全屏模式', 'info');
        });
    },

    toggleCollection() {
        if (this.isCollected) {
            userCollections = userCollections.filter(id => id !== this.currentMatchId);
            this.isCollected = false;
            Utils.showToast('已取消收藏', 'info');
        } else {
            userCollections.push(this.currentMatchId);
            this.isCollected = true;
            Utils.showToast('已添加到收藏夹', 'success');
        }

        const btn = document.getElementById('collectBtn');
        if (btn) {
            btn.classList.toggle('active', this.isCollected);
            btn.innerHTML = this.isCollected ? '⭐ 已收藏' : '☆ 收藏';
        }
    },

    sendDanmaku() {
        const input = document.getElementById('danmakuInput');
        const content = input.value.trim();
        
        if (!content) {
            Utils.showToast('请输入弹幕内容', 'warning');
            return;
        }

        const newDanmaku = {
            id: Date.now(),
            user: '电竞小王子',
            content: content,
            time: '实时',
            status: 'approved'
        };

        AppData.danmakuList.unshift(newDanmaku);
        
        const list = document.getElementById('danmakuList');
        const newItem = document.createElement('div');
        newItem.className = 'danmaku-item';
        newItem.innerHTML = `<span class="danmaku-user">${newDanmaku.user}：</span><span>${newDanmaku.content}</span>`;
        list.insertBefore(newItem, list.firstChild);

        input.value = '';
    },

    startDanmakuSimulation() {
        const messages = [
            '666666',
            '这波操作太秀了！',
            '加油加油！',
            '太强了吧',
            '这配合绝了',
            '我的天！',
            '精彩精彩',
            '主播牛逼',
            '前排围观',
            '哈哈哈笑死'
        ];

        let index = 0;
        
        this.danmakuInterval = setInterval(() => {
            if (!this.danmakuEnabled) return;
            
            const list = document.getElementById('danmakuList');
            if (!list) return;

            const randomUser = '观众' + Math.floor(Math.random() * 1000);
            const randomMsg = messages[Math.floor(Math.random() * messages.length)];
            
            const newItem = document.createElement('div');
            newItem.className = 'danmaku-item';
            newItem.innerHTML = `<span class="danmaku-user">${randomUser}：</span><span>${randomMsg}</span>`;
            list.appendChild(newItem);
            list.scrollTop = list.scrollHeight;

            index++;
        }, 3000);
    },

    showEmbedModal() {
        const currentMatch = getMatchById(this.currentMatchId);
        const currentPlatform = currentMatch?.streamPlatform || 'B站直播';
        const currentUrl = currentMatch?.streamUrl || '';
        const currentQuality = currentMatch?.streamQuality || 'auto';

        const platforms = [
            { name: 'B站直播', icon: '📺', placeholder: 'https://live.bilibili.com/...' },
            { name: '虎牙直播', icon: '🐯', placeholder: 'https://www.huya.com/...' },
            { name: '斗鱼直播', icon: '🐟', placeholder: 'https://www.douyu.com/...' },
            { name: '抖音直播', icon: '🎵', placeholder: 'https://live.douyin.com/...' },
            { name: '自定义URL', icon: '🔗', placeholder: 'https://...' }
        ];

        const content = `
            <div class="form-group">
                <label class="form-label">选择直播平台</label>
                <div class="grid grid-3 gap-3 mb-4">
                    ${platforms.map((p, i) => `
                        <div class="platform-option ${p.name === currentPlatform ? 'selected' : ''}" data-platform="${p.name}">
                            <div class="text-2xl mb-1">${p.icon}</div>
                            <div class="text-sm">${p.name}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="form-group">
                <label class="form-label">直播地址</label>
                <input type="text" class="form-input" id="streamUrl" placeholder="请输入直播房间地址或嵌入代码" value="${currentUrl}">
            </div>
            <div class="form-group">
                <label class="form-label">画质设置</label>
                <select class="form-select" id="streamQuality">
                    <option value="auto" ${currentQuality === 'auto' ? 'selected' : ''}>自动</option>
                    <option value="1080p" ${currentQuality === '1080p' ? 'selected' : ''}>1080P 高清</option>
                    <option value="720p" ${currentQuality === '720p' ? 'selected' : ''}>720P 流畅</option>
                    <option value="480p" ${currentQuality === '480p' ? 'selected' : ''}>480P 省流</option>
                </select>
            </div>
            <div class="p-3 bg-blue-500/10 rounded-lg border border-blue-500/30 mt-4">
                <p class="text-sm text-blue-400">
                    💡 嵌入后直播区域将显示直播平台和地址信息
                </p>
            </div>
        `;

        Utils.showModal(content, {
            title: '嵌入直播源',
            confirmText: '确认嵌入',
            onConfirm: () => {
                this.saveStreamEmbed();
            }
        });

        setTimeout(() => {
            document.querySelectorAll('.platform-option').forEach(opt => {
                opt.addEventListener('click', () => {
                    document.querySelectorAll('.platform-option').forEach(o => o.classList.remove('selected'));
                    opt.classList.add('selected');
                });
            });
        }, 100);
    },

    saveStreamEmbed() {
        const match = getMatchById(this.currentMatchId);
        if (!match) {
            Utils.showToast('未找到当前比赛', 'error');
            return;
        }

        const selectedPlatformEl = document.querySelector('.platform-option.selected');
        const platform = selectedPlatformEl ? selectedPlatformEl.dataset.platform : '自定义URL';
        const url = document.getElementById('streamUrl').value.trim();
        const quality = document.getElementById('streamQuality').value;

        if (!url) {
            Utils.showToast('请输入直播地址', 'warning');
            return false;
        }

        match.streamPlatform = platform;
        match.streamUrl = url;
        match.streamQuality = quality;

        if (typeof saveToLocalStorage === 'function') saveToLocalStorage();
        Utils.showToast('直播源嵌入成功！', 'success');
        this.refresh();
    },

    refresh() {
        const container = document.getElementById('page-live');
        this.render(container);
    }
};
