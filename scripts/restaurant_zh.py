# -*- coding: utf-8 -*-
# 中国相关地区（大陆 / 港澳台）餐厅中文名对照。
# 仅收录有把握的知名餐厅；键为数据中 Name 去掉「 (分店后缀)」后的基名。
# 外文名餐厅（如 Da Vittorio、Robuchon）保留原名，不收录。

def base_name(name: str) -> str:
    # 去掉分店括号后缀，如 "Xin Rong Ji (Xinyuan South Road)" -> "Xin Rong Ji"
    i = name.find(" (")
    return name[:i].strip() if i > 0 else name.strip()

RESTAURANT_ZH = {
    # —— 香港 ——
    "Amber": "琥珀",
    "Caprice": "Caprice",
    "Forum": "富临饭店",
    "Sushi Shikon": "志魂",
    "T'ang Court": "唐阁",
    "Ta Vie": "旅",
    "Lung King Heen": "龙景轩",
    "Tin Lung Heen": "天龙轩",
    "Lai Ching Heen": "丽晶轩",
    "Ying Jee Club": "营致会馆",
    "Tate": "Tate 甜",
    "Octavium": "Octavium",
    "L'Envol": "L'Envol 御",
    "Rùn": "润",
    "Arbor": "Arbor",
    "Bo Innovation": "厨魔",
    "Seventh Son": "家全七福",
    "Celebrity Cuisine": "名人坊",
    "Ho Lee Fook": "何李活",
    "Kam's Roast Goose": "甘牌烧鹅",
    "Yat Lok": "一乐烧鹅",
    "Yee Tung Heen": "怡东轩",
    "Man Ho": "万豪金殿",
    "Spring Moon": "嘉麟楼",
    "Duddell's": "都爹利会馆",
    "Fook Lam Moon": "福临门",
    "Summer Palace": "夏宫",
    "Shang Palace": "香宫",
    "The Chairman": "大班楼",

    # —— 澳门 ——
    "Jade Dragon": "誉珑轩",
    "Wing Lei": "永利轩",
    "Wing Lei Palace": "永利宫",
    "The Eight": "8餐厅",
    "Feng Wei Ju": "风味居",
    "Chef Tam's Seasons": "谭卉",
    "The Huaiyang Garden": "淮扬曲苑",
    "Ying": "帝影楼",
    "Zi Yat Heen": "紫逸轩",
    "Golden Flower": "京花轩",
    "Lai Heen": "丽轩",
    "Pearl Dragon": "珀翠",

    # —— 台北 / 台湾 ——
    "Le Palais": "颐宫",
    "Taïrroir": "态芮",
    "Mudan": "牡丹",
    "Yu Kapo": "鮨嘉柏",
    "The Guest House": "请客楼",
    "Golden Formosa": "金蓬莱遵古台菜",
    "Ming Fu": "明福台菜海产",
    "Shoun RyuGin": "祥云龙吟",
    "Impromptu by Paul Lee": "Impromptu by Paul Lee",

    # —— 北京 ——
    "Xin Rong Ji": "新荣记",
    "Chao Shang Chao": "潮上潮",
    "King's Joy": "京兆尹",
    "Jingji": "京季",
    "Shanghai Cuisine": "沪财",
    "Lei Garden": "利苑",
    "Cai Yi Xuan": "采逸轩",
    "Fu Chun Ju": "富春居",
    "Sheng Yong Xing": "晟永兴",
    "Jing": "京",
    "Rong Pao": "荣袍",
    "Zijin Mansion": "紫金阁",
    "Zhiguan Courtyard": "至观小院",
    "Fu Rong Huang": "芙蓉凰",

    # —— 上海 ——
    "Taian Table": "泰安门",
    "Fu He Hui": "福和慧",
    "Canton 8": "喜粤8号",
    "Bao Li Xuan": "宝丽轩",
    "Ji Pin Court": "极品轩",
    "The House of Rong": "荣府宴",
    "Amazing Chinese Cuisine": "华",
    "Tou Zao": "头灶",
    "Yong Yi Ting": "雍颐庭",
    "Imperial Treasure Fine Chinese Cuisine": "御宝轩",
    "Xin Rong Ji Shanghai": "新荣记",

    # —— 成都 ——
    "Yu Zhi Lan": "玉芝兰",
    "Song Yun Ze": "松云泽",
    "Ma's Kitchen": "马旺子",
    "Silver Pot": "银芭",

    # —— 广州 ——
    "Jiang by Chef Fei": "江·由辉师傅主理",
    "Yu Yue Heen": "愉粤轩",
    "Jade River": "碧翠轩",
    "Hongtu Hall": "宏图府",
    "Imperial Treasure Fine Teochew Cuisine": "御宝轩潮州料理",

    # —— 杭州 ——
    "Jie Xiang Lou": "解香楼",
    "Ru Yuan": "如院",

    # —— 其他常见连锁 ——
    "Imperial Treasure": "御宝",
}
