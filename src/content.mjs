// All narrative facts: creator's supplied creative archive v3.1, 2026-10-23.
// Stills and timecodes: the supplied 3840×2160 / 24fps master, rechecked locally.
// First-person quotation is verbatim Chinese. English quotations are labelled translations.
// slug: the repository name and the site path. Renaming the repository = change it here (and FILM in the homepage repo).
export const film = {title:'来不及爱你',titleEn:'Too Late to Love You',slug:'too-late-to-love-you',home:'https://qinxujunai.github.io/',duration:57.087};
export const prompt = `A cinematic 10–second video of a beautiful young Asian woman on a moving ferry, wearing a beige trench coat and a thick oversized plaid scarf. Natural sunlight streams through the cabin windows, reflecting off the water outside. The camera starts with a medium shot, showing the melancholic and moody atmosphere of the boat cabin with blurred passengers in the background. The camera slowly pushes in for an extreme, highly detailed close–up of the woman's face. The wind gently blows her messy hair across her face, highlighting her melancholic, deep, and thoughtful eyes. No speaking. In the final seconds, she slowly turns her head to look over her shoulder directly at the camera with a profound gaze. Handheld camera feel, 4k, photorealistic, cinematic lighting, moody color grading, masterpiece.`;
export const chapters = [
  {id:'cabin',start:0,end:9.458333,zh:'蓝色座椅、米色风衣、格子围巾。镜头从中景推近，发丝掠过脸，她最终望向摄影机。',en:'Blue seats, a beige coat, a plaid scarf. The camera moves from a medium shot towards her face. Wind crosses her hair; she looks into the lens.'},
  {id:'rise',start:9.458333,end:13.458333,zh:'画面切回较宽的船舱，她低头、起身、向前移动。',en:'A wider cabin shot: she lowers her head, rises and moves forward.'},
  {id:'deck',start:13.458333,end:17.8,zh:'她已在甲板栏杆旁，海风吹动头发，手伸向风衣内侧。',en:'She is beside the deck railing. Wind moves her hair; her hand reaches inside her coat.'},
  {id:'photo',start:17.8,end:23.041667,zh:'她看着手中的合照，眼里仍有泪，嘴角短暂松动。',en:'She looks at the photograph, her eyes still wet. Her mouth softens for a moment.'},
  {id:'grief',start:23.041667,end:27.833333,zh:'切到更宽的甲板画面，她捂脸哭泣，随后慢慢抬头。',en:'A wider deck shot: she covers her face and cries, then slowly lifts her head.'},
  {id:'keep',start:27.833333,end:32,zh:'她把照片贴近胸前，再收回风衣内袋。没有撕毁，也没有抛向大海。',en:'She brings the photograph to her chest and puts it back inside her coat. She neither tears it nor throws it into the sea.'},
  {id:'breathe',start:32,end:38.5,zh:'她抬起头、闭上眼，迎着风呼吸，脸上仍可见泪痕。',en:'She raises her chin, closes her eyes and breathes into the wind. Tears are still visible.'},
  {id:'sea',start:38.5,end:47.083333,zh:'镜头逐渐拉远，露出人物、船体、舱门、栏杆和海面。',en:'The camera pulls away to reveal her, the ferry, its door and railings, and the sea.'},
  {id:'arrival',start:47.083333,end:57.087,zh:'她走下轮渡，穿过航站区，背对镜头走向明亮的入口，没有回头。',en:'She leaves the ferry, crosses the terminal area and walks towards a bright entrance, her back to the camera. She does not look back.'}
];
// v25 (2026-10-24): one telling, not three. The page used to tell the 57-second film three times (story, scenes,
// making) and spoil the ending before Play; his own reason for making it was missing. Now: the film, why he made
// it (his words, 2026-10-24 message and archive 附录), how it was made (seven shots, plain words), what to take
// away, the tools (Muse, which he named as the generator on 2026-10-24, with his invite code), credits.
// His words: quoted verbatim, fillers cut with「……」. Everything else is plain description, no slogan headings.
export const copy={
zh:{lang:'zh-CN',home:'秦徐俊',language:'English',theme:'切换深色或浅色',skip:'跳到正文',footer:'秦徐俊的作品',
 title:'《来不及爱你》｜秦徐俊导演的 AI 短片',description:'分手以后，她带着两个人唯一的一张合照，一个人乘轮渡，去一座陌生的城市。一部 57 秒、没有台词的 AI 短片，和它是怎么做出来的。',
 coverAlt:'《来不及爱你》：她在船舱里望向镜头，眼里含着泪',kicker:'秦徐俊 导演作品',lede:'分手以后，她带着两个人唯一的一张合照，一个人乘轮渡，去一座陌生的城市。',meta:['2026','57 秒','无对白','AI 短片'],play:'播放',download:'下载影片',
 error:'这个浏览器没能播放影片。可以刷新再试，或下载影片观看。',textVersion:'画面描述（文字版）',
 whyLabel:'为什么拍',whyTitle:'用 AI 作为一种作品|去表达自己想表达的创作，|本身就很有意义。',
 why:[['起点','先有一个镜头，后有故事。','我觉得它做出来感觉比较好的一个镜头，然后我想要去尝试表达一个故事。……从第一个镜头开始，然后再去想故事。'],
  ['片名','先学会爱自己，才来得及爱别人。','最开始可能会爱一个人特别用力，到后来才知道，爱人要先爱己……','片名取自配乐《来不及爱你》。'],
  ['结尾','结尾不给答案，只给她一扇门。','……最后她走开那个门，象征着新的开始，留下空白。']],
 whySigned:'秦徐俊，整理自口述',
 makeLabel:'怎么做出来的',makeTitle:'七段画面，每段生成 10 秒',makeLead:'用 AI 智能体 Muse 生成。没有剧本，故事是从第一个镜头往后长出来的：生成，看，否掉，再生成。剪辑和调色由秦徐俊完成。',
 seg:'第 {n} 段',from:'从 {t} 看',
 promptTitle:'提示词里真正管用的，只有看得见的东西',
 prompt:['整部片子从一条英文提示词开始。它管用的部分是：一个连续镜头，一次推近，一个动作的终点（回头看镜头），会动的交给风和光，没有对白。','没用的部分是一串形容词：cinematic、moody、masterpiece、4k。写了 4k，生成出来是 720p。','后来每一段只写动作。比如第 2 段只写了：她收回目光，一滴泪落下，起身，朝镜头走来，从画面右侧走出去，镜头停在空座位上。'],
 promptOpen:'看原始提示词',archiveLink:'阅读完整制作记录',
 learnLabel:'这部片子用到的影视常识',learnTitle:'当你可以说出|这个问题的时候，|它就可以改好。',
 learnLead:'一些影视基础知识……比如景别、切换、越轴，还有一些常用的镜头语言。',
 inFilm:'在这部片子里',axisCap:'两个机位留在线的同一边，她在两个镜头里都往右走。有一个越过这条线，她在画面里就突然往左走了。',
 axisSvg:{line:'方向线',walk:'她往右走',a:'机位 A',b:'机位 B',seeA:'A 拍到：往右',seeB:'B 拍到：往左'},
 toolsLabel:'工具',toolsTitle:'最大的限制，|是自己的想法',toolsLead:'我制作的习惯，开始会让 Muse 去 Github 分别找星级比较高，认可度好的 Skill，一个是导演的，一个是 Seedance 的，不用了解具体，只用说目的，就是要奥斯卡级别影片制作。',
 codaTitle:'没有任何东西是白费的',coda:['无论是用 Claude 还是 GPT 去做网站，跑一些内容、沟通交流，还是 Muse 这一类智能体，……其实更重要的是长期以来的积累，比如本身的专业能力。','从最开始，一个代码都看不懂，终端命令行都看着非常恐惧。……亦或是遇到的每一个有意思的小伙伴、看过的书、做过的事情，没有任何东西是白费的。'],codaSigned:'秦徐俊，写在影片上线时',
 invite:'邀请码',inviteNote:'注册后 48 小时内，在「设置」里填写这个邀请码，注册的人和秦徐俊各得 10 亿 Muse 词元。',inviteGo:'加入 Muse',repo:'查看项目',
 creditsTitle:'影片资料',credits:[['导演','秦徐俊'],['剪辑与调色','秦徐俊'],['生成','Muse，七段，每段 10 秒'],['音乐','《来不及爱你》'],['时长','57 秒'],['生成素材','1280 × 720 · 24 fps'],['成片导出','3840 × 2160（由 720p 素材放大）']],
 creditsNote:'',
 archiveHeading:'制作全记录',archiveIntro:'七段画面怎样一段段做出来，哪一版被否、为什么。整理自秦徐俊与 AI 协作时的工作记录；他的原话节选收在最后。',backFilm:'返回影片'},
en:{lang:'en',home:'Qin Xujun',language:'中文',theme:'Switch light or dark appearance',skip:'Skip to content',footer:'Work by Qin Xujun',
 title:'《来不及爱你》 | A short film by Qin Xujun',description:'After the breakup, she takes a ferry alone to a city she doesn’t know, carrying the only photograph of the two of them. A 57-second AI short film without dialogue, and how it was made.',
 coverAlt:'来不及爱你: in the ferry cabin she looks into the lens, eyes wet with tears',kicker:'A film by Qin Xujun',lede:'After the breakup, she takes a ferry alone to a city she doesn’t know, carrying the only photograph of the two of them.',meta:['2026','57 sec','No dialogue','AI short'],play:'Play',download:'Download the film',
 error:'This browser couldn’t play the film. Reload and try again, or download the film.',textVersion:'Scene descriptions (text)',
 whyLabel:'Why he made it',whyTitle:'Using AI to make a piece that says what you want to say is worth doing in itself.',
 why:[['The start','A shot came first; the story came after.','There was one shot that turned out well, and I wanted to try telling a story with it. … Start from the first shot, then think about the story.'],
  ['The title','Learn to love yourself first, or it is too late to love anyone.','At first you may love someone with everything you have, and only later learn that to love someone, you first have to love yourself …','The title comes from the song 《来不及爱你》.'],
  ['The ending','The ending gives no answer, only a door.','… in the end she walks out through that door. It stands for a new beginning, and leaves a blank.']],
 whySigned:'Qin Xujun, edited from speech, translated from Chinese',
 makeLabel:'How it was made',makeTitle:'Seven shots, ten seconds generated each',makeLead:'Generated with the AI agent Muse. There was no script: the story grew forward from the first shot, generate, watch, reject, generate again. Qin Xujun edited and graded it.',
 seg:'Shot {n}',from:'Watch from {t}',
 promptTitle:'In a prompt, only what can be seen does any work',
 prompt:['The whole film started from one English prompt. The part that worked: one continuous shot, one push-in, one clear end to the action (she looks back at the lens), wind and light doing the moving, no dialogue.','The part that did nothing was a string of adjectives: cinematic, moody, masterpiece, 4k. It asked for 4k; it came out at 720p.','After that, each shot described only action. Shot 2 said just this: she looks away, a tear falls, she stands, walks towards the camera, leaves the frame on the right, and the camera stays on the empty seat.'],
 promptOpen:'Show the original prompt',archiveLink:'Read the full production record (Chinese)',
 learnLabel:'The film grammar this film uses',learnTitle:'Once you can name the problem, it can be fixed.',
 learnLead:'Some film basics … shot sizes, cuts, crossing the line, and the common language of the camera.',
 inFilm:'In this film',axisCap:'Keep both cameras on the same side of the line and she walks right in both shots. Put one across it and on screen she suddenly walks left.',
 axisSvg:{line:'line of action',walk:'she walks right',a:'Camera A',b:'Camera B',seeA:'A sees: right',seeB:'B sees: left'},
 toolsLabel:'Tools',toolsTitle:'The real limit is one’s own ideas',toolsLead:'My habit is to start by asking Muse to search GitHub for well-starred, widely trusted skills, one for directing and one for Seedance. No need to know the details, only to say the goal: an Oscar-level film.',
 codaTitle:'Nothing is wasted',coda:['Whether it is Claude or GPT building websites, running content and talking things through, or an agent like Muse, … what matters more is what has been built up over a long time, such as real professional skill.','At the start I couldn’t read a line of code, and the terminal scared me. … Every interesting person I met, every book I read, everything I did: none of it was wasted.'],codaSigned:'Qin Xujun, written when the film came out (translated from Chinese)',
 invite:'Invite code',inviteNote:'Enter it under Settings within 48 hours of joining, and the new member and Qin Xujun each get one billion Muse tokens.',inviteGo:'Join Muse',repo:'View project',
 creditsTitle:'Details',credits:[['Director','Qin Xujun'],['Edit & colour','Qin Xujun'],['Generated with','Muse, seven shots of 10 seconds'],['Music','《来不及爱你》'],['Running time','57 seconds'],['Generated at','1280 × 720 · 24 fps'],['Exported at','3840 × 2160 (upscaled from 720p)']],
 creditsNote:'',backFilm:'Back to the film'}
};

