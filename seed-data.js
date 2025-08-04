const subjects = [
  { name: 'Math', color: '#FF6B6B' },
  { name: 'Science', color: '#4ECDC4' },
  { name: 'English', color: '#45B7D1' },
  { name: 'History', color: '#FFA07A' },
  { name: 'Computer Science', color: '#98D8C8' },
  { name: 'Physics', color: '#F7DC6F' },
  { name: 'Chemistry', color: '#BB8FCE' },
  { name: 'Biology', color: '#85C1E9' },
  { name: 'Programming', color: '#81C784' },
  { name: 'Web Development', color: '#64B5F6' }
];

const lastfmUsers = [
  { username: 'giordan', lastfm_username: 'ggiordann' },
  { username: 'kalan', lastfm_username: 'tweox' },
  { username: 'ghazi', lastfm_username: 'guss40' }
];

async function seedData() {
  console.log('🌱 Seeding essential data...');
  
  // Add subjects
  for (const subject of subjects) {
    try {
      const response = await fetch('http://localhost:3000/api/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subject)
      });
      
      if (response.ok) {
        console.log(`✅ Added subject: ${subject.name}`);
      } else {
        console.log(`⚠️  Skipped subject: ${subject.name} (might exist)`);
      }
    } catch (error) {
      console.log(`❌ Error adding subject ${subject.name}:`, error.message);
    }
  }
  
  // Add Last.fm users
  for (const user of lastfmUsers) {
    try {
      const response = await fetch('http://localhost:3000/api/lastfm-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });
      
      if (response.ok) {
        console.log(`✅ Added Last.fm mapping: ${user.username} → ${user.lastfm_username}`);
      } else {
        console.log(`⚠️  Skipped Last.fm mapping: ${user.username} (might exist)`);
      }
    } catch (error) {
      console.log(`❌ Error adding Last.fm user ${user.username}:`, error.message);
    }
  }
  
  console.log('🎉 Seeding completed!');
}

seedData();
