#!/usr/bin/env node
/**
 * Generates locale files for 20+ additional languages based on the en.json base.
 * Each language provides overrides for common/nav/header keys + a language label.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'locales');
const enBase = JSON.parse(fs.readFileSync(path.join(localesDir, 'en.json'), 'utf8'));

// Deep clone helper
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// Deep merge: target gets values from source if key exists in target
function deepMerge(target, source) {
  for (const key of Object.keys(source)) {
    if (key in target && typeof target[key] === 'object' && typeof source[key] === 'object') {
      deepMerge(target[key], source[key]);
    } else if (key in target || true) {
      target[key] = source[key];
    }
  }
  return target;
}

// Each language: partial overrides on top of English base
const languages = {
  // Arabic
  ar: {
    _meta: { dir: 'rtl' },
    common: { save: 'حفظ', cancel: 'إلغاء', delete: 'حذف', close: 'إغلاق', add: 'إضافة', search: 'بحث', loading: 'جارٍ التحميل…', retry: 'إعادة المحاولة', or: 'أو', update: 'تحديث', view: 'عرض', invite: 'دعوة', accept: 'قبول', decline: 'رفض', remove: 'إزالة', send: 'إرسال', new: 'جديد', edit: 'تعديل', back: 'رجوع', user: 'مستخدم', yes: 'نعم', no: 'لا' },
    nav: { workflows: 'تدفقات العمل', executions: 'التنفيذات', data: 'البيانات', credentials: 'بيانات الاعتماد', database: 'قاعدة البيانات', settings: 'الإعدادات', help: 'المساعدة', expandMenu: 'توسيع القائمة', collapseMenu: 'طي القائمة' },
    header: { new: 'جديد', newWorkflow: 'تدفق عمل جديد', newCredential: 'اعتماد جديد', newDatabase: 'قاعدة بيانات جديدة', newExpand: 'جديد…' },
    language: { label: 'اللغة', search: 'بحث عن لغة…' },
    auth: { login: { subtitle: 'تسجيل الدخول إلى مساحتك', email: 'البريد الإلكتروني', password: 'كلمة المرور', connect: 'تسجيل الدخول', connecting: 'جارٍ الدخول...', createAccount: 'إنشاء حساب', backToHome: '← العودة للرئيسية', error: 'خطأ في تسجيل الدخول' } },
  },
  // Chinese Simplified
  zh: {
    common: { save: '保存', cancel: '取消', delete: '删除', close: '关闭', add: '添加', search: '搜索', loading: '加载中…', retry: '重试', or: '或', update: '更新', view: '查看', invite: '邀请', accept: '接受', decline: '拒绝', remove: '移除', send: '发送', new: '新建', edit: '编辑', back: '返回', user: '用户', yes: '是', no: '否' },
    nav: { workflows: '工作流', executions: '执行', data: '数据', credentials: '凭据', database: '数据库', settings: '设置', help: '帮助', expandMenu: '展开菜单', collapseMenu: '收起菜单' },
    header: { new: '新建', newWorkflow: '新工作流', newCredential: '新凭据', newDatabase: '新数据库', newExpand: '新建…' },
    language: { label: '语言', search: '搜索语言…' },
    auth: { login: { subtitle: '登录您的工作区', email: '电子邮件', password: '密码', connect: '登录', connecting: '登录中...', createAccount: '创建账户', backToHome: '← 返回首页', error: '登录失败' } },
  },
  // Chinese Traditional
  'zh-TW': {
    common: { save: '儲存', cancel: '取消', delete: '刪除', close: '關閉', add: '新增', search: '搜尋', loading: '載入中…', retry: '重試', or: '或', update: '更新', view: '檢視', invite: '邀請', accept: '接受', decline: '拒絕', remove: '移除', send: '傳送', new: '新建', edit: '編輯', back: '返回', user: '使用者', yes: '是', no: '否' },
    nav: { workflows: '工作流程', executions: '執行', data: '資料', credentials: '憑證', database: '資料庫', settings: '設定', help: '說明', expandMenu: '展開選單', collapseMenu: '收起選單' },
    header: { new: '新建', newWorkflow: '新工作流程', newCredential: '新憑證', newDatabase: '新資料庫', newExpand: '新建…' },
    language: { label: '語言', search: '搜尋語言…' },
    auth: { login: { subtitle: '登入您的工作區', email: '電子郵件', password: '密碼', connect: '登入', connecting: '登入中...', createAccount: '建立帳戶', backToHome: '← 返回首頁', error: '登入失敗' } },
  },
  // Japanese
  ja: {
    common: { save: '保存', cancel: 'キャンセル', delete: '削除', close: '閉じる', add: '追加', search: '検索', loading: '読み込み中…', retry: '再試行', or: 'または', update: '更新', view: '表示', invite: '招待', accept: '承認', decline: '拒否', remove: '削除', send: '送信', new: '新規', edit: '編集', back: '戻る', user: 'ユーザー', yes: 'はい', no: 'いいえ' },
    nav: { workflows: 'ワークフロー', executions: '実行', data: 'データ', credentials: '認証情報', database: 'データベース', settings: '設定', help: 'ヘルプ', expandMenu: 'メニューを展開', collapseMenu: 'メニューを折りたたむ' },
    header: { new: '新規', newWorkflow: '新しいワークフロー', newCredential: '新しい認証情報', newDatabase: '新しいデータベース', newExpand: '新規…' },
    language: { label: '言語', search: '言語を検索…' },
    auth: { login: { subtitle: 'ワークスペースにサインイン', email: 'メール', password: 'パスワード', connect: 'サインイン', connecting: 'サインイン中...', createAccount: 'アカウントを作成', backToHome: '← ホームに戻る', error: 'サインインエラー' } },
  },
  // Korean
  ko: {
    common: { save: '저장', cancel: '취소', delete: '삭제', close: '닫기', add: '추가', search: '검색', loading: '로딩 중…', retry: '재시도', or: '또는', update: '업데이트', view: '보기', invite: '초대', accept: '수락', decline: '거절', remove: '제거', send: '전송', new: '새로', edit: '편집', back: '뒤로', user: '사용자', yes: '예', no: '아니요' },
    nav: { workflows: '워크플로', executions: '실행', data: '데이터', credentials: '자격 증명', database: '데이터베이스', settings: '설정', help: '도움말', expandMenu: '메뉴 펼치기', collapseMenu: '메뉴 접기' },
    header: { new: '새로', newWorkflow: '새 워크플로', newCredential: '새 자격 증명', newDatabase: '새 데이터베이스', newExpand: '새로…' },
    language: { label: '언어', search: '언어 검색…' },
    auth: { login: { subtitle: '워크스페이스에 로그인', email: '이메일', password: '비밀번호', connect: '로그인', connecting: '로그인 중...', createAccount: '계정 만들기', backToHome: '← 홈으로 돌아가기', error: '로그인 오류' } },
  },
  // Russian
  ru: {
    common: { save: 'Сохранить', cancel: 'Отмена', delete: 'Удалить', close: 'Закрыть', add: 'Добавить', search: 'Поиск', loading: 'Загрузка…', retry: 'Повторить', or: 'или', update: 'Обновить', view: 'Просмотр', invite: 'Пригласить', accept: 'Принять', decline: 'Отклонить', remove: 'Удалить', send: 'Отправить', new: 'Новый', edit: 'Изменить', back: 'Назад', user: 'Пользователь', yes: 'Да', no: 'Нет' },
    nav: { workflows: 'Рабочие процессы', executions: 'Выполнения', data: 'Данные', credentials: 'Учётные данные', database: 'База данных', settings: 'Настройки', help: 'Помощь', expandMenu: 'Развернуть меню', collapseMenu: 'Свернуть меню' },
    header: { new: 'Новый', newWorkflow: 'Новый рабочий процесс', newCredential: 'Новые учётные данные', newDatabase: 'Новая база данных', newExpand: 'Новый…' },
    language: { label: 'Язык', search: 'Поиск языка…' },
    auth: { login: { subtitle: 'Войдите в вашу рабочую область', email: 'Эл. почта', password: 'Пароль', connect: 'Войти', connecting: 'Вход...', createAccount: 'Создать аккаунт', backToHome: '← На главную', error: 'Ошибка входа' } },
  },
  // Polish
  pl: {
    common: { save: 'Zapisz', cancel: 'Anuluj', delete: 'Usuń', close: 'Zamknij', add: 'Dodaj', search: 'Szukaj', loading: 'Ładowanie…', retry: 'Ponów', or: 'lub', update: 'Aktualizuj', view: 'Podgląd', invite: 'Zaproś', accept: 'Akceptuj', decline: 'Odrzuć', remove: 'Usuń', send: 'Wyślij', new: 'Nowy', edit: 'Edytuj', back: 'Wstecz', user: 'Użytkownik', yes: 'Tak', no: 'Nie' },
    nav: { workflows: 'Przepływy pracy', executions: 'Wykonania', data: 'Dane', credentials: 'Poświadczenia', database: 'Baza danych', settings: 'Ustawienia', help: 'Pomoc', expandMenu: 'Rozwiń menu', collapseMenu: 'Zwiń menu' },
    header: { new: 'Nowy', newWorkflow: 'Nowy przepływ', newCredential: 'Nowe poświadczenie', newDatabase: 'Nowa baza danych', newExpand: 'Nowy…' },
    language: { label: 'Język', search: 'Szukaj języka…' },
    auth: { login: { subtitle: 'Zaloguj się do swojego obszaru', email: 'E-mail', password: 'Hasło', connect: 'Zaloguj się', connecting: 'Logowanie...', createAccount: 'Utwórz konto', backToHome: '← Wróć do strony głównej', error: 'Błąd logowania' } },
  },
  // Dutch
  nl: {
    common: { save: 'Opslaan', cancel: 'Annuleren', delete: 'Verwijderen', close: 'Sluiten', add: 'Toevoegen', search: 'Zoeken', loading: 'Laden…', retry: 'Opnieuw proberen', or: 'of', update: 'Bijwerken', view: 'Bekijken', invite: 'Uitnodigen', accept: 'Accepteren', decline: 'Weigeren', remove: 'Verwijderen', send: 'Verzenden', new: 'Nieuw', edit: 'Bewerken', back: 'Terug', user: 'Gebruiker', yes: 'Ja', no: 'Nee' },
    nav: { workflows: 'Workflows', executions: 'Uitvoeringen', data: 'Data', credentials: 'Inloggegevens', database: 'Database', settings: 'Instellingen', help: 'Hulp', expandMenu: 'Menu uitvouwen', collapseMenu: 'Menu inklappen' },
    header: { new: 'Nieuw', newWorkflow: 'Nieuwe workflow', newCredential: 'Nieuwe inloggegevens', newDatabase: 'Nieuwe database', newExpand: 'Nieuw…' },
    language: { label: 'Taal', search: 'Taal zoeken…' },
    auth: { login: { subtitle: 'Aanmelden bij uw werkruimte', email: 'E-mail', password: 'Wachtwoord', connect: 'Aanmelden', connecting: 'Aanmelden...', createAccount: 'Account aanmaken', backToHome: '← Terug naar home', error: 'Aanmeldfout' } },
  },
  // Turkish
  tr: {
    common: { save: 'Kaydet', cancel: 'İptal', delete: 'Sil', close: 'Kapat', add: 'Ekle', search: 'Ara', loading: 'Yükleniyor…', retry: 'Yeniden dene', or: 'veya', update: 'Güncelle', view: 'Görüntüle', invite: 'Davet et', accept: 'Kabul et', decline: 'Reddet', remove: 'Kaldır', send: 'Gönder', new: 'Yeni', edit: 'Düzenle', back: 'Geri', user: 'Kullanıcı', yes: 'Evet', no: 'Hayır' },
    nav: { workflows: 'İş akışları', executions: 'Yürütmeler', data: 'Veri', credentials: 'Kimlik bilgileri', database: 'Veritabanı', settings: 'Ayarlar', help: 'Yardım', expandMenu: 'Menüyü genişlet', collapseMenu: 'Menüyü daralt' },
    header: { new: 'Yeni', newWorkflow: 'Yeni iş akışı', newCredential: 'Yeni kimlik bilgisi', newDatabase: 'Yeni veritabanı', newExpand: 'Yeni…' },
    language: { label: 'Dil', search: 'Dil ara…' },
    auth: { login: { subtitle: 'Çalışma alanınıza giriş yapın', email: 'E-posta', password: 'Şifre', connect: 'Giriş yap', connecting: 'Giriş yapılıyor...', createAccount: 'Hesap oluştur', backToHome: '← Ana sayfaya dön', error: 'Giriş hatası' } },
  },
  // Swedish
  sv: {
    common: { save: 'Spara', cancel: 'Avbryt', delete: 'Ta bort', close: 'Stäng', add: 'Lägg till', search: 'Sök', loading: 'Laddar…', retry: 'Försök igen', or: 'eller', update: 'Uppdatera', view: 'Visa', invite: 'Bjud in', accept: 'Acceptera', decline: 'Avböj', remove: 'Ta bort', send: 'Skicka', new: 'Ny', edit: 'Redigera', back: 'Tillbaka', user: 'Användare', yes: 'Ja', no: 'Nej' },
    nav: { workflows: 'Arbetsflöden', executions: 'Körningar', data: 'Data', credentials: 'Autentiseringsuppgifter', database: 'Databas', settings: 'Inställningar', help: 'Hjälp', expandMenu: 'Expandera meny', collapseMenu: 'Dölj meny' },
    header: { new: 'Ny', newWorkflow: 'Nytt arbetsflöde', newCredential: 'Ny autentiseringsuppgift', newDatabase: 'Ny databas', newExpand: 'Ny…' },
    language: { label: 'Språk', search: 'Sök språk…' },
    auth: { login: { subtitle: 'Logga in på din arbetsyta', email: 'E-post', password: 'Lösenord', connect: 'Logga in', connecting: 'Loggar in...', createAccount: 'Skapa konto', backToHome: '← Tillbaka till startsidan', error: 'Inloggningsfel' } },
  },
  // Norwegian
  no: {
    common: { save: 'Lagre', cancel: 'Avbryt', delete: 'Slett', close: 'Lukk', add: 'Legg til', search: 'Søk', loading: 'Laster…', retry: 'Prøv på nytt', or: 'eller', update: 'Oppdater', view: 'Vis', invite: 'Inviter', accept: 'Godta', decline: 'Avslå', remove: 'Fjern', send: 'Send', new: 'Ny', edit: 'Rediger', back: 'Tilbake', user: 'Bruker', yes: 'Ja', no: 'Nei' },
    nav: { workflows: 'Arbeidsflyter', executions: 'Kjøringer', data: 'Data', credentials: 'Legitimasjon', database: 'Database', settings: 'Innstillinger', help: 'Hjelp', expandMenu: 'Utvid meny', collapseMenu: 'Skjul meny' },
    header: { new: 'Ny', newWorkflow: 'Ny arbeidsflyt', newCredential: 'Ny legitimasjon', newDatabase: 'Ny database', newExpand: 'Ny…' },
    language: { label: 'Språk', search: 'Søk etter språk…' },
    auth: { login: { subtitle: 'Logg inn på arbeidsområdet ditt', email: 'E-post', password: 'Passord', connect: 'Logg inn', connecting: 'Logger inn...', createAccount: 'Opprett konto', backToHome: '← Tilbake til hjem', error: 'Påloggingsfeil' } },
  },
  // Danish
  da: {
    common: { save: 'Gem', cancel: 'Annuller', delete: 'Slet', close: 'Luk', add: 'Tilføj', search: 'Søg', loading: 'Indlæser…', retry: 'Prøv igen', or: 'eller', update: 'Opdater', view: 'Vis', invite: 'Inviter', accept: 'Accepter', decline: 'Afvis', remove: 'Fjern', send: 'Send', new: 'Ny', edit: 'Rediger', back: 'Tilbage', user: 'Bruger', yes: 'Ja', no: 'Nej' },
    nav: { workflows: 'Arbejdsflows', executions: 'Kørsler', data: 'Data', credentials: 'Legitimationsoplysninger', database: 'Database', settings: 'Indstillinger', help: 'Hjælp', expandMenu: 'Udvid menu', collapseMenu: 'Skjul menu' },
    header: { new: 'Ny', newWorkflow: 'Nyt arbejdsflow', newCredential: 'Ny legitimation', newDatabase: 'Ny database', newExpand: 'Ny…' },
    language: { label: 'Sprog', search: 'Søg efter sprog…' },
    auth: { login: { subtitle: 'Log ind på dit arbejdsområde', email: 'E-mail', password: 'Adgangskode', connect: 'Log ind', connecting: 'Logger ind...', createAccount: 'Opret konto', backToHome: '← Tilbage til forsiden', error: 'Loginfejl' } },
  },
  // Finnish
  fi: {
    common: { save: 'Tallenna', cancel: 'Peruuta', delete: 'Poista', close: 'Sulje', add: 'Lisää', search: 'Hae', loading: 'Ladataan…', retry: 'Yritä uudelleen', or: 'tai', update: 'Päivitä', view: 'Näytä', invite: 'Kutsu', accept: 'Hyväksy', decline: 'Hylkää', remove: 'Poista', send: 'Lähetä', new: 'Uusi', edit: 'Muokkaa', back: 'Takaisin', user: 'Käyttäjä', yes: 'Kyllä', no: 'Ei' },
    nav: { workflows: 'Työnkulut', executions: 'Suoritukset', data: 'Data', credentials: 'Tunnistetiedot', database: 'Tietokanta', settings: 'Asetukset', help: 'Ohje', expandMenu: 'Laajenna valikko', collapseMenu: 'Pienennä valikko' },
    header: { new: 'Uusi', newWorkflow: 'Uusi työnkulku', newCredential: 'Uusi tunnistetiedot', newDatabase: 'Uusi tietokanta', newExpand: 'Uusi…' },
    language: { label: 'Kieli', search: 'Etsi kieltä…' },
    auth: { login: { subtitle: 'Kirjaudu työtilaan', email: 'Sähköposti', password: 'Salasana', connect: 'Kirjaudu', connecting: 'Kirjaudutaan...', createAccount: 'Luo tili', backToHome: '← Takaisin etusivulle', error: 'Kirjautumisvirhe' } },
  },
  // Czech
  cs: {
    common: { save: 'Uložit', cancel: 'Zrušit', delete: 'Smazat', close: 'Zavřít', add: 'Přidat', search: 'Hledat', loading: 'Načítání…', retry: 'Zkusit znovu', or: 'nebo', update: 'Aktualizovat', view: 'Zobrazit', invite: 'Pozvat', accept: 'Přijmout', decline: 'Odmítnout', remove: 'Odebrat', send: 'Odeslat', new: 'Nový', edit: 'Upravit', back: 'Zpět', user: 'Uživatel', yes: 'Ano', no: 'Ne' },
    nav: { workflows: 'Pracovní postupy', executions: 'Spuštění', data: 'Data', credentials: 'Přihlašovací údaje', database: 'Databáze', settings: 'Nastavení', help: 'Nápověda', expandMenu: 'Rozbalit nabídku', collapseMenu: 'Sbalit nabídku' },
    header: { new: 'Nový', newWorkflow: 'Nový pracovní postup', newCredential: 'Nové přihlašovací údaje', newDatabase: 'Nová databáze', newExpand: 'Nový…' },
    language: { label: 'Jazyk', search: 'Hledat jazyk…' },
    auth: { login: { subtitle: 'Přihlaste se do svého pracovního prostoru', email: 'E-mail', password: 'Heslo', connect: 'Přihlásit se', connecting: 'Přihlašování...', createAccount: 'Vytvořit účet', backToHome: '← Zpět na domovskou stránku', error: 'Chyba přihlášení' } },
  },
  // Romanian
  ro: {
    common: { save: 'Salvați', cancel: 'Anulați', delete: 'Ștergeți', close: 'Închideți', add: 'Adăugați', search: 'Căutați', loading: 'Se încarcă…', retry: 'Încercați din nou', or: 'sau', update: 'Actualizați', view: 'Vizualizați', invite: 'Invitați', accept: 'Acceptați', decline: 'Refuzați', remove: 'Eliminați', send: 'Trimiteți', new: 'Nou', edit: 'Editați', back: 'Înapoi', user: 'Utilizator', yes: 'Da', no: 'Nu' },
    nav: { workflows: 'Fluxuri de lucru', executions: 'Execuții', data: 'Date', credentials: 'Acreditări', database: 'Bază de date', settings: 'Setări', help: 'Ajutor', expandMenu: 'Extinde meniu', collapseMenu: 'Restrânge meniu' },
    header: { new: 'Nou', newWorkflow: 'Flux de lucru nou', newCredential: 'Acreditare nouă', newDatabase: 'Bază de date nouă', newExpand: 'Nou…' },
    language: { label: 'Limbă', search: 'Căutați o limbă…' },
    auth: { login: { subtitle: 'Conectați-vă la spațiul de lucru', email: 'E-mail', password: 'Parolă', connect: 'Conectați-vă', connecting: 'Conectare...', createAccount: 'Creați un cont', backToHome: '← Înapoi la pagina principală', error: 'Eroare la conectare' } },
  },
  // Hungarian
  hu: {
    common: { save: 'Mentés', cancel: 'Mégse', delete: 'Törlés', close: 'Bezárás', add: 'Hozzáadás', search: 'Keresés', loading: 'Betöltés…', retry: 'Újrapróbálás', or: 'vagy', update: 'Frissítés', view: 'Megtekintés', invite: 'Meghívás', accept: 'Elfogadás', decline: 'Elutasítás', remove: 'Eltávolítás', send: 'Küldés', new: 'Új', edit: 'Szerkesztés', back: 'Vissza', user: 'Felhasználó', yes: 'Igen', no: 'Nem' },
    nav: { workflows: 'Munkafolyamatok', executions: 'Futtatások', data: 'Adatok', credentials: 'Hitelesítő adatok', database: 'Adatbázis', settings: 'Beállítások', help: 'Súgó', expandMenu: 'Menü kibontása', collapseMenu: 'Menü összecsukása' },
    header: { new: 'Új', newWorkflow: 'Új munkafolyamat', newCredential: 'Új hitelesítő adat', newDatabase: 'Új adatbázis', newExpand: 'Új…' },
    language: { label: 'Nyelv', search: 'Keresés a nyelvek között…' },
    auth: { login: { subtitle: 'Bejelentkezés a munkaterületre', email: 'E-mail', password: 'Jelszó', connect: 'Bejelentkezés', connecting: 'Bejelentkezés...', createAccount: 'Fiók létrehozása', backToHome: '← Vissza a főoldalra', error: 'Bejelentkezési hiba' } },
  },
  // Greek
  el: {
    common: { save: 'Αποθήκευση', cancel: 'Άκυρο', delete: 'Διαγραφή', close: 'Κλείσιμο', add: 'Προσθήκη', search: 'Αναζήτηση', loading: 'Φόρτωση…', retry: 'Επανάληψη', or: 'ή', update: 'Ενημέρωση', view: 'Προβολή', invite: 'Πρόσκληση', accept: 'Αποδοχή', decline: 'Απόρριψη', remove: 'Αφαίρεση', send: 'Αποστολή', new: 'Νέο', edit: 'Επεξεργασία', back: 'Πίσω', user: 'Χρήστης', yes: 'Ναι', no: 'Όχι' },
    nav: { workflows: 'Ροές εργασίας', executions: 'Εκτελέσεις', data: 'Δεδομένα', credentials: 'Διαπιστευτήρια', database: 'Βάση δεδομένων', settings: 'Ρυθμίσεις', help: 'Βοήθεια', expandMenu: 'Ανάπτυξη μενού', collapseMenu: 'Σύμπτυξη μενού' },
    header: { new: 'Νέο', newWorkflow: 'Νέα ροή εργασίας', newCredential: 'Νέο διαπιστευτήριο', newDatabase: 'Νέα βάση δεδομένων', newExpand: 'Νέο…' },
    language: { label: 'Γλώσσα', search: 'Αναζήτηση γλώσσας…' },
    auth: { login: { subtitle: 'Σύνδεση στον χώρο εργασίας σας', email: 'Email', password: 'Κωδικός', connect: 'Σύνδεση', connecting: 'Σύνδεση...', createAccount: 'Δημιουργία λογαριασμού', backToHome: '← Επιστροφή στην αρχική', error: 'Σφάλμα σύνδεσης' } },
  },
  // Ukrainian
  uk: {
    common: { save: 'Зберегти', cancel: 'Скасувати', delete: 'Видалити', close: 'Закрити', add: 'Додати', search: 'Пошук', loading: 'Завантаження…', retry: 'Повторити', or: 'або', update: 'Оновити', view: 'Перегляд', invite: 'Запросити', accept: 'Прийняти', decline: 'Відхилити', remove: 'Видалити', send: 'Надіслати', new: 'Новий', edit: 'Редагувати', back: 'Назад', user: 'Користувач', yes: 'Так', no: 'Ні' },
    nav: { workflows: 'Робочі процеси', executions: 'Виконання', data: 'Дані', credentials: 'Облікові дані', database: 'База даних', settings: 'Налаштування', help: 'Допомога', expandMenu: 'Розгорнути меню', collapseMenu: 'Згорнути меню' },
    header: { new: 'Новий', newWorkflow: 'Новий робочий процес', newCredential: 'Нові облікові дані', newDatabase: 'Нова база даних', newExpand: 'Новий…' },
    language: { label: 'Мова', search: 'Пошук мови…' },
    auth: { login: { subtitle: 'Увійдіть до вашого робочого простору', email: 'Ел. пошта', password: 'Пароль', connect: 'Увійти', connecting: 'Вхід...', createAccount: 'Створити акаунт', backToHome: '← На головну', error: 'Помилка входу' } },
  },
  // Hindi
  hi: {
    common: { save: 'सहेजें', cancel: 'रद्द करें', delete: 'हटाएं', close: 'बंद करें', add: 'जोड़ें', search: 'खोजें', loading: 'लोड हो रहा है…', retry: 'पुनः प्रयास करें', or: 'या', update: 'अपडेट करें', view: 'देखें', invite: 'आमंत्रित करें', accept: 'स्वीकार करें', decline: 'अस्वीकार करें', remove: 'हटाएं', send: 'भेजें', new: 'नया', edit: 'संपादित करें', back: 'वापस', user: 'उपयोगकर्ता', yes: 'हाँ', no: 'नहीं' },
    nav: { workflows: 'वर्कफ़्लो', executions: 'निष्पादन', data: 'डेटा', credentials: 'क्रेडेंशियल', database: 'डेटाबेस', settings: 'सेटिंग्स', help: 'सहायता', expandMenu: 'मेनू विस्तार करें', collapseMenu: 'मेनू संकुचित करें' },
    header: { new: 'नया', newWorkflow: 'नया वर्कफ़्लो', newCredential: 'नया क्रेडेंशियल', newDatabase: 'नया डेटाबेस', newExpand: 'नया…' },
    language: { label: 'भाषा', search: 'भाषा खोजें…' },
    auth: { login: { subtitle: 'अपने कार्यक्षेत्र में साइन इन करें', email: 'ईमेल', password: 'पासवर्ड', connect: 'साइन इन करें', connecting: 'साइन इन हो रहा है...', createAccount: 'खाता बनाएं', backToHome: '← मुख्य पृष्ठ पर वापस', error: 'साइन इन त्रुटि' } },
  },
  // Indonesian
  id: {
    common: { save: 'Simpan', cancel: 'Batal', delete: 'Hapus', close: 'Tutup', add: 'Tambah', search: 'Cari', loading: 'Memuat…', retry: 'Coba lagi', or: 'atau', update: 'Perbarui', view: 'Lihat', invite: 'Undang', accept: 'Terima', decline: 'Tolak', remove: 'Hapus', send: 'Kirim', new: 'Baru', edit: 'Edit', back: 'Kembali', user: 'Pengguna', yes: 'Ya', no: 'Tidak' },
    nav: { workflows: 'Alur kerja', executions: 'Eksekusi', data: 'Data', credentials: 'Kredensial', database: 'Basis data', settings: 'Pengaturan', help: 'Bantuan', expandMenu: 'Perluas menu', collapseMenu: 'Ciutkan menu' },
    header: { new: 'Baru', newWorkflow: 'Alur kerja baru', newCredential: 'Kredensial baru', newDatabase: 'Basis data baru', newExpand: 'Baru…' },
    language: { label: 'Bahasa', search: 'Cari bahasa…' },
    auth: { login: { subtitle: 'Masuk ke ruang kerja Anda', email: 'Email', password: 'Kata sandi', connect: 'Masuk', connecting: 'Sedang masuk...', createAccount: 'Buat akun', backToHome: '← Kembali ke beranda', error: 'Kesalahan masuk' } },
  },
  // Thai
  th: {
    common: { save: 'บันทึก', cancel: 'ยกเลิก', delete: 'ลบ', close: 'ปิด', add: 'เพิ่ม', search: 'ค้นหา', loading: 'กำลังโหลด…', retry: 'ลองใหม่', or: 'หรือ', update: 'อัปเดต', view: 'ดู', invite: 'เชิญ', accept: 'ยอมรับ', decline: 'ปฏิเสธ', remove: 'ลบ', send: 'ส่ง', new: 'ใหม่', edit: 'แก้ไข', back: 'กลับ', user: 'ผู้ใช้', yes: 'ใช่', no: 'ไม่' },
    nav: { workflows: 'เวิร์กโฟลว์', executions: 'การดำเนินการ', data: 'ข้อมูล', credentials: 'ข้อมูลรับรอง', database: 'ฐานข้อมูล', settings: 'การตั้งค่า', help: 'ความช่วยเหลือ', expandMenu: 'ขยายเมนู', collapseMenu: 'ยุบเมนู' },
    header: { new: 'ใหม่', newWorkflow: 'เวิร์กโฟลว์ใหม่', newCredential: 'ข้อมูลรับรองใหม่', newDatabase: 'ฐานข้อมูลใหม่', newExpand: 'ใหม่…' },
    language: { label: 'ภาษา', search: 'ค้นหาภาษา…' },
    auth: { login: { subtitle: 'เข้าสู่พื้นที่ทำงานของคุณ', email: 'อีเมล', password: 'รหัสผ่าน', connect: 'เข้าสู่ระบบ', connecting: 'กำลังเข้าสู่ระบบ...', createAccount: 'สร้างบัญชี', backToHome: '← กลับหน้าหลัก', error: 'เกิดข้อผิดพลาด' } },
  },
  // Vietnamese
  vi: {
    common: { save: 'Lưu', cancel: 'Hủy', delete: 'Xóa', close: 'Đóng', add: 'Thêm', search: 'Tìm kiếm', loading: 'Đang tải…', retry: 'Thử lại', or: 'hoặc', update: 'Cập nhật', view: 'Xem', invite: 'Mời', accept: 'Chấp nhận', decline: 'Từ chối', remove: 'Xóa', send: 'Gửi', new: 'Mới', edit: 'Chỉnh sửa', back: 'Quay lại', user: 'Người dùng', yes: 'Có', no: 'Không' },
    nav: { workflows: 'Quy trình làm việc', executions: 'Thực thi', data: 'Dữ liệu', credentials: 'Thông tin xác thực', database: 'Cơ sở dữ liệu', settings: 'Cài đặt', help: 'Trợ giúp', expandMenu: 'Mở rộng menu', collapseMenu: 'Thu gọn menu' },
    header: { new: 'Mới', newWorkflow: 'Quy trình mới', newCredential: 'Thông tin xác thực mới', newDatabase: 'Cơ sở dữ liệu mới', newExpand: 'Mới…' },
    language: { label: 'Ngôn ngữ', search: 'Tìm kiếm ngôn ngữ…' },
    auth: { login: { subtitle: 'Đăng nhập vào không gian làm việc', email: 'Email', password: 'Mật khẩu', connect: 'Đăng nhập', connecting: 'Đang đăng nhập...', createAccount: 'Tạo tài khoản', backToHome: '← Quay lại trang chủ', error: 'Lỗi đăng nhập' } },
  },
  // Hebrew
  he: {
    _meta: { dir: 'rtl' },
    common: { save: 'שמור', cancel: 'ביטול', delete: 'מחק', close: 'סגור', add: 'הוסף', search: 'חיפוש', loading: 'טוען…', retry: 'נסה שוב', or: 'או', update: 'עדכן', view: 'הצג', invite: 'הזמן', accept: 'קבל', decline: 'דחה', remove: 'הסר', send: 'שלח', new: 'חדש', edit: 'ערוך', back: 'חזרה', user: 'משתמש', yes: 'כן', no: 'לא' },
    nav: { workflows: 'זרימות עבודה', executions: 'הרצות', data: 'נתונים', credentials: 'אישורים', database: 'מסד נתונים', settings: 'הגדרות', help: 'עזרה', expandMenu: 'הרחב תפריט', collapseMenu: 'כווץ תפריט' },
    header: { new: 'חדש', newWorkflow: 'זרימת עבודה חדשה', newCredential: 'אישור חדש', newDatabase: 'מסד נתונים חדש', newExpand: 'חדש…' },
    language: { label: 'שפה', search: 'חפש שפה…' },
    auth: { login: { subtitle: 'התחבר לסביבת העבודה שלך', email: 'דוא"ל', password: 'סיסמה', connect: 'התחבר', connecting: 'מתחבר...', createAccount: 'צור חשבון', backToHome: '← חזרה לדף הבית', error: 'שגיאת התחברות' } },
  },
};

// Write each language file (merge over English base)
let created = 0;
let skipped = 0;
for (const [code, overrides] of Object.entries(languages)) {
  const filePath = path.join(localesDir, `${code}.json`);
  if (fs.existsSync(filePath)) {
    console.log(`[${code}] Skipped (already exists)`);
    skipped++;
    continue;
  }
  const base = deepClone(enBase);
  deepMerge(base, overrides);
  fs.writeFileSync(filePath, JSON.stringify(base, null, 2), 'utf8');
  console.log(`[${code}] Created`);
  created++;
}
console.log(`\nDone! Created: ${created}, Skipped: ${skipped}`);
