export type Product = { id: string; name: string; brand: string; category: string; style: string; price: number; image: string };
const assetPath = (path: string) => `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}${path}`;
export const PRODUCTS: Product[] = [
  {
    "id": "p01",
    "name": "雾绿城市夹克",
    "brand": "FORM / 形",
    "category": "服饰",
    "style": "松弛日常",
    "price": 699,
    "image": assetPath("/products/p01.svg")
  },
  {
    "id": "p02",
    "name": "奶油学院卫衣",
    "brand": "OFFLINE",
    "category": "服饰",
    "style": "复古街头",
    "price": 459,
    "image": assetPath("/products/p02.svg")
  },
  {
    "id": "p03",
    "name": "午夜廓形衬衫",
    "brand": "NOT YET",
    "category": "服饰",
    "style": "未来机能",
    "price": 899,
    "image": assetPath("/products/p03.svg")
  },
  {
    "id": "p04",
    "name": "砂岩工装外套",
    "brand": "MONO LAB",
    "category": "服饰",
    "style": "松弛日常",
    "price": 529,
    "image": assetPath("/products/p04.svg")
  },
  {
    "id": "p05",
    "name": "莓果针织开衫",
    "brand": "FORM / 形",
    "category": "服饰",
    "style": "复古街头",
    "price": 399,
    "image": assetPath("/products/p05.svg")
  },
  {
    "id": "p06",
    "name": "冰蓝运动短袖",
    "brand": "OFFLINE",
    "category": "服饰",
    "style": "未来机能",
    "price": 299,
    "image": assetPath("/products/p06.svg")
  },
  {
    "id": "p07",
    "name": "云朵复古跑鞋",
    "brand": "NOT YET",
    "category": "球鞋",
    "style": "松弛日常",
    "price": 699,
    "image": assetPath("/products/p07.svg")
  },
  {
    "id": "p08",
    "name": "抹茶低帮板鞋",
    "brand": "MONO LAB",
    "category": "球鞋",
    "style": "复古街头",
    "price": 459,
    "image": assetPath("/products/p08.svg")
  },
  {
    "id": "p09",
    "name": "银翼机能跑鞋",
    "brand": "FORM / 形",
    "category": "球鞋",
    "style": "未来机能",
    "price": 899,
    "image": assetPath("/products/p09.svg")
  },
  {
    "id": "p10",
    "name": "落日拼色球鞋",
    "brand": "OFFLINE",
    "category": "球鞋",
    "style": "松弛日常",
    "price": 529,
    "image": assetPath("/products/p10.svg")
  },
  {
    "id": "p11",
    "name": "墨黑街头高帮",
    "brand": "NOT YET",
    "category": "球鞋",
    "style": "复古街头",
    "price": 399,
    "image": assetPath("/products/p11.svg")
  },
  {
    "id": "p12",
    "name": "奶油德训鞋",
    "brand": "MONO LAB",
    "category": "球鞋",
    "style": "未来机能",
    "price": 299,
    "image": assetPath("/products/p12.svg")
  },
  {
    "id": "p13",
    "name": "月牙腋下包",
    "brand": "FORM / 形",
    "category": "包袋",
    "style": "松弛日常",
    "price": 699,
    "image": assetPath("/products/p13.svg")
  },
  {
    "id": "p14",
    "name": "森林通勤托特",
    "brand": "OFFLINE",
    "category": "包袋",
    "style": "复古街头",
    "price": 459,
    "image": assetPath("/products/p14.svg")
  },
  {
    "id": "p15",
    "name": "银色未来挎包",
    "brand": "NOT YET",
    "category": "包袋",
    "style": "未来机能",
    "price": 899,
    "image": assetPath("/products/p15.svg")
  },
  {
    "id": "p16",
    "name": "焦糖邮差包",
    "brand": "MONO LAB",
    "category": "包袋",
    "style": "松弛日常",
    "price": 529,
    "image": assetPath("/products/p16.svg")
  },
  {
    "id": "p17",
    "name": "薄荷迷你背包",
    "brand": "FORM / 形",
    "category": "包袋",
    "style": "复古街头",
    "price": 399,
    "image": assetPath("/products/p17.svg")
  },
  {
    "id": "p18",
    "name": "午夜旅行包",
    "brand": "OFFLINE",
    "category": "包袋",
    "style": "未来机能",
    "price": 299,
    "image": assetPath("/products/p18.svg")
  },
  {
    "id": "p19",
    "name": "流线银色耳机",
    "brand": "NOT YET",
    "category": "饰品",
    "style": "松弛日常",
    "price": 699,
    "image": assetPath("/products/p19.svg")
  },
  {
    "id": "p20",
    "name": "琥珀太阳眼镜",
    "brand": "MONO LAB",
    "category": "饰品",
    "style": "复古街头",
    "price": 459,
    "image": assetPath("/products/p20.svg")
  },
  {
    "id": "p21",
    "name": "奶油棒球帽",
    "brand": "FORM / 形",
    "category": "饰品",
    "style": "未来机能",
    "price": 899,
    "image": assetPath("/products/p21.svg")
  },
  {
    "id": "p22",
    "name": "环形银色手链",
    "brand": "OFFLINE",
    "category": "饰品",
    "style": "松弛日常",
    "price": 529,
    "image": assetPath("/products/p22.svg")
  },
  {
    "id": "p23",
    "name": "苔绿渔夫帽",
    "brand": "NOT YET",
    "category": "饰品",
    "style": "复古街头",
    "price": 399,
    "image": assetPath("/products/p23.svg")
  },
  {
    "id": "p24",
    "name": "橘色城市腕表",
    "brand": "MONO LAB",
    "category": "饰品",
    "style": "未来机能",
    "price": 299,
    "image": assetPath("/products/p24.svg")
  }
];
export const STYLES = ["松弛日常", "复古街头", "未来机能"] as const;
export const product = (id: string) => PRODUCTS.find(p => p.id === id)!;
