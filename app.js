
/* DATA EMPIRE
   Static Product Analyst SQL game. No backend required.
   SQL engine: sql.js (SQLite in WebAssembly).
*/
const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
const SAVE_KEY = "dataEmpireSaveV1";

const SKILLS = ["Foundations","Filtering","Aggregation","Grain","Joins","Case Logic","Date Logic","CTEs","Data Quality","Funnels","Activation","Retention","Cohorts","Window Functions","Experimentation","Product Reasoning"];

const ERAS = [
  {id:1, name:"ERA I — Apprentice Analyst", blurb:"Learn to interrogate a product database."},
  {id:2, name:"ERA II — Product Investigator", blurb:"Combine tables without corrupting the truth."},
  {id:3, name:"ERA III — Product Strategist", blurb:"Diagnose funnels, activation, retention, and cohorts."},
  {id:4, name:"ERA IV — Ranked Analyst", blurb:"Ambiguous prompts. Advanced SQL. Interview pressure."}
];

const SCHEMA = {
  users:"user_id INTEGER PRIMARY KEY, signup_date TEXT, country TEXT, platform TEXT, acquisition_source TEXT",
  courses:"course_id INTEGER PRIMARY KEY, course_name TEXT, category TEXT, difficulty TEXT",
  enrollments:"enrollment_id INTEGER PRIMARY KEY, user_id INTEGER, course_id INTEGER, enrolled_at TEXT, completed_at TEXT, progress_pct INTEGER",
  events:"event_id INTEGER PRIMARY KEY, user_id INTEGER, event_name TEXT, event_time TEXT, platform TEXT, course_id INTEGER, session_id TEXT",
  subscriptions:"subscription_id INTEGER PRIMARY KEY, user_id INTEGER, plan TEXT, started_at TEXT, canceled_at TEXT, monthly_price REAL",
  experiment_assignments:"user_id INTEGER, experiment_name TEXT, variant TEXT, assigned_at TEXT"
};

