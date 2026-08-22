(function(){
  firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();
  const boardDocRef = db.collection('kanban').doc('board-state');

  const COLUMNS_DEF = [
    { id: 'todo',  title: 'Por hacer', color: '#e74c3c' },
    { id: 'doing', title: 'En curso',  color: '#163E63' },
    { id: 'done',  title: 'Hecho',     color: '#2ecc71' },
  ];
  const STORAGE_KEY = 'kanban-board-state';
  const USER_KEY = 'kanban-username';

  let state = { todo: [], doing: [], done: [] };
  let draggedCardId = null;
  let draggedFromCol = null;
  let isEditingForm = false;
  let currentUser = null;

  const columnsEl = document.getElementById('columns');
  const boardMeta = document.getElementById('board-meta');
  const currentUserTag = document.getElementById('current-user-tag');
  const loginOverlay = document.getElementById('login-overlay');
  const loginInput = document.getElementById('login-input');

  function uid(){ return 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2,7); }

  function getSavedUsername(){
    return localStorage.getItem(USER_KEY);
  }

  function saveUsername(name){
    localStorage.setItem(USER_KEY, name);
  }

  function renderCurrentUserTag(){
    currentUserTag.innerHTML = `conectado como <b>${currentUser}</b> <button id="switch-user">cambiar</button>`;
    document.getElementById('switch-user').addEventListener('click', () => {
      currentUser = null;
      openLogin();
    });
  }

  function openLogin(){
    loginOverlay.style.display = 'flex';
    loginInput.value = '';
    loginInput.focus();
  }
  function closeLogin(){
    loginOverlay.style.display = 'none';
  }

  async function openBoard(){
    const saved = currentUser || getSavedUsername();
    if(!saved){
      openLogin();
      return;
    }
    currentUser = saved;
    renderCurrentUserTag();
    document.getElementById('landing').style.display = 'none';
    document.getElementById('board').style.display = 'block';
  }

  loginInput.addEventListener('keydown', e => {
    if(e.key === 'Enter') document.getElementById('login-submit').click();
  });
  document.getElementById('login-submit').addEventListener('click', async () => {
    const name = loginInput.value.trim();
    if(!name) return;
    currentUser = name;
    saveUsername(name);
    closeLogin();
    renderCurrentUserTag();
    document.getElementById('landing').style.display = 'none';
    document.getElementById('board').style.display = 'block';
  });

  function subscribeToBoard(){
    boardDocRef.onSnapshot(snap => {
      if(snap.exists){
        const data = snap.data();
        state = { todo: data.todo || [], doing: data.doing || [], done: data.done || [] };
      }
      if(!isEditingForm) render();
    }, err => {
      console.error('No se pudo escuchar el tablero (revisá el firebaseConfig y las reglas de Firestore)', err);
    });
  }

  async function saveState(){
    try{
      await boardDocRef.set(state);
    }catch(e){
      console.error('No se pudo guardar el tablero (revisá el firebaseConfig y las reglas de Firestore)', e);
    }
  }

  function totalCards(){
    return state.todo.length + state.doing.length + state.done.length;
  }

  function render(){
    columnsEl.innerHTML = '';
    boardMeta.textContent = totalCards() + (totalCards() === 1 ? ' tarjeta' : ' tarjetas');

    COLUMNS_DEF.forEach((col, colIndex) => {
      const colEl = document.createElement('div');
      colEl.className = 'column';
      colEl.dataset.colId = col.id;

      const head = document.createElement('div');
      head.className = 'col-head';
      head.innerHTML = `
        <div class="col-head-left">
          <span class="col-dot" style="background:${col.color}"></span>
          <span class="col-title">${col.title}</span>
        </div>
        <span class="col-count">${state[col.id].length}</span>
      `;
      colEl.appendChild(head);

      const addBtn = document.createElement('button');
      addBtn.className = 'add-btn';
      addBtn.textContent = '+ nueva tarjeta';
      addBtn.addEventListener('click', () => showAddForm(colEl, col.id));
      colEl.appendChild(addBtn);

      const list = document.createElement('div');
      list.className = 'card-list';
      list.dataset.colId = col.id;

      if(state[col.id].length === 0){
        const empty = document.createElement('div');
        empty.className = 'empty-state';
        empty.textContent = 'Sin tarjetas todavia.';
        list.appendChild(empty);
      } else {
        state[col.id].forEach(card => {
          list.appendChild(renderCard(card, col.id, colIndex));
        });
      }

      list.addEventListener('dragover', e => {
        e.preventDefault();
        list.classList.add('drop-zone-active');
      });
      list.addEventListener('dragleave', () => list.classList.remove('drop-zone-active'));
      list.addEventListener('drop', e => {
        e.preventDefault();
        list.classList.remove('drop-zone-active');
        if(draggedCardId && draggedFromCol){
          moveCard(draggedCardId, draggedFromCol, col.id);
        }
      });

      colEl.appendChild(list);
      columnsEl.appendChild(colEl);
    });
  }

  function renderCard(card, colId, colIndex){
    const colDef = COLUMNS_DEF[colIndex];
    const el = document.createElement('div');
    el.className = 'card';
    el.style.setProperty('--accent', colDef.color);
    el.draggable = true;
    el.dataset.cardId = card.id;

    el.innerHTML = `
      <div class="card-text"></div>
      <div class="card-footer">
        <span class="card-author">${card.author ? '— ' + card.author : ''}</span>
        <div style="display:flex; align-items:center; gap:8px;">
          <div class="card-moves">
            <button class="move-btn move-left" ${colIndex === 0 ? 'disabled' : ''} title="Mover a la izquierda">←</button>
            <button class="move-btn move-right" ${colIndex === COLUMNS_DEF.length - 1 ? 'disabled' : ''} title="Mover a la derecha">→</button>
          </div>
          <button class="delete-btn" title="Eliminar">eliminar</button>
        </div>
      </div>
    `;
    el.querySelector('.card-text').textContent = card.text;
    el.style.setProperty('border-top', `4px solid ${colDef.color}`);
    el.style.setProperty('border-top-left-radius', '16px');
    el.style.setProperty('border-top-right-radius', '16px');

    el.addEventListener('dragstart', () => {
      draggedCardId = card.id;
      draggedFromCol = colId;
      el.classList.add('dragging');
    });
    el.addEventListener('dragend', () => {
      el.classList.remove('dragging');
      draggedCardId = null;
      draggedFromCol = null;
    });

    el.querySelector('.move-left').addEventListener('click', () => {
      if(colIndex > 0) moveCard(card.id, colId, COLUMNS_DEF[colIndex - 1].id);
    });
    el.querySelector('.move-right').addEventListener('click', () => {
      if(colIndex < COLUMNS_DEF.length - 1) moveCard(card.id, colId, COLUMNS_DEF[colIndex + 1].id);
    });
    el.querySelector('.delete-btn').addEventListener('click', () => {
      state[colId] = state[colId].filter(c => c.id !== card.id);
      render();
      saveState();
    });

    return el;
  }

  function moveCard(cardId, fromCol, toCol){
    if(fromCol === toCol) return;
    const idx = state[fromCol].findIndex(c => c.id === cardId);
    if(idx === -1) return;
    const [card] = state[fromCol].splice(idx, 1);
    state[toCol].push(card);
    render();
    saveState();
  }

  function showAddForm(colEl, colId){
    if(colEl.querySelector('.add-form')) return;
    const addBtn = colEl.querySelector('.add-btn');
    addBtn.style.display = 'none';

    const form = document.createElement('div');
    form.className = 'add-form';
    form.innerHTML = `
      <textarea placeholder="Escribi la tarjeta..."></textarea>
      <div class="add-form-actions">
        <button class="btn-save">Agregar</button>
        <button class="btn-cancel">Cancelar</button>
      </div>
    `;
    addBtn.after(form);
    const textarea = form.querySelector('textarea');
    textarea.focus();
    isEditingForm = true;

    function cancel(){
      form.remove();
      addBtn.style.display = 'block';
      isEditingForm = false;
    }

    function save(){
      const text = textarea.value.trim();
      if(text){
        isEditingForm = false;
        state[colId].push({ id: uid(), text, author: currentUser || '—' });
        render();
        saveState();
      } else {
        cancel();
      }
    }

    form.querySelector('.btn-save').addEventListener('click', save);
    form.querySelector('.btn-cancel').addEventListener('click', cancel);
    textarea.addEventListener('keydown', e => {
      if(e.key === 'Enter' && !e.shiftKey){
        e.preventDefault();
        save();
      } else if(e.key === 'Escape'){
        cancel();
      }
    });
  }

  document.getElementById('enter-board').addEventListener('click', openBoard);
  document.getElementById('back-to-landing').addEventListener('click', () => {
    document.getElementById('board').style.display = 'none';
    document.getElementById('landing').style.display = 'flex';
  });
  document.getElementById('refresh-board').addEventListener('click', async () => {
    const snap = await boardDocRef.get();
    if(snap.exists){
      const data = snap.data();
      state = { todo: data.todo || [], doing: data.doing || [], done: data.done || [] };
    }
    render();
  });

  // Escucha los cambios del equipo en tiempo real (Firestore avisa apenas
  // alguien agrega, mueve o borra una tarjeta, sin necesidad de polling).
  subscribeToBoard();
})();
