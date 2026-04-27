// ══════════════════════════════════════════════════════════════════════════════
// DAITYA LEGION — Bulk Player Seed Script
// Run this in Chrome DevTools Console on ANY page of the site after deployment
// ══════════════════════════════════════════════════════════════════════════════

const PLAYERS = [
  {"external_id":"32875462","name":"Maithani Ashraya","role":"All-Rounder","matches":31,"runs":259,"wickets":25,"catches":0,"run_outs":0,"man_of_the_match":0,"tournaments":0,"titles":[],"image_url":"https://media.cricheroes.in/user_profile/1773989953487_SIDiQAY9uHBr.jpg","is_manual_override":true,"batting":{"average":9.96,"strike_rate":55.34,"high_score":46,"total_runs":259,"innings":30,"fours":22,"sixes":1,"fifties":0,"hundreds":0},"bowling":{"average":0,"five_w":0,"wickets":25,"economy":5.76,"overs":58.4,"best_bowling":"N/A"},"general":{"dob":"2009-01-23","batting_style":"RHB","bowling_style":"Right-arm medium"}},

  {"external_id":"41997128","name":"Bruce Wayne","role":"All-Rounder","matches":30,"runs":424,"wickets":45,"catches":0,"run_outs":1,"man_of_the_match":0,"tournaments":0,"titles":[],"image_url":"https://media.cricheroes.in/user_profile/1761669558975_UIr7mJDB9rfg.jpg","is_manual_override":true,"batting":{"average":15.7,"strike_rate":82.49,"high_score":38,"total_runs":424,"innings":32,"fours":46,"sixes":3,"fifties":0,"hundreds":0},"bowling":{"average":0,"five_w":0,"wickets":45,"economy":4.84,"overs":81.1,"best_bowling":"N/A"},"general":{"dob":"2009-04-03","batting_style":"RHB","bowling_style":"Right-arm fast"}},

  {"external_id":"41232063","name":"Ansh!","role":"All-Rounder","matches":27,"runs":340,"wickets":23,"catches":0,"run_outs":0,"man_of_the_match":0,"tournaments":0,"titles":[],"image_url":"https://media.cricheroes.in/user_profile/1773748052449_nb4VLqwoKdci.jpg","is_manual_override":true,"batting":{"average":14.78,"strike_rate":100.59,"high_score":62,"total_runs":340,"innings":29,"fours":31,"sixes":9,"fifties":0,"hundreds":0},"bowling":{"average":0,"five_w":0,"wickets":23,"economy":5.22,"overs":47.3,"best_bowling":"N/A"},"general":{"dob":"2008-08-08","batting_style":"RHB","bowling_style":"Right-arm medium"}},

  {"external_id":"41646508","name":"Deepak Kothiyal","role":"All-Rounder","matches":26,"runs":127,"wickets":11,"catches":0,"run_outs":0,"man_of_the_match":0,"tournaments":0,"titles":["Classicist"],"image_url":"https://media.cricheroes.in/user_profile/1761692898987_6RaHlFBnpBrv.jpg","is_manual_override":true,"batting":{"average":6.68,"strike_rate":87.59,"high_score":30,"total_runs":127,"innings":19,"fours":12,"sixes":4,"fifties":0,"hundreds":0},"bowling":{"wickets":11,"economy":7.91,"overs":23.5,"average":16.91,"five_w":0,"best_bowling":"3/0"},"general":{"dob":"","batting_style":"RHB","bowling_style":"Right-arm Leg Break"}},

  {"external_id":"27500289","name":"Aaroosh_Pandey.","role":"Wicket-keeper batter","matches":25,"runs":101,"wickets":2,"catches":0,"run_outs":0,"man_of_the_match":0,"tournaments":0,"titles":["Accumulator"],"image_url":"https://media.cricheroes.in/user_profile/1731507100588_uo7ilIqYPTmg.jpg","is_manual_override":true,"batting":{"average":9.18,"strike_rate":64.74,"high_score":31,"total_runs":101,"innings":11,"fours":14,"sixes":1,"fifties":0,"hundreds":0},"bowling":{"wickets":2,"economy":8.13,"overs":8,"average":32.5,"five_w":0,"best_bowling":"2/14"},"general":{"dob":"2012-10-15","batting_style":"RHB","bowling_style":"Right-arm medium"}},

  {"external_id":"41644117","name":"Sagar Pathak","role":"Bowler","matches":22,"runs":22,"wickets":13,"catches":1,"run_outs":0,"man_of_the_match":1,"tournaments":0,"titles":[],"image_url":"https://media.cricheroes.in/user_profile/1761489205550_wlTw31PuOPgo.jpg","is_manual_override":true,"batting":{"average":1.47,"strike_rate":55,"high_score":10,"total_runs":22,"innings":15,"fours":2,"sixes":0,"fifties":0,"hundreds":0},"bowling":{"wickets":13,"economy":8.44,"overs":34.6,"average":22.46,"five_w":0,"best_bowling":"3/9"},"general":{"dob":"2006-07-07","batting_style":"RHB","bowling_style":"Right-arm fast"}},

  {"external_id":"41746818","name":"Aarav","role":"All-Rounder","matches":21,"runs":60,"wickets":7,"catches":0,"run_outs":0,"man_of_the_match":0,"tournaments":0,"titles":["Steady Batter","Aspirant"],"image_url":"https://media.cricheroes.in/default/user_profile.png","is_manual_override":true,"batting":{"average":6,"strike_rate":67.42,"high_score":26,"total_runs":60,"innings":10,"fours":7,"sixes":0,"fifties":0,"hundreds":0},"bowling":{"wickets":7,"economy":7.58,"overs":13.2,"average":14.29,"five_w":0,"best_bowling":"3/8"},"general":{"dob":"","batting_style":"RHB","bowling_style":"Left-arm fast"}},

  {"external_id":"24544263","name":"Anuj Negi","role":"All-Rounder","matches":16,"runs":160,"wickets":1,"catches":0,"run_outs":0,"man_of_the_match":0,"tournaments":0,"titles":[],"image_url":"https://media.cricheroes.in/user_profile/default_user_profile_m.png?v=24544263","is_manual_override":true,"batting":{"average":10.67,"strike_rate":135.59,"high_score":26,"total_runs":160,"innings":15,"fours":15,"sixes":9,"fifties":0,"hundreds":0},"bowling":{"wickets":1,"economy":8,"overs":4,"average":32,"five_w":0,"best_bowling":"1/9"},"general":{"dob":"2009-07-20","batting_style":"RHB","bowling_style":"Right-arm fast"}},

  {"external_id":"43609842","name":"Sakshm","role":"All-Rounder","matches":8,"runs":72,"wickets":5,"catches":0,"run_outs":0,"man_of_the_match":0,"tournaments":0,"titles":[],"image_url":"https://media.cricheroes.in/default/user_profile.png","is_manual_override":false,"batting":{"average":18,"strike_rate":130.91,"high_score":44,"total_runs":72,"innings":6,"fours":11,"sixes":1,"fifties":0,"hundreds":0},"bowling":{"average":0,"five_w":0,"wickets":5,"economy":6.64,"overs":11,"best_bowling":"N/A"},"general":{"dob":"","batting_style":"RHB","bowling_style":"Right-arm medium"}},

  {"external_id":"45646975","name":"Akshit Bisht","role":"Wicket-keeper batter","matches":6,"runs":32,"wickets":2,"catches":0,"run_outs":0,"man_of_the_match":0,"tournaments":0,"titles":[],"image_url":"https://media.cricheroes.in/user_profile/1767432597712_5UvObvvzmGrl.jpg","is_manual_override":true,"batting":{"average":10.67,"strike_rate":96.97,"high_score":18,"total_runs":32,"innings":6,"fours":1,"sixes":3,"fifties":0,"hundreds":0},"bowling":{"wickets":2,"economy":3.92,"overs":4.2,"average":0,"five_w":0,"best_bowling":"2/16"},"general":{"dob":"2009-05-14","batting_style":"RHB","bowling_style":"Right-arm medium"}},

  {"external_id":"43826244","name":"Rohan Rayal","role":"Opening batter","matches":4,"runs":19,"wickets":3,"catches":0,"run_outs":0,"man_of_the_match":0,"tournaments":0,"titles":[],"image_url":"https://media.cricheroes.in/user_profile/1775966544043_DtGi8jGfeHBl.jpg","is_manual_override":false,"batting":{"average":6.33,"strike_rate":118.75,"high_score":11,"total_runs":19,"innings":3,"fours":0,"sixes":2,"fifties":0,"hundreds":0},"bowling":{"wickets":3,"economy":6.33,"overs":6,"average":12.67,"five_w":0,"best_bowling":"2/24"},"general":{"dob":"2007-03-10","batting_style":"RHB","bowling_style":"Right-arm fast"}},

  {"external_id":"44936562","name":"Yug Rawat","role":"Top-order batter","matches":2,"runs":22,"wickets":0,"catches":0,"run_outs":0,"man_of_the_match":0,"tournaments":0,"titles":[],"image_url":"https://media.cricheroes.in/user_profile/1765904696916_sPMRWpEYbHyp.jpg","is_manual_override":false,"batting":{"average":11,"strike_rate":115.79,"high_score":22,"total_runs":22,"innings":2,"fours":2,"sixes":0,"fifties":0,"hundreds":0},"bowling":{"wickets":0,"economy":0,"overs":0,"average":0,"five_w":0,"best_bowling":"0/0"},"general":{"dob":"2010-08-15","batting_style":"RHB","bowling_style":"Right-arm Off Break"}}
];

// ── Run this in browser console ───────────────────────────────────────────────
fetch('https://daitya-legion.vercel.app/api/players/bulk-seed', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ secret: 'daitya_sync_2024', players: PLAYERS })
})
.then(r => r.json())
.then(data => {
  console.log('✅ Bulk seed result:', data);
  if (data.success) {
    console.log(`Updated ${data.updated} players:`);
    data.players.forEach(p => console.log(`  ✓ ${p.name} (${p.external_id})`));
  } else {
    console.error('❌ Error:', data.error);
  }
})
.catch(err => console.error('❌ Fetch error:', err));
