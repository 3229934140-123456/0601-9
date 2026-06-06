const HallPage = {
    currentFilter: 'all',

    render(container) {
        container.innerHTML = this.generateHTML();
        this.bindEvents();
    },

    generateHTML() {
        const tournaments = this.getFilteredTournaments();
        
        return `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value">${AppData.tournaments.length}</div>
                    <div class="stat-label">全部赛事</div>
                    <div class="stat-icon">🏆</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${AppData.tournaments.filter(t => t.status === 'active').length}</div>
                    <div class="stat-label">进行中</div>
                    <div class="stat-icon">🔥</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${AppData.tournaments.filter(t => t.status === 'pending').length}</div>
                    <div class="stat-label">报名中</div>
                    <div class="stat-icon">📝</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${AppData.tournaments.reduce((sum, t) => sum + t.currentTeams, 0)}+</div>
                    <div class="stat-label">参赛队伍</div>
                    <div class="stat-icon">👥</div>
                </div>
            </div>

            <div class="flex-between mb-6">
                <div class="tabs" style="margin-bottom: 0; width: auto;">
                    <div class="tab-item ${this.currentFilter === 'all' ? 'active' : ''}" data-filter="all">全部赛事</div>
                    <div class="tab-item ${this.currentFilter === 'active' ? 'active' : ''}" data-filter="active">进行中</div>
                    <div class="tab-item ${this.currentFilter === 'pending' ? 'active' : ''}" data-filter="pending">报名中</div>
                    <div class="tab-item ${this.currentFilter === 'ended' ? 'active' : ''}" data-filter="ended">已结束</div>
                </div>
                <button class="btn btn-primary" id="createTournamentBtn">
                    <span>+</span> 创建赛事
                </button>
            </div>

            <div class="grid grid-3" id="tournamentList">
                ${tournaments.map(t => this.renderTournamentCard(t)).join('')}
            </div>

            ${tournaments.length === 0 ? `
                <div class="empty-state">
                    <div class="empty-state-icon">🎮</div>
                    <div class="empty-state-text">暂无赛事</div>
                    <div class="empty-state-desc">点击上方按钮创建第一个赛事吧</div>
                </div>
            ` : ''}
        `;
    },

    renderTournamentCard(tournament) {
        const progress = Math.round((tournament.currentTeams / tournament.maxTeams) * 100);
        const statusText = Utils.getStatusText(tournament.status);
        const statusClass = Utils.getStatusClass(tournament.status);
        
        return `
            <div class="card tournament-card" data-id="${tournament.id}">
                <div class="tournament-banner">
                    <img src="https://picsum.photos/seed/${tournament.banner}/400/200" alt="${tournament.name}">
                    <span class="status-badge ${statusClass}">${statusText}</span>
                    <span class="game-tag">${tournament.gameIcon} ${tournament.game}</span>
                </div>
                <div class="card-body">
                    <h3 class="tournament-name">${tournament.name}</h3>
                    <p class="tournament-desc">${tournament.description.substring(0, 50)}...</p>
                    
                    <div class="tournament-info">
                        <div class="info-item">
                            <span class="info-icon">📍</span>
                            <span>${tournament.location}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-icon">📅</span>
                            <span>${tournament.startDate} ~ ${tournament.endDate}</span>
                        </div>
                    </div>

                    <div class="team-progress">
                        <div class="flex-between mb-2">
                            <span class="text-sm text-muted">参赛队伍</span>
                            <span class="text-sm font-semibold">${tournament.currentTeams}/${tournament.maxTeams}</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress}%"></div>
                        </div>
                    </div>

                    <div class="tournament-footer">
                        <div class="prize">
                            <span class="prize-icon">💰</span>
                            <span class="prize-text">${tournament.prize}</span>
                        </div>
                        <button class="btn btn-primary btn-sm view-detail-btn" data-id="${tournament.id}">
                            查看详情
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    getFilteredTournaments() {
        if (this.currentFilter === 'all') {
            return AppData.tournaments;
        }
        return AppData.tournaments.filter(t => t.status === this.currentFilter);
    },

    bindEvents() {
        document.querySelectorAll('.tab-item[data-filter]').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.currentFilter = e.target.dataset.filter;
                this.refresh();
            });
        });

        document.getElementById('createTournamentBtn').addEventListener('click', () => {
            this.showCreateModal();
        });

        document.querySelectorAll('.view-detail-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(btn.dataset.id);
                this.showDetailModal(id);
            });
        });
    },

    refresh() {
        const container = document.getElementById('page-hall');
        this.render(container);
    },

    showCreateModal() {
        const gameOptions = AppData.gameTypes.map(g => 
            `<option value="${g.id}">${g.icon} ${g.name}</option>`
        ).join('');

        const content = `
            <div class="form-group">
                <label class="form-label">赛事名称</label>
                <input type="text" class="form-input" id="tournamentName" placeholder="请输入赛事名称">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">比赛项目</label>
                    <select class="form-select" id="tournamentGame">
                        ${gameOptions}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">赛事地点</label>
                    <input type="text" class="form-input" id="tournamentLocation" placeholder="如：大学生活动中心">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">开始时间</label>
                    <input type="date" class="form-input" id="tournamentStart">
                </div>
                <div class="form-group">
                    <label class="form-label">结束时间</label>
                    <input type="date" class="form-input" id="tournamentEnd">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">最大队伍数</label>
                    <input type="number" class="form-input" id="tournamentMaxTeams" value="16">
                </div>
                <div class="form-group">
                    <label class="form-label">报名费用（元）</label>
                    <input type="number" class="form-input" id="tournamentFee" value="0">
                </div>
            </div>
            <div class="form-group">
                <label class="form-label">奖金池</label>
                <input type="text" class="form-input" id="tournamentPrize" placeholder="如：10000元">
            </div>
            <div class="form-group">
                <label class="form-label">赛事简介</label>
                <textarea class="form-textarea" id="tournamentDesc" placeholder="请输入赛事简介"></textarea>
            </div>
            <div class="form-group">
                <label class="form-label">比赛规则（每行一条）</label>
                <textarea class="form-textarea" id="tournamentRules" placeholder="比赛采用5v5召唤师峡谷模式&#10;每队最少5人，最多7人"></textarea>
            </div>
        `;

        Utils.showModal(content, {
            title: '创建赛事',
            size: 'lg',
            confirmText: '创建赛事',
            onConfirm: () => {
                const name = document.getElementById('tournamentName').value.trim();
                if (!name) {
                    Utils.showToast('请输入赛事名称', 'error');
                    return false;
                }

                const gameSelect = document.getElementById('tournamentGame');
                const gameType = AppData.gameTypes.find(g => g.id === gameSelect.value);
                
                const newTournament = {
                    id: Date.now(),
                    name: name,
                    game: gameType.name,
                    gameIcon: gameType.icon,
                    status: 'pending',
                    startDate: document.getElementById('tournamentStart').value,
                    endDate: document.getElementById('tournamentEnd').value,
                    location: document.getElementById('tournamentLocation').value,
                    maxTeams: parseInt(document.getElementById('tournamentMaxTeams').value),
                    currentTeams: 0,
                    prize: document.getElementById('tournamentPrize').value || '待定',
                    organizer: '校电竞社',
                    description: document.getElementById('tournamentDesc').value,
                    rules: document.getElementById('tournamentRules').value.split('\n').filter(r => r.trim()),
                    fee: parseInt(document.getElementById('tournamentFee').value) || 0,
                    banner: 'new' + Date.now()
                };

                AppData.tournaments.unshift(newTournament);
                Utils.showToast('赛事创建成功！', 'success');
                this.refresh();
            }
        });
    },

    showDetailModal(id) {
        const tournament = getTournamentById(id);
        if (!tournament) return;

        const teams = getTeamsByTournament(id);
        const matches = getMatchesByTournament(id);
        const liveMatches = matches.filter(m => m.status === 'live');

        const content = `
            <div class="tournament-detail">
                <div class="detail-header">
                    <img src="https://picsum.photos/seed/${tournament.banner}/600/250" alt="${tournament.name}" class="detail-banner">
                    <div class="detail-overlay">
                        <span class="status-badge ${Utils.getStatusClass(tournament.status)}">${Utils.getStatusText(tournament.status)}</span>
                        <h2 class="detail-title">${tournament.name}</h2>
                        <div class="detail-meta">
                            <span>${tournament.gameIcon} ${tournament.game}</span>
                            <span>·</span>
                            <span>💰 ${tournament.prize}</span>
                        </div>
                    </div>
                </div>

                <div class="detail-tabs">
                    <div class="tab-item active" data-detail-tab="intro">赛事介绍</div>
                    <div class="tab-item" data-detail-tab="rules">项目规则</div>
                    <div class="tab-item" data-detail-tab="teams">参赛队伍</div>
                    <div class="tab-item" data-detail-tab="schedule">赛程安排</div>
                </div>

                <div class="detail-tab-content">
                    <div class="detail-tab-pane active" data-detail-pane="intro">
                        <div class="detail-section">
                            <h4 class="section-title">赛事信息</h4>
                            <div class="info-grid">
                                <div class="info-block">
                                    <span class="info-label">主办方</span>
                                    <span class="info-value">${tournament.organizer}</span>
                                </div>
                                <div class="info-block">
                                    <span class="info-label">比赛地点</span>
                                    <span class="info-value">${tournament.location}</span>
                                </div>
                                <div class="info-block">
                                    <span class="info-label">比赛时间</span>
                                    <span class="info-value">${tournament.startDate} ~ ${tournament.endDate}</span>
                                </div>
                                <div class="info-block">
                                    <span class="info-label">参赛队伍</span>
                                    <span class="info-value">${tournament.currentTeams}/${tournament.maxTeams}</span>
                                </div>
                            </div>
                        </div>
                        <div class="detail-section">
                            <h4 class="section-title">赛事简介</h4>
                            <p class="detail-desc">${tournament.description}</p>
                        </div>
                    </div>

                    <div class="detail-tab-pane" data-detail-pane="rules">
                        <div class="rules-list">
                            ${tournament.rules.map((rule, i) => `
                                <div class="rule-item">
                                    <span class="rule-number">${i + 1}</span>
                                    <span class="rule-text">${rule}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div class="detail-tab-pane" data-detail-pane="teams">
                        <div class="teams-grid">
                            ${teams.length > 0 ? teams.map(team => `
                                <div class="team-mini-card">
                                    <div class="team-logo">${team.logo}</div>
                                    <div class="team-info">
                                        <p class="team-name">${team.name}</p>
                                        <p class="team-members">${team.members.length}人 · ${team.slogan}</p>
                                    </div>
                                </div>
                            `).join('') : '<p class="text-muted text-center py-8">暂无参赛队伍</p>'}
                        </div>
                    </div>

                    <div class="detail-tab-pane" data-detail-pane="schedule">
                        <div class="matches-list">
                            ${matches.length > 0 ? matches.map(match => `
                                <div class="match-mini-item">
                                    <div class="match-round">${match.round}</div>
                                    <div class="match-teams">
                                        <span class="team-name">${match.team1Name}</span>
                                        <span class="match-score ${match.status === 'ended' ? '' : 'text-muted'}">
                                            ${match.status === 'ended' ? `${match.team1Score} : ${match.team2Score}` : 'VS'}
                                        </span>
                                        <span class="team-name">${match.team2Name}</span>
                                    </div>
                                    <div class="match-time text-muted">${match.date}</div>
                                </div>
                            `).join('') : '<p class="text-muted text-center py-8">暂无赛程安排</p>'}
                        </div>
                    </div>
                </div>
            </div>
        `;

        Utils.showModal(content, {
            title: '',
            size: 'lg',
            showFooter: true,
            confirmText: '立即报名',
            onConfirm: () => {
                Utils.showToast('请前往「报名组队」页面进行报名', 'info');
            }
        });

        setTimeout(() => {
            document.querySelectorAll('[data-detail-tab]').forEach(tab => {
                tab.addEventListener('click', () => {
                    const tabName = tab.dataset.detailTab;
                    document.querySelectorAll('[data-detail-tab]').forEach(t => t.classList.remove('active'));
                    document.querySelectorAll('[data-detail-pane]').forEach(p => p.classList.remove('active'));
                    tab.classList.add('active');
                    document.querySelector(`[data-detail-pane="${tabName}"]`).classList.add('active');
                });
            });
        }, 100);
    }
};
