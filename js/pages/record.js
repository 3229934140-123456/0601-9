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
            <div class="match-result-card">
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

                <div class="result-actions">
                    <button class="screenshot-btn" onclick="RecordPage.showScreenshots(${match.id})">
                        🖼️ 赛果截图
                    </button>
                    <button class="screenshot-btn upload-btn" onclick="RecordPage.uploadScreenshot(${match.id})">
                        📤 上传
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
                <p class="text-muted">${match.round} · ${match.score || match.team1Score + ':' + match.team2Score}</p>
            </div>
            <div class="grid grid-2 gap-4">
                ${screenshots.length > 0 ? screenshots.map((src, i) => `
                    <div class="screenshot-preview">
                        <img src="${src}" alt="赛果截图 ${i + 1}" style="width: 100%; border-radius: 8px;">
                    </div>
                `).join('') : `
                    <div class="col-span-2 text-center py-8">
                        <p class="text-muted">暂无赛果截图</p>
                    </div>
                `}
            </div>
        `;

        Utils.showModal(content, {
            title: '🖼️ 赛果截图',
            size: 'lg',
            showFooter: screenshots.length === 0,
            confirmText: '上传截图',
            onConfirm: () => {
                Utils.showToast('请选择要上传的图片', 'info');
                return false;
            }
        });
    },

    uploadScreenshot(matchId) {
        const content = `
            <div class="form-group">
                <label class="form-label">上传赛果截图</label>
                <div class="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors">
                    <div class="text-4xl mb-3">🖼️</div>
                    <p class="font-semibold mb-1">点击或拖拽图片到这里</p>
                    <p class="text-sm text-muted">支持 JPG、PNG 格式，单张不超过 5MB</p>
                </div>
            </div>
            <div class="form-group">
                <label class="form-label">比赛场次</label>
                <select class="form-select">
                    <option>第1局</option>
                    <option>第2局</option>
                    <option>第3局</option>
                    <option>第4局</option>
                    <option>第5局</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">备注说明</label>
                <textarea class="form-textarea" placeholder="可选，填写截图相关说明"></textarea>
            </div>
        `;

        Utils.showModal(content, {
            title: '📤 上传赛果截图',
            confirmText: '确认上传',
            onConfirm: () => {
                Utils.showToast('截图上传成功！', 'success');
            }
        });
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

    refresh() {
        const container = document.getElementById('page-record');
        this.render(container);
    }
};
