type Language = {
  name: string;
  code: string;
};

type ValueOf<T> = T[keyof T];
