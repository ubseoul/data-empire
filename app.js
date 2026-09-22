const $ = (s, r=document) => r.querySelector(s);
const SAVE_KEY = "dataEmpireBeginnerV2";
let SQL, db;
let state = loadState();
let currentLesson = null;
let lastRows = [];

const CHAPTERS = [
  {id:1,name:"Show Me Stuff",tag:"SELECT",desc:"Learn how SQL asks a table for information."},
  {id:2,name:"Find Stuff",tag:"WHERE",desc:"Filter a table down to exactly the rows you want."},
  {id:3,name:"Organize Stuff",tag:"ORDER + LIMIT",desc:"Sort results, keep the top few, and remove repeats."},
  {id:4,name:"Count Stuff",tag:"AGGREGATION",desc:"Turn rows into useful product metrics."},
  {id:5,name:"Connect Stuff",tag:"JOIN",desc:"Combine tables without losing track of what one row means."},
  {id:6,name:"Read the Product",tag:"PRODUCT ANALYTICS",desc:"Use SQL for activation, funnels, and retention."},
  {id:7,name:"Interview Mode",tag:"TRANSFER",desc:"Less hand-holding. More real analyst questions."}
];

const L = (id,chapter,title,concept,objective,starter,answer,opts={}) => ({id,chapter,title,concept,objective,starter,answer,...opts});
const LESSONS = [
  // CHAPTER 1 — extremely gentle
  L("1.1",1,"Meet a table","A database stores information in tables. A table has columns (what kind of information) and rows (one item/person/event).","Press Run. We are simply asking to see five rows from the users table.","SELECT *\nFROM users\nLIMIT 5;","SELECT * FROM users LIMIT 5",{mode:"watch",table:"users",english:"Show me every column from the users table, but only five rows.",xp:10,teach:"The star * means every column."}),
  L("1.2",1,"Show me names","SELECT means “show me.” FROM means “which table should I look in?”","Show only the name column.","SELECT name\nFROM users;","SELECT name FROM users",{mode:"copy",table:"users",english:"Show me name from the users table.",xp:10,teach:"The pattern is SELECT [column] FROM [table]."}),
  L("1.3",1,"Your first tiny edit","You can replace the column after SELECT to ask for something different.","Change name to country so the result shows only countries.","SELECT name\nFROM users;","SELECT country FROM users",{mode:"edit",table:"users",english:"Show me country from the users table.",xp:12,nudge:"Only one word needs to change.",teach:"After SELECT, write the column you want: country."}),
  L("1.4",1,"Two columns","Separate column names with commas when you want more than one.","Show name and platform.","SELECT name, platform\nFROM users;","SELECT name, platform FROM users",{mode:"copy",table:"users",english:"Show me name and platform from users.",xp:12,nudge:"You can select more than one column.",teach:"Use SELECT name, platform FROM users."}),
  L("1.5",1,"Everything at once","The star * is shorthand for “all columns.”","Show every column for every user.","SELECT *\nFROM users;","SELECT * FROM users",{mode:"copy",table:"users",english:"Show me everything from users.",xp:12,nudge:"Remember what * meant in the first lesson.",teach:"SELECT * FROM users;"}),
  L("1.6",1,"Memory check","Now you do a small one without a pre-written answer.","Show user_id, name, and platform from users.","SELECT \nFROM users;","SELECT user_id, name, platform FROM users",{mode:"recall",table:"users",english:"Show me user_id, name, and platform from users.",xp:20,nudge:"Put the three requested columns after SELECT.",teach:"Separate columns with commas."}),

  // CHAPTER 2
  L("2.1",2,"Only Nigeria","WHERE means “only keep rows where this condition is true.”","Press Run and watch what WHERE does.","SELECT name, country\nFROM users\nWHERE country = 'Nigeria';","SELECT name, country FROM users WHERE country='Nigeria'",{mode:"watch",table:"users",english:"Show me names and countries from users, but only when country is Nigeria.",xp:12,teach:"Text values go in quotes: 'Nigeria'."}),
  L("2.2",2,"Only Android","Keep the same pattern, but filter to Android.","Show name and platform for Android users.","SELECT name, platform\nFROM users\nWHERE platform = 'Nigeria';","SELECT name, platform FROM users WHERE platform='Android'",{mode:"edit",table:"users",english:"Show me name and platform from users, only where platform is Android.",xp:14,nudge:"The column is platform and the value is Android.",teach:"WHERE platform = 'Android'"}),
  L("2.3",2,"Organic users","A filter can use any column.","Show name and acquisition_source for Organic users.","SELECT name, acquisition_source\nFROM users\nWHERE ","SELECT name, acquisition_source FROM users WHERE acquisition_source='Organic'",{mode:"guided",table:"users",english:"Show me name and acquisition source, only where acquisition source is Organic.",xp:14,nudge:"Filter acquisition_source.",teach:"WHERE acquisition_source = 'Organic'"}),
  L("2.4",2,"After a date","WHERE can compare numbers and dates too. >= means “greater than or equal to.”","Show user_id and signup_date for people who signed up on or after 2026-05-01.","SELECT user_id, signup_date\nFROM users\nWHERE signup_date >= ","SELECT user_id, signup_date FROM users WHERE signup_date >= '2026-05-01'",{mode:"guided",table:"users",english:"Show me user_id and signup date from users, only when signup date is May 1, 2026 or later.",xp:16,nudge:"Dates are text here, so put the date in quotes.",teach:"WHERE signup_date >= '2026-05-01'"}),
  L("2.5",2,"Two rules","AND means both conditions must be true.","Show US users on iOS. Return name, country, platform.","SELECT name, country, platform\nFROM users\nWHERE country = 'US'\nAND ","SELECT name, country, platform FROM users WHERE country='US' AND platform='iOS'",{mode:"guided",table:"users",english:"Show me US users only when they are also on iOS.",xp:18,nudge:"The second condition checks platform.",teach:"AND platform = 'iOS'"}),
  L("2.6",2,"Either rule","OR means either condition may be true.","Show users from Nigeria OR Brazil. Return name and country.","SELECT name, country\nFROM users\nWHERE ","SELECT name, country FROM users WHERE country='Nigeria' OR country='Brazil'",{mode:"guided",table:"users",english:"Show me users whose country is Nigeria or Brazil.",xp:18,nudge:"Write two country checks separated by OR.",teach:"WHERE country='Nigeria' OR country='Brazil'"}),
  L("2.7",2,"Memory check","No SQL technique is named in the prompt now.","Show name, platform, and country for Android users in Canada.","SELECT \nFROM users\n", "SELECT name, platform, country FROM users WHERE platform='Android' AND country='Canada'",{mode:"recall",table:"users",english:"Show me Android users who are also in Canada.",xp:25,nudge:"You need two conditions that must both be true.",teach:"Use WHERE ... AND ..."}),

  // CHAPTER 3
  L("3.1",3,"Newest first","ORDER BY sorts results. DESC means biggest/latest first.","Press Run to sort signup dates newest first.","SELECT name, signup_date\nFROM users\nORDER BY signup_date DESC;","SELECT name, signup_date FROM users ORDER BY signup_date DESC",{mode:"watch",table:"users",english:"Show names and signup dates, sorted from newest signup to oldest.",xp:14,teach:"DESC = descending."}),
  L("3.2",3,"Oldest first","ASC means smallest/earliest first. ASC is also the default.","Show name and signup_date, oldest signup first.","SELECT name, signup_date\nFROM users\nORDER BY signup_date ","SELECT name, signup_date FROM users ORDER BY signup_date ASC",{mode:"guided",table:"users",english:"Show names and signup dates, sorted from oldest to newest.",xp:14,nudge:"Use ASC.",teach:"ORDER BY signup_date ASC"}),
  L("3.3",3,"Just a few","LIMIT says how many rows to return.","Show only 3 users.","SELECT *\nFROM users\nLIMIT ","SELECT * FROM users LIMIT 3",{mode:"guided",table:"users",english:"Show me every column, but only three rows.",xp:14,nudge:"Put the number 3 after LIMIT.",teach:"LIMIT 3"}),
  L("3.4",3,"Top 5 newest","Sorting and limiting are commonly used together.","Show the 5 newest users: name and signup_date.","SELECT name, signup_date\nFROM users\n", "SELECT name, signup_date FROM users ORDER BY signup_date DESC LIMIT 5",{mode:"guided",table:"users",english:"Show the five newest signups.",xp:18,nudge:"First sort newest first, then keep five.",teach:"ORDER BY signup_date DESC LIMIT 5"}),
  L("3.5",3,"Unique values","DISTINCT removes duplicate values from your result.","List the unique countries.","SELECT DISTINCT \nFROM users;","SELECT DISTINCT country FROM users",{mode:"guided",table:"users",english:"Show each country once, even if many users share it.",xp:18,nudge:"Put country after DISTINCT.",teach:"SELECT DISTINCT country FROM users"}),
  L("3.6",3,"Mini boss: newest Android","Use several things you already know. Nothing new here.","Show the 5 newest Android users: name, platform, signup_date.","SELECT \nFROM users\n", "SELECT name, platform, signup_date FROM users WHERE platform='Android' ORDER BY signup_date DESC LIMIT 5",{mode:"recall",table:"users",english:"Find Android users, sort newest first, keep five.",xp:30,nudge:"Think in this order: choose columns → filter → sort → limit.",teach:"WHERE platform='Android' then ORDER BY signup_date DESC then LIMIT 5"}),

  // CHAPTER 4
  L("4.1",4,"Count rows","COUNT(*) counts rows.","Press Run to count all users.","SELECT COUNT(*) AS users\nFROM users;","SELECT COUNT(*) AS users FROM users",{mode:"watch",table:"users",english:"Count all rows in users and call the result users.",xp:16,teach:"AS gives a result column a readable name."}),
  L("4.2",4,"Count a filtered group","Filters happen before the count.","Count Android users. Return one column named android_users.","SELECT COUNT(*) AS android_users\nFROM users\nWHERE ","SELECT COUNT(*) AS android_users FROM users WHERE platform='Android'",{mode:"guided",table:"users",english:"Count rows, but only Android users.",xp:18,nudge:"Filter platform before the count finishes.",teach:"WHERE platform='Android'"}),
  L("4.3",4,"Meet another table","Your product has enrollments too. One row represents one course enrollment.","Press Run to inspect five enrollments.","SELECT *\nFROM enrollments\nLIMIT 5;","SELECT * FROM enrollments LIMIT 5",{mode:"watch",table:"enrollments",english:"Show five enrollment rows.",xp:12,teach:"Different tables represent different kinds of things."}),
  L("4.4",4,"Average progress","AVG() calculates the mean of a numeric column.","Return average progress_pct rounded to 1 decimal as avg_progress.","SELECT ROUND(AVG(progress_pct), 1) AS avg_progress\nFROM enrollments;","SELECT ROUND(AVG(progress_pct),1) AS avg_progress FROM enrollments",{mode:"copy",table:"enrollments",english:"Average all progress percentages, round to one decimal.",xp:18,teach:"AVG(progress_pct) averages that column."}),
  L("4.5",4,"One count per platform","GROUP BY splits rows into groups before an aggregate is calculated.","Count users for each platform. Return platform and users.","SELECT platform, COUNT(*) AS users\nFROM users\nGROUP BY ","SELECT platform, COUNT(*) AS users FROM users GROUP BY platform",{mode:"guided",table:"users",english:"Make one group per platform, then count users inside each group.",xp:22,nudge:"Group by the same category you are showing: platform.",teach:"GROUP BY platform"}),
  L("4.6",4,"One count per source","Now repeat the same idea with acquisition_source.","Count users by acquisition_source.","SELECT acquisition_source, COUNT(*) AS users\nFROM users\n", "SELECT acquisition_source, COUNT(*) AS users FROM users GROUP BY acquisition_source",{mode:"guided",table:"users",english:"Make one group per acquisition source, then count users.",xp:22,nudge:"What should define each group?",teach:"GROUP BY acquisition_source"}),
  L("4.7",4,"Which source is biggest?","Once you have grouped counts, you can sort those counts.","Return acquisition_source and users, biggest source first.","SELECT acquisition_source, COUNT(*) AS users\nFROM users\n", "SELECT acquisition_source, COUNT(*) AS users FROM users GROUP BY acquisition_source ORDER BY users DESC",{mode:"guided",table:"users",english:"Count each source, then sort from most users to least.",xp:24,nudge:"GROUP BY first. ORDER BY the alias users afterward.",teach:"GROUP BY acquisition_source ORDER BY users DESC"}),
  L("4.8",4,"Boss: platform population","This is your first real metric question. No new syntax.","Which platform has the most users? Return platform and users, highest first.","SELECT \nFROM users\n", "SELECT platform, COUNT(*) AS users FROM users GROUP BY platform ORDER BY users DESC",{mode:"recall",table:"users",english:"Count users in each platform and rank the platforms by size.",xp:35,nudge:"You need one row per platform.",teach:"COUNT + GROUP BY platform + ORDER BY users DESC",finding:true}),

  // CHAPTER 5
  L("5.1",5,"Why JOIN exists","Sometimes the information you need lives in two tables. JOIN matches rows using a shared key.","Press Run. Match each enrollment to the user's name.","SELECT e.enrollment_id, u.name\nFROM enrollments e\nJOIN users u ON e.user_id = u.user_id\nLIMIT 8;","SELECT e.enrollment_id,u.name FROM enrollments e JOIN users u ON e.user_id=u.user_id LIMIT 8",{mode:"watch",table:"enrollments",english:"For each enrollment, find the user with the same user_id and show their name.",xp:18,teach:"The ON line explains how the two tables match."}),
  L("5.2",5,"Join course names","Enrollments contain course_id, while courses contain the human-readable course_name.","Return enrollment_id and course_name for the first 10 enrollments.","SELECT e.enrollment_id, c.course_name\nFROM enrollments e\nJOIN courses c ON ","SELECT e.enrollment_id,c.course_name FROM enrollments e JOIN courses c ON e.course_id=c.course_id LIMIT 10",{mode:"guided",table:"enrollments",english:"Match enrollments to courses when course_id is the same.",xp:24,nudge:"Both tables contain course_id.",teach:"ON e.course_id = c.course_id LIMIT 10"}),
  L("5.3",5,"Keep unmatched users","LEFT JOIN keeps everyone from the left table even when there is no match on the right.","Count users who have never enrolled. Return never_enrolled.","SELECT COUNT(*) AS never_enrolled\nFROM users u\nLEFT JOIN enrollments e ON u.user_id=e.user_id\nWHERE ","SELECT COUNT(*) AS never_enrolled FROM users u LEFT JOIN enrollments e ON u.user_id=e.user_id WHERE e.enrollment_id IS NULL",{mode:"guided",table:"users",english:"Keep all users, attach enrollments when possible, then keep only users with no matching enrollment.",xp:28,nudge:"No match means the enrollment columns are NULL.",teach:"WHERE e.enrollment_id IS NULL"}),
  L("5.4",5,"Create a category","CASE WHEN lets you create labels from rules.","Label progress_pct=100 as Completed and everything else as In Progress. Count both statuses.","SELECT CASE WHEN progress_pct = 100 THEN 'Completed'\n            ELSE 'In Progress' END AS status,\n       COUNT(*) AS enrollments\nFROM enrollments\nGROUP BY status;","SELECT CASE WHEN progress_pct=100 THEN 'Completed' ELSE 'In Progress' END AS status, COUNT(*) AS enrollments FROM enrollments GROUP BY status",{mode:"copy",table:"enrollments",english:"Create a status label from progress, then count each label.",xp:28,unordered:true,teach:"CASE creates a new value row by row."}),
  L("5.5",5,"A readable two-step query","A CTE gives a temporary name to one query so another query can use it.","Press Run. First count events per user; then average those counts.","WITH user_events AS (\n  SELECT user_id, COUNT(*) AS events\n  FROM events\n  GROUP BY user_id\n)\nSELECT ROUND(AVG(events),1) AS avg_events\nFROM user_events;","WITH user_events AS (SELECT user_id,COUNT(*) AS events FROM events GROUP BY user_id) SELECT ROUND(AVG(events),1) AS avg_events FROM user_events",{mode:"watch",table:"events",english:"Step 1: count events per user. Step 2: average those user-level counts.",xp:26,teach:"CTEs are mainly about making multi-step logic easier to reason about."}),
  L("5.6",5,"Join boss: source quality","You need the user's acquisition source and their enrollment progress.","Return acquisition_source and average progress rounded to 1 decimal, highest first.","SELECT \nFROM enrollments e\nJOIN users u ON ","SELECT u.acquisition_source,ROUND(AVG(e.progress_pct),1) AS avg_progress FROM enrollments e JOIN users u ON e.user_id=u.user_id GROUP BY u.acquisition_source ORDER BY avg_progress DESC",{mode:"recall",table:"enrollments",english:"Match enrollments to users, group by acquisition source, average progress, sort high to low.",xp:40,nudge:"Join on user_id first.",teach:"Then GROUP BY acquisition_source and AVG(progress_pct).",finding:true}),

  // CHAPTER 6 product analytics
  L("6.1",6,"What is activation?","For TinyCo, we will define an activated user as someone who completes a lesson within 7 days of signup.","Count distinct activated users. Return activated_users.","SELECT COUNT(DISTINCT u.user_id) AS activated_users\nFROM users u\nJOIN events e ON u.user_id=e.user_id\nWHERE e.event_name='lesson_complete'\nAND julianday(e.event_time)-julianday(u.signup_date) BETWEEN 0 AND 7;","SELECT COUNT(DISTINCT u.user_id) AS activated_users FROM users u JOIN events e ON u.user_id=e.user_id WHERE e.event_name='lesson_complete' AND julianday(e.event_time)-julianday(u.signup_date) BETWEEN 0 AND 7",{mode:"copy",table:"events",english:"Count unique users who completed a lesson no more than seven days after signing up.",xp:28,teach:"COUNT(DISTINCT user_id) avoids counting the same user twice."}),
  L("6.2",6,"Activation rate","A rate needs a numerator (activated users) and denominator (all users).","Return activation_rate_pct rounded to 1 decimal.","WITH activated AS (\n  SELECT DISTINCT u.user_id\n  FROM users u JOIN events e ON u.user_id=e.user_id\n  WHERE e.event_name='lesson_complete'\n  AND julianday(e.event_time)-julianday(u.signup_date) BETWEEN 0 AND 7\n)\nSELECT ","WITH activated AS (SELECT DISTINCT u.user_id FROM users u JOIN events e ON u.user_id=e.user_id WHERE e.event_name='lesson_complete' AND julianday(e.event_time)-julianday(u.signup_date) BETWEEN 0 AND 7) SELECT ROUND(100.0*COUNT(a.user_id)/COUNT(*),1) AS activation_rate_pct FROM users u LEFT JOIN activated a ON u.user_id=a.user_id",{mode:"guided",table:"users",english:"Flag activated users, attach that flag to every user, then divide activated users by all users.",xp:34,nudge:"LEFT JOIN activated back to all users.",teach:"SELECT ROUND(100.0*COUNT(a.user_id)/COUNT(*),1) ... LEFT JOIN activated a ON u.user_id=a.user_id"}),
  L("6.3",6,"A product funnel","A funnel asks how many unique users reached each step.","Return viewers, starters, completers from course_view, lesson_start, lesson_complete.","SELECT\n  COUNT(DISTINCT CASE WHEN event_name='course_view' THEN user_id END) AS viewers,\n  COUNT(DISTINCT CASE WHEN event_name='lesson_start' THEN user_id END) AS starters,\n  COUNT(DISTINCT CASE WHEN event_name='lesson_complete' THEN user_id END) AS completers\nFROM events;","SELECT COUNT(DISTINCT CASE WHEN event_name='course_view' THEN user_id END) AS viewers, COUNT(DISTINCT CASE WHEN event_name='lesson_start' THEN user_id END) AS starters, COUNT(DISTINCT CASE WHEN event_name='lesson_complete' THEN user_id END) AS completers FROM events",{mode:"copy",table:"events",english:"Count unique users at each funnel step.",xp:34,teach:"The DISTINCT matters because users can create multiple events."}),
  L("6.4",6,"D7 retention","D7 retention asks whether a new user came back around seven days after signup. Here we use day 7 or 8.","Return d7_retention_pct rounded to 1 decimal.","WITH retained AS (\n  SELECT DISTINCT u.user_id\n  FROM users u JOIN events e ON u.user_id=e.user_id\n  WHERE julianday(e.event_time)-julianday(u.signup_date) BETWEEN 7 AND 8\n)\nSELECT ","WITH retained AS (SELECT DISTINCT u.user_id FROM users u JOIN events e ON u.user_id=e.user_id WHERE julianday(e.event_time)-julianday(u.signup_date) BETWEEN 7 AND 8) SELECT ROUND(100.0*COUNT(r.user_id)/COUNT(*),1) AS d7_retention_pct FROM users u LEFT JOIN retained r ON u.user_id=r.user_id",{mode:"guided",table:"events",english:"Find users who returned around day seven, then divide them by all users.",xp:36,nudge:"This is structurally almost the same as activation rate.",teach:"LEFT JOIN retained users to all users, then COUNT(retained)/COUNT(all)."}),
  L("6.5",6,"Cohorts","A cohort groups users by when they started so you can compare product health over time.","Return signup_month and d7_retention_pct by month, chronological.","WITH retained AS (\n  SELECT DISTINCT u.user_id\n  FROM users u JOIN events e ON u.user_id=e.user_id\n  WHERE julianday(e.event_time)-julianday(u.signup_date) BETWEEN 7 AND 8\n)\nSELECT strftime('%Y-%m',u.signup_date) AS signup_month,\n       ","WITH retained AS (SELECT DISTINCT u.user_id FROM users u JOIN events e ON u.user_id=e.user_id WHERE julianday(e.event_time)-julianday(u.signup_date) BETWEEN 7 AND 8) SELECT strftime('%Y-%m',u.signup_date) AS signup_month, ROUND(100.0*COUNT(r.user_id)/COUNT(*),1) AS d7_retention_pct FROM users u LEFT JOIN retained r ON u.user_id=r.user_id GROUP BY signup_month ORDER BY signup_month",{mode:"guided",table:"users",english:"Calculate D7 retention separately for each signup month.",xp:38,nudge:"After the LEFT JOIN, GROUP BY signup_month.",teach:"Compute the same retention rate, then GROUP BY signup_month ORDER BY signup_month."}),
  L("6.6",6,"Product boss: diagnose activation","Now segment the metric instead of calculating only the company average.","Return platform and activation_rate_pct, highest first.","WITH activated AS (\n  SELECT DISTINCT u.user_id\n  FROM users u JOIN events e ON u.user_id=e.user_id\n  WHERE e.event_name='lesson_complete'\n  AND julianday(e.event_time)-julianday(u.signup_date) BETWEEN 0 AND 7\n)\nSELECT ","WITH activated AS (SELECT DISTINCT u.user_id FROM users u JOIN events e ON u.user_id=e.user_id WHERE e.event_name='lesson_complete' AND julianday(e.event_time)-julianday(u.signup_date) BETWEEN 0 AND 7) SELECT u.platform,ROUND(100.0*COUNT(a.user_id)/COUNT(*),1) AS activation_rate_pct FROM users u LEFT JOIN activated a ON u.user_id=a.user_id GROUP BY u.platform ORDER BY activation_rate_pct DESC",{mode:"recall",table:"users",english:"Calculate activation rate separately inside each platform group.",xp:48,nudge:"This is activation rate + GROUP BY platform.",teach:"LEFT JOIN activated to users, GROUP BY platform, calculate the rate.",finding:true}),

  // CHAPTER 7 — transfer
  L("7.1",7,"First event per user","Window functions can rank rows without collapsing them. ROW_NUMBER can find each user's first event.","Return user_id, first_event_name, first_event_time for active users.","WITH ranked AS (\n  SELECT user_id,event_name,event_time,\n         ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY event_time,event_id) AS rn\n  FROM events\n)\nSELECT ","WITH ranked AS (SELECT user_id,event_name,event_time,ROW_NUMBER() OVER(PARTITION BY user_id ORDER BY event_time,event_id) AS rn FROM events) SELECT user_id,event_name AS first_event_name,event_time AS first_event_time FROM ranked WHERE rn=1 ORDER BY user_id",{mode:"guided",table:"events",english:"Rank each user's events by time, then keep rank 1.",xp:40,nudge:"The CTE already assigns rn. Keep only rn=1.",teach:"SELECT ... FROM ranked WHERE rn=1 ORDER BY user_id"}),
  L("7.2",7,"Experiment readout","For TinyCo's onboarding_v2 test, compare activation by assigned variant.","Return variant, users, activation_rate_pct.","WITH activated AS (\n  SELECT DISTINCT u.user_id\n  FROM users u JOIN events e ON u.user_id=e.user_id\n  WHERE e.event_name='lesson_complete'\n  AND julianday(e.event_time)-julianday(u.signup_date) BETWEEN 0 AND 7\n)\nSELECT ","WITH activated AS (SELECT DISTINCT u.user_id FROM users u JOIN events e ON u.user_id=e.user_id WHERE e.event_name='lesson_complete' AND julianday(e.event_time)-julianday(u.signup_date) BETWEEN 0 AND 7) SELECT x.variant,COUNT(*) AS users,ROUND(100.0*COUNT(a.user_id)/COUNT(*),1) AS activation_rate_pct FROM experiment_assignments x LEFT JOIN activated a ON x.user_id=a.user_id WHERE x.experiment_name='onboarding_v2' GROUP BY x.variant ORDER BY x.variant",{mode:"recall",table:"experiment_assignments",english:"Use experiment assignments as the denominator, then calculate activation inside each variant.",xp:50,nudge:"Start from experiment_assignments, not events.",teach:"LEFT JOIN activated to assignments, filter onboarding_v2, GROUP BY variant.",finding:true}),
  L("7.3",7,"Final screen","This is intentionally less tutorial-like. Use what you know to compare acquisition sources.","Return acquisition_source, users, activation_rate_pct, d7_retention_pct. Sort by users descending.","-- Build the analysis from scratch.\n", "WITH activated AS (SELECT DISTINCT u.user_id FROM users u JOIN events e ON u.user_id=e.user_id WHERE e.event_name='lesson_complete' AND julianday(e.event_time)-julianday(u.signup_date) BETWEEN 0 AND 7), retained AS (SELECT DISTINCT u.user_id FROM users u JOIN events e ON u.user_id=e.user_id WHERE julianday(e.event_time)-julianday(u.signup_date) BETWEEN 7 AND 8) SELECT u.acquisition_source,COUNT(*) AS users,ROUND(100.0*COUNT(a.user_id)/COUNT(*),1) AS activation_rate_pct,ROUND(100.0*COUNT(r.user_id)/COUNT(*),1) AS d7_retention_pct FROM users u LEFT JOIN activated a ON u.user_id=a.user_id LEFT JOIN retained r ON u.user_id=r.user_id GROUP BY u.acquisition_source ORDER BY users DESC",{mode:"final",table:"users",english:"Define activation and retention, attach both to users, then compare acquisition sources.",xp:80,nudge:"Build two small CTEs: activated and retained.",teach:"Then LEFT JOIN both to users and GROUP BY acquisition_source.",finding:true})
];

