const SUPABASE_URL = "https://YOURPROJECT.supabase.co";
const SUPABASE_ANON_KEY = "YOUR_ANON_KEY";
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const form = document.getElementById('photoForm');
const photosDiv = document.getElementById('photos');

async function loadPhotos() {
  const { data } = await supabase.from('photos').select('*').order('votes', { ascending: false });
  photosDiv.innerHTML = '';
  data.forEach(photo => {
    const div = document.createElement('div');
    div.className = 'photo-card';
    div.innerHTML = `
      <img src="${photo.photo_url}" alt="${photo.pet_name}">
      <h3>${photo.pet_name}</h3>
      <p>Autor: ${photo.discord_nick}</p>
      <button class="vote-btn" onclick="vote(${photo.id}, this)">❤️ Głosuj (${photo.votes})</button>
    `;
    photosDiv.appendChild(div);
  });
}

async function vote(photoId, btn) {
  const voterIP = await fetch('https://api.ipify.org?format=json').then(r => r.json()).then(d => d.ip);
  const { error } = await supabase.from('votes').insert([{ photo_id: photoId, voter_ip: voterIP }]);
  if (error) {
    alert("Już głosowałeś na to zdjęcie!");
    return;
  }
  await supabase.rpc('increment_votes', { pid: photoId });
  loadPhotos();
}

form.addEventListener('submit', async e => {
  e.preventDefault();
  const petName = document.getElementById('petName').value;
  const discordNick = document.getElementById('discordNick').value;
  const photoUrl = document.getElementById('photoUrl').value;

  await supabase.from('photos').insert([{ pet_name: petName, discord_nick: discordNick, photo_url: photoUrl }]);
  form.reset();
  loadPhotos();
});

loadPhotos();
