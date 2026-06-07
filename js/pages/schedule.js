const SchedulePage = {
    currentTournamentId: 1,
    currentView: 'list',
    selectedRound: 'all',
    editingMatchId: null,

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
                    <button class="btn btn-secondary btn-sm ${this.currentView === 'calendar' ? 'active' : ''}" id="calendarViewBtn">
                        📅 日历视图
                    </button>
                    <button class="btn btn-secondary btn-sm ${this.currentView === 'list' ? 'active' : ''}" id="listViewBtn">
                        📋 列表视图
                    </button>
                    <button class="btn btn-primary btn-sm" id="autoGenerateBtn">
                        ⚡ 自动生成赛程
                    </button>
                    <button class="btn btn-secondary btn-sm" id="adjustBtn">
                        ✏️ 手动调整
                    </button>
                </div>
            </div>

            <div class="round-tabs">
                <div class="round-tab ${this.selectedRound === 'all' ? 'active' : ''}" data-round="all">全部</div>
                ${rounds.map(round => `
                    <div class="round-tab ${this.selectedRound === round ? 'active' : ''}" data-round="${round}">${round}</div>
                `).join('')}
            </div>

            ${this.currentView === 'calendar' ? this.renderCalendarView(matches) : this.renderListView(matches)}
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

    renderMatchCard(match) {
        const team1 = getTeamById(match.team1Id);
        const team2 = getTeamById(match.team2Id);

        const team1Logo = team1 ? team1.logo : '🎮';
        const team2Logo = team2 ? team2.logo : '🎮';

        const isLive = match.status === 'live';
        const isEnded = match.status === 'ended';

        return `
            <div class="match-card ${isLive ? 'live' : ''}" data-match-id="${match.id}">
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
        const date = new Date(dateStr);
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        return `${month}月${day}日 ${weekdays[date.getDay()]}`;
    },

    formatMatchTime(dateStr) {
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
            const matches = getMatchesByTournament(this.currentTournamentId);
            if (matches.length === 0) {
                Utils.showToast('暂无比赛可调整，请先生成赛程', 'warning');
                return;
            }
            Utils.showToast('点击比赛卡片上的「编辑」按钮进行调整', 'info');
        });

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
                App.switchPage('record');
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

    refresh() {
        const container = document.getElementById('page-schedule');
        this.render(container);
    },

    showAutoGenerateModal() {
        const tournament = getTournamentById(this.currentTournamentId);
        const teams = getTeamsByTournament(this.currentTournamentId);
        const existingMatches = getMatchesByTournament(this.currentTournamentId);
        const hasEndedMatches = existingMatches.some(m => m.status === 'ended');
        const hasUpcomingMatches = existingMatches.some(m => m.status === 'upcoming' || m.status === 'live');

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
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="generateMode" value="overwrite" checked>
                        <span><strong>覆盖未开始赛程</strong> - 替换未开始的比赛，已结束比赛保留</span>
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="generateMode" value="append">
                        <span><strong>追加新赛程</strong> - 在现有基础上新增比赛</span>
                    </label>
                </div>
            </div>
            ` : ''}
            <div class="p-4 bg-amber-500/10 rounded-lg border border-amber-500/30">
                <p class="text-sm text-amber-400">
                    ⚡ 当前参赛队伍：${teams.length}支，预计将生成约 ${Math.ceil(teams.length / 2)} 场比赛
                </p>
                ${hasEndedMatches ? `<p class="text-sm text-amber-400 mt-1">⚠️ 已有已结束比赛，将不会被删除</p>` : ''}
            </div>
        `;

        Utils.showModal(content, {
            title: '自动生成赛程',
            size: 'md',
            confirmText: '开始生成',
            onConfirm: () => {
                const modeEl = document.querySelector('input[name="generateMode"]:checked');
                const mode = modeEl ? modeEl.value : 'overwrite';
                this.generateSchedule(mode);
            }
        });
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

        if (mode === 'overwrite') {
            AppData.matches = AppData.matches.filter(m => 
                m.tournamentId !== this.currentTournamentId || m.status === 'ended'
            );
        }

        const shuffledTeams = [...teams].sort(() => Math.random() - 0.5);
        const groupNames = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
        
        let matchIdCounter = Date.now();
        let dayOffset = 0;

        for (let g = 0; g < groupCount && g < groupNames.length; g++) {
            const groupTeams = shuffledTeams.slice(g * 2, g * 2 + 2);
            if (groupTeams.length < 2) continue;

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

            dayOffset++;
        }

        const remainingTeams = shuffledTeams.slice(groupCount * 2);
        for (let i = 0; i < remainingTeams.length - 1; i += 2) {
            if (i + 1 >= remainingTeams.length) break;

            const matchDate = new Date(startDate);
            matchDate.setDate(matchDate.getDate() + dayOffset);
            const dateStr = matchDate.toISOString().split('T')[0] + ' ' + matchTime;

            const newMatch = {
                id: matchIdCounter++,
                tournamentId: this.currentTournamentId,
                round: '附加赛',
                team1Id: remainingTeams[i].id,
                team2Id: remainingTeams[i + 1].id,
                team1Name: remainingTeams[i].name,
                team2Name: remainingTeams[i + 1].name,
                team1Score: 0,
                team2Score: 0,
                date: dateStr,
                status: 'upcoming',
                venue: venue,
                isLive: false
            };
            AppData.matches.push(newMatch);

            dayOffset++;
        }

        Utils.showToast(`赛程生成成功！共生成 ${Math.floor(teams.length / 2)} 场比赛`, 'success');
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
            ${match.status === 'ended' ? `
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
            <div class="p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                <p class="text-sm text-blue-400">
                    💡 提示：修改后点击保存，列表将立即更新
                </p>
            </div>
        `;

        Utils.showModal(content, {
            title: '✏️ 调整比赛信息',
            size: 'md',
            confirmText: '保存修改',
            onConfirm: () => {
                this.saveMatchEdit(matchId);
            }
        });
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

        const team1 = getTeamById(team1Id);
        const team2 = getTeamById(team2Id);

        match.team1Id = team1Id;
        match.team2Id = team2Id;
        match.team1Name = team1 ? team1.name : match.team1Name;
        match.team2Name = team2 ? team2.name : match.team2Name;
        match.date = `${date} ${time}`;
        match.venue = venue;
        match.round = round;

        if (match.status === 'ended') {
            const score1El = document.getElementById('editScore1');
            const score2El = document.getElementById('editScore2');
            if (score1El && score2El) {
                match.team1Score = parseInt(score1El.value) || 0;
                match.team2Score = parseInt(score2El.value) || 0;
            }
        }

        Utils.showToast('比赛信息已更新', 'success');
        this.refresh();
    }
};
