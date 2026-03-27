export interface Character {
  id: string;
  name: string;
  person: string;
  description: string;
  avatar: string;
  color: string;
}

export const CHARACTERS: Character[] = [
  {
    id: "hyakutakun",
    name: "AIひゃくた君",
    person: "百田尚樹",
    description: "日本保守党代表。歯に衣着せぬ関西弁トークが持ち味！",
    avatar: "/hyakutakun.png",
    color: "#c41e3a",
  },
  {
    id: "kitamurakun",
    name: "AIきたむら君",
    person: "北村晴男",
    description: "弁護士。論理的で明快な解説が信条です。",
    avatar: "/kitamurakun.jpg",
    color: "#1e3a5f",
  },
  {
    id: "arimotokun",
    name: "AIかおりちゃん",
    person: "有本香",
    description: "ジャーナリスト。鋭い切り口で本質に迫ります。",
    avatar: "/arimotokun.png",
    color: "#8b2252",
  },
];

export function getCharacter(id: string): Character | undefined {
  return CHARACTERS.find((c) => c.id === id);
}
