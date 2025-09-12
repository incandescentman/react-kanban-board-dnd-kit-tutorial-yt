import { Board } from '../types';

type PublishExtras = {
  notes?: string;
  intentions?: string[];
  priorities?: string[];
};

const getRendererScript = (board: Board, extras: PublishExtras) => `
  const board = ${JSON.stringify(board)};
  const extras = ${JSON.stringify({ notes: '', intentions: [], priorities: [], ...({} as any) , ...({}) })};
  Object.assign(extras, ${JSON.stringify({})});
  // Overwrite with passed extras (serialized separately below)
  Object.assign(extras, ${JSON.stringify({})});
  const injected = ${JSON.stringify({})};
  injected.notes = ${JSON.stringify('')};
  injected.intentions = ${JSON.stringify([])};
  injected.priorities = ${JSON.stringify([])};
  // Below placeholders will be replaced by generatePublicationHtml with real values
  const NOTES = __NOTES__;
  const INTENTIONS = __INTENTIONS__;
  const PRIORITIES = __PRIORITIES__;
  const TAG_REGEX = /#[A-Za-z0-9_-]+/g;
  
  function renderTag(tag) {
    const tagEl = document.createElement('span');
    tagEl.className = 'inline-block bg-gray-200 rounded-full px-2 py-1 text-xs font-semibold text-gray-700 mr-2';
    tagEl.textContent = tag;
    return tagEl;
  }

  function renderTask(task) {
    const card = document.createElement('div');
    card.className = 'bg-white p-2.5 rounded-lg shadow';
    
    const content = document.createElement('div');
    content.className = 'text-sm';
    content.textContent = task.content.replace(/#\w+/g, ''); // simple tag removal
    
    const tagsContainer = document.createElement('div');
    tagsContainer.className = 'flex flex-wrap gap-1 mt-2';
    
    const tags = task.content.match(/#\w+/g) || [];
    tags.forEach(tag => tagsContainer.appendChild(renderTag(tag)));
    
    card.appendChild(content);
    card.appendChild(tagsContainer);
    return card;
  }

  function renderGroup(group) {
    const groupContainer = document.createElement('div');
    groupContainer.className = 'mb-4';
    
    const groupTitle = document.createElement('h4');
    groupTitle.className = 'font-semibold text-sm text-gray-700 mb-2 px-2';
    groupTitle.textContent = group.title;
    
    const tasksContainer = document.createElement('div');
    tasksContainer.className = 'flex flex-col gap-2';
    
    if (group.tasks && group.tasks.length > 0) {
      group.tasks.forEach(task => tasksContainer.appendChild(renderTask(task)));
    }
    
    groupContainer.appendChild(groupTitle);
    groupContainer.appendChild(tasksContainer);
    return groupContainer;
  }

  function renderColumn(column) {
    const colContainer = document.createElement('div');
    colContainer.className = 'flex flex-col w-80 max-w-full bg-gray-100 rounded-lg p-2';
    
    const title = document.createElement('h3');
    title.className = 'font-bold text-lg p-2 rounded-md';
    if (column.color) {
      title.className += ' ' + column.color;
    }
    title.textContent = column.title;
    
    const tasksContainer = document.createElement('div');
    tasksContainer.className = 'flex flex-col gap-2 overflow-y-auto';
    
    // Render groups first
    if (column.groups && column.groups.length > 0) {
      column.groups.forEach(group => tasksContainer.appendChild(renderGroup(group)));
    }
    
    // Then render direct tasks
    if (column.tasks && column.tasks.length > 0) {
      const directTasksContainer = document.createElement('div');
      directTasksContainer.className = 'flex flex-col gap-2';
      column.tasks.forEach(task => directTasksContainer.appendChild(renderTask(task)));
      tasksContainer.appendChild(directTasksContainer);
    }
    
    colContainer.appendChild(title);
    colContainer.appendChild(tasksContainer);
    return colContainer;
  }

  const root = document.getElementById('root');
  const wrapper = document.createElement('div');
  wrapper.className = 'p-4';

  // Optional sections
  if (PRIORITIES && PRIORITIES.length) {
    const priWrap = document.createElement('section');
    priWrap.className = 'mb-4';
    priWrap.appendChild(sectionHeading('Top Priorities'));
    priWrap.appendChild(renderList(PRIORITIES));
    wrapper.appendChild(priWrap);
  }
  if (INTENTIONS && INTENTIONS.length) {
    const intWrap = document.createElement('section');
    intWrap.className = 'mb-4';
    intWrap.appendChild(sectionHeading('Current Intentions'));
    intWrap.appendChild(renderList(INTENTIONS));
    wrapper.appendChild(intWrap);
  }
  if (NOTES && NOTES.trim().length) {
    const notesWrap = document.createElement('section');
    notesWrap.className = 'mb-6';
    notesWrap.appendChild(sectionHeading('Notes'));
    const n = document.createElement('div');
    n.className = 'text-sm whitespace-pre-wrap bg-white/80 border border-gray-200 rounded-md p-3';
    n.textContent = NOTES;
    notesWrap.appendChild(n);
    wrapper.appendChild(notesWrap);
  }

  const boardTitle = document.createElement('h1');
  boardTitle.className = 'text-3xl font-bold mb-4';
  boardTitle.textContent = board.title;
  
  const columnsWrapper = document.createElement('div');
  columnsWrapper.className = 'flex flex-wrap gap-4';
  
  board.columns.forEach(col => columnsWrapper.appendChild(renderColumn(col)));
  
  function sectionHeading(text) {
    const h = document.createElement('h2');
    h.className = 'text-xl font-bold mb-2';
    h.textContent = text;
    return h;
  }

  function renderList(items) {
    const wrap = document.createElement('div');
    wrap.className = 'flex flex-col gap-2';
    items.forEach(it => {
      const pill = document.createElement('div');
      pill.className = 'bg-white/80 border border-gray-200 rounded-md p-2 text-sm';
      pill.textContent = it;
      wrap.appendChild(pill);
    });
    return wrap;
  }

  wrapper.appendChild(boardTitle);
  wrapper.appendChild(columnsWrapper);
  root.appendChild(wrapper);
`;

