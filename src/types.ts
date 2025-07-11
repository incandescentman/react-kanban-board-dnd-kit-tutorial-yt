export type Id = string | number;

export type Task = {
  id: Id;
  content: string;
  status: "TODO" | "DONE" | "STARTED" | "NEXT" | "HABIT" | string;
  completed?: boolean;
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
};

export type Board = {
  title: string;
  columns: Column[];
};
