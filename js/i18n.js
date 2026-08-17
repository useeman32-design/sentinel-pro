/* ============================================================
   SENTINEL AI — i18n: English · Hausa · Igbo · Yorùbá · Pidgin
   ------------------------------------------------------------
   Dictionary keyed by English source strings + a MutationObserver
   that translates ALL dynamically rendered content (scan results,
   modals, lists) the moment it appears. English = no-op.
   Course content is translated server-side by AI (cached in DB).
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
      'AI-powered URL threat analysis': 'Nazarin barazanar URL da AI', 'Phishing & spoofing detection': 'Gano zamba ta imel',
      'Scam pattern detection': 'Gano alamun zamba', 'Decode & verify before you visit': 'Fassara ka tabbatar kafin ziyara',
      'Static malware analysis': 'Nazarin malware', 'Strength, entropy & crack time': 'Ƙarfi da lokacin fasa kalmar sirri',
      'Know when your data leaks': 'Sani lokacin da bayananka suka yoyo', 'Live threat landscape — Nigeria': 'Yanayin barazana kai tsaye — Najeriya',
      'Executive-ready security reporting': 'Rahoton tsaro cikakke', 'Learn. Complete. Get certified.': 'Koya. Kammala. Sami takarda.',
      'Share threats, tips & news': 'Raba barazana, shawarwari da labarai', 'Ask anything about staying safe': 'Tambayi komai game da tsaro',
      'Alerts & activity': 'Faɗakarwa da ayyuka', 'Make Sentinel yours': 'Mayar da Sentinel naka', 'Your account': 'Asusunka',
      'Everything else, one tap away': 'Sauran komai, danna ɗaya kawai',
      'Quick Scan': 'Bincike Cikin Sauri', 'Security Tips': 'Shawarwarin Tsaro', 'Latest Threat News': 'Sabbin Labaran Barazana',
      'Recent Scans': 'Binciken Kwanan Nan', 'View all': 'Duba duka', 'Threat Categories': 'Nau’o’in Barazana',
      'SECURITY SCORE': 'MAKIN TSARO', 'THREATS DETECTED': 'BARAZANAR DA AKA GANO', 'SCAMS BLOCKED': 'ZAMBA DA AKA TOSHE', 'RISK LEVEL': 'MATAKIN HAɗARI',
      'Scan URL': 'Bincika URL', 'Analyze Email': 'Nazarci Imel', 'Detect Scam': 'Gano Zamba', 'Check Exposure': 'Duba Yoyo',
      'Sign In': 'Shiga', 'Create Account': 'Buɗe Asusu', 'Sign Out': 'Fita', 'Save Changes': 'Ajiye Canje-canje',
      'Welcome back': 'Barka da dawowa', 'Email address': 'Adireshin imel', 'Password': 'Kalmar sirri', 'Full name': 'Cikakken suna',
      'Remember me': 'Ka tuna da ni', 'Forgot password?': 'Ka manta kalmar sirri?', 'Create your account': 'Buɗe asusunka',
      'Reset your password': 'Sake saita kalmar sirri', 'Verify your email': 'Tabbatar da imel ɗinka',
      'Send Reset Link': 'Aika Mahaɗin Sakewa', 'Verify Email': 'Tabbatar da Imel', 'Update Password': 'Sabunta Kalmar Sirri',
      'Safe': 'Lafiya', 'Suspicious': 'Mai Shakku', 'Dangerous': 'Mai Haɗari',
      'Threat Type': 'Nau’in Barazana', 'Explanation': 'Bayani', 'Recommendation': 'Shawara', 'Decoded Content': 'Abin da Aka Fassara',
      'Save to Reports': 'Ajiye a Rahotanni', 'Report False Result': 'Rahoto Kuskure', 'AI analysis in progress…': 'Ana nazarin AI…',
      'Mark all read': 'Alamta duka an karanta', 'Change': 'Canza', 'Theme': 'Yanayin Launi', 'Language': 'Harshe', 'Appearance': 'Kamanni',
      'New Post': 'Sabon Rubutu', 'Search community…': 'Nemo a cikin al’umma…', 'Comments': 'Sharhi', 'Add a comment…': 'Rubuta sharhi…',
      'Post to Community': 'Aika zuwa Al’umma', 'Share with the Community': 'Raba wa Al’umma', 'Title': 'Take', 'Category': 'Rukuni', 'Details': 'Bayanai',
      'Lessons': 'Darussa', 'Start Course': 'Fara Darasi', 'Continue Course': 'Ci gaba da Darasi', 'Final Quiz': 'Jarrabawar Ƙarshe',
      'Progress': 'Ci gaba', 'Certificate': 'Takardar Shaida', 'Submit Quiz': 'Mika Jarrabawa', 'Course Complete!': 'An Kammala Darasi!',
      'Download Certificate': 'Sauke Takardar Shaida', 'All Courses': 'Duk Darussa', 'Previous': 'Baya', 'Next →': 'Gaba →',
      'Mark Complete & Continue →': 'Kammala Ka Ci Gaba →', 'Go to Quiz →': 'Je Jarrabawa →', 'Review & Certificate': 'Duba da Takarda',
      'Scan History': 'Tarihin Bincike', 'Generated Reports': 'Rahotannin Da Aka ƙirƙira',
      'Generate Report': 'ƙirƙiri Rahoto', 'Generate': 'ƙirƙira', 'Filter': 'Tace', 'Blocked Today': 'An Toshe Yau',
      'Scans Today': 'Bincike Yau', 'States Active': 'Jihohi Masu Aiki', 'Live Threat Map — Nigeria': 'Taswirar Barazana — Najeriya',
      'Scans Per Day': 'Bincike Kowace Rana', 'Threats Per Day': 'Barazana Kowace Rana', 'Scan Activity (7 days)': 'Ayyukan Bincike (kwana 7)',
      'Type': 'Nau’i', 'Verdict': 'Hukunci', 'From': 'Daga', 'To': 'Zuwa', 'All': 'Duka',
      'Ask a security question…': 'Yi tambayar tsaro…', 'New Chat': 'Sabuwar Hira', 'History': 'Tarihi', 'Chat History': 'Tarihin Hira',
      'Got it': 'Na gane', "Don't show again": 'Kada a sake nunawa', 'No scans yet': 'Babu bincike tukuna', 'No threats yet': 'Babu barazana tukuna',
      'Change Password': 'Canza Kalmar Sirri', 'Current password': 'Kalmar sirri ta yanzu', 'New password': 'Sabuwar kalmar sirri',
      'Confirm new password': 'Tabbatar da sabuwar kalmar sirri', 'Change password': 'Canza kalmar sirri',
      'Company': 'Kamfani', 'Role': 'Matsayi', 'Subscription': 'Biyan Kuɗi', 'Personal Information': 'Bayanan Kanka',
      'Dark': 'Duhu', 'Light': 'Haske', 'Like': 'So', 'Report': 'Rahoto',
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
      'AI-powered URL threat analysis': 'Nyocha iyi egwu URL site na AI', 'Phishing & spoofing detection': 'Nchọpụta aghụghọ ozi-e',
      'Scam pattern detection': 'Nchọpụta ụkpụrụ aghụghọ', 'Decode & verify before you visit': 'Kọwaa ma kwado tupu ị gaa',
      'Static malware analysis': 'Nyocha malware', 'Strength, entropy & crack time': 'Ike na oge mgbawa okwuntughe',
      'Know when your data leaks': 'Mara mgbe data gị tọhapụrụ', 'Live threat landscape — Nigeria': 'Ọnọdụ iyi egwu ozugbo — Naịjirịa',
      'Executive-ready security reporting': 'Akụkọ nchekwa zuru oke', 'Learn. Complete. Get certified.': 'Mụta. Mecha. Nweta asambodo.',
      'Share threats, tips & news': 'Kesaa iyi egwu, ndụmọdụ na akụkọ', 'Ask anything about staying safe': 'Jụọ ihe ọ bụla gbasara nchekwa',
      'Alerts & activity': 'Ọkwa na ọrụ', 'Make Sentinel yours': 'Mee ka Sentinel bụrụ nke gị', 'Your account': 'Akaụntụ gị',
      'Everything else, one tap away': 'Ihe niile ọzọ, otu ọpịpị',
      'Quick Scan': 'Nyocha Ngwa Ngwa', 'Security Tips': 'Ndụmọdụ Nchekwa', 'Latest Threat News': 'Akụkọ Iyi Egwu Ọhụrụ',
      'Recent Scans': 'Nyocha Nso Nso a', 'View all': 'Lee ha niile', 'Threat Categories': 'Ụdị Iyi Egwu',
      'SECURITY SCORE': 'AKARA NCHEKWA', 'THREATS DETECTED': 'IYI EGWU ACHỌPỤTARA', 'SCAMS BLOCKED': 'AGHỤGHỌ EGBOCHIRI', 'RISK LEVEL': 'ỌKWA IHE IZE NDỤ',
      'Scan URL': 'Nyochaa URL', 'Analyze Email': 'Nyochaa Ozi-e', 'Detect Scam': 'Chọpụta Aghụghọ', 'Check Exposure': 'Lelee Ntọhapụ',
      'Sign In': 'Banye', 'Create Account': 'Mepụta Akaụntụ', 'Sign Out': 'Pụọ', 'Save Changes': 'Chekwaa Mgbanwe',
      'Welcome back': 'Nnọọ ọzọ', 'Email address': 'Adreesị ozi-e', 'Password': 'Okwuntughe', 'Full name': 'Aha zuru ezu',
      'Remember me': 'Cheta m', 'Forgot password?': 'Chefuru okwuntughe?', 'Create your account': 'Mepụta akaụntụ gị',
      'Reset your password': 'Tọgharịa okwuntughe gị', 'Verify your email': 'Kwado ozi-e gị',
      'Send Reset Link': 'Ziga Njikọ Ntọgharị', 'Verify Email': 'Kwado Ozi-e', 'Update Password': 'Melite Okwuntughe',
      'Safe': 'Dị Mma', 'Suspicious': 'Na-enyo Enyo', 'Dangerous': 'Dị Ize Ndụ',
      'Threat Type': 'Ụdị Iyi Egwu', 'Explanation': 'Nkọwa', 'Recommendation': 'Ndụmọdụ', 'Decoded Content': 'Ihe A Kọwara',
      'Save to Reports': 'Chekwaa n’Akụkọ', 'Report False Result': 'Kpesa Nsonaazụ Ụgha', 'AI analysis in progress…': 'Nyocha AI na-aga…',
      'Mark all read': 'Kaa ha niile agụọla', 'Change': 'Gbanwee', 'Theme': 'Ụcha', 'Language': 'Asụsụ', 'Appearance': 'Ọdịdị',
      'New Post': 'Edemede Ọhụrụ', 'Search community…': 'Chọọ n’obodo…', 'Comments': 'Nkwuputa', 'Add a comment…': 'Tinye nkwuputa…',
      'Post to Community': 'Ziga n’Obodo', 'Share with the Community': 'Kesaa n’Obodo', 'Title': 'Isiokwu', 'Category': 'Ụdị', 'Details': 'Nkọwa',
      'Lessons': 'Ihe Ọmụmụ', 'Start Course': 'Bido Ọmụmụ', 'Continue Course': 'Gaa n’ihu n’Ọmụmụ', 'Final Quiz': 'Ajụjụ Ikpeazụ',
      'Progress': 'Ọganihu', 'Certificate': 'Asambodo', 'Submit Quiz': 'Nyefee Ajụjụ', 'Course Complete!': 'Ọmụmụ Ezuola!',
      'Download Certificate': 'Budata Asambodo', 'All Courses': 'Ọmụmụ Niile', 'Previous': 'Nke Gara Aga', 'Next →': 'Ọzọ →',
      'Mark Complete & Continue →': 'Kaa Ezuola ma Gaa n’ihu →', 'Go to Quiz →': 'Gaa n’Ajụjụ →', 'Review & Certificate': 'Nyochaa na Asambodo',
      'Scan History': 'Akụkọ Nyocha', 'Generated Reports': 'Akụkọ Emepụtara',
      'Generate Report': 'Mepụta Akụkọ', 'Generate': 'Mepụta', 'Filter': 'Nzacha', 'Blocked Today': 'Egbochiri Taa',
      'Scans Today': 'Nyocha Taa', 'States Active': 'Steeti Na-arụ Ọrụ', 'Live Threat Map — Nigeria': 'Maapụ Iyi Egwu — Naịjirịa',
      'Scans Per Day': 'Nyocha Kwa Ụbọchị', 'Threats Per Day': 'Iyi Egwu Kwa Ụbọchị', 'Scan Activity (7 days)': 'Ọrụ Nyocha (ụbọchị 7)',
      'Type': 'Ụdị', 'Verdict': 'Mkpebi', 'From': 'Site na', 'To': 'Ruo', 'All': 'Niile',
      'Ask a security question…': 'Jụọ ajụjụ nchekwa…', 'New Chat': 'Mkparịta Ụka Ọhụrụ', 'History': 'Akụkọ', 'Chat History': 'Akụkọ Mkparịta',
      'Got it': 'Aghọtala m', "Don't show again": 'Egosikwala ọzọ', 'No scans yet': 'Enwebeghị nyocha', 'No threats yet': 'Enwebeghị iyi egwu',
      'Change Password': 'Gbanwee Okwuntughe', 'Current password': 'Okwuntughe ugbu a', 'New password': 'Okwuntughe ọhụrụ',
      'Confirm new password': 'Kwado okwuntughe ọhụrụ', 'Change password': 'Gbanwee okwuntughe',
      'Company': 'Ụlọ Ọrụ', 'Role': 'Ọrụ', 'Subscription': 'Ndenye Aha', 'Personal Information': 'Ozi Onwe Gị',
      'Dark': 'Gbara Ọchịchịrị', 'Light': 'Na-enwu Enwu', 'Like': 'Masịrị m', 'Report': 'Kpesa',
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
      'AI-powered URL threat analysis': 'Àyẹ̀wò ewu URL pẹ̀lú AI', 'Phishing & spoofing detection': 'Ìwádìí jìbìtì ímeèlì',
      'Scam pattern detection': 'Ìwádìí àpẹẹrẹ jìbìtì', 'Decode & verify before you visit': 'Túmọ̀ kí o sì ṣàyẹ̀wò kí o tó lọ',
      'Static malware analysis': 'Àyẹ̀wò malware', 'Strength, entropy & crack time': 'Agbára àti àkókò ìfọ́ ọ̀rọ̀ìpamọ́',
      'Know when your data leaks': 'Mọ̀ nígbà tí data rẹ bá jò', 'Live threat landscape — Nigeria': 'Ipò ewu lọ́wọ́lọ́wọ́ — Nàìjíríà',
      'Executive-ready security reporting': 'Ìjábọ̀ ààbò pípé', 'Learn. Complete. Get certified.': 'Kọ́. Parí. Gba ìwé ẹ̀rí.',
      'Share threats, tips & news': 'Pín ewu, ìmọ̀ràn àti ìròyìn', 'Ask anything about staying safe': 'Béèrè ohunkóhun nípa ààbò',
      'Alerts & activity': 'Ìkìlọ̀ àti ìṣe', 'Make Sentinel yours': 'Sọ Sentinel di tìrẹ', 'Your account': 'Àkáǹtì rẹ',
      'Everything else, one tap away': 'Gbogbo ohun mìíràn, ìtẹ̀ kan péré',
      'Quick Scan': 'Àyẹ̀wò Kíákíá', 'Security Tips': 'Ìmọ̀ràn Ààbò', 'Latest Threat News': 'Ìròyìn Ewu Tuntun',
      'Recent Scans': 'Àyẹ̀wò Àìpẹ́', 'View all': 'Wo gbogbo rẹ̀', 'Threat Categories': 'Oríṣi Ewu',
      'SECURITY SCORE': 'ÀMI ÀÀBÒ', 'THREATS DETECTED': 'EWU TÍ A RÍ', 'SCAMS BLOCKED': 'JÌBÌTÌ TÍ A DÍ', 'RISK LEVEL': 'ÌPELE EWU',
      'Scan URL': 'Ṣàyẹ̀wò URL', 'Analyze Email': 'Ṣàyẹ̀wò Ímeèlì', 'Detect Scam': 'Ṣàwárí Jìbìtì', 'Check Exposure': 'Ṣàyẹ̀wò Ìjìlọ',
      'Sign In': 'Wọlé', 'Create Account': 'Ṣí Àkáǹtì', 'Sign Out': 'Jáde', 'Save Changes': 'Fi Àyípadà Pamọ́',
      'Welcome back': 'Káàbọ̀ padà', 'Email address': 'Àdírẹ́sì ímeèlì', 'Password': 'Ọ̀rọ̀ìpamọ́', 'Full name': 'Orúkọ kíkún',
      'Remember me': 'Rántí mi', 'Forgot password?': 'Gbàgbé ọ̀rọ̀ìpamọ́?', 'Create your account': 'Ṣí àkáǹtì rẹ',
      'Reset your password': 'Tún ọ̀rọ̀ìpamọ́ rẹ ṣe', 'Verify your email': 'Ṣàyẹ̀wò ímeèlì rẹ',
      'Send Reset Link': 'Fi Ìjápọ̀ Àtúnṣe Ránṣẹ́', 'Verify Email': 'Ṣàyẹ̀wò Ímeèlì', 'Update Password': 'Ṣe Àtúnṣe Ọ̀rọ̀ìpamọ́',
      'Safe': 'Aláìléwu', 'Suspicious': 'Eléèrò', 'Dangerous': 'Léwu',
      'Threat Type': 'Oríṣi Ewu', 'Explanation': 'Àlàyé', 'Recommendation': 'Ìmọ̀ràn', 'Decoded Content': 'Ohun Tí A Túmọ̀',
      'Save to Reports': 'Fi pamọ́ sí Ìjábọ̀', 'Report False Result': 'Jábọ̀ Àbájáde Èké', 'AI analysis in progress…': 'Àyẹ̀wò AI ń lọ lọ́wọ́…',
      'Mark all read': 'Sàmì sí gbogbo rẹ̀', 'Change': 'Yípadà', 'Theme': 'Àwòrán Ìhìn', 'Language': 'Èdè', 'Appearance': 'Ìrísí',
      'New Post': 'Ìfìwéránṣẹ́ Tuntun', 'Search community…': 'Wá nínú àwùjọ…', 'Comments': 'Àlàyé Èrò', 'Add a comment…': 'Fi àlàyé kún…',
      'Post to Community': 'Fi ránṣẹ́ sí Àwùjọ', 'Share with the Community': 'Pín pẹ̀lú Àwùjọ', 'Title': 'Àkọlé', 'Category': 'Ẹ̀ka', 'Details': 'Àlàyé',
      'Lessons': 'Ẹ̀kọ́', 'Start Course': 'Bẹ̀rẹ̀ Ẹ̀kọ́', 'Continue Course': 'Tẹ̀síwájú Ẹ̀kọ́', 'Final Quiz': 'Ìdánwò Ìkẹyìn',
      'Progress': 'Ìtẹ̀síwájú', 'Certificate': 'Ìwé Ẹ̀rí', 'Submit Quiz': 'Fi Ìdánwò Sílẹ̀', 'Course Complete!': 'Ẹ̀kọ́ Parí!',
      'Download Certificate': 'Gba Ìwé Ẹ̀rí', 'All Courses': 'Gbogbo Ẹ̀kọ́', 'Previous': 'Ìṣáájú', 'Next →': 'Tókàn →',
      'Mark Complete & Continue →': 'Parí kí o Tẹ̀síwájú →', 'Go to Quiz →': 'Lọ sí Ìdánwò →', 'Review & Certificate': 'Àyẹ̀wò àti Ìwé Ẹ̀rí',
      'Scan History': 'Ìtàn Àyẹ̀wò', 'Generated Reports': 'Ìjábọ̀ Tí A Ṣe',
      'Generate Report': 'Ṣe Ìjábọ̀', 'Generate': 'Ṣe é', 'Filter': 'Àsẹ́', 'Blocked Today': 'Tí A Dí Lónìí',
      'Scans Today': 'Àyẹ̀wò Lónìí', 'States Active': 'Ìpínlẹ̀ Tó Ń Ṣiṣẹ́', 'Live Threat Map — Nigeria': 'Mápù Ewu — Nàìjíríà',
      'Scans Per Day': 'Àyẹ̀wò Lójoojúmọ́', 'Threats Per Day': 'Ewu Lójoojúmọ́', 'Scan Activity (7 days)': 'Ìṣe Àyẹ̀wò (ọjọ́ 7)',
      'Type': 'Oríṣi', 'Verdict': 'Ìdájọ́', 'From': 'Láti', 'To': 'Sí', 'All': 'Gbogbo',
      'Ask a security question…': 'Béèrè ìbéèrè ààbò…', 'New Chat': 'Ìjíròrò Tuntun', 'History': 'Ìtàn', 'Chat History': 'Ìtàn Ìjíròrò',
      'Got it': 'Ó yé mi', "Don't show again": 'Má fi hàn mọ́', 'No scans yet': 'Kò sí àyẹ̀wò síbẹ̀', 'No threats yet': 'Kò sí ewu síbẹ̀',
      'Change Password': 'Yí Ọ̀rọ̀ìpamọ́ Padà', 'Current password': 'Ọ̀rọ̀ìpamọ́ lọ́wọ́lọ́wọ́', 'New password': 'Ọ̀rọ̀ìpamọ́ tuntun',
      'Confirm new password': 'Jẹ́rìí ọ̀rọ̀ìpamọ́ tuntun', 'Change password': 'Yí ọ̀rọ̀ìpamọ́ padà',
      'Company': 'Ilé-iṣẹ́', 'Role': 'Ipò', 'Subscription': 'Ìforúkọsílẹ̀', 'Personal Information': 'Ìwífún Ara Ẹni',
      'Dark': 'Dúdú', 'Light': 'Funfun', 'Like': 'Fẹ́ràn', 'Report': 'Jábọ̀',
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
      'AI-powered URL threat analysis': 'AI go check di link wella', 'Phishing & spoofing detection': 'Catch fake email sharp sharp',
      'Scam pattern detection': 'Catch scam pattern', 'Decode & verify before you visit': 'Check am well before you enter',
      'Static malware analysis': 'Check file for virus', 'Strength, entropy & crack time': 'How strong your password be',
      'Know when your data leaks': 'Know when your data don leak', 'Live threat landscape — Nigeria': 'Live wahala levels — Naija',
      'Executive-ready security reporting': 'Correct security report', 'Learn. Complete. Get certified.': 'Learn am. Finish am. Collect certificate.',
      'Share threats, tips & news': 'Share wahala, tips and tori', 'Ask anything about staying safe': 'Ask anything about security',
      'Alerts & activity': 'Alert and activity', 'Make Sentinel yours': 'Arrange Sentinel as you like', 'Your account': 'Your account',
      'Everything else, one tap away': 'Everything else dey here',
      'Quick Scan': 'Sharp Sharp Check', 'Security Tips': 'Security Tori', 'Latest Threat News': 'Latest Wahala News',
      'Recent Scans': 'Wetin You Check Recently', 'View all': 'See everything', 'Threat Categories': 'Wahala Type Dem',
      'SECURITY SCORE': 'SECURITY SCORE', 'THREATS DETECTED': 'WAHALA WEY WE SEE', 'SCAMS BLOCKED': 'SCAM WEY WE BLOCK', 'RISK LEVEL': 'RISK LEVEL',
      'Scan URL': 'Check di Link', 'Analyze Email': 'Check di Email', 'Detect Scam': 'Catch di Scam', 'Check Exposure': 'Check Leak',
      'Sign In': 'Enter', 'Create Account': 'Open Account', 'Sign Out': 'Comot', 'Save Changes': 'Save Am',
      'Welcome back': 'Welcome back o', 'Email address': 'Email address', 'Password': 'Password', 'Full name': 'Your full name',
      'Remember me': 'No forget me', 'Forgot password?': 'You forget password?', 'Create your account': 'Open your account',
      'Reset your password': 'Reset your password', 'Verify your email': 'Confirm your email',
      'Send Reset Link': 'Send Reset Link', 'Verify Email': 'Confirm Email', 'Update Password': 'Change Password',
      'Safe': 'E Safe', 'Suspicious': 'E Get K-leg', 'Dangerous': 'Serious Wahala',
      'Threat Type': 'Wahala Type', 'Explanation': 'Wetin Happen', 'Recommendation': 'Wetin You Go Do', 'Decoded Content': 'Wetin Dey Inside',
      'Save to Reports': 'Save for Report', 'Report False Result': 'Talk say e no correct', 'AI analysis in progress…': 'AI dey check am…',
      'Mark all read': 'Mark all say I don read', 'Change': 'Change Am', 'Theme': 'Theme', 'Language': 'Language', 'Appearance': 'How E Look',
      'New Post': 'New Post', 'Search community…': 'Find inside community…', 'Comments': 'Comment Dem', 'Add a comment…': 'Drop comment…',
      'Post to Community': 'Post Am', 'Share with the Community': 'Share Am for Community', 'Title': 'Title', 'Category': 'Category', 'Details': 'Full Tori',
      'Lessons': 'Lesson Dem', 'Start Course': 'Start di Course', 'Continue Course': 'Continue di Course', 'Final Quiz': 'Final Test',
      'Progress': 'How Far You Don Go', 'Certificate': 'Certificate', 'Submit Quiz': 'Submit di Test', 'Course Complete!': 'You Don Finish!',
      'Download Certificate': 'Download Certificate', 'All Courses': 'All Course Dem', 'Previous': 'Go Back', 'Next →': 'Next One →',
      'Mark Complete & Continue →': 'Mark Am Done, Continue →', 'Go to Quiz →': 'Go Do Test →', 'Review & Certificate': 'Check Am & Certificate',
      'Scan History': 'Check History', 'Generated Reports': 'Report Wey You Don Make',
      'Generate Report': 'Make Report', 'Generate': 'Make Am', 'Filter': 'Filter', 'Blocked Today': 'Block Today',
      'Scans Today': 'Check Today', 'States Active': 'State Wey Dey Active', 'Live Threat Map — Nigeria': 'Live Wahala Map — Naija',
      'Scans Per Day': 'Check Per Day', 'Threats Per Day': 'Wahala Per Day', 'Scan Activity (7 days)': 'Check Activity (7 days)',
      'Type': 'Type', 'Verdict': 'Judgement', 'From': 'From', 'To': 'To', 'All': 'All',
      'Ask a security question…': 'Ask any security question…', 'New Chat': 'New Chat', 'History': 'History', 'Chat History': 'Chat History',
      'Got it': 'I don hear', "Don't show again": 'No show me again', 'No scans yet': 'You never check anything', 'No threats yet': 'No wahala yet',
      'Change Password': 'Change Password', 'Current password': 'Password wey you dey use now', 'New password': 'New password',
      'Confirm new password': 'Confirm di new password', 'Change password': 'Change password',
      'Company': 'Company', 'Role': 'Position', 'Subscription': 'Subscription', 'Personal Information': 'Your Own Info',
      'Dark': 'Dark', 'Light': 'Light', 'Like': 'Like', 'Report': 'Report Am',
    },
  },

  t(str) {
    if (I18N.lang === 'en') return str;
    const d = I18N.dicts[I18N.lang];
    return (d && d[str]) || str;
  },

  setLang(lang) { I18N.lang = I18N.dicts[lang] ? lang : 'en'; },

  /* Translate exact-match text nodes + placeholder/title attrs in a subtree. */
  apply(root) {
    if (I18N.lang === 'en') return;
    const d = I18N.dicts[I18N.lang];
    if (!d) return;
    root = root || document.body;
    if (!root || root.nodeType !== 1) return;
    I18N._applying = true;
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
    I18N._applying = false;
  },

  /* Auto-translate everything that gets rendered later: scan results,
     modals, async lists, admin tables — no per-view wiring needed. */
  observe() {
    if (I18N._observer) return;
    I18N._observer = new MutationObserver(muts => {
      if (I18N.lang === 'en' || I18N._applying) return;
      clearTimeout(I18N._debounce);
      const roots = new Set();
      muts.forEach(m => m.addedNodes && m.addedNodes.forEach(n => {
        if (n.nodeType === 1) roots.add(n);
        else if (n.nodeType === 3 && n.parentElement) roots.add(n.parentElement);
      }));
      if (!roots.size) return;
      I18N._debounce = setTimeout(() => roots.forEach(r => { if (r.isConnected) I18N.apply(r); }), 60);
    });
    I18N._observer.observe(document.body, { childList: true, subtree: true });
  },
};