function defaultState(){return {xp:0,completed:{},assisted:{},attempts:{},notes:{},started:false};}
function loadState(){try{return {...defaultState(),...JSON.parse(localStorage.getItem(SAVE_KEY)||"{}")};}catch{return defaultState();}}
function save(){localStorage.setItem(SAVE_KEY,JSON.stringify(state));updateHeader();}
function level(){return 1+Math.floor(state.xp/100);}
function completedCount(){return Object.keys(state.completed).length;}
function currentIndex(){const i=LESSONS.findIndex(l=>!state.completed[l.id]);return i<0?LESSONS.length:i;}
function current(){return LESSONS[currentIndex()]||null;}
function chapterLessons(id){return LESSONS.filter(l=>l.chapter===id);}
function chapterUnlocked(id){if(id===1)return true;const prev=chapterLessons(id-1);return prev.every(l=>state.completed[l.id]);}
function escapeHTML(v){return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m]));}
function toast(msg){const el=$("#toast");el.textContent=msg;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),1800);}
function updateHeader(){$("#levelLabel").textContent=level();$("#xpLabel").textContent=state.xp;}
function exec(sql){const out=db.exec(sql);if(!out.length)return [];const block=out[out.length-1];return block.values.map(row=>Object.fromEntries(block.columns.map((c,i)=>[c,row[i]])));}
function normalize(rows,unordered=false){const r=rows.map(x=>Object.fromEntries(Object.entries(x).map(([k,v])=>[k.toLowerCase(),typeof v==="number"?Math.round(v*100000)/100000:v])));if(unordered)r.sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)));return r;}
function sameResult(a,b,unordered=false){return JSON.stringify(normalize(a,unordered))===JSON.stringify(normalize(b,unordered));}
function seeded(n){const x=Math.sin(n*12.9898)*43758.5453;return x-Math.floor(x);}
function pick(arr,n){return arr[Math.floor(seeded(n)*arr.length)%arr.length];}
function q(s){return "'"+String(s).replaceAll("'","''")+"'";}

