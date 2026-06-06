const RefereePage = {
    currentTab: 'tasks',

    render(container) {
        container.innerHTML = this.generateHTML();
        this.bindEvents();
    },

    generateHTML() {
        const pendingAppeals = AppData.appeals.filter(a => a.status === 'pending').length;
        const ongoingMatches = AppData.refereeTasks.filter(t => t.status === 'ongoing').length;

        return `
            <div class="referee-stats">
                <div class="ref-stat-card">
                    <div class="ref-stat-number text-primary">${AppData.refereeTasks.length}</div>
                    <div class="ref-stat-label">执裁场次</div>
                </div>
                <div class="ref-stat-card">
                    <div class="ref-stat-number text-danger">${ongoingMatches}</div>
                    <div class="ref-stat-label">进行中</div>
                </div>
                <div class="ref-stat-card">
                    <div class="ref-stat-number text-warning">${pendingAppeals}</div>
                    <div class="ref-stat-label">待处理申诉</div>
                </div>
                <div class="ref-stat-card">
                    <div class="ref-stat-number text-success">${AppData.appeals.filter(a => a.status !== 'pending').length}</div>
                    <div class="ref-stat-label">已处理</div>
                </div>
            </div>

            <div class="tabs">
                <div class="tab-item ${this.currentTab === 'tasks' ? 'active' : ''}" data-tab="tasks">裁判任务</div>
                <div class="tab-item ${this.currentTab === 'appeals' ? 'active' : ''}" data-tab="appeals">申诉处理</div>
                <div class="tab-item ${this.currentTab === 'penalties' ? 'active' : ''}" data-tab="penalties">判罚记录</div>
            </div>

            <div class="tab-content ${this.currentTab === 'tasks' ? 'active' : ''}" data-tab-content="tasks">
                ${this.renderTasksTab()}
            </div>

            <div class="tab-content ${this.currentTab === 'appeals' ? 'active' : ''}" data-tab-content="appeals">
                ${this.renderAppealsTab()}
            </div>

            <div class="tab-content ${this.currentTab === 'penalties' ? 'active' : ''}" data-tab-content="penalties">
                ${this.renderPenaltiesTab()}
            </div>
        `;
    },

    renderTasksTab() {
        const tasks = AppData.refereeTasks;

        return `
            <div class="ref-match-list">
                ${tasks.map(task => this.renderTaskCard(task)).join('')}
            </div>
        `;
    },

    renderTaskCard(task) {
        const statusText = {
            ongoing: '进行中',
            upcoming: '待开始',
            completed: '已完成'
        };

        const statusClass = {
            ongoing: 'status-live',
            upcoming: 'status-pending',
            completed: 'status-ended'
        };

        return `
            <div class="ref-match-card">
                <div class="ref-match-header">
                    <div class="ref-match-title">
                        <span class="status-badge ${statusClass[task.status]}">${statusText[task.status]}</span>
                        <span>${task.round} - ${task.team1} VS ${task.team2}</span>
                    </div>
                    <div class="text-muted text-sm">
                        🕐 ${task.time} · 裁判：${task.referee}
                    </div>
                </div>
                <div class="ref-match-body">
                    ${task.issues.length > 0 ? `
                        <p class="text-sm text-muted mb-3">📝 比赛事件 (${task.issues.length})</p>
                        <div class="issue-list">
                            ${task.issues.map(issue => this.renderIssueItem(issue)).join('')}
                        </div>
                    ` : `
                        <p class="text-sm text-muted">暂无比赛事件</p>
                    `}
                    
                    ${task.status === 'ongoing' ? `
                        <div class="mt-4 flex gap-2">
                            <button class="btn btn-primary btn-sm" onclick="RefereePage.recordIssue(${task.id})">
                                ➕ 记录事件
                            </button>
                            <button class="btn btn-success btn-sm" onclick="RefereePage.endMatch(${task.id})">
                                ✅ 结束比赛
                            </button>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    },

    renderIssueItem(issue) {
        const statusClass = {
            pending: '',
            resolved: 'resolved',
            rejected: 'rejected'
        };

        const statusText = {
            pending: '待处理',
            resolved: '已解决',
            rejected: '已驳回'
        };

        return `
            <div class="issue-item ${statusClass[issue.status]}">
                <div class="issue-header">
                    <span class="issue-type">${issue.type}</span>
                    <span class="issue-time">${issue.time}</span>
                </div>
                <p class="issue-desc">${issue.description}</p>
                ${issue.status === 'pending' ? `
                    <div class="issue-actions">
                        <button class="btn btn-success btn-xs" onclick="RefereePage.resolveIssue(${issue.id})">
                            解决
                        </button>
                        <button class="btn btn-danger btn-xs" onclick="RefereePage.rejectIssue(${issue.id})">
                            驳回
                        </button>
                        <button class="btn btn-secondary btn-xs" onclick="RefereePage.editIssue(${issue.id})">
                            编辑
                        </button>
                    </div>
                ` : `
                    <span class="text-xs text-muted">状态：${statusText[issue.status]}</span>
                `}
            </div>
        `;
    },

    renderAppealsTab() {
        const appeals = AppData.appeals;

        return `
            <div class="appeal-list">
                ${appeals.map(appeal => this.renderAppealCard(appeal)).join('')}
            </div>
        `;
    },

    renderAppealCard(appeal) {
        const statusMap = {
            pending: { text: '待处理', class: 'status-pending' },
            approved: { text: '申诉通过', class: 'status-active' },
            rejected: { text: '申诉驳回', class: 'status-ended' }
        };

        const status = statusMap[appeal.status] || statusMap.pending;

        return `
            <div class="appeal-card">
                <div class="appeal-header">
                    <h4 class="appeal-title">${appeal.type}</h4>
                    <span class="status-badge ${status.class}">${status.text}</span>
                </div>
                <div class="appeal-meta">
                    <span>🏆 ${appeal.tournamentName}</span>
                    <span>👥 申诉方：${appeal.team}</span>
                    <span>🕐 ${appeal.submitTime}</span>
                </div>
                <div class="appeal-content">
                    ${appeal.description}
                </div>
                ${appeal.evidence && appeal.evidence.length > 0 ? `
                    <div class="appeal-evidence">
                        ${appeal.evidence.map((img, i) => `
                            <div class="evidence-thumb">
                                <img src="${img}" alt="证据${i + 1}" onclick="RefereePage.viewEvidence('${img}')">
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                ${appeal.status === 'pending' ? `
                    <div class="mt-4 flex gap-2">
                        <button class="btn btn-success" onclick="RefereePage.approveAppeal(${appeal.id})">
                            ✅ 通过申诉
                        </button>
                        <button class="btn btn-danger" onclick="RefereePage.rejectAppeal(${appeal.id})">
                            ❌ 驳回申诉
                        </button>
                        <button class="btn btn-secondary" onclick="RefereePage.reviewAppeal(${appeal.id})">
                            📝 审核详情
                        </button>
                    </div>
                ` : `
                    <div class="appeal-review">
                        <p class="review-label">审核结果 · ${appeal.reviewer} · ${appeal.reviewTime}</p>
                        <p class="review-comment">${appeal.reviewComment}</p>
                    </div>
                `}
            </div>
        `;
    },

    renderPenaltiesTab() {
        const penalties = [
            { id: 1, team: '星辰战队', player: '某选手', type: '代打', penalty: '禁赛3场', date: '2024-03-28', match: '小组赛A组第3轮' },
            { id: 2, team: '烈焰军团', player: '某选手', type: '辱骂对手', penalty: '警告', date: '2024-03-25', match: '小组赛A组第2轮' },
            { id: 3, team: '战神队', player: '某选手', type: '迟到', penalty: '罚款200元', date: '2024-04-05', match: '新生杯半决赛' }
        ];

        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">⚖️ 判罚记录</h3>
                    <button class="btn btn-primary btn-sm" onclick="RefereePage.addPenalty()">
                        ➕ 新增判罚
                    </button>
                </div>
                <div class="card-body" style="padding: 0;">
                    <table class="w-full">
                        <thead>
                            <tr>
                                <th>日期</th>
                                <th>比赛</th>
                                <th>战队</th>
                                <th>选手</th>
                                <th>违规类型</th>
                                <th>处罚结果</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${penalties.map(p => `
                                <tr>
                                    <td>${p.date}</td>
                                    <td>${p.match}</td>
                                    <td>${p.team}</td>
                                    <td>${p.player}</td>
                                    <td><span class="tag tag-accent">${p.type}</span></td>
                                    <td class="text-danger font-semibold">${p.penalty}</td>
                                    <td>
                                        <button class="text-primary text-sm mr-2">详情</button>
                                        <button class="text-muted text-sm">撤销</button>
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
        document.querySelectorAll('.tab-item[data-tab]').forEach(tab => {
            tab.addEventListener('click', () => {
                this.currentTab = tab.dataset.tab;
                this.refresh();
            });
        });
    },

    recordIssue(matchId) {
        const content = `
            <div class="form-group">
                <label class="form-label">事件类型</label>
                <select class="form-select" id="issueType">
                    <option value="暂停">暂停</option>
                    <option value="争议">争议</option>
                    <option value="违规">违规</option>
                    <option value="申诉">申诉</option>
                    <option value="其他">其他</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">发生时间</label>
                <input type="text" class="form-input" id="issueTime" placeholder="如：第2局 15:30">
            </div>
            <div class="form-group">
                <label class="form-label">事件描述</label>
                <textarea class="form-textarea" id="issueDesc" placeholder="请详细描述事件情况"></textarea>
            </div>
            <div class="form-group">
                <label class="form-label">相关证据（可选）</label>
                <div class="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center cursor-pointer">
                    <span class="text-muted">点击上传截图或录像</span>
                </div>
            </div>
        `;

        Utils.showModal(content, {
            title: '➕ 记录比赛事件',
            confirmText: '确认记录',
            onConfirm: () => {
                Utils.showToast('事件已记录', 'success');
                this.refresh();
            }
        });
    },

    resolveIssue(issueId) {
        Utils.confirm('确定将此事件标记为已解决吗？', () => {
            Utils.showToast('事件已解决', 'success');
            this.refresh();
        });
    },

    rejectIssue(issueId) {
        Utils.confirm('确定驳回此事件吗？', () => {
            Utils.showToast('事件已驳回', 'info');
            this.refresh();
        });
    },

    editIssue(issueId) {
        Utils.showToast('编辑功能开发中', 'info');
    },

    endMatch(matchId) {
        Utils.confirm('确定要结束这场比赛吗？结束后将无法修改比赛结果。', () => {
            const content = `
                <div class="form-group">
                    <label class="form-label">最终比分</label>
                    <div class="flex gap-4 items-center justify-center">
                        <input type="number" class="form-input text-center text-2xl font-bold" value="0" style="width: 80px;">
                        <span class="text-2xl font-bold text-muted">:</span>
                        <input type="number" class="form-input text-center text-2xl font-bold" value="0" style="width: 80px;">
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">比赛结果说明</label>
                    <textarea class="form-textarea" placeholder="可填写比赛详情、MVP等"></textarea>
                </div>
                <div class="form-group">
                    <label class="form-label">上传赛果截图</label>
                    <div class="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center cursor-pointer">
                        <span class="text-muted">点击上传比赛结果截图</span>
                    </div>
                </div>
            `;

            Utils.showModal(content, {
                title: '✅ 结束比赛',
                confirmText: '确认结束',
                onConfirm: () => {
                    Utils.showToast('比赛已结束，结果已录入', 'success');
                    this.refresh();
                }
            });
        });
    },

    approveAppeal(appealId) {
        const content = `
            <div class="form-group">
                <label class="form-label">处理意见</label>
                <textarea class="form-textarea" id="approveComment" placeholder="请填写申诉通过的理由和处理方案"></textarea>
            </div>
            <div class="form-group">
                <label class="form-label">处理方式</label>
                <select class="form-select">
                    <option>重赛</option>
                    <option>改判</option>
                    <option>扣除积分</option>
                    <option>警告处理</option>
                </select>
            </div>
        `;

        Utils.showModal(content, {
            title: '✅ 通过申诉',
            confirmText: '确认通过',
            onConfirm: () => {
                Utils.showToast('申诉已通过', 'success');
                this.refresh();
            }
        });
    },

    rejectAppeal(appealId) {
        const content = `
            <div class="form-group">
                <label class="form-label">驳回理由</label>
                <textarea class="form-textarea" id="rejectComment" placeholder="请详细填写驳回申诉的理由"></textarea>
            </div>
        `;

        Utils.showModal(content, {
            title: '❌ 驳回申诉',
            confirmText: '确认驳回',
            onConfirm: () => {
                Utils.showToast('申诉已驳回', 'info');
                this.refresh();
            }
        });
    },

    reviewAppeal(appealId) {
        Utils.showToast('进入审核详情', 'info');
    },

    viewEvidence(imageUrl) {
        const content = `
            <img src="${imageUrl}" alt="证据图片" style="width: 100%; border-radius: 10px;">
        `;

        Utils.showModal(content, {
            title: '🔍 证据查看',
            size: 'lg',
            showFooter: false
        });
    },

    addPenalty() {
        const content = `
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">选择比赛</label>
                    <select class="form-select">
                        ${AppData.matches.map(m => `<option>${m.round} - ${m.team1Name} VS ${m.team2Name}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">违规战队</label>
                    <select class="form-select">
                        ${AppData.teams.map(t => `<option>${t.name}</option>`).join('')}
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">违规选手</label>
                    <input type="text" class="form-input" placeholder="选手ID或姓名">
                </div>
                <div class="form-group">
                    <label class="form-label">违规类型</label>
                    <select class="form-select">
                        <option>代打</option>
                        <option>辱骂对手</option>
                        <option>迟到</option>
                        <option>使用外挂</option>
                        <option>消极比赛</option>
                        <option>其他</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label class="form-label">处罚决定</label>
                <select class="form-select">
                    <option>警告</option>
                    <option>罚款</option>
                    <option>禁赛1场</option>
                    <option>禁赛3场</option>
                    <option>取消成绩</option>
                    <option>永久禁赛</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">处罚说明</label>
                <textarea class="form-textarea" placeholder="详细描述违规情况和处罚依据"></textarea>
            </div>
        `;

        Utils.showModal(content, {
            title: '⚖️ 新增判罚',
            size: 'lg',
            confirmText: '确认判罚',
            onConfirm: () => {
                Utils.showToast('判罚已记录', 'success');
                this.refresh();
            }
        });
    },

    refresh() {
        const container = document.getElementById('page-referee');
        this.render(container);
    }
};
