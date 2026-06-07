const App = {
    currentPage: 'hall',
    pages: {},

    init() {
        if (typeof loadFromLocalStorage !== 'undefined') {
            loadFromLocalStorage();
        }
        this.bindNavEvents();
        this.initPages();
        this.renderPage('hall');
    },

    bindNavEvents() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                const page = item.dataset.page;
                this.switchPage(page);
            });
        });
    },

    switchPage(page, params) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.page === page);
        });

        const titles = {
            overview: { title: '运营总览', desc: '赛事运营数据一目了然' },
            hall: { title: '赛事大厅', desc: '发现精彩校园电竞赛事' },
            team: { title: '报名组队', desc: '组建你的战队，征战赛场' },
            schedule: { title: '赛程编排', desc: '查看和管理赛事日程' },
            live: { title: '对阵直播', desc: '实时观看精彩赛事直播' },
            record: { title: '战绩中心', desc: '查看比赛战绩与排行' },
            referee: { title: '裁判面板', desc: '管理比赛判罚与申诉' },
            community: { title: '公告社区', desc: '赛事公告与玩家社区' }
        };

        const titleInfo = titles[page] || { title: '', desc: '' };
        document.querySelector('.page-title').textContent = titleInfo.title;
        document.querySelector('.page-desc').textContent = titleInfo.desc;

        this.currentPage = page;
        this.renderPage(page, params);
    },

    initPages() {
        if (typeof OverviewPage !== 'undefined') this.pages.overview = OverviewPage;
        if (typeof HallPage !== 'undefined') this.pages.hall = HallPage;
        if (typeof TeamPage !== 'undefined') this.pages.team = TeamPage;
        if (typeof SchedulePage !== 'undefined') this.pages.schedule = SchedulePage;
        if (typeof LivePage !== 'undefined') this.pages.live = LivePage;
        if (typeof RecordPage !== 'undefined') this.pages.record = RecordPage;
        if (typeof RefereePage !== 'undefined') this.pages.referee = RefereePage;
        if (typeof CommunityPage !== 'undefined') this.pages.community = CommunityPage;
    },

    renderPage(page, params) {
        document.querySelectorAll('.page-section').forEach(section => {
            section.classList.remove('active');
        });

        const pageSection = document.getElementById(`page-${page}`);
        if (pageSection) {
            pageSection.classList.add('active');
        }

        if (this.pages[page] && typeof this.pages[page].render === 'function') {
            this.pages[page].render(pageSection, params);
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