const MISSIONS = [
{id:"1-1",era:1,title:"First Contact",skills:["Foundations"],xp:80,lesson:"A table is a set of rows. <code>SELECT</code> chooses columns; <code>*</code> means all columns.",objective:"Inspect the users table. Return every column for every user.",starter:"SELECT *\nFROM users\nLIMIT 10;",answer:"SELECT * FROM users",compare:"subset",hints:["Start with SELECT * FROM users.","The semicolon is optional.","Try: SELECT * FROM users;"]},
{id:"1-2",era:1,title:"Signal Filter",skills:["Filtering"],xp:90,lesson:"<code>WHERE</code> filters rows that meet a condition.",objective:"Return user_id, signup_date, and platform for Android users.",starter:"SELECT user_id, signup_date, platform\nFROM users\nWHERE ",answer:"SELECT user_id, signup_date, platform FROM users WHERE platform='Android'",hints:["Filter the platform column.","Text values use quotes.","WHERE platform = 'Android'"]},
{id:"1-3",era:1,title:"Source Map",skills:["Foundations"],xp:90,lesson:"<code>DISTINCT</code> removes duplicate result values.",objective:"List the unique acquisition sources.",starter:"SELECT \nFROM users;",answer:"SELECT DISTINCT acquisition_source FROM users ORDER BY acquisition_source",unordered:true,hints:["You only need one column.","You need unique values, not every row.","SELECT DISTINCT acquisition_source FROM users"]},
{id:"1-4",era:1,title:"Newest Recruits",skills:["Filtering"],xp:100,lesson:"<code>ORDER BY</code> sorts results; <code>LIMIT</code> restricts how many rows return.",objective:"Show the 5 most recent signups: user_id and signup_date.",starter:"SELECT user_id, signup_date\nFROM users\n",answer:"SELECT user_id, signup_date FROM users ORDER BY signup_date DESC, user_id DESC LIMIT 5",hints:["Newest means descending date.","Add ORDER BY signup_date DESC.","Then LIMIT 5."]},
{id:"1-5",era:1,title:"Population Count",skills:["Aggregation"],xp:110,lesson:"Aggregations collapse many rows into a metric. <code>COUNT(*)</code> counts rows.",objective:"How many users exist? Return one number named users.",starter:"SELECT \nFROM users;",answer:"SELECT COUNT(*) AS users FROM users",hints:["COUNT(*) counts table rows.","Alias the result with AS users.","SELECT COUNT(*) AS users FROM users"]},
{id:"1-6",era:1,title:"Recruitment Channels",skills:["Aggregation"],xp:120,lesson:"<code>GROUP BY</code> creates one aggregate result per group.",objective:"Count users by acquisition_source. Return acquisition_source and users, highest count first.",starter:"SELECT acquisition_source,\n       COUNT(*) AS users\nFROM users\n",answer:"SELECT acquisition_source, COUNT(*) AS users FROM users GROUP BY acquisition_source ORDER BY users DESC, acquisition_source",hints:["You need one row per acquisition source.","GROUP BY acquisition_source.","Then ORDER BY users DESC."]},
{id:"1-7",era:1,title:"Strong Markets",skills:["Aggregation"],xp:130,lesson:"<code>HAVING</code> filters groups after aggregation.",objective:"Return countries with at least 25 users and their user counts, highest first.",starter:"SELECT country, COUNT(*) AS users\nFROM users\nGROUP BY country\n",answer:"SELECT country, COUNT(*) AS users FROM users GROUP BY country HAVING COUNT(*) >= 25 ORDER BY users DESC, country",hints:["WHERE filters rows; HAVING filters grouped results.","HAVING COUNT(*) >= 25","Sort by users descending."]},
{id:"1-8",era:1,title:"BOSS — First Brief",skills:["Foundations","Filtering","Aggregation","Product Reasoning"],xp:250,boss:true,objective:"Leadership asks: Which platform has the most users? Return platform and users, highest first. Then explain the finding.",starter:"-- No tutorial. Build the answer.\n",answer:"SELECT platform, COUNT(*) AS users FROM users GROUP BY platform ORDER BY users DESC, platform",needsFinding:true,hints:["Think: one row per platform.","COUNT + GROUP BY.","ORDER BY the count descending."]},

{id:"2-1",era:2,title:"Keys & Grain",skills:["Grain"],xp:130,lesson:"Grain means what one row represents. In <code>enrollments</code>, one row is one course enrollment.",objective:"Count total enrollments and distinct enrolled users. Return enrollments and users.",starter:"SELECT\nFROM enrollments;",answer:"SELECT COUNT(*) AS enrollments, COUNT(DISTINCT user_id) AS users FROM enrollments",hints:["Two metrics can be selected together.","COUNT(*) vs COUNT(DISTINCT user_id).","Alias them enrollments and users."]},
{id:"2-2",era:2,title:"Join the Network",skills:["Joins","Grain"],xp:150,lesson:"A JOIN connects rows through keys. Always ask what happens to the result grain.",objective:"Return each enrollment_id with the user's country. Sort by enrollment_id.",starter:"SELECT e.enrollment_id,\n       u.country\nFROM enrollments e\nJOIN users u\n  ON ",answer:"SELECT e.enrollment_id, u.country FROM enrollments e JOIN users u ON e.user_id=u.user_id ORDER BY e.enrollment_id",hints:["Both tables share user_id.","e.user_id = u.user_id","Add ORDER BY e.enrollment_id."]},
{id:"2-3",era:2,title:"Course Demand",skills:["Joins","Aggregation"],xp:160,lesson:"JOIN before grouping when the dimension you need lives in another table.",objective:"Count enrollments by course_name. Return course_name and enrollments, highest first.",starter:"SELECT c.course_name,\n       COUNT(*) AS enrollments\nFROM enrollments e\nJOIN courses c ON \n",answer:"SELECT c.course_name, COUNT(*) AS enrollments FROM enrollments e JOIN courses c ON e.course_id=c.course_id GROUP BY c.course_name ORDER BY enrollments DESC, c.course_name",hints:["Join on course_id.","Then GROUP BY course_name.","Sort highest enrollment count first."]},
{id:"2-4",era:2,title:"Preserve the Missing",skills:["Joins","Data Quality"],xp:170,lesson:"A <code>LEFT JOIN</code> keeps every row from the left table—even if no match exists.",objective:"Count how many users have never enrolled in any course. Return one number named never_enrolled.",starter:"SELECT COUNT(*) AS never_enrolled\nFROM users u\nLEFT JOIN enrollments e\n  ON u.user_id = e.user_id\nWHERE ",answer:"SELECT COUNT(*) AS never_enrolled FROM users u LEFT JOIN enrollments e ON u.user_id=e.user_id WHERE e.enrollment_id IS NULL",hints:["Unmatched right-side columns become NULL.","Filter where e.enrollment_id IS NULL.","Do not use = NULL; use IS NULL."]},
{id:"2-5",era:2,title:"Segment Engine",skills:["Case Logic","Aggregation"],xp:170,lesson:"<code>CASE WHEN</code> creates derived categories from conditions.",objective:"Bucket enrollments into 'Completed' when progress_pct=100, otherwise 'In Progress'. Count each status.",starter:"SELECT\n  CASE WHEN progress_pct = 100 THEN 'Completed'\n       ELSE 'In Progress' END AS status,\n  COUNT(*) AS enrollments\nFROM enrollments\n",answer:"SELECT CASE WHEN progress_pct=100 THEN 'Completed' ELSE 'In Progress' END AS status, COUNT(*) AS enrollments FROM enrollments GROUP BY status ORDER BY status",unordered:true,hints:["You created status; now group by it.","GROUP BY status is accepted by SQLite.","Count rows per bucket."]},
{id:"2-6",era:2,title:"Time Machine",skills:["Date Logic","Aggregation"],xp:180,lesson:"SQLite's <code>strftime</code> extracts date parts. Product analysis constantly groups behavior over time.",objective:"Count signups by month. Return month in YYYY-MM format and signups, chronological.",starter:"SELECT strftime('%Y-%m', signup_date) AS month,\n       COUNT(*) AS signups\nFROM users\n",answer:"SELECT strftime('%Y-%m', signup_date) AS month, COUNT(*) AS signups FROM users GROUP BY month ORDER BY month",hints:["Group by the derived month.","GROUP BY month","ORDER BY month"]},
{id:"2-7",era:2,title:"Build a CTE",skills:["CTEs","Aggregation"],xp:190,lesson:"A CTE names an intermediate query with <code>WITH</code>. It makes multi-step analysis readable.",objective:"Using a CTE, calculate each user's event count, then return the average events per active user rounded to 2 decimals as avg_events.",starter:"WITH user_events AS (\n  SELECT user_id, COUNT(*) AS events\n  FROM events\n  GROUP BY user_id\n)\nSELECT ",answer:"WITH user_events AS (SELECT user_id, COUNT(*) AS events FROM events GROUP BY user_id) SELECT ROUND(AVG(events),2) AS avg_events FROM user_events",hints:["The CTE already gives one row per active user.","Average the events column.","ROUND(AVG(events), 2) AS avg_events"]},
{id:"2-8",era:2,title:"BOSS — Duplicate Reality",skills:["Joins","Grain","Data Quality","Product Reasoning"],xp:300,boss:true,objective:"Leadership wants average course progress by acquisition source. Return acquisition_source and avg_progress rounded to 1 decimal, highest first. Avoid multiplying enrollments by joining unnecessary event rows.",starter:"-- Think about the grain before you JOIN.\n",answer:"SELECT u.acquisition_source, ROUND(AVG(e.progress_pct),1) AS avg_progress FROM enrollments e JOIN users u ON e.user_id=u.user_id GROUP BY u.acquisition_source ORDER BY avg_progress DESC, u.acquisition_source",needsFinding:true,hints:["The metric lives at enrollment grain.","You only need users + enrollments.","Group by acquisition_source after joining on user_id."]},

{id:"3-1",era:3,title:"Activation Definition",skills:["Activation","Case Logic"],xp:180,lesson:"For this game, a user is activated if they generated a <code>lesson_complete</code> event within 7 days of signup.",objective:"Count distinct activated users. Return activated_users.",starter:"SELECT COUNT(DISTINCT u.user_id) AS activated_users\nFROM users u\nJOIN events e ON u.user_id=e.user_id\nWHERE e.event_name='lesson_complete'\n  AND ",answer:"SELECT COUNT(DISTINCT u.user_id) AS activated_users FROM users u JOIN events e ON u.user_id=e.user_id WHERE e.event_name='lesson_complete' AND julianday(e.event_time)-julianday(u.signup_date) BETWEEN 0 AND 7",hints:["Compare event_time with signup_date.","SQLite julianday(date1)-julianday(date2) returns day difference.","Keep differences BETWEEN 0 AND 7."]},
{id:"3-2",era:3,title:"Activation Rate",skills:["Activation","CTEs"],xp:210,lesson:"Rates require a numerator and denominator. Be explicit about both.",objective:"Return activation_rate_pct for all users, rounded to 1 decimal.",starter:"WITH activated AS (\n  SELECT DISTINCT u.user_id\n  FROM users u\n  JOIN events e ON u.user_id=e.user_id\n  WHERE e.event_name='lesson_complete'\n    AND julianday(e.event_time)-julianday(u.signup_date) BETWEEN 0 AND 7\n)\nSELECT ",answer:"WITH activated AS (SELECT DISTINCT u.user_id FROM users u JOIN events e ON u.user_id=e.user_id WHERE e.event_name='lesson_complete' AND julianday(e.event_time)-julianday(u.signup_date) BETWEEN 0 AND 7) SELECT ROUND(100.0*COUNT(a.user_id)/COUNT(*),1) AS activation_rate_pct FROM users u LEFT JOIN activated a ON u.user_id=a.user_id",hints:["LEFT JOIN activated back to all users.","Numerator: COUNT(a.user_id). Denominator: COUNT(*).","Multiply by 100.0 before division."]},
{id:"3-3",era:3,title:"Funnel — Start to Finish",skills:["Funnels","Aggregation"],xp:210,lesson:"Funnels count distinct entities reaching each step. Never blindly count event rows.",objective:"Return distinct users who did course_view, lesson_start, and lesson_complete as three columns: viewers, starters, completers.",starter:"SELECT\n",answer:"SELECT COUNT(DISTINCT CASE WHEN event_name='course_view' THEN user_id END) AS viewers, COUNT(DISTINCT CASE WHEN event_name='lesson_start' THEN user_id END) AS starters, COUNT(DISTINCT CASE WHEN event_name='lesson_complete' THEN user_id END) AS completers FROM events",hints:["Conditional aggregation works well here.","COUNT(DISTINCT CASE WHEN ... THEN user_id END)","Repeat that pattern for all three event names."]},
{id:"3-4",era:3,title:"Where They Fall",skills:["Funnels","Product Reasoning"],xp:230,objective:"Calculate viewer_to_start_pct and start_to_complete_pct, each rounded to 1 decimal.",starter:"WITH funnel AS (\n  SELECT\n    COUNT(DISTINCT CASE WHEN event_name='course_view' THEN user_id END) AS viewers,\n    COUNT(DISTINCT CASE WHEN event_name='lesson_start' THEN user_id END) AS starters,\n    COUNT(DISTINCT CASE WHEN event_name='lesson_complete' THEN user_id END) AS completers\n  FROM events\n)\nSELECT ",answer:"WITH funnel AS (SELECT COUNT(DISTINCT CASE WHEN event_name='course_view' THEN user_id END) AS viewers, COUNT(DISTINCT CASE WHEN event_name='lesson_start' THEN user_id END) AS starters, COUNT(DISTINCT CASE WHEN event_name='lesson_complete' THEN user_id END) AS completers FROM events) SELECT ROUND(100.0*starters/viewers,1) AS viewer_to_start_pct, ROUND(100.0*completers/starters,1) AS start_to_complete_pct FROM funnel",hints:["Use the three counts in the CTE.","100.0 * starters / viewers","100.0 * completers / starters"]},
{id:"3-5",era:3,title:"D7 Retention",skills:["Retention","Date Logic"],xp:240,lesson:"D7 retention asks whether a new user returned around day 7 after signup. Here we use days 7–8.",objective:"Return d7_retention_pct: percent of all users with any event 7–8 days after signup, rounded to 1 decimal.",starter:"WITH retained AS (\n  SELECT DISTINCT u.user_id\n  FROM users u\n  JOIN events e ON u.user_id=e.user_id\n  WHERE ",answer:"WITH retained AS (SELECT DISTINCT u.user_id FROM users u JOIN events e ON u.user_id=e.user_id WHERE julianday(e.event_time)-julianday(u.signup_date) BETWEEN 7 AND 8) SELECT ROUND(100.0*COUNT(r.user_id)/COUNT(*),1) AS d7_retention_pct FROM users u LEFT JOIN retained r ON u.user_id=r.user_id",hints:["Find users with event day difference 7–8.","Then LEFT JOIN retained to all users.","COUNT(retained)/COUNT(all users)."]},
{id:"3-6",era:3,title:"Cohort Lens",skills:["Cohorts","Retention"],xp:260,lesson:"Cohorts compare users who started in the same time period.",objective:"Return signup_month and d7_retention_pct by signup month, rounded to 1 decimal, chronological.",starter:"WITH retained AS (\n  SELECT DISTINCT u.user_id\n  FROM users u JOIN events e ON u.user_id=e.user_id\n  WHERE julianday(e.event_time)-julianday(u.signup_date) BETWEEN 7 AND 8\n)\nSELECT ",answer:"WITH retained AS (SELECT DISTINCT u.user_id FROM users u JOIN events e ON u.user_id=e.user_id WHERE julianday(e.event_time)-julianday(u.signup_date) BETWEEN 7 AND 8) SELECT strftime('%Y-%m',u.signup_date) AS signup_month, ROUND(100.0*COUNT(r.user_id)/COUNT(*),1) AS d7_retention_pct FROM users u LEFT JOIN retained r ON u.user_id=r.user_id GROUP BY signup_month ORDER BY signup_month",hints:["Create signup_month with strftime.","Group after LEFT JOINing retained users.","Use the same numerator/denominator logic per group."]},
{id:"3-7",era:3,title:"Segment Diagnosis",skills:["Activation","Product Reasoning","Aggregation"],xp:270,objective:"Return activation rate by platform, rounded to 1 decimal, highest first. Columns: platform, activation_rate_pct.",starter:"WITH activated AS (\n  SELECT DISTINCT u.user_id\n  FROM users u JOIN events e ON u.user_id=e.user_id\n  WHERE e.event_name='lesson_complete'\n    AND julianday(e.event_time)-julianday(u.signup_date) BETWEEN 0 AND 7\n)\nSELECT ",answer:"WITH activated AS (SELECT DISTINCT u.user_id FROM users u JOIN events e ON u.user_id=e.user_id WHERE e.event_name='lesson_complete' AND julianday(e.event_time)-julianday(u.signup_date) BETWEEN 0 AND 7) SELECT u.platform, ROUND(100.0*COUNT(a.user_id)/COUNT(*),1) AS activation_rate_pct FROM users u LEFT JOIN activated a ON u.user_id=a.user_id GROUP BY u.platform ORDER BY activation_rate_pct DESC, u.platform",hints:["LEFT JOIN activated to users.","Group by platform.","Compute the rate within each platform group."]},
{id:"3-8",era:3,title:"BOSS — Retention Collapse",skills:["Retention","Cohorts","Product Reasoning","Date Logic"],xp:350,boss:true,objective:"Investigate D7 retention by signup month AND platform. Return signup_month, platform, users, d7_retention_pct; sort by month then platform. Explain the most important pattern you see.",starter:"-- You know the pieces. Build the investigation.\n",answer:"WITH retained AS (SELECT DISTINCT u.user_id FROM users u JOIN events e ON u.user_id=e.user_id WHERE julianday(e.event_time)-julianday(u.signup_date) BETWEEN 7 AND 8) SELECT strftime('%Y-%m',u.signup_date) AS signup_month, u.platform, COUNT(*) AS users, ROUND(100.0*COUNT(r.user_id)/COUNT(*),1) AS d7_retention_pct FROM users u LEFT JOIN retained r ON u.user_id=r.user_id GROUP BY signup_month,u.platform ORDER BY signup_month,u.platform",needsFinding:true,hints:["Build the retained-user CTE first.","LEFT JOIN it to users, then group by month + platform.","Return both cohort size and retention rate."]},

{id:"4-1",era:4,title:"First Event",skills:["Window Functions"],xp:250,lesson:"Window functions calculate across related rows without collapsing them. <code>ROW_NUMBER()</code> can find each user's first event.",objective:"Return one row per user who has events: user_id, first_event_name, first_event_time.",starter:"WITH ranked AS (\n  SELECT user_id, event_name, event_time,\n         ROW_NUMBER() OVER (\n           PARTITION BY user_id ORDER BY event_time, event_id\n         ) AS rn\n  FROM events\n)\nSELECT ",answer:"WITH ranked AS (SELECT user_id,event_name,event_time,ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY event_time,event_id) AS rn FROM events) SELECT user_id,event_name AS first_event_name,event_time AS first_event_time FROM ranked WHERE rn=1 ORDER BY user_id",hints:["The CTE ranks events per user.","Keep rn = 1.","Alias event_name and event_time as requested."]},
{id:"4-2",era:4,title:"Previous Behavior",skills:["Window Functions"],xp:270,lesson:"<code>LAG</code> reads a prior row within an ordered window.",objective:"For user_id 1, return event_time, event_name, and previous_event using LAG(event_name), chronological.",starter:"SELECT event_time, event_name,\n       LAG(event_name) OVER (\n         PARTITION BY user_id ORDER BY event_time, event_id\n       ) AS previous_event\nFROM events\nWHERE ",answer:"SELECT event_time,event_name,LAG(event_name) OVER (PARTITION BY user_id ORDER BY event_time,event_id) AS previous_event FROM events WHERE user_id=1 ORDER BY event_time,event_id",hints:["Filter to user_id = 1.","The LAG expression is already built.","Order the final output chronologically."]},
{id:"4-3",era:4,title:"Top Courses per Category",skills:["Window Functions","Aggregation"],xp:300,objective:"Find the most-enrolled course in each category. Return category, course_name, enrollments.",starter:"WITH demand AS (\n  SELECT c.category, c.course_name, COUNT(*) AS enrollments\n  FROM enrollments e JOIN courses c ON e.course_id=c.course_id\n  GROUP BY c.category,c.course_name\n), ranked AS (\n  SELECT *, ROW_NUMBER() OVER (\n    PARTITION BY category ORDER BY enrollments DESC, course_name\n  ) AS rn\n  FROM demand\n)\nSELECT ",answer:"WITH demand AS (SELECT c.category,c.course_name,COUNT(*) AS enrollments FROM enrollments e JOIN courses c ON e.course_id=c.course_id GROUP BY c.category,c.course_name), ranked AS (SELECT *,ROW_NUMBER() OVER (PARTITION BY category ORDER BY enrollments DESC,course_name) AS rn FROM demand) SELECT category,course_name,enrollments FROM ranked WHERE rn=1 ORDER BY category",hints:["The hard work is already in the CTEs.","Filter ranked rows to rn=1.","Return only the three requested columns."]},
{id:"4-4",era:4,title:"Experiment Readout",skills:["Experimentation","Product Reasoning"],xp:320,lesson:"An experiment comparison is descriptive until uncertainty and design quality are considered. Start by calculating clean variant metrics.",objective:"For experiment 'onboarding_v2', calculate activation rate by variant. Return variant, users, activation_rate_pct.",starter:"WITH activated AS (\n  SELECT DISTINCT u.user_id\n  FROM users u JOIN events e ON u.user_id=e.user_id\n  WHERE e.event_name='lesson_complete'\n    AND julianday(e.event_time)-julianday(u.signup_date) BETWEEN 0 AND 7\n)\nSELECT ",answer:"WITH activated AS (SELECT DISTINCT u.user_id FROM users u JOIN events e ON u.user_id=e.user_id WHERE e.event_name='lesson_complete' AND julianday(e.event_time)-julianday(u.signup_date) BETWEEN 0 AND 7) SELECT x.variant,COUNT(*) AS users,ROUND(100.0*COUNT(a.user_id)/COUNT(*),1) AS activation_rate_pct FROM experiment_assignments x LEFT JOIN activated a ON x.user_id=a.user_id WHERE x.experiment_name='onboarding_v2' GROUP BY x.variant ORDER BY x.variant",hints:["Assignments are your denominator.","LEFT JOIN activated users to assignments.","Filter experiment_name, group by variant."]},
{id:"4-5",era:4,title:"Revenue Reality",skills:["Date Logic","Joins","Product Reasoning"],xp:320,objective:"Calculate monthly recurring revenue from active subscriptions as of 2026-06-30. Return mrr rounded to 2 decimals. A subscription is active if started by the date and not canceled before it.",starter:"SELECT ",answer:"SELECT ROUND(SUM(monthly_price),2) AS mrr FROM subscriptions WHERE started_at <= '2026-06-30' AND (canceled_at IS NULL OR canceled_at > '2026-06-30')",hints:["You only need subscriptions.","Filter started_at first.","Then canceled_at IS NULL OR canceled_at > the snapshot date."]},
{id:"4-6",era:4,title:"Data Quality Audit",skills:["Data Quality","Joins","Grain"],xp:330,objective:"Find event rows whose user_id does not exist in users. Return orphan_events.",starter:"SELECT COUNT(*) AS orphan_events\nFROM events e\nLEFT JOIN users u ON e.user_id=u.user_id\nWHERE ",answer:"SELECT COUNT(*) AS orphan_events FROM events e LEFT JOIN users u ON e.user_id=u.user_id WHERE u.user_id IS NULL",hints:["A LEFT JOIN preserves all events.","Missing user matches produce NULL user columns.","Filter WHERE u.user_id IS NULL."]},
{id:"4-7",era:4,title:"Interview Drill",skills:["Activation","Retention","Product Reasoning","CTEs"],xp:380,objective:"Return acquisition_source, users, activation_rate_pct, and d7_retention_pct for every acquisition source, highest user count first.",starter:"-- No scaffolding. Define both behaviors cleanly.\n",answer:"WITH activated AS (SELECT DISTINCT u.user_id FROM users u JOIN events e ON u.user_id=e.user_id WHERE e.event_name='lesson_complete' AND julianday(e.event_time)-julianday(u.signup_date) BETWEEN 0 AND 7), retained AS (SELECT DISTINCT u.user_id FROM users u JOIN events e ON u.user_id=e.user_id WHERE julianday(e.event_time)-julianday(u.signup_date) BETWEEN 7 AND 8) SELECT u.acquisition_source,COUNT(*) AS users,ROUND(100.0*COUNT(a.user_id)/COUNT(*),1) AS activation_rate_pct,ROUND(100.0*COUNT(r.user_id)/COUNT(*),1) AS d7_retention_pct FROM users u LEFT JOIN activated a ON u.user_id=a.user_id LEFT JOIN retained r ON u.user_id=r.user_id GROUP BY u.acquisition_source ORDER BY users DESC,u.acquisition_source",hints:["Create activated and retained CTEs.","LEFT JOIN both to users.","Group by acquisition_source and compute both rates."]},
{id:"4-8",era:4,title:"FINAL BOSS — The Board",skills:["Window Functions","Activation","Retention","Cohorts","Product Reasoning"],xp:500,boss:true,final:true,objective:"Board review: return signup_month, users, activation_rate_pct, d7_retention_pct for every signup cohort. Then write a concise recommendation AND one limitation. No hints until three failed runs.",starter:"-- Final technical screen.\n-- Build the query from first principles.\n",answer:"WITH activated AS (SELECT DISTINCT u.user_id FROM users u JOIN events e ON u.user_id=e.user_id WHERE e.event_name='lesson_complete' AND julianday(e.event_time)-julianday(u.signup_date) BETWEEN 0 AND 7), retained AS (SELECT DISTINCT u.user_id FROM users u JOIN events e ON u.user_id=e.user_id WHERE julianday(e.event_time)-julianday(u.signup_date) BETWEEN 7 AND 8) SELECT strftime('%Y-%m',u.signup_date) AS signup_month,COUNT(*) AS users,ROUND(100.0*COUNT(a.user_id)/COUNT(*),1) AS activation_rate_pct,ROUND(100.0*COUNT(r.user_id)/COUNT(*),1) AS d7_retention_pct FROM users u LEFT JOIN activated a ON u.user_id=a.user_id LEFT JOIN retained r ON u.user_id=r.user_id GROUP BY signup_month ORDER BY signup_month",needsFinding:true,hints:["Define activated users.","Define D7-retained users.","Join both flags to all users and group by signup month."]}
];

