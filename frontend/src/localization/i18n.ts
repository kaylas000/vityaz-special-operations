/**
 * Internationalization (i18n) System
 * Supports: Russian, English, Chinese Simplified
 */

export type LanguageCode = 'ru' | 'en' | 'zh';

interface TranslationDict {
  [key: string]: string | TranslationDict;
}

type DeepPartial<T> = T extends object ? { [P in keyof T]?: DeepPartial<T[P]> } : T;

export class I18nService {
  private currentLanguage: LanguageCode = 'en';
  private translations: Record<LanguageCode, TranslationDict> = {
    en: this.englishTranslations(),
    ru: this.russianTranslations(),
    zh: this.chineseTranslations(),
  };

  constructor() {
    // Try to detect browser language
    this.detectBrowserLanguage();
  }

  /**
   * Get translated string by key
   * Usage: i18n.t('ui.mainMenu.start')
   */
  t(key: string, variables?: Record<string, string | number>): string {
    const keys = key.split('.');
    let value: any = this.translations[this.currentLanguage];

    for (const k of keys) {
      value = value?.[k];
    }

    if (typeof value !== 'string') {
      console.warn(`Translation not found: ${key}`);
      return key;
    }

    // Replace variables
    if (variables) {
      Object.entries(variables).forEach(([varKey, varValue]) => {
        value = value.replace(`{${varKey}}`, String(varValue));
      });
    }

    return value;
  }

  /**
   * Set current language
   */
  setLanguage(lang: LanguageCode): void {
    if (lang in this.translations) {
      this.currentLanguage = lang;
      localStorage.setItem('vityaz-language', lang);
      console.log(`Language changed to: ${lang}`);
    }
  }

  /**
   * Get current language
   */
  getLanguage(): LanguageCode {
    return this.currentLanguage;
  }

  /**
   * Get available languages
   */
  getAvailableLanguages(): Array<{ code: LanguageCode; name: string }> {
    return [
      { code: 'en', name: 'English' },
      { code: 'ru', name: 'Русский' },
      { code: 'zh', name: '中文' },
    ];
  }

  private detectBrowserLanguage(): void {
    const saved = localStorage.getItem('vityaz-language');
    if (saved && saved in this.translations) {
      this.currentLanguage = saved as LanguageCode;
      return;
    }

    const browserLang = navigator.language.split('-')[0];
    if (browserLang in this.translations) {
      this.currentLanguage = browserLang as LanguageCode;
    }
  }