async function init(){
  try{
    SQL=await initSqlJs({locateFile:f=>`https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.14.2/${f}`});
    db=new SQL.Database();buildDB();
    $("#boot").classList.add("hidden");$("#app").classList.remove("hidden");
    $("#homeBtn").addEventListener("click",renderHome);updateHeader();renderHome();
  }catch(e){
    $(".boot-card").innerHTML=`<div class="eyebrow">LOAD ERROR</div><h1>Could not start the SQL engine.</h1><p>${escapeHTML(e.message)}</p><p>Open the game through GitHub Pages or a local web server with internet access.</p>`;
  }
}

function buildDB(){
  db.run(`
    CREATE TABLE users(user_id INTEGER PRIMARY KEY,name TEXT,signup_date TEXT,country TEXT,platform TEXT,acquisition_source TEXT);
    CREATE TABLE courses(course_id INTEGER PRIMARY KEY,course_name TEXT,category TEXT);
    CREATE TABLE enrollments(enrollment_id INTEGER PRIMARY KEY,user_id INTEGER,course_id INTEGER,enrolled_at TEXT,progress_pct INTEGER);
    CREATE TABLE events(event_id INTEGER PRIMARY KEY,user_id INTEGER,event_name TEXT,event_time TEXT,platform TEXT,course_id INTEGER);
    CREATE TABLE experiment_assignments(user_id INTEGER,experiment_name TEXT,variant TEXT,assigned_at TEXT);
  `);
  const names=["Maya","Ade","Jin","Lena","Omar","Nia","Leo","Zara","Noah","Amara","Sofia","Kai","Mina","Theo","Ari","Imani","Luis","Aya","Sam","Tariq"];
  const countries=["US","Nigeria","Canada","Brazil","Mexico","UK"];
  const platforms=["iOS","Android","Web"];
  const sources=["Organic","Search","Creator","Referral","Paid Social"];
  const courses=[[1,"SQL Foundations","Data"],[2,"Product Metrics","Analytics"],[3,"Experiment Design","Analytics"],[4,"UX Research","Product"],[5,"Advanced SQL","Data"]];
  let batch="BEGIN;";courses.forEach(r=>batch+=`INSERT INTO courses VALUES(${r[0]},${q(r[1])},${q(r[2])});`);
  const base=new Date("2026-01-01T00:00:00Z");let eid=1,enid=1;
  for(let i=1;i<=120;i++){
    const day=Math.floor(seeded(i*5)*210);const d=new Date(base.getTime()+day*86400000);const date=d.toISOString().slice(0,10);
    const name=names[(i-1)%names.length]+(i>20?` ${Math.ceil(i/20)}`:"");const country=pick(countries,i*7);const platform=pick(platforms,i*11);const source=pick(sources,i*13);
    batch+=`INSERT INTO users VALUES(${i},${q(name)},${q(date)},${q(country)},${q(platform)},${q(source)});`;
    const nEnroll=Math.floor(seeded(i*17)*4);
    for(let j=0;j<nEnroll;j++){
      const course=1+Math.floor(seeded(i*19+j)*5);const ed=new Date(d.getTime()+(i+j)%16*86400000).toISOString().slice(0,10);const progress=pick([0,10,25,40,55,75,90,100],i*23+j);
      batch+=`INSERT INTO enrollments VALUES(${enid++},${i},${course},${q(ed)},${progress});`;
    }
    const month=d.getUTCMonth()+1;const weakness=(platform==="Android"&&month>=5)?0.2:0;
    const addEvent=(name,offset,course=1)=>{const t=new Date(d.getTime()+offset*86400000+((i*3)%18)*3600000).toISOString().replace("T"," ").slice(0,19);batch+=`INSERT INTO events VALUES(${eid++},${i},${q(name)},${q(t)},${q(platform)},${course});`;};
    if(seeded(i*29)>.08)addEvent("course_view",0,1+i%5);
    if(seeded(i*31)>(.23+weakness))addEvent("lesson_start",1+i%3,1+i%5);
    if(seeded(i*37)>(.44+weakness))addEvent("lesson_complete",2+i%5,1+i%5);
    if(seeded(i*41)>.36)addEvent("app_open",7+i%2);
    if(seeded(i*43)>.58)addEvent("app_open",14+i%3);
    if(i<=100)batch+=`INSERT INTO experiment_assignments VALUES(${i},'onboarding_v2',${q(i%2?"treatment":"control")},'2026-01-15');`;
  }
  batch+="COMMIT;";db.run(batch);
}

