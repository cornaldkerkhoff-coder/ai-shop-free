import path from "path"; import fs from "fs";
export type Product={id:string;name:string;short_description:string;long_description:string;price_cents:number;currency:string;badges?:string[];keywords:string[];usp:string[];image:string;};
export function getAllProducts():Product[]{ const file=path.join(process.cwd(),"products.json"); return JSON.parse(fs.readFileSync(file,"utf8")); }
export function getProductById(id:string){ return getAllProducts().find(p=>p.id===id); }