  // ============ ENGLISH TRANSLATIONS ============
  private englishTranslations(): TranslationDict {
    return {
      ui: {
        mainMenu: {
          title: 'VITYAZ: Special Operations',
          start: 'Start Game',
          quickMatch: 'Quick Match',
          ranked: 'Ranked Mode',
          tournaments: 'Tournaments',
          settings: 'Settings',
          exit: 'Exit',
        },
        hud: {
          health: 'Health',
          ammo: 'Ammo',
          score: 'Score',
          kills: 'Kills',
          deaths: 'Deaths',
          ping: 'Ping',
          fps: 'FPS',
          objective: 'Objective',
        },
        buttons: {
          jump: 'Jump',
          crouch: 'Crouch',
          reload: 'Reload',
          ability: 'Ability',
          shoot: 'Fire',
          melee: 'Melee',
          pause: 'Pause',
          resume: 'Resume',
          quit: 'Quit Match',
          confirm: 'Confirm',
          cancel: 'Cancel',
          ok: 'OK',
        },
        settings: {
          graphics: 'Graphics',
          audio: 'Audio',
          gameplay: 'Gameplay',
          controls: 'Controls',
          language: 'Language',
          masterVolume: 'Master Volume',
          musicVolume: 'Music Volume',
          sfxVolume: 'SFX Volume',
          brightness: 'Brightness',
          fov: 'Field of View',
          sensitivity: 'Mouse Sensitivity',
        },
      },
      game: {
        modes: {
          deathmatch: 'Deathmatch',
          teamDeathmatch: 'Team Deathmatch',
          captureFlag: 'Capture the Flag',
          kingOfHill: 'King of the Hill',
          elimination: 'Elimination',
          domination: 'Domination',
        },
        maps: {
          'urban-downtown': 'Downtown Conflict',
          'forest-ambush': 'Forest Ambush',
          'industrial-complex': 'Industrial Complex',
          'desert-stronghold': 'Desert Stronghold',
          'arctic-base': 'Arctic Base',
        },
        messages: {
          roundStart: 'Round started!',
          roundEnd: 'Round ended!',
          gameWon: 'Victory! Your team won!',
          gameLost: 'Defeat! Your team lost!',
          playerKilled: '{killer} killed {victim}',
          youWereKilled: 'You were killed by {killer}',
          killStreak: '{count}-kill streak!',
          objectiveCaptured: 'Objective captured!',
          teamEliminated: 'Enemy team eliminated!',
        },
      },
      tournament: {
        title: 'Tournaments',
        register: 'Register',
        brackets: 'Brackets',
        standings: 'Standings',
        schedule: 'Schedule',
        prizePool: 'Prize Pool: {amount}',
        participants: '{count} Participants',
        status: {
          registration: 'Registration Open',
          running: 'Tournament Running',
          completed: 'Tournament Completed',
        },
      },
      errors: {
        connectionLost: 'Connection lost',
        invalidUsername: 'Invalid username',
        roomFull: 'Room is full',
        serverError: 'Server error occurred',
        timeout: 'Operation timed out',
      },
    };
  }

  // ============ RUSSIAN TRANSLATIONS ============
  private russianTranslations(): TranslationDict {
    return {
      ui: {
        mainMenu: {
          title: 'ВІТЯЗ: Спеціальні операції',
          start: 'Почати гру',
          quickMatch: 'Швидкий матч',
          ranked: 'Рейтинговий режим',
          tournaments: 'Турніри',
          settings: 'Налаштування',
          exit: 'Вихід',
        },
        hud: {
          health: 'Здоров\'я',
          ammo: 'Боєприпаси',
          score: 'Очки',
          kills: 'Вбивства',
          deaths: 'Смерті',
          ping: 'Пінг',
          fps: 'FPS',
          objective: 'Завдання',
        },
        buttons: {
          jump: 'Прыжок',
          crouch: 'Присідання',
          reload: 'Перезарядка',
          ability: 'Здібність',
          shoot: 'Вогонь',
          melee: 'Рукопашна',
          pause: 'Пауза',
          resume: 'Продовжити',
          quit: 'Вийти з матчу',
          confirm: 'Підтвердити',
          cancel: 'Скасувати',
          ok: 'ОК',
        },
        settings: {
          graphics: 'Графіка',
          audio: 'Звук',
          gameplay: 'Ігровий процес',
          controls: 'Керування',
          language: 'Мова',
          masterVolume: 'Головна гучність',
          musicVolume: 'Гучність музики',
          sfxVolume: 'Гучність ефектів',
          brightness: 'Яскравість',
          fov: 'Поле зору',
          sensitivity: 'Чутливість миші',
        },
      },
      game: {
        modes: {
          deathmatch: 'Дезматч',
          teamDeathmatch: 'Командний дезматч',
          captureFlag: 'Захоплення прапора',
          kingOfHill: 'Король гори',
          elimination: 'Елімінація',
          domination: 'Домінування',
        },
        maps: {
          'urban-downtown': 'Конфлікт в центрі',
          'forest-ambush': 'Ліс засідки',
          'industrial-complex': 'Індустріальний комплекс',
          'desert-stronghold': 'Пустельна твердиня',
          'arctic-base': 'Арктична база',
        },
        messages: {
          roundStart: 'Раунд розпочався!',
          roundEnd: 'Раунд закінчився!',
          gameWon: 'Перемога! Ваша команда перемогла!',
          gameLost: 'Поразка! Ваша команда програла!',
          playerKilled: '{killer} вбив {victim}',
          youWereKilled: 'Вас вбив {killer}',
          killStreak: 'Серія з {count} убивств!',
          objectiveCaptured: 'Завдання виконано!',
          teamEliminated: 'Ворожа команда знищена!',
        },
      },
      tournament: {
        title: 'Турніри',
        register: 'Зареєструватися',
        brackets: 'Сітка',
        standings: 'Турнірна таблиця',
        schedule: 'Розклад',
        prizePool: 'Фонд призів: {amount}',
        participants: '{count} учасників',
        status: {
          registration: 'Реєстрація відкрита',
          running: 'Турнір проходить',
          completed: 'Турнір завершен',
        },
      },
      errors: {
        connectionLost: 'З\'єднання втрачено',
        invalidUsername: 'Недійсне ім\'я користувача',
        roomFull: 'Кімната заповнена',
        serverError: 'Сталася помилка сервера',
        timeout: 'Час очікування вичерпан',
      },
    };
  }

