import { Board } from '../types';

const getRendererScript = (board: Board) => `
  const board = ${JSON.stringify(board)};
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
    colContainer.className = 'flex flex-col w-80 bg-gray-100 rounded-lg p-2';
    
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
  const boardContainer = document.createElement('div');
  boardContainer.className = 'p-4';
  
  const boardTitle = document.createElement('h1');
  boardTitle.className = 'text-3xl font-bold mb-4';
  boardTitle.textContent = board.title;
  
  const columnsWrapper = document.createElement('div');
  columnsWrapper.className = 'flex gap-4';
  
  board.columns.forEach(col => columnsWrapper.appendChild(renderColumn(col)));
  
  boardContainer.appendChild(boardTitle);
  boardContainer.appendChild(columnsWrapper);
  root.appendChild(boardContainer);
`;

export const generatePublicationHtml = (board: Board, css: string): string => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${board.title}</title>
      <style>${css}</style>
    </head>
    <body>
      <div id="root"></div>
      <script>
        ${getRendererScript(board)}
      </script>
    </body>
    </html>
  `;
};
