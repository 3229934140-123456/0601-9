const OverviewPage = {
    currentTournamentId: 1,

    render(container) {
        container.innerHTML = this.generateHTML();
        this.bindEvents();
    },

    generateHTML() {
        const tournaments = AppData.tournaments;
        const currentTournament = getTournamentById(this.currentTournamentId);
        
        const teams = getTeamsByTournament(this.currentTournamentId);
        const matches = getMatchesByTournament(this.currentTournamentId);
        const appeals = AppData.appeals.filter(a => a.tournamentId === this.currentTournamentId);
        const refereeTasks = AppData.refereeTasks;

        const pendingMembers = teams.reduce((count, team) => {
            return count + team.members.filter(m => m.status === 'pending').length;
        }, 0);

        const today = new Date().toISOString().split('T')[0];
        const todayMatches = matches.filter(m => {
            const matchDate = m.date ? m.date.split(' ')[0] : '';
            return matchDate === today;
        });

        const liveMatches = matches.filter(m => m.status === 'live');
        const upcomingMatches = matches.filter(m => m.status === 'upcoming');
        const endedMatches = matches.filter(m => m.status === 'ended');

        const pendingAppeals = appeals.filter(a => a.status === 'pending');
        const pendingResults = endedMatches.filter(m => !m.screenshots || m.screenshots.length === 0);

        const stats = [
            {
                icon: '👥',
                label: '报名队伍',
                value: teams.length,
                sub: `${pendingMembers}个待审核`,
                page: 'team',
                color: 'primary'
            },
            {
                icon: '📋',
                label: '今日赛程',
                value: todayMatches.length,
                sub: `${liveMatches.length}场进行中`,
                page: 'schedule',
                color: 'success'
            },
            {
                icon: '📺',
                label: '进行中直播',
                value: liveMatches.length,
                sub: `${upcomingMatches.length}场待开始`,
                page: 'live',
                color: 'danger'
            },
            {
                icon: '⚖️',
                label: '待处理申诉',
                value: pendingAppeals.length,
                sub: `${refereeTasks.length}场执裁任务`,
                page: 'referee',
                color: 'warning'
            },
            {
                icon: '🖼️',
                label: '待上传赛果',
                value: pendingResults.length,
                sub: '场比赛需截图',
                page: 'record',
                color: 'accent'
            },
            {
                icon: '📢',
                label: '赛事公告',
                value: AppData.announcements.length,
                sub: '篇最新公告',
                page: 'community',
                color: 'secondary'
            }
        ];

        const recentMatches = matches.slice(0, 5);
        const recentAppeals = appeals.slice(0, 4);

        return `
            <div class="overview-header">
                <div class="flex items-center gap-3">
                    <select id="overviewTournamentSelect" class="form-input" style="width: auto; min-width: 200px;">
                        ${tournaments.map(t => 
                            `<option value="${t.id}" ${t.id === this.currentTournamentId ? 'selected' : ''}>${t.gameIcon} ${t.name}</option>`
                        ).join('')}
                    </select>
                    <span class="status-badge status-${currentTournament?.status || 'upcoming'}">
                        ${currentTournament?.status === 'ongoing' ? '进行中' : currentTournament?.status === 'upcoming' ? '即将开始' : '已结束'}
                    </span>
                </div>
                <div class="flex gap-2">
                    <button class="btn btn-primary btn-sm" onclick="App.switchPage('schedule')">
                        ⚡ 生成赛程
                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="Utils.exportToJSON(AppData.matches, '赛程数据.json')">
                        📤 导出数据
                    </button>
                </div>
            </div>

            <div class="overview-stats-grid">
                ${stats.map(stat => this.renderStatCard(stat)).join('')}
            </div>

            <div class="grid grid-2 gap-6 mt-6">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">📅 最近赛程</h3>
                        <button class="btn btn-link btn-sm" onclick="App.switchPage('schedule')">查看全部 →</button>
                    </div>
                    <div class="card-body">
                        <div class="overview-match-list">
                            ${recentMatches.length > 0 ? recentMatches.map(match => this.renderMiniMatch(match)).join('') : `
                                <p class="text-muted text-center py-6">暂无赛程</p>
                            `}
                        </div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">⚖️ 最新申诉</h3>
                        <button class="btn btn-link btn-sm" onclick="App.switchPage('referee')">查看全部 →</button>
                    </div>
                    <div class="card-body">
                        <div class="overview-appeal-list">
                            ${recentAppeals.length > 0 ? recentAppeals.map(appeal => this.renderMiniAppeal(appeal)).join('') : `
                                <p class="text-muted text-center py-6">暂无申诉</p>
                            `}
                        </div>
                    </div>
                </div>
            </div>

            <div class="card mt-6">
                <div class="card-header">
                    <h3 class="card-title">📊 赛事进度概览</h3>
                </div>
                <div class="card-body">
                    <div class="progress-overview">
                        <div class="progress-item">
                            <div class="flex-between mb-2">
                                <span class="text-secondary">报名阶段</span>
                                <span class="font-bold">${teams.length}/16 支队伍</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${Math.min(teams.length / 16 * 100, 100)}%;"></div>
                            </div>
                        </div>
                        <div class="progress-item">
                            <div class="flex-between mb-2">
                                <span class="text-secondary">比赛进度</span>
                                <span class="font-bold">${endedMatches.length}/${matches.length} 场</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${matches.length > 0 ? endedMatches.length / matches.length * 100 : 0}%;"></div>
                            </div>
                        </div>
                        <div class="progress-item">
                            <div class="flex-between mb-2">
                                <span class="text-secondary">赛果上传</span>
                                <span class="font-bold">${endedMatches.length - pendingResults.length}/${endedMatches.length} 场</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill bg-success" style="width: ${endedMatches.length > 0 ? (endedMatches.length - pendingResults.length) / endedMatches.length * 100 : 0}%;"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card mt-6">
                <div class="card-header">
                    <h3 class="card-title">🎯 快捷操作</h3>
                </div>
                <div class="card-body">
                    <div class="quick-actions">
                        <button class="quick-action-btn" onclick="App.switchPage('team')">
                            <span class="quick-action-icon">👥</span>
                            <span class="quick-action-text">队伍管理</span>
                        </button>
                        <button class="quick-action-btn" onclick="App.switchPage('schedule')">
                            <span class="quick-action-icon">📅</span>
                            <span class="quick-action-text">赛程编排</span>
                        </button>
                        <button class="quick-action-btn" onclick="App.switchPage('live')">
                            <span class="quick-action-icon">📺</span>
                            <span class="quick-action-text">直播管理</span>
                        </button>
                        <button class="quick-action-btn" onclick="App.switchPage('referee')">
                            <span class="quick-action-icon">⚖️</span>
                            <span class="quick-action-text">裁判工作</span>
                        </button>
                        <button class="quick-action-btn" onclick="App.switchPage('record')">
                            <span class="quick-action-icon">📊</span>
                            <span class="quick-action-text">战绩管理</span>
                        </button>
                        <button class="quick-action-btn" onclick="App.switchPage('community')">
                            <span class="quick-action-icon">📢</span>
                            <span class="quick-action-text">公告发布</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    renderStatCard(stat) {
        const colorMap = {
            primary: 'from-primary to-purple-600',
            success: 'from-green-500 to-emerald-600',
            danger: 'from-red-500 to-rose-600',
            warning: 'from-amber-500 to-orange-600',
            accent: 'from-pink-500 to-rose-500',
            secondary: 'from-slate-500 to-slate-600'
        };

        return `
            <div class="overview-stat-card bg-gradient-to-br ${colorMap[stat.color] || colorMap.primary}" onclick="App.switchPage('${stat.page}')">
                <div class="overview-stat-icon">${stat.icon}</div>
                <div class="overview-stat-content">
                    <div class="overview-stat-value">${stat.value}</div>
                    <div class="overview-stat-label">${stat.label}</div>
                    <div class="overview-stat-sub">${stat.sub}</div>
                </div>
                <div class="overview-stat-arrow">→</div>
            </div>
        `;
    },

    renderMiniMatch(match) {
        const statusMap = {
            live: { text: '直播中', class: 'status-live' },
            upcoming: { text: '待开始', class: 'status-pending' },
            ended: { text: '已结束', class: 'status-ended' }
        };
        const status = statusMap[match.status] || statusMap.upcoming;

        return `
            <div class="mini-match-item" onclick="App.switchPage('schedule')">
                <div class="mini-match-teams">
                    <span class="mini-team-name">${match.team1Name}</span>
                    <span class="mini-match-score">${match.status === 'ended' ? `${match.team1Score}:${match.team2Score}` : 'VS'}</span>
                    <span class="mini-team-name">${match.team2Name}</span>
                </div>
                <div class="mini-match-info">
                    <span class="status-badge ${status.class} text-xs">${status.text}</span>
                    <span class="text-xs text-muted">${match.round}</span>
                </div>
            </div>
        `;
    },

    renderMiniAppeal(appeal) {
        const statusMap = {
            pending: { text: '待处理', class: 'status-pending' },
            approved: { text: '已通过', class: 'status-active' },
            rejected: { text: '已驳回', class: 'status-ended' }
        };
        const status = statusMap[appeal.status] || statusMap.pending;

        return `
            <div class="mini-appeal-item" onclick="App.switchPage('referee')">
                <div class="mini-appeal-header">
                    <span class="mini-appeal-type">${appeal.type}</span>
                    <span class="status-badge ${status.class} text-xs">${status.text}</span>
                </div>
                <p class="mini-appeal-desc">${appeal.team} · ${appeal.submitTime}</p>
            </div>
        `;
    },

    bindEvents() {
        const select = document.getElementById('overviewTournamentSelect');
        if (select) {
            select.addEventListener('change', (e) => {
                this.currentTournamentId = parseInt(e.target.value);
                this.refresh();
            });
        }
    },

    refresh() {
        const container = document.getElementById('page-overview');
        this.render(container);
    }
};
