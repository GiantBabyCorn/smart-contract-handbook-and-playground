#!/usr/bin/env python3
"""zh-TW simplified-character lint (plan.md 7 "zh-TW 簡體字 lint" / 8.2 mechanical gates).

Scans every string VALUE in src/i18n/locales/zh-TW/*.json for characters that
belong to the Simplified Chinese script only, and reports file + key + char +
the expected Traditional form.

Detection table
  A curated mapping (~1,350 entries) of common simplified -> traditional
  characters, embedded below. Only characters that are effectively
  simplified-ONLY are included; characters shared by both scripts, or accepted
  Taiwan variants, are deliberately EXCLUDED to avoid false positives:
    台 后 里 面 干 系 才 丑 云 谷 松 制 只 志 斗 几 征 范 余 划 借 据 涂 污
    着 症 霉 晒 栖 朴 伙 仆 佣 于 准 刹 舍 表 占 咸 卜 淀 郁 御 沈 采 洒 凄 腊
  A handful of variant-class characters where the Taiwan standard form differs
  (e.g. 迹->跡, 咏->詠, 韵->韻) ARE included: this is a report tool, and new
  content must use the MOE standard glyphs.
  Note: a few simplified characters merge several traditional ones
  (发->發/髮, 历->歷/曆, 复->復/複, 汇->匯/彙, 钟->鐘/鍾); the suggestion shown
  is the most common target in this corpus's domain — reviewers pick the right
  one from context.

Usage
    python scripts/check_zh_tw_chars.py            # CI gate: exit 1 on findings
    python scripts/check_zh_tw_chars.py --report   # verbose report, always exit 0
    python scripts/check_zh_tw_chars.py --locale-dir src/i18n/locales/zh-CN
        # self-test the table against a Simplified corpus (expect many hits)

Never edits any file. Fixes are made by the locale-content owner.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_LOCALE_DIR = ROOT / "src" / "i18n" / "locales" / "zh-TW"

# ─── Curated simplified -> traditional pairs ────────────────────────────────
# Each string below is a run of concatenated 2-char pairs: <simplified><trad>.
PAIR_GROUPS = [
    # 讠 (言) radical series
    "计計订訂讣訃认認讥譏讦訐讧訌讨討让讓讪訕讫訖训訓议議讯訊记記讲講讳諱讴謳讵詎讶訝讷訥许許"
    "讹訛论論讼訟讽諷设設访訪诀訣证證诂詁诃訶评評诅詛识識诈詐诉訴诊診诋詆诌謅词詞诎詘诏詔译譯"
    "诒詒诓誆诔誄试試诖詿诗詩诘詰诙詼诚誠诛誅话話诞誕诟詬诠詮诡詭询詢诣詣诤諍该該详詳诧詫诨諢"
    "诩詡诫誡诬誣语語诮誚误誤诰誥诱誘诲誨诳誑说說诵誦诶誒请請诸諸诹諏诺諾读讀诼諑诽誹课課诿諉"
    "谀諛谁誰谂諗调調谄諂谅諒谆諄谇誶谈談谊誼谋謀谌諶谍諜谎謊谏諫谐諧谑謔谒謁谓謂谔諤谕諭谗讒"
    "谘諮谙諳谚諺谛諦谜謎谟謨谠讜谡謖谢謝谣謠谤謗谥謚谦謙谧謐谨謹谩謾谪謫谬謬谭譚谮譖谯譙谰讕"
    "谱譜谲譎谳讞谴譴谵譫谶讖",
    # 钅 (金) radical series
    "钉釘针針钊釗钓釣钗釵钙鈣钝鈍钞鈔钟鐘钠鈉钡鋇钢鋼钥鑰钦欽钧鈞钨鎢钩鉤钮鈕钯鈀钰鈺钱錢钳鉗"
    "钴鈷钵缽钺鉞钻鑽钼鉬钽鉭钾鉀钿鈿铀鈾铁鐵铂鉑铃鈴铄鑠铅鉛铆鉚铉鉉铊鉈铋鉍铌鈮铍鈹铎鐸铐銬"
    "铑銠铜銅铝鋁铟銦铠鎧铢銖铣銑铤鋌铨銓铬鉻铭銘铮錚铯銫铰鉸铱銥铲鏟铳銃铵銨银銀铷銣铸鑄铺鋪"
    "铼錸链鏈铿鏗销銷锁鎖锂鋰锄鋤锅鍋锆鋯锇鋨锈鏽锉銼锋鋒锌鋅锐銳锑銻锔鋦锗鍺错錯锚錨锟錕锡錫"
    "锢錮锣鑼锤錘锥錐锦錦锭錠键鍵锯鋸锰錳锲鍥锵鏘锶鍶锷鍔锹鍬锻鍛锾鍰镀鍍镁鎂镂鏤镇鎮镉鎘镊鑷"
    "镍鎳镐鎬镑鎊镒鎰镓鎵镖鏢镗鏜镜鏡镣鐐镭鐳镯鐲镰鐮镶鑲",
    # 纟 (糸) radical series
    "纠糾纡紆红紅纣紂纤纖纥紇约約级級纨紈纪紀纫紉纬緯纭紜纯純纰紕纱紗纲綱纳納纵縱纶綸纷紛纸紙"
    "纹紋纺紡纽紐纾紓线線绀紺练練组組绅紳细細织織终終绉縐绊絆绌絀绍紹绎繹经經绑綁绒絨结結绕繞"
    "绘繪给給绚絢绛絳络絡绝絕绞絞统統绢絹绣繡绥綏继繼绩績绪緒绫綾续續绮綺绯緋绰綽绳繩维維绵綿"
    "绶綬绷繃绸綢综綜绽綻绿綠缀綴缄緘缅緬缆纜缇緹缉緝缎緞缓緩缔締缕縷编編缘緣缚縛缜縝缝縫缠纏"
    "缤繽缨纓缩縮缪繆缭繚缮繕缰韁缴繳",
    # 饣 (食) radical series
    "饥飢饨飩饪飪饫飫饬飭饭飯饮飲饯餞饰飾饱飽饲飼饴飴饵餌饶饒饷餉饺餃饼餅饿餓馁餒馄餛馅餡馆館"
    "馈饋馋饞馏餾馒饅",
    # 门 (門) radical series
    "门門闩閂闪閃闭閉问問闯闖闰閏闲閒闳閎间間闵閔闷悶闸閘闹鬧闺閨闻聞闽閩闾閭阀閥阁閣阂閡阅閱"
    "阈閾阉閹阊閶阍閽阎閻阐闡阑闌阔闊阕闋阖闔阗闐阙闕阚闞",
    # 马 (馬) radical series
    "马馬驭馭驮馱驯馴驰馳驱驅驳駁驴驢驶駛驷駟驸駙驹駒驻駐驼駝驾駕驿驛骁驍骂罵骄驕骅驊骆駱骇駭"
    "骈駢骋騁验驗骏駿骐騏骑騎骗騙骚騷骛騖骝騮骞騫骡騾骤驟骥驥",
    # 鸟 (鳥) radical series
    "鸟鳥鸠鳩鸡雞鸢鳶鸣鳴鸥鷗鸦鴉鸩鴆鸪鴣鸬鸕鸭鴨鸯鴦鸳鴛鸵鴕鸽鴿鸾鸞鸿鴻鹃鵑鹅鵝鹉鵡鹊鵲鹌鵪"
    "鹏鵬鹑鶉鹜鶩鹤鶴鹦鸚鹰鷹",
    # 鱼 (魚) radical series
    "鱼魚鱿魷鲁魯鲍鮑鲜鮮鲤鯉鲨鯊鲫鯽鲸鯨鳃鰓鳄鱷鳍鰭鳖鱉鳞鱗",
    # 贝 (貝) radical series
    "贝貝贞貞负負贡貢财財责責贤賢败敗账賬货貨质質贩販贪貪贫貧贬貶购購贮貯贯貫贰貳贱賤贴貼贵貴"
    "贷貸贸貿费費贺賀贻貽贼賊贾賈贿賄赁賃赂賂资資赅賅赈賑赊賒赋賦赌賭赎贖赏賞赐賜赔賠赖賴赘贅"
    "赚賺赛賽赝贗赞贊赠贈赡贍赢贏赣贛",
    # 车 (車) radical series
    "车車轧軋轨軌轩軒转轉轭軛轮輪软軟轰轟轴軸轶軼轸軫轻輕轼軾载載轿轎辄輒辅輔辆輛辇輦辈輩辉輝"
    "辊輥辍輟辎輜辐輻辑輯输輸辕轅辖轄辗輾辘轆辙轍",
    # 页 (頁) radical series
    "页頁顶頂顷頃项項顺順须須顽頑顾顧顿頓颁頒颂頌预預颅顱领領颇頗颈頸颊頰颌頜颐頤频頻颓頹颔頷"
    "颖穎颗顆题題颚顎颜顏额額颠顛颤顫",
    # 风/龙/齿/韦/龟/飞
    "风風飒颯飓颶飘飄飙飆龙龍龚龔龛龕齿齒龄齡龈齦韦韋韧韌韩韓韬韜龟龜飞飛",
    # Common standalone simplifications (A)
    "万萬与與专專业業丛叢东東丝絲丢丟两兩严嚴丧喪个個丰豐临臨为為丽麗举舉义義乌烏乐樂乔喬习習"
    "乡鄉书書买買乱亂亏虧亚亞产產亩畝亲親亵褻亿億仅僅从從仑侖仓倉仪儀们們价價众眾优優会會伞傘"
    "伟偉传傳伤傷伦倫伪偽伫佇体體侄姪侣侶侥僥侦偵侧側侨僑侩儈侪儕侬儂俦儔俨儼俩倆俪儷俭儉债債"
    "倾傾偻僂偿償傥儻傧儐储儲傩儺儿兒兑兌党黨兰蘭关關兴興兹茲养養兽獸内內冈岡册冊写寫军軍农農"
    "冯馮冲沖决決况況冻凍净淨凉涼减減凑湊凛凜凤鳳凭憑凯凱击擊凿鑿刘劉则則刚剛创創删刪别別刽劊"
    "剂劑剑劍剥剝剧劇劝勸办辦务務动動励勵劲勁劳勞势勢勋勳匀勻匮匱区區医醫华華协協单單卖賣卢盧"
    "卤鹵卫衛却卻厂廠厅廳历歷厉厲压壓厌厭厕廁厢廂厦廈厨廚厩廄厮廝县縣参參双雙变變叙敘叠疊号號"
    "叹嘆叽嘰吓嚇吕呂吗嗎吨噸听聽启啟吴吳呕嘔呗唄员員呛嗆呜嗚咏詠咙嚨响響哑啞哗嘩哟喲唤喚啧嘖"
    "啬嗇啮嚙啸嘯喷噴嘘噓嘱囑嚣囂团團园園围圍国國图圖圆圓圣聖场場块塊坚堅坛壇坝壩坞塢坟墳坠墜"
    "垄壟垒壘垦墾垫墊堑塹堕墮墙牆壮壯声聲壳殼壶壺处處备備复復够夠头頭夸誇夹夾夺奪奋奮奖獎奥奧"
    "妆妝妇婦妈媽娇嬌娱娛婴嬰孙孫学學宁寧宝寶实實宠寵审審宪憲宫宮宽寬宾賓寝寢对對寻尋导導寿壽"
    "将將尔爾尘塵尝嘗尴尷屉屜届屆属屬屡屢层層屿嶼岁歲岂豈岖嶇岗崗岚嵐岛島岭嶺峡峽峥崢峦巒崭嶄"
    "嵘嶸巅巔巩鞏币幣帅帥师師帐帳帘簾帜幟带帶帧幀帮幫幂冪并並广廣庄莊庆慶庐廬库庫应應庙廟庞龐"
    "废廢开開异異弃棄张張弥彌弯彎弹彈强強归歸当當录錄彦彥彻徹",
    # Common standalone simplifications (B)
    "忆憶忏懺忧憂怀懷怂慫怅悵怜憐总總恋戀恳懇恶惡恻惻恼惱悦悅悬懸悯憫惊驚惧懼惨慘惩懲惫憊惭慚"
    "惯慣愤憤愿願懒懶戏戲战戰户戶扑撲执執扩擴扫掃扬揚扰擾抚撫抛拋抢搶护護报報担擔拟擬拢攏拣揀"
    "拥擁拦攔拧擰拨撥择擇挂掛挚摯挟挾挠撓挡擋挣掙挤擠挥揮捞撈损損捡撿换換捣搗掷擲掺摻揽攬搁擱"
    "搅攪携攜摄攝摆擺摇搖摊攤撑撐敌敵数數斋齋斩斬断斷无無旧舊时時旷曠昼晝显顯晓曉晕暈暂暫术術"
    "机機杀殺杂雜权權条條来來杨楊极極构構枢樞枣棗枪槍枫楓柜櫃柠檸栅柵标標栈棧栋棟栏欄树樹样樣"
    "档檔桥橋桨槳桩樁梦夢检檢椭橢楼樓榄欖槛檻横橫樱櫻橱櫥欢歡欧歐歼殲残殘殴毆毁毀毕畢毙斃气氣"
    "氢氫汇匯汉漢汤湯汹洶沟溝没沒沥瀝沦淪沧滄沪滬泪淚泻瀉泼潑泽澤洁潔浅淺浆漿浇澆浊濁测測济濟"
    "浏瀏浑渾浓濃涛濤涡渦涤滌润潤涨漲涩澀渊淵渐漸渔漁渗滲温溫湾灣湿濕溃潰溅濺滚滾滞滯满滿滤濾"
    "滥濫滨濱滩灘濒瀕灭滅灯燈灵靈灾災灿燦炉爐炖燉点點炼煉炽熾烁爍烂爛烛燭烟煙烦煩烧燒烫燙热熱"
    "焕煥爱愛爷爺牵牽牺犧状狀犹猶独獨狭狹狮獅狱獄猎獵猪豬猫貓献獻玛瑪环環现現玺璽琐瑣琼瓊瑶瑤"
    "电電画畫畅暢疗療疯瘋痒癢瘫癱瘾癮皱皺盏盞盐鹽监監盖蓋盗盜盘盤睁睜瞒瞞矫矯矿礦码碼砖磚础礎"
    "硕碩确確碍礙碱鹼礼禮祷禱祸禍禄祿禅禪离離秃禿种種积積称稱税稅稳穩穷窮窃竊窜竄窝窩窥窺竖豎"
    "竞競笃篤笋筍笔筆笼籠筑築筛篩筹籌签簽简簡篮籃类類粤粵粮糧紧緊网網罗羅罚罰罢罷翘翹耸聳耻恥"
    "聋聾职職联聯聪聰肃肅肠腸肤膚肾腎肿腫胀脹胁脅胆膽胜勝胶膠脉脈脏臟脑腦脓膿脚腳脱脫脸臉腻膩"
    "腾騰舰艦舱艙艰艱艳豔艺藝节節芦蘆苍蒼苏蘇苹蘋茎莖茧繭荆荊荐薦荡蕩荣榮荫蔭药藥莱萊莲蓮莹瑩"
    "萝蘿萤螢营營萧蕭萨薩葱蔥蒋蔣蓝藍蕴蘊虏虜虑慮虚虛虫蟲虽雖虾蝦蚀蝕蚁蟻蚂螞蚕蠶蛮蠻蜕蛻蜗蝸"
    "蜡蠟蝇蠅蝉蟬衔銜补補衬襯袭襲装裝裤褲见見观觀规規觅覓视視览覽觉覺触觸誉譽誊謄辞辭辩辯辫辮"
    "边邊辽遼达達迁遷过過迈邁运運还還这這进進远遠违違连連迟遲迹跡适適选選逊遜递遞逻邏遗遺遥遙"
    "邓鄧邮郵邻鄰郑鄭酱醬酿釀释釋鉴鑒长長队隊阴陰阳陽阵陣阶階际際陆陸陇隴陈陳陕陝险險随隨隐隱"
    "隶隸难難雏雛雾霧静靜韵韻发發麦麥黄黃齐齊",
]


def build_table() -> dict[str, str]:
    table: dict[str, str] = {}
    for group in PAIR_GROUPS:
        # strip any accidental non-CJK noise defensively
        chars = [c for c in group if ord(c) > 0x2E7F]
        if len(chars) % 2 != 0:
            raise SystemExit(f"internal error: odd pair group length ({len(chars)})")
        for i in range(0, len(chars), 2):
            simp, trad = chars[i], chars[i + 1]
            if simp == trad:
                raise SystemExit(f"internal error: identity pair '{simp}'")
            prev = table.get(simp)
            if prev is not None and prev != trad:
                raise SystemExit(f"internal error: conflicting mapping for '{simp}': {prev} vs {trad}")
            table[simp] = trad
    return table


def walk_strings(obj, prefix: str = ""):
    """Yield (flatKeyPath, stringValue) for every string leaf in a JSON object."""
    if isinstance(obj, dict):
        for k, v in obj.items():
            yield from walk_strings(v, f"{prefix}.{k}" if prefix else k)
    elif isinstance(obj, list):
        for i, v in enumerate(obj):
            yield from walk_strings(v, f"{prefix}[{i}]")
    elif isinstance(obj, str):
        yield prefix, obj


def scan(locale_dir: Path, table: dict[str, str]) -> list[dict]:
    findings: list[dict] = []
    files = sorted(locale_dir.glob("*.json"))
    if not files:
        print(f"error: no *.json files under {locale_dir}", file=sys.stderr)
        sys.exit(2)
    for path in files:
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except json.JSONDecodeError as exc:
            print(f"error: invalid JSON in {path}: {exc}", file=sys.stderr)
            sys.exit(2)
        for key, value in walk_strings(data):
            for idx, ch in enumerate(value):
                if ch in table:
                    snippet = value[max(0, idx - 10) : idx + 11].replace("\n", " ")
                    findings.append(
                        {
                            "file": path.name,
                            "key": key,
                            "char": ch,
                            "suggest": table[ch],
                            "context": snippet,
                        }
                    )
    return findings


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Lint zh-TW locale JSON values for Simplified-Chinese-only characters.",
        epilog=(
            "examples:\n"
            "  python scripts/check_zh_tw_chars.py             # CI gate (exit 1 on findings)\n"
            "  python scripts/check_zh_tw_chars.py --report    # verbose report (always exit 0)\n"
        ),
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument(
        "--report",
        action="store_true",
        help="verbose report with context snippets and per-file summary; always exits 0",
    )
    parser.add_argument(
        "--locale-dir",
        default=str(DEFAULT_LOCALE_DIR),
        metavar="DIR",
        help="directory of *.json to scan (default: src/i18n/locales/zh-TW; "
        "point at zh-CN to self-test the detection table)",
    )
    args = parser.parse_args()

    table = build_table()
    locale_dir = Path(args.locale_dir)
    if not locale_dir.is_absolute():
        locale_dir = ROOT / locale_dir
    findings = scan(locale_dir, table)

    rel = locale_dir.relative_to(ROOT) if locale_dir.is_relative_to(ROOT) else locale_dir
    if not findings:
        print(f"clean: no simplified-only characters in {rel} ({len(table)} chars checked)")
        return 0

    if args.report:
        per_file: dict[str, int] = {}
        for f in findings:
            per_file[f["file"]] = per_file.get(f["file"], 0) + 1
        print(f"{len(findings)} finding(s) in {rel} (table size: {len(table)} chars)\n")
        for f in findings:
            print(f"  {f['file']} :: {f['key']} :: '{f['char']}' -> '{f['suggest']}'  …{f['context']}…")
        print("\nper-file summary:")
        for name, count in sorted(per_file.items()):
            print(f"  {name}: {count}")
        return 0

    for f in findings:
        print(f"{f['file']} :: {f['key']} :: '{f['char']}' should be '{f['suggest']}'")
    print(f"\nFAIL: {len(findings)} simplified character(s) found in {rel}.")
    return 1


if __name__ == "__main__":
    sys.exit(main())