// The seven shots, in film order. Facts: src/archive.md §5. Plain words: what went wrong, what fixed it.
export const shots = [
  {n:1,img:'gaze',t:7.5,zh:['船舱，回头看镜头','试了五版','原本是全片的母版，但清晨的冷色和后面的午后日光接不上，她也坐错了一边。试了五种改法，最后拿这一段自己的画面当参考，才对上。'],en:['The cabin: she looks back','Five versions','It was the master shot, but its cold morning tones didn’t match the afternoon light after it, and she sat on the wrong side. Five approaches later, using its own frames as reference fixed it.']},
  {n:2,img:'rise',t:11.2,zh:['船舱，起身离开','改了两次','第一版人物方向反了，光也变灰；第二版哭得太过。第三版把上一段真实的最后一帧当作开头，文字只写动作，才接上。'],en:['The cabin: she gets up','Redone twice','The first version reversed her direction and turned the light grey; the second overplayed the crying. The third started from the previous shot’s real last frame and described only action.']},
  {n:3,img:'deck',t:15,zh:['甲板，走到栏杆边','改了一次','第一版她一走出舱门就不哭了，上一段的眼泪在剪辑点消失。重拍时她出门还在哭，走到栏杆边才擦掉眼泪。'],en:['The deck: to the railing','Redone once','In the first version she stopped crying the moment she stepped out. In the remake she is still crying at the door and only wipes her tears at the railing.']},
  {n:4,img:'photo',t:21.5,zh:['甲板，看照片','改了一次','第一版一开场就是正脸大哭。改成全程侧脸、安静开场：她看着照片，含着泪笑了一下。全片情绪最高的就是这一下。'],en:['The deck: the photograph','Redone once','The first version opened on loud crying, face to camera. Redone in profile and quiet: she looks at the photograph and smiles once through her tears. That is the film’s high point.']},
  {n:5,img:'breathe',t:35.4,zh:['甲板，深呼吸','一次通过','照片贴在胸口，收进内袋，迎着风深呼吸，肩膀松下来。放下靠的是身体，不是表情。'],en:['The deck: one breath','First take','The photograph to her chest, back into the pocket, a deep breath into the wind, shoulders dropping. Letting go is done by the body, not the face.']},
  {n:6,img:'sea',t:44.8,zh:['后拉，见到整片海','改了两次','一开始是航拍大远景，来得太突然。他重新设计成从她脸上一级级往后拉；第二版又笑得太快，第三版接着上一段的泪痕慢慢来。'],en:['Pulling back to the sea','Redone twice','It began as an aerial wide shot that came from nowhere. He redesigned it as a pull-back from her face; the second version smiled too soon, the third carried the tears over and took its time.']},
  {n:7,img:'ending',t:56.4,zh:['下船，走向一扇门','改了两次','码头版人太多太乱；海滨步道版把她的去处说得太清楚。留下的是她走向一扇门，门外是什么，不知道。'],en:['Off the ferry: the door','Redone twice','The pier version was crowded and messy; the seaside walkway said too clearly where she goes. What stayed: she walks towards a door, and we don’t know what lies beyond.']}
];
// v26 (2026-10-24): he said the page didn't show what he values most: knowing film basics such as 越轴, because
// "当你可以说出这个问题的时候，它就可以改好" (his post, docs in src/archive.md). The six rules became named craft ideas,
// each with what happened in this film (src/archive.md §5, §7) and a real frame. 越轴 leads, with a diagram.
// 越轴 definition: his own words from the post, verbatim. "看起来非常假": archive 原话 补充.
export const axis = {t:12.5,
  zh:{term:'越轴',def:'摄影机突然跨过了一条假想的方向线，导致画面中人物的位置或运动方向反过来，让观众产生空间混乱。',
    film:'第 2 段的第一版，从船舱跳到甲板时越轴了，他觉得“看起来非常假”。之后定下一条规矩：她全程从左往右走，右边出画，左边入画。'},
  en:{term:'Crossing the line',def:'The camera suddenly crosses an imaginary line of direction, so a person’s position or movement on screen flips, and the audience loses track of the space.',
    film:'The first take of shot 2 crossed the line when it jumped from the cabin to the deck; to him it “looked really fake”. After that one rule held for the whole film: she always moves left to right, leaving frame on the right and entering on the left.'}};
