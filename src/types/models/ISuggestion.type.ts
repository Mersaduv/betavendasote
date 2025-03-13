import { IProduct } from "./IProduct.type";

export interface ISuggestion {
  id: string;
  products: IProduct
  expireTime: number
  created: string
  updated: string
}