const TACTICS = [
["Unique platforms","List unique platforms alphabetically.","SELECT DISTINCT platform FROM users ORDER BY platform","Foundations",1],
["US users","Count users in the US as users.","SELECT COUNT(*) AS users FROM users WHERE country='US'","Filtering",1],
["Average progress","Return avg_progress rounded to 1 decimal.","SELECT ROUND(AVG(progress_pct),1) AS avg_progress FROM enrollments","Aggregation",1],
["Completed enrollments","Count enrollments with progress_pct=100 as completed.","SELECT COUNT(*) AS completed FROM enrollments WHERE progress_pct=100","Filtering",1],
["Events per user","Return user_id and events for each active user, highest first.","SELECT user_id,COUNT(*) AS events FROM events GROUP BY user_id ORDER BY events DESC,user_id","Aggregation",2],
["Paid plans","Count subscriptions by plan.","SELECT plan,COUNT(*) AS subscriptions FROM subscriptions GROUP BY plan ORDER BY plan","Aggregation",2],
["Never subscribed","Count users with no subscription as never_subscribed.","SELECT COUNT(*) AS never_subscribed FROM users u LEFT JOIN subscriptions s ON u.user_id=s.user_id WHERE s.user_id IS NULL","Joins",2],
["Course completion","Return course_name and completed enrollments for progress_pct=100.","SELECT c.course_name,COUNT(*) AS completed FROM enrollments e JOIN courses c ON e.course_id=c.course_id WHERE e.progress_pct=100 GROUP BY c.course_name ORDER BY completed DESC,c.course_name","Joins",2],
["Monthly events","Count events by YYYY-MM month.","SELECT strftime('%Y-%m',event_time) AS month,COUNT(*) AS events FROM events GROUP BY month ORDER BY month","Date Logic",2],
["iOS activation","Count distinct iOS users activated within 7 days as activated_users.","SELECT COUNT(DISTINCT u.user_id) AS activated_users FROM users u JOIN events e ON u.user_id=e.user_id WHERE u.platform='iOS' AND e.event_name='lesson_complete' AND julianday(e.event_time)-julianday(u.signup_date) BETWEEN 0 AND 7","Activation",3],
["First signup","Return earliest signup_date as first_signup.","SELECT MIN(signup_date) AS first_signup FROM users","Aggregation",1],
["High progress","Count enrollments with progress_pct >= 75 as high_progress.","SELECT COUNT(*) AS high_progress FROM enrollments WHERE progress_pct>=75","Filtering",1],
["Revenue by plan","Return plan and monthly_price total as mrr by plan.","SELECT plan,ROUND(SUM(monthly_price),2) AS mrr FROM subscriptions GROUP BY plan ORDER BY plan","Aggregation",2],
["Eventless users","Count users who have no events as eventless_users.","SELECT COUNT(*) AS eventless_users FROM users u LEFT JOIN events e ON u.user_id=e.user_id WHERE e.event_id IS NULL","Joins",3],
["First event with window","Return user_id and first_event_time using ROW_NUMBER; one row per active user.","WITH r AS (SELECT user_id,event_time,ROW_NUMBER() OVER(PARTITION BY user_id ORDER BY event_time,event_id) rn FROM events) SELECT user_id,event_time AS first_event_time FROM r WHERE rn=1 ORDER BY user_id","Window Functions",4],
["Variant size","For onboarding_v2 return variant and users assigned.","SELECT variant,COUNT(*) AS users FROM experiment_assignments WHERE experiment_name='onboarding_v2' GROUP BY variant ORDER BY variant","Experimentation",2]
].map((x,i)=>({id:`T${i+1}`,title:x[0],objective:x[1],answer:x[2],skill:x[3],difficulty:x[4],xp:40+x[4]*15}));