function renderHome(){
  currentLesson=null;lastRows=[];
  if(!state.started){renderWelcome();return;}
  const next=current();
  if(!next){renderFinished();return;}
  const ch=CHAPTERS.find(c=>c.id===next.chapter);const lessons=chapterLessons(ch.id);const done=lessons.filter(l=>state.completed[l.id]).length;
  $("#main").innerHTML=`
    <section class="home-grid">
      <div class="card home-main">
        <div class="eyebrow">CURRENT CHAPTER</div>
        <h1>${escapeHTML(ch.name)}</h1>
        <p>${escapeHTML(ch.desc)}</p>
        <div class="tiny-progress"><span style="width:${Math.round(done/lessons.length*100)}%"></span></div>
        <strong>${done}/${lessons.length} tiny lessons complete</strong>
        <div class="home-actions"><button id="continueBtn" class="btn primary" type="button">Continue → ${escapeHTML(next.title)}</button><button id="mapBtn" class="btn soft" type="button">Journey</button></div>
      </div>
      <aside class="card home-side">
        <div><div class="eyebrow">YOUR SQL</div><div class="big">Lv. ${level()}</div><p>${completedCount()} of ${LESSONS.length} lessons complete. You only see what you need right now.</p></div>
        <div><small style="color:var(--muted)">NEXT UNLOCK</small><strong style="display:block;margin-top:4px">${next.chapter<7?"???":"Final analyst screen"}</strong></div>
      </aside>
    </section>
    <section class="card chapter-strip">
      <h3>${escapeHTML(ch.name)}</h3>
      <div class="lesson-dots">${lessons.map(l=>`<span class="dot ${state.completed[l.id]?"done":l.id===next.id?"current":""}" title="${escapeHTML(l.title)}"></span>`).join("")}</div>
      <div class="next-chapter">One question. One concept. One small win. Then next.</div>
    </section>`;
  $("#continueBtn").onclick=()=>openLesson(next.id);$("#mapBtn").onclick=renderJourney;
}

