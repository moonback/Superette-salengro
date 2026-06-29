export interface ProductLookupData {
  name: string;
  imageUrl?: string;
  brand?: string;
  category?: string;
  purchasePrice?: number;
  salesPrice?: number;
  lastMovement?: number;
  /** Numéro de lot */
  numeroLot?: string;
  /** DLC au format YYYY-MM-DD */
  dlc?: string;
}

export interface InventoryItem extends ProductLookupData {
  barcode: string;
  name: string;
  quantity: number;
  imageUrl?: string;
  brand?: string;
  category?: string;
  lastUpdated: number;
  purchasePrice?: number;
  salesPrice?: number;
  lastMovement?: number;
  embedding?: number[];
}

export interface CategoryItem {
  id?: string;
  name: string;
  icon?: string;
}

