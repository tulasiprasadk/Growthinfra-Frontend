  const BACKEND = 'http://localhost:6001';

function setOutput(html){
  document.getElementById('output').innerHTML = html;
}

document.getElementById('refreshStatus').addEventListener('click', async ()=>{
  setOutput('Checking backend...');
  try{
    const res = await fetch(`${BACKEND}/status`);
    if(!res.ok) throw new Error(res.statusText||'Error');
    const body = await res.text();
    setOutput('<pre>'+escapeHtml(body)+'</pre>');
  }catch(e){ setOutput('<span style="color:red">'+e.message+'</span>'); }
});

document.getElementById('listAccounts').addEventListener('click', async ()=>{
  setOutput('Fetching accounts...');
  try{
    const res = await fetch(`${BACKEND}/api/social/pages`);
    const json = await res.json();
    if(!Array.isArray(json)){
      setOutput('<pre>'+escapeHtml(JSON.stringify(json,null,2))+'</pre>');
      return;
    }
    if(json.length===0){ setOutput('<em>No accounts connected</em>'); return; }
    setOutput('<ul>'+json.map(a=>`<li>${escapeHtml(a.provider||'')} — ${escapeHtml(a.id||a.name||'')}</li>`).join('')+'</ul>');
  }catch(e){ setOutput('<span style="color:red">'+e.message+'</span>'); }
});

async function publish(path){
  const msg = document.getElementById('message').value;
  document.getElementById('publishResult').innerText = 'Posting...';
  try{
    const res = await fetch(`${BACKEND}${path}`,{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({pageId:'test',message:msg})
    });
    const json = await res.json();
    document.getElementById('publishResult').innerHTML = '<pre>'+escapeHtml(JSON.stringify(json,null,2))+'</pre>';
  }catch(e){ document.getElementById('publishResult').innerHTML = '<span style="color:red">'+e.message+'</span>'; }
}

document.getElementById('postLinkedIn').addEventListener('click', ()=>publish('/api/social/publish/linkedin'));
document.getElementById('postTwitter').addEventListener('click', ()=>publish('/api/social/publish/twitter'));

function escapeHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