let SQL, db;
let state = loadState();
let currentView = "dashboard";
let currentMission = null;
let hintIndex = 0;
let rankedTimer = null;
let rankedSeconds = 0;

function defaultState(){
  return {xp:0,completed:{},hints:{},attempts:{},skillXP:{},tactics:{},rankedWins:0,rankedAttempts:0,findings:{},lastPlayed:null,streak:0};
}
function loadState(){try{return {...defaultState(),...JSON.parse(localStorage.getItem(SAVE_KEY)||"{}")}}catch{return defaultState()}}
function save(){localStorage.setItem(SAVE_KEY,JSON.stringify(state)); updateHeader();}
function toast(msg){const t=$("#toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2200)}
function rank(){
  const x=state.xp;
  const ranks=[[0,"IRON IV"],[700,"IRON III"],[1400,"IRON II"],[2200,"IRON I"],[3100,"BRONZE IV"],[4200,"BRONZE III"],[5500,"BRONZE II"],[7000,"BRONZE I"],[8700,"SILVER IV"],[10600,"SILVER III"],[12700,"SILVER II"],[15000,"SILVER I"],[17600,"GOLD IV"],[20500,"GOLD III"],[23800,"GOLD II"],[27500,"GOLD I"]];
  return [...ranks].reverse().find(r=>x>=r[0])?.[1]||"IRON IV";
}
function updateHeader(){
  $("#xpLabel").textContent=state.xp.toLocaleString();
  $("#rankLabel").textContent=rank();
  $("#streakLabel").textContent=state.streak||0;
}
function updateStreak(){
  const today=new Date().toISOString().slice(0,10);
  if(state.lastPlayed===today)return;
  if(state.lastPlayed){
    const d=(new Date(today)-new Date(state.lastPlayed))/86400000;
    state.streak=d===1?(state.streak||0)+1:1;
  }else state.streak=1;
  state.lastPlayed=today; save();
}
function seeded(n){let x=Math.sin(n*999)*43758.5453;return x-Math.floor(x)}
function pick(arr,n){return arr[Math.floor(seeded(n)*arr.length)%arr.length]}
function esc(v){return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m]))}
function sqlQuote(s){return "'"+String(s).replaceAll("'","''")+"'"}