function renderWelcome(){
  $("#main").innerHTML=`<section class="card welcome"><div class="eyebrow">START FROM ZERO</div><h1>You do not need to know SQL.</h1><p>This game will teach you from the first table onward. You will never be asked to use a concept before you have seen it. Early lessons are tiny on purpose.</p><div class="promise"><div><strong>1. See it</strong><small>Watch one tiny example.</small></div><div><strong>2. Change it</strong><small>Edit one piece yourself.</small></div><div><strong>3. Use it</strong><small>Solve a fresh question later.</small></div></div><button id="startBtn" class="btn primary" type="button">Start with lesson 1</button></section>`;
  $("#startBtn").onclick=()=>{state.started=true;save();openLesson("1.1");};
}

function renderJourney(){
  const active=current()?.chapter||7;
  $("#main").innerHTML=`<div class="eyebrow">YOUR JOURNEY</div><div class="map"><h1>SQL grows one piece at a time.</h1>${CHAPTERS.map(ch=>{
    const unlocked=chapterUnlocked(ch.id);const ls=chapterLessons(ch.id);const d=ls.filter(l=>state.completed[l.id]).length;
    return `<section class="card chapter-card ${unlocked?"":"locked"}"><div><div class="eyebrow">${unlocked?escapeHTML(ch.tag):"LOCKED"}</div><h3>${unlocked?escapeHTML(ch.name):"???"}</h3><p>${unlocked?escapeHTML(ch.desc):"Finish the previous chapter to reveal this."}</p></div><div class="chapter-meta"><strong>${unlocked?`${d}/${ls.length}`:"🔒"}</strong><small>${unlocked&&ch.id===active?"current":""}</small></div></section>`;
  }).join("")}</div><div class="home-actions"><button id="backHome" class="btn primary" type="button">Back to current lesson</button>${completedCount()>0?`<button id="resetBtn" class="btn ghost" type="button">Reset progress</button>`:""}</div>`;
  $("#backHome").onclick=renderHome;
  if($("#resetBtn"))$("#resetBtn").onclick=()=>{if(confirm("Erase your DATA EMPIRE progress?")){localStorage.removeItem(SAVE_KEY);state=defaultState();updateHeader();renderHome();}};
}

