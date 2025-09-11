export type Id = string;

export type Task = {
  id: Id;
  content: string;
  status: "TODO" | "DONE" | "STARTED" | "NEXT" | "HABIT" | string;
  completed?: boolean;
  tags?: string[];
};

export type Group = {
  id: string;
  title: string;
  tasks: Task[];
  completed?: boolean;
};

export type Column = {
  id: Id;
  title: string;
  groups: Group[];
  tasks: Task[];
  color?: string;
};

export type Board = {
  title: string;
  columns: Column[];
  dataVersion?: number;
};