async function init(){
  try{
    SQL=await initSqlJs({locateFile:f=>`https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.14.2/${f}`});
    db=new SQL.Database();
    buildDatabase();
    $("#boot").classList.add("hidden"); $("#app").classList.remove("hidden");
    bindChrome(); updateStreak(); navigate("dashboard");
  }catch(e){
    $(".boot-card").innerHTML=`<div class="eyebrow">LOAD ERROR</div><h1>Could not start SQLite.</h1><p>${esc(e.message)}</p><p class="muted">Open this site through GitHub Pages or a local web server with internet access so the sql.js WebAssembly file can load.</p>`;
  }
}

function buildDatabase(){
  db.run(`
    CREATE TABLE users (${SCHEMA.users});
    CREATE TABLE courses (${SCHEMA.courses});
    CREATE TABLE enrollments (${SCHEMA.enrollments});
    CREATE TABLE events (${SCHEMA.events});
    CREATE TABLE subscriptions (${SCHEMA.subscriptions});
    CREATE TABLE experiment_assignments (${SCHEMA.experiment_assignments});
  `);
  const countries=["US","Nigeria","UK","Canada","Brazil","Mexico"];
  const platforms=["iOS","Android","Web"];
  const sources=["Organic","Search","Creator","Referral","Paid Social"];
  const courseRows=[
    [1,"SQL Foundations","Data","Beginner"],[2,"Product Metrics","Analytics","Beginner"],
    [3,"Experiment Design","Analytics","Intermediate"],[4,"UX Research","Product","Intermediate"],
    [5,"Advanced SQL","Data","Advanced"],[6,"Product Strategy","Product","Advanced"]
  ];
  let q="BEGIN;";
  courseRows.forEach(r=>q+=`INSERT INTO courses VALUES(${r.map(v=>typeof v==="number"?v:sqlQuote(v)).join(",")});`);
  const users=[];
  const base=new Date("2026-01-01T00:00:00Z");
  for(let i=1;i<=360;i++){
    const day=Math.floor(seeded(i*2)*210);
    const dt=new Date(base.getTime()+day*86400000);
    const date=dt.toISOString().slice(0,10);
    const platform=pick(platforms,i*3);
    const country=pick(countries,i*5);
    const source=pick(sources,i*7);
    users.push({id:i,date,platform,country,source});
    q+=`INSERT INTO users VALUES(${i},${sqlQuote(date)},${sqlQuote(country)},${sqlQuote(platform)},${sqlQuote(source)});`;
  }
  let enr=1, ev=1, sub=1;
  users.forEach(u=>{
    const enrollN=Math.floor(seeded(u.id*11)*4);
    for(let j=0;j<enrollN;j++){
      const cid=1+Math.floor(seeded(u.id*17+j)*6);
      const ed=new Date(u.date+"T00:00:00Z"); ed.setUTCDate(ed.getUTCDate()+Math.floor(seeded(u.id*23+j)*20));
      const progressOpts=[0,10,25,40,55,75,90,100];
      let progress=pick(progressOpts,u.id*31+j);
      const completed=progress===100?new Date(ed.getTime()+(3+Math.floor(seeded(u.id*37+j)*20))*86400000).toISOString().slice(0,10):null;
      q+=`INSERT INTO enrollments VALUES(${enr++},${u.id},${cid},${sqlQuote(ed.toISOString().slice(0,10))},${completed?sqlQuote(completed):"NULL"},${progress});`;
    }
    // event behavior: Android cohorts after May intentionally weaker to create discoverable pattern
    const signup=new Date(u.date+"T00:00:00Z");
    const month=signup.getUTCMonth()+1;
    const weakness=(u.platform==="Android" && month>=5)?0.18:0;
    const view=seeded(u.id*41)>.08;
    const start=seeded(u.id*43)>(.24+weakness);
    const complete=seeded(u.id*47)>(.46+weakness);
    const addEv=(name,day,cid=null)=>{
      const d=new Date(signup.getTime()+day*86400000+Math.floor(seeded(u.id*53+ev)*18)*3600000);
      q+=`INSERT INTO events VALUES(${ev++},${u.id},${sqlQuote(name)},${sqlQuote(d.toISOString().replace("T"," ").slice(0,19))},${sqlQuote(u.platform)},${cid??"NULL"},${sqlQuote("s"+u.id+"_"+day)});`;
    };
    if(view)addEv("course_view",0,1+u.id%6);
    if(start)addEv("lesson_start",1+u.id%3,1+u.id%6);
    if(complete)addEv("lesson_complete",2+u.id%5,1+u.id%6);
    if(seeded(u.id*59)>.38)addEv("app_open",7+(u.id%2));
    if(seeded(u.id*61)>.55)addEv("app_open",14+(u.id%3));
    const extra=Math.floor(seeded(u.id*67)*5);
    for(let k=0;k<extra;k++)addEv(pick(["course_view","lesson_start","app_open"],u.id*71+k),3+k*2,1+((u.id+k)%6));
    if(seeded(u.id*73)>.55){
      const plan=pick(["Basic","Pro","Team"],u.id*79);
      const price={Basic:9,Pro:19,Team:39}[plan];
      const sd=new Date(signup.getTime()+(2+u.id%12)*86400000).toISOString().slice(0,10);
      let canceled=null;
      if(seeded(u.id*83)>.78){
        const cd=new Date(new Date(sd+"T00:00:00Z").getTime()+(30+u.id%80)*86400000).toISOString().slice(0,10);
        canceled=cd;
      }
      q+=`INSERT INTO subscriptions VALUES(${sub++},${u.id},${sqlQuote(plan)},${sqlQuote(sd)},${canceled?sqlQuote(canceled):"NULL"},${price});`;
    }
    if(u.id<=280){
      q+=`INSERT INTO experiment_assignments VALUES(${u.id},'onboarding_v2',${sqlQuote(u.id%2===0?"control":"treatment")},'2026-01-15');`;
    }
  });
  // one intentional orphan event for data-quality mission
  q+=`INSERT INTO events VALUES(${ev++},9999,'app_open','2026-06-01 10:00:00','Web',NULL,'orphan');`;
  q+="COMMIT;";
  db.run(q);
}

