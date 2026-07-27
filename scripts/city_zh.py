# -*- coding: utf-8 -*-
# 城市中文名对照表（覆盖主要城市；未收录的小城镇回退显示当地名）
# 键 = 数据集中的城市原名（Location 第一段）

# 中国相关城市 —— 展示时仅用中文（单一名称）
CHINA_COUNTRIES = {"Chinese Mainland", "Hong Kong SAR China", "Macau", "Taiwan"}

CITY_ZH = {
    # —— 中国大陆 ——
    "Beijing": "北京", "Shanghai": "上海", "Guangzhou": "广州", "Chengdu": "成都",
    "Hangzhou": "杭州", "Nanjing": "南京", "Suzhou": "苏州", "Xiamen": "厦门",
    "Fuzhou": "福州", "Quanzhou": "泉州", "Ningde": "宁德", "Wenzhou": "温州",
    "Yangzhou": "扬州", "Changzhou": "常州", "Taizhou": "台州",
    # —— 中国台湾 ——
    "Taipei": "台北", "New Taipei": "新北", "Taichung": "台中", "Tainan": "台南",
    "Kaohsiung": "高雄", "Hsinchu City": "新竹市", "Hsinchu County": "新竹县",
    # —— 中国港澳 ——
    "Hong Kong": "香港", "Macau": "澳门",

    # —— 日本 ——
    "Tokyo": "东京", "Kyoto": "京都", "Osaka": "大阪", "Nara": "奈良",
    "Nagoya": "名古屋", "Fukuoka": "福冈", "Sapporo": "札幌", "Kobe": "神户",
    "Yokohama": "横滨", "Kanazawa": "金泽", "Hiroshima": "广岛",
    # —— 韩国 ——
    "Seoul": "首尔", "Busan": "釜山",
    # —— 东南亚 ——
    "Bangkok": "曼谷", "Phuket": "普吉", "Singapore": "新加坡", "Kuala Lumpur": "吉隆坡",
    "Ho Chi Minh City": "胡志明市", "Hanoi": "河内",
    "Makati - Metro Manila": "马卡蒂", "Manila": "马尼拉",
    # —— 中东 ——
    "Dubai": "迪拜", "Abu Dhabi": "阿布扎比", "Doha": "多哈",
    "Istanbul": "伊斯坦布尔", "Izmir": "伊兹密尔", "Bodrum": "博德鲁姆",

    # —— 法国 ——
    "Paris": "巴黎", "Lyon": "里昂", "Bordeaux": "波尔多", "Marseille": "马赛",
    "Nice": "尼斯", "Toulouse": "图卢兹", "Nantes": "南特", "Montpellier": "蒙彼利埃",
    "Strasbourg": "斯特拉斯堡", "Reims": "兰斯", "Dijon": "第戎", "Nîmes": "尼姆",
    "Annecy": "阿讷西", "Colmar": "科尔马", "Versailles": "凡尔赛", "Lille": "里尔",
    "Courchevel": "库尔舍维勒", "Megève": "梅杰夫", "Saint-Tropez": "圣特罗佩",
    "Clermont-Ferrand": "克莱蒙费朗", "Valence": "瓦朗斯", "Cannes": "戛纳",
    "Aix-en-Provence": "普罗旺斯艾克斯", "Saint-Emilion": "圣埃米利永",

    # —— 意大利 ——
    "Rome": "罗马", "Milan": "米兰", "Florence": "佛罗伦萨", "Venice": "威尼斯",
    "Turin": "都灵", "Naples": "那不勒斯", "Verona": "维罗纳", "Modena": "摩德纳",
    "Rimini": "里米尼", "Taormina": "陶尔米纳", "Amalfi": "阿马尔菲",
    "Sorrento": "索伦托", "Alba": "阿尔巴", "Bologna": "博洛尼亚", "Genoa": "热那亚",

    # —— 西班牙 ——
    "Madrid": "马德里", "Barcelona": "巴塞罗那", "Valencia": "瓦伦西亚",
    "Bilbao": "毕尔巴鄂", "Marbella": "马贝拉", "Malaga": "马拉加",
    "Donostia / San Sebastián": "圣塞瓦斯蒂安", "Jaén": "哈恩", "Córdoba": "科尔多瓦",
    "Girona": "赫罗纳", "Pamplona": "潘普洛纳", "Palma": "帕尔马",
    "Santiago de Compostela": "圣地亚哥-德孔波斯特拉", "Seville": "塞维利亚",

    # —— 德国 ——
    "Berlin": "柏林", "Munich": "慕尼黑", "Hamburg": "汉堡", "Cologne": "科隆",
    "Frankfurt on the Main": "法兰克福", "Stuttgart": "斯图加特", "Düsseldorf": "杜塞尔多夫",
    "Nuremberg": "纽伦堡", "Essen": "埃森", "Hanover": "汉诺威", "Leipzig": "莱比锡",
    "Dresden": "德累斯顿", "Bonn": "波恩", "Mannheim": "曼海姆", "Augsburg": "奥格斯堡",
    "Freiburg im Breisgau": "弗莱堡", "Koblenz": "科布伦茨", "Münster": "明斯特",
    "Regensburg": "雷根斯堡",

    # —— 英国 / 爱尔兰 ——
    "London": "伦敦", "Edinburgh": "爱丁堡", "Birmingham": "伯明翰", "Leith": "利斯",
    "Manchester": "曼彻斯特", "Bristol": "布里斯托尔", "Oxford": "牛津",
    "Dublin City": "都柏林", "Dublin": "都柏林",

    # —— 荷兰 / 比利时 / 卢森堡 ——
    "Amsterdam": "阿姆斯特丹", "Rotterdam": "鹿特丹", "Maastricht": "马斯特里赫特",
    "Zwolle": "兹沃勒", "Harderwijk": "哈尔德韦克", "Brussels": "布鲁塞尔",
    "Antwerpen": "安特卫普", "Gent": "根特", "Knokke": "克诺克", "Luxembourg": "卢森堡",

    # —— 瑞士 / 奥地利 ——
    "Zurich": "苏黎世", "Geneva": "日内瓦", "Basel": "巴塞尔", "Lucerne": "卢塞恩",
    "Lausanne": "洛桑", "Lugano": "卢加诺", "Bern": "伯尔尼", "Sankt Gallen": "圣加仑",
    "Zermatt": "采尔马特", "Andermatt": "安德马特", "Ascona": "阿斯科纳",
    "Saint Moritz": "圣莫里茨", "Bad Ragaz": "巴德拉加茨",
    "Vienna": "维也纳", "Salzburg": "萨尔茨堡", "Graz": "格拉茨", "Linz": "林茨",
    "Lech am Arlberg": "莱赫",

    # —— 北欧 ——
    "Copenhagen": "哥本哈根", "Aarhus": "奥胡斯", "Stockholm": "斯德哥尔摩",
    "Gothenburg": "哥德堡", "Oslo": "奥斯陆", "Bergen": "卑尔根", "Stavanger": "斯塔万格",
    "Helsinki": "赫尔辛基",
    # —— 其他欧洲 ——
    "Lisbon": "里斯本", "Porto": "波尔图", "Funchal": "丰沙尔", "Athens": "雅典",
    "Budapest": "布达佩斯", "Prague": "布拉格", "Warsaw": "华沙", "Vilnius": "维尔纽斯",
    "Tallinn": "塔林", "Valletta": "瓦莱塔", "Monaco": "摩纳哥",

    # —— 北美 ——
    "New York": "纽约", "Brooklyn": "布鲁克林", "San Francisco": "旧金山",
    "Los Angeles": "洛杉矶", "Chicago": "芝加哥", "Washington": "华盛顿",
    "Miami": "迈阿密", "Houston": "休斯顿", "Denver": "丹佛", "Atlanta": "亚特兰大",
    "Austin": "奥斯汀", "Orlando": "奥兰多", "Tampa": "坦帕", "Nashville": "纳什维尔",
    "New Orleans": "新奥尔良", "Philadelphia": "费城", "San Antonio": "圣安东尼奥",
    "San Diego": "圣地亚哥", "Santa Monica": "圣莫尼卡", "Charleston": "查尔斯顿",
    "Las Vegas": "拉斯维加斯", "Boston": "波士顿", "Seattle": "西雅图",
    "Toronto": "多伦多", "Vancouver": "温哥华", "Montréal": "蒙特利尔", "Québec": "魁北克",

    # —— 拉美 ——
    "São Paulo": "圣保罗", "Rio de Janeiro": "里约热内卢", "Buenos Aires": "布宜诺斯艾利斯",
    "Mendoza": "门多萨", "Playa del Carmen": "卡门海滩", "Valle de Guadalupe": "瓜达卢佩谷",

    # —— 大洋洲 ——
    "Auckland": "奥克兰", "Wellington": "惠灵顿", "Queenstown": "皇后镇",
    "Christchurch": "基督城", "Waiheke Island": "怀赫科岛",

    # —— 扩充：更多城市 ——
    # 法国
    "Beaune": "博讷", "Biarritz": "比亚里茨", "Metz": "梅斯", "Rennes": "雷恩",
    "Antibes": "昂蒂布", "Deauville": "多维尔", "Cognac": "干邑", "Vannes": "瓦讷",
    "Obernai": "奥贝尔奈", "Kaysersberg": "凯泽斯贝尔", "Èze": "埃兹", "Blois": "布卢瓦",
    "Béziers": "贝济耶", "Tournus": "图尔尼", "Grasse": "格拉斯", "Avignon": "阿维尼翁",
    "Rouen": "鲁昂", "Cassis": "卡西斯", "Chamonix": "夏蒙尼", "Perpignan": "佩皮尼昂",
    "La Ciotat": "拉锡奥塔", "Saint-Rémy-de-Provence": "圣雷米-德普罗旺斯",
    "Les Baux-de-Provence": "莱博-德普罗旺斯", "Cabourg": "卡布尔",
    # 意大利
    "Bergamo": "贝加莫", "Catania": "卡塔尼亚", "Merano": "梅拉诺", "Sirmione": "西尔米奥内",
    "Ravello": "拉韦洛", "Positano": "波西塔诺", "Ragusa": "拉古萨", "Trani": "特拉尼",
    "Montalcino": "蒙塔尔奇诺", "Cortina d'Ampezzo": "科尔蒂纳丹佩佐", "Aosta": "奥斯塔",
    "Viareggio": "维亚雷焦", "Fiumicino": "菲乌米奇诺", "Paestum": "帕埃斯图姆",
    "Palermo": "巴勒莫", "Bari": "巴里", "Padua": "帕多瓦", "Parma": "帕尔马",
    # 西班牙
    "Salamanca": "萨拉曼卡", "Santander": "桑坦德", "Burgos": "布尔戈斯",
    "Valladolid": "巴利亚多利德", "Murcia": "穆尔西亚", "Vigo": "维戈", "Gijón": "希洪",
    "Logrono": "洛格罗尼奥", "Ourense": "奥伦塞", "Cadiz": "加的斯", "Huesca": "韦斯卡",
    "Cambrils": "坎布里尔斯", "Dénia": "德尼亚", "Calp": "卡尔佩", "Leon": "莱昂",
    "Saragossa": "萨拉戈萨", "Cascais": "卡斯凯什", "Jerez de la Frontera": "赫雷斯",
    "Las Palmas de Gran Canaria": "拉斯帕尔马斯", "Adeje": "阿德赫", "Granada": "格拉纳达",
    "Salou": "萨洛", "Eivissa": "伊维萨", "Xàbia": "哈维亚",
    # 德国 / 奥地利 / 瑞士
    "Aachen": "亚琛", "Mainz": "美因茨", "Würzburg": "维尔茨堡", "Ulm": "乌尔姆",
    "Baden-Baden": "巴登-巴登", "Saarbrücken": "萨尔布吕肯", "Osnabrück": "奥斯纳布吕克",
    "Lindau": "林道", "Wernigerode": "韦尼格罗德", "Deidesheim": "戴德斯海姆",
    "Bergisch Gladbach": "贝吉施格拉德巴赫", "Ischgl": "伊施格尔",
    "Sankt Anton am Arlberg": "圣安东", "Grindelwald": "格林德瓦",
    "Crans-Montana": "克兰-蒙塔纳", "Fribourg": "弗里堡", "Berne": "伯尔尼",
    "Kitzbühel": "基茨比厄尔", "Innsbruck": "因斯布鲁克",
    # 英国 / 爱尔兰
    "Cambridge": "剑桥", "Nottingham": "诺丁汉", "Glasgow City": "格拉斯哥",
    "Belfast": "贝尔法斯特", "Newcastle Upon Tyne": "纽卡斯尔", "City of Bristol": "布里斯托尔",
    "Cheltenham": "切尔滕纳姆", "Marlow": "马洛", "Bray": "布雷", "Galway": "戈尔韦",
    "Cartmel": "卡特梅尔", "York": "约克", "Bath": "巴斯", "Cork": "科克",
    # 比利时 / 荷兰
    "Brugge": "布鲁日", "Leuven": "鲁汶", "Liège": "列日", "Hasselt": "哈瑟尔特",
    "Genk": "亨克", "Utrecht": "乌得勒支", "Eindhoven": "埃因霍温", "Haarlem": "哈勒姆",
    "Ixelles": "伊克塞尔", "Tongeren": "通厄伦", "The Hague": "海牙",
    # 北欧 / 其他欧洲
    "Reykjavík": "雷克雅未克", "Trondheim": "特隆赫姆", "Aalborg": "奥尔堡",
    "Riga": "里加", "Zagreb": "萨格勒布", "Rovinj": "罗维尼", "Wrocław": "弗罗茨瓦夫",
    "Sliema": "斯利马", "Sintra": "辛特拉", "Vila Nova de Gaia": "新城区",
    # 北美
    "Dallas": "达拉斯", "Oakland": "奥克兰", "Sacramento": "萨克拉门托",
    "Beverly Hills": "比佛利山", "Miami Beach": "迈阿密海滩", "San Antonio": "圣安东尼奥",
    "Carmel-by-the-Sea": "卡梅尔", "Paso Robles": "帕索罗夫尔斯", "Healdsburg": "希尔兹堡",
    "Guadalajara": "瓜达拉哈拉", "Oaxaca": "瓦哈卡", "Mérida": "梅里达",
    "Winter Park": "温特帕克", "Carlsbad": "卡尔斯巴德",
    # 亚洲其他
    "George Town": "乔治市", "Nonthaburi": "暖武里", "Chiang Mai": "清迈",
    "Da Nang": "岘港", "Jeju": "济州", "Gyeonggi": "京畿",
}
