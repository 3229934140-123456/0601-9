const SchedulePage = {
    currentTournamentId: 1,
    currentView: 'list',
    selectedRound: 'all',
    editingMatchId: null,
    batchMode: false,
    selectedMatchIds: [],

    render(container) {
        container.innerHTML = this.generateHTML();
        this.bindEvents();
    },

    generateHTML() {
        const tournament = getTournamentById(this.currentTournamentId);
        const matches = getMatchesByTournament(this.currentTournamentId);

        const tournamentOptions = AppData.tournaments.map(t => 
            `<option value="${t.id}" ${t.id === this.currentTournamentId ? 'selected' : ''}>${t.gameIcon} ${t.name}</option>`
        ).join('');

        const rounds = [...new Set(matches.map(m => m.round))];

        return `
            <div class="schedule-header">
                <div class="flex gap-3 items-center">
                    <select id="scheduleTournamentSelect" class="form-input" style="width: auto;">
                        ${tournamentOptions}
                    </select>
                    <span class="text-muted">|</span>
                    <span class="text-secondary">共 ${matches.length} 场比赛</span>
                </div>
                <div class="flex gap-2">
                    <button class="btn btn-secondary btn-sm ${this.currentView === 'list' ? 'active' : ''}" id="listViewBtn">
                        📋 列表视图
                    </button>
                    <button class="btn btn-secondary btn-sm ${this.currentView === 'knockout' ? 'active' : ''}" id="knockoutViewBtn">
                        🏆 淘汰赛
                    </button>
                    <button class="btn btn-secondary btn-sm ${this.currentView === 'calendar' ? 'active' : ''}" id="calendarViewBtn">
                        📅 日历视图
                    </button>
                    <button class="btn btn-primary btn-sm" id="autoGenerateBtn">
                        ⚡ 自动生成赛程
                    </button>
                    <button class="btn btn-secondary btn-sm" id="adjustBtn">
                        ✏️ 手动调整
                    </button>
                    <button class="btn btn-accent btn-sm ${this.batchMode ? 'active' : ''}" id="batchPublishBtn">
                        📢 ${this.batchMode ? '取消' : '批量发布'}
                    </button>
                    ${this.batchMode && this.selectedMatchIds.length > 0 ? `
                    <button class="btn btn-success btn-sm" id="confirmBatchBtn">
                        ✅ 确认发布 (${this.selectedMatchIds.length})
                    </button>
                    ` : ''}
                </div>
            </div>

            ${this.currentView !== 'knockout' ? `
            <div class="round-tabs">
                <div class="round-tab ${this.selectedRound === 'all' ? 'active' : ''}" data-round="all">全部</div>
                ${rounds.map(round => `
                    <div class="round-tab ${this.selectedRound === round ? 'active' : ''}" data-round="${round}">${round}</div>
                `).join('')}
            </div>
            ` : ''}

            ${this.currentView === 'calendar' ? this.renderCalendarView(matches) : ''}
            ${this.currentView === 'list' ? this.renderListView(matches) : ''}
            ${this.currentView === 'knockout' ? this.renderKnockoutView(matches) : ''}
        `;
    },

    renderListView(matches) {
        const filteredMatches = this.selectedRound === 'all' 
            ? matches 
            : matches.filter(m => m.round === this.selectedRound);

        const liveMatches = filteredMatches.filter(m => m.status === 'live');
        const upcomingMatches = filteredMatches.filter(m => m.status === 'upcoming');
        const endedMatches = filteredMatches.filter(m => m.status === 'ended');

        return `
            ${liveMatches.length > 0 ? `
                <div class="mb-6">
                    <h3 class="text-lg font-bold mb-4 flex items-center gap-2">
                        <span class="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                        正在进行
                    </h3>
                    ${liveMatches.map(match => this.renderMatchCard(match)).join('')}
                </div>
            ` : ''}

            ${upcomingMatches.length > 0 ? `
                <div class="mb-6">
                    <h3 class="text-lg font-bold mb-4">⏰ 即将开始</h3>
                    ${upcomingMatches.map(match => this.renderMatchCard(match)).join('')}
                </div>
            ` : ''}

            ${endedMatches.length > 0 ? `
                <div>
                    <h3 class="text-lg font-bold mb-4">✅ 已结束</h3>
                    ${endedMatches.map(match => this.renderMatchCard(match)).join('')}
                </div>
            ` : ''}

            ${filteredMatches.length === 0 ? `
                <div class="empty-state">
                    <div class="empty-state-icon">📅</div>
                    <div class="empty-state-text">暂无赛程</div>
                    <div class="empty-state-desc">点击「自动生成赛程」创建比赛对阵</div>
                </div>
            ` : ''}
        `;
    },

    renderCalendarView(matches) {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startWeekDay = firstDay.getDay();
        const daysInMonth = lastDay.getDate();

        const weekdays = ['日', '一', '二', '三', '四', '五', '六'];

        let calendarDays = '';
        
        for (let i = 0; i < startWeekDay; i++) {
            calendarDays += '<div class="calendar-day empty"></div>';
        }

        const matchDates = new Set(matches.map(m => new Date(m.date).getDate()));

        for (let day = 1; day <= daysInMonth; day++) {
            const hasMatch = matchDates.has(day);
            const isToday = day === today.getDate();
            calendarDays += `
                <div class="calendar-day ${isToday ? 'active' : ''} ${hasMatch ? 'has-match' : ''}" data-day="${day}">
                    <span class="calendar-day-number">${day}</span>
                    <span class="calendar-day-weekday">${weekdays[new Date(year, month, day).getDay()]}</span>
                </div>
            `;
        }

        const todayMatches = matches.filter(m => {
            const matchDate = new Date(m.date);
            return matchDate.getDate() === today.getDate() && matchDate.getMonth() === month;
        });

        return `
            <div class="card mb-6">
                <div class="card-header">
                    <h3 class="card-title">${year}年${month + 1}月</h3>
                </div>
                <div class="card-body">
                    <div class="schedule-calendar">
                        ${['日', '一', '二', '三', '四', '五', '六'].map(d => `
                            <div class="calendar-day-header text-center text-muted text-sm font-semibold pb-2">${d}</div>
                        `).join('')}
                        ${calendarDays}
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">今日赛程 (${todayMatches.length}场)</h3>
                </div>
                <div class="card-body">
                    ${todayMatches.length > 0 ? 
                        todayMatches.map(match => this.renderMatchCard(match)).join('') :
                        '<p class="text-muted text-center py-8">今日暂无比赛</p>'
                    }
                </div>
            </div>
        `;
    },

    renderKnockoutView(matches) {
        const tournament = getTournamentById(this.currentTournamentId);
        const teams = getTeamsByTournament(this.currentTournamentId);
        
        const knockoutMatches = matches.filter(m => 
            m.round.includes('决赛') || m.round.includes('半决赛') || m.round.includes('半决') ||
            m.round.includes('四分之一') || m.round.includes('八强') || m.round.includes('四强')
        );

        const quarterFinals = knockoutMatches.filter(m => m.round.includes('四分之一') || m.round.includes('八强'));
        const semiFinals = knockoutMatches.filter(m => m.round.includes('半决赛') || m.round.includes('半决'));
        const finals = knockoutMatches.filter(m => m.round.includes('决赛') && !m.round.includes('半'));

        if (knockoutMatches.length === 0) {
            return `
                <div class="empty-state">
                    <div class="empty-state-icon">🏆</div>
                    <div class="empty-state-text">暂无淘汰赛赛程</div>
                    <div class="empty-state-desc">请先生成包含淘汰赛阶段的赛程</div>
                    <button class="btn btn-primary mt-4" id="genKnockoutBtn">生成淘汰赛对阵</button>
                </div>
            `;
        }

        const getMatchWinner = (match) => {
            if (match.status !== 'ended') return null;
            return match.team1Score > match.team2Score ? match.team1Name : 
                   match.team2Score > match.team1Score ? match.team2Name : null;
        };

        const getMatchLoser = (match) => {
            if (match.status !== 'ended') return null;
            return match.team1Score < match.team2Score ? match.team1Name : 
                   match.team2Score < match.team1Score ? match.team2Name : null;
        };

        const renderKnockoutMatch = (match) => {
            const winner = getMatchWinner(match);
            const loser = getMatchLoser(match);
            
            return `
                <div class="knockout-match" onclick="SchedulePage.showEditMatchModal(${match.id})">
                    <div class="knockout-team ${winner === match.team1Name ? 'winner' : ''} ${loser === match.team1Name ? 'loser' : ''}">
                        <span class="knockout-team-name">
                            ${winner === match.team1Name ? '🏆 ' : ''}${match.team1Name}
                        </span>
                        <span class="knockout-team-score">${match.status === 'ended' ? match.team1Score : '-'}</span>
                    </div>
                    <div class="knockout-team ${winner === match.team2Name ? 'winner' : ''} ${loser === match.team2Name ? 'loser' : ''}">
                        <span class="knockout-team-name">
                            ${winner === match.team2Name ? '🏆 ' : ''}${match.team2Name}
                        </span>
                        <span class="knockout-team-score">${match.status === 'ended' ? match.team2Score : '-'}</span>
                    </div>
                    <div class="knockout-match-info">
                        <span>${this.formatMatchDate(match.date)}</span>
                        <span>${match.status === 'live' ? '直播中' : match.status === 'ended' ? '已结束' : '待开始'}</span>
                    </div>
                </div>
            `;
        };

        const renderPlaceholderMatch = (teamName) => {
            return `
                <div class="knockout-match empty">
                    <div class="knockout-team tbd">
                        <span class="knockout-team-name">${teamName || '待定'}</span>
                        <span class="knockout-team-score">-</span>
                    </div>
                    <div class="knockout-team tbd">
                        <span class="knockout-team-name">待定</span>
                        <span class="knockout-team-score">-</span>
                    </div>
                    <div class="knockout-match-info">
                        <span>TBD</span>
                        <span>未开始</span>
                    </div>
                </div>
            `;
        };

        const semiWinners = semiFinals.map(getMatchWinner).filter(Boolean);
        const quarterWinners = quarterFinals.map(getMatchWinner).filter(Boolean);

        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">🏆 淘汰赛对阵图</h3>
                    <span class="text-sm text-muted">点击比赛卡片可编辑对阵信息</span>
                </div>
                <div class="card-body">
                    <div class="knockout-view">
                        <div class="knockout-bracket">
                            ${quarterFinals.length > 0 ? `
                                <div class="knockout-round">
                                    <div class="knockout-round-title">四分之一决赛</div>
                                    ${quarterFinals.map(m => renderKnockoutMatch(m)).join('')}
                                </div>
                            ` : ''}

                            ${semiFinals.length > 0 ? `
                                <div class="knockout-round">
                                    <div class="knockout-round-title">半决赛</div>
                                    ${semiFinals.map(m => renderKnockoutMatch(m)).join('')}
                                </div>
                            ` : ''}

                            ${finals.length > 0 ? `
                                <div class="knockout-round">
                                    <div class="knockout-round-title">决赛</div>
                                    ${finals.map(m => renderKnockoutMatch(m)).join('')}
                                    <div style="text-align: center; margin-top: 12px;">
                                        <span style="font-size: 24px;">🏆</span>
                                        <span style="color: var(--success); font-weight: 700; margin-left: 8px;">
                                            ${getMatchWinner(finals[0]) || '冠军待定'}
                                        </span>
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                    </div>

                    <div class="mt-6 p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
                        <p class="text-sm text-blue-400">
                            💡 提示：比赛结束后，获胜队伍会自动标记并显示 🏆 标识，点击任意比赛卡片可手动调整结果
                        </p>
                    </div>
                </div>
            </div>
        `;
    },

    renderMatchCard(match) {
        const team1 = getTeamById(match.team1Id);
        const team2 = getTeamById(match.team2Id);

        const team1Logo = team1 ? team1.logo : '🎮';
        const team2Logo = team2 ? team2.logo : '🎮';

        const isLive = match.status === 'live';
        const isEnded = match.status === 'ended';
        const isUpcoming = match.status === 'upcoming';
        const isSelected = this.selectedMatchIds.includes(match.id);

        return `
            <div class="match-card ${isLive ? 'live' : ''} ${this.batchMode ? 'batch-mode' : ''} ${isSelected ? 'selected' : ''}" data-match-id="${match.id}">
                ${this.batchMode ? `
                <div class="match-checkbox" onclick="event.stopPropagation(); SchedulePage.toggleMatchSelect(${match.id})">
                    <input type="checkbox" ${isSelected ? 'checked' : ''} ${!isUpcoming ? 'disabled' : ''}>
                </div>
                ` : ''}
                <div class="match-info">
                    <div class="match-date">${this.formatMatchDate(match.date)}</div>
                    <div class="match-time-text">${this.formatMatchTime(match.date)}</div>
                    <div class="match-venue">📍 ${match.venue}</div>
                </div>

                <div class="match-teams-section">
                    <div class="match-team left">
                        <span class="match-team-name">${match.team1Name}</span>
                        <div class="match-team-logo">${team1Logo}</div>
                    </div>

                    <div class="match-score-box">
                        <span class="score-number ${isEnded && match.team1Score > match.team2Score ? 'winner-text' : ''}">
                            ${isEnded ? match.team1Score : '-'}
                        </span>
                        <span class="score-divider">:</span>
                        <span class="score-number ${isEnded && match.team2Score > match.team1Score ? 'winner-text' : ''}">
                            ${isEnded ? match.team2Score : '-'}
                        </span>
                    </div>

                    <div class="match-team right">
                        <div class="match-team-logo">${team2Logo}</div>
                        <span class="match-team-name">${match.team2Name}</span>
                    </div>
                </div>

                <div class="match-round-label">${match.round}</div>

                <div class="match-actions">
                    ${isLive ? `
                        <button class="btn btn-danger btn-sm watch-live-btn" data-match-id="${match.id}">
                            📺 观看直播
                        </button>
                    ` : ''}
                    ${isEnded ? `
                        <button class="btn btn-secondary btn-sm view-result-btn" data-match-id="${match.id}">
                            📋 查看详情
                        </button>
                    ` : ''}
                    ${!isLive && !isEnded ? `
                        <button class="btn btn-primary btn-sm remind-btn" data-match-id="${match.id}">
                            🔔 提醒我
                        </button>
                    ` : ''}
                    <button class="btn btn-secondary btn-sm edit-match-btn" data-match-id="${match.id}">
                        ✏️ 编辑
                    </button>
                </div>
            </div>
        `;
    },

    formatMatchDate(dateStr) {
        if (!dateStr) return '待定';
        const date = new Date(dateStr);
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        return `${month}月${day}日 ${weekdays[date.getDay()]}`;
    },

    formatMatchTime(dateStr) {
        if (!dateStr) return '--:--';
        const date = new Date(dateStr);
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    },

    bindEvents() {
        const self = this;

        document.getElementById('scheduleTournamentSelect').addEventListener('change', (e) => {
            this.currentTournamentId = parseInt(e.target.value);
            this.refresh();
        });

        document.getElementById('listViewBtn')?.addEventListener('click', () => {
            this.currentView = 'list';
            this.refresh();
        });

        document.getElementById('knockoutViewBtn')?.addEventListener('click', () => {
            this.currentView = 'knockout';
            this.refresh();
        });

        document.getElementById('calendarViewBtn')?.addEventListener('click', () => {
            this.currentView = 'calendar';
            this.refresh();
        });

        document.querySelectorAll('.round-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.selectedRound = tab.dataset.round;
                this.refresh();
            });
        });

        document.getElementById('autoGenerateBtn')?.addEventListener('click', () => {
            this.showAutoGenerateModal();
        });

        document.getElementById('adjustBtn')?.addEventListener('click', () => {
            this.showAdjustSelectModal();
        });

        document.getElementById('batchPublishBtn')?.addEventListener('click', () => {
            this.batchMode = !this.batchMode;
            if (!this.batchMode) {
                this.selectedMatchIds = [];
            }
            this.refresh();
        });

        document.getElementById('confirmBatchBtn')?.addEventListener('click', () => {
            this.showBatchPublishModal();
        });

        const genKnockoutBtn = document.getElementById('genKnockoutBtn');
        if (genKnockoutBtn) {
            genKnockoutBtn.addEventListener('click', () => {
                this.generateKnockoutSchedule();
            });
        }

        document.querySelectorAll('.remind-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                Utils.showToast('已设置比赛提醒，赛前30分钟通知您', 'success');
            });
        });

        document.querySelectorAll('.watch-live-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                App.switchPage('live');
            });
        });

        document.querySelectorAll('.view-result-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const matchId = parseInt(btn.dataset.matchId);
                if (typeof RecordPage !== 'undefined') {
                    RecordPage.showMatchDetail(matchId);
                }
            });
        });

        document.querySelectorAll('.edit-match-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const matchId = parseInt(btn.dataset.matchId);
                this.showEditMatchModal(matchId);
            });
        });

        document.querySelectorAll('.match-card').forEach(card => {
            card.addEventListener('click', () => {
                const matchId = parseInt(card.dataset.matchId);
                this.showEditMatchModal(matchId);
            });
        });
    },

    showAdjustSelectModal() {
        const matches = getMatchesByTournament(this.currentTournamentId);

        if (matches.length === 0) {
            Utils.showToast('暂无比赛可调整，请先生成赛程', 'warning');
            return;
        }

        const content = `
            <p class="text-muted text-sm mb-4">请选择要调整的比赛：</p>
            <div class="space-y-2" style="max-height: 400px; overflow-y: auto;">
                ${matches.map(match => `
                    <div class="adjust-match-item" data-match-id="${match.id}">
                        <div class="flex-between items-center">
                            <div>
                                <div class="font-semibold">${match.team1Name} VS ${match.team2Name}</div>
                                <div class="text-sm text-muted">${match.round} · ${this.formatMatchDate(match.date)}</div>
                            </div>
                            <div class="flex items-center gap-2">
                                <span class="status-badge ${
                                    match.status === 'live' ? 'status-live' : 
                                    match.status === 'ended' ? 'status-ended' : 'status-pending'
                                } text-xs">
                                    ${match.status === 'live' ? '进行中' : match.status === 'ended' ? '已结束' : '待开始'}
                                </span>
                                <button class="btn btn-primary btn-sm select-match-btn" data-match-id="${match.id}">
                                    编辑
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        Utils.showModal(content, {
            title: '✏️ 手动调整 - 选择比赛',
            size: 'lg',
            showFooter: false
        });

        setTimeout(() => {
            document.querySelectorAll('.select-match-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const matchId = parseInt(btn.dataset.matchId);
                    Utils.closeModal();
                    setTimeout(() => {
                        this.showEditMatchModal(matchId);
                    }, 200);
                });
            });
        }, 100);
    },

    showAutoGenerateModal() {
        const tournament = getTournamentById(this.currentTournamentId);
        const teams = getTeamsByTournament(this.currentTournamentId);
        const existingMatches = getMatchesByTournament(this.currentTournamentId);
        const hasEndedMatches = existingMatches.some(m => m.status === 'ended');
        const hasLiveMatches = existingMatches.some(m => m.status === 'live');
        const hasUpcomingMatches = existingMatches.some(m => m.status === 'upcoming' || m.status === 'live');

        const calcEstimatedMatches = (mode, format, groupCount) => {
            if (teams.length < 2) return 0;
            
            const existingPairs = new Set();
            const existingRounds = new Set();
            existingMatches.forEach(m => {
                const pair = [m.team1Id, m.team2Id].sort().join('-');
                existingPairs.add(pair);
                existingRounds.add(m.round);
            });

            const orderedTeams = [...teams].sort((a, b) => a.id - b.id);
            let newMatchCount = 0;
            const groupNames = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
            
            if (format === 'group' || format === 'single') {
                for (let g = 0; g < groupCount && g < groupNames.length; g++) {
                    const groupTeams = orderedTeams.slice(g * 2, g * 2 + 2);
                    if (groupTeams.length < 2) continue;
                    const pairKey = [groupTeams[0].id, groupTeams[1].id].sort().join('-');
                    if (mode === 'append' && existingPairs.has(pairKey)) {
                        continue;
                    }
                    newMatchCount++;
                }

                const knockoutTeams = orderedTeams.slice(0, Math.min(groupCount * 2, 8));
                if (knockoutTeams.length >= 4) {
                    for (let i = 0; i < knockoutTeams.length - 1; i += 2) {
                        if (i + 1 >= knockoutTeams.length) break;
                        const pairKey = [knockoutTeams[i].id, knockoutTeams[i + 1].id].sort().join('-');
                        if (mode === 'append' && existingPairs.has(pairKey)) {
                            continue;
                        }
                        newMatchCount++;
                    }

                    if (knockoutTeams.length >= 2) {
                        if (!(mode === 'append' && existingRounds.has('决赛'))) {
                            newMatchCount++;
                        }
                    }
                }
            } else if (format === 'round') {
                for (let i = 0; i < teams.length; i++) {
                    for (let j = i + 1; j < teams.length; j++) {
                        const pairKey = [teams[i].id, teams[j].id].sort().join('-');
                        if (mode === 'append' && existingPairs.has(pairKey)) {
                            continue;
                        }
                        newMatchCount++;
                    }
                }
            } else {
                newMatchCount = Math.max(Math.floor(teams.length / 2), teams.length - 1);
            }
            
            return newMatchCount;
        };

        const estimatedMatches = calcEstimatedMatches('overwrite', 'group', 4);

        const content = `
            <div class="form-group">
                <label class="form-label">赛制选择</label>
                <select class="form-select" id="formatSelect">
                    <option value="group">分组循环赛 + 淘汰赛</option>
                    <option value="single">单败淘汰制</option>
                    <option value="double">双败淘汰制</option>
                    <option value="round">单循环积分赛</option>
                </select>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">小组数量</label>
                    <select class="form-select" id="groupCount">
                        <option value="2">2个小组</option>
                        <option value="4" selected>4个小组</option>
                        <option value="8">8个小组</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">每组出线</label>
                    <select class="form-select" id="qualifyCount">
                        <option value="1">1支队伍</option>
                        <option value="2" selected>2支队伍</option>
                        <option value="4">4支队伍</option>
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">开始日期</label>
                    <input type="date" class="form-input" id="startDateInput" value="${tournament?.startDate || ''}">
                </div>
                <div class="form-group">
                    <label class="form-label">比赛时间</label>
                    <input type="time" class="form-input" id="matchTimeInput" value="14:00">
                </div>
            </div>
            <div class="form-group">
                <label class="form-label">比赛场地</label>
                <select class="form-select" id="venueSelect">
                    <option>主赛场</option>
                    <option>赛场1号</option>
                    <option>赛场2号</option>
                    <option>线上赛</option>
                </select>
            </div>
            ${hasUpcomingMatches ? `
            <div class="form-group">
                <label class="form-label">生成方式</label>
                <div class="space-y-2">
                    <label class="flex items-center gap-2 cursor-pointer p-3 rounded-lg border border-gray-600 hover:border-primary transition-colors">
                        <input type="radio" name="generateMode" value="overwrite" checked>
                        <div>
                            <div><strong>覆盖未开始赛程</strong></div>
                            <div class="text-sm text-muted">只替换待开始的比赛，已结束和进行中的保留</div>
                        </div>
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer p-3 rounded-lg border border-gray-600 hover:border-primary transition-colors">
                        <input type="radio" name="generateMode" value="append">
                        <div>
                            <div><strong>追加新赛程</strong></div>
                            <div class="text-sm text-muted">在现有基础上新增，避免完全重复的对阵</div>
                        </div>
                    </label>
                </div>
            </div>
            ` : ''}
            <div class="p-4 bg-amber-500/10 rounded-lg border border-amber-500/30">
                <p class="text-sm text-amber-400">
                    ⚡ 当前参赛队伍：${teams.length}支，预计将生成约 <strong id="estimatedCount">${estimatedMatches}</strong> 场比赛
                </p>
                ${hasEndedMatches || hasLiveMatches ? `<p class="text-sm text-amber-400 mt-1">⚠️ 已有已结束或进行中的比赛，将不会被删除</p>` : ''}
            </div>
        `;

        Utils.showModal(content, {
            title: '自动生成赛程',
            size: 'lg',
            confirmText: '开始生成',
            onConfirm: () => {
                const modeEl = document.querySelector('input[name="generateMode"]:checked');
                const mode = modeEl ? modeEl.value : 'overwrite';
                this.generateSchedule(mode);
            }
        });

        setTimeout(() => {
            const formatSelect = document.getElementById('formatSelect');
            const groupCountSelect = document.getElementById('groupCount');
            const modeRadios = document.querySelectorAll('input[name="generateMode"]');
            const estimatedEl = document.getElementById('estimatedCount');

            const updateEstimate = () => {
                const modeEl = document.querySelector('input[name="generateMode"]:checked');
                const mode = modeEl ? modeEl.value : 'overwrite';
                const format = formatSelect?.value || 'group';
                const groupCount = parseInt(groupCountSelect?.value || '4');
                const count = calcEstimatedMatches(mode, format, groupCount);
                if (estimatedEl) {
                    estimatedEl.textContent = count;
                }
            };

            if (formatSelect) {
                formatSelect.addEventListener('change', updateEstimate);
            }
            if (groupCountSelect) {
                groupCountSelect.addEventListener('change', updateEstimate);
            }
            modeRadios.forEach(radio => {
                radio.addEventListener('change', updateEstimate);
            });
        }, 100);
    },

    generateSchedule(mode = 'overwrite') {
        const teams = getTeamsByTournament(this.currentTournamentId);
        
        if (teams.length < 2) {
            Utils.showToast('参赛队伍不足，无法生成赛程', 'error');
            return false;
        }

        const startDate = document.getElementById('startDateInput')?.value || '2024-04-15';
        const matchTime = document.getElementById('matchTimeInput')?.value || '14:00';
        const venue = document.getElementById('venueSelect')?.value || '主赛场';
        const groupCount = parseInt(document.getElementById('groupCount')?.value || '4');
        const format = document.getElementById('formatSelect')?.value || 'group';

        const existingPairs = new Set();
        const existingRounds = new Set();
        if (mode === 'append') {
            AppData.matches
                .filter(m => m.tournamentId === this.currentTournamentId)
                .forEach(m => {
                    const pair = [m.team1Id, m.team2Id].sort().join('-');
                    existingPairs.add(pair);
                    existingRounds.add(m.round);
                });
        }

        if (mode === 'overwrite') {
            AppData.matches = AppData.matches.filter(m => 
                m.tournamentId !== this.currentTournamentId || 
                m.status === 'ended' || 
                m.status === 'live'
            );
        }

        const orderedTeams = [...teams].sort((a, b) => a.id - b.id);
        const groupNames = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
        
        let matchIdCounter = Date.now();
        let dayOffset = 0;
        let newMatchCount = 0;

        if (format === 'single' || format === 'group') {
            for (let g = 0; g < groupCount && g < groupNames.length; g++) {
                const groupTeams = orderedTeams.slice(g * 2, g * 2 + 2);
                if (groupTeams.length < 2) continue;

                const pairKey = [groupTeams[0].id, groupTeams[1].id].sort().join('-');
                if (mode === 'append' && existingPairs.has(pairKey)) {
                    continue;
                }

                const matchDate = new Date(startDate);
                matchDate.setDate(matchDate.getDate() + dayOffset);
                const dateStr = matchDate.toISOString().split('T')[0] + ' ' + matchTime;

                const newMatch = {
                    id: matchIdCounter++,
                    tournamentId: this.currentTournamentId,
                    round: `小组赛${groupNames[g]}组`,
                    team1Id: groupTeams[0].id,
                    team2Id: groupTeams[1].id,
                    team1Name: groupTeams[0].name,
                    team2Name: groupTeams[1].name,
                    team1Score: 0,
                    team2Score: 0,
                    date: dateStr,
                    status: 'upcoming',
                    venue: venue,
                    isLive: false
                };
                AppData.matches.push(newMatch);
                newMatchCount++;
                dayOffset++;
            }

            const knockoutTeams = orderedTeams.slice(0, Math.min(groupCount * 2, 8));
            if (knockoutTeams.length >= 4) {
                for (let i = 0; i < knockoutTeams.length - 1; i += 2) {
                    if (i + 1 >= knockoutTeams.length) break;

                    const pairKey = [knockoutTeams[i].id, knockoutTeams[i + 1].id].sort().join('-');
                    if (mode === 'append' && existingPairs.has(pairKey)) {
                        continue;
                    }

                    const matchDate = new Date(startDate);
                    matchDate.setDate(matchDate.getDate() + dayOffset + 3);
                    const dateStr = matchDate.toISOString().split('T')[0] + ' ' + matchTime;

                    const roundName = knockoutTeams.length <= 4 ? '半决赛' : '四分之一决赛';

                    const newMatch = {
                        id: matchIdCounter++,
                        tournamentId: this.currentTournamentId,
                        round: roundName,
                        team1Id: knockoutTeams[i].id,
                        team2Id: knockoutTeams[i + 1].id,
                        team1Name: knockoutTeams[i].name,
                        team2Name: knockoutTeams[i + 1].name,
                        team1Score: 0,
                        team2Score: 0,
                        date: dateStr,
                        status: 'upcoming',
                        venue: venue,
                        isLive: false
                    };
                    AppData.matches.push(newMatch);
                    newMatchCount++;
                    dayOffset++;
                }

                if (knockoutTeams.length >= 2) {
                    if (mode === 'append' && existingRounds.has('决赛')) {
                    } else {
                        const finalDate = new Date(startDate);
                        finalDate.setDate(finalDate.getDate() + dayOffset + 5);
                        const finalDateStr = finalDate.toISOString().split('T')[0] + ' ' + matchTime;

                        const finalMatch = {
                            id: matchIdCounter++,
                            tournamentId: this.currentTournamentId,
                            round: '决赛',
                            team1Id: 0,
                            team2Id: 0,
                            team1Name: '半决赛胜者1',
                            team2Name: '半决赛胜者2',
                            team1Score: 0,
                            team2Score: 0,
                            date: finalDateStr,
                            status: 'upcoming',
                            venue: venue,
                            isLive: false
                        };
                        AppData.matches.push(finalMatch);
                        newMatchCount++;
                    }
                }
            }
        }

        if (format === 'round') {
            for (let i = 0; i < orderedTeams.length; i++) {
                for (let j = i + 1; j < orderedTeams.length; j++) {
                    const pairKey = [orderedTeams[i].id, orderedTeams[j].id].sort().join('-');
                    if (mode === 'append' && existingPairs.has(pairKey)) {
                        continue;
                    }

                    const matchDate = new Date(startDate);
                    matchDate.setDate(matchDate.getDate() + dayOffset);
                    const dateStr = matchDate.toISOString().split('T')[0] + ' ' + matchTime;

                    const newMatch = {
                        id: matchIdCounter++,
                        tournamentId: this.currentTournamentId,
                        round: '常规赛',
                        team1Id: orderedTeams[i].id,
                        team2Id: orderedTeams[j].id,
                        team1Name: orderedTeams[i].name,
                        team2Name: orderedTeams[j].name,
                        team1Score: 0,
                        team2Score: 0,
                        date: dateStr,
                        status: 'upcoming',
                        venue: venue,
                        isLive: false
                    };
                    AppData.matches.push(newMatch);
                    newMatchCount++;
                    dayOffset += 0.5;
                }
            }
        }

        if (typeof saveToLocalStorage === 'function') saveToLocalStorage();
        Utils.showToast(`赛程生成成功！共新增 ${newMatchCount} 场比赛`, 'success');
        this.refresh();
    },

    generateKnockoutSchedule() {
        const teams = getTeamsByTournament(this.currentTournamentId);
        if (teams.length < 4) {
            Utils.showToast('至少需要4支队伍才能生成淘汰赛', 'warning');
            return;
        }

        const shuffled = [...teams].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, Math.min(8, teams.length));

        let matchIdCounter = Date.now();
        const startDate = new Date().toISOString().split('T')[0];

        const quarterCount = Math.floor(selected.length / 2);
        const semiCount = Math.max(1, Math.floor(quarterCount / 2));
        const finalCount = 1;

        let dayOffset = 0;

        if (selected.length >= 8) {
            for (let i = 0; i < 4; i++) {
                const t1 = selected[i * 2];
                const t2 = selected[i * 2 + 1];
                if (!t1 || !t2) continue;

                const matchDate = new Date(startDate);
                matchDate.setDate(matchDate.getDate() + dayOffset);

                AppData.matches.push({
                    id: matchIdCounter++,
                    tournamentId: this.currentTournamentId,
                    round: '四分之一决赛',
                    team1Id: t1.id,
                    team2Id: t2.id,
                    team1Name: t1.name,
                    team2Name: t2.name,
                    team1Score: 0,
                    team2Score: 0,
                    date: matchDate.toISOString().split('T')[0] + ' 14:00',
                    status: 'upcoming',
                    venue: '主赛场',
                    isLive: false
                });
                dayOffset++;
            }
        }

        for (let i = 0; i < semiCount; i++) {
            const t1 = selected[i * 2] || { name: '待定', id: 0 };
            const t2 = selected[i * 2 + 1] || { name: '待定', id: 0 };

            const matchDate = new Date(startDate);
            matchDate.setDate(matchDate.getDate() + dayOffset + 3);

            AppData.matches.push({
                id: matchIdCounter++,
                tournamentId: this.currentTournamentId,
                round: '半决赛',
                team1Id: t1.id,
                team2Id: t2.id,
                team1Name: t1.name,
                team2Name: t2.name,
                team1Score: 0,
                team2Score: 0,
                date: matchDate.toISOString().split('T')[0] + ' 16:00',
                status: 'upcoming',
                venue: '主赛场',
                isLive: false
            });
        }

        const finalDate = new Date(startDate);
        finalDate.setDate(finalDate.getDate() + dayOffset + 7);

        AppData.matches.push({
            id: matchIdCounter++,
            tournamentId: this.currentTournamentId,
            round: '决赛',
            team1Id: 0,
            team2Id: 0,
            team1Name: '半决赛胜者1',
            team2Name: '半决赛胜者2',
            team1Score: 0,
            team2Score: 0,
            date: finalDate.toISOString().split('T')[0] + ' 19:00',
            status: 'upcoming',
            venue: '主赛场',
            isLive: false
        });

        if (typeof saveToLocalStorage === 'function') saveToLocalStorage();
        Utils.showToast('淘汰赛对阵已生成！', 'success');
        this.refresh();
    },

    showEditMatchModal(matchId) {
        const match = getMatchById(matchId);
        if (!match) return;

        const teams = getTeamsByTournament(this.currentTournamentId);
        const teamOptions = teams.map(t => 
            `<option value="${t.id}" ${t.id === match.team1Id ? 'selected' : ''}>${t.logo} ${t.name}</option>`
        ).join('');

        const team2Options = teams.map(t => 
            `<option value="${t.id}" ${t.id === match.team2Id ? 'selected' : ''}>${t.logo} ${t.name}</option>`
        ).join('');

        const dateValue = match.date ? match.date.split(' ')[0] : '';
        const timeValue = match.date ? match.date.split(' ')[1] || '14:00' : '14:00';

        const content = `
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">对阵队伍1</label>
                    <select class="form-select" id="editTeam1">
                        ${teamOptions}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">对阵队伍2</label>
                    <select class="form-select" id="editTeam2">
                        ${team2Options}
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">比赛日期</label>
                    <input type="date" class="form-input" id="editDate" value="${dateValue}">
                </div>
                <div class="form-group">
                    <label class="form-label">比赛时间</label>
                    <input type="time" class="form-input" id="editTime" value="${timeValue}">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">比赛场地</label>
                    <select class="form-select" id="editVenue">
                        <option ${match.venue === '主赛场' ? 'selected' : ''}>主赛场</option>
                        <option ${match.venue === '赛场1号' ? 'selected' : ''}>赛场1号</option>
                        <option ${match.venue === '赛场2号' ? 'selected' : ''}>赛场2号</option>
                        <option ${match.venue === '线上赛' ? 'selected' : ''}>线上赛</option>
                        <option ${match.venue === '体育馆' ? 'selected' : ''}>体育馆</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">比赛轮次</label>
                    <input type="text" class="form-input" id="editRound" value="${match.round}">
                </div>
            </div>
            <div class="form-group">
                <label class="form-label">比赛状态</label>
                <select class="form-select" id="editStatus">
                    <option value="upcoming" ${match.status === 'upcoming' ? 'selected' : ''}>待开始</option>
                    <option value="live" ${match.status === 'live' ? 'selected' : ''}>进行中</option>
                    <option value="ended" ${match.status === 'ended' ? 'selected' : ''}>已结束</option>
                </select>
            </div>
            ${match.status === 'ended' || true ? `
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">队伍1得分</label>
                    <input type="number" class="form-input" id="editScore1" value="${match.team1Score}" min="0">
                </div>
                <div class="form-group">
                    <label class="form-label">队伍2得分</label>
                    <input type="number" class="form-input" id="editScore2" value="${match.team2Score}" min="0">
                </div>
            </div>
            ` : ''}
            <div class="p-3 bg-blue-500/10 rounded-lg border border-blue-500/30 mt-4">
                <p class="text-sm text-blue-400">
                    💡 保存后赛程列表、直播页和战绩中心都将同步更新
                </p>
            </div>
        `;

        Utils.showModal(content, {
            title: '✏️ 调整比赛信息',
            size: 'lg',
            confirmText: '保存修改',
            onConfirm: () => {
                this.saveMatchEdit(matchId);
            }
        });
    },

    updateKnockoutBracket(matchId) {
        const match = getMatchById(matchId);
        if (!match) return;

        const tournamentMatches = getMatchesByTournament(this.currentTournamentId);
        const knockoutMatches = tournamentMatches.filter(m => 
            m.round.includes('决赛') || m.round.includes('半决赛') || m.round.includes('半决') ||
            m.round.includes('四分之一') || m.round.includes('八强') || m.round.includes('四强')
        );

        const quarterFinals = knockoutMatches.filter(m => m.round.includes('四分之一') || m.round.includes('八强'));
        const semiFinals = knockoutMatches.filter(m => m.round.includes('半决赛') || m.round.includes('半决'));
        const finals = knockoutMatches.filter(m => m.round.includes('决赛') && !m.round.includes('半'));

        const getWinner = (m) => {
            if (m.status !== 'ended') return null;
            if (m.team1Score > m.team2Score) {
                return { id: m.team1Id, name: m.team1Name };
            } else if (m.team2Score > m.team1Score) {
                return { id: m.team2Id, name: m.team2Name };
            }
            return null;
        };

        const updateNextRoundMatch = (nextMatch, slot, winner) => {
            if (!nextMatch || !winner) return;
            if (slot === 1) {
                nextMatch.team1Id = winner.id;
                nextMatch.team1Name = winner.name;
            } else {
                nextMatch.team2Id = winner.id;
                nextMatch.team2Name = winner.name;
            }
        };

        if (match.round.includes('四分之一') || match.round.includes('八强')) {
            const qfIndex = quarterFinals.findIndex(m => m.id === matchId);
            if (qfIndex > -1 && semiFinals.length > 0) {
                const semiIndex = Math.floor(qfIndex / 2);
                const slot = (qfIndex % 2 === 0) ? 1 : 2;
                const winner = getWinner(match);
                if (semiFinals[semiIndex]) {
                    updateNextRoundMatch(semiFinals[semiIndex], slot, winner);
                }
            }
        }

        if (match.round.includes('半决赛') || match.round.includes('半决')) {
            const semiIndex = semiFinals.findIndex(m => m.id === matchId);
            if (semiIndex > -1 && finals.length > 0) {
                const slot = semiIndex === 0 ? 1 : 2;
                const winner = getWinner(match);
                if (finals[0]) {
                    updateNextRoundMatch(finals[0], slot, winner);
                }
            }
        }
    },

    saveMatchEdit(matchId) {
        const match = getMatchById(matchId);
        if (!match) return;

        const team1Id = parseInt(document.getElementById('editTeam1').value);
        const team2Id = parseInt(document.getElementById('editTeam2').value);
        const date = document.getElementById('editDate').value;
        const time = document.getElementById('editTime').value;
        const venue = document.getElementById('editVenue').value;
        const round = document.getElementById('editRound').value;
        const status = document.getElementById('editStatus').value;

        const team1 = getTeamById(team1Id);
        const team2 = getTeamById(team2Id);

        match.team1Id = team1Id;
        match.team2Id = team2Id;
        match.team1Name = team1 ? team1.name : match.team1Name;
        match.team2Name = team2 ? team2.name : match.team2Name;
        match.date = `${date} ${time}`;
        match.venue = venue;
        match.round = round;
        match.status = status;
        match.isLive = status === 'live';

        const score1El = document.getElementById('editScore1');
        const score2El = document.getElementById('editScore2');
        if (score1El && score2El) {
            match.team1Score = parseInt(score1El.value) || 0;
            match.team2Score = parseInt(score2El.value) || 0;
        }

        if (typeof AppData !== 'undefined' && AppData.onMatchUpdate) {
            AppData.onMatchUpdate(matchId);
        }

        this.updateKnockoutBracket(matchId);

        if (typeof saveToLocalStorage === 'function') saveToLocalStorage();
        Utils.showToast('比赛信息已更新，所有页面同步生效', 'success');
        this.refresh()
    },

    toggleMatchSelect(matchId) {
        const match = getMatchById(matchId);
        if (!match || match.status !== 'upcoming') return;

        const index = this.selectedMatchIds.indexOf(matchId);
        if (index > -1) {
            this.selectedMatchIds.splice(index, 1);
        } else {
            this.selectedMatchIds.push(matchId);
        }
        this.refresh();
    },

    showBatchPublishModal() {
        if (this.selectedMatchIds.length === 0) {
            Utils.showToast('请先选择要发布的比赛', 'error');
            return;
        }

        const content = `
            <div class="form-group">
                <label class="form-label">发布时间</label>
                <input type="datetime-local" class="form-input" id="publishTime">
            </div>
            <div class="form-group">
                <label class="form-label">
                    <input type="checkbox" id="sendReminder" checked>
                    发送比赛提醒（赛前30分钟）
                </label>
            </div>
            <div class="form-group">
                <label class="form-label">公告标题（可选）</label>
                <input type="text" class="form-input" id="announcementTitle" placeholder="留空则自动生成标题">
            </div>
            <div class="p-4 bg-primary/10 rounded-lg border border-primary/30">
                <p class="text-sm text-primary">
                    📢 已选择 <strong>${this.selectedMatchIds.length}</strong> 场比赛发布
                </p>
                <p class="text-xs text-muted mt-1">
                    发布后将在公告社区生成赛程公告
                </p>
            </div>
        `;

        Utils.showModal(content, {
            title: '批量发布赛程',
            confirmText: '确认发布',
            onConfirm: () => {
                this.doBatchPublish();
            }
        });

        setTimeout(() => {
            const now = new Date();
            now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
            const publishTimeEl = document.getElementById('publishTime');
            if (publishTimeEl) {
                publishTimeEl.value = now.toISOString().slice(0, 16);
            }
        }, 100);
    },

    doBatchPublish() {
        const publishTime = document.getElementById('publishTime')?.value || new Date().toISOString();
        const sendReminder = document.getElementById('sendReminder')?.checked !== false;
        const customTitle = document.getElementById('announcementTitle')?.value;

        const selectedMatches = this.selectedMatchIds
            .map(id => getMatchById(id))
            .filter(m => m && m.status === 'upcoming');

        if (selectedMatches.length === 0) {
            Utils.showToast('没有可发布的比赛', 'error');
            return;
        }

        const tournament = getTournamentById(this.currentTournamentId);
        const matchCount = selectedMatches.length;
        const announcementTitle = customTitle || `${tournament?.name || ''} 赛程发布 - 共${matchCount}场比赛`;

        const matchListText = selectedMatches.map(m => 
            `【${m.round}】${m.team1Name} VS ${m.team2Name} - ${m.date}`
        ).join('\\n');

        const newAnnouncement = {
            id: Date.now(),
            tournamentId: this.currentTournamentId,
            title: announcementTitle,
            content: `赛程公告：\\n${matchListText}\\n\\n请各队伍准时参赛，预祝比赛顺利！`,
            publishTime: publishTime,
            type: 'schedule',
            important: true
        };

        AppData.announcements.unshift(newAnnouncement);

        if (typeof saveToLocalStorage === 'function') saveToLocalStorage();

        this.batchMode = false;
        this.selectedMatchIds = [];

        Utils.showToast(`成功发布 ${matchCount} 场比赛！公告已发布`, 'success');
        this.refresh();
    },

    refresh() {
        const container = document.getElementById('page-schedule');
        this.render(container);
    }
};
