// /dre/main.js
(function () {
  const elList = document.getElementById('dre-list');
  const elMeta = document.getElementById('dre-meta');
  const elError = document.getElementById('dre-error');

  // URL RELATIVO é o mais importante para o site de testes funcionar
  const candidates = [
      'https://dvaadvogados.pt/dre-sumarios.json?' + Date.now(),  // ✅ com CORS
      'https://new-v3.dvaadvogados.pt/dre-sumarios.json?' + Date.now()
    ];

  async function fetchFirst(urls) {
    for (const url of urls) {
      try {
        const res = await fetch(url, { cache: 'no-store' });
        if (res.ok) return await res.json();
      } catch (_) {}
    }
    throw new Error('Falha no carregamento do JSON');
  }

  function escapeHTML(s) {
    return String(s || '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  }

  (async () => {
    try {
      const data = await fetchFirst(candidates);
      
      // Filtro para remover o cabeçalho "Diário da República n.º X"
      const items = (data.items || []).filter(i => 
        i.title && 
        !i.title.includes('Diário da República n.º') && 
        !i.title.includes('Série I de')
      );

      if (!items.length) throw new Error('Sem itens para mostrar');

      // Atualiza data no topo da página
      if (items[0].date && elMeta) {
        let ptDate = items[0].date;
        try {
            const [y, m, d] = items[0].date.split('-');
            if(y && m && d) ptDate = `${d}/${m}/${y}`;
        } catch(e){}
        
        // Se houver hora de atualização
        let updatedTime = '';
        if (data.generated_at) {
            const d = new Date(data.generated_at);
            updatedTime = ' • Atualizado: ' + d.toLocaleTimeString('pt-PT', {hour: '2-digit', minute:'2-digit'});
        }
        
        elMeta.innerHTML = `Dia: <strong>${ptDate}</strong>${updatedTime}`;
      }

      elList.innerHTML = '';

      items.forEach(it => {
        // Garante que usamos os campos novos
        let title = it.title || '';
        let summary = it.summary || 'Ver documento original no DRE.';
        let url = it.url || '#';

        // Fallback antigo caso o JSON esteja misturado
        if (!title && it.display) {
           title = it.display.split('\n')[0];
        }

        const card = document.createElement('article');
        card.className = 'dre-card fade-in';
        card.innerHTML = `
          <h3 class="dre-doc-title">
            <a href="${url}" target="_blank" rel="noopener" style="text-decoration:none; color:inherit; transition:opacity 0.2s;">
                ${escapeHTML(title)}
            </a>
          </h3>
          <p class="dre-summary">${escapeHTML(summary)}</p>
        `;
        elList.appendChild(card);
      });

    } catch (err) {
      console.error(err);
      if(elList) elList.innerHTML = '';
      if(elError) elError.style.display = 'block';
    }
  })();
})();