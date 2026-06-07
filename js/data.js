const AppData = {
    tournaments: [
        {
            id: 1,
            name: "2024春季校园电竞联赛",
            game: "英雄联盟",
            gameIcon: "🎮",
            status: "active",
            startDate: "2024-03-15",
            endDate: "2024-05-20",
            location: "大学生活动中心",
            maxTeams: 32,
            currentTeams: 28,
            prize: "10000元",
            organizer: "校电竞社",
            description: "一年一度的校园电竞盛宴，汇聚全校顶尖战队，争夺荣耀与奖金！",
            rules: [
                "比赛采用5v5召唤师峡谷模式",
                "每队最少5人，最多7人（含替补）",
                "比赛版本采用当前最新版本",
                "小组赛BO1，淘汰赛BO3，决赛BO5",
                "所有队员必须为在校学生"
            ],
            fee: 50,
            banner: "tournament1"
        },
        {
            id: 2,
            name: "王者荣耀新生杯",
            game: "王者荣耀",
            gameIcon: "👑",
            status: "active",
            startDate: "2024-04-01",
            endDate: "2024-04-30",
            location: "线上赛",
            maxTeams: 16,
            currentTeams: 16,
            prize: "5000元",
            organizer: "校体育部",
            description: "专为新生打造的电竞赛事，展现你的实力，结识志同道合的朋友！",
            rules: [
                "5v5王者峡谷征召模式",
                "仅限大一新生参加",
                "每队5-6人",
                "全程线上进行",
                "决赛在线下举办"
            ],
            fee: 0,
            banner: "tournament2"
        },
        {
            id: 3,
            name: "CS:GO反恐精英挑战赛",
            game: "CSGO",
            gameIcon: "🔫",
            status: "pending",
            startDate: "2024-06-01",
            endDate: "2024-06-15",
            location: "电竞馆",
            maxTeams: 24,
            currentTeams: 12,
            prize: "8000元",
            organizer: "FPS社团",
            description: "枪法与战术的较量，谁能成为校园CS王者？",
            rules: [
                "5v5竞技模式",
                "MR12赛制",
                "每队5名首发2名替补",
                "禁止使用任何外挂辅助",
                "需自带外设或使用场馆设备"
            ],
            fee: 30,
            banner: "tournament3"
        },
        {
            id: 4,
            name: "冬季电竞嘉年华",
            game: "综合",
            gameIcon: "🎯",
            status: "ended",
            startDate: "2023-12-01",
            endDate: "2023-12-25",
            location: "体育馆",
            maxTeams: 48,
            currentTeams: 48,
            prize: "20000元",
            organizer: "校团委",
            description: "冬季最大规模电竞赛事，多个项目同时开赛，精彩不停歇！",
            rules: [
                "设英雄联盟、王者荣耀、CSGO三个项目",
                "可同时报名多个项目",
                "各项目独立排名",
                "总冠军由积分决定"
            ],
            fee: 40,
            banner: "tournament4"
        },
        {
            id: 5,
            name: "Valorant先锋杯",
            game: "Valorant",
            gameIcon: "💥",
            status: "pending",
            startDate: "2024-07-10",
            endDate: "2024-07-25",
            location: "线上赛",
            maxTeams: 32,
            currentTeams: 8,
            prize: "6000元",
            organizer: "战术射击社",
            description: "新兴战术射击游戏赛事，展现你的精准枪法和战术意识！",
            rules: [
                "5v5标准模式",
                "BO3赛制",
                "每队5-7人",
                "线上进行，决赛线下"
            ],
            fee: 25,
            banner: "tournament5"
        },
        {
            id: 6,
            name: "炉石传说棋王争霸赛",
            game: "炉石传说",
            gameIcon: "🃏",
            status: "active",
            startDate: "2024-03-20",
            endDate: "2024-04-10",
            location: "线上赛",
            maxTeams: 64,
            currentTeams: 45,
            prize: "3000元",
            organizer: "卡牌游戏社",
            description: "智慧与运气的博弈，谁是校园最强牌手？",
            rules: [
                "标准模式征服赛制",
                "每人4套卡组",
                "单败淘汰制",
                "全程线上进行"
            ],
            fee: 10,
            banner: "tournament6"
        }
    ],

    teams: [
        {
            id: 1,
            name: "银河战舰",
            logo: "🚀",
            tournamentId: 1,
            captain: "李队长",
            captainId: 101,
            members: [
                { id: 101, name: "李队长", role: "队长/上单", avatar: "player1", status: "approved" },
                { id: 102, name: "王打野", role: "打野", avatar: "player2", status: "approved" },
                { id: 103, name: "张中单", role: "中单", avatar: "player3", status: "approved" },
                { id: 104, name: "刘ADC", role: "ADC", avatar: "player4", status: "approved" },
                { id: 105, name: "陈辅助", role: "辅助", avatar: "player5", status: "approved" }
            ],
            recruitPositions: ["替补位"],
            rank: 1,
            wins: 8,
            losses: 1,
            points: 24,
            paymentStatus: "paid",
            joinDate: "2024-03-10",
            slogan: "银河不倒，我们不散！"
        },
        {
            id: 2,
            name: "雷霆战队",
            logo: "⚡",
            tournamentId: 1,
            captain: "赵雷霆",
            captainId: 201,
            members: [
                { id: 201, name: "赵雷霆", role: "队长/中单", avatar: "player6", status: "approved" },
                { id: 202, name: "孙上单", role: "上单", avatar: "player7", status: "approved" },
                { id: 203, name: "周打野", role: "打野", avatar: "player8", status: "approved" },
                { id: 204, name: "吴下路", role: "ADC", avatar: "player9", status: "pending" },
                { id: 205, name: "郑辅助", role: "辅助", avatar: "player10", status: "pending" }
            ],
            recruitPositions: ["ADC位", "辅助位"],
            rank: 2,
            wins: 7,
            losses: 2,
            points: 21,
            paymentStatus: "paid",
            joinDate: "2024-03-11",
            slogan: "雷霆万钧，势不可挡！"
        },
        {
            id: 3,
            name: "星辰战队",
            logo: "⭐",
            tournamentId: 1,
            captain: "黄星辰",
            captainId: 301,
            members: [
                { id: 301, name: "黄星辰", role: "队长/ADC", avatar: "player11", status: "approved" },
                { id: 302, name: "徐上单", role: "上单", avatar: "player12", status: "approved" },
                { id: 303, name: "马打野", role: "打野", avatar: "player13", status: "approved" },
                { id: 304, name: "朱中单", role: "中单", avatar: "player14", status: "approved" },
                { id: 305, name: "胡辅助", role: "辅助", avatar: "player15", status: "rejected" }
            ],
            recruitPositions: ["辅助位"],
            rank: 3,
            wins: 6,
            losses: 3,
            points: 18,
            paymentStatus: "pending",
            joinDate: "2024-03-12",
            slogan: "星辰大海，永不止步！"
        },
        {
            id: 4,
            name: "烈焰军团",
            logo: "🔥",
            tournamentId: 1,
            captain: "林烈焰",
            captainId: 401,
            members: [
                { id: 401, name: "林烈焰", role: "队长/打野", avatar: "player16", status: "approved" },
                { id: 402, name: "何上单", role: "上单", avatar: "player17", status: "approved" },
                { id: 403, name: "高中单", role: "中单", avatar: "player18", status: "approved" },
                { id: 404, name: "罗ADC", role: "ADC", avatar: "player19", status: "approved" },
                { id: 405, name: "梁辅助", role: "辅助", avatar: "player20", status: "approved" }
            ],
            recruitPositions: ["上单位", "替补位"],
            rank: 4,
            wins: 5,
            losses: 4,
            points: 15,
            paymentStatus: "paid",
            joinDate: "2024-03-13",
            slogan: "烈焰燃烧，战无不胜！"
        },
        {
            id: 5,
            name: "刺客联盟",
            logo: "🗡️",
            tournamentId: 2,
            captain: "宋刺客",
            captainId: 501,
            members: [
                { id: 501, name: "宋刺客", role: "队长/打野", avatar: "player21", status: "approved" },
                { id: 502, name: "唐对抗", role: "对抗路", avatar: "player22", status: "approved" },
                { id: 503, name: "许中路", role: "中路", avatar: "player23", status: "approved" },
                { id: 504, name: "韩射手", role: "射手", avatar: "player24", status: "approved" },
                { id: 505, name: "冯游走", role: "游走", avatar: "player25", status: "approved" }
            ],
            recruitPositions: ["游走位"],
            rank: 1,
            wins: 10,
            losses: 0,
            points: 30,
            paymentStatus: "paid",
            joinDate: "2024-04-02",
            slogan: "影随我动，刺杀无形！"
        },
        {
            id: 6,
            name: "战神队",
            logo: "⚔️",
            tournamentId: 2,
            captain: "邓战神",
            captainId: 601,
            members: [
                { id: 601, name: "邓战神", role: "队长/对抗路", avatar: "player26", status: "approved" },
                { id: 602, name: "曹打野", role: "打野", avatar: "player27", status: "approved" },
                { id: 603, name: "彭中路", role: "中路", avatar: "player28", status: "pending" },
                { id: 604, name: "曾射手", role: "射手", avatar: "player29", status: "pending" },
                { id: 605, name: "萧辅助", role: "辅助", avatar: "player30", status: "pending" }
            ],
            recruitPositions: ["中路位", "射手位", "辅助位"],
            rank: 2,
            wins: 8,
            losses: 2,
            points: 24,
            paymentStatus: "paid",
            joinDate: "2024-04-03",
            slogan: "战神出征，寸草不生！"
        }
    ],

    matches: [
        {
            id: 1,
            tournamentId: 1,
            round: "小组赛A组",
            team1Id: 1,
            team2Id: 2,
            team1Name: "银河战舰",
            team2Name: "雷霆战队",
            team1Score: 1,
            team2Score: 0,
            date: "2024-03-25 14:00",
            status: "ended",
            venue: "赛场1号",
            isLive: false
        },
        {
            id: 2,
            tournamentId: 1,
            round: "小组赛A组",
            team1Id: 3,
            team2Id: 4,
            team1Name: "星辰战队",
            team2Name: "烈焰军团",
            team1Score: 0,
            team2Score: 1,
            date: "2024-03-25 16:00",
            status: "ended",
            venue: "赛场2号",
            isLive: false
        },
        {
            id: 3,
            tournamentId: 1,
            round: "小组赛A组",
            team1Id: 1,
            team2Id: 3,
            team1Name: "银河战舰",
            team2Name: "星辰战队",
            team1Score: 2,
            team2Score: 1,
            date: "2024-03-26 14:00",
            status: "ended",
            venue: "赛场1号",
            isLive: false,
            screenshots: [
                "https://picsum.photos/seed/game1/400/300",
                "https://picsum.photos/seed/game2/400/300"
            ],
            isCollection: true
        },
        {
            id: 4,
            tournamentId: 1,
            round: "小组赛A组",
            team1Id: 2,
            team2Id: 4,
            team1Name: "雷霆战队",
            team2Name: "烈焰军团",
            team1Score: 1,
            team2Score: 1,
            date: "2024-03-26 16:00",
            status: "ended",
            venue: "赛场2号",
            isLive: false
        },
        {
            id: 5,
            tournamentId: 1,
            round: "半决赛",
            team1Id: 1,
            team2Id: 4,
            team1Name: "银河战舰",
            team2Name: "烈焰军团",
            team1Score: 0,
            team2Score: 0,
            date: "2024-04-10 14:00",
            status: "upcoming",
            venue: "主赛场",
            isLive: false
        },
        {
            id: 6,
            tournamentId: 1,
            round: "半决赛",
            team1Id: 2,
            team2Id: 3,
            team1Name: "雷霆战队",
            team2Name: "星辰战队",
            team1Score: 0,
            team2Score: 0,
            date: "2024-04-10 19:00",
            status: "live",
            venue: "主赛场",
            isLive: true,
            streamUrl: "https://www.twitch.tv"
        },
        {
            id: 7,
            tournamentId: 2,
            round: "小组赛",
            team1Id: 5,
            team2Id: 6,
            team1Name: "刺客联盟",
            team2Name: "战神队",
            team1Score: 2,
            team2Score: 0,
            date: "2024-04-08 15:00",
            status: "ended",
            venue: "线上",
            isLive: false
        },
        {
            id: 8,
            tournamentId: 1,
            round: "决赛",
            team1Id: 1,
            team2Id: 2,
            team1Name: "银河战舰",
            team2Name: "雷霆战队",
            team1Score: 0,
            team2Score: 0,
            date: "2024-05-20 18:00",
            status: "upcoming",
            venue: "体育馆",
            isLive: false
        }
    ],

    players: [
        {
            id: 101,
            name: "李队长",
            nickname: "Galaxy.Li",
            avatar: "player1",
            gameId: "李队长#1234",
            school: "计算机学院",
            grade: "大三",
            position: "上单",
            teamId: 1,
            teamName: "银河战舰",
            rank: "钻石I",
            winRate: 78,
            totalMatches: 45,
            kills: 156,
            deaths: 89,
            assists: 234,
            mvpCount: 12,
            signatureHeroes: ["暗裔剑魔", "腕豪", "格温"],
            joinDate: "2023-09-01"
        },
        {
            id: 201,
            name: "赵雷霆",
            nickname: "Thunder.Zhao",
            avatar: "player6",
            gameId: "雷霆法王#5678",
            school: "电子信息学院",
            grade: "大二",
            position: "中单",
            teamId: 2,
            teamName: "雷霆战队",
            rank: "大师",
            winRate: 72,
            totalMatches: 38,
            kills: 201,
            deaths: 95,
            assists: 189,
            mvpCount: 15,
            signatureHeroes: ["劫", "亚索", "永恩"],
            joinDate: "2023-09-10"
        },
        {
            id: 501,
            name: "宋刺客",
            nickname: "Assassin.Song",
            avatar: "player21",
            gameId: "刺客之王#9999",
            school: "机械工程学院",
            grade: "大一",
            position: "打野",
            teamId: 5,
            teamName: "刺客联盟",
            rank: "最强王者",
            winRate: 85,
            totalMatches: 52,
            kills: 289,
            deaths: 78,
            assists: 312,
            mvpCount: 22,
            signatureHeroes: ["镜", "澜", "韩信"],
            joinDate: "2024-02-15"
        }
    ],

    refereeTasks: [
        {
            id: 1,
            matchId: 6,
            tournamentId: 1,
            team1: "雷霆战队",
            team2: "星辰战队",
            round: "半决赛",
            time: "2024-04-10 19:00",
            status: "ongoing",
            referee: "张裁判",
            issues: [
                { id: 101, type: "暂停", time: "第2局 15:30", description: "星辰战队申请暂停，队员网络故障", status: "resolved" },
                { id: 102, type: "争议", time: "第2局 20:45", description: "雷霆战队认为对方有代打嫌疑", status: "pending" }
            ]
        },
        {
            id: 2,
            matchId: 5,
            tournamentId: 1,
            team1: "银河战舰",
            team2: "烈焰军团",
            round: "半决赛",
            time: "2024-04-10 14:00",
            status: "upcoming",
            referee: "王裁判",
            issues: []
        },
        {
            id: 3,
            matchId: 3,
            tournamentId: 1,
            team1: "银河战舰",
            team2: "星辰战队",
            round: "小组赛A组",
            time: "2024-03-26 14:00",
            status: "completed",
            referee: "张裁判",
            issues: [
                { id: 103, type: "申诉", time: "赛后", description: "星辰战队申诉第三局有Bug影响比赛", status: "rejected" }
            ]
        }
    ],

    appeals: [
        {
            id: 1,
            matchId: 3,
            tournamentName: "2024春季校园电竞联赛",
            team: "星辰战队",
            type: "比赛结果申诉",
            description: "第三局比赛中出现严重Bug，我方打野惩戒无法使用，直接影响了比赛结果。申请重赛该场。",
            evidence: [
                "https://picsum.photos/seed/evidence1/400/300",
                "https://picsum.photos/seed/evidence2/400/300"
            ],
            submitTime: "2024-03-26 18:30",
            status: "rejected",
            reviewer: "裁判委员会",
            reviewTime: "2024-03-27 10:00",
            reviewComment: "经核查，该Bug为游戏版本已知问题，且双方均受影响，不足以影响比赛整体走势。申诉驳回。"
        },
        {
            id: 2,
            matchId: 6,
            tournamentName: "2024春季校园电竞联赛",
            team: "雷霆战队",
            type: "代打举报",
            description: "发现星辰战队替补选手有代打嫌疑，其操作风格与之前比赛明显不同，且账号等级异常。",
            evidence: [
                "https://picsum.photos/seed/evidence3/400/300"
            ],
            submitTime: "2024-04-10 20:15",
            status: "pending",
            reviewer: null,
            reviewTime: null,
            reviewComment: null
        }
    ],

    announcements: [
        {
            id: 1,
            title: "2024春季校园电竞联赛半决赛赛程公布",
            content: "经过激烈的小组赛角逐，四强队伍已经产生。半决赛将于4月10日在主赛场进行，欢迎同学们前来观赛！\n\n对阵情况：\n14:00 银河战舰 vs 烈焰军团\n19:00 雷霆战队 vs 星辰战队\n\n现场观众将有机会获得精美周边礼品。",
            type: "important",
            publisher: "赛事组委会",
            publishTime: "2024-04-05 10:00",
            isPinned: true,
            views: 2345
        },
        {
            id: 2,
            title: "关于比赛设备使用的通知",
            content: "为保证比赛公平性，所有参赛选手需注意以下事项：\n1. 可自带外设，但需提前报备\n2. 禁止使用任何宏定义设备\n3. 比赛设备统一由组委会提供\n4. 如有特殊需求请提前3天申请",
            type: "normal",
            publisher: "裁判委员会",
            publishTime: "2024-04-03 14:30",
            isPinned: false,
            views: 1234
        },
        {
            id: 3,
            title: "新生杯报名即将截止",
            content: "王者荣耀新生杯报名将于4月5日23:59截止，还没报名的新生队伍抓紧时间啦！目前已有16支队伍确认参赛，比赛将于4月8日正式开赛。",
            type: "urgent",
            publisher: "校体育部",
            publishTime: "2024-04-02 09:00",
            isPinned: false,
            views: 3456
        },
        {
            id: 4,
            title: "5月电竞嘉年华筹备中",
            content: "一年一度的电竞嘉年华将于5月盛大开启！本次嘉年华将包含多个电竞项目，以及Cosplay、周边市集等活动。现招募志愿者和表演赛队伍，有意者请联系电竞社。",
            type: "normal",
            publisher: "校电竞社",
            publishTime: "2024-04-01 16:00",
            isPinned: false,
            views: 1890
        }
    ],

    communityPosts: [
        {
            id: 1,
            title: "半决赛预测：银河战舰 vs 烈焰军团，谁能晋级决赛？",
            author: "电竞老司机",
            authorAvatar: "user1",
            content: "大家来讨论一下这场半决赛的胜负吧！银河战舰小组赛状态火热，只输了一场；烈焰军团虽然排名第四，但淘汰赛状态越来越好。我觉得会打满三局，银河战舰险胜。",
            likes: 128,
            comments: 45,
            publishTime: "2024-04-08 20:30",
            category: "赛事讨论",
            isHot: true
        },
        {
            id: 2,
            title: "找队友！CSGO挑战赛缺一个步枪位",
            author: "FPS爱好者",
            authorAvatar: "user2",
            content: "我们队已经有4个人了，都是双AK以上水平。缺一个稳定的步枪位，要求：\n1. 有一定比赛经验\n2. 每周能参加2-3次训练\n3. 服从指挥，心态好\n\n有意的评论区留言或者私信我。",
            likes: 32,
            comments: 18,
            publishTime: "2024-04-07 15:20",
            category: "招募组队",
            isHot: false
        },
        {
            id: 3,
            title: "恭喜刺客联盟全胜晋级决赛！",
            author: "小迷妹",
            authorAvatar: "user3",
            content: "刺客联盟太帅了！小组赛全胜战绩晋级决赛，宋刺客的镜简直无敌，每把都carry。决赛一定要加油啊！冠军属于你们！",
            likes: 256,
            comments: 67,
            publishTime: "2024-04-06 22:10",
            category: "选手应援",
            isHot: true
        },
        {
            id: 4,
            title: "求教：英雄联盟新手怎么快速上手？",
            author: "萌新玩家",
            authorAvatar: "user4",
            content: "最近才开始玩英雄联盟，感觉好难啊，英雄太多了记不住。有没有大佬能分享一下新手入门的经验？推荐几个容易上手的英雄吧。",
            likes: 45,
            comments: 23,
            publishTime: "2024-04-05 12:00",
            category: "游戏交流",
            isHot: false
        },
        {
            id: 5,
            title: "线下观赛体验太棒了！",
            author: "现场观众",
            authorAvatar: "user5",
            content: "昨天去现场看了小组赛，氛围真的好！大屏幕加解说，比自己在宿舍看爽多了。半决赛还要去，有没有一起的？",
            likes: 89,
            comments: 31,
            publishTime: "2024-04-04 10:30",
            category: "赛事讨论",
            isHot: false
        }
    ],

    paymentRecords: [
        {
            id: 1,
            teamId: 1,
            teamName: "银河战舰",
            tournamentId: 1,
            tournamentName: "2024春季校园电竞联赛",
            amount: 250,
            payTime: "2024-03-10 15:30",
            payMethod: "微信支付",
            orderNo: "ES20240310001",
            status: "success"
        },
        {
            id: 2,
            teamId: 2,
            teamName: "雷霆战队",
            tournamentId: 1,
            tournamentName: "2024春季校园电竞联赛",
            amount: 250,
            payTime: "2024-03-11 09:20",
            payMethod: "支付宝",
            orderNo: "ES20240311002",
            status: "success"
        },
        {
            id: 3,
            teamId: 4,
            teamName: "烈焰军团",
            tournamentId: 1,
            tournamentName: "2024春季校园电竞联赛",
            amount: 250,
            payTime: "2024-03-13 18:45",
            payMethod: "微信支付",
            orderNo: "ES20240313004",
            status: "success"
        },
        {
            id: 4,
            teamId: 3,
            teamName: "星辰战队",
            tournamentId: 1,
            tournamentName: "2024春季校园电竞联赛",
            amount: 250,
            payTime: null,
            payMethod: null,
            orderNo: "ES20240312003",
            status: "pending"
        },
        {
            id: 5,
            teamId: 5,
            teamName: "刺客联盟",
            tournamentId: 2,
            tournamentName: "王者荣耀新生杯",
            amount: 0,
            payTime: "2024-04-02 10:00",
            payMethod: "免费",
            orderNo: "ES20240402005",
            status: "success"
        }
    ],

    danmakuList: [
        { id: 1, user: "电竞迷弟", content: "666666", time: "00:05:30", status: "approved" },
        { id: 2, user: "路人甲", content: "这波操作太秀了！", time: "00:08:15", status: "approved" },
        { id: 3, user: "啦啦队", content: "雷霆战队加油！", time: "00:10:20", status: "approved" },
        { id: 4, user: "喷子一号", content: "这也太菜了吧", time: "00:12:45", status: "pending" },
        { id: 5, user: "专业解说", content: "这个站位很有讲究", time: "00:15:00", status: "approved" },
        { id: 6, user: "广告号", content: "加微信xxx领皮肤", time: "00:18:30", status: "rejected" },
        { id: 7, user: "星辰粉丝", content: "星辰冲鸭！", time: "00:20:10", status: "approved" }
    ],

    notifications: [
        { id: 1, type: "match", title: "比赛提醒", content: "你关注的比赛「半决赛 银河战舰 vs 烈焰军团」将于明天14:00开始", time: "2024-04-09 09:00", read: false },
        { id: 2, type: "team", title: "入队申请", content: "有3名玩家申请加入你的队伍", time: "2024-04-08 16:30", read: false },
        { id: 3, type: "result", title: "比赛结果", content: "你关注的比赛「小组赛 雷霆战队 vs 星辰战队」已结束，雷霆战队 2-1 获胜", time: "2024-04-07 21:00", read: true },
        { id: 4, type: "announcement", title: "重要公告", content: "2024春季校园电竞联赛半决赛赛程公布", time: "2024-04-05 10:00", read: true },
        { id: 5, type: "refund", title: "申诉结果", content: "你提交的申诉已被驳回，详情请查看裁判面板", time: "2024-03-27 10:00", read: false }
    ],

    gameTypes: [
        { id: "lol", name: "英雄联盟", icon: "🎮", players: 5 },
        { id: "wzry", name: "王者荣耀", icon: "👑", players: 5 },
        { id: "csgo", name: "CS:GO", icon: "🔫", players: 5 },
        { id: "valorant", name: "Valorant", icon: "💥", players: 5 },
        { id: "hs", name: "炉石传说", icon: "🃏", players: 1 },
        { id: "pubg", name: "和平精英", icon: "🎯", players: 4 }
    ]
};

let userCollections = [3, 7];

function getTournamentById(id) {
    return AppData.tournaments.find(t => t.id === id);
}

function getTeamsByTournament(tournamentId) {
    return AppData.teams.filter(t => t.tournamentId === tournamentId);
}

function getMatchesByTournament(tournamentId) {
    return AppData.matches.filter(m => m.tournamentId === tournamentId);
}

function getTeamById(id) {
    return AppData.teams.find(t => t.id === id);
}

function getMatchById(id) {
    return AppData.matches.find(m => m.id === id);
}