function sampleTable(table){
  const rows=exec(`SELECT * FROM ${table} LIMIT 6`);if(!rows.length)return "";const cols=Object.keys(rows[0]);
  return `<div class="table-wrap"><table class="data-table"><thead><tr>${cols.map(c=>`<th>${escapeHTML(c)}</th>`).join("")}</tr></thead><tbody>${rows.map(r=>`<tr>${cols.map(c=>`<td>${escapeHTML(r[c])}</td>`).join("")}</tr>`).join("")}</tbody></table></div><div class="table-note">A tiny preview. Your query runs against the full table.</div>`;
}

function modeInstruction(l){
  if(l.mode==="watch")return "This one is demonstrated for you. Read the English, then press Run.";
  if(l.mode==="edit")return "The query is almost right. Change the small part that does not match the mission.";
  if(l.mode==="copy")return "The correct pattern is already visible. Run it, then notice how the result changes.";
  if(l.mode==="guided")return "Finish the incomplete query. The Coach is there whenever you need it.";
  if(l.mode==="recall")return "Memory check: the game is giving you less scaffolding because you have seen these pieces before.";
  if(l.mode==="final")return "This is the bridge to an interview: less scaffolding, but the Coach still exists if you get stuck.";
  return "Try the query.";
}

function openLesson(id){
  const l=LESSONS.find(x=>x.id===id);if(!l)return;currentLesson=l;lastRows=[];
  $("#main").innerHTML=`<section class="lesson-shell">
    <div class="card lesson-head"><div class="eyebrow">LESSON ${l.id} · ${escapeHTML(CHAPTERS.find(c=>c.id===l.chapter).name)}</div><h1>${escapeHTML(l.title)}</h1><p>${escapeHTML(l.objective)}</p><div class="concept"><strong>What this means:</strong> ${escapeHTML(l.concept)}</div></div>
    <div class="learn-grid">
      <section class="card table-card"><div class="mini-label">THE DATA</div><h3>${escapeHTML(l.table)} table</h3>${sampleTable(l.table)}</section>
      <section class="card query-card"><div class="mini-label">THE QUERY</div><div class="english-box"><small>SQL → ENGLISH</small><strong>${escapeHTML(l.english)}</strong></div><div class="fill-help">${escapeHTML(modeInstruction(l))}</div><textarea id="editor" class="sql-editor" spellcheck="false">${escapeHTML(l.starter)}</textarea><div class="query-actions"><button id="runBtn" class="btn primary" type="button">▶ Run</button><button id="coachBtn" class="btn soft" type="button">Coach</button></div></section>
    </div>
    <section id="coachPanel" class="card coach hidden"><h3>Coach</h3><p>Pick how much help you want. Asking for help is part of learning.</p><div class="coach-options"><button class="btn ghost" data-help="nudge" type="button">Nudge me</button><button class="btn ghost" data-help="teach" type="button">Teach me</button><button class="btn ghost" data-help="show" type="button">Show me</button></div><div id="coachMessage"></div></section>
    <section id="resultCard" class="card result-card"><h3>Result</h3><div id="result" class="result-empty">Run the query and the answer will appear here.</div></section>
    <section id="feedback"></section>
  </section>`;
  $("#runBtn").onclick=runLesson;$("#coachBtn").onclick=()=>$("#coachPanel").classList.toggle("hidden");
  $("#coachPanel").querySelectorAll("[data-help]").forEach(b=>b.onclick=()=>coach(b.dataset.help));
  $("#editor").addEventListener("keydown",e=>{if((e.ctrlKey||e.metaKey)&&e.key==="Enter"){e.preventDefault();runLesson();}});
  window.scrollTo(0,0);
}