export const craft = [
  {img:'gaze',pair2:'sea',t:44.8,cap:{zh:'0:07 特写 · 0:44 全景',en:'0:07 close-up · 0:44 full shot'},
   zh:['景别','人在画面里占多大：远景、全景、中景、近景、特写。景别一换，观众和她的距离就变了。','开场从中景推到特写，先让人靠近她；第 6 段反过来，从她脸上一级级往后拉，最后才看到整片海。'],
   en:['Shot size','How much of the frame a person fills: wide, full, medium, close-up, extreme close-up. Change it and you change how close the audience is to her.','The opening pushes from a medium shot to a close-up so you get near her first. Shot 6 does the reverse: it pulls back from her face, step by step, until the whole sea is in view.']},
  {img:'rise',t:11.2,
   zh:['动作衔接','上一个镜头没做完的动作，下一个镜头接着做完。接得上，观众就感觉不到剪辑。','每一段都拿上一段真实的最后一帧当开头，文字只写接下来的动作。再描述一遍长相、衣服、光线，画面就会变样。'],
   en:['Matching action','An action left unfinished in one shot is finished in the next. When it matches, the audience doesn’t notice the cut.','Every shot started from the real last frame of the one before, with text describing only what happens next. Describe the face, clothes or light again and the picture drifts.']},
  {pair:['cut-2-before','cut-2-after'],t:12.5,cap:{zh:'0:13 剪辑点的前一帧和后一帧',en:'The frames either side of the cut at 0:13'},
   zh:['情绪也要接上','衣服要接得上，情绪也是：上一个镜头在哭，下一个镜头开头也得在哭。','第 3 段的第一版就断在这里：她一出舱门就不哭了。定版里，剪辑点两边她都在哭。'],
   en:['Carry the feeling across the cut','Like the costume, the feeling has to match: if she is crying at the end of one shot, she is crying at the start of the next.','The first take of shot 3 broke exactly here: she stopped crying the moment she stepped out. In the final cut she is crying on both sides of the cut.']},
  {img:'cabin',t:6,
   zh:['色调统一','同一部片子，光和颜色要像同一天、同一个地方拍的。','第 1 段生成出来是偏青橙的清晨色调，后面都是午后日光。他在剪映里自己调色，对照三处：她的脸回到偏粉的米白，座椅回到干净的蓝，窗框回到白色。'],
   en:['Consistent colour','One film should look as if it was shot on one day in one place.','Shot 1 came out in teal-and-orange morning tones; everything after is afternoon sun. He graded it himself in CapCut against three checks: her face back to a pinkish beige, the seats back to a clean blue, the window frames back to white.']},
  {img:'photo',t:21.5,
   zh:['道具会说话','画面里每样东西都在讲故事。道具不对，情绪就不对。','她手里的照片，第一版是两位老人的旧照，他说“我觉得这个情绪就不对”。换成一对情侣，故事才成了分手；又改成海边的背影，因为小照片里的脸最容易变形。'],
   en:['Props tell the story','Everything in the frame says something. Get a prop wrong and the feeling is wrong.','The photograph in her hand began as an old picture of two elderly people; to him “the feeling was wrong”. A young couple made it a breakup; then their backs by the sea, because small faces inside a frame distort first.']},
  {img:'breathe',t:35.4,
   zh:['表演的分寸','情绪最满的地方，往往要收着演。','全片情绪最满的一刻，只是含着泪笑了一下（第 4 段）；放下，只是一口深呼吸、肩膀松下来（第 5 段）。'],
   en:['Hold back at the peak','Where the feeling is strongest, play it smallest.','The fullest moment in the film is a single smile through tears (shot 4); letting go is one deep breath and her shoulders dropping (shot 5).']}
];
// Tools. Muse: named by him as the generator (2026-10-24); the invite code and its terms are his, as he sent them.
// The two skills: both MIT licensed (LICENSE files checked 2026-10-24).
export const muse = {name:'Muse',url:'https://muse.ai/join',code:'OE9XK3',
  zh:'这部片子的七段画面都是用 Muse 生成的。它是一个个人 AI 智能体，说话就能用。',
  en:'All seven shots of this film were generated with Muse, a personal AI agent you can simply talk to.'};
export const skills = [
  {name:'DirectorSKILL',url:'https://github.com/wuwangzhang1216/DirectorSKILL',
   zh:'让提示词只写看得见的事：谁、在哪、做什么、镜头怎么动、光从哪来。这部片子开拍前先写好了场景的固定事实：蓝座椅、海在左舷、舱门在左、人物一直从左往右走。',
   en:'Keeps prompts to what can be seen: who, where, doing what, how the camera moves, where the light comes from. Before shooting, this film fixed its set: blue seats, the sea to port, the door on the left, always moving left to right.'},
  {name:'seedance2-skill',url:'https://github.com/dexhunter/seedance2-skill',
   zh:'同时给几张参考图时，让每张只管一件事，动作按秒分段写。这部片子里一张参考定脸，一张定构图。',
   en:'When several reference images go in at once, gives each a single job and splits action into timed beats. Here, one reference fixed the face and one the framing.'}
];
