const RecordPage = {
    currentTournamentId: 1,
    currentTab: 'ranking',

    render(container) {
        container.innerHTML = this.generateHTML();
        this.bindEvents();
    },

    generateHTML() {
        const tournamentOptions = AppData.tournaments.map(t => 
            `<option value="${t.id}" ${t.id === this.currentTournamentId ? 'selected' : ''}>${t.gameIcon} ${t.name}</option>`
        ).join('');

        return `
            <div class="flex-between mb-6">
                <div class="flex gap-3 items-center">
                    <select id="recordTournamentSelect" class="form-input" style="width: auto;">
                        ${tournamentOptions}
                    </select>
                </div>
                <div class="flex gap-2">
                    <button class="btn btn-secondary btn-sm" id="exportDataBtn">
                        📤 导出数据
                    </button>
                </div>
            </div>

            <div class="tabs">
                <div class="tab-item ${this.currentTab === 'ranking' ? 'active' : ''}" data-tab="ranking">积分排行</div>
                <div class="tab-item ${this.currentTab === 'results' ? 'active' : ''}" data-tab="results">比赛结果</div>
                <div class="tab-item ${this.currentTab === 'players' ? 'active' : ''}" data-tab="players">选手资料</div>
            </div>

            <div class="tab-content ${this.currentTab === 'ranking' ? 'active' : ''}" data-tab-content="ranking">
                ${this.renderRankingTab()}
            </div>

            <div class="tab-content ${this.currentTab === 'results' ? 'active' : ''}" data-tab-content="results">
                ${this.renderResultsTab()}
            </div>

            <div class="tab-content ${this.currentTab === 'players' ? 'active' : ''}" data-tab-content="players">
                ${this.renderPlayersTab()}
            </div>
        `;
    },

    renderRankingTab() {
        const teams = getTeamsByTournament(this.currentTournamentId).sort((a, b) => b.points - a.points);

        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">🏆 战队积分榜</h3>
                    <span class="text-muted text-sm">共 ${teams.length} 支战队</span>
                </div>
                <div class="card-body" style="padding: 0;">
                    <table class="ranking-table">
                        <thead>
                            <tr>
                                <th>排名</th>
                                <th>战队</th>
                                <th>场次</th>
                                <th>胜/负</th>
                                <th>积分</th>
                                <th>胜率</th>
                                <th>状态</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${teams.map((team, index) => `
                                <tr>
                                    <td>
                                        <div class="rank-badge rank-${index + 1 <= 3 ? index + 1 : 'default'}">
                                            ${index + 1}
                                        </div>
                                    </td>
                                    <td>
                                        <div class="team-rank-info">
                                            <div class="team-rank-logo">${team.logo}</div>
                                            <div>
                                                <div class="font-semibold">${team.name}</div>
                                                <div class="text-xs text-muted">队长：${team.captain}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>${team.wins + team.losses}</td>
                                    <td>
                                        <span class="text-success">${team.wins}</span>
                                        <span class="text-muted"> / </span>
                                        <span class="text-danger">${team.losses}</span>
                                    </td>
                                    <td class="font-bold text-lg text-primary">${team.points}</td>
                                    <td>
                                        <div class="flex items-center gap-2">
                                            <div class="win-rate-bar">
                                                <div class="win-rate-fill" style="width: ${Math.round(team.wins / (team.wins + team.losses) * 100)}%"></div>
                                            </div>
                                            <span class="text-sm">${Math.round(team.wins / (team.wins + team.losses) * 100)}%</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span class="payment-status ${team.paymentStatus === 'paid' ? 'success' : 'pending'}">
                                            ${team.paymentStatus === 'paid' ? '已确认' : '待确认'}
                                        </span>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    renderResultsTab() {
        const matches = getMatchesByTournament(this.currentTournamentId).filter(m => m.status === 'ended');

        return `
            <div class="mb-4">
                <span class="text-muted text-sm">共 ${matches.length} 场已结束比赛</span>
            </div>
            <div class="match-results">
                ${matches.length > 0 ? matches.map(match => this.renderMatchResult(match)).join('') : `
                    <div class="empty-state">
                        <div class="empty-state-icon">📋</div>
                        <div class="empty-state-text">暂无比赛结果</div>
                        <div class="empty-state-desc">比赛结束后将在这里显示</div>
                    </div>
                `}
            </div>
        `;
    },

    renderMatchResult(match) {
        const team1 = getTeamById(match.team1Id);
        const team2 = getTeamById(match.team2Id);

        const team1Win = match.team1Score > match.team2Score;

        return `
            <div class="match-result-card" onclick="RecordPage.showMatchDetail(${match.id})" style="cursor: pointer;">
                <div class="result-info">
                    <div class="result-round">${match.round}</div>
                    <div class="result-date">${match.date}</div>
                </div>

                <div class="result-team left">
                    <span class="result-team-name ${team1Win ? 'winner-text' : 'loser-text'}">${match.team1Name}</span>
                    <div class="result-team-logo">${team1?.logo || '🎮'}</div>
                </div>

                <div class="result-score">
                    <span class="${team1Win ? 'winner-text' : 'loser-text'}">${match.team1Score}</span>
                    <span class="text-muted mx-2">:</span>
                    <span class="${!team1Win ? 'winner-text' : 'loser-text'}">${match.team2Score}</span>
                </div>

                <div class="result-team right">
                    <div class="result-team-logo">${team2?.logo || '🎮'}</div>
                    <span class="result-team-name ${!team1Win ? 'winner-text' : 'loser-text'}">${match.team2Name}</span>
                </div>

                <div class="result-actions" onclick="event.stopPropagation();">
                    <button class="screenshot-btn" onclick="RecordPage.showScreenshots(${match.id})">
                        🖼️ 赛果截图
                    </button>
                    <button class="screenshot-btn upload-btn" onclick="RecordPage.uploadScreenshot(${match.id})">
                        📤 上传
                    </button>
                    <button class="screenshot-btn" onclick="RecordPage.showMatchDetail(${match.id})">
                        📋 详情
                    </button>
                </div>
            </div>
        `;
    },

    renderPlayersTab() {
        const players = AppData.players;

        return `
            <div class="mb-4">
                <span class="text-muted text-sm">共 ${players.length} 名选手</span>
            </div>
            <div class="players-grid">
                ${players.map(player => this.renderPlayerCard(player)).join('')}
            </div>
        `;
    },

    renderPlayerCard(player) {
        return `
            <div class="player-card" onclick="RecordPage.showPlayerDetail(${player.id})">
                <div class="player-header">
                    <div class="player-avatar-lg">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${player.avatar}" alt="${player.name}">
                    </div>
                    <div class="player-basic">
                        <h4 class="player-name-lg">${player.name}</h4>
                        <p class="player-nickname">${player.nickname}</p>
                    </div>
                    <span class="player-rank-badge">${player.rank}</span>
                </div>
                <div class="player-stats">
                    <div class="player-stat">
                        <div class="player-stat-value">${player.totalMatches}</div>
                        <div class="player-stat-label">总场次</div>
                    </div>
                    <div class="player-stat">
                        <div class="player-stat-value">${player.winRate}%</div>
                        <div class="player-stat-label">胜率</div>
                    </div>
                    <div class="player-stat">
                        <div class="player-stat-value">${player.mvpCount}</div>
                        <div class="player-stat-label">MVP</div>
                    </div>
                </div>
                <div class="player-heroes">
                    <p class="heroes-title">招牌英雄</p>
                    <div class="hero-tags">
                        ${player.signatureHeroes.map(hero => `<span class="hero-tag">${hero}</span>`).join('')}
                    </div>
                </div>
            </div>
        `;
    },

    bindEvents() {
        document.getElementById('recordTournamentSelect').addEventListener('change', (e) => {
            this.currentTournamentId = parseInt(e.target.value);
            this.refresh();
        });

        document.querySelectorAll('.tab-item[data-tab]').forEach(tab => {
            tab.addEventListener('click', () => {
                this.currentTab = tab.dataset.tab;
                this.refresh();
            });
        });

        document.getElementById('exportDataBtn').addEventListener('click', () => {
            this.showExportModal();
        });
    },

    showScreenshots(matchId) {
        const match = getMatchById(matchId);
        const screenshots = match?.screenshots || [];

        const content = `
            <div class="text-center mb-4">
                <h4 class="font-bold text-lg">${match.team1Name} VS ${match.team2Name}</h4>
                <p class="text-muted">${match.round} · ${match.team1Score}:${match.team2Score}</p>
                <p class="text-sm text-muted mt-1">共 ${screenshots.length} 张截图</p>
            </div>
            <div class="grid grid-2 gap-4">
                ${screenshots.length > 0 ? screenshots.map((src, i) => `
                    <div class="screenshot-preview" style="position: relative;">
                        <img src="${src}" alt="赛果截图 ${i + 1}" style="width: 100%; border-radius: 8px; aspect-ratio: 4/3; object-fit: cover;">
                        <div class="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            第${i + 1}张
                        </div>
                    </div>
                `).join('') : `
                    <div class="col-span-2 text-center py-8">
                        <div class="text-4xl mb-3">🖼️</div>
                        <p class="text-muted">暂无赛果截图</p>
                    </div>
                `}
            </div>
            <div class="mt-4 flex justify-center gap-2">
                <button class="btn btn-primary" id="addMoreScreenshotsBtn">
                    📤 上传更多截图
                </button>
            </div>
        `;

        Utils.showModal(content, {
            title: '🖼️ 赛果截图',
            size: 'lg',
            showFooter: false
        });

        setTimeout(() => {
            const addBtn = document.getElementById('addMoreScreenshotsBtn');
            if (addBtn) {
                addBtn.addEventListener('click', () => {
                    Utils.closeModal();
                    this.uploadScreenshot(matchId);
                });
            }
        }, 100);
    },

    uploadScreenshot(matchId) {
        const match = getMatchById(matchId);
        const currentCount = match?.screenshots?.length || 0;

        const content = `
            <div class="form-group">
                <label class="form-label">上传赛果截图</label>
                <div class="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors" id="uploadArea">
                    <div class="text-4xl mb-3">🖼️</div>
                    <p class="font-semibold mb-1">点击或拖拽图片到这里</p>
                    <p class="text-sm text-muted">支持 JPG、PNG 格式，单张不超过 5MB</p>
                </div>
                <div id="previewContainer" class="mt-3 grid grid-3 gap-2"></div>
            </div>
            <div class="form-group">
                <label class="form-label">比赛场次</label>
                <select class="form-select" id="screenshotRound">
                    <option value="第1局">第1局</option>
                    <option value="第2局">第2局</option>
                    <option value="第3局">第3局</option>
                    <option value="第4局">第4局</option>
                    <option value="第5局">第5局</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">备注说明</label>
                <textarea class="form-textarea" id="screenshotNote" placeholder="可选，填写截图相关说明"></textarea>
            </div>
            <div class="p-3 bg-amber-500/10 rounded-lg border border-amber-500/30">
                <p class="text-sm text-amber-400">
                    💡 当前已有 ${currentCount} 张截图，上传后将追加到列表中
                </p>
            </div>
        `;

        Utils.showModal(content, {
            title: '📤 上传赛果截图',
            confirmText: '确认上传',
            onConfirm: () => {
                this.confirmUploadScreenshot(matchId);
            }
        });

        setTimeout(() => {
            const uploadArea = document.getElementById('uploadArea');
            if (uploadArea) {
                uploadArea.addEventListener('click', () => {
                    this.simulateAddScreenshot(matchId);
                });
            }
        }, 100);
    },

    simulateAddScreenshot(matchId) {
        const match = getMatchById(matchId);
        const previewContainer = document.getElementById('previewContainer');
        
        if (!match || !previewContainer) return;

        const randomSeed = Date.now();
        const mockImageUrl = `https://picsum.photos/seed/screenshot${randomSeed}/400/300`;

        if (!this.tempScreenshots) {
            this.tempScreenshots = [];
        }
        this.tempScreenshots.push(mockImageUrl);

        const index = this.tempScreenshots.length;
        const previewItem = document.createElement('div');
        previewItem.className = 'relative';
        previewItem.innerHTML = `
            <img src="${mockImageUrl}" alt="预览" style="width: 100%; aspect-ratio: 4/3; object-fit: cover; border-radius: 6px;">
            <div class="absolute top-1 right-1 bg-black/70 text-white text-xs px-1 rounded">第${index}张</div>
        `;
        previewContainer.appendChild(previewItem);

        Utils.showToast(`已添加第 ${index} 张截图预览`, 'success');
    },

    confirmUploadScreenshot(matchId) {
        const match = getMatchById(matchId);
        if (!match) return;

        const newScreenshots = this.tempScreenshots || [];
        
        if (newScreenshots.length === 0) {
            Utils.showToast('请先选择要上传的图片', 'warning');
            return false;
        }

        if (!match.screenshots) {
            match.screenshots = [];
        }

        match.screenshots.push(...newScreenshots);

        this.tempScreenshots = [];

        if (typeof saveToLocalStorage === 'function') saveToLocalStorage();
        Utils.showToast(`成功上传 ${newScreenshots.length} 张截图！`, 'success');
        this.refresh();
        
        setTimeout(() => {
            this.showScreenshots(matchId);
        }, 300);
    },

    showPlayerDetail(playerId) {
        const player = AppData.players.find(p => p.id === playerId);
        if (!player) return;

        const content = `
            <div class="text-center mb-6">
                <div class="player-avatar-lg mx-auto mb-4" style="width: 96px; height: 96px;">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${player.avatar}" alt="${player.name}">
                </div>
                <h3 class="text-2xl font-bold mb-1">${player.name}</h3>
                <p class="text-primary font-mono mb-2">${player.nickname}</p>
                <span class="player-rank-badge">${player.rank}</span>
            </div>

            <div class="grid grid-2 gap-4 mb-6">
                <div class="info-block">
                    <span class="info-label">学校学院</span>
                    <span class="info-value">${player.school}</span>
                </div>
                <div class="info-block">
                    <span class="info-label">年级</span>
                    <span class="info-value">${player.grade}</span>
                </div>
                <div class="info-block">
                    <span class="info-label">所属战队</span>
                    <span class="info-value">${player.teamName}</span>
                </div>
                <div class="info-block">
                    <span class="info-label">位置</span>
                    <span class="info-value">${player.position}</span>
                </div>
                <div class="info-block">
                    <span class="info-label">游戏ID</span>
                    <span class="info-value">${player.gameId}</span>
                </div>
                <div class="info-block">
                    <span class="info-label">入队时间</span>
                    <span class="info-value">${player.joinDate}</span>
                </div>
            </div>

            <h4 class="font-bold mb-3">📊 生涯数据</h4>
            <div class="grid grid-4 gap-3 mb-6">
                <div class="player-stat">
                    <div class="player-stat-value">${player.totalMatches}</div>
                    <div class="player-stat-label">总场次</div>
                </div>
                <div class="player-stat">
                    <div class="player-stat-value">${player.winRate}%</div>
                    <div class="player-stat-label">胜率</div>
                </div>
                <div class="player-stat">
                    <div class="player-stat-value">${player.kills}</div>
                    <div class="player-stat-label">总击杀</div>
                </div>
                <div class="player-stat">
                    <div class="player-stat-value">${player.mvpCount}</div>
                    <div class="player-stat-label">MVP次数</div>
                </div>
            </div>

            <h4 class="font-bold mb-3">⚔️ 招牌英雄</h4>
            <div class="hero-tags mb-4">
                ${player.signatureHeroes.map(hero => `<span class="hero-tag">${hero}</span>`).join('')}
            </div>
        `;

        Utils.showModal(content, {
            title: '👤 选手资料',
            size: 'lg',
            showFooter: false
        });
    },

    showExportModal() {
        const content = `
            <div class="form-group">
                <label class="form-label">导出内容</label>
                <div class="space-y-2">
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked class="export-checkbox" data-type="teams">
                        <span>战队数据</span>
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked class="export-checkbox" data-type="matches">
                        <span>比赛记录</span>
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" class="export-checkbox" data-type="players">
                        <span>选手数据</span>
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" class="export-checkbox" data-type="payments">
                        <span>缴费记录</span>
                    </label>
                </div>
            </div>
            <div class="form-group">
                <label class="form-label">导出格式</label>
                <div class="flex gap-3">
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="format" value="csv" checked>
                        <span>CSV 表格</span>
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="format" value="json">
                        <span>JSON 数据</span>
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="format" value="excel">
                        <span>Excel</span>
                    </label>
                </div>
            </div>
        `;

        Utils.showModal(content, {
            title: '📤 数据导出',
            confirmText: '开始导出',
            onConfirm: () => {
                const format = document.querySelector('input[name="format"]:checked').value;
                const filename = `赛事数据_${new Date().toISOString().split('T')[0]}.${format}`;
                
                const teams = getTeamsByTournament(this.currentTournamentId);
                
                if (format === 'csv') {
                    Utils.exportToCSV(teams.map(t => ({
                        排名: t.rank,
                        战队名称: t.name,
                        队长: t.captain,
                        胜场: t.wins,
                        败场: t.losses,
                        积分: t.points
                    })), filename);
                } else {
                    Utils.exportToJSON(teams, filename);
                }
                
                Utils.showToast('数据导出成功！', 'success');
            }
        });
    },

    showMatchDetail(matchId) {
        const match = getMatchById(matchId);
        if (!match) return;

        const team1 = getTeamById(match.team1Id);
        const team2 = getTeamById(match.team2Id);
        const screenshots = match.screenshots || [];
        const team1Win = match.team1Score > match.team2Score;

        const refereeTask = AppData.refereeTasks.find(t => t.matchId === matchId);
        const issues = refereeTask?.issues || [];

        const matchAppeals = AppData.appeals.filter(a => a.matchId === matchId);

        const content = `
            <div class="match-detail-header">
                <div class="match-detail-teams">
                    <div class="match-detail-team">
                        <div class="match-detail-team-logo">${team1?.logo || '🎮'}</div>
                        <div class="match-detail-team-name ${team1Win ? 'winner' : ''}">${match.team1Name}</div>
                    </div>
                    <div class="match-detail-score">
                        <div class="match-detail-score-number">
                            <span class="${team1Win ? 'text-success' : ''}">${match.team1Score}</span>
                            <span style="color: var(--text-muted);">:</span>
                            <span class="${!team1Win ? 'text-success' : ''}">${match.team2Score}</span>
                        </div>
                        <div class="text-sm text-muted">${match.round}</div>
                    </div>
                    <div class="match-detail-team">
                        <div class="match-detail-team-logo">${team2?.logo || '🎮'}</div>
                        <div class="match-detail-team-name ${!team1Win ? 'winner' : ''}">${match.team2Name}</div>
                    </div>
                </div>
                <div class="match-detail-info">
                    <span>📍 ${match.venue}</span>
                    <span>🕐 ${match.date}</span>
                    <span>⚖️ ${refereeTask?.referee || '待定'}</span>
                </div>
            </div>

            <div class="match-detail-tabs" id="matchDetailTabs">
                <div class="match-detail-tab active" data-tab="screenshots">🖼️ 赛果截图 (${screenshots.length})</div>
                <div class="match-detail-tab" data-tab="events">📋 裁判事件 (${issues.length})</div>
                <div class="match-detail-tab" data-tab="appeals">⚖️ 申诉记录</div>
            </div>

            <div class="match-detail-tab-content active" data-tab-content="screenshots">
                <div class="match-detail-section">
                    <h3 class="match-detail-section-title">🖼️ 赛果截图</h3>
                ${screenshots.length > 0 ? `
                    <div class="screenshots-grid">
                        ${screenshots.map((src, i) => `
                            <div class="screenshot-item" onclick="RecordPage.viewScreenshot('${src}')">
                                <img src="${src}" alt="赛果截图 ${i + 1}">
                            </div>
                        `).join('')}
                    </div>
                    <div class="export-actions">
                        <button class="btn btn-primary btn-sm" onclick="RecordPage.uploadScreenshot(${matchId}); Utils.closeModal();">
                            📤 上传更多截图
                        </button>
                    </div>
                ` : `
                    <div class="text-center py-8">
                        <div class="text-4xl mb-3">🖼️</div>
                        <p class="text-muted mb-4">暂无赛果截图</p>
                        <button class="btn btn-primary btn-sm" onclick="RecordPage.uploadScreenshot(${matchId}); Utils.closeModal();">
                            📤 上传截图
                        </button>
                    </div>
                `}
                </div>
            </div>

            <div class="match-detail-tab-content" data-tab-content="events">
                <div class="match-detail-section">
                    <h3 class="match-detail-section-title">📋 裁判事件记录</h3>
                ${issues.length > 0 ? `
                    <div class="space-y-3">
                        ${issues.map(issue => `
                            <div class="issue-item ${issue.status}">
                                <div class="issue-header">
                                    <span class="issue-type">${issue.type}</span>
                                    <span class="issue-time">${issue.time}</span>
                                    <span class="status-badge ${
                                        issue.status === 'resolved' ? 'status-active' :
                                        issue.status === 'rejected' ? 'status-ended' : 'status-pending'
                                    } text-xs">
                                        ${issue.status === 'resolved' ? '已解决' :
                                          issue.status === 'rejected' ? '已驳回' : '待处理'}
                                    </span>
                                </div>
                                <p class="issue-desc">${issue.description}</p>
                            </div>
                        `).join('')}
                    </div>
                ` : `
                    <div class="text-center py-8">
                        <div class="text-4xl mb-3">📋</div>
                        <p class="text-muted">本场比赛无裁判事件记录</p>
                    </div>
                `}
                </div>
            </div>

            <div class="match-detail-tab-content" data-tab-content="appeals">
                <div class="match-detail-section">
                    <h3 class="match-detail-section-title">⚖️ 申诉处理结果</h3>
            ${matchAppeals.length > 0 ? `
                    <div class="space-y-3">
                        ${matchAppeals.map(appeal => `
                            <div class="issue-item ${appeal.status}">
                                <div class="issue-header">
                                    <span class="issue-type">${appeal.type}</span>
                                    <span class="status-badge ${
                                        appeal.status === 'approved' ? 'status-active' :
                                        appeal.status === 'rejected' ? 'status-ended' : 'status-pending'
                                    } text-xs">
                                        ${appeal.status === 'approved' ? '申诉通过' :
                                          appeal.status === 'rejected' ? '申诉驳回' : '待处理'}
                                    </span>
                                </div>
                                <p class="issue-desc"><strong>申诉方：</strong>${appeal.team}</p>
                                <p class="issue-desc mt-1"><strong>申诉内容：</strong>${appeal.description}</p>
                                ${appeal.reviewer ? `<p class="text-sm text-muted mt-2"><strong>审核人：</strong>${appeal.reviewer}</p>` : ''}
                                ${appeal.reviewTime ? `<p class="text-sm text-muted mt-1"><strong>处理时间：</strong>${appeal.reviewTime}</p>` : ''}
                                ${appeal.reviewComment ? `<p class="text-sm text-muted mt-1"><strong>处理意见：</strong>${appeal.reviewComment}</p>` : ''}
                            </div>
                        `).join('')}
                    </div>
                ` : `
                    <div class="text-center py-8">
                        <div class="text-4xl mb-3">⚖️</div>
                        <p class="text-muted">本场比赛暂无申诉记录</p>
                    </div>
                `}
                </div>
            </div>

            <div class="match-detail-section">
                <h3 class="match-detail-section-title">📤 数据导出</h3>
                <div class="flex gap-3">
                    <button class="btn btn-secondary btn-sm" onclick="Utils.exportToJSON(${JSON.stringify(JSON.stringify(match))}, '比赛详情_${match.team1Name}vs${match.team2Name}.json')">
                        📄 导出 JSON
                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="RecordPage.exportMatchReport(${matchId})">
                        📊 导出战报
                    </button>
                </div>
            </div>
        `;

        Utils.showModal(content, {
            title: '📋 赛后详情',
            size: 'xl',
            showFooter: false
        });

        setTimeout(() => {
            this.bindMatchDetailTabs();
        }, 100);
    },

    bindMatchDetailTabs() {
        document.querySelectorAll('#matchDetailTabs .match-detail-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.dataset.tab;

                document.querySelectorAll('#matchDetailTabs .match-detail-tab').forEach(t => {
                    t.classList.remove('active');
                });
                tab.classList.add('active');

                document.querySelectorAll('.match-detail-tab-content').forEach(content => {
                    content.classList.remove('active');
                });
                const targetContent = document.querySelector(`.match-detail-tab-content[data-tab-content="${tabName}"]`);
                if (targetContent) {
                    targetContent.classList.add('active');
                }
            });
        });
    },

    viewScreenshot(imgSrc) {
        const content = `
            <img src="${imgSrc}" alt="截图预览" style="width: 100%; border-radius: 10px;">
        `;

        Utils.showModal(content, {
            title: '🔍 截图查看',
            size: 'xl',
            showFooter: false
        });
    },

    exportMatchReport(matchId) {
        const match = getMatchById(matchId);
        if (!match) return;

        const reportData = {
            比赛: `${match.team1Name} VS ${match.team2Name}`,
            轮次: match.round,
            日期: match.date,
            场地: match.venue,
            比分: `${match.team1Score} : ${match.team2Score}`,
            赛果截图数: match.screenshots?.length || 0
        };

        Utils.exportToJSON(reportData, `战报_${match.team1Name}vs${match.team2Name}.json`);
        Utils.showToast('战报导出成功！', 'success');
    },

    refresh() {
        const container = document.getElementById('page-record');
        this.render(container);
    }
};