function coach(type){
  const l=currentLesson;const msg=$("#coachMessage");
  if(type==="nudge"){msg.innerHTML=`<div class="coach-message"><strong>Nudge:</strong> ${escapeHTML(l.nudge||"Read the English translation and compare it line by line with your SQL.")}</div>`;return;}
  if(type==="teach"){state.assisted[l.id]=true;save();msg.innerHTML=`<div class="coach-message"><strong>Teach me:</strong> ${escapeHTML(l.teach||"Break the question into SELECT → FROM → optional filters/grouping/sorting.")}</div>`;return;}
  if(type==="show"){
    state.assisted[l.id]=true;save();$("#editor").value=l.answer+";";msg.innerHTML=`<div class="coach-message"><strong>Shown.</strong> I filled in one correct solution. Run it and read the result. You can continue, but this lesson will be marked <em>learned with help</em> rather than independent.</div>`;
  }
}

function friendlyError(message,sql){
  const m=message.toLowerCase();const s=sql.toLowerCase();
  if(m.includes("syntax error")&&s.includes("select")&&!s.includes(" from "))return "You have SELECT, but SQL also needs FROM to know which table to use.";
  if(m.includes("no such column"))return "SQL cannot find one of those column names. Compare your spelling with the tiny table above.";
  if(m.includes("no such table"))return "SQL cannot find that table. Use the table name shown above the preview.";
  if(m.includes("unrecognized token")||m.includes("incomplete input"))return "The sentence is not quite finished yet. Check quotes, commas, and whether each line has the piece the English sentence describes.";
  if(m.includes("near \"where\""))return "WHERE comes after FROM. Think: show me WHAT → from WHERE → only WHEN.";
  return "SQL is picky about tiny details. Compare your query with the English translation, then change one thing and try again.";
}

