// Data recovery and migration utilities

export interface LegacyBoardFormat {
  title?: string;
  columns: Array<{
    id: string | number;
    title: string;
    tasks?: Array<{
      id: string | number;
      content: string;
      status?: string;
      completed?: boolean;
    }>;
  }>;
  tasks?: Array<{
    id: string | number;
    content: string;
    columnId: string | number;
    status?: string;
    completed?: boolean;
  }>;
}

export interface ModernBoardFormat {
  title: string;
  columns: Array<{
    id: string | number;
    title: string;
    groups: Array<{
      id: string;
      title: string;
      tasks: Array<{
        id: string | number;
        content: string;
        status: string;
        completed?: boolean;
      }>;
    }>;
    tasks: Array<{
      id: string | number;
      content: string;
      status: string;
      completed?: boolean;
    }>;
  }>;
}

export function findAllBoardData(): { key: string; data: any; isValid: boolean }[] {
  const allData: { key: string; data: any; isValid: boolean }[] = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    
    // Look for any keys that might contain board data
    if (
      key.includes('kanban') || 
      key.includes('board') || 
      key.includes('task') ||
      key.includes('column')
    ) {
      try {
        const data = JSON.parse(localStorage.getItem(key) || '{}');
        const isValid = isValidBoardData(data);
        allData.push({ key, data, isValid });
      } catch (e) {
        // Also store non-JSON data in case it's useful
        const data = localStorage.getItem(key);
        allData.push({ key, data, isValid: false });
      }
    }
  }
  
  return allData;
}

function isValidBoardData(data: any): boolean {
  if (!data || typeof data !== 'object') return false;
  
  // Check for old flat format
  if (data.columns && Array.isArray(data.columns) && data.tasks && Array.isArray(data.tasks)) {
    return true;
  }
  
  // Check for new nested format
  if (data.columns && Array.isArray(data.columns)) {
    return data.columns.every((col: any) => 
      col.id !== undefined && 
      col.title !== undefined &&
      (col.tasks === undefined || Array.isArray(col.tasks)) &&
      (col.groups === undefined || Array.isArray(col.groups))
    );
  }
  
  return false;
}

export function migrateLegacyToModern(legacy: LegacyBoardFormat): ModernBoardFormat {
  const modern: ModernBoardFormat = {
    title: legacy.title || 'Recovered Board',
    columns: []
  };
  
  // Convert columns
  for (const col of legacy.columns) {
    const modernCol = {
      id: col.id,
      title: col.title,
      groups: [],
      tasks: []
    };
    
    // If column has tasks directly, add them
    if (col.tasks) {
      for (const task of col.tasks) {
        modernCol.tasks.push({
          id: task.id,
          content: task.content,
          status: task.status || (task.completed ? 'DONE' : 'TODO'),
          completed: task.completed || false
        });
      }
    }
    
    modern.columns.push(modernCol);
  }
  
  // If there are loose tasks, assign them to columns
  if (legacy.tasks) {
    for (const task of legacy.tasks) {
      const targetColumn = modern.columns.find(col => col.id === task.columnId);
      if (targetColumn) {
        targetColumn.tasks.push({
          id: task.id,
          content: task.content,
          status: task.status || (task.completed ? 'DONE' : 'TODO'),
          completed: task.completed || false
        });
      }
    }
  }
  
  return modern;
}

function isBoardBlank(board: ModernBoardFormat): boolean {
  if (!board.columns) return true;
  
  for (const column of board.columns) {
    // Check if column has any tasks
    if (column.tasks && column.tasks.length > 0) {
      return false;
    }
    
    // Check if column has any groups with tasks
    if (column.groups && column.groups.length > 0) {
      for (const group of column.groups) {
        if (group.tasks && group.tasks.length > 0) {
          return false;
        }
      }
    }
  }
  
  return true;
}

export function recoverAllBoardData(): ModernBoardFormat[] {
  const allData = findAllBoardData();
  const recoveredBoards: ModernBoardFormat[] = [];
  
  for (const { key, data, isValid } of allData) {
    if (!isValid) continue;
    
    try {
      let modernBoard: ModernBoardFormat;
      
      // Check if it's already in modern format
      if (data.columns && data.columns.length > 0 && data.columns[0].groups !== undefined) {
        modernBoard = data as ModernBoardFormat;
      } else {
        // Migrate from legacy format
        modernBoard = migrateLegacyToModern(data as LegacyBoardFormat);
      }
      
      // Skip blank boards
      if (isBoardBlank(modernBoard)) {
        console.log(`Skipping blank board from ${key}`);
        continue;
      }
      
      // Add recovery metadata
      modernBoard.title = modernBoard.title + ` (Recovered from ${key})`;
      
      recoveredBoards.push(modernBoard);
    } catch (e) {
      console.warn(`Failed to recover data from ${key}:`, e);
    }
  }
  
  return recoveredBoards;
}

export function exportBoardData(): string {
  const allData = findAllBoardData();
  const exportData = {
    timestamp: new Date().toISOString(),
    recoveredBoards: recoverAllBoardData(),
    rawData: allData
  };
  
  return JSON.stringify(exportData, null, 2);
}

export function importBoardData(jsonString: string): ModernBoardFormat[] {
  try {
    const data = JSON.parse(jsonString);
    
    if (data.recoveredBoards && Array.isArray(data.recoveredBoards)) {
      return data.recoveredBoards;
    }
    
    // Try to parse as single board
    if (isValidBoardData(data)) {
      return [migrateLegacyToModern(data)];
    }
    
    return [];
  } catch (e) {
    console.error('Failed to import board data:', e);
    return [];
  }
}