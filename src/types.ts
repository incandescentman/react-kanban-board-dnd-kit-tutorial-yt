export type Id = string | number;

export type Task = {
  id: Id;
  content: string;
  status: "TODO" | "DONE" | "STARTED" | "NEXT" | "HABIT" | string;
};

export type Group = {
  id: string;
  title: string;
  tasks: Task[];
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
