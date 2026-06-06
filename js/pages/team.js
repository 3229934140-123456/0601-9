const TeamPage = {
    currentTournamentId: 1,
    currentTab: 'recruit',
    myTeamId: 1,

    render(container) {
        container.innerHTML = this.generateHTML();
        this.bindEvents();
    },

    generateHTML() {
        const tournamentOptions = AppData.tournaments.filter(t => t.status !== 'ended').map(t => 
            `<option value="${t.id}" ${t.id === this.currentTournamentId ? 'selected' : ''}>${t.gameIcon} ${t.name}</option>`
        ).join('');

        const currentTournament = getTournamentById(this.currentTournamentId);
        const teams = getTeamsByTournament(this.currentTournamentId);
        const myTeam = getTeamById(this.myTeamId);

        return `
            <div class="team-header">
                <div class="tournament-selector">
                    <span class="text-secondary">选择赛事：</span>
                    <select id="tournamentSelect">
                        ${tournamentOptions}
                    </select>
                </div>
            </div>

            <div class="tabs">
                <div class="tab-item ${this.currentTab === 'recruit' ? 'active' : ''}" data-tab="recruit">队伍招募</div>
                <div class="tab-item ${this.currentTab === 'myteam' ? 'active' : ''}" data-tab="myteam">我的队伍</div>
                <div class="tab-item ${this.currentTab === 'payment' ? 'active' : ''}" data-tab="payment">缴费记录</div>
            </div>

            <div class="tab-content ${this.currentTab === 'recruit' ? 'active' : ''}" data-tab-content="recruit">
                ${this.renderRecruitTab(teams)}
            </div>

            <div class="tab-content ${this.currentTab === 'myteam' ? 'active' : ''}" data-tab-content="myteam">
                ${this.renderMyTeamTab(myTeam)}
            </div>

            <div class="tab-content ${this.currentTab === 'payment' ? 'active' : ''}" data-tab-content="payment">
                ${this.renderPaymentTab()}
            </div>
        `;
    },

    renderRecruitTab(teams) {
        const positions = ['全部位置', '上单', '打野', '中单', 'ADC', '辅助'];

        return `
            <div class="recruitment-card">
                <div class="recruitment-header">
                    <h3 class="recruitment-title">🏷️ 按位置筛选</h3>
                    <button class="btn btn-primary btn-sm" id="createTeamBtn">+ 创建队伍</button>
                </div>
                <div class="position-tags">
                    ${positions.map((pos, i) => `
                        <span class="position-tag ${i === 0 ? 'active' : ''}" data-position="${i === 0 ? 'all' : pos}">${pos}</span>
                    `).join('')}
                </div>
            </div>

            <div class="team-list" id="teamList">
                ${teams.length > 0 ? teams.map(team => this.renderTeamCard(team)).join('') : `
                    <div class="empty-state">
                        <div class="empty-state-icon">👥</div>
                        <div class="empty-state-text">暂无招募队伍</div>
                        <div class="empty-state-desc">成为第一个创建队伍的人吧！</div>
                    </div>
                `}
            </div>
        `;
    },

    renderTeamCard(team) {
        const pendingMembers = team.members.filter(m => m.status === 'pending').length;
        const approvedMembers = team.members.filter(m => m.status === 'approved').length;
        const recruitPositions = ['替补位', '打野位'];

        return `
            <div class="team-card" data-team-id="${team.id}">
                <div class="team-card-logo">${team.logo}</div>
                <div class="team-card-info">
                    <h3 class="team-card-name">${team.name}</h3>
                    <p class="team-card-slogan">${team.slogan}</p>
                    <div class="team-card-meta">
                        <span class="meta-item">👤 队长：${team.captain}</span>
                        <span class="meta-item">👥 ${approvedMembers}/${team.members.length + pendingMembers}人</span>
                        <span class="meta-item">📊 ${team.wins}胜${team.losses}负</span>
                    </div>
                    <div class="recruit-positions">
                        ${recruitPositions.map(pos => `<span class="recruit-position">招募：${pos}</span>`).join('')}
                    </div>
                </div>
                <div class="team-card-action">
                    <button class="btn btn-primary btn-sm apply-btn" data-team-id="${team.id}">申请入队</button>
                </div>
            </div>
        `;
    },

    renderMyTeamTab(team) {
        if (!team) {
            return `
                <div class="empty-state">
                    <div class="empty-state-icon">🎮</div>
                    <div class="empty-state-text">你还没有加入任何队伍</div>
                    <div class="empty-state-desc">去招募大厅找一支队伍加入，或者创建自己的队伍吧</div>
                    <button class="btn btn-primary mt-4" id="createTeamBtnEmpty">创建队伍</button>
                </div>
            `;
        }

        const pendingMembers = team.members.filter(m => m.status === 'pending');

        return `
            <div class="my-team-section">
                <div class="my-team-card">
                    <div class="my-team-header">
                        <div class="flex gap-4 items-center">
                            <div class="team-card-logo" style="width: 64px; height: 64px; font-size: 32px;">${team.logo}</div>
                            <div>
                                <h3 class="my-team-title">${team.name}</h3>
                                <p class="text-muted text-sm">${team.slogan}</p>
                            </div>
                        </div>
                        <div class="my-team-badge">我的战队</div>
                    </div>

                    <div class="grid grid-4 mb-4">
                        <div class="stat-card" style="margin: 0;">
                            <div class="stat-value" style="font-size: 24px;">${team.wins}</div>
                            <div class="stat-label">胜场</div>
                        </div>
                        <div class="stat-card" style="margin: 0;">
                            <div class="stat-value" style="font-size: 24px;">${team.losses}</div>
                            <div class="stat-label">败场</div>
                        </div>
                        <div class="stat-card" style="margin: 0;">
                            <div class="stat-value" style="font-size: 24px;">${team.points}</div>
                            <div class="stat-label">积分</div>
                        </div>
                        <div class="stat-card" style="margin: 0;">
                            <div class="stat-value" style="font-size: 24px;">#${team.rank}</div>
                            <div class="stat-label">排名</div>
                        </div>
                    </div>

                    <div class="flex-between mb-3">
                        <h4 class="font-semibold">队员列表</h4>
                        <span class="text-sm text-muted">${team.members.length}名队员</span>
                    </div>

                    <div class="members-list">
                        ${team.members.map(member => this.renderMemberCard(member, team.captainId === member.id)).join('')}
                    </div>

                    ${pendingMembers.length > 0 ? `
                        <div class="mt-6">
                            <h4 class="font-semibold mb-3">🔔 入队申请 (${pendingMembers.length})</h4>
                            <div class="members-list">
                                ${pendingMembers.map(member => this.renderPendingMember(member)).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    },

    renderMemberCard(member, isCaptain) {
        return `
            <div class="member-card">
                <div class="member-avatar">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${member.avatar}" alt="${member.name}">
                </div>
                <div class="member-info">
                    <p class="member-name">${member.name} ${isCaptain ? '👑' : ''}</p>
                    <p class="member-role">${member.role}</p>
                </div>
                <span class="member-status ${member.status}">${member.status === 'approved' ? '正式队员' : '审核中'}</span>
            </div>
        `;
    },

    renderPendingMember(member) {
        return `
            <div class="member-card">
                <div class="member-avatar">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${member.avatar}" alt="${member.name}">
                </div>
                <div class="member-info">
                    <p class="member-name">${member.name}</p>
                    <p class="member-role">${member.role}</p>
                </div>
                <div class="member-actions">
                    <button class="btn btn-success btn-sm approve-btn" data-member-id="${member.id}">通过</button>
                    <button class="btn btn-danger btn-sm reject-btn" data-member-id="${member.id}">拒绝</button>
                </div>
            </div>
        `;
    },

    renderPaymentTab() {
        const records = AppData.paymentRecords;

        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">💰 缴费记录</h3>
                    <div class="flex gap-2">
                        <button class="btn btn-secondary btn-sm" id="exportPaymentBtn">导出记录</button>
                    </div>
                </div>
                <div class="card-body" style="padding: 0;">
                    <table class="payment-table">
                        <thead>
                            <tr>
                                <th>订单号</th>
                                <th>赛事名称</th>
                                <th>队伍名称</th>
                                <th>金额</th>
                                <th>支付方式</th>
                                <th>支付时间</th>
                                <th>状态</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${records.map(record => `
                                <tr>
                                    <td>${record.orderNo}</td>
                                    <td>${record.tournamentName}</td>
                                    <td>${record.teamName}</td>
                                    <td>¥${record.amount}</td>
                                    <td>${record.payMethod || '-'}</td>
                                    <td>${record.payTime || '未支付'}</td>
                                    <td>
                                        <span class="payment-status ${record.status}">
                                            ${record.status === 'success' ? '已支付' : '待支付'}
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

    bindEvents() {
        document.getElementById('tournamentSelect').addEventListener('change', (e) => {
            this.currentTournamentId = parseInt(e.target.value);
            this.refresh();
        });

        document.querySelectorAll('.tab-item[data-tab]').forEach(tab => {
            tab.addEventListener('click', () => {
                this.currentTab = tab.dataset.tab;
                this.refresh();
            });
        });

        const createBtn = document.getElementById('createTeamBtn') || document.getElementById('createTeamBtnEmpty');
        if (createBtn) {
            createBtn.addEventListener('click', () => this.showCreateTeamModal());
        }

        document.querySelectorAll('.apply-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const teamId = parseInt(btn.dataset.teamId);
                this.applyToTeam(teamId);
            });
        });

        document.querySelectorAll('.position-tag').forEach(tag => {
            tag.addEventListener('click', () => {
                document.querySelectorAll('.position-tag').forEach(t => t.classList.remove('active'));
                tag.classList.add('active');
            });
        });

        document.querySelectorAll('.approve-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                Utils.showToast('已通过入队申请', 'success');
                this.refresh();
            });
        });

        document.querySelectorAll('.reject-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                Utils.showToast('已拒绝入队申请', 'info');
                this.refresh();
            });
        });

        const exportBtn = document.getElementById('exportPaymentBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                Utils.exportToCSV(AppData.paymentRecords, '缴费记录.csv');
                Utils.showToast('导出成功！', 'success');
            });
        }
    },

    refresh() {
        const container = document.getElementById('page-team');
        this.render(container);
    },

    showCreateTeamModal() {
        const positions = ['上单', '打野', '中单', 'ADC', '辅助', '替补'];

        const content = `
            <div class="form-group">
                <label class="form-label">队伍名称</label>
                <input type="text" class="form-input" id="teamName" placeholder="请输入队伍名称">
            </div>
            <div class="form-group">
                <label class="form-label">队伍口号</label>
                <input type="text" class="form-input" id="teamSlogan" placeholder="如：永不言弃，战至巅峰">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">你的位置</label>
                    <select class="form-select" id="teamPosition">
                        ${positions.map(p => `<option value="${p}">${p}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">招募位置</label>
                    <select class="form-select" id="recruitPosition">
                        ${positions.map(p => `<option value="${p}">${p}</option>`).join('')}
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label class="form-label">队伍介绍</label>
                <textarea class="form-textarea" id="teamDesc" placeholder="介绍一下你的队伍风格、训练时间等"></textarea>
            </div>
        `;

        Utils.showModal(content, {
            title: '创建队伍',
            confirmText: '创建队伍',
            onConfirm: () => {
                const name = document.getElementById('teamName').value.trim();
                if (!name) {
                    Utils.showToast('请输入队伍名称', 'error');
                    return false;
                }

                const newTeam = {
                    id: Date.now(),
                    name: name,
                    logo: '🎮',
                    tournamentId: this.currentTournamentId,
                    captain: '电竞小王子',
                    captainId: 999,
                    members: [
                        { id: 999, name: '电竞小王子', role: '队长', avatar: 'player1', status: 'approved' }
                    ],
                    rank: 99,
                    wins: 0,
                    losses: 0,
                    points: 0,
                    paymentStatus: 'pending',
                    joinDate: new Date().toISOString().split('T')[0],
                    slogan: document.getElementById('teamSlogan').value || '我们是最棒的！'
                };

                AppData.teams.push(newTeam);
                this.myTeamId = newTeam.id;
                Utils.showToast('队伍创建成功！', 'success');
                this.refresh();
            }
        });
    },

    applyToTeam(teamId) {
        const team = getTeamById(teamId);
        if (!team) return;

        Utils.confirm(`确定要申请加入「${team.name}」吗？`, () => {
            Utils.showToast('申请已发送，等待队长审核', 'success');
        });
    }
};