  // ============ CHINESE TRANSLATIONS ============
  private chineseTranslations(): TranslationDict {
    return {
      ui: {
        mainMenu: {
          title: '维特亚兹：特别行动',
          start: '开始游戏',
          quickMatch: '快速匹配',
          ranked: '排名赛',
          tournaments: '锦标赛',
          settings: '设置',
          exit: '退出',
        },
        hud: {
          health: '生命值',
          ammo: '弹药',
          score: '分数',
          kills: '击杀',
          deaths: '死亡',
          ping: '延迟',
          fps: '帧数',
          objective: '目标',
        },
        buttons: {
          jump: '跳跃',
          crouch: '蹲下',
          reload: '重新装填',
          ability: '技能',
          shoot: '射击',
          melee: '近战',
          pause: '暂停',
          resume: '继续',
          quit: '离开比赛',
          confirm: '确认',
          cancel: '取消',
          ok: '确定',
        },
        settings: {
          graphics: '图形',
          audio: '音频',
          gameplay: '游戏玩法',
          controls: '控制',
          language: '语言',
          masterVolume: '主音量',
          musicVolume: '音乐音量',
          sfxVolume: '音效音量',
          brightness: '亮度',
          fov: '视野',
          sensitivity: '鼠标灵敏度',
        },
      },
      game: {
        modes: {
          deathmatch: '死斗',
          teamDeathmatch: '团队死斗',
          captureFlag: '夺旗',
          kingOfHill: '山之王',
          elimination: '淘汰',
          domination: '统治',
        },
        maps: {
          'urban-downtown': '市中心冲突',
          'forest-ambush': '森林伏击',
          'industrial-complex': '工业综合体',
          'desert-stronghold': '沙漠堡垒',
          'arctic-base': '北极基地',
        },
        messages: {
          roundStart: '回合开始！',
          roundEnd: '回合结束！',
          gameWon: '胜利！你的队伍赢了！',
          gameLost: '失败！你的队伍输了！',
          playerKilled: '{killer} 击杀了 {victim}',
          youWereKilled: '你被 {killer} 击杀',
          killStreak: '{count} 连杀！',
          objectiveCaptured: '目标已占领！',
          teamEliminated: '敌方团队已消灭！',
        },
      },
      tournament: {
        title: '锦标赛',
        register: '注册',
        brackets: '对阵表',
        standings: '排名',
        schedule: '赛程',
        prizePool: '奖池：{amount}',
        participants: '{count} 名参与者',
        status: {
          registration: '注册开放中',
          running: '锦标赛进行中',
          completed: '锦标赛已完成',
        },
      },
      errors: {
        connectionLost: '连接丢失',
        invalidUsername: '用户名无效',
        roomFull: '房间已满',
        serverError: '服务器错误',
        timeout: '操作超时',
      },
    };
  }
}

// Singleton instance
export const i18n = new I18nService();