function bindChrome(){
  $$(".nav").forEach(b=>b.onclick=()=>navigate(b.dataset.view));
  $("#brandBtn").onclick=()=>navigate("dashboard");
  $("#menuBtn").onclick=()=>$("#sidebar").classList.toggle("open");
  $("#resetBtn").onclick=()=>{
    if(confirm("Erase all DATA EMPIRE progress on this browser?")){
      localStorage.removeItem(SAVE_KEY); state=defaultState(); updateStreak(); navigate("dashboard"); toast("Save reset.");
    }
  };
}
function navigate(view){
  currentView=view; currentMission=null; stopTimer();
  $$(".nav").forEach(b=>b.classList.toggle("active",b.dataset.view===view));
  $("#sidebar").classList.remove("open");
  ({dashboard:renderDashboard,campaign:renderCampaign,tactics:renderTactics,ranked:renderRanked,skills:renderSkills,report:renderReport}[view]||renderDashboard)();
  window.scrollTo(0,0);
}
function completedCount(){return Object.keys(state.completed).length}
function empireMetrics(){
  const u=exec("SELECT COUNT(*) AS users FROM users")[0]?.users;
  const a=exec(`WITH activated AS (SELECT DISTINCT u.user_id FROM users u JOIN events e ON u.user_id=e.user_id WHERE e.event_name='lesson_complete' AND julianday(e.event_time)-julianday(u.signup_date) BETWEEN 0 AND 7) SELECT ROUND(100.0*COUNT(a.user_id)/COUNT(*),1) v FROM users u LEFT JOIN activated a ON u.user_id=a.user_id`)[0]?.v;
  const r=exec(`WITH retained AS (SELECT DISTINCT u.user_id FROM users u JOIN events e ON u.user_id=e.user_id WHERE julianday(e.event_time)-julianday(u.signup_date) BETWEEN 7 AND 8) SELECT ROUND(100.0*COUNT(r.user_id)/COUNT(*),1) v FROM users u LEFT JOIN retained r ON u.user_id=r.user_id`)[0]?.v;
  const m=exec(`SELECT ROUND(SUM(monthly_price),0) m FROM subscriptions WHERE started_at<='2026-06-30' AND (canceled_at IS NULL OR canceled_at>'2026-06-30')`)[0]?.m;
  return {u,a,r,m};
}
function renderDashboard(){
  const m=empireMetrics(), c=completedCount(), unlockActivation=!!state.completed["3-2"], unlockRetention=!!state.completed["3-5"], unlockMRR=!!state.completed["4-5"];
  const next=MISSIONS.find(x=>!state.completed[x.id] && missionUnlocked(x));
  $("#main").innerHTML=`
    <section class="hero">
      <div class="card hero-main">
        <div><div class="kicker">Your analytical empire</div><h1>Turn questions into evidence.</h1><p>Every number below becomes visible because you learned how to calculate it. Your goal is not to finish lessons—it is to become independently dangerous with Product Analyst SQL.</p></div>
        <div class="button-row"><button class="btn primary" id="continueBtn">${next?"Continue campaign":"Review campaign"}</button><button class="btn" id="tacticBtn">Daily tactic</button></div>
      </div>
      <div class="card hero-side">
        <div class="metric"><small>USERS</small><strong>${m.u}</strong></div>
        <div class="metric"><small>ACTIVATION</small><strong class="${unlockActivation?"":"unknown"}">${unlockActivation?m.a+"%":"???"}</strong></div>
        <div class="metric"><small>D7 RETENTION</small><strong class="${unlockRetention?"":"unknown"}">${unlockRetention?m.r+"%":"???"}</strong></div>
        <div class="metric"><small>MRR</small><strong class="${unlockMRR?"":"unknown"}">${unlockMRR?"$"+m.m:"???"}</strong></div>
      </div>
    </section>
    <section class="grid-3">
      <div class="card panel"><div class="kicker">Campaign</div><h2>${c}/${MISSIONS.length} missions</h2><div class="progress"><span style="width:${100*c/MISSIONS.length}%"></span></div><p class="muted">Guided → applied → ambiguous → interview transfer.</p></div>
      <div class="card panel"><div class="kicker">Tactics</div><h2>${Object.keys(state.tactics).length}/${TACTICS.length} solved</h2><div class="progress"><span style="width:${100*Object.keys(state.tactics).length/TACTICS.length}%"></span></div><p class="muted">Short retrieval practice keeps old SQL alive.</p></div>
      <div class="card panel"><div class="kicker">Ranked</div><h2>${state.rankedWins} wins</h2><div class="progress"><span style="width:${Math.min(100,state.rankedWins*20)}%"></span></div><p class="muted">Fresh prompts, no tutorial scaffolding, timed execution.</p></div>
    </section>`;
  $("#continueBtn").onclick=()=>{ if(next) openMission(next.id); else navigate("campaign") };
  $("#tacticBtn").onclick=()=>navigate("tactics");
}
function missionUnlocked(m){
  if(m.id==="1-1")return true;
  const idx=MISSIONS.findIndex(x=>x.id===m.id);
  return idx>0 && !!state.completed[MISSIONS[idx-1].id];
}
function renderCampaign(){
  $("#main").innerHTML=`<div class="kicker">Main campaign</div><h1 class="section-title">Four eras. One analyst.</h1><p class="muted" style="max-width:720px">The game gradually removes scaffolding. Bosses require explanation. The final era deliberately feels more like a technical screen than a tutorial.</p><div id="eras"></div>`;
  $("#eras").innerHTML=ERAS.map(e=>{
    const ms=MISSIONS.filter(m=>m.era===e.id);
    return `<section class="era"><div class="era-head"><div><h2>${e.name}</h2><p>${e.blurb}</p></div><small class="muted">${ms.filter(m=>state.completed[m.id]).length}/${ms.length}</small></div><div class="missions">${ms.map(m=>missionCard(m)).join("")}</div></section>`
  }).join("");
  $$(".mission[data-id]").forEach(b=>b.onclick=()=>openMission(b.dataset.id));
}
function masteryForMission(m){
  if(!state.completed[m.id])return "";
  const hints=state.hints[m.id]||0, attempts=state.attempts[m.id]||1;
  if(hints===0 && (m.boss || attempts<=2)) return "interview";
  if(hints===0)return "proven";
  return "done";
}
function missionCard(m){
  const unlocked=missionUnlocked(m), done=!!state.completed[m.id], level=masteryForMission(m);
  return `<button class="mission ${level}" data-id="${m.id}" ${unlocked?"":"disabled"}><span class="num">${m.id}</span><strong>${esc(m.title)}</strong><small>${esc(m.objective.slice(0,95))}${m.objective.length>95?"…":""}</small><span class="badge ${m.boss?"boss":""} ${done?"complete":""}">${done?(level==="interview"?"interview ready":level==="proven"?"proven":"learned"):(m.boss?"boss":m.xp+" xp")}</span></button>`;
}
function openMission(id, opts={}){
  const m=MISSIONS.find(x=>x.id===id) || TACTICS.find(x=>x.id===id);
  if(!m)return;
  currentMission=m; hintIndex=0;
  renderWorkspace(m,opts);
}
function schemaHTML(){
  return Object.entries(SCHEMA).map(([t,cols])=>`<details><summary>${t}</summary><code>${cols.replaceAll(", ","\n")}</code></details>`).join("");
}
function renderWorkspace(m,opts={}){
  const isTactic=m.id.startsWith("T");
  const noHints=opts.ranked||false;
  $("#main").innerHTML=`
    <div class="workspace">
      <div>
        <section class="card mission-brief">
          <div class="kicker">${opts.ranked?"RANKED ANALYSIS":isTactic?"SQL TACTIC":`MISSION ${m.id}`}</div>
          <h1>${esc(m.title)}</h1>
          <p class="objective">${esc(m.objective)}</p>
          ${m.lesson?`<div class="lesson">${m.lesson}</div>`:""}
          ${opts.ranked?`<div class="timer" id="timer">15:00</div>`:""}
          ${m.needsFinding?`<label class="muted" style="display:block;margin-top:16px">Analyst note / finding</label><textarea id="finding" class="finding-box" placeholder="What did you find? What would you recommend? What is one limitation?">${esc(state.findings[m.id]||"")}</textarea>`:""}
        </section>
        <section class="card editor-card">
          <div class="editor-top"><strong>SQL CONSOLE</strong><small>SQLite • real execution</small></div>
          <textarea id="sqlEditor" class="sql" spellcheck="false">${esc(m.starter||"-- Write SQL here\n")}</textarea>
          <div class="editor-actions"><div class="button-row"><button id="runBtn" class="btn primary">Run query ⌘↵</button>${!noHints?`<button id="hintBtn" class="btn ghost">Hint</button>`:""}</div><button id="backBtn" class="btn ghost">Exit</button></div>
        </section>
        <div id="feedback"></div>
      </div>
      <aside class="card result-card">
        <div class="result-head"><strong>RESULTS</strong><span id="resultStatus" class="result-status">Waiting for query</span></div>
        <div id="results"><p class="muted">Run your SQL. The game grades the result, not whether your query text matches one exact solution.</p></div>
        <div class="schema"><h3>Database schema</h3>${schemaHTML()}</div>
      </aside>
    </div>`;
  $("#runBtn").onclick=()=>gradeCurrent(opts);
  $("#backBtn").onclick=()=>navigate(opts.ranked?"ranked":isTactic?"tactics":"campaign");
  if($("#hintBtn"))$("#hintBtn").onclick=()=>showHint(m);
  $("#sqlEditor").addEventListener("keydown",e=>{if((e.metaKey||e.ctrlKey)&&e.key==="Enter"){e.preventDefault();gradeCurrent(opts)}});
  if(opts.ranked)startTimer(opts.seconds||900,()=>rankedFail("Time."));
}
function showHint(m){
  const used=state.hints[m.id]||0;
  if(m.final && (state.attempts[m.id]||0)<3){toast("Final boss: hints unlock after 3 failed runs.");return}
  const hs=m.hints||["Break the question into: grain → tables → filters → aggregation."];
  const h=hs[Math.min(hintIndex,hs.length-1)]; hintIndex++;
  state.hints[m.id]=used+1; save();
  $("#feedback").innerHTML+=`<div class="hint">HINT ${Math.min(hintIndex,hs.length)} — ${esc(h)}</div>`;
}
function exec(sql){
  const out=db.exec(sql);
  if(!out.length)return [];
  const {columns,values}=out[out.length-1];
  return values.map(row=>Object.fromEntries(columns.map((c,i)=>[c,row[i]])));
}
function normalize(rows, unordered=false){
  const clean=rows.map(r=>Object.fromEntries(Object.entries(r).map(([k,v])=>[k.toLowerCase(),typeof v==="number"?Math.round(v*100000)/100000:v])));
  if(unordered)clean.sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)));
  return clean;
}
function subsetEqual(actual,expected){
  if(actual.length<Math.min(10,expected.length))return false;
  const n=Math.min(actual.length,expected.length,10);
  return JSON.stringify(normalize(actual.slice(0,n)))===JSON.stringify(normalize(expected.slice(0,n)));
}
function equalResults(actual, expected, unordered=false, compare="exact"){
  if(compare==="subset") return subsetEqual(actual,expected);
  return JSON.stringify(normalize(actual,unordered))===JSON.stringify(normalize(expected,unordered));
}
function renderTable(rows){
  if(!rows.length)return `<p class="muted">Query returned 0 rows.</p>`;
  const cols=Object.keys(rows[0]);
  return `<table><thead><tr>${cols.map(c=>`<th>${esc(c)}</th>`).join("")}</tr></thead><tbody>${rows.slice(0,100).map(r=>`<tr>${cols.map(c=>`<td>${esc(r[c])}</td>`).join("")}</tr>`).join("")}</tbody></table>${rows.length>100?`<p class="muted">Showing first 100 of ${rows.length} rows.</p>`:""}`;
}
function gradeCurrent(opts={}){
  const m=currentMission, sql=$("#sqlEditor").value.trim();
  state.attempts[m.id]=(state.attempts[m.id]||0)+1; save();
  try{
    const actual=exec(sql); $("#results").innerHTML=renderTable(actual); $("#resultStatus").textContent=`${actual.length} row${actual.length===1?"":"s"}`;
    const expected=exec(m.answer);
    const good=equalResults(actual,expected,!!m.unordered,m.compare||"exact");
    const findingGood=!m.needsFinding || ($("#finding")?.value.trim().length>=20);
    if(good && findingGood){
      completeMission(m,opts);
    }else if(good && !findingGood){
      $("#feedback").innerHTML=`<div class="error">SQL is correct. Now write a brief analyst finding (at least 20 characters) so you practice communicating the result.</div>`;
    }else{
      $("#feedback").innerHTML=`<div class="error">Query ran, but the result does not match the requested answer yet. Check the requested grain, columns, filters, grouping, and sort order.</div>`;
    }
  }catch(e){
    $("#resultStatus").textContent="SQL error"; $("#results").innerHTML=`<div class="error">${esc(e.message)}</div>`;
    $("#feedback").innerHTML=`<div class="error">SQLite could not run that query. Read the error, change one thing, and try again.</div>`;
  }
}
function completeMission(m,opts={}){
  stopTimer();
  if($("#finding"))state.findings[m.id]=$("#finding").value.trim();
  const first=!state.completed[m.id] && !state.tactics[m.id];
  const hintCount=state.hints[m.id]||0;
  let award=m.xp||100;
  if(hintCount===0)award=Math.round(award*1.2);
  if(first){
    if(m.id.startsWith("T"))state.tactics[m.id]=true; else state.completed[m.id]=true;
    state.xp+=award;
    const skills=m.skills||[m.skill].filter(Boolean);
    skills.forEach(s=>state.skillXP[s]=(state.skillXP[s]||0)+award);
    if(opts.ranked){state.rankedWins++; state.rankedAttempts++; state.xp+=100;}
    save();
  }
  $("#feedback").innerHTML=`<div class="success"><strong>ANALYSIS ACCEPTED.</strong><br>${first?`+${award}${opts.ranked?" + 100 ranked bonus":""} XP`:"Already completed — practice still counts."}${hintCount===0?" • Hint-free":` • ${hintCount} hint${hintCount===1?"":"s"} used`}</div>`;
  toast(first?`+${award} XP — ${m.title}`:"Correct again.");
  if(m.id.startsWith("T")) setTimeout(()=>navigate("tactics"),900);
}
function renderTactics(){
  $("#main").innerHTML=`<div class="kicker">Spaced retrieval</div><h1 class="section-title">SQL Tactics</h1><p class="muted">Short, mixed practice. The prompt does not tell you which SQL technique to use.</p><div class="tactic-grid">${TACTICS.map(t=>`<div class="card tactic" data-id="${t.id}"><div class="stars">${"★".repeat(t.difficulty)}${"☆".repeat(4-t.difficulty)}</div><h3>${esc(t.title)}</h3><p class="muted">${esc(t.objective)}</p><span class="badge ${state.tactics[t.id]?"complete":""}">${state.tactics[t.id]?"solved":t.xp+" xp"}</span></div>`).join("")}</div>`;
  $$(".tactic").forEach(x=>x.onclick=()=>openMission(x.dataset.id));
}
function renderRanked(){
  const unlocked=completedCount()>=16;
  $("#main").innerHTML=`<div class="card rank-card ${unlocked?"":"locked"}"><div class="kicker">Interview transfer</div><div class="rank-emblem">⚔</div><h1>${rank()}</h1><p class="muted">${unlocked?"15-minute fresh case. No hints. Same underlying skills, less scaffolding.":"Complete 16 campaign missions to unlock Ranked."}</p><p>${state.rankedWins} wins • ${state.rankedAttempts} attempts</p>${unlocked?`<button id="rankedBtn" class="btn primary">Enter ranked</button>`:""}</div>`;
  if(unlocked)$("#rankedBtn").onclick=()=>startRanked();
}
function startRanked(){
  const pool=MISSIONS.filter(m=>m.era>=3 && !m.final);
  const m=pool[(state.rankedAttempts+state.rankedWins*2)%pool.length];
  state.rankedAttempts++; save();
  openMission(m.id,{ranked:true,seconds:900});
}
function startTimer(sec,onEnd){
  rankedSeconds=sec; stopTimer();
  const tick=()=>{
    const el=$("#timer"); if(!el)return stopTimer();
    const m=Math.floor(rankedSeconds/60),s=rankedSeconds%60;el.textContent=`${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
    if(rankedSeconds<=0){stopTimer();onEnd();return} rankedSeconds--;
  }; tick(); rankedTimer=setInterval(tick,1000);
}
function stopTimer(){if(rankedTimer){clearInterval(rankedTimer);rankedTimer=null}}
function rankedFail(msg){state.rankedAttempts++;save();$("#feedback").innerHTML=`<div class="error">${esc(msg)} Ranked attempt ended. Review the skill, then try again.</div>`}
function skillState(s){
  const xp=state.skillXP[s]||0;
  // mastery also depends on hint-free completions involving skill
  const ms=MISSIONS.filter(m=>(m.skills||[]).includes(s) && state.completed[m.id]);
  const independent=ms.filter(m=>(state.hints[m.id]||0)===0).length;
  const boss=ms.some(m=>m.boss&&(state.hints[m.id]||0)===0);
  if(boss && independent>=2)return ["INTERVIEW READY","state-ready"];
  if(independent>=2)return ["PROVEN","state-proven"];
  if(ms.length)return ["LEARNED","state-learned"];
  return ["UNTRAINED",""];
}
function renderSkills(){
  $("#main").innerHTML=`<div class="kicker">Competency map</div><h1 class="section-title">Skill Mastery</h1><p class="muted">XP shows practice volume. Mastery comes from independent retrieval and boss performance.</p><div class="card panel">${SKILLS.map(s=>{const xp=state.skillXP[s]||0,[label,cls]=skillState(s);return `<div class="skill-row"><strong>${s}</strong><div><div class="progress"><span style="width:${Math.min(100,xp/8)}%"></span></div><small class="muted">${xp} XP</small></div><span class="skill-state ${cls}">${label}</span></div>`}).join("")}</div>`;
}
function graduationText(){
  const statuses=SKILLS.map(s=>`${s.padEnd(22)} ${skillState(s)[0]}`);
  const hintFree=MISSIONS.filter(m=>state.completed[m.id]&&(state.hints[m.id]||0)===0).length;
  const bosses=MISSIONS.filter(m=>m.boss&&state.completed[m.id]).length;
  return `DATA EMPIRE — GRADUATION REPORT
Generated: ${new Date().toLocaleDateString()}

Rank: ${rank()}
Total XP: ${state.xp}
Campaign: ${completedCount()}/${MISSIONS.length}
Tactics: ${Object.keys(state.tactics).length}/${TACTICS.length}
Hint-free campaign clears: ${hintFree}
Bosses passed: ${bosses}/${MISSIONS.filter(m=>m.boss).length}
Ranked wins: ${state.rankedWins}

MASTERY
${statuses.join("\n")}

Interpretation:
LEARNED = completed instruction/practice.
PROVEN = solved multiple relevant problems without hints.
INTERVIEW READY = independent performance plus a hint-free boss involving the skill.

Next step after completion:
Bring this report into ChatGPT and request an unseen Product Analyst SQL audit on a fresh dataset.`;
}
function renderReport(){
  const txt=graduationText();
  $("#main").innerHTML=`<div class="report"><div class="kicker">Portable evidence</div><h1 class="section-title">Graduation Report</h1><p class="muted">This report intentionally distinguishes completion from mastery. Finishing the game is not the final proof—the external audit is.</p><pre id="reportText">${esc(txt)}</pre><div class="button-row"><button id="copyReport" class="btn primary">Copy report</button><button id="downloadReport" class="btn">Download .txt</button></div></div>`;
  $("#copyReport").onclick=async()=>{await navigator.clipboard.writeText(txt);toast("Graduation report copied.")};
  $("#downloadReport").onclick=()=>{const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([txt],{type:"text/plain"}));a.download="data-empire-graduation-report.txt";a.click();URL.revokeObjectURL(a.href)};
}

init();
