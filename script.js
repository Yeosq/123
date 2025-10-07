const SUPABASE_URL = "https://YOURPROJECT.supabase.co";
const SUPABASE_KEY = "YOUR_ANON_KEY";
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const form = document.getElementById('photoForm');
const photosDiv = document.getElementById('photos');

// Submit new photo
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const file = document.getElementById('photoInput').files[0];
  const petName = document.getElementById('petName').value;
  const discordNick = document.getElementById('discordNick').value;

  const filePath = `${Date.now()}_${file.name}`;
  await supabase.storage.from('photos').upload(filePath, file);
  const { data } = supabase.storage.from('photos').getPublicUrl(filePath);
  const imageUrl = data.publicUrl;

  await supabase.from('photos').insert([{ pet_name: petName, discord_nick: discordNick, image_url: imageUrl }]);
  alert('Zdjęcie dodane!');
  loadPhotos();
});

// Load gallery
async function loadPhotos() {
  const { data } = await supabase.from('photos').select('*').order('votes', { ascending: false });
  photosDiv.innerHTML = '';
  data.forEach(photo => {
    const div = document.createElement('div');
    div.className = 'photo-card';
    div.innerHTML = `
      <img src="${photo.image_url}" alt="${photo.pet_name}">
      <h3>${photo.pet_name}</h3>
      <p>Autor: ${photo.discord_nick}</p>
      <button class="vote-btn" onclick="vote(${photo.id})">❤️ Głosuj (${photo.votes})</button>
    `;
    photosDiv.appendChild(div);
  });
}

// Vote system (IP-based)
async function vote(photoId) {
  const voterIP = await fetch('https://api.ipify.org?format=json').then(r => r.json()).then(d => d.ip);
  const { error } = await supabase.from('votes').insert([{ photo_id: photoId, voter_ip: voterIP }]);
  if (error) {
    alert('Już głosowałeś na to zdjęcie!');
    return;
  }
  await supabase.rpc('increment_votes', { pid: photoId });
  loadPhotos();
}

loadPhotos();