export const generatePublicationHtml = (board: Board, css: string, extras?: PublishExtras): string => {
  const baseCss = `body{font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,Apple Color Emoji,Segoe UI Emoji;background:#f8fafc;color:#0f172a} .rounded-lg{border-radius:.5rem} .rounded-md{border-radius:.375rem} .shadow{box-shadow:0 1px 2px rgba(0,0,0,.05)} .bg-gray-100{background:#f3f4f6} .text-gray-500{color:#6b7280} .text-sm{font-size:.875rem;line-height:1.25rem} .text-lg{font-size:1.125rem;line-height:1.75rem} .text-3xl{font-size:1.875rem;line-height:2.25rem} .font-bold{font-weight:700} .font-semibold{font-weight:600} .p-2{padding:.5rem} .p-2\.5{padding:.625rem} .p-4{padding:1rem} .mb-4{margin-bottom:1rem} .gap-2{gap:.5rem} .gap-4{gap:1rem} .flex{display:flex} .flex-col{flex-direction:column} .flex-wrap{flex-wrap:wrap}`;
  const finalCss = (css && css.trim().length > 0) ? css : baseCss;
  const notes = (extras && extras.notes) ? extras.notes : '';
  const intentions = (extras && extras.intentions) ? extras.intentions : [];
  const priorities = (extras && extras.priorities) ? extras.priorities : [];
  const script = getRendererScript(board, extras || {} )
    .replace('__NOTES__', JSON.stringify(notes))
    .replace('__INTENTIONS__', JSON.stringify(intentions))
    .replace('__PRIORITIES__', JSON.stringify(priorities));
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${board.title}</title>
      <style>${finalCss}</style>
    </head>
    <body>
      <div id="root"></div>
      <script>
        ${script}
      </script>
    </body>
    </html>
  `;
};

export const generateAllPublicationHtml = (boards: Board[], css: string, extras?: PublishExtras): string => {
  const baseCss = `body{font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,Apple Color Emoji,Segoe UI Emoji;background:#f8fafc;color:#0f172a} .rounded-lg{border-radius:.5rem} .rounded-md{border-radius:.375rem} .shadow{box-shadow:0 1px 2px rgba(0,0,0,.05)} .bg-gray-100{background:#f3f4f6} .text-gray-500{color:#6b7280} .text-sm{font-size:.875rem;line-height:1.25rem} .text-lg{font-size:1.125rem;line-height:1.75rem} .text-xl{font-size:1.25rem;line-height:1.75rem} .text-3xl{font-size:1.875rem;line-height:2.25rem} .font-bold{font-weight:700} .font-semibold{font-weight:600} .p-2{padding:.5rem} .p-2\\.5{padding:.625rem} .p-4{padding:1rem} .mb-4{margin-bottom:1rem} .mb-6{margin-bottom:1.5rem} .gap-2{gap:.5rem} .gap-4{gap:1rem} .flex{display:flex} .flex-col{flex-direction:column} .flex-wrap{flex-wrap:wrap} .border{border-width:1px} .border-gray-200{border-color:#e5e7eb} .bg-white\\/80{background:rgba(255,255,255,.8)}`;
  const finalCss = (css && css.trim().length > 0) ? css : baseCss;
  const notes = (extras && extras.notes) ? extras.notes : '';
  const intentions = (extras && extras.intentions) ? extras.intentions : [];
  const priorities = (extras && extras.priorities) ? extras.priorities : [];
  const safeSlug = (s: string) => (s || 'board').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'board';

  const script = `
  const boards = ${JSON.stringify(boards)};
  const TAG_REGEX = /#[A-Za-z0-9_-]+/g;
  function renderTag(tag){const t=document.createElement('span');t.className='inline-block bg-gray-200 rounded-full px-2 py-1 text-xs font-semibold text-gray-700 mr-2';t.textContent=tag;return t}
  function renderTask(task){const card=document.createElement('div');card.className='bg-white p-2.5 rounded-lg shadow';const content=document.createElement('div');content.className='text-sm';const plain=(task.content||'').replace(TAG_REGEX,'').trim();content.textContent=plain;if(task.completed){content.className+=' line-through text-gray-500'}const tagsContainer=document.createElement('div');tagsContainer.className='flex flex-wrap gap-1 mt-2';const tags=(task.content||'').match(TAG_REGEX)||[];tags.forEach(tag=>tagsContainer.appendChild(renderTag(tag)));card.appendChild(content);card.appendChild(tagsContainer);return card}
  function renderGroup(group){const g=document.createElement('div');g.className='mb-4';const title=document.createElement('h4');title.className='font-semibold text-sm text-gray-700 mb-2 px-2';title.textContent=group.title;const list=document.createElement('div');list.className='flex flex-col gap-2';(group.tasks||[]).forEach(task=>list.appendChild(renderTask(task)));g.appendChild(title);g.appendChild(list);return g}
  function renderColumn(column){const col=document.createElement('div');col.className='flex flex-col w-80 max-w-full bg-gray-100 rounded-lg p-2';const title=document.createElement('h3');title.className='font-bold text-lg p-2 rounded-md';title.textContent=column.title;if(column.color){title.className+=' '+column.color}const list=document.createElement('div');list.className='flex flex-col gap-2 overflow-y-auto';(column.groups||[]).forEach(group=>list.appendChild(renderGroup(group)));if(column.tasks&&column.tasks.length){const direct=document.createElement('div');direct.className='flex flex-col gap-2';column.tasks.forEach(task=>direct.appendChild(renderTask(task)));list.appendChild(direct)}col.appendChild(title);col.appendChild(list);return col}
  function sectionHeading(text){const h=document.createElement('h2');h.className='text-xl font-bold mb-2';h.textContent=text;return h}
  function renderList(items){const wrap=document.createElement('div');wrap.className='flex flex-col gap-2';items.forEach(it=>{const pill=document.createElement('div');pill.className='bg-white/80 border border-gray-200 rounded-md p-2 text-sm';pill.textContent=it;wrap.appendChild(pill)});return wrap}
  const root=document.getElementById('root');
  const wrapper=document.createElement('div');wrapper.className='p-4';
  if(${JSON.stringify(priorities)}.length){const sec=document.createElement('section');sec.className='mb-4';sec.appendChild(sectionHeading('Top Priorities'));sec.appendChild(renderList(${JSON.stringify(priorities)}));wrapper.appendChild(sec)}
  if(${JSON.stringify(intentions)}.length){const sec=document.createElement('section');sec.className='mb-4';sec.appendChild(sectionHeading('Current Intentions'));sec.appendChild(renderList(${JSON.stringify(intentions)}));wrapper.appendChild(sec)}
  if(${JSON.stringify(notes)}.trim().length){const sec=document.createElement('section');sec.className='mb-6';sec.appendChild(sectionHeading('Notes'));const n=document.createElement('div');n.className='text-sm whitespace-pre-wrap bg-white/80 border border-gray-200 rounded-md p-3';n.textContent=${JSON.stringify(notes)};sec.appendChild(n);wrapper.appendChild(sec)}
  // Index
  const indexSec=document.createElement('section');indexSec.className='mb-6';indexSec.appendChild(sectionHeading('Boards'));
  const list=document.createElement('div');list.className='flex flex-col gap-2';
  boards.forEach(b=>{const a=document.createElement('a');a.href='#'+(b.__slug||b.title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,''));a.textContent=b.title;a.className='text-sm text-blue-700 hover:underline';list.appendChild(a)});
  indexSec.appendChild(list);wrapper.appendChild(indexSec);
  // Boards
  boards.forEach(b=>{b.__slug=b.__slug||b.title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');const sec=document.createElement('section');sec.className='mb-8';sec.id=b.__slug;const h1=document.createElement('h1');h1.className='text-3xl font-bold mb-4';h1.textContent=b.title;const cols=document.createElement('div');cols.className='flex flex-wrap gap-4';(b.columns||[]).forEach(c=>cols.appendChild(renderColumn(c)));sec.appendChild(h1);sec.appendChild(cols);wrapper.appendChild(sec)});
  root.appendChild(wrapper);
  `;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>All Boards</title>
      <style>${finalCss}</style>
    </head>
    <body>
      <div id="root"></div>
      <script>
        ${script}
      </script>
    </body>
    </html>
  `;
};