function renderRows(rows){
  if(!rows.length)return `<div class="result-empty">The query worked, but it returned 0 rows.</div>`;const cols=Object.keys(rows[0]);
  return `<div class="result-table"><table><thead><tr>${cols.map(c=>`<th>${escapeHTML(c)}</th>`).join("")}</tr></thead><tbody>${rows.slice(0,40).map(r=>`<tr>${cols.map(c=>`<td>${escapeHTML(r[c])}</td>`).join("")}</tr>`).join("")}</tbody></table></div>${rows.length>40?`<div class="table-note">Showing the first 40 of ${rows.length} rows.</div>`:""}`;
}

function runLesson(){
  const l=currentLesson;const sql=$("#editor").value.trim();state.attempts[l.id]=(state.attempts[l.id]||0)+1;save();
  try{
    const rows=exec(sql);lastRows=rows;$("#result").innerHTML=renderRows(rows);const expected=exec(l.answer);
    if(sameResult(rows,expected,!!l.unordered)){
      if(l.finding){askFinding(l);return;}completeLesson(l);
    }else{
      $("#feedback").innerHTML=`<div class="card feedback error"><h3>Not quite yet — but your SQL ran.</h3><p>The result is different from the mission's target. That means your syntax is valid, which is progress. Read the mission again and check what rows/columns it asked for.</p></div>`;
    }
  }catch(e){
    $("#result").innerHTML=`<div class="result-empty">No result yet.</div>`;$("#feedback").innerHTML=`<div class="card feedback error"><h3>Almost — SQL got confused.</h3><p>${escapeHTML(friendlyError(e.message,sql))}</p><div class="assist-note">Real database message: ${escapeHTML(e.message)}</div></div>`;
  }
}

function askFinding(l){
  if($("#findingBox"))return;
  $("#feedback").innerHTML=`<div class="card feedback"><h3>SQL is correct. One last analyst step.</h3><p>In one sentence, what does this result tell you?</p><textarea id="findingBox" class="sql-editor" style="min-height:95px;margin-top:12px" placeholder="Example: Android has the largest user base, so…"></textarea><button id="submitFinding" class="btn primary next" type="button">Submit finding</button></div>`;
  $("#submitFinding").onclick=()=>{const note=$("#findingBox").value.trim();if(note.length<12){toast("Give me one full sentence.");return;}state.notes[l.id]=note;save();completeLesson(l);};
}

function completeLesson(l){
  const first=!state.completed[l.id];const assisted=!!state.assisted[l.id];const award=assisted?Math.max(5,Math.round(l.xp*.55)):l.xp;
  if(first){state.completed[l.id]=true;state.xp+=award;save();}
  const idx=LESSONS.findIndex(x=>x.id===l.id);const next=LESSONS[idx+1];const chapterDone=chapterLessons(l.chapter).every(x=>state.completed[x.id]);
  $("#feedback").innerHTML=`<div class="card feedback success"><h3>✅ You got it.</h3><p>${assisted?"You learned this one with help. That is completely fine—we will ask you to retrieve the idea again later.":"You solved this without the full answer. That is the kind of retrieval that builds real skill."}</p>${first?`<div class="xp-pop" style="margin-top:8px">+${award} XP</div>`:""}${assisted?`<div class="assist-note">Mastery status: LEARNED WITH HELP</div>`:""}<div class="next">${next?`<button id="nextBtn" class="btn primary" type="button">Next tiny lesson →</button>`:`<button id="nextBtn" class="btn primary" type="button">See graduation report</button>`}</div></div>`;
  if(first)toast(`+${award} XP`);
  $("#nextBtn").onclick=()=>{if(!next){renderFinished();return;}if(chapterDone&&next.chapter!==l.chapter){renderUnlock(next.chapter);}else openLesson(next.id);};
}

function renderUnlock(chapterId){
  const ch=CHAPTERS.find(c=>c.id===chapterId);$("#main").innerHTML=`<section class="card unlock"><div class="symbol">${chapterId===5?"🔗":chapterId===6?"📈":chapterId===7?"⚔":"✦"}</div><div class="eyebrow">CHAPTER UNLOCKED</div><h1>${escapeHTML(ch.name)}</h1><p>${escapeHTML(ch.desc)} Notice how the game is only revealing this now that the earlier ideas are familiar.</p><button id="enterChapter" class="btn primary" type="button">Enter chapter ${chapterId}</button></section>`;$("#enterChapter").onclick=()=>openLesson(chapterLessons(chapterId)[0].id);
}

function renderFinished(){
  const assisted=Object.keys(state.assisted).filter(id=>state.completed[id]).length;const independent=completedCount()-assisted;
  const report=`DATA EMPIRE — SQL TRAINING REPORT\n\nSQL Level: ${level()}\nXP: ${state.xp}\nLessons completed: ${completedCount()}/${LESSONS.length}\nIndependent clears: ${independent}\nLessons completed with Coach help: ${assisted}\n\nCURRICULUM COMPLETED\nSELECT / FROM\nWHERE / AND / OR\nORDER BY / LIMIT / DISTINCT\nCOUNT / AVG / GROUP BY\nJOIN / LEFT JOIN / CASE / CTE\nActivation / Funnels / D7 Retention / Cohorts\nWindow functions / Experiment readout\n\nNext step: Ask ChatGPT for a fresh, unseen Product Analyst SQL audit. Do not reuse the TinyCo dataset.`;
  $("#main").innerHTML=`<section class="card unlock"><div class="symbol">🏁</div><div class="eyebrow">CAMPAIGN COMPLETE</div><h1>You learned SQL by using it.</h1><p>The game is not the final proof. The next step is an unseen audit on a fresh dataset so we can test transfer.</p></section><section class="card report"><h3>Graduation report</h3><pre>${escapeHTML(report)}</pre><div class="button-row"><button id="downloadBtn" class="btn primary" type="button">Download report</button><button id="journeyBtn" class="btn soft" type="button">Review journey</button></div></section>`;
  $("#downloadBtn").onclick=()=>{const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([report],{type:"text/plain"}));a.download="data-empire-graduation-report.txt";a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);};$("#journeyBtn").onclick=renderJourney;
}

init();
