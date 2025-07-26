declare module "react-canvas-confetti" {
  import * as React from "react";
  interface FireworksProps {
    autorun?: { speed: number; duration?: number; delay?: number };
    style?: React.CSSProperties;
    className?: string;
    onInit?: (params: { conductor: any; confetti?: any }) => void;
  }
  const Fireworks: React.FC<FireworksProps>;
  export default Fireworks;
}
