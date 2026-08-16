/* ============================================================
   SENTINEL AI — i18n: English · Hausa · Igbo · Yorùbá · Pidgin
   ------------------------------------------------------------
   Dictionary keyed by English source strings. After every
   render, I18N.apply() walks the DOM and translates matching
   text nodes, placeholders and titles. English = no-op.
   ============================================================ */

const I18N = {
  lang: 'en',

  dicts: {
    /* ---------------- HAUSA ---------------- */
    ha: {
      'Dashboard': 'Allon Bayani', 'Link Scanner': 'Binciken Mahaɗi', 'Email Scanner': 'Binciken Imel',
      'SMS Scanner': 'Binciken SMS', 'QR Scanner': 'Binciken QR', 'File Scanner': 'Binciken Fayil',
      'Password Checker': 'Binciken Kalmar Sirri', 'Breach Monitor': 'Sa-ido kan Yoyo', 'Threat Intelligence': 'Bayanan Barazana',
      'Reports': 'Rahotanni', 'Cyber Academy': 'Makarantar Tsaro', 'Community': 'Al’umma', 'AI Assistant': 'Mataimakin AI',
      'Notifications': 'Sanarwa', 'Settings': 'Saituna', 'Profile': 'Bayanin Kai', 'Admin Panel': 'Shafin Gudanarwa',
      'Overview': 'Taƙaice', 'Scanners': 'Na’urorin Bincike', 'Protection': 'Kariya', 'Insights': 'Fahimta', 'Account': 'Asusu',
      'Home': 'Gida', 'Scan': 'Bincika', 'Threats': 'Barazana', 'More': 'Ƙari', 'Alerts': 'Faɗakarwa',
      'Your security command center': 'Cibiyar kula da tsaronka',
      'Quick Scan': 'Bincike Cikin Sauri', 'Security Tips': 'Shawarwarin Tsaro', 'Latest Threat News': 'Sabbin Labaran Barazana',
      'Recent Scans': 'Binciken Kwanan Nan', 'View all': 'Duba duka', 'Threat Categories': 'Nau’o’in Barazana',
      'SECURITY SCORE': 'MAKIN TSARO', 'THREATS DETECTED': 'BARAZANAR DA AKA GANO', 'SCAMS BLOCKED': 'ZAMBA DA AKA TOSHE', 'RISK LEVEL': 'MATAKIN HAɗARI',
      'Scan URL': 'Bincika URL', 'Analyze Email': 'Nazarci Imel', 'Detect Scam': 'Gano Zamba', 'Check Exposure': 'Duba Yoyo',
      'Sign In': 'Shiga', 'Create Account': 'Buɗe Asusu', 'Sign Out': 'Fita', 'Save Changes': 'Ajiye Canje-canje',
      'Welcome back': 'Barka da dawowa', 'Email address': 'Adireshin imel', 'Password': 'Kalmar sirri', 'Full name': 'Cikakken suna',
      'Remember me': 'Ka tuna da ni', 'Forgot password?': 'Ka manta kalmar sirri?',
      'Safe': 'Lafiya', 'Suspicious': 'Mai Shakku', 'Dangerous': 'Mai Haɗari',
      'Threat Type': 'Nau’in Barazana', 'Explanation': 'Bayani', 'Recommendation': 'Shawara',
      'Mark all read': 'Alamta duka an karanta', 'Change': 'Canza', 'Theme': 'Yanayin Launi', 'Language': 'Harshe',
      'New Post': 'Sabon Rubutu', 'Search community…': 'Nemo a cikin al’umma…', 'Comments': 'Sharhi',
      'Lessons': 'Darussa', 'Start Course': 'Fara Darasi', 'Continue Course': 'Ci gaba da Darasi', 'Final Quiz': 'Jarrabawar Ƙarshe',
      'Progress': 'Ci gaba', 'Certificate': 'Takardar Shaida', 'Scan History': 'Tarihin Bincike', 'Generated Reports': 'Rahotannin Da Aka ƙirƙira',
      'Generate Report': 'ƙirƙiri Rahoto', 'Generate': 'ƙirƙira', 'Filter': 'Tace', 'Blocked Today': 'An Toshe Yau',
      'Scans Today': 'Bincike Yau', 'States Active': 'Jihohi Masu Aiki', 'Live Threat Map — Nigeria': 'Taswirar Barazana — Najeriya',
      'Ask a security question…': 'Yi tambayar tsaro…', 'New Chat': 'Sabuwar Hira', 'History': 'Tarihi',
      'Got it': 'Na gane', "Don't show again": 'Kada a sake nunawa',
    },

    /* ---------------- IGBO ---------------- */
    ig: {
      'Dashboard': 'Ebe Nchịkọta', 'Link Scanner': 'Nyocha Njikọ', 'Email Scanner': 'Nyocha Ozi-e',
      'SMS Scanner': 'Nyocha SMS', 'QR Scanner': 'Nyocha QR', 'File Scanner': 'Nyocha Faịlụ',
      'Password Checker': 'Nyocha Okwuntughe', 'Breach Monitor': 'Nleba Anya Ntọhapụ', 'Threat Intelligence': 'Ozi Iyi Egwu',
      'Reports': 'Akụkọ', 'Cyber Academy': 'Ụlọ Akwụkwọ Cyber', 'Community': 'Obodo', 'AI Assistant': 'Onye Inyeaka AI',
      'Notifications': 'Ọkwa', 'Settings': 'Ntọala', 'Profile': 'Profaịlụ', 'Admin Panel': 'Ebe Nchịkwa',
      'Overview': 'Nchịkọta', 'Scanners': 'Ngwa Nyocha', 'Protection': 'Nchebe', 'Insights': 'Nghọta', 'Account': 'Akaụntụ',
      'Home': 'Ụlọ', 'Scan': 'Nyochaa', 'Threats': 'Iyi Egwu', 'More': 'Ọzọ', 'Alerts': 'Ọkwa',
      'Your security command center': 'Ebe njikwa nchekwa gị',
      'Quick Scan': 'Nyocha Ngwa Ngwa', 'Security Tips': 'Ndụmọdụ Nchekwa', 'Latest Threat News': 'Akụkọ Iyi Egwu Ọhụrụ',
      'Recent Scans': 'Nyocha Nso Nso a', 'View all': 'Lee ha niile', 'Threat Categories': 'Ụdị Iyi Egwu',
      'SECURITY SCORE': 'AKARA NCHEKWA', 'THREATS DETECTED': 'IYI EGWU ACHỌPỤTARA', 'SCAMS BLOCKED': 'AGHỤGHỌ EGBOCHIRI', 'RISK LEVEL': 'ỌKWA IHE IZE NDỤ',
      'Scan URL': 'Nyochaa URL', 'Analyze Email': 'Nyochaa Ozi-e', 'Detect Scam': 'Chọpụta Aghụghọ', 'Check Exposure': 'Lelee Ntọhapụ',
      'Sign In': 'Banye', 'Create Account': 'Mepụta Akaụntụ', 'Sign Out': 'Pụọ', 'Save Changes': 'Chekwaa Mgbanwe',
      'Welcome back': 'Nnọọ ọzọ', 'Email address': 'Adreesị ozi-e', 'Password': 'Okwuntughe', 'Full name': 'Aha zuru ezu',
      'Remember me': 'Cheta m', 'Forgot password?': 'Chefuru okwuntughe?',
      'Safe': 'Dị Mma', 'Suspicious': 'Na-enyo Enyo', 'Dangerous': 'Dị Ize Ndụ',
      'Threat Type': 'Ụdị Iyi Egwu', 'Explanation': 'Nkọwa', 'Recommendation': 'Ndụmọdụ',
      'Mark all read': 'Kaa ha niile agụọla', 'Change': 'Gbanwee', 'Theme': 'Ụcha', 'Language': 'Asụsụ',
      'New Post': 'Edemede Ọhụrụ', 'Search community…': 'Chọọ n’obodo…', 'Comments': 'Nkwuputa',
      'Lessons': 'Ihe Ọmụmụ', 'Start Course': 'Bido Ọmụmụ', 'Continue Course': 'Gaa n’ihu n’Ọmụmụ', 'Final Quiz': 'Ajụjụ Ikpeazụ',
      'Progress': 'Ọganihu', 'Certificate': 'Asambodo', 'Scan History': 'Akụkọ Nyocha', 'Generated Reports': 'Akụkọ Emepụtara',
      'Generate Report': 'Mepụta Akụkọ', 'Generate': 'Mepụta', 'Filter': 'Nzacha', 'Blocked Today': 'Egbochiri Taa',
      'Scans Today': 'Nyocha Taa', 'States Active': 'Steeti Na-arụ Ọrụ', 'Live Threat Map — Nigeria': 'Maapụ Iyi Egwu — Naịjirịa',
      'Ask a security question…': 'Jụọ ajụjụ nchekwa…', 'New Chat': 'Mkparịta Ụka Ọhụrụ', 'History': 'Akụkọ',
      'Got it': 'Aghọtala m', "Don't show again": 'Egosikwala ọzọ',
    },

    /* ---------------- YORÙBÁ ---------------- */
    yo: {
      'Dashboard': 'Pátákó Ìdarí', 'Link Scanner': 'Àyẹ̀wò Ìjápọ̀', 'Email Scanner': 'Àyẹ̀wò Ímeèlì',
      'SMS Scanner': 'Àyẹ̀wò SMS', 'QR Scanner': 'Àyẹ̀wò QR', 'File Scanner': 'Àyẹ̀wò Fáìlì',
      'Password Checker': 'Àyẹ̀wò Ọ̀rọ̀ìpamọ́', 'Breach Monitor': 'Ìṣọ́ Ìjìlọ Data', 'Threat Intelligence': 'Ìròyìn Ewu',
      'Reports': 'Ìjábọ̀', 'Cyber Academy': 'Ilé Ẹ̀kọ́ Cyber', 'Community': 'Àwùjọ', 'AI Assistant': 'Olùrànlọ́wọ́ AI',
      'Notifications': 'Ìfitónilétí', 'Settings': 'Ètò', 'Profile': 'Àkọsílẹ̀ Ara Ẹni', 'Admin Panel': 'Pátákó Alákòóso',
      'Overview': 'Àkópọ̀', 'Scanners': 'Àwọn Ohun Àyẹ̀wò', 'Protection': 'Ìdáàbòbò', 'Insights': 'Òye', 'Account': 'Àkáǹtì',
      'Home': 'Ilé', 'Scan': 'Ṣàyẹ̀wò', 'Threats': 'Ewu', 'More': 'Síwájú', 'Alerts': 'Ìkìlọ̀',
      'Your security command center': 'Ibùdó ìdarí ààbò rẹ',
      'Quick Scan': 'Àyẹ̀wò Kíákíá', 'Security Tips': 'Ìmọ̀ràn Ààbò', 'Latest Threat News': 'Ìròyìn Ewu Tuntun',
      'Recent Scans': 'Àyẹ̀wò Àìpẹ́', 'View all': 'Wo gbogbo rẹ̀', 'Threat Categories': 'Oríṣi Ewu',
      'SECURITY SCORE': 'ÀMI ÀÀBÒ', 'THREATS DETECTED': 'EWU TÍ A RÍ', 'SCAMS BLOCKED': 'JÌBÌTÌ TÍ A DÍ', 'RISK LEVEL': 'ÌPELE EWU',
      'Scan URL': 'Ṣàyẹ̀wò URL', 'Analyze Email': 'Ṣàyẹ̀wò Ímeèlì', 'Detect Scam': 'Ṣàwárí Jìbìtì', 'Check Exposure': 'Ṣàyẹ̀wò Ìjìlọ',
      'Sign In': 'Wọlé', 'Create Account': 'Ṣí Àkáǹtì', 'Sign Out': 'Jáde', 'Save Changes': 'Fi Àyípadà Pamọ́',
      'Welcome back': 'Káàbọ̀ padà', 'Email address': 'Àdírẹ́sì ímeèlì', 'Password': 'Ọ̀rọ̀ìpamọ́', 'Full name': 'Orúkọ kíkún',
      'Remember me': 'Rántí mi', 'Forgot password?': 'Gbàgbé ọ̀rọ̀ìpamọ́?',
      'Safe': 'Aláìléwu', 'Suspicious': 'Eléèrò', 'Dangerous': 'Léwu',
      'Threat Type': 'Oríṣi Ewu', 'Explanation': 'Àlàyé', 'Recommendation': 'Ìmọ̀ràn',
      'Mark all read': 'Sàmì sí gbogbo rẹ̀', 'Change': 'Yípadà', 'Theme': 'Àwòrán Ìhìn', 'Language': 'Èdè',
      'New Post': 'Ìfìwéránṣẹ́ Tuntun', 'Search community…': 'Wá nínú àwùjọ…', 'Comments': 'Àlàyé Èrò',
      'Lessons': 'Ẹ̀kọ́', 'Start Course': 'Bẹ̀rẹ̀ Ẹ̀kọ́', 'Continue Course': 'Tẹ̀síwájú Ẹ̀kọ́', 'Final Quiz': 'Ìdánwò Ìkẹyìn',
      'Progress': 'Ìtẹ̀síwájú', 'Certificate': 'Ìwé Ẹ̀rí', 'Scan History': 'Ìtàn Àyẹ̀wò', 'Generated Reports': 'Ìjábọ̀ Tí A Ṣe',
      'Generate Report': 'Ṣe Ìjábọ̀', 'Generate': 'Ṣe é', 'Filter': 'Àsẹ́', 'Blocked Today': 'Tí A Dí Lónìí',
      'Scans Today': 'Àyẹ̀wò Lónìí', 'States Active': 'Ìpínlẹ̀ Tó Ń Ṣiṣẹ́', 'Live Threat Map — Nigeria': 'Mápù Ewu — Nàìjíríà',
      'Ask a security question…': 'Béèrè ìbéèrè ààbò…', 'New Chat': 'Ìjíròrò Tuntun', 'History': 'Ìtàn',
      'Got it': 'Ó yé mi', "Don't show again": 'Má fi hàn mọ́',
    },

    /* ---------------- NIGERIAN PIDGIN ---------------- */
    pcm: {
      'Dashboard': 'Main Board', 'Link Scanner': 'Link Checker', 'Email Scanner': 'Email Checker',
      'SMS Scanner': 'SMS Checker', 'QR Scanner': 'QR Checker', 'File Scanner': 'File Checker',
      'Password Checker': 'Password Checker', 'Breach Monitor': 'Data Leak Watcher', 'Threat Intelligence': 'Wahala Tori',
      'Reports': 'Report Dem', 'Cyber Academy': 'Cyber School', 'Community': 'Community', 'AI Assistant': 'AI Padi',
      'Notifications': 'Alert Dem', 'Settings': 'Settings', 'Profile': 'Your Profile', 'Admin Panel': 'Oga Panel',
      'Overview': 'Quick Look', 'Scanners': 'Checker Dem', 'Protection': 'Protection', 'Insights': 'Sabi Corner', 'Account': 'Account',
      'Home': 'Home', 'Scan': 'Check Am', 'Threats': 'Wahala', 'More': 'More', 'Alerts': 'Alert',
      'Your security command center': 'Your security control center',
      'Quick Scan': 'Sharp Sharp Check', 'Security Tips': 'Security Tori', 'Latest Threat News': 'Latest Wahala News',
      'Recent Scans': 'Wetin You Check Recently', 'View all': 'See everything', 'Threat Categories': 'Wahala Type Dem',
      'SECURITY SCORE': 'SECURITY SCORE', 'THREATS DETECTED': 'WAHALA WEY WE SEE', 'SCAMS BLOCKED': 'SCAM WEY WE BLOCK', 'RISK LEVEL': 'RISK LEVEL',
      'Scan URL': 'Check di Link', 'Analyze Email': 'Check di Email', 'Detect Scam': 'Catch di Scam', 'Check Exposure': 'Check Leak',
      'Sign In': 'Enter', 'Create Account': 'Open Account', 'Sign Out': 'Comot', 'Save Changes': 'Save Am',
      'Welcome back': 'Welcome back o', 'Email address': 'Email address', 'Password': 'Password', 'Full name': 'Your full name',
      'Remember me': 'No forget me', 'Forgot password?': 'You forget password?',
      'Safe': 'E Safe', 'Suspicious': 'E Get K-leg', 'Dangerous': 'Serious Wahala',
      'Threat Type': 'Wahala Type', 'Explanation': 'Wetin Happen', 'Recommendation': 'Wetin You Go Do',
      'Mark all read': 'Mark all say I don read', 'Change': 'Change Am', 'Theme': 'Theme', 'Language': 'Language',
      'New Post': 'New Post', 'Search community…': 'Find inside community…', 'Comments': 'Comment Dem',
      'Lessons': 'Lesson Dem', 'Start Course': 'Start di Course', 'Continue Course': 'Continue di Course', 'Final Quiz': 'Final Test',
      'Progress': 'How Far You Don Go', 'Certificate': 'Certificate', 'Scan History': 'Check History', 'Generated Reports': 'Report Wey You Don Make',
      'Generate Report': 'Make Report', 'Generate': 'Make Am', 'Filter': 'Filter', 'Blocked Today': 'Block Today',
      'Scans Today': 'Check Today', 'States Active': 'State Wey Dey Active', 'Live Threat Map — Nigeria': 'Live Wahala Map — Naija',
      'Ask a security question…': 'Ask any security question…', 'New Chat': 'New Chat', 'History': 'History',
      'Got it': 'I don hear', "Don't show again": 'No show me again',
    },
  },

  t(str) {
    if (I18N.lang === 'en') return str;
    const d = I18N.dicts[I18N.lang];
    return (d && d[str]) || str;
  },

  setLang(lang) {
    I18N.lang = I18N.dicts[lang] ? lang : 'en';
  },

  /* Walk the rendered DOM and translate exact-match text nodes + attributes. */
  apply(root) {
    if (I18N.lang === 'en') return;
    const d = I18N.dicts[I18N.lang];
    if (!d) return;
    root = root || document.getElementById('app');
    if (!root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(n) {
        const p = n.parentElement;
        if (!p || ['SCRIPT', 'STYLE', 'TEXTAREA'].includes(p.tagName)) return NodeFilter.FILTER_REJECT;
        return n.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      },
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(n => {
      const raw = n.nodeValue;
      const trimmed = raw.trim();
      if (d[trimmed]) n.nodeValue = raw.replace(trimmed, d[trimmed]);
    });
    root.querySelectorAll('[placeholder]').forEach(el => {
      const v = el.getAttribute('placeholder');
      if (d[v]) el.setAttribute('placeholder', d[v]);
    });
    root.querySelectorAll('[title]').forEach(el => {
      const v = el.getAttribute('title');
      if (d[v]) el.setAttribute('title', d[v]);
    });
  },
};
