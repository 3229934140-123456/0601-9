const CommunityPage = {
    currentTab: 'announcements',

    render(container) {
        container.innerHTML = this.generateHTML();
        this.bindEvents();
    },

    generateHTML() {
        const hotTopics = [
            { rank: 1, text: '半决赛预测', heat: '2.3w' },
            { rank: 2, text: '银河战队能否夺冠', heat: '1.8w' },
            { rank: 3, text: '新生杯MVP评选', heat: '1.5w' },
            { rank: 4, text: '最佳阵容讨论', heat: '1.2w' },
            { rank: 5, text: '电竞嘉年华筹备', heat: '9.8k' }
        ];

        const upcomingMatches = AppData.matches.filter(m => m.status === 'upcoming').slice(0, 3);

        return `
            <div class="tabs">
                <div class="tab-item ${this.currentTab === 'announcements' ? 'active' : ''}" data-tab="announcements">📢 赛事公告</div>
                <div class="tab-item ${this.currentTab === 'community' ? 'active' : ''}" data-tab="community">💬 社区讨论</div>
                <div class="tab-item ${this.currentTab === 'notifications' ? 'active' : ''}" data-tab="notifications">🔔 消息提醒</div>
            </div>

            <div class="tab-content ${this.currentTab === 'announcements' ? 'active' : ''}" data-tab-content="announcements">
                <div class="community-grid">
                    <div class="main-content-area">
                        <div class="flex-between mb-4">
                            <h3 class="text-lg font-bold">全部公告</h3>
                            <button class="btn btn-primary btn-sm" id="publishAnnouncementBtn">
                                📝 发布公告
                            </button>
                        </div>
                        ${this.renderAnnouncements()}
                    </div>
                    <div class="sidebar-area">
                        <div class="sidebar-widget">
                            <h3 class="widget-title">⏰ 近期比赛</h3>
                            <div class="reminder-list">
                                ${upcomingMatches.map(match => `
                                    <div class="reminder-item">
                                        <div class="reminder-time">
                                            <div class="reminder-hour">${this.getTime(match.date)}</div>
                                            <div class="reminder-date">${this.getDate(match.date)}</div>
                                        </div>
                                        <div class="reminder-info">
                                            <div class="reminder-match">${match.team1Name} vs ${match.team2Name}</div>
                                            <div class="reminder-tournament">${match.round}</div>
                                        </div>
                                        <button class="remind-toggle" onclick="CommunityPage.toggleRemind(${match.id})">
                                            🔕
                                        </button>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        
                        <div class="sidebar-widget">
                            <h3 class="widget-title">🔥 热门话题</h3>
                            <div class="hot-topics">
                                ${hotTopics.map(topic => `
                                    <div class="hot-topic">
                                        <span class="topic-rank top${topic.rank}">${topic.rank}</span>
                                        <span class="topic-text">${topic.text}</span>
                                        <span class="topic-heat">${topic.heat}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="tab-content ${this.currentTab === 'community' ? 'active' : ''}" data-tab-content="community">
                <div class="community-grid">
                    <div class="main-content-area">
                        <div class="flex-between mb-4">
                            <div class="flex gap-2">
                                <button class="btn btn-primary btn-sm">全部</button>
                                <button class="btn btn-secondary btn-sm">赛事讨论</button>
                                <button class="btn btn-secondary btn-sm">招募组队</button>
                                <button class="btn btn-secondary btn-sm">选手应援</button>
                                <button class="btn btn-secondary btn-sm">游戏交流</button>
                            </div>
                            <button class="btn btn-primary btn-sm" id="createPostBtn">
                                ✏️ 发布帖子
                            </button>
                        </div>
                        ${this.renderCommunityPosts()}
                    </div>
                    <div class="sidebar-area">
                        <div class="sidebar-widget">
                            <h3 class="widget-title">👤 我的社区</h3>
                            <div class="text-center py-4">
                                <div class="w-16 h-16 mx-auto rounded-full overflow-hidden mb-3 border-2 border-primary">
                                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=player1" alt="头像">
                                </div>
                                <p class="font-semibold">电竞小王子</p>
                                <p class="text-sm text-muted">Lv.8 · 资深玩家</p>
                            </div>
                            <div class="grid grid-3 text-center">
                                <div>
                                    <div class="font-bold text-lg">28</div>
                                    <div class="text-xs text-muted">发帖</div>
                                </div>
                                <div>
                                    <div class="font-bold text-lg">156</div>
                                    <div class="text-xs text-muted">关注</div>
                                </div>
                                <div>
                                    <div class="font-bold text-lg">342</div>
                                    <div class="text-xs text-muted">粉丝</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="sidebar-widget">
                            <h3 class="widget-title">🔥 热门话题</h3>
                            <div class="hot-topics">
                                ${hotTopics.map(topic => `
                                    <div class="hot-topic">
                                        <span class="topic-rank top${topic.rank}">${topic.rank}</span>
                                        <span class="topic-text">${topic.text}</span>
                                        <span class="topic-heat">${topic.heat}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="tab-content ${this.currentTab === 'notifications' ? 'active' : ''}" data-tab-content="notifications">
                ${this.renderNotifications()}
            </div>
        `;
    },

    getTime(dateStr) {
        const date = new Date(dateStr);
        return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    },

    getDate(dateStr) {
        const date = new Date(dateStr);
        return `${date.getMonth() + 1}/${date.getDate()}`;
    },

    renderAnnouncements() {
        const announcements = AppData.announcements;

        const typeIcons = {
            important: '🔴',
            urgent: '🟡',
            normal: '📢'
        };

        return `
            <div class="announcement-list">
                ${announcements.map(ann => `
                    <div class="announcement-card ${ann.type}" onclick="CommunityPage.viewAnnouncement(${ann.id})">
                        <div class="announcement-header">
                            <span class="announcement-icon">${typeIcons[ann.type] || '📢'}</span>
                            <h4 class="announcement-title">
                                ${ann.isPinned ? '<span class="pinned-icon">📌 置顶</span> ' : ''}
                                ${ann.title}
                            </h4>
                        </div>
                        <div class="announcement-meta">
                            <span>✍️ ${ann.publisher}</span>
                            <span>🕐 ${ann.publishTime}</span>
                            <span>👁️ ${ann.views}次浏览</span>
                        </div>
                        <p class="announcement-summary">${ann.content.substring(0, 100)}...</p>
                    </div>
                `).join('')}
            </div>
        `;
    },

    renderCommunityPosts() {
        const posts = AppData.communityPosts;

        return `
            <div class="post-list">
                ${posts.map(post => `
                    <div class="post-card" onclick="CommunityPage.viewPost(${post.id})">
                        <div class="post-header">
                            <div class="post-author-avatar">
                                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${post.authorAvatar}" alt="${post.author}">
                            </div>
                            <div class="post-author-info">
                                <p class="post-author">${post.author}</p>
                                <p class="post-time">${post.publishTime}</p>
                            </div>
                            <span class="post-category">${post.category}</span>
                            ${post.isHot ? '<span class="hot-badge">🔥 热门</span>' : ''}
                        </div>
                        <h4 class="post-title">${post.title}</h4>
                        <p class="post-content-preview">${post.content}</p>
                        <div class="post-footer">
                            <span class="post-action">👍 ${post.likes}</span>
                            <span class="post-action">💬 ${post.comments}</span>
                            <span class="post-action">🔗 分享</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    renderNotifications() {
        const notifications = AppData.notifications;

        const typeIcons = {
            match: '⚔️',
            team: '👥',
            result: '📊',
            announcement: '📢',
            refund: '💸'
        };

        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">🔔 消息中心</h3>
                    <button class="btn btn-secondary btn-sm" onclick="CommunityPage.markAllRead()">
                        全部已读
                    </button>
                </div>
                <div class="card-body" style="padding: 0;">
                    <div class="notification-list">
                        ${notifications.map(notif => `
                            <div class="notification-item ${notif.read ? '' : 'unread'}" onclick="CommunityPage.readNotification(${notif.id})">
                                <div class="notification-icon">${typeIcons[notif.type] || '🔔'}</div>
                                <div class="notification-content">
                                    <p class="notification-title">${notif.title}</p>
                                    <p class="notification-desc">${notif.content}</p>
                                    <p class="notification-time">${notif.time}</p>
                                </div>
                                ${!notif.read ? '<div class="notification-dot"></div>' : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>

            <style>
                .notification-list {
                    display: flex;
                    flex-direction: column;
                }
                .notification-item {
                    display: flex;
                    gap: 14px;
                    padding: 16px 20px;
                    border-bottom: 1px solid var(--border-color);
                    cursor: pointer;
                    transition: background 0.2s;
                }
                .notification-item:hover {
                    background: var(--bg-card-hover);
                }
                .notification-item.unread {
                    background: rgba(99, 102, 241, 0.05);
                }
                .notification-icon {
                    width: 44px;
                    height: 44px;
                    border-radius: 10px;
                    background: var(--bg-dark);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                    flex-shrink: 0;
                }
                .notification-content {
                    flex: 1;
                    min-width: 0;
                }
                .notification-title {
                    font-weight: 600;
                    font-size: 14px;
                    margin-bottom: 4px;
                }
                .notification-desc {
                    font-size: 13px;
                    color: var(--text-secondary);
                    margin-bottom: 4px;
                }
                .notification-time {
                    font-size: 12px;
                    color: var(--text-muted);
                }
                .notification-dot {
                    width: 10px;
                    height: 10px;
                    background: var(--danger);
                    border-radius: 50%;
                    flex-shrink: 0;
                    margin-top: 6px;
                }
            </style>
        `;
    },

    bindEvents() {
        document.querySelectorAll('.tab-item[data-tab]').forEach(tab => {
            tab.addEventListener('click', () => {
                this.currentTab = tab.dataset.tab;
                this.refresh();
            });
        });

        const publishBtn = document.getElementById('publishAnnouncementBtn');
        if (publishBtn) {
            publishBtn.addEventListener('click', () => this.showPublishModal());
        }

        const createPostBtn = document.getElementById('createPostBtn');
        if (createPostBtn) {
            createPostBtn.addEventListener('click', () => this.showCreatePostModal());
        }
    },

    viewAnnouncement(id) {
        const ann = AppData.announcements.find(a => a.id === id);
        if (!ann) return;

        const typeIcons = {
            important: '🔴 重要通知',
            urgent: '🟡 紧急通知',
            normal: '📢 普通通知'
        };

        const content = `
            <div class="announcement-content-full">
                <div class="flex items-center gap-2 mb-4">
                    <span class="text-2xl">${typeIcons[ann.type]?.split(' ')[0] || '📢'}</span>
                    <span class="tag tag-primary">${typeIcons[ann.type]?.split(' ')[1] || '通知'}</span>
                    ${ann.isPinned ? '<span class="tag tag-accent">📌 置顶</span>' : ''}
                </div>
                <h3 class="text-xl font-bold mb-4">${ann.title}</h3>
                <div class="flex gap-4 text-sm text-muted mb-6 pb-4 border-b border-gray-700">
                    <span>✍️ ${ann.publisher}</span>
                    <span>🕐 ${ann.publishTime}</span>
                    <span>👁️ ${ann.views}次浏览</span>
                </div>
                <div class="announcement-content-full">
                    ${ann.content}
                </div>
            </div>
        `;

        Utils.showModal(content, {
            title: '',
            size: 'lg',
            showFooter: true,
            confirmText: '关闭',
            onConfirm: () => {}
        });
    },

    viewPost(id) {
        const post = AppData.communityPosts.find(p => p.id === id);
        if (!post) return;

        const content = `
            <div class="mb-6">
                <h3 class="text-xl font-bold mb-4">${post.title}</h3>
                <div class="flex items-center gap-3 mb-4">
                    <div class="w-10 h-10 rounded-full overflow-hidden">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${post.authorAvatar}" alt="${post.author}">
                    </div>
                    <div>
                        <p class="font-semibold">${post.author}</p>
                        <p class="text-xs text-muted">${post.publishTime} · ${post.category}</p>
                    </div>
                </div>
                <div class="p-4 bg-dark rounded-lg mb-6">
                    <p class="leading-relaxed">${post.content}</p>
                </div>
                <div class="flex gap-6 text-sm text-muted">
                    <span>👍 ${post.likes} 点赞</span>
                    <span>💬 ${post.comments} 评论</span>
                    <span>🔗 分享</span>
                </div>
            </div>

            <div>
                <h4 class="font-bold mb-4">💬 评论区 (${post.comments})</h4>
                <div class="space-y-4 mb-4">
                    ${[1, 2, 3].map(i => `
                        <div class="flex gap-3">
                            <div class="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=comment${i}" alt="用户">
                            </div>
                            <div class="flex-1">
                                <div class="flex items-center gap-2 mb-1">
                                    <span class="font-semibold text-sm">用户${i}</span>
                                    <span class="text-xs text-muted">${i}小时前</span>
                                </div>
                                <p class="text-sm">这是一条示例评论内容，非常精彩的讨论！</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="flex gap-2">
                    <input type="text" class="form-input flex-1" placeholder="写下你的评论...">
                    <button class="btn btn-primary">发送</button>
                </div>
            </div>
        `;

        Utils.showModal(content, {
            title: '',
            size: 'lg',
            showFooter: false
        });
    },

    showPublishModal() {
        const content = `
            <div class="form-group">
                <label class="form-label">公告类型</label>
                <select class="form-select" id="announcementType">
                    <option value="normal">普通通知</option>
                    <option value="important">重要通知</option>
                    <option value="urgent">紧急通知</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">公告标题</label>
                <input type="text" class="form-input" id="announcementTitle" placeholder="请输入公告标题">
            </div>
            <div class="form-group">
                <label class="form-label">公告内容</label>
                <textarea class="form-textarea" id="announcementContent" rows="8" placeholder="请输入公告内容"></textarea>
            </div>
            <div class="form-group">
                <label class="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" id="announcementPinned">
                    <span class="text-sm">置顶公告</span>
                </label>
            </div>
        `;

        Utils.showModal(content, {
            title: '📝 发布公告',
            size: 'lg',
            confirmText: '发布公告',
            onConfirm: () => {
                const title = document.getElementById('announcementTitle').value.trim();
                if (!title) {
                    Utils.showToast('请输入公告标题', 'error');
                    return false;
                }

                const newAnn = {
                    id: Date.now(),
                    title: title,
                    content: document.getElementById('announcementContent').value,
                    type: document.getElementById('announcementType').value,
                    publisher: '赛事组委会',
                    publishTime: Utils.formatDate(new Date(), 'YYYY-MM-DD HH:mm'),
                    isPinned: document.getElementById('announcementPinned').checked,
                    views: 0
                };

                AppData.announcements.unshift(newAnn);
                Utils.showToast('公告发布成功！', 'success');
                this.refresh();
            }
        });
    },

    showCreatePostModal() {
        const categories = ['赛事讨论', '招募组队', '选手应援', '游戏交流', '其他'];

        const content = `
            <div class="form-group">
                <label class="form-label">帖子分类</label>
                <select class="form-select" id="postCategory">
                    ${categories.map(c => `<option value="${c}">${c}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">帖子标题</label>
                <input type="text" class="form-input" id="postTitle" placeholder="请输入帖子标题">
            </div>
            <div class="form-group">
                <label class="form-label">帖子内容</label>
                <textarea class="form-textarea" id="postContent" rows="8" placeholder="分享你的想法..."></textarea>
            </div>
            <div class="form-group">
                <label class="form-label">添加图片（可选）</label>
                <div class="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center cursor-pointer">
                    <div class="text-3xl mb-2">🖼️</div>
                    <p class="text-sm text-muted">点击或拖拽上传图片</p>
                </div>
            </div>
        `;

        Utils.showModal(content, {
            title: '✏️ 发布帖子',
            size: 'lg',
            confirmText: '发布',
            onConfirm: () => {
                const title = document.getElementById('postTitle').value.trim();
                if (!title) {
                    Utils.showToast('请输入帖子标题', 'error');
                    return false;
                }

                const newPost = {
                    id: Date.now(),
                    title: title,
                    author: '电竞小王子',
                    authorAvatar: 'player1',
                    content: document.getElementById('postContent').value,
                    likes: 0,
                    comments: 0,
                    publishTime: '刚刚',
                    category: document.getElementById('postCategory').value,
                    isHot: false
                };

                AppData.communityPosts.unshift(newPost);
                Utils.showToast('帖子发布成功！', 'success');
                this.refresh();
            }
        });
    },

    toggleRemind(matchId) {
        Utils.showToast('已设置比赛提醒', 'success');
    },

    readNotification(id) {
        const notif = AppData.notifications.find(n => n.id === id);
        if (notif) {
            notif.read = true;
            this.refresh();
        }
    },

    markAllRead() {
        AppData.notifications.forEach(n => n.read = true);
        Utils.showToast('已全部标记为已读', 'success');
        this.refresh();
    },

    refresh() {
        const container = document.getElementById('page-community');
        this.render(container);
    }
};
