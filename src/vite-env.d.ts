/// <reference types="vite/client" />
(window as any).global = window;
enum wordType {
  "n",
  "v",
}
interface wordInfo {
  word: string;
  type: wordType;
  id: string;
}
interface wordApply {
  id: string;
  type: wordType;
  vec: Matter.Vector;
}
