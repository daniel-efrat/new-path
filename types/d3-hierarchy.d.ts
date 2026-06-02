declare module "d3-hierarchy" {
  export interface HierarchyNode<Datum> {
    data: Datum;
    value?: number;
    children?: Array<HierarchyNode<Datum>>;
    sum(value: (datum: Datum) => number): this;
    sort(compare: (a: HierarchyNode<Datum>, b: HierarchyNode<Datum>) => number): this;
    leaves(): Array<HierarchyCircularNode<Datum>>;
  }

  export interface HierarchyCircularNode<Datum> extends HierarchyNode<Datum> {
    x: number;
    y: number;
    r: number;
  }

  export interface PackLayout<Datum> {
    (root: HierarchyNode<Datum>): HierarchyCircularNode<Datum>;
    size(size: [number, number]): this;
    padding(padding: number | ((node: HierarchyNode<Datum>) => number)): this;
  }

  export function hierarchy<Datum>(data: Datum): HierarchyNode<Datum>;
  export function pack<Datum>(): PackLayout<Datum>;